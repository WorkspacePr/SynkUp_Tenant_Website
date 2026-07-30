import type { SelectOption } from "@/components/ui/Select";
import type { OnboardingStepId, OrganizationOnboardingStatus } from "@/types/onboarding";

import type { WorkspaceTaskId } from "./config";

export function resolveWelcomeResumeTask(
  currentStep: OnboardingStepId,
  completedTasks: WorkspaceTaskId[],
) {
  if (
    currentStep === "profile" ||
    currentStep === "unit" ||
    currentStep === "invite" ||
    currentStep === "audience"
  ) {
    return currentStep;
  }

  const orderedTasks: WorkspaceTaskId[] = [
    "profile",
    "unit",
    "invite",
    "audience",
  ];

  return orderedTasks.find((task) => !completedTasks.includes(task)) ?? "audience";
}

export function mapBackendStepToCurrentStep(
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

export function mapCompletedTasks(status: OrganizationOnboardingStatus) {
  const completed = new Set<WorkspaceTaskId>();

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

export function resolveSelectValue(
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
