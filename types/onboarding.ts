export type PlanId = "basic" | "pro" | "enterprise";

export type OnboardingStepId =
  | "welcome"
  | "profile"
  | "unit"
  | "invite"
  | "audience"
  | "review"
  | "complete";

export type IconName =
  | "building"
  | "grid"
  | "users"
  | "shield"
  | "audit"
  | "clock"
  | "sparkle"
  | "globe";

export interface HeroCardDefinition {
  title: string;
  description: string;
  icon: IconName;
}

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  subtitle: string;
  cta: string;
  heroTitle?: string;
  heroDescription?: string;
  heroCards?: HeroCardDefinition[];
  visual?: "governance" | "ignition";
  fullWidth?: boolean;
}

export interface InviteAdmin {
  email: string;
  role: string;
}

export interface AudienceMember {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  identifier: string;
  status: "Added" | "Pending Invite" | "No Email";
  source?: "manual" | "import";
}

export interface ImportedAudienceMember {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  identifier?: string;
  status: "Added" | "Pending Invite" | "No Email";
  action: string;
}

export interface OnboardingFormValues {
  organisationName: string;
  organisationType: string;
  industrySector: string;
  subdomain: string;
  firstName: string;
  surname: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationCode: string;
  planId: PlanId | "";
  organizationDisplayName: string;
  organizationType: string;
  organizationLogoName: string;
  defaultAttendanceIdentifier: string;
  unitName: string;
  unitType: string;
  unitTypeOther: string;
  unitDescription: string;
  inviteEmail: string;
  inviteRole: string;
  inviteUnitId: string;
  inviteAudienceId: string;
  audienceGroupName: string;
  audienceType: string;
  audienceUnitId: string;
  audienceIdentifier: string;
}

export interface OrganizationOnboardingUnit {
  unit_id: number;
  organization: number;
  name: string;
  type: string | null;
  description: string | null;
  location: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  is_active: boolean;
  is_archived: boolean;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationOnboardingUnitsResponse {
  count: number;
  unit_setup_completed: boolean;
  results: OrganizationOnboardingUnit[];
}

export interface OrganizationOnboardingAdminInviteRole {
  role_id: number;
  name: string;
}

export interface OrganizationOnboardingAdminInvite {
  invite_id: number;
  organization: number;
  organization_name: string;
  invited_email: string;
  invited_by: number;
  invited_by_username: string;
  invited_role: number;
  invited_role_name: string;
  invited_unit: number | null;
  invited_unit_name: string | null;
  invited_audience: number | null;
  invited_audience_name: string | null;
  message: string | null;
  status: string;
  token: string;
  expires_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  revoked_at: string | null;
  revoked_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationOnboardingAdminInvitesResponse {
  count: number;
  pending_count: number;
  accepted_count: number;
  revoked_count: number;
  expired_count: number;
  admin_invites_step_status: string;
  results: OrganizationOnboardingAdminInvite[];
}

export interface OrganizationOnboardingAudience {
  audience_id: number;
  organization: number;
  name: string;
  audience_type: string;
  unit: number;
  description: string | null;
  expected_member_count: number | null;
  metadata: Record<string, unknown> | null;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationOnboardingAudiencesResponse {
  count: number;
  audience_setup_completed: boolean;
  results: OrganizationOnboardingAudience[];
}

export interface OrganizationOnboardingAudienceMember {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  joined_at: string;
  audience: number;
  user: number;
}

export interface OrganizationOnboardingAudienceMembersResponse {
  count: number;
  results: OrganizationOnboardingAudienceMember[];
}

export interface OrganizationOnboardingAudienceMembersMutationResponse {
  created_users: number;
  added_memberships: number;
  added_to_audience: number;
  reactivated_audience_members: number;
  skipped_duplicates: number;
  errors: unknown[];
  results: unknown[];
  file_name?: string;
  detected_format?: string;
}

export interface OrganizationOnboardingLaunchIssue {
  code: string;
  message: string;
  step_key: string;
  severity: string;
}

export interface OrganizationOnboardingLaunchChecklist {
  organization_id: number;
  organization_name: string;
  organization_profile: unknown;
  primary_admin: unknown;
  plan_selection: unknown;
  review_details: unknown;
  unit_setup: unknown;
  admin_invites: unknown;
  audience_setup: unknown;
  launch: unknown;
  blocking_issues: OrganizationOnboardingLaunchIssue[];
  warnings: OrganizationOnboardingLaunchIssue[];
  can_launch: boolean;
  subscription_status: string;
  plan_name: string;
  unit_count: number;
  audience_count: number;
  active_admin_count: number;
  pending_invite_count: number;
  onboarding_status: string;
  launch_completed_at: string | null;
  onboarding_completed_at: string | null;
}

export interface OrganizationOnboardingLaunchResponse {
  message: string;
  already_launched: boolean;
  launch_summary: OrganizationOnboardingLaunchChecklist;
  completed_by: string;
  completed_at: string;
}

export interface OrganizationOnboardingReviewOrganization {
  organization_id: number;
  name: string;
  organization_type: string;
  industry_sector: string;
  official_email: string;
  country: string;
  city: string;
  subdomain: string;
  slug: string;
  logo: string | null;
  timezone: string;
  phone: string | null;
  address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationOnboardingReviewPrimaryAdmin {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  membership_type: string;
  joined_at: string;
  accepted_at: string | null;
}

export interface OrganizationOnboardingReviewSubscription {
  plan: string;
  status: string;
  trial_ends_at: string | null;
  next_billing_date: string | null;
}

export interface OrganizationOnboardingReviewPayload {
  organization: OrganizationOnboardingReviewOrganization;
  primary_admin: OrganizationOnboardingReviewPrimaryAdmin | null;
  subscription: OrganizationOnboardingReviewSubscription | null;
  onboarding: OrganizationOnboardingStatus;
  unit_count: number;
  audience_count: number;
  invited_admin_count: number;
  pending_admin_invite_count: number;
  accepted_admin_invite_count: number;
  revoked_admin_invite_count: number;
  admin_invites_skipped: boolean;
  blocking_issues: OrganizationOnboardingLaunchIssue[];
  can_launch: boolean;
}

export type OrganizationOnboardingStepMutationResponse =
  OrganizationOnboardingStatus;

export interface OrganizationOnboardingStep {
  id: number;
  onboarding: number;
  organization: number;
  step_key: string;
  status: string;
  order: number;
  required: boolean;
  completed_by: number | null;
  completed_by_email: string | null;
  completed_at: string | null;
  skipped_by: number | null;
  skipped_by_email: string | null;
  skipped_at: string | null;
  blocked_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationOnboardingStatus {
  id: number;
  organization: number;
  organization_name: string;
  status: string;
  current_step: string;
  started_by: number;
  started_by_email: string;
  completed_by: number | null;
  completed_by_email: string | null;
  started_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  steps: OrganizationOnboardingStep[];
}

export interface OrganizationOnboardingProfile {
  organization_id: number;
  name: string;
  organization_type: string;
  industry_sector: string;
  official_email: string;
  country: string;
  city: string;
  subdomain: string;
  slug: string;
  logo: string | null;
  timezone: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
}
