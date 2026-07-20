import { delay } from "@/utils";
import type {
  OnboardingFormValues,
  OrganizationOnboardingAudience,
  OrganizationOnboardingAudienceMembersMutationResponse,
  OrganizationOnboardingAudienceMembersResponse,
  OrganizationOnboardingAudiencesResponse,
  OrganizationOnboardingAdminInvite,
  OrganizationOnboardingAdminInviteRole,
  OrganizationOnboardingAdminInvitesResponse,
  OrganizationOnboardingLaunchChecklist,
  OrganizationOnboardingLaunchResponse,
  OrganizationOnboardingProfile,
  OrganizationOnboardingReviewPayload,
  OrganizationOnboardingStatus,
  OrganizationOnboardingStepMutationResponse,
  OrganizationOnboardingUnit,
  OrganizationOnboardingUnitsResponse,
} from "@/types/onboarding";
import type { SelectOption } from "@/components/ui/Select";
import {
  buildTenantSignInUrl,
  ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
  ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
} from "@/lib/auth/tenant-session";
import { apiEndpoints, buildApiUrl } from "@/lib/api/endpoints";

interface ReferenceDataItem {
  code: string;
  label: string;
  description: string | null;
  metadata: unknown;
  sort_order: number;
}

interface ReferenceDataResponse {
  organization_type?: ReferenceDataItem[];
  industry_sector?: ReferenceDataItem[];
  attendance_identifier?: ReferenceDataItem[];
  unit_type?: ReferenceDataItem[];
  audience_type?: ReferenceDataItem[];
  country?: ReferenceDataItem[];
  timezone?: ReferenceDataItem[];
}

interface SubdomainAvailabilityResponse {
  subdomain: string;
  available: boolean;
  reason?: string;
  message: string;
  suggestions: string[];
}

interface SendVerificationResponse {
  message: string;
}

interface VerifyCodeResponse {
  message: string;
  verification_token: string;
  expires_in_seconds: number;
}

interface CreateOrganizationPayload {
  name: string;
  official_email: string;
  organization_type: string;
  industry_sector: string;
  country?: string;
  city?: string;
  subdomain: string;
  // plan?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  verification_token: string;
}

interface UpdateOrganizationProfilePayload {
  name?: string;
  organization_type?: string;
  industry_sector?: string | null;
  official_email?: string | null;
  country?: string | null;
  city?: string | null;
  subdomain?: string;
  timezone?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface UpsertOrganizationUnitPayload {
  name?: string;
  type?: string | null;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
}

interface CreateOrganizationAdminInvitePayload {
  invited_email: string;
  invited_role_id: number;
  invited_unit_id?: number | null;
  invited_audience_id?: number | null;
  message?: string | null;
  expires_in_days?: number;
}

interface UpsertOrganizationAudiencePayload {
  name?: string;
  audience_type?: string;
  unit_id?: number;
  description?: string | null;
  expected_member_count?: number | null;
  assigned_admin_ids?: number[];
  metadata?: unknown;
}

interface AddOrganizationAudienceMembersPayload {
  members: Array<{
    first_name?: string;
    last_name?: string;
    email: string;
    identifier?: string;
    identifier_type?: string;
  }>;
}

interface LaunchOrganizationOnboardingPayload {
  metadata?: unknown;
  reason: string;
}

interface CompleteOrganizationOnboardingStepPayload {
  metadata?: unknown;
  reason?: string;
}

let hasRequestedSignInRedirect = false;

const fallbackReferenceData = {
  organizationTypeOptions: [
    { value: "enterprise", label: "Enterprise" },
    { value: "education", label: "Education" },
    { value: "ngo", label: "NGO" },
    { value: "corporate", label: "Corporate" },
  ] satisfies SelectOption[],
  industrySectorOptions: [
    { value: "enterprise-saas", label: "Enterprise SaaS" },
    { value: "education", label: "Education" },
    { value: "non-profit", label: "Non-profit" },
    { value: "corporate-services", label: "Corporate Services" },
  ] satisfies SelectOption[],
  attendanceIdentifierOptions: [
    { value: "employee-id", label: "Employee ID" },
    { value: "student-id", label: "Student ID" },
    { value: "email", label: "Email Address" },
    { value: "phone", label: "Phone Number" },
  ] satisfies SelectOption[],
  unitTypeOptions: [
    { value: "department", label: "Department" },
    { value: "branch", label: "Branch" },
    { value: "team", label: "Team" },
    { value: "class", label: "Class" },
  ] satisfies SelectOption[],
  countryOptions: [
    { value: "NG", label: "Nigeria" },
    { value: "GH", label: "Ghana" },
    { value: "KE", label: "Kenya" },
    { value: "ZA", label: "South Africa" },
  ] satisfies SelectOption[],
  audienceTypeOptions: [
    { value: "class", label: "Class" },
    { value: "department", label: "Department" },
    { value: "service", label: "Service" },
    { value: "team", label: "Team" },
  ] satisfies SelectOption[],
};

function getDjangoApiBase() {
  return process.env.NEXT_PUBLIC_DJANGO_API_BASE ?? process.env.DJANGO_API_BASE;
}

function normalizeBackendMediaUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const apiBase = getDjangoApiBase();

