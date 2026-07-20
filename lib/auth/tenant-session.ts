import { apiEndpoints, buildApiUrl } from "@/lib/api/endpoints";

export const ONBOARDING_STATE_STORAGE_KEY = "synkup-onboarding-state";
export const ONBOARDING_ACCESS_TOKEN_STORAGE_KEY =
  "synkup-onboarding-access-token";
export const ONBOARDING_REFRESH_TOKEN_STORAGE_KEY =
  "synkup-onboarding-refresh-token";
export const TENANT_LOGIN_CONTEXT_STORAGE_KEY =
  "synkup-tenant-login-context";
export const AUTHENTICATED_ROUTE_STORAGE_KEY =
  "synkup-authenticated-route";

export interface TenantLoginContext {
  organizationId?: number;
  dashboardRole?: "super" | "unit" | "audience";
  unitScope?: number[];
  audienceScope?: number[];
  onboardingStatus?: string;
  onboardingLaunched?: boolean;
  onboardingCurrentStep?: string;
  subdomain?: string;
  email?: string;
  redirectTo?: string;
  resumeTarget?: "onboarding";
}

let hasRequestedSignInRedirect = false;

function isBrowser() {
  return typeof window !== "undefined";
}

export function readTenantLoginContext(): TenantLoginContext | null {
  if (!isBrowser()) return null;

  const raw = window.sessionStorage.getItem(TENANT_LOGIN_CONTEXT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TenantLoginContext;
  } catch {
    window.sessionStorage.removeItem(TENANT_LOGIN_CONTEXT_STORAGE_KEY);
    return null;
  }
}

export function storeTenantLoginContext(context: TenantLoginContext) {
  if (!isBrowser()) return;

  const current = readTenantLoginContext() ?? {};
  window.sessionStorage.setItem(
    TENANT_LOGIN_CONTEXT_STORAGE_KEY,
    JSON.stringify({ ...current, ...context }),
  );
}

export function clearTenantLoginContext() {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(TENANT_LOGIN_CONTEXT_STORAGE_KEY);
}

export function readAuthenticatedRoute() {
  if (!isBrowser()) return null;

  const raw = window.sessionStorage.getItem(AUTHENTICATED_ROUTE_STORAGE_KEY);
  if (!raw?.trim()) {
    return null;
  }

  return raw;
}

export function storeAuthenticatedRoute(route: string) {
  if (!isBrowser()) return;
  if (!route.trim()) return;

  window.sessionStorage.setItem(AUTHENTICATED_ROUTE_STORAGE_KEY, route);
}

export function clearStoredOnboardingTokens() {
  if (!isBrowser()) return;

  window.sessionStorage.removeItem(ONBOARDING_ACCESS_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(ONBOARDING_REFRESH_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTHENTICATED_ROUTE_STORAGE_KEY);
}

function preserveTenantIdentityHints() {
  const context = readTenantLoginContext();
  if (!context) {
    clearTenantLoginContext();
    return;
  }

  const nextContext: TenantLoginContext = {};
  if (context.subdomain?.trim()) {
    nextContext.subdomain = context.subdomain.trim().toLowerCase();
  }
  if (context.email?.trim()) {
    nextContext.email = context.email.trim().toLowerCase();
  }

  clearTenantLoginContext();

  if (nextContext.subdomain || nextContext.email) {
    storeTenantLoginContext(nextContext);
  }
}

export function storeOnboardingTokens(tokens: {
  access?: string | null;
  refresh?: string | null;
}) {
  if (!isBrowser()) return;

  if (tokens.access?.trim()) {
    window.sessionStorage.setItem(
      ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
      tokens.access,
    );
  } else {
    window.sessionStorage.removeItem(ONBOARDING_ACCESS_TOKEN_STORAGE_KEY);
  }

  if (tokens.refresh?.trim()) {
    window.sessionStorage.setItem(
      ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
      tokens.refresh,
    );
  } else {
    window.sessionStorage.removeItem(ONBOARDING_REFRESH_TOKEN_STORAGE_KEY);
  }
}

export function isTokenExpired(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return true;

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      exp?: number;
    };

    if (!decoded.exp) return true;
    return decoded.exp * 1000 <= Date.now() + 5000;
  } catch {
    return true;
  }
}

function readOnboardingSnapshot() {
  if (!isBrowser()) return null;

  const raw = window.sessionStorage.getItem(ONBOARDING_STATE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as {
      values?: {
        subdomain?: string;
        email?: string;
      };
    };
  } catch {
    return null;
  }
}

export function buildTenantSignInUrl() {
  if (!isBrowser()) {
    return "/signin";
  }

  const params = new URLSearchParams();
  const context = readTenantLoginContext();

  if (context?.resumeTarget === "onboarding") {
    params.set("resume", "onboarding");
  }

  const redirectTo = context?.redirectTo?.trim();
  const shouldIncludeRedirectTo =
    Boolean(redirectTo) &&
    (redirectTo !== "/onboarding" || context?.resumeTarget === "onboarding");

  if (shouldIncludeRedirectTo && redirectTo) {
    params.set("redirectTo", context.redirectTo);
  }

  const query = params.toString();
  return query ? `/signin?${query}` : "/signin";
}

async function refreshOnboardingAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  const refreshToken = window.sessionStorage.getItem(
    ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
  );

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(buildApiUrl(apiEndpoints.refreshToken), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const body = (await response.json()) as Record<string, unknown>;
    const nextAccessToken =
      typeof body.access === "string" && body.access.trim() ? body.access : null;

    if (!response.ok || !nextAccessToken) {
      clearStoredOnboardingTokens();
      return null;
    }

    window.sessionStorage.setItem(
      ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
      nextAccessToken,
    );

    if (typeof body.refresh === "string" && body.refresh.trim()) {
      window.sessionStorage.setItem(
        ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
        body.refresh,
      );
    }

    return nextAccessToken;
  } catch {
    clearStoredOnboardingTokens();
    return null;
  }
}

export async function getValidOnboardingAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  const accessToken = window.sessionStorage.getItem(
    ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
  );

  if (!accessToken) {
    return refreshOnboardingAccessToken();
  }

  if (!isTokenExpired(accessToken)) {
    return accessToken;
  }

  return refreshOnboardingAccessToken();
}

export async function logoutTenantSession() {
  if (!isBrowser()) {
    return;
  }

  const accessToken = window.sessionStorage.getItem(
    ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
  );
  const refreshToken = window.sessionStorage.getItem(
    ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
  );

  try {
    if (accessToken?.trim()) {
      await fetch(buildApiUrl(apiEndpoints.logout), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(
          refreshToken?.trim() ? { refresh: refreshToken } : {},
        ),
      });
    }
  } catch {
    // Clear local session state even if the network request fails.
  } finally {
    clearStoredOnboardingTokens();
    preserveTenantIdentityHints();
  }
}

export function redirectToTenantSignIn(redirectTo?: string) {
  if (!isBrowser()) return;
  if (hasRequestedSignInRedirect) return;

  hasRequestedSignInRedirect = true;

  if (redirectTo?.trim()) {
    storeTenantLoginContext({
      redirectTo,
    });
  }

  window.location.replace(buildTenantSignInUrl());
}
