import type { Metadata } from "next";

import { OnboardingPlanPage } from "@/features/onboarding/components/OnboardingPlanPage";

export const metadata: Metadata = {
  title: "Choose a Plan | SynkUp",
  description: "Select a subscription plan for your SynkUp organization.",
};

export default function OnboardingPlanRoute() {
  return <OnboardingPlanPage />;
}