  if (!apiBase) {
    return url;
  }

  try {
    return new URL(url, apiBase).toString();
  } catch {
    return url;
  }
}

function normalizeOrganizationProfile(
  profile: OrganizationOnboardingProfile,
): OrganizationOnboardingProfile {
  return {
    ...profile,
    logo: normalizeBackendMediaUrl(profile.logo),
  };
}

function extractOrganizationId(payload: Record<string, unknown>) {
  const organizationRecord =
    payload.organization && typeof payload.organization === "object"
      ? (payload.organization as Record<string, unknown>)
      : undefined;
  const candidates = [
    payload.organization_id,
    payload.organizationId,
    payload.organization,
    payload.id,
    organizationRecord?.organization_id,
    organizationRecord?.organizationId,
    organizationRecord?.id,
    (payload.data as Record<string, unknown> | undefined)?.organization_id,
    (payload.data as Record<string, unknown> | undefined)?.organizationId,
    (payload.data as Record<string, unknown> | undefined)?.organization,
    (payload.data as Record<string, unknown> | undefined)?.id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return null;
}

function extractAccessToken(payload: Record<string, unknown>) {
  const tokensRecord =
    payload.tokens && typeof payload.tokens === "object"
      ? (payload.tokens as Record<string, unknown>)
      : undefined;

  const candidates = [
    tokensRecord?.access,
    payload.access,
    (payload.data as Record<string, unknown> | undefined)?.access,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

function extractRefreshToken(payload: Record<string, unknown>) {
  const tokensRecord =
    payload.tokens && typeof payload.tokens === "object"
      ? (payload.tokens as Record<string, unknown>)
      : undefined;

  const candidates = [
    tokensRecord?.refresh,
    payload.refresh,
    (payload.data as Record<string, unknown> | undefined)?.refresh,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

function extractApiErrorMessage(
  payload: unknown,
  fallbackMessage: string,
) {
  if (!payload || typeof payload !== "object") {
    return fallbackMessage;
  }

  const maybeRecord = payload as Record<string, unknown>;

  if (typeof maybeRecord.message === "string" && maybeRecord.message.trim()) {
    const detailsMessage = extractApiErrorDetailsMessage(maybeRecord.details);
    const message = detailsMessage ?? maybeRecord.message;
    handleAuthenticationFailureMessage(message);
    return message;
  }

  if (typeof maybeRecord.detail === "string" && maybeRecord.detail.trim()) {
    handleAuthenticationFailureMessage(maybeRecord.detail);
    return maybeRecord.detail;
  }

  const detailsMessage = extractApiErrorDetailsMessage(maybeRecord.details);
  if (detailsMessage) {
    handleAuthenticationFailureMessage(detailsMessage);
    return detailsMessage;
  }

  const fieldMessages = Object.entries(maybeRecord)
    .flatMap(([field, value]) => {
      if (field === "message" || field === "code" || field === "details") {
        return [];
      }

      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .map((item) => item);
      }

      if (typeof value === "string" && value.trim()) {
        return [value];
      }

      return [];
    });

  const message = fieldMessages[0] ?? fallbackMessage;
  handleAuthenticationFailureMessage(message);
  return message;
}

function isAuthenticationFailureMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("authentication credentials were not provided") ||
    normalized.includes("given token not valid") ||
    normalized.includes("token not valid") ||
    normalized.includes("token is invalid") ||
    normalized.includes("token is expired") ||
    normalized.includes("invalid token") ||
    normalized.includes("credentials were not provided")
  );
}

function handleAuthenticationFailureMessage(message: string) {
  if (!isAuthenticationFailureMessage(message)) {
    return;
  }

  clearStoredOnboardingTokens();
  redirectToSignIn();
}

function extractApiErrorDetailsMessage(details: unknown) {
  if (!details || typeof details !== "object") {
    return null;
  }

  const detailRecord = details as Record<string, unknown>;
  const fieldMessages = Object.entries(detailRecord)
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .map((item) => item);
      }

      if (typeof value === "string" && value.trim()) {
        return [value];
      }

      return [];
    });

  return fieldMessages[0] ?? null;
}

