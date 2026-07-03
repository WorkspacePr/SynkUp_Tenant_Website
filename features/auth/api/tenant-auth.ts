import { apiEndpoints, buildApiUrl } from "@/lib/api/endpoints";

interface TenantLoginUser {
  email?: string;
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

interface TenantAuthenticationMethods {
  email_password?: boolean;
  google_sso?: boolean;
  microsoft_sso?: boolean;
}

interface TenantLoginResponse {
  message?: string;
  requires_otp?: boolean;
  challenge_id?: string;
  user?: TenantLoginUser;
  organization?: TenantLoginOrganization;
  redirect_target?: string;
  tokens?: TenantLoginTokens;
  access?: string;
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
  return {
    access:
      typeof payload.tokens?.access === "string" && payload.tokens.access.trim()
        ? payload.tokens.access
        : typeof payload.access === "string" && payload.access.trim()
          ? payload.access
          : null,
    refresh:
      typeof payload.tokens?.refresh === "string" && payload.tokens.refresh.trim()
        ? payload.tokens.refresh
        : typeof payload.refresh === "string" && payload.refresh.trim()
          ? payload.refresh
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
      requiresOtp: Boolean(body.requires_otp),
      challengeId:
        typeof body.challenge_id === "string" ? body.challenge_id : null,
      organizationName: body.organization?.name ?? "",
      organizationSubdomain: body.organization?.subdomain ?? payload.subdomain,
      email: body.user?.email ?? payload.email,
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
