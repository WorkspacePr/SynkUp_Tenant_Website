import type { Metadata } from "next";

import { WorkspaceOnboardingFlow } from "@/features/onboarding/components/workspace/WorkspaceOnboardingFlow";

export const metadata: Metadata = {
  title: "SynkUp Tenant Onboarding",
  description: "Organisation onboarding flow for the SynkUp tenant dashboard.",
};

export default function OnboardingPage() {
  return <WorkspaceOnboardingFlow />;
}