function buildSubdomainAvailabilityUrl(subdomain: string) {
  const pathOrUrl = buildApiUrl(apiEndpoints.subdomainAvailability);
  const url = /^https?:\/\//i.test(pathOrUrl)
    ? new URL(pathOrUrl)
    : new URL(pathOrUrl, window.location.origin);
  url.searchParams.set("subdomain", subdomain.trim().toLowerCase());
  return url.toString();
}

function isTokenExpired(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    if (!decoded.exp) return true;
    return decoded.exp * 1000 <= Date.now() + 5000;
  } catch {
    return true;
  }
}

function clearStoredOnboardingTokens() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ONBOARDING_ACCESS_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(ONBOARDING_REFRESH_TOKEN_STORAGE_KEY);
}

function redirectToSignIn() {
  if (typeof window === "undefined") return;
  if (hasRequestedSignInRedirect) return;
  hasRequestedSignInRedirect = true;
  window.location.href = buildTenantSignInUrl();
}

async function refreshOnboardingAccessToken() {
  if (typeof window === "undefined") {
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
      redirectToSignIn();
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
    redirectToSignIn();
    return null;
  }
}

async function getValidOnboardingAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const accessToken = window.sessionStorage.getItem(
    ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
  );

  if (!accessToken) {
    return null;
  }

  if (!isTokenExpired(accessToken)) {
    return accessToken;
  }

  return refreshOnboardingAccessToken();
}

async function getOnboardingAuthHeaders(
  includeJsonBody = false,
  requireAuth = false,
) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (includeJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = requireAuth
    ? await getValidOnboardingAccessToken()
    : typeof window !== "undefined"
      ? window.sessionStorage.getItem(ONBOARDING_ACCESS_TOKEN_STORAGE_KEY)
      : null;

  if (accessToken) {
    if (requireAuth || !isTokenExpired(accessToken)) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  } else if (requireAuth) {
    clearStoredOnboardingTokens();
    redirectToSignIn();
  }

  return headers;
}

function mapReferenceItemsToOptions(items: ReferenceDataItem[] = []): SelectOption[] {
  return [...items]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({
      value: item.code,
      label: item.label,
    }));
}

