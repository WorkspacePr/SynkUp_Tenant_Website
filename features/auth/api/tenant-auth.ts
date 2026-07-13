import { apiEndpoints, buildApiUrl } from "@/lib/api/endpoints";

interface TenantLoginUser {
  user_id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface TenantLoginOrganization {
  organization_id?: number;
  name?: string;
  subdomain?: string;
  domain?: string;
  logo?: string;
  status?: string;
}

interface TenantLoginTokens {
  access?: string;
  refresh?: string;
}

interface TenantLoginMembership {
  membership_id?: number;
  membership_status?: string;
  membership_type?: string;
  is_primary_admin?: boolean;
  unit_id?: number;
}

interface TenantLoginAccess {
  roles?: string[];
  permissions?: string[];
  unit_scope?: number[];
  audience_scope?: number[];
  has_org_wide_role?: boolean;
}

interface TenantLoginOnboarding {
  status?: string;
  current_step?: string;
  currentStep?: string;
  launched?: boolean;
}

interface TenantAuthenticationMethods {
  email_password?: boolean;
  google_sso?: boolean;
  microsoft_sso?: boolean;
}

interface TenantLoginResponse {
  message?: string;
  requires_otp?: boolean;
  challenge_id?: string;
  requiresOtp?: boolean;
  challengeId?: string;
  next_step?: string;
  nextStep?: string;
  user?: TenantLoginUser;
  organization?: TenantLoginOrganization;
  membership?: TenantLoginMembership;
  access?: TenantLoginAccess;
  onboarding?: TenantLoginOnboarding;
  redirect_target?: string;
  tokens?: TenantLoginTokens;
  refresh?: string;
}

interface FindTenantOrganizationResponse {
  success?: boolean;
  organization?: TenantLoginOrganization;
  authentication?: TenantAuthenticationMethods;
  next_step?: string;
  message?: string;
  detail?: string;
}

function extractMessage(
  payload: Record<string, unknown>,
  fallback: string,
) {
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  const detail = payload.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  return fallback;
}

function extractTokens(payload: TenantLoginResponse) {
  const rawPayload = payload as Record<string, unknown>;
  const rawAccessValue = rawPayload["access"];
  const rawRefreshValue = rawPayload["refresh"];
  const rawAccess =
    typeof rawAccessValue === "string" ? rawAccessValue : null;
  const rawRefresh =
    typeof rawRefreshValue === "string" ? rawRefreshValue : null;

  return {
    access:
      typeof payload.tokens?.access === "string" && payload.tokens.access.trim()
        ? payload.tokens.access
        : rawAccess?.trim()
          ? rawAccess
          : null,
    refresh:
      typeof payload.tokens?.refresh === "string" && payload.tokens.refresh.trim()
        ? payload.tokens.refresh
        : rawRefresh?.trim()
          ? rawRefresh
          : null,
  };
}

function extractChallengeId(payload: TenantLoginResponse) {
  if (typeof payload.challenge_id === "string" && payload.challenge_id.trim()) {
    return payload.challenge_id;
  }

  if (typeof payload.challengeId === "string" && payload.challengeId.trim()) {
    return payload.challengeId;
  }

  return null;
}

function resolveRequiresOtp(payload: TenantLoginResponse) {
  if (typeof payload.requires_otp === "boolean") {
    return payload.requires_otp;
  }

  if (typeof payload.requiresOtp === "boolean") {
    return payload.requiresOtp;
  }

  const nextStep =
    typeof payload.next_step === "string"
      ? payload.next_step
      : typeof payload.nextStep === "string"
        ? payload.nextStep
        : "";

  if (nextStep.trim().toLowerCase().includes("otp")) {
    return true;
  }

  return extractChallengeId(payload) !== null;
}

function normalizeNumberArray(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );
}

function resolveDashboardRole(payload: TenantLoginResponse) {
  const membershipType = payload.membership?.membership_type?.trim().toLowerCase();
  const roles = Array.isArray(payload.access?.roles)
    ? payload.access.roles
        .filter((role): role is string => typeof role === "string")
        .map((role) => role.trim().toLowerCase())
    : [];

  if (
    payload.membership?.is_primary_admin ||
    payload.access?.has_org_wide_role ||
    membershipType?.includes("super") ||
    roles.some((role) => role.includes("super"))
  ) {
    return "super" as const;
  }

  if (
    membershipType?.includes("audience") ||
    roles.some((role) => role.includes("audience"))
  ) {
    return "audience" as const;
  }

  if (
    membershipType?.includes("unit") ||
    roles.some((role) => role.includes("unit"))
  ) {
    return "unit" as const;
  }

  const audienceScope = normalizeNumberArray(payload.access?.audience_scope);
  if (audienceScope.length > 0) {
    return "audience" as const;
  }

  const unitScope = normalizeNumberArray(payload.access?.unit_scope);
  if (unitScope.length > 0) {
    return "unit" as const;
  }

  return null;
}

