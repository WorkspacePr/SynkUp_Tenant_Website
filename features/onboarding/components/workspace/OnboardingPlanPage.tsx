"use client";

import { useState } from "react";

import {
  CreationPlanStep,
  CreationShell,
} from "@/features/onboarding/components/creation-flow";
import type { PlanId } from "@/types/onboarding";

export function OnboardingPlanPage() {
  const [planId, setPlanId] = useState<PlanId | "">("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  return (
    <CreationShell step="plan">
      <CreationPlanStep
        value={planId}
        onChange={setPlanId}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        onContinue={() => undefined}
      />
    </CreationShell>
  );
}