export async function getSubdomainAvailability(
  subdomain: string,
): Promise<SubdomainAvailabilityResponse> {
  try {
    const response = await fetch(buildSubdomainAvailabilityUrl(subdomain), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as Partial<SubdomainAvailabilityResponse>;

    return {
      subdomain: payload.subdomain ?? subdomain,
      available: payload.available ?? false,
      reason: payload.reason,
      message: payload.message ?? "Unable to verify subdomain availability right now.",
      suggestions: Array.isArray(payload.suggestions) ? payload.suggestions : [],
    };
  } catch {
    return {
      subdomain,
      available: false,
      reason: "request_failed",
      message: "Unable to verify subdomain availability right now.",
      suggestions: [],
    };
  }
}

export async function getReferenceData() {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.referenceData), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackReferenceData;
    }

    const payload = (await response.json()) as ReferenceDataResponse;

    const organizationTypeOptions = mapReferenceItemsToOptions(payload.organization_type);
    const industrySectorOptions = mapReferenceItemsToOptions(payload.industry_sector);
    const attendanceIdentifierOptions = mapReferenceItemsToOptions(payload.attendance_identifier);
    const unitTypeOptions = mapReferenceItemsToOptions(payload.unit_type);
    const countryOptions = mapReferenceItemsToOptions(payload.country);
    const audienceTypeOptions = mapReferenceItemsToOptions(payload.audience_type);

    return {
      organizationTypeOptions:
        organizationTypeOptions.length > 0
          ? organizationTypeOptions
          : fallbackReferenceData.organizationTypeOptions,
      industrySectorOptions:
        industrySectorOptions.length > 0
          ? industrySectorOptions
          : fallbackReferenceData.industrySectorOptions,
      attendanceIdentifierOptions:
        attendanceIdentifierOptions.length > 0
          ? attendanceIdentifierOptions
          : fallbackReferenceData.attendanceIdentifierOptions,
      unitTypeOptions:
        unitTypeOptions.length > 0
          ? unitTypeOptions
          : fallbackReferenceData.unitTypeOptions,
      countryOptions:
        countryOptions.length > 0
          ? countryOptions
          : fallbackReferenceData.countryOptions,
      audienceTypeOptions:
        audienceTypeOptions.length > 0
          ? audienceTypeOptions
          : fallbackReferenceData.audienceTypeOptions,
    };
  } catch {
    return fallbackReferenceData;
  }
}

export async function validateOrganisationIdentity(subdomain: string) {
  const result = await getSubdomainAvailability(subdomain);

  if (!result.available) {
    const suggestionText =
      result.suggestions.length > 0
        ? ` Suggestions: ${result.suggestions.join(", ")}.`
        : "";

    return {
      success: false as const,
      field: "subdomain" as const,
      message: `${result.message}${suggestionText}`,
    };
  }

  return { success: true as const };
}

export async function sendRegistrationVerificationCode(payload: {
  email: string;
  organizationName: string;
  subdomain: string;
}) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.sendRegistrationVerification), {
      method: "POST",
      headers: await getOnboardingAuthHeaders(true),
      body: JSON.stringify({
        email: payload.email,
        organization_name: payload.organizationName,
        subdomain: payload.subdomain,
      }),
    });

    const body = (await response.json()) as Partial<SendVerificationResponse>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to send verification code right now."),
      };
    }

    return {
      success: true as const,
      message: body.message ?? "Verification code sent successfully.",
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to send verification code right now.",
    };
  }
}

export async function resendRegistrationVerificationCode(payload: {
  email: string;
  organizationName: string;
  subdomain: string;
}) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.resendRegistrationVerification), {
      method: "POST",
      headers: await getOnboardingAuthHeaders(true),
      body: JSON.stringify({
        email: payload.email,
        organization_name: payload.organizationName,
        subdomain: payload.subdomain,
      }),
    });

    const body = (await response.json()) as Partial<SendVerificationResponse>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to resend verification code right now."),
      };
    }

    return {
      success: true as const,
      message: body.message ?? "Verification code resent successfully.",
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to resend verification code right now.",
    };
  }
}

export async function verifyAdminCode(email: string, code: string) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.verifyRegistrationCode), {
      method: "POST",
      headers: await getOnboardingAuthHeaders(true),
      body: JSON.stringify({
        email,
        code,
      }),
    });

    const body = (await response.json()) as Partial<VerifyCodeResponse>;

    if (!response.ok || !body.verification_token) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Verification code invalid. Check the code and try again."),
      };
    }

    return {
      success: true as const,
      message: body.message ?? "Verification successful.",
      verificationToken: body.verification_token,
      expiresInSeconds: body.expires_in_seconds ?? 0,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to verify code right now.",
    };
  }
}

