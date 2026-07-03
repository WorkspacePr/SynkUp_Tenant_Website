export const apiEndpoints = {
  referenceData: "/api/reference-data/",
  subdomainAvailability: "/api/subdomain-availability/",
  tenantFindOrganization: "/api/auth/tenant/find-organization/",
  tenantLogin: "/api/auth/tenant/login/",
  tenantLoginResendOtp: "/api/auth/tenant/login/resend-otp/",
  tenantLoginVerifyOtp: "/api/auth/tenant/login/verify-otp/",
  tenantPasswordResetRequest: "/api/auth/tenant/password-reset/request/",
  tenantPasswordResetResend: "/api/auth/tenant/password-reset/resend/",
  tenantPasswordResetConfirm: "/api/auth/tenant/password-reset/confirm/",
  sendRegistrationVerification: "/api/onboarding/registration/send-verification/",
  resendRegistrationVerification: "/api/onboarding/registration/resend-verification/",
  verifyRegistrationCode: "/api/onboarding/registration/verify-code/",
  createRegistrationOrganization: "/api/onboarding/registration/create-organization/",
  refreshToken: "/api/auth/token/refresh/",
  organizationOnboardingStatus: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/`,
  organizationOnboardingProfile: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/profile/`,
  organizationOnboardingUnits: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/units/`,
  organizationOnboardingUnitDetail: (organizationId: number, unitId: number) =>
    `/api/organizations/${organizationId}/onboarding/units/${unitId}/`,
  organizationOnboardingAdminInviteRoles: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/admin-invite-roles/`,
  organizationOnboardingAdminInvites: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/admin-invites/`,
  organizationOnboardingAdminInviteDetail: (
    organizationId: number,
    inviteId: number,
  ) => `/api/organizations/${organizationId}/onboarding/admin-invites/${inviteId}/`,
  organizationOnboardingAudiences: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/audiences/`,
  organizationOnboardingAudienceDetail: (
    organizationId: number,
    audienceId: number,
  ) => `/api/organizations/${organizationId}/onboarding/audiences/${audienceId}/`,
  organizationOnboardingAudienceMembers: (
    organizationId: number,
    audienceId: number,
  ) =>
    `/api/organizations/${organizationId}/onboarding/audiences/${audienceId}/members/`,
  organizationOnboardingAudienceMembersImport: (
    organizationId: number,
    audienceId: number,
  ) =>
    `/api/organizations/${organizationId}/onboarding/audiences/${audienceId}/members/import/`,
  organizationOnboardingLaunchChecklist: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/launch-checklist/`,
  organizationOnboardingLaunch: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/launch/`,
  organizationOnboardingReview: (organizationId: number) =>
    `/api/organizations/${organizationId}/onboarding/review/`,
  organizationOnboardingStepComplete: (
    organizationId: number,
    stepKey: string,
  ) =>
    `/api/organizations/${organizationId}/onboarding/steps/${stepKey}/complete/`,
  organizationOnboardingStepActivate: (
    organizationId: number,
    stepKey: string,
  ) =>
    `/api/organizations/${organizationId}/onboarding/steps/${stepKey}/activate/`,
  organizationOnboardingStepSkip: (
    organizationId: number,
    stepKey: string,
  ) =>
    `/api/organizations/${organizationId}/onboarding/steps/${stepKey}/skip/`,
} as const;

export function buildApiUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  return pathOrUrl;
}
