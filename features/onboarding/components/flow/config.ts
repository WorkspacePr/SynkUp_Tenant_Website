import type { OnboardingFormValues, OnboardingStepId } from "@/types/onboarding";

export type WorkspaceTaskId = "profile" | "unit" | "invite" | "audience";

export const defaultValues: OnboardingFormValues = {
  organisationName: "",
  organisationType: "",
  industrySector: "",
  subdomain: "",
  firstName: "",
  surname: "",
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  verificationCode: "",
  planId: "pro",
  organizationDisplayName: "",
  organizationType: "",
  organizationLogoName: "",
  defaultAttendanceIdentifier: "",
  unitName: "",
  unitType: "",
  unitTypeOther: "",
  unitDescription: "",
  inviteEmail: "",
  inviteRole: "Super Admin",
  inviteUnitId: "",
  inviteAudienceId: "",
  audienceGroupName: "",
  audienceType: "",
  audienceUnitId: "",
  audienceIdentifier: "",
};

export const taskStepMap: Record<WorkspaceTaskId, OnboardingStepId> = {
  profile: "profile",
  unit: "unit",
  invite: "invite",
  audience: "audience",
};