export async function initializeBilling(planId: string) {
  await delay(900);
  return { success: true as const, message: `Billing initialized for ${planId} plan.` };
}

export async function createOrganisation(payload: CreateOrganizationPayload) {
  try {
    const response = await fetch(buildApiUrl(apiEndpoints.createRegistrationOrganization), {
      method: "POST",
      headers: await getOnboardingAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to create organisation right now."),
      };
    }

    return {
      success: true as const,
      data: body,
      organizationId: extractOrganizationId(body),
      accessToken: extractAccessToken(body),
      refreshToken: extractRefreshToken(body),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to create organisation right now.",
    };
  }
}

export async function getOrganizationOnboardingStatus(organizationId: number) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingStatus(organizationId)),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingStatus> & Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to load onboarding status right now."),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingStatus,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load onboarding status right now.",
    };
  }
}

export async function getOrganizationOnboardingProfile(organizationId: number) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingProfile(organizationId)),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingProfile> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to load organisation profile right now."),
      };
    }

    return {
      success: true as const,
      data: normalizeOrganizationProfile(body as OrganizationOnboardingProfile),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load organisation profile right now.",
    };
  }
}

export async function updateOrganizationOnboardingProfile(
  organizationId: number,
  payload: UpdateOrganizationProfilePayload | FormData,
) {
  try {
    const isMultipartPayload = payload instanceof FormData;
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingProfile(organizationId)),
      {
        method: "PATCH",
        headers: await getOnboardingAuthHeaders(!isMultipartPayload, true),
        body: isMultipartPayload ? payload : JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingProfile> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to update organisation profile right now."),
      };
    }

    return {
      success: true as const,
      data: normalizeOrganizationProfile(body as OrganizationOnboardingProfile),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to update organisation profile right now.",
    };
  }
}

export async function createOrganizationOnboardingUnit(
  organizationId: number,
  payload: UpsertOrganizationUnitPayload,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingUnits(organizationId)),
      {
        method: "POST",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingUnit> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to create unit right now."),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingUnit,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to create unit right now.",
    };
  }
}

export async function getOrganizationOnboardingUnits(organizationId: number) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingUnits(organizationId)),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingUnitsResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to load units right now."),
      };
    }

    return {
      success: true as const,
      data: {
        count: body.count ?? 0,
        unit_setup_completed: body.unit_setup_completed ?? false,
        results: Array.isArray(body.results) ? body.results : [],
      } satisfies OrganizationOnboardingUnitsResponse,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load units right now.",
    };
  }
}

export async function updateOrganizationOnboardingUnit(
  organizationId: number,
  unitId: number,
  payload: UpsertOrganizationUnitPayload,
) {
  try {
    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingUnitDetail(organizationId, unitId),
      ),
      {
        method: "PATCH",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingUnit> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to update unit right now."),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingUnit,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to update unit right now.",
    };
  }
}

export async function getOrganizationOnboardingAudiences(
  organizationId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingAudiences(organizationId)),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAudiencesResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to load audiences right now."),
      };
    }

    return {
      success: true as const,
      data: {
        count: body.count ?? 0,
        audience_setup_completed: body.audience_setup_completed ?? false,
        results: Array.isArray(body.results) ? body.results : [],
      } satisfies OrganizationOnboardingAudiencesResponse,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load audiences right now.",
    };
  }
}

export async function createOrganizationOnboardingAudience(
  organizationId: number,
  payload: UpsertOrganizationAudiencePayload,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingAudiences(organizationId)),
      {
        method: "POST",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAudience> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to create audience right now."),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingAudience,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to create audience right now.",
    };
  }
}

