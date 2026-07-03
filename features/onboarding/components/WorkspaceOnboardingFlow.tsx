"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { FormError } from "@/components/ui/FormError";
import type { SelectOption } from "@/components/ui/Select";
import { CompletionStep } from "@/features/onboarding/components/CompletionStep";
import { CreateAudienceStep } from "@/features/onboarding/components/CreateAudienceStep";
import { InviteAdminsStep } from "@/features/onboarding/components/InviteAdminsStep";
import { OrganisationDetailsStep } from "@/features/onboarding/components/OrganisationDetailsStep";
import { ReviewDetailsStep } from "@/features/onboarding/components/ReviewDetailsStep";
import { UnitSetupStep } from "@/features/onboarding/components/UnitSetupStep";
import { WelcomeChecklistStep } from "@/features/onboarding/components/WelcomeChecklistStep";
import {
  addOrganizationOnboardingAudienceMembers,
  completeOrganizationOnboardingStep,
  createOrganizationOnboardingAudience,
  createOrganizationOnboardingAdminInvite,
  createOrganizationOnboardingUnit,
  getOrganizationOnboardingAudiences,
  getReferenceData,
  getOrganizationOnboardingAdminInviteRoles,
  getOrganizationOnboardingAdminInvites,
  getOrganizationOnboardingLaunchChecklist,
  getOrganizationOnboardingProfile,
  getOrganizationOnboardingReview,
  getOrganizationOnboardingStatus,
  getOrganizationOnboardingUnits,
  importOrganizationOnboardingAudienceMembers,
  launchOrganizationOnboarding,
  revokeOrganizationOnboardingAdminInvite,
  updateOrganizationOnboardingAudience,
  updateOrganizationOnboardingProfile,
  updateOrganizationOnboardingUnit,
} from "@/features/onboarding/api/tenant-onboarding";
import { onboardingSteps } from "@/features/onboarding/constants/onboarding-steps";
import { tenantOnboardingSchema } from "@/features/onboarding/validations/tenant-onboarding.schema";
import { parseAudienceImportCsv } from "@/features/onboarding/utils/audience-import";
import { buildTenantSignInUrl, ONBOARDING_STATE_STORAGE_KEY } from "@/lib/auth/tenant-session";
import type {
  AudienceMember,
  ImportedAudienceMember,
  OnboardingFormValues,
  OrganizationOnboardingAudience,
  OrganizationOnboardingAdminInvite,
  OrganizationOnboardingLaunchChecklist,
  OrganizationOnboardingReviewPayload,
  OrganizationOnboardingStatus,
  OrganizationOnboardingUnit,
  OnboardingStepId,
} from "@/types/onboarding";

