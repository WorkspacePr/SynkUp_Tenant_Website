import type { Metadata } from "next";

import { OnboardingFlow } from "@/features/onboarding/components/OnboardingFlow";

export const metadata: Metadata = {
  title: "Create Organisation | SynkUp",
  description: "Create your SynkUp organization account.",
};

export default function CreateAccountPage() {
  return <OnboardingFlow />;
}