export async function updateOrganizationOnboardingAudience(
  organizationId: number,
  audienceId: number,
  payload: UpsertOrganizationAudiencePayload,
) {
  try {
    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingAudienceDetail(
          organizationId,
          audienceId,
        ),
      ),
      {
        method: "PATCH",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAudience> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to update audience right now."),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingAudience,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to update audience right now.",
    };
  }
}

export async function archiveOrganizationOnboardingAudience(
  organizationId: number,
  audienceId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingAudienceDetail(
          organizationId,
          audienceId,
        ),
      ),
      {
        method: "DELETE",
        headers: await getOnboardingAuthHeaders(false, true),
      },
    );

    if (response.status === 204) {
      return {
        success: true as const,
      };
    }

    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to archive audience right now."),
      };
    }

    return {
      success: true as const,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to archive audience right now.",
    };
  }
}

export async function getOrganizationOnboardingAudienceMembers(
  organizationId: number,
  audienceId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingAudienceMembers(
          organizationId,
          audienceId,
        ),
      ),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAudienceMembersResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to load audience members right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: {
        count: body.count ?? 0,
        results: Array.isArray(body.results) ? body.results : [],
      } satisfies OrganizationOnboardingAudienceMembersResponse,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load audience members right now.",
    };
  }
}

export async function addOrganizationOnboardingAudienceMembers(
  organizationId: number,
  audienceId: number,
  payload: AddOrganizationAudienceMembersPayload,
) {
  try {
    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingAudienceMembers(
          organizationId,
          audienceId,
        ),
      ),
      {
        method: "POST",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAudienceMembersMutationResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to add audience members right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingAudienceMembersMutationResponse,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to add audience members right now.",
    };
  }
}

export async function importOrganizationOnboardingAudienceMembers(
  organizationId: number,
  audienceId: number,
  file: File,
) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingAudienceMembersImport(
          organizationId,
          audienceId,
        ),
      ),
      {
        method: "POST",
        headers: await getOnboardingAuthHeaders(false, true),
        body: formData,
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAudienceMembersMutationResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to import audience members right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingAudienceMembersMutationResponse,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to import audience members right now.",
    };
  }
}

export async function getOrganizationOnboardingLaunchChecklist(
  organizationId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingLaunchChecklist(organizationId)),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingLaunchChecklist> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to load launch checklist right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: {
        ...body,
        blocking_issues: Array.isArray(body.blocking_issues)
          ? body.blocking_issues
          : [],
        warnings: Array.isArray(body.warnings) ? body.warnings : [],
        can_launch: Boolean(body.can_launch),
        unit_count: Number(body.unit_count ?? 0),
        audience_count: Number(body.audience_count ?? 0),
        active_admin_count: Number(body.active_admin_count ?? 0),
        pending_invite_count: Number(body.pending_invite_count ?? 0),
      } as OrganizationOnboardingLaunchChecklist,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load launch checklist right now.",
    };
  }
}

export async function getOrganizationOnboardingReview(
  organizationId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingReview(organizationId)),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingReviewPayload> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to load onboarding review right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: {
        ...body,
        unit_count: Number(body.unit_count ?? 0),
        audience_count: Number(body.audience_count ?? 0),
        invited_admin_count: Number(body.invited_admin_count ?? 0),
        pending_admin_invite_count: Number(body.pending_admin_invite_count ?? 0),
        accepted_admin_invite_count: Number(body.accepted_admin_invite_count ?? 0),
        revoked_admin_invite_count: Number(body.revoked_admin_invite_count ?? 0),
        admin_invites_skipped: Boolean(body.admin_invites_skipped),
        blocking_issues: Array.isArray(body.blocking_issues)
          ? body.blocking_issues
          : [],
        can_launch: Boolean(body.can_launch),
      } as OrganizationOnboardingReviewPayload,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load onboarding review right now.",
    };
  }
}