const defaultValues: OnboardingFormValues = {
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

const taskStepMap: Record<
  "profile" | "unit" | "invite" | "audience",
  OnboardingStepId
> = {
  profile: "profile",
  unit: "unit",
  invite: "invite",
  audience: "audience",
};

function resolveWelcomeResumeTask(
  currentStep: OnboardingStepId,
  completedTasks: Array<"profile" | "unit" | "invite" | "audience">,
) {
  if (
    currentStep === "profile" ||
    currentStep === "unit" ||
    currentStep === "invite" ||
    currentStep === "audience"
  ) {
    return currentStep;
  }

  const orderedTasks: Array<"profile" | "unit" | "invite" | "audience"> = [
    "profile",
    "unit",
    "invite",
    "audience",
  ];

  return (
    orderedTasks.find((task) => !completedTasks.includes(task)) ?? "audience"
  );
}

function mapBackendStepToCurrentStep(
  status: OrganizationOnboardingStatus,
): OnboardingStepId {
  const activeStep =
    status.steps.find((step) => step.status === "active")?.step_key ??
    status.current_step;
  const normalized = activeStep.toLowerCase();

  if (status.status === "completed" || normalized.includes("complete")) {
    return "complete";
  }

  if (normalized.includes("profile") || normalized.includes("organization")) {
    return "profile";
  }

  if (
    normalized.includes("unit") ||
    normalized.includes("branch") ||
    normalized.includes("department")
  ) {
    return "unit";
  }

  if (normalized.includes("invite") || normalized.includes("admin")) {
    return "invite";
  }

  if (normalized.includes("audience") || normalized.includes("member")) {
    return "audience";
  }

  if (normalized.includes("review")) {
    return "review";
  }

  return "welcome";
}

function mapCompletedTasks(status: OrganizationOnboardingStatus) {
  const completed = new Set<"profile" | "unit" | "invite" | "audience">();

  for (const step of status.steps) {
    if (step.status !== "completed") continue;
    const key = step.step_key.toLowerCase();

    if (key.includes("profile") || key.includes("organization")) {
      completed.add("profile");
    }
    if (
      key.includes("unit") ||
      key.includes("branch") ||
      key.includes("department")
    ) {
      completed.add("unit");
    }
    if (key.includes("invite") || key.includes("admin")) {
      completed.add("invite");
    }
    if (key.includes("audience") || key.includes("member")) {
      completed.add("audience");
    }
  }

  return [...completed];
}

function resolveSelectValue(
  options: SelectOption[],
  incomingValue: string | null | undefined,
) {
  const normalizedIncomingValue = incomingValue?.trim().toLowerCase();

  if (!normalizedIncomingValue) {
    return "";
  }

  const matchedOption = options.find((option) => {
    return (
      option.value.trim().toLowerCase() === normalizedIncomingValue ||
      option.label.trim().toLowerCase() === normalizedIncomingValue
    );
  });

  return matchedOption?.value ?? incomingValue ?? "";
}

export function WorkspaceOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>("welcome");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [hasRestoredStoredState, setHasRestoredStoredState] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<
    Array<"profile" | "unit" | "invite" | "audience">
  >([]);
  const [members, setMembers] = useState<AudienceMember[]>([]);
  const [importedPreviewMembers, setImportedPreviewMembers] = useState<
    ImportedAudienceMember[]
  >([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportReviewModal, setShowImportReviewModal] = useState(false);
  const [manualFirstName, setManualFirstName] = useState("");
  const [manualSurname, setManualSurname] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualIdentifier, setManualIdentifier] = useState("");
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [audienceId, setAudienceId] = useState<number | null>(null);
  const [audienceImportFile, setAudienceImportFile] = useState<File | null>(
    null,
  );
  const [launchChecklist, setLaunchChecklist] =
    useState<OrganizationOnboardingLaunchChecklist | null>(null);
  const [reviewPayload, setReviewPayload] =
    useState<OrganizationOnboardingReviewPayload | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [isCompletingReview, setIsCompletingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isLoadingLaunchChecklist, setIsLoadingLaunchChecklist] =
    useState(false);
  const [isLaunchingOrganization, setIsLaunchingOrganization] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [workspaceOrganizationName, setWorkspaceOrganizationName] =
    useState("");
  const [organizationLogoPreviewUrl, setOrganizationLogoPreviewUrl] =
    useState("");
  const [organizationLogoFile, setOrganizationLogoFile] = useState<File | null>(
    null,
  );
  const [organizationTypeOptions, setOrganizationTypeOptions] = useState<
    SelectOption[]
  >([]);
  const [industrySectorOptions, setIndustrySectorOptions] = useState<
    SelectOption[]
  >([]);
  const [attendanceIdentifierOptions, setAttendanceIdentifierOptions] =
    useState<SelectOption[]>([]);
  const [unitTypeOptions, setUnitTypeOptions] = useState<SelectOption[]>([]);
  const [audienceTypeOptions, setAudienceTypeOptions] = useState<
    SelectOption[]
  >([]);
  const [inviteRoleOptions, setInviteRoleOptions] = useState<SelectOption[]>([]);
  const [adminInvites, setAdminInvites] = useState<
    OrganizationOnboardingAdminInvite[]
  >([]);
  const [onboardingUnits, setOnboardingUnits] = useState<
    OrganizationOnboardingUnit[]
  >([]);
  const [onboardingAudiences, setOnboardingAudiences] = useState<
    OrganizationOnboardingAudience[]
  >([]);
  const [isReferenceDataLoading, setIsReferenceDataLoading] = useState(true);
  const [hasLoadedOrganizationProfile, setHasLoadedOrganizationProfile] =
    useState(false);
  const [hasLoadedInviteData, setHasLoadedInviteData] = useState(false);
  const [forceWorkspaceWelcome, setForceWorkspaceWelcome] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [revokingInviteId, setRevokingInviteId] = useState<number | null>(null);
  const [isSavingAudience, setIsSavingAudience] = useState(false);
  const [isContinuingAudience, setIsContinuingAudience] = useState(false);
  const [isImportingAudience, setIsImportingAudience] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(tenantOnboardingSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    control,
    trigger,
    setValue,
    formState: { errors },
    getValues,
    reset,
  } = form;

  const values = (useWatch({ control }) ?? defaultValues) as OnboardingFormValues;
  const inviteUnitOptions = useMemo(() => {
    const options = new Map<string, SelectOption>();

    for (const unit of onboardingUnits) {
      options.set(String(unit.unit_id), {
        value: String(unit.unit_id),
        label: unit.name,
      });
    }

    if (unitId && values.unitName.trim()) {
      options.set(String(unitId), {
        value: String(unitId),
        label: values.unitName.trim(),
      });
    }

    for (const invite of adminInvites) {
      if (invite.invited_unit && invite.invited_unit_name) {
        options.set(String(invite.invited_unit), {
          value: String(invite.invited_unit),
          label: invite.invited_unit_name,
        });
      }
    }

    return [...options.values()];
  }, [adminInvites, onboardingUnits, unitId, values.unitName]);

  const inviteAudienceOptions = useMemo(() => {
    const options = new Map<string, SelectOption>();

    for (const audience of onboardingAudiences) {
      options.set(String(audience.audience_id), {
        value: String(audience.audience_id),
        label: audience.name,
      });
    }

    for (const invite of adminInvites) {
      if (invite.invited_audience && invite.invited_audience_name) {
        options.set(String(invite.invited_audience), {
          value: String(invite.invited_audience),
          label: invite.invited_audience_name,
        });
      }
    }

    return [...options.values()];
  }, [adminInvites, onboardingAudiences]);

  const effectiveCurrentStep = forceWorkspaceWelcome ? "welcome" : currentStep;
  const activeStep = useMemo(
    () =>
      onboardingSteps.find((step) => step.id === effectiveCurrentStep) ??
      onboardingSteps[0],
    [effectiveCurrentStep],
  );

  useEffect(() => {
    const storedValue = window.sessionStorage.getItem(
      ONBOARDING_STATE_STORAGE_KEY,
    );

    if (!storedValue) {
      const timeout = window.setTimeout(() => {
        setHasRestoredStoredState(true);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    let restoreReadyTimeout: number | null = null;

    try {
      const parsed = JSON.parse(storedValue) as Partial<{
        phase: "creation" | "workspace";
        currentStep: OnboardingStepId;
        organizationId: number | null;
        unitId: number | null;
        audienceId: number | null;
        workspaceOrganizationName: string;
        forceWorkspaceWelcome: boolean;
        completedTasks: Array<"profile" | "unit" | "invite" | "audience">;
        values: Partial<OnboardingFormValues>;
      }>;

      if (parsed.phase === "creation") {
        window.sessionStorage.removeItem(ONBOARDING_STATE_STORAGE_KEY);
        restoreReadyTimeout = window.setTimeout(() => {
          setHasRestoredStoredState(true);
        }, 0);
        return;
      }

      if (parsed.values) {
        reset({ ...defaultValues, ...parsed.values });
      }
      restoreReadyTimeout = window.setTimeout(() => {
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (typeof parsed.organizationId === "number") {
          setOrganizationId(parsed.organizationId);
        }
        if (typeof parsed.unitId === "number") {
          setUnitId(parsed.unitId);
        }
        if (typeof parsed.audienceId === "number") {
          setAudienceId(parsed.audienceId);
        }
        if (typeof parsed.workspaceOrganizationName === "string") {
          setWorkspaceOrganizationName(parsed.workspaceOrganizationName);
        }
        if (typeof parsed.forceWorkspaceWelcome === "boolean") {
          setForceWorkspaceWelcome(parsed.forceWorkspaceWelcome);
        }
        if (Array.isArray(parsed.completedTasks)) {
          setCompletedTasks(parsed.completedTasks);
        }
        setHasRestoredStoredState(true);
      }, 0);
    } catch {
      window.sessionStorage.removeItem(ONBOARDING_STATE_STORAGE_KEY);
      restoreReadyTimeout = window.setTimeout(() => {
        setHasRestoredStoredState(true);
      }, 0);
    }

    return () => {
      if (restoreReadyTimeout !== null) {
        window.clearTimeout(restoreReadyTimeout);
      }
    };
  }, [reset]);

  useEffect(() => {
    if (!hasRestoredStoredState) {
      return;
    }

    const snapshot = {
      currentStep,
      organizationId,
      unitId,
      audienceId,
      workspaceOrganizationName,
      forceWorkspaceWelcome,
      completedTasks,
      values,
    };

    window.sessionStorage.setItem(
      ONBOARDING_STATE_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  }, [
    completedTasks,
    audienceId,
    currentStep,
    forceWorkspaceWelcome,
    hasRestoredStoredState,
    organizationId,
    unitId,
    values,
    workspaceOrganizationName,
  ]);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await getOrganizationOnboardingStatus(organizationId);
      if (!result.success || cancelled) {
        return;
      }

      setWorkspaceOrganizationName(result.data.organization_name);
      setCompletedTasks(mapCompletedTasks(result.data));
      if (!forceWorkspaceWelcome) {
        setCurrentStep(mapBackendStepToCurrentStep(result.data));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [forceWorkspaceWelcome, organizationId]);

  useEffect(() => {
    if (currentStep !== "complete" || !organizationId) {
      return;
    }

    let isMounted = true;
    const resolvedOrganizationId: number = organizationId;

    async function loadLaunchChecklist() {
      setIsLoadingLaunchChecklist(true);
      setLaunchError(null);

      try {
        const result = await getOrganizationOnboardingLaunchChecklist(
          resolvedOrganizationId,
        );

        if (!isMounted) return;

        if (!result.success) {
          setLaunchError(result.message);
          return;
        }

        setLaunchChecklist(result.data);
      } finally {
        if (isMounted) {
          setIsLoadingLaunchChecklist(false);
        }
      }
    }

    void loadLaunchChecklist();

    return () => {
      isMounted = false;
    };
  }, [currentStep, organizationId]);

  useEffect(() => {
    if (currentStep !== "review" || !organizationId) {
      return;
    }

    let isMounted = true;
    const resolvedOrganizationId = organizationId;

    async function loadReviewPayload() {
      setIsLoadingReview(true);
      setReviewError(null);

      try {
        const result = await getOrganizationOnboardingReview(resolvedOrganizationId);

        if (!isMounted) return;

        if (!result.success) {
          setReviewError(result.message);
          return;
        }

        setReviewPayload(result.data);
      } finally {
        if (isMounted) {
          setIsLoadingReview(false);
        }
      }
    }

    void loadReviewPayload();

    return () => {
      isMounted = false;
    };
  }, [currentStep, organizationId]);

  useEffect(() => {
    if (
      currentStep !== "profile" ||
      !organizationId ||
      hasLoadedOrganizationProfile ||
      isReferenceDataLoading
    ) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await getOrganizationOnboardingProfile(organizationId);
      if (!result.success || cancelled) {
        if (!cancelled) {
          setGlobalError(
            result.message ?? "Unable to load organization profile right now.",
          );
        }
        return;
      }

      const resolvedOrganizationType = resolveSelectValue(
        organizationTypeOptions,
        result.data.organization_type,
      );
      const resolvedIndustrySector = resolveSelectValue(
        industrySectorOptions,
        result.data.industry_sector,
      );

      setValue("organizationDisplayName", result.data.name ?? "", {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue("organizationType", resolvedOrganizationType, {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue("organisationName", result.data.name ?? getValues("organisationName"), {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue(
        "organisationType",
        resolvedOrganizationType || getValues("organisationType"),
        {
          shouldDirty: false,
          shouldTouch: false,
        },
      );
      setValue(
        "industrySector",
        resolvedIndustrySector || getValues("industrySector"),
        {
          shouldDirty: false,
          shouldTouch: false,
        },
      );
      setValue("email", result.data.official_email ?? getValues("email"), {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue("subdomain", result.data.subdomain ?? getValues("subdomain"), {
        shouldDirty: false,
        shouldTouch: false,
      });
      if (result.data.logo) {
        setOrganizationLogoPreviewUrl(result.data.logo);
      }
      setWorkspaceOrganizationName(result.data.name ?? workspaceOrganizationName);
      setHasLoadedOrganizationProfile(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    currentStep,
    getValues,
    hasLoadedOrganizationProfile,
    industrySectorOptions,
    isReferenceDataLoading,
    organizationId,
    organizationTypeOptions,
    setValue,
    workspaceOrganizationName,
  ]);

  useEffect(() => {
    if (currentStep !== "audience" || !organizationId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const [unitsResult, audiencesResult] = await Promise.all([
        getOrganizationOnboardingUnits(organizationId),
        getOrganizationOnboardingAudiences(organizationId),
      ]);

      if (cancelled) {
        return;
      }

      if (unitsResult.success) {
        setOnboardingUnits(unitsResult.data.results);
        const selectedUnitId = getValues("audienceUnitId");
        if (!selectedUnitId && unitsResult.data.results[0]) {
          setValue("audienceUnitId", String(unitsResult.data.results[0].unit_id), {
            shouldDirty: false,
            shouldTouch: false,
          });
        }
      }

      if (audiencesResult.success) {
        setOnboardingAudiences(audiencesResult.data.results);
        const firstAudience = audiencesResult.data.results[0];
        if (firstAudience && !audienceId) {
          setAudienceId(firstAudience.audience_id);
          setValue("audienceGroupName", firstAudience.name, {
            shouldDirty: false,
            shouldTouch: false,
          });
          setValue("audienceType", firstAudience.audience_type, {
            shouldDirty: false,
            shouldTouch: false,
          });
          setValue("audienceUnitId", String(firstAudience.unit), {
            shouldDirty: false,
            shouldTouch: false,
          });

          const metadata = firstAudience.metadata;
          if (
            metadata &&
            typeof metadata === "object" &&
            typeof metadata.attendance_identifier === "string"
          ) {
            setValue("audienceIdentifier", metadata.attendance_identifier, {
              shouldDirty: false,
              shouldTouch: false,
            });
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audienceId, currentStep, getValues, organizationId, setValue]);

  useEffect(() => {
    if (currentStep !== "invite" || !organizationId || hasLoadedInviteData) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const [rolesResult, invitesResult, unitsResult] = await Promise.all([
        getOrganizationOnboardingAdminInviteRoles(organizationId),
        getOrganizationOnboardingAdminInvites(organizationId),
        getOrganizationOnboardingUnits(organizationId),
      ]);

      if (cancelled) {
        return;
      }

      if (!rolesResult.success) {
        setGlobalError(rolesResult.message);
        return;
      }

      const nextRoleOptions = rolesResult.data.map((role) => ({
        value: role.name,
        label: role.name,
      }));

      setInviteRoleOptions(nextRoleOptions);
      if (
        nextRoleOptions.length > 0 &&
        !nextRoleOptions.some((option) => option.value === getValues("inviteRole"))
      ) {
        setValue("inviteRole", nextRoleOptions[0].value, {
          shouldDirty: false,
          shouldTouch: false,
        });
      }

      if (invitesResult.success) {
        setAdminInvites(invitesResult.data.results);
      }

      if (unitsResult.success) {
        setOnboardingUnits(unitsResult.data.results);
      }

      setHasLoadedInviteData(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentStep, getValues, hasLoadedInviteData, organizationId, setValue]);

  useEffect(() => {
    void (async () => {
      try {
        const referenceData = await getReferenceData();
        setOrganizationTypeOptions(referenceData.organizationTypeOptions);
        setIndustrySectorOptions(referenceData.industrySectorOptions);
        setAttendanceIdentifierOptions(
          referenceData.attendanceIdentifierOptions,
        );
        setUnitTypeOptions(referenceData.unitTypeOptions);
        setAudienceTypeOptions(referenceData.audienceTypeOptions);
      } finally {
        setIsReferenceDataLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (organizationLogoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(organizationLogoPreviewUrl);
      }
    };
  }, [organizationLogoPreviewUrl]);

  async function validateFields(fields: Array<keyof OnboardingFormValues>) {
    setGlobalError(null);
    const valid = await trigger(fields);
    if (!valid) {
      setGlobalError("Please complete the required fields before continuing.");
      return false;
    }
    return true;
  }

  function markTaskComplete(task: "profile" | "unit" | "invite" | "audience") {
    setCompletedTasks((current) =>
      current.includes(task) ? current : [...current, task],
    );
  }

  function goToNextWorkspaceStep(from: OnboardingStepId) {
    if (from === "profile") setCurrentStep("unit");
    if (from === "unit") setCurrentStep("invite");
    if (from === "invite") setCurrentStep("audience");
    if (from === "audience") setCurrentStep("review");
    if (from === "review") setCurrentStep("complete");
  }

  function goToWelcomeScreen() {
    setCurrentStep("welcome");
  }

  function leaveWorkspaceWelcome(nextStep: OnboardingStepId) {
    setForceWorkspaceWelcome(false);
    setCurrentStep(nextStep);
  }

  async function handleProfileSubmit() {
    setIsSavingProfile(true);
    try {
      if (
        !(await validateFields([
          "organizationDisplayName",
          "organizationType",
          "industrySector",
        ]))
      ) {
        return;
      }
      if (!organizationId) {
        setGlobalError("Organization is missing. Please reload and try again.");
        return;
      }
      const payload = new FormData();
      payload.append("name", getValues("organizationDisplayName"));
      payload.append("organization_type", getValues("organizationType"));
      if (getValues("industrySector")) {
        payload.append("industry_sector", getValues("industrySector"));
      }
      if (getValues("email")) {
        payload.append("official_email", getValues("email"));
      }
      payload.append("country", "Nigeria");
      payload.append("subdomain", getValues("subdomain"));
      if (organizationLogoFile) {
        payload.append("logo", organizationLogoFile);
      }

      const result = await updateOrganizationOnboardingProfile(
        organizationId,
        payload,
      );
      if (!result.success) {
        setGlobalError(result.message);
        return;
      }
      setWorkspaceOrganizationName(result.data.name);
      setOrganizationLogoFile(null);
      if (result.data.logo) {
        setOrganizationLogoPreviewUrl(result.data.logo);
      }
      const resolvedOrganizationType = resolveSelectValue(
        organizationTypeOptions,
        result.data.organization_type,
      );
      const resolvedIndustrySector = resolveSelectValue(
        industrySectorOptions,
        result.data.industry_sector,
      );
      setValue(
        "organizationDisplayName",
        result.data.name ?? getValues("organizationDisplayName"),
        {
          shouldDirty: false,
          shouldTouch: false,
        },
      );
      setValue(
        "organizationType",
        resolvedOrganizationType || getValues("organizationType"),
        {
          shouldDirty: false,
          shouldTouch: false,
        },
      );
      setValue(
        "industrySector",
        resolvedIndustrySector || getValues("industrySector"),
        {
          shouldDirty: false,
          shouldTouch: false,
        },
      );
      markTaskComplete("profile");
      goToNextWorkspaceStep("profile");
    } finally {
      setIsSavingProfile(false);
    }
  }

  function handleLogoUpload(file: File) {
    if (organizationLogoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(organizationLogoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setOrganizationLogoPreviewUrl(previewUrl);
    setOrganizationLogoFile(file);
    setValue("organizationLogoName", file.name, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  async function handleUnitSubmit() {
    setIsSavingUnit(true);
    try {
      if (!(await validateFields(["unitName", "unitType"]))) return;
      if (!organizationId) {
        setGlobalError("Organization is missing. Please reload and try again.");
        return;
      }

      const resolvedUnitType =
        getValues("unitType") === "other"
          ? getValues("unitTypeOther").trim()
          : getValues("unitType");
      const payload = {
        name: getValues("unitName"),
        type: resolvedUnitType || null,
        description: getValues("unitDescription").trim() || null,
      };
      const result = unitId
        ? await updateOrganizationOnboardingUnit(organizationId, unitId, payload)
        : await createOrganizationOnboardingUnit(organizationId, payload);

      if (!result.success) {
        setGlobalError(result.message);
        return;
      }

      setUnitId(result.data.unit_id);
      setOnboardingUnits((current) => {
        const nextUnits = current.filter(
          (unit) => unit.unit_id !== result.data.unit_id,
        );
        return [result.data, ...nextUnits];
      });
      markTaskComplete("unit");
      goToNextWorkspaceStep("unit");
    } finally {
      setIsSavingUnit(false);
    }
  }

  async function handleInviteSubmit(
    invites: Array<{
      email: string;
      role: string;
      unitId?: string;
      audienceId?: string;
    }>,
  ) {
    setIsSendingInvite(true);
    try {
      if (!organizationId) {
        setGlobalError("Organization is missing. Please reload and try again.");
        return;
      }

      if (values.inviteEmail.trim() && !(await validateFields(["inviteEmail"]))) {
        return;
      }

      const normalizedInvites = invites
        .map((invite) => ({
          email: invite.email.trim(),
          role: invite.role.trim(),
          unitId: invite.unitId?.trim() ?? "",
          audienceId: invite.audienceId?.trim() ?? "",
        }))
        .filter((invite) => invite.email.length > 0);

      if (normalizedInvites.length === 0) {
        return;
      }

      const missingRoleInvite = normalizedInvites.find((invite) => !invite.role);
      if (missingRoleInvite) {
        setGlobalError("Please select a role for every invite.");
        return;
      }

      const missingUnitInvite = normalizedInvites.find((invite) => {
        return invite.role.toLowerCase().includes("unit") && !invite.unitId;
      });
      if (missingUnitInvite) {
        setGlobalError("Please select a unit for this admin invite.");
        return;
      }

      const missingAudienceInvite = normalizedInvites.find((invite) => {
        return invite.role.toLowerCase().includes("audience") && !invite.audienceId;
      });
      if (missingAudienceInvite) {
        setGlobalError("Please select an audience for this admin invite.");
        return;
      }

      const rolesResult =
        await getOrganizationOnboardingAdminInviteRoles(organizationId);
      if (!rolesResult.success) {
        setGlobalError(rolesResult.message);
        return;
      }

      const roleIdLookup = new Map(
        rolesResult.data.map((role) => [role.name.toLowerCase(), role.role_id]),
      );
      const createdInvites: OrganizationOnboardingAdminInvite[] = [];

      for (const invite of normalizedInvites) {
        const invitedRoleId = roleIdLookup.get(invite.role.toLowerCase());

        if (!invitedRoleId) {
          setGlobalError(`Unable to resolve role ID for ${invite.role}.`);
          return;
        }

        const result = await createOrganizationOnboardingAdminInvite(
          organizationId,
          {
            invited_email: invite.email,
            invited_role_id: invitedRoleId,
            invited_unit_id: invite.unitId ? Number(invite.unitId) : null,
            invited_audience_id: invite.audienceId ? Number(invite.audienceId) : null,
            expires_in_days: 7,
          },
        );

        if (!result.success) {
          setGlobalError(result.message);
          return;
        }

        createdInvites.push(result.data);
      }

      setAdminInvites((current) => [...createdInvites, ...current]);
      setValue("inviteEmail", "", { shouldDirty: false, shouldTouch: false });
      setValue("inviteUnitId", "", { shouldDirty: false, shouldTouch: false });
      setValue("inviteAudienceId", "", {
        shouldDirty: false,
        shouldTouch: false,
      });
      setGlobalError(null);
    } finally {
      setIsSendingInvite(false);
    }
  }

  function handleInviteContinue() {
    markTaskComplete("invite");
    goToNextWorkspaceStep("invite");
  }

  async function handleRevokeInvite(inviteId: number) {
    if (!organizationId) {
      setGlobalError("Organization is missing. Please reload and try again.");
      return;
    }

    setRevokingInviteId(inviteId);

    try {
      const result = await revokeOrganizationOnboardingAdminInvite(
        organizationId,
        inviteId,
      );

      if (!result.success) {
        setGlobalError(result.message);
        return;
      }

      setAdminInvites((current) =>
        current.filter((invite) => invite.invite_id !== inviteId),
      );
    } finally {
      setRevokingInviteId(null);
    }
  }

  async function persistAudience(options?: { advance?: boolean }) {
    const shouldAdvance = Boolean(options?.advance);
    if (shouldAdvance) {
      setIsContinuingAudience(true);
    } else {
      setIsSavingAudience(true);
    }
    setGlobalError(null);
    try {
      if (
        !(await validateFields([
          "audienceGroupName",
          "audienceType",
          "audienceUnitId",
          "audienceIdentifier",
        ]))
      ) {
        return;
      }
      if (!organizationId) {
        setGlobalError("Organization is missing. Please reload and try again.");
        return;
      }

      const payload = {
        name: getValues("audienceGroupName"),
        audience_type: getValues("audienceType"),
        unit_id: Number(getValues("audienceUnitId")),
        description: null,
        expected_member_count: members.length > 0 ? members.length : null,
        metadata: {
          attendance_identifier: getValues("audienceIdentifier"),
        },
      };

      const result = audienceId
        ? await updateOrganizationOnboardingAudience(
            organizationId,
            audienceId,
            payload,
          )
        : await createOrganizationOnboardingAudience(organizationId, payload);

      if (!result.success) {
        setGlobalError(result.message);
        return;
      }

      setAudienceId(result.data.audience_id);
      setOnboardingAudiences((current) => {
        const nextAudiences = current.filter(
          (audience) => audience.audience_id !== result.data.audience_id,
        );
        return [result.data, ...nextAudiences];
      });

      const manualMembers = members.filter((member) => member.source !== "import");
      if (manualMembers.length > 0) {
        const addMembersResult = await addOrganizationOnboardingAudienceMembers(
          organizationId,
          result.data.audience_id,
          {
            members: manualMembers.map((member) => ({
              first_name: member.firstName,
              last_name: member.surname,
              email: member.email,
              identifier: member.identifier,
            })),
          },
        );

        if (!addMembersResult.success) {
          setGlobalError(`Audience saved, but members were not added: ${addMembersResult.message}`);
          return;
        }
      }

      if (
        audienceImportFile &&
        members.some((member) => member.source === "import")
      ) {
        const importMembersResult =
          await importOrganizationOnboardingAudienceMembers(
            organizationId,
            result.data.audience_id,
            audienceImportFile,
          );

        if (!importMembersResult.success) {
          setGlobalError(`Audience saved, but members were not imported: ${importMembersResult.message}`);
          return;
        }
      }

      markTaskComplete("audience");
      if (shouldAdvance) {
        goToNextWorkspaceStep("audience");
      }
    } finally {
      if (shouldAdvance) {
        setIsContinuingAudience(false);
      } else {
        setIsSavingAudience(false);
      }
    }
  }

  async function handleSaveAudience() {
    await persistAudience();
  }

  async function handleAudienceContinue() {
    await persistAudience({ advance: true });
  }

  function handleManualFieldChange(
    field: "manualFirstName" | "manualSurname" | "manualEmail" | "manualIdentifier",
    value: string,
  ) {
    if (field === "manualFirstName") setManualFirstName(value);
    if (field === "manualSurname") setManualSurname(value);
    if (field === "manualEmail") setManualEmail(value);
    if (field === "manualIdentifier") setManualIdentifier(value);
  }

  function resetManualFields() {
    setManualFirstName("");
    setManualSurname("");
    setManualEmail("");
    setManualIdentifier("");
  }

  function addManualMember() {
    if (
      !manualFirstName.trim() ||
      !manualSurname.trim() ||
      !manualEmail.trim() ||
      !manualIdentifier.trim()
    )
      return;
    setMembers((current) => [
      ...current,
      {
        id: `member-${current.length + 1}`,
        firstName: manualFirstName,
        surname: manualSurname,
        email: manualEmail,
        identifier: manualIdentifier,
        status: manualEmail ? "Pending Invite" : "Added",
        source: "manual",
      },
    ]);
    resetManualFields();
  }

  function acceptImportedMembers() {
    setMembers((current) => [
      ...current,
      ...importedPreviewMembers.map((member, index) => ({
        id: member.id,
        firstName: member.firstName,
        surname: member.surname,
        email: member.email,
        identifier: member.identifier || `IMPORT-${current.length + index + 1}`,
        status: member.status,
        source: "import" as const,
      })),
    ]);
    setShowImportReviewModal(false);
    setImportedPreviewMembers([]);
  }

  async function handleImportAudienceFile(file: File) {
    if (file.name.toLowerCase().endsWith(".xlsx")) {
      setAudienceImportFile(file);
      setImportedPreviewMembers([
        {
          id: `imported-file-${Date.now()}`,
          firstName: file.name,
          surname: "",
          email: "",
          identifier: "",
          status: "Added",
          action: "Ready to import",
        },
      ]);
      return;
    }

    const importedMembers = await parseAudienceImportCsv(file);

    setAudienceImportFile(file);
    setImportedPreviewMembers(importedMembers);
  }

  async function handleLaunchOrganization() {
    if (!organizationId) {
      setLaunchError("Organization is missing. Please reload and try again.");
      return;
    }

    setIsLaunchingOrganization(true);
    setLaunchError(null);

    try {
      const result = await launchOrganizationOnboarding(organizationId, {
        metadata: {
          completed_tasks: completedTasks,
        },
        reason: "Completed organization onboarding flow.",
      });

      if (!result.success) {
        setLaunchError(result.message);
        return;
      }

      setLaunchChecklist(result.data.launch_summary);
      setCompletedTasks(["profile", "unit", "invite", "audience"]);
    } finally {
      setIsLaunchingOrganization(false);
    }
  }

  async function handleReviewContinue() {
    if (!organizationId) {
      setReviewError("Organization is missing. Please reload and try again.");
      return;
    }

    setIsCompletingReview(true);
    setReviewError(null);

    try {
      const result = await completeOrganizationOnboardingStep(
        organizationId,
        "review_details",
        {
          metadata: {
            checked: true,
            source: "review_screen",
          },
          reason: "Reviewed onboarding details.",
        },
      );

      if (!result.success) {
        setReviewError(result.message);
        return;
      }

      goToNextWorkspaceStep("review");
    } finally {
      setIsCompletingReview(false);
    }
  }

  function renderWorkspaceStep() {
    const welcomeResumeTask = resolveWelcomeResumeTask(
      currentStep,
      completedTasks,
    );

    switch (activeStep.id) {
      case "welcome":
        return (
          <WelcomeChecklistStep
            activeTaskId={welcomeResumeTask}
            completedTaskIds={completedTasks}
            onStartTask={(taskId) => leaveWorkspaceWelcome(taskStepMap[taskId])}
            onContinue={() =>
              leaveWorkspaceWelcome(taskStepMap[welcomeResumeTask])
            }
            organizationName={workspaceOrganizationName || values.organisationName}
          />
        );
      case "profile":
        return (
          <OrganisationDetailsStep
            control={control}
            register={register}
            errors={errors}
            values={values}
            onSubmit={handleProfileSubmit}
            onSkip={goToWelcomeScreen}
            onUploadLogo={handleLogoUpload}
            logoPreviewUrl={organizationLogoPreviewUrl}
            isSaving={isSavingProfile}
            organizationTypeOptions={organizationTypeOptions}
            industrySectorOptions={industrySectorOptions}
            attendanceIdentifierOptions={attendanceIdentifierOptions}
            isReferenceDataLoading={isReferenceDataLoading}
          />
        );
      case "unit":
        return (
          <UnitSetupStep
            control={control}
            register={register}
            errors={errors}
            onSubmit={handleUnitSubmit}
            onSkip={goToWelcomeScreen}
            isSaving={isSavingUnit}
            unitTypeOptions={unitTypeOptions}
            isReferenceDataLoading={isReferenceDataLoading}
          />
        );
      case "invite":
        return (
          <InviteAdminsStep
            control={control}
            register={register}
            errors={errors}
            onSendInvite={handleInviteSubmit}
            onContinue={handleInviteContinue}
            onSkip={goToWelcomeScreen}
            isSendingInvite={isSendingInvite}
            roleOptions={inviteRoleOptions}
            isRoleOptionsLoading={!hasLoadedInviteData}
            unitOptions={inviteUnitOptions}
            audienceOptions={inviteAudienceOptions}
            existingInvites={adminInvites}
            onRevokeInvite={handleRevokeInvite}
            revokingInviteId={revokingInviteId}
          />
        );
      case "audience":
        return (
          <CreateAudienceStep
            control={control}
            register={register}
            errors={errors}
            members={members}
              importedMembers={importedPreviewMembers}
              onOpenManual={() => setShowManualModal(true)}
              onOpenImport={() => setShowImportModal(true)}
              onBack={() => setCurrentStep("invite")}
              onSave={() => {
                void handleSaveAudience();
              }}
              onSkipAudiencePeople={handleAudienceContinue}
              onRemoveMember={(id) =>
                setMembers((current) =>
                  current.filter((member) => member.id !== id),
                )
              }
              onContinue={handleAudienceContinue}
              isSaving={isSavingAudience}
              isContinuing={isContinuingAudience}
            showManualModal={showManualModal}
            showImportModal={showImportModal}
            showImportReviewModal={showImportReviewModal}
            manualFirstName={manualFirstName}
            manualSurname={manualSurname}
            manualEmail={manualEmail}
            manualIdentifier={manualIdentifier}
            onManualFieldChange={handleManualFieldChange}
            onAddManualMember={addManualMember}
            onCloseManualModal={() => {
              setShowManualModal(false);
              resetManualFields();
            }}
            onSaveManualModal={() => setShowManualModal(false)}
            onCloseImportModal={() => setShowImportModal(false)}
            onImportFile={(file) => {
              void handleImportAudienceFile(file);
            }}
            onContinueImportModal={() => {
              setShowImportModal(false);
              setShowImportReviewModal(true);
            }}
            onCloseImportReviewModal={() => setShowImportReviewModal(false)}
            onAcceptImportReview={() => {
              setIsImportingAudience(true);
              try {
                acceptImportedMembers();
              } finally {
                setIsImportingAudience(false);
              }
            }}
            onSkipImportInvites={acceptImportedMembers}
            isImporting={isImportingAudience}
            unitOptions={inviteUnitOptions}
            audienceTypeOptions={audienceTypeOptions}
            attendanceIdentifierOptions={attendanceIdentifierOptions}
            isReferenceDataLoading={isReferenceDataLoading}
          />
        );
      case "review":
        return (
          <ReviewDetailsStep
            review={reviewPayload}
            isLoading={isLoadingReview}
            isCompleting={isCompletingReview}
            error={reviewError}
            onBack={() => setCurrentStep("audience")}
            onContinue={handleReviewContinue}
          />
        );
      case "complete":
        return (
          <CompletionStep
            checklist={launchChecklist}
            isLoadingChecklist={isLoadingLaunchChecklist}
            isLaunching={isLaunchingOrganization}
            launchError={launchError}
            onBack={() => setCurrentStep("review")}
            onLaunch={handleLaunchOrganization}
          />
        );
    }
  }

  if (hasRestoredStoredState && !organizationId) {
    return (
      <OnboardingShell>
        <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-secondary">
            Your onboarding session could not be restored
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in again or create a new organization account to continue your
            workspace onboarding.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={buildTenantSignInUrl()}
              className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b]"
            >
              Go to sign in
            </a>
            <a
              href="/create-account"
              className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full border border-border bg-card px-6 py-4 text-sm font-semibold text-primary transition hover:border-primary hover:text-primary"
            >
              Create organisation
            </a>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      {renderWorkspaceStep()}
      {globalError ? (
        <div className="mx-auto mt-6 max-w-240">
          <FormError message={globalError} />
        </div>
      ) : null}
    </OnboardingShell>
  );
}
