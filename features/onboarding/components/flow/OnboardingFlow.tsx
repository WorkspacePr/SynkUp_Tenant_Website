"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { OnboardingShell } from "@/components/layout/OnboardingShell";
import { CompletionStep } from "@/features/onboarding/components/steps/completion/CompletionStep";
import {
  CreationAdminStep,
  CreationOrganisationStep,
  CreationReviewStep,
  CreationShell,
  CreationVerifyStep,
  type CreationStepId,
} from "@/features/onboarding/components/creation-flow";
import { CreateAudienceStep } from "@/features/onboarding/components/steps/audience/CreateAudienceStep";
import { InviteAdminsStep } from "@/features/onboarding/components/steps/invite/InviteAdminsStep";
import { OrganisationDetailsStep } from "@/features/onboarding/components/steps/profile/OrganisationDetailsStep";
import { ReviewDetailsStep } from "@/features/onboarding/components/steps/review/ReviewDetailsStep";
import { UnitSetupStep } from "@/features/onboarding/components/steps/unit/UnitSetupStep";
import { WelcomeChecklistStep } from "@/features/onboarding/components/steps/welcome/WelcomeChecklistStep";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icons";
import type { SelectOption } from "@/components/ui/Select";
import {
  ONBOARDING_ACCESS_TOKEN_STORAGE_KEY,
  ONBOARDING_REFRESH_TOKEN_STORAGE_KEY,
  ONBOARDING_STATE_STORAGE_KEY,
  buildTenantSignInUrl,
  readTenantLoginContext,
  storeOnboardingTokens,
  storeTenantLoginContext,
} from "@/lib/auth/tenant-session";
import { onboardingSteps } from "@/features/onboarding/constants/onboarding-steps";
import { defaultValues, taskStepMap, type WorkspaceTaskId } from "./config";
import {
  mapBackendStepToCurrentStep,
  mapCompletedTasks,
  resolveSelectValue,
  resolveWelcomeResumeTask,
} from "./helpers";
import {
  createOrganizationOnboardingAudience,
  createOrganizationOnboardingAdminInvite,
  createOrganizationOnboardingUnit,
  createOrganisation,
  addOrganizationOnboardingAudienceMembers,
  completeOrganizationOnboardingStep,
  getReferenceData,
  getOrganizationOnboardingAudiences,
  getOrganizationOnboardingAdminInviteRoles,
  getOrganizationOnboardingAdminInvites,
  getOrganizationOnboardingLaunchChecklist,
  getOrganizationOnboardingProfile,
  getOrganizationOnboardingReview,
  getOrganizationOnboardingStatus,
  getOrganizationOnboardingUnits,
  getSubdomainAvailability,
  importOrganizationOnboardingAudienceMembers,
  launchOrganizationOnboarding,
  revokeOrganizationOnboardingAdminInvite,
  resendRegistrationVerificationCode,
  sendRegistrationVerificationCode,
  updateOrganizationOnboardingAudience,
  updateOrganizationOnboardingUnit,
  updateOrganizationOnboardingProfile,
  validateOrganisationIdentity,
  verifyAdminCode,
} from "@/features/onboarding/api/tenant-onboarding";
import { tenantOnboardingSchema } from "@/features/onboarding/validations/tenant-onboarding.schema";
import { parseAudienceImportCsv } from "@/features/onboarding/utils/audience-import";
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

interface OnboardingFlowProps {
  mode?: "full" | "workspace";
}

