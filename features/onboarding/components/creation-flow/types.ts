"use client";

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";

import type { OnboardingFormValues } from "@/types/onboarding";

export type CreationStepId =
  | "organisation"
  | "admin"
  | "verify"
  | "plan"
  | "review";

export interface CreationSharedProps {
  register: UseFormRegister<OnboardingFormValues>;
  control: Control<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
}