export async function completeOrganizationOnboardingStep(
  organizationId: number,
  stepKey: string,
  payload: CompleteOrganizationOnboardingStepPayload = {},
) {
  return mutateOrganizationOnboardingStep(
    organizationId,
    stepKey,
    payload,
    apiEndpoints.organizationOnboardingStepComplete,
    "Unable to complete onboarding review right now.",
  );
}

export async function activateOrganizationOnboardingStep(
  organizationId: number,
  stepKey: string,
  payload: CompleteOrganizationOnboardingStepPayload = {},
) {
  return mutateOrganizationOnboardingStep(
    organizationId,
    stepKey,
    payload,
    apiEndpoints.organizationOnboardingStepActivate,
    "Unable to activate onboarding step right now.",
  );
}

export async function skipOrganizationOnboardingStep(
  organizationId: number,
  stepKey: string,
  payload: CompleteOrganizationOnboardingStepPayload = {},
) {
  return mutateOrganizationOnboardingStep(
    organizationId,
    stepKey,
    payload,
    apiEndpoints.organizationOnboardingStepSkip,
    "Unable to skip onboarding step right now.",
  );
}

async function mutateOrganizationOnboardingStep(
  organizationId: number,
  stepKey: string,
  payload: CompleteOrganizationOnboardingStepPayload,
  buildEndpoint: (organizationId: number, stepKey: string) => string,
  fallbackMessage: string,
) {
  try {
    const response = await fetch(
      buildApiUrl(buildEndpoint(organizationId, stepKey)),
      {
        method: "POST",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingStepMutationResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          fallbackMessage,
        ),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingStepMutationResponse,
    };
  } catch {
    return {
      success: false as const,
      message: fallbackMessage,
    };
  }
}

export async function launchOrganizationOnboarding(
  organizationId: number,
  payload: LaunchOrganizationOnboardingPayload,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingLaunch(organizationId)),
      {
        method: "POST",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingLaunchResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to launch organization right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingLaunchResponse,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to launch organization right now.",
    };
  }
}

export async function getOrganizationOnboardingAdminInviteRoles(
  organizationId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingAdminInviteRoles(organizationId),
      ),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as
      | { results?: OrganizationOnboardingAdminInviteRole[] }
      | Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to load invite roles right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: Array.isArray(body.results) ? body.results : [],
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load invite roles right now.",
    };
  }
}

export async function getOrganizationOnboardingAdminInvites(
  organizationId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingAdminInvites(organizationId)),
      {
        method: "GET",
        headers: await getOnboardingAuthHeaders(false, true),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAdminInvitesResponse> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(
          body,
          "Unable to load admin invites right now.",
        ),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingAdminInvitesResponse,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load admin invites right now.",
    };
  }
}

export async function createOrganizationOnboardingAdminInvite(
  organizationId: number,
  payload: CreateOrganizationAdminInvitePayload,
) {
  try {
    const response = await fetch(
      buildApiUrl(apiEndpoints.organizationOnboardingAdminInvites(organizationId)),
      {
        method: "POST",
        headers: await getOnboardingAuthHeaders(true, true),
        body: JSON.stringify(payload),
      },
    );

    const body = (await response.json()) as Partial<OrganizationOnboardingAdminInvite> &
      Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to send invite right now."),
      };
    }

    return {
      success: true as const,
      data: body as OrganizationOnboardingAdminInvite,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to send invite right now.",
    };
  }
}

export async function revokeOrganizationOnboardingAdminInvite(
  organizationId: number,
  inviteId: number,
) {
  try {
    const response = await fetch(
      buildApiUrl(
        apiEndpoints.organizationOnboardingAdminInviteDetail(
          organizationId,
          inviteId,
        ),
      ),
      {
        method: "DELETE",
        headers: await getOnboardingAuthHeaders(false, true),
      },
    );

    const body = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      return {
        success: false as const,
        message: extractApiErrorMessage(body, "Unable to revoke invite right now."),
      };
    }

    return {
      success: true as const,
      data: body,
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to revoke invite right now.",
    };
  }
}