export function OnboardingFlow({
  mode = "full",
}: OnboardingFlowProps = {}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"creation" | "workspace">(
    mode === "workspace" ? "workspace" : "creation",
  );
  const [creationStep, setCreationStep] =
    useState<CreationStepId>("organisation");
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>("welcome");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [hasRestoredStoredState, setHasRestoredStoredState] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<WorkspaceTaskId[]>([]);
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
  const [audienceImportFile, setAudienceImportFile] = useState<File | null>(
    null,
  );
  const [verificationToken, setVerificationToken] = useState("");

  function goToDashboard() {
    router.push("/dashboard");
  }
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [unitId, setUnitId] = useState<number | null>(null);
  const [audienceId, setAudienceId] = useState<number | null>(null);
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
  const [resendCounter, setResendCounter] = useState(54);
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
  const [hasLoadedOrganizationProfile, setHasLoadedOrganizationProfile] = useState(false);
  const [hasLoadedInviteData, setHasLoadedInviteData] = useState(false);
  const [forceWorkspaceWelcome, setForceWorkspaceWelcome] = useState(false);
  const [subdomainAvailabilityResult, setSubdomainAvailabilityResult] =
    useState<{
      subdomain: string;
      available: boolean;
    } | null>(null);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const [isCreationActionLoading, setIsCreationActionLoading] = useState(false);
  const [isCreatingOrganisation, setIsCreatingOrganisation] = useState(false);
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
    setError,
    formState: { errors },
    getValues,
    reset,
  } = form;

  const values = (useWatch({ control }) ??
    defaultValues) as OnboardingFormValues;
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
  const effectiveCurrentStep =
    phase === "workspace" && forceWorkspaceWelcome ? "welcome" : currentStep;
  const activeStep = useMemo(
    () =>
      onboardingSteps.find((step) => step.id === effectiveCurrentStep) ??
      onboardingSteps[0],
    [effectiveCurrentStep],
  );
  const normalizedCreationSubdomain = values.subdomain.trim().toLowerCase();
  const canCheckSubdomain =
    phase === "creation" && creationStep === "organisation";
  const subdomainHasValidFormat =
    normalizedCreationSubdomain.length >= 3 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedCreationSubdomain);
  const isCheckingSubdomain =
    canCheckSubdomain &&
    subdomainHasValidFormat &&
    subdomainAvailabilityResult?.subdomain !== normalizedCreationSubdomain;
  const {
    label: subdomainAvailabilityLabel,
    tone: subdomainAvailabilityTone,
  } = useMemo(() => {
    if (!canCheckSubdomain || !normalizedCreationSubdomain) {
      return { label: "Enter subdomain", tone: "neutral" as const };
    }

    if (normalizedCreationSubdomain.length < 3) {
      return { label: "Too short", tone: "error" as const };
    }

    if (!subdomainHasValidFormat) {
      return { label: "Invalid format", tone: "error" as const };
    }

    if (subdomainAvailabilityResult?.subdomain === normalizedCreationSubdomain) {
      return {
        label: subdomainAvailabilityResult.available ? "Available" : "Unavailable",
        tone: subdomainAvailabilityResult.available ? ("success" as const) : ("error" as const),
      };
    }

    return { label: "Checking...", tone: "neutral" as const };
  }, [
    canCheckSubdomain,
    normalizedCreationSubdomain,
    subdomainAvailabilityResult,
    subdomainHasValidFormat,
  ]);

  useEffect(() => {
    const storedValue = window.sessionStorage.getItem(
      ONBOARDING_STATE_STORAGE_KEY,
    );
    if (!storedValue) {
      const loginContext =
        mode === "workspace" ? readTenantLoginContext() : null;

      if (mode === "workspace" && loginContext?.organizationId) {
        const timeout = window.setTimeout(() => {
          setPhase("workspace");
          setOrganizationId(loginContext.organizationId ?? null);
          if (loginContext.subdomain) {
            setValue("subdomain", loginContext.subdomain, {
              shouldDirty: false,
              shouldTouch: false,
            });
          }
          if (loginContext.email) {
            setValue("email", loginContext.email, {
              shouldDirty: false,
              shouldTouch: false,
            });
          }
          setHasRestoredStoredState(true);
        }, 0);

        return () => window.clearTimeout(timeout);
      }

      const timeout = window.setTimeout(() => {
        setHasRestoredStoredState(true);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    let restoreReadyTimeout: number | null = null;

    try {
      const parsed = JSON.parse(storedValue) as Partial<{
        phase: "creation" | "workspace";
        creationStep: CreationStepId;
        currentStep: OnboardingStepId;
        organizationId: number | null;
        unitId: number | null;
        audienceId: number | null;
        verificationToken: string;
        workspaceOrganizationName: string;
        forceWorkspaceWelcome: boolean;
        completedTasks: Array<"profile" | "unit" | "invite" | "audience">;
        values: Partial<OnboardingFormValues>;
      }>;
      const loginContext =
        mode === "workspace" ? readTenantLoginContext() : null;
      const resolvedOrganizationId =
        typeof parsed.organizationId === "number"
          ? parsed.organizationId
          : loginContext?.organizationId ?? null;

      if (mode === "workspace" && parsed.phase === "creation") {
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
        if (parsed.phase) setPhase(parsed.phase);
        if (parsed.creationStep) setCreationStep(parsed.creationStep);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        if (typeof resolvedOrganizationId === "number") {
          setOrganizationId(resolvedOrganizationId);
        }
        if (typeof parsed.unitId === "number") setUnitId(parsed.unitId);
        if (typeof parsed.audienceId === "number")
          setAudienceId(parsed.audienceId);
        if (typeof parsed.verificationToken === "string")
          setVerificationToken(parsed.verificationToken);
        if (typeof parsed.workspaceOrganizationName === "string") {
          setWorkspaceOrganizationName(parsed.workspaceOrganizationName);
        } else if (loginContext?.subdomain) {
          setWorkspaceOrganizationName(loginContext.subdomain);
        }
        if (loginContext?.subdomain) {
          setValue("subdomain", loginContext.subdomain, {
            shouldDirty: false,
            shouldTouch: false,
          });
        }
        if (loginContext?.email) {
          setValue("email", loginContext.email, {
            shouldDirty: false,
            shouldTouch: false,
          });
        }
        if (typeof parsed.forceWorkspaceWelcome === "boolean") {
          setForceWorkspaceWelcome(parsed.forceWorkspaceWelcome);
        }
        if (Array.isArray(parsed.completedTasks))
          setCompletedTasks(parsed.completedTasks);
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
  }, [mode, reset]);

  useEffect(() => {
    if (!hasRestoredStoredState) {
      return;
    }

    if (phase === "creation" && !organizationId) {
      window.sessionStorage.removeItem(ONBOARDING_ACCESS_TOKEN_STORAGE_KEY);
      window.sessionStorage.removeItem(ONBOARDING_REFRESH_TOKEN_STORAGE_KEY);
    }
  }, [hasRestoredStoredState, organizationId, phase]);

  useEffect(() => {
    if (!hasRestoredStoredState) {
      return;
    }

    const snapshot = {
      phase,
      creationStep,
      currentStep,
      organizationId,
      unitId,
      audienceId,
      verificationToken,
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
    creationStep,
    currentStep,
    organizationId,
    unitId,
    audienceId,
    phase,
    forceWorkspaceWelcome,
    hasRestoredStoredState,
    values,
    verificationToken,
    workspaceOrganizationName,
  ]);

  useEffect(() => {
    if (phase !== "workspace" || !organizationId) {
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
  }, [forceWorkspaceWelcome, organizationId, phase]);

  useEffect(() => {
    if (effectiveCurrentStep !== "complete" || !organizationId) {
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
  }, [effectiveCurrentStep, organizationId]);

  useEffect(() => {
    if (effectiveCurrentStep !== "review" || !organizationId) {
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
  }, [effectiveCurrentStep, organizationId]);

  useEffect(() => {
    if (
      phase !== "workspace" ||
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
          setGlobalError(result.message ?? "Unable to load organization profile right now.");
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
      setValue("organisationType", resolvedOrganizationType || getValues("organisationType"), {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue("industrySector", resolvedIndustrySector || getValues("industrySector"), {
        shouldDirty: false,
        shouldTouch: false,
      });
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
    organizationId,
    organizationTypeOptions,
    phase,
    setValue,
    isReferenceDataLoading,
    workspaceOrganizationName,
  ]);

  useEffect(() => {
    if (
      phase !== "workspace" ||
      currentStep !== "invite" ||
      !organizationId ||
      hasLoadedInviteData
    ) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const [rolesResult, invitesResult, unitsResult, audiencesResult] =
        await Promise.all([
          getOrganizationOnboardingAdminInviteRoles(organizationId),
          getOrganizationOnboardingAdminInvites(organizationId),
          getOrganizationOnboardingUnits(organizationId),
          getOrganizationOnboardingAudiences(organizationId),
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

      if (audiencesResult.success) {
        setOnboardingAudiences(audiencesResult.data.results);
      }

      setHasLoadedInviteData(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    currentStep,
    getValues,
    hasLoadedInviteData,
    organizationId,
    phase,
    setValue,
  ]);

  useEffect(() => {
    if (
      phase !== "workspace" ||
      currentStep !== "audience" ||
      !organizationId
    ) {
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
  }, [audienceId, currentStep, getValues, organizationId, phase, setValue]);

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
    if (!canCheckSubdomain || !subdomainHasValidFormat) {
      return;
    }

    let cancelled = false;

    const timeout = window.setTimeout(() => {
      void (async () => {
        const result = await getSubdomainAvailability(normalizedCreationSubdomain);
        if (cancelled) return;
        setSubdomainAvailabilityResult({
          subdomain: normalizedCreationSubdomain,
          available: result.available,
        });
      })();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [canCheckSubdomain, normalizedCreationSubdomain, subdomainHasValidFormat]);

  useEffect(() => {
    if (
      phase !== "creation" ||
      creationStep !== "verify" ||
      resendCounter === 0
    )
      return;
    const interval = window.setInterval(() => {
      setResendCounter((counter) => (counter <= 1 ? 0 : counter - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [creationStep, phase, resendCounter]);

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

  async function handleCreationContinue() {
    setGlobalError(null);
    setIsCreationActionLoading(true);

    try {
      if (creationStep === "organisation") {
        if (
          !(await validateFields([
            "organisationName",
            "organisationType",
            "industrySector",
            "subdomain",
          ]))
        )
          return;
        const result = await validateOrganisationIdentity(
          getValues("subdomain"),
        );
        if (!result.success) {
          setError(result.field, { message: result.message });
          setGlobalError(result.message);
          return;
        }
        setCreationStep("admin");
        return;
      }

      if (creationStep === "admin") {
        if (
          !(await validateFields([
            "firstName",
            "surname",
            "email",
            "password",
            "confirmPassword",
          ]))
        )
          return;
        const composedFullName =
          `${getValues("firstName").trim()} ${getValues("surname").trim()}`.trim();
        setValue("fullName", composedFullName, { shouldValidate: true });
        const result = await sendRegistrationVerificationCode({
          email: getValues("email"),
          organizationName: getValues("organisationName"),
          subdomain: getValues("subdomain"),
        });
        if (!result.success) {
          setGlobalError(result.message);
          return;
        }
        setResendCounter(54);
        setCreationStep("verify");
        return;
      }

      if (creationStep === "verify") {
        if (!(await validateFields(["verificationCode"]))) return;
        const result = await verifyAdminCode(
          getValues("email"),
          getValues("verificationCode"),
        );
        if (!result.success) {
          setError("verificationCode", { message: result.message });
          setGlobalError(result.message);
          return;
        }
        setVerificationToken(result.verificationToken);
        setCreationStep("review");
        return;
      }
    } finally {
      setIsCreationActionLoading(false);
    }
  }

  async function handleCreateOrganisation() {
    setGlobalError(null);
    const composedFullName =
      `${getValues("firstName").trim()} ${getValues("surname").trim()}`.trim();
    setValue("fullName", composedFullName, { shouldValidate: true });
    if (
      !(await validateFields([
        "organisationName",
        "organisationType",
        "industrySector",
        "subdomain",
        "firstName",
        "surname",
        "fullName",
        "email",
        "password",
        "confirmPassword",
        "verificationCode",
      ]))
    ) {
      return;
    }

    setIsCreatingOrganisation(true);

    try {
      if (!verificationToken) {
        setGlobalError(
          "Verification token is missing. Please verify your code again.",
        );
        return;
      }

      const result = await createOrganisation({
        name: getValues("organisationName"),
        official_email: getValues("email"),
        organization_type: getValues("organisationType"),
        industry_sector: getValues("industrySector"),
        country: "Nigeria",
        subdomain: getValues("subdomain"),
        first_name: getValues("firstName"),
        last_name: getValues("surname"),
        email: getValues("email"),
        password: getValues("password"),
        password_confirm: getValues("confirmPassword"),
        verification_token: verificationToken,
      });
      if (!result.success) {
        setGlobalError(result.message);
        return;
      }
      if (result.accessToken) {
        storeOnboardingTokens({
          access: result.accessToken,
          refresh: result.refreshToken,
        });
      } else {
        storeOnboardingTokens({});
      }
      storeTenantLoginContext({
        organizationId: result.organizationId ?? undefined,
        subdomain: getValues("subdomain"),
        email: getValues("email"),
        redirectTo: "/onboarding",
        resumeTarget: "onboarding",
      });
      setCompletedTasks([]);
      setHasLoadedOrganizationProfile(false);
      setHasLoadedInviteData(false);
      setAdminInvites([]);
      setInviteRoleOptions([]);
      setOnboardingUnits([]);
      setOnboardingAudiences([]);
      setForceWorkspaceWelcome(true);
      setUnitId(null);
      setAudienceId(null);
      if (result.organizationId) {
        setOrganizationId(result.organizationId);
      }
      setWorkspaceOrganizationName(getValues("organisationName"));
      window.sessionStorage.setItem(
        ONBOARDING_STATE_STORAGE_KEY,
        JSON.stringify({
          phase: "workspace",
          currentStep: "welcome",
          organizationId: result.organizationId ?? null,
          unitId: null,
          workspaceOrganizationName: getValues("organisationName"),
          forceWorkspaceWelcome: true,
          completedTasks: [],
          values: getValues(),
        }),
      );
      router.push("/onboarding");
    } finally {
      setIsCreatingOrganisation(false);
    }
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
      )
        return;
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
      setValue("organizationDisplayName", result.data.name ?? getValues("organizationDisplayName"), {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue("organizationType", resolvedOrganizationType || getValues("organizationType"), {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue("industrySector", resolvedIndustrySector || getValues("industrySector"), {
        shouldDirty: false,
        shouldTouch: false,
      });
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
      )
        return;
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
        reason: "Completed public onboarding flow.",
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

  function renderCreationStep() {
    switch (creationStep) {
      case "organisation":
        return (
          <CreationOrganisationStep
            register={register}
            control={control}
            errors={errors}
            subdomain={values.subdomain}
            organizationTypeOptions={organizationTypeOptions}
            industrySectorOptions={industrySectorOptions}
            subdomainAvailabilityLabel={subdomainAvailabilityLabel}
            subdomainAvailabilityTone={subdomainAvailabilityTone}
          />
        );
      case "admin":
        return (
          <CreationAdminStep
            register={register}
            control={control}
            errors={errors}
            passwordValue={values.password}
          />
        );
      case "verify":
        return (
          <CreationVerifyStep
            register={register}
            control={control}
            errors={errors}
            email={values.email}
            verificationCode={values.verificationCode}
            resendCounter={resendCounter}
            canResend={resendCounter === 0}
            onResend={() => {
              void (async () => {
                setIsResendingCode(true);
                try {
                  const result = await resendRegistrationVerificationCode({
                    email: getValues("email"),
                    organizationName: getValues("organisationName"),
                    subdomain: getValues("subdomain"),
                  });
                  if (!result.success) {
                    setGlobalError(result.message);
                    return;
                  }
                  setResendCounter(54);
                } finally {
                  setIsResendingCode(false);
                }
              })();
            }}
            onBack={() => setCreationStep("admin")}
            onContinue={() => {
              void handleCreationContinue();
            }}
            isContinuing={isCreationActionLoading}
            isResending={isResendingCode}
          />
        );
      case "review":
        return (
          <CreationReviewStep
            organisationName={values.organisationName}
            organisationType={values.organisationType}
            industrySector={values.industrySector}
            fullName={values.fullName}
            email={values.email}
            subdomain={values.subdomain}
            onEdit={(step) => setCreationStep(step)}
            onCreate={() => {
              void handleCreateOrganisation();
            }}
            isSubmitting={isCreatingOrganisation}
          />
        );
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
            onStartTask={(taskId) =>
              leaveWorkspaceWelcome(taskStepMap[taskId])
            }
            onContinue={() =>
              leaveWorkspaceWelcome(taskStepMap[welcomeResumeTask])
            }
            onGoToDashboard={goToDashboard}
            organizationName={
              workspaceOrganizationName || values.organisationName
            }
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
            onGoToDashboard={goToDashboard}
          />
        );
    }
  }

  if (mode === "workspace" && hasRestoredStoredState && !organizationId) {
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

  if (phase === "creation") {
    const isOrganisationContinueDisabled =
      creationStep === "organisation" &&
      (isCheckingSubdomain || subdomainAvailabilityTone !== "success");

    return (
      <CreationShell step={creationStep}>
        {renderCreationStep()}
        {globalError ? (
          <FormError className="mt-5" message={globalError} />
        ) : null}
        {creationStep !== "verify" && creationStep !== "review" ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {creationStep !== "organisation" ? (
              <Button
                variant="outline"
                className="flex-1"
                disabled={isCreationActionLoading}
                onClick={() =>
                  setCreationStep((current) =>
                    current === "admin" ? "organisation" : current,
                  )
                }
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
            ) : null}
            <Button
              type="button"
              className="flex-1 gap-3"
              disabled={isOrganisationContinueDisabled}
              loading={isCreationActionLoading}
              onClick={handleCreationContinue}
            >
              {creationStep === "organisation"
                ? "Continue to Admin Details"
                : creationStep === "admin"
                  ? "Verify Account"
                  : "Continue"}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </CreationShell>
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