function extractLoginRoutingContext(payload: TenantLoginResponse) {
  return {
    dashboardRole: resolveDashboardRole(payload),
    unitScope: normalizeNumberArray(payload.access?.unit_scope),
    audienceScope: normalizeNumberArray(payload.access?.audience_scope),
    onboardingStatus:
      typeof payload.onboarding?.status === "string"
        ? payload.onboarding.status
        : null,
    onboardingCurrentStep:
      typeof payload.onboarding?.current_step === "string"
        ? payload.onboarding.current_step
        : typeof payload.onboarding?.currentStep === "string"
          ? payload.onboarding.currentStep
          : null,
    onboardingLaunched:
      typeof payload.onboarding?.launched === "boolean"
        ? payload.onboarding.launched
        : null,
  };
}

export async function findTenantOrganization(subdomain: string) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.tenantFindOrganization), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subdomain,
      }),
    });

    const body = (await response.json()) as FindTenantOrganizationResponse &
      Record<string, unknown>;

    if (!response.ok || !body.organization) {
      return {
        success: false as const,
        message: extractMessage(body, "Unable to find that organisation."),
      };
    }

    return {
      success: true as const,
      organization: body.organization,
      authentication: {
        emailPassword: Boolean(body.authentication?.email_password),
        googleSso: Boolean(body.authentication?.google_sso),
        microsoftSso: Boolean(body.authentication?.microsoft_sso),
      },
      nextStep:
        typeof body.next_step === "string" ? body.next_step : null,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to find that organisation right now.",
    };
  }
}

export async function loginTenant(payload: {
  subdomain: string;
  email: string;
  password: string;
  remember: boolean;
}) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.tenantLogin), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organization_hint: {
          subdomain: payload.subdomain,
        },
        email: payload.email,
        password: payload.password,
        remember: payload.remember,
      }),
    });

    const body = (await response.json()) as TenantLoginResponse &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractMessage(body, "Unable to sign in right now."),
      };
    }

    return {
      success: true as const,
      message: body.message ?? "Sign-in challenge created.",
      requiresOtp: resolveRequiresOtp(body),
      challengeId: extractChallengeId(body),
      organizationId:
        typeof body.organization?.organization_id === "number"
          ? body.organization.organization_id
          : null,
      organizationName: body.organization?.name ?? "",
      organizationSubdomain: body.organization?.subdomain ?? payload.subdomain,
      email: body.user?.email ?? payload.email,
      ...extractLoginRoutingContext(body),
      redirectTarget:
        typeof body.redirect_target === "string" ? body.redirect_target : null,
      tokens: extractTokens(body),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to sign in right now.",
    };
  }
}

export async function verifyTenantLoginOtp(payload: {
  challengeId: string;
  code: string;
}) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.tenantLoginVerifyOtp), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        challenge_id: payload.challengeId,
        code: payload.code,
      }),
    });

    const body = (await response.json()) as TenantLoginResponse &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractMessage(body, "Invalid verification code."),
      };
    }

    return {
      success: true as const,
      message: body.message ?? "Verification successful.",
      organizationId:
        typeof body.organization?.organization_id === "number"
          ? body.organization.organization_id
          : null,
      ...extractLoginRoutingContext(body),
      redirectTarget:
        typeof body.redirect_target === "string" ? body.redirect_target : null,
      tokens: extractTokens(body),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to verify the code right now.",
    };
  }
}

export async function resendTenantLoginOtp(challengeId: string) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.tenantLoginResendOtp), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        challenge_id: challengeId,
      }),
    });

    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractMessage(body, "Unable to resend the verification code."),
      };
    }

    return {
      success: true as const,
      message: extractMessage(body, "Verification code sent."),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to resend the verification code.",
    };
  }
}

export async function requestTenantPasswordReset(payload: {
  subdomain: string;
  email: string;
}) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.tenantPasswordResetRequest),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_hint: {
            subdomain: payload.subdomain,
          },
          email: payload.email,
        }),
      },
    );

    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractMessage(
          body,
          "Unable to send a password reset link right now.",
        ),
      };
    }

    return {
      success: true as const,
      message: extractMessage(body, "Password reset link sent."),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to send a password reset link right now.",
    };
  }
}

export async function resendTenantPasswordReset(payload: {
  subdomain: string;
  email: string;
}) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.tenantPasswordResetResend),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_hint: {
            subdomain: payload.subdomain,
          },
          email: payload.email,
        }),
      },
    );

    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractMessage(
          body,
          "Unable to resend a password reset link right now.",
        ),
      };
    }

    return {
      success: true as const,
      message: extractMessage(body, "Password reset link resent."),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to resend a password reset link right now.",
    };
  }
}

export async function confirmTenantPasswordReset(payload: {
  subdomain: string;
  uid: string;
  token: string;
  newPassword: string;
}) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.tenantPasswordResetConfirm),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization_hint: {
            subdomain: payload.subdomain,
          },
          uid: payload.uid,
          token: payload.token,
          new_password: payload.newPassword,
        }),
      },
    );

    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractMessage(body, "Unable to reset your password."),
      };
    }

    return {
      success: true as const,
      message: extractMessage(body, "Password updated successfully."),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to reset your password.",
    };
  }
}
