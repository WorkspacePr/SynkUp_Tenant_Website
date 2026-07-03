import type { OnboardingStepDefinition } from "@/types/onboarding";

export const onboardingSteps: OnboardingStepDefinition[] = [
  {
    id: "welcome",
    title: "Welcome to SynkUp",
    subtitle:
      "Your workspace is ready. Complete a few essentials to launch your organization's attendance system.",
    cta: "Continue Setup",
  },
  {
    id: "profile",
    title: "Complete organization profile",
    subtitle:
      "These details help personalize your workspace and attendance reports.",
    cta: "Save & Continue",
  },
  {
    id: "unit",
    title: "Create your first unit",
    subtitle:
      "Units help you organize attendance by department, class, branch, group, or event category.",
    cta: "Create Unit",
  },
  {
    id: "invite",
    title: "Invite admins",
    subtitle:
      "Invite people to help manage your organization's attendance system.",
    cta: "Send Invite",
  },
  {
    id: "audience",
    title: "Who will you track attendance for?",
    subtitle:
      "Set up your first group of people. You can add members now, import a list, or do this later.",
    cta: "Continue to Launch",
  },
  {
    id: "review",
    title: "Review workspace details",
    subtitle:
      "Confirm your onboarding details before launching the organization.",
    cta: "Confirm Review",
  },
  {
    id: "complete",
    title: "Your SynkUp workspace is ready",
    subtitle:
      "You've completed the essentials. You can now start managing attendance, creating sessions, and viewing reports.",
    cta: "Go to Dashboard",
  },
];
