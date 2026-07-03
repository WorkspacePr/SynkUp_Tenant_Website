export const ONBOARDING_STATE_STORAGE_KEY = "synkup-onboarding-state";
export const ONBOARDING_ACCESS_TOKEN_STORAGE_KEY =
  "synkup-onboarding-access-token";
export const ONBOARDING_REFRESH_TOKEN_STORAGE_KEY =
  "synkup-onboarding-refresh-token";
export const TENANT_LOGIN_CONTEXT_STORAGE_KEY =
  "synkup-tenant-login-context";

export interface TenantLoginContext {
  subdomain?: string;
  email?: string;
  redirectTo?: string;
  resumeTarget?: "onboarding";
}

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
  const onboardingSnapshot = readOnboardingSnapshot();

  const subdomain =
    context?.subdomain?.trim() ?? onboardingSnapshot?.values?.subdomain?.trim();
  const email =
    context?.email?.trim() ?? onboardingSnapshot?.values?.email?.trim();

  if (context?.resumeTarget === "onboarding") {
    params.set("resume", "onboarding");
  }

  if (context?.redirectTo?.trim()) {
    params.set("redirectTo", context.redirectTo);
  }

  if (subdomain) {
    params.set("subdomain", subdomain);
  }

  if (email) {
    params.set("email", email);
  }

  const query = params.toString();
  return query ? `/signin?${query}` : "/signin";
}
