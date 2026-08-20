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
const SESSION_STARTED_AT_STORAGE_KEY = "synkup-session-started-at";
const SESSION_LAST_ACTIVE_AT_STORAGE_KEY = "synkup-session-last-active-at";
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

export interface TenantLoginContext {
  userId?: number;
  organizationId?: number;
  organizationName?: string;
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
let refreshAccessTokenRequest: Promise<string | null> | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function readPersistentSessionValue(key: string) {
  if (!isBrowser()) return null;

  const persistedValue = window.localStorage.getItem(key);
  if (persistedValue !== null) {
    return persistedValue;
  }

  // Migrate sessions created before authentication became persistent.
  const legacyValue = window.sessionStorage.getItem(key);
  if (legacyValue !== null) {
    window.localStorage.setItem(key, legacyValue);
    window.sessionStorage.removeItem(key);
  }

  return legacyValue;
}

function storePersistentSessionValue(key: string, value: string) {
  if (!isBrowser()) return;

  window.localStorage.setItem(key, value);
  window.sessionStorage.removeItem(key);
}

function removePersistentSessionValue(key: string) {
  if (!isBrowser()) return;

  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

function readSessionTimestamp(key: string) {
  const rawValue = readPersistentSessionValue(key);
  if (!rawValue) return null;

  const timestamp = Number(rawValue);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

function startPersistentSession() {
  const now = Date.now().toString();
  storePersistentSessionValue(SESSION_STARTED_AT_STORAGE_KEY, now);
  storePersistentSessionValue(SESSION_LAST_ACTIVE_AT_STORAGE_KEY, now);
}

function touchPersistentSession() {
  storePersistentSessionValue(
    SESSION_LAST_ACTIVE_AT_STORAGE_KEY,
    Date.now().toString(),
  );
}

function isPersistentSessionExpired() {
  const now = Date.now();
  const startedAt = readSessionTimestamp(SESSION_STARTED_AT_STORAGE_KEY);
  const lastActiveAt = readSessionTimestamp(
    SESSION_LAST_ACTIVE_AT_STORAGE_KEY,
  );

  // Give sessions created by an earlier release a bounded lifetime from the
  // first time they are read after this upgrade.
  if (!startedAt || !lastActiveAt) {
    startPersistentSession();
    return false;
  }

  return (
    now - lastActiveAt >= SESSION_IDLE_TIMEOUT_MS ||
    now - startedAt >= SESSION_ABSOLUTE_TIMEOUT_MS
  );
}

function cleanInternalRoute(route: string | null | undefined) {
  if (!route?.trim()) {
    return null;
  }

  const trimmed = route.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return null;
  }

  return trimmed;
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

  const raw = readPersistentSessionValue(AUTHENTICATED_ROUTE_STORAGE_KEY);
  if (!raw?.trim()) {
    return null;
  }

  return raw;
}

export function storeAuthenticatedRoute(route: string) {
  if (!isBrowser()) return;
  if (!route.trim()) return;

  storePersistentSessionValue(AUTHENTICATED_ROUTE_STORAGE_KEY, route);
}

export function clearStoredOnboardingTokens() {
  if (!isBrowser()) return;

  removePersistentSessionValue(ONBOARDING_ACCESS_TOKEN_STORAGE_KEY);
  removePersistentSessionValue(ONBOARDING_REFRESH_TOKEN_STORAGE_KEY);
  removePersistentSessionValue(AUTHENTICATED_ROUTE_STORAGE_KEY);
  removePersistentSessionValue(SESSION_STARTED_AT_STORAGE_KEY);
  removePersistentSessionValue(SESSION_LAST_ACTIVE_AT_STORAGE_KEY);
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

  const isStartingSession = Boolean(
    tokens.access?.trim() || tokens.refresh?.trim(),
  );

  if (tokens.access?.trim()) {
    storePersistentSessionValue(
      ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
      tokens.access,
    );
  } else {
    removePersistentSessionValue(ONBOARDING_ACCESS_TOKEN_STORAGE_KEY);
  }

  if (tokens.refresh?.trim()) {
    storePersistentSessionValue(
      ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
      tokens.refresh,
    );
  } else {
    removePersistentSessionValue(ONBOARDING_REFRESH_TOKEN_STORAGE_KEY);
  }

  if (isStartingSession) {
    startPersistentSession();
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

  const redirectTo = cleanInternalRoute(context?.redirectTo);
  const shouldIncludeRedirectTo =
    Boolean(redirectTo) &&
    (redirectTo !== "/onboarding" || context?.resumeTarget === "onboarding");

  if (shouldIncludeRedirectTo && redirectTo) {
    params.set("redirectTo", redirectTo);
  }

  const query = params.toString();
  return query ? `/signin?${query}` : "/signin";
}

async function refreshOnboardingAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  const refreshToken = readPersistentSessionValue(
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
      if (response.status === 401 || response.status === 403) {
        clearStoredOnboardingTokens();
      }
      return null;
    }

    storePersistentSessionValue(
      ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
      nextAccessToken,
    );

    if (typeof body.refresh === "string" && body.refresh.trim()) {
      storePersistentSessionValue(
        ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
        body.refresh,
      );
    }

    return nextAccessToken;
  } catch {
    return null;
  }
}

function requestAccessTokenRefresh() {
  if (!refreshAccessTokenRequest) {
    refreshAccessTokenRequest = refreshOnboardingAccessToken().finally(() => {
      refreshAccessTokenRequest = null;
    });
  }

  return refreshAccessTokenRequest;
}

export async function getValidOnboardingAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  if (isPersistentSessionExpired()) {
    clearStoredOnboardingTokens();
    return null;
  }

  const accessToken = readPersistentSessionValue(
    ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
  );

  if (!accessToken) {
    const refreshedAccessToken = await requestAccessTokenRefresh();
    if (refreshedAccessToken) {
      touchPersistentSession();
    }
    return refreshedAccessToken;
  }

  if (!isTokenExpired(accessToken)) {
    touchPersistentSession();
    return accessToken;
  }

  const refreshedAccessToken = await requestAccessTokenRefresh();
  if (refreshedAccessToken) {
    touchPersistentSession();
    return refreshedAccessToken;
  }

  // Keep the current page mounted during a temporary refresh outage. An
  // authentication rejection removes the refresh token and still signs out.
  if (readPersistentSessionValue(ONBOARDING_REFRESH_TOKEN_STORAGE_KEY)) {
    touchPersistentSession();
    return accessToken;
  }

  return null;
}

export async function logoutTenantSession() {
  if (!isBrowser()) {
    return;
  }

  const accessToken = readPersistentSessionValue(
    ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
  );
  const refreshToken = readPersistentSessionValue(
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

  const safeRedirectTo = cleanInternalRoute(redirectTo);

  if (safeRedirectTo) {
    storeTenantLoginContext({
      redirectTo: safeRedirectTo,
    });
  }

  window.location.replace(buildTenantSignInUrl());
}
