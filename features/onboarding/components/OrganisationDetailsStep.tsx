"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { Controller } from "react-hook-form";
import type { ChangeEvent } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { CameraIcon } from "@/components/ui/OnboardingIcons";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import type { OnboardingFormValues } from "@/types/onboarding";

interface OrganisationDetailsStepProps {
  control: Control<OnboardingFormValues>;
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  values: OnboardingFormValues;
  onSubmit: () => void;
  onSkip: () => void;
  onUploadLogo: (file: File) => void;
  logoPreviewUrl?: string;
  isSaving?: boolean;
  organizationTypeOptions: SelectOption[];
  industrySectorOptions: SelectOption[];
  attendanceIdentifierOptions: SelectOption[];
  isReferenceDataLoading?: boolean;
}

export function OrganisationDetailsStep({
  control,
  register,
  errors,
  values,
  onSubmit,
  onSkip,
  onUploadLogo,
  logoPreviewUrl,
  isSaving,
  organizationTypeOptions,
  industrySectorOptions,
  attendanceIdentifierOptions,
  isReferenceDataLoading,
}: OrganisationDetailsStepProps) {
  const logoInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleLogoSelect(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    onUploadLogo(selectedFile);
    event.target.value = "";
  }

  return (
    <div className="mx-auto grid max-w-295 gap-8 lg:grid-cols-[1fr_0.42fr]">
      <section className="rounded-[0.35rem] border border-border bg-card p-8 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)] lg:p-10">
        <div className="max-w-xl">
          <h2 className="text-[2.65rem] font-bold tracking-[-0.06em] text-secondary">
            Complete organization profile
          </h2>
          <p className="mt-2 text-base leading-6 text-secondary/75">
            These details help personalize your workspace and attendance reports.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex flex-col gap-1">
            <Label>Organization Logo</Label>
            <input
              ref={fileInputRef}
              id={logoInputId}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="sr-only"
              onChange={handleLogoSelect}
            />
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-[#edf4ff] text-muted-foreground">
                {logoPreviewUrl ? (
                  <Image
                    src={logoPreviewUrl}
                    alt="Organization logo preview"
                    fill
                    sizes="100%"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <CameraIcon className="h-10 w-10" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  className="min-h-5 rounded-md px-4 py-2 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photo
                </Button>
                <p className="text-[0.65rem] font-medium uppercase tracking-widest text-secondary/60">
                  PNG or JPG, max 2MB
                </p>
                {/* {values.organizationLogoName ? (
                  <p className="text-xs font-medium text-secondary/70">
                    {values.organizationLogoName}
                  </p>
                ) : null} */}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="organizationDisplayName">Organization display name</Label>
            <Input
              id="organizationDisplayName"
              placeholder="e.g. Acme Corporation"
              error={Boolean(errors.organizationDisplayName)}
              {...register("organizationDisplayName")}
            />
            <FormError message={errors.organizationDisplayName?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="organizationType">Organization type</Label>
              <Controller
                name="organizationType"
                control={control}
                render={({ field }) => (
                  <Select
                    id="organizationType"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Select type"
                    error={Boolean(errors.organizationType)}
                    options={organizationTypeOptions}
                    loading={isReferenceDataLoading}
                  />
                )}
              />
              <FormError message={errors.organizationType?.message} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="industrySector">Industry sector</Label>
              <Controller
                name="industrySector"
                control={control}
                render={({ field }) => (
                  <Select
                    id="industrySector"
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Select sector"
                    error={Boolean(errors.industrySector)}
                    options={industrySectorOptions}
                    loading={isReferenceDataLoading}
                  />
                )}
              />
              <FormError message={errors.industrySector?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="defaultAttendanceIdentifier">
              Default attendance identifier
            </Label>
            <Controller
              name="defaultAttendanceIdentifier"
              control={control}
              render={({ field }) => (
                <Select
                  id="defaultAttendanceIdentifier"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Select identifier"
                  error={Boolean(errors.defaultAttendanceIdentifier)}
                  options={attendanceIdentifierOptions}
                  loading={isReferenceDataLoading}
                />
              )}
            />
            <FormError message={errors.defaultAttendanceIdentifier?.message} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" className="min-w-32 rounded-md px-7 py-3" onClick={onSubmit} loading={isSaving}>
            Save & Continue
          </Button>
          <Button type="button" variant="outline" className="min-w-28 rounded-md px-7 py-3 text-secondary" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
      </section>

      <aside className="space-y-5 pt-2">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary/60">
          Live Preview
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)]">
          <div className="h-24 bg-[linear-gradient(135deg,#0d9488,#14807c)]" />
          <div className="-mt-7 px-5 pb-5">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-white text-primary shadow">
              {logoPreviewUrl ? (
                <Image
                  src={logoPreviewUrl}
                  alt="Organization logo live preview"
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <CameraIcon className="h-10 w-10" />
              )}
            </div>
            <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-secondary">
              {values.organizationDisplayName || "Organization Name"}
            </div>
            <div className="mt-2 flex gap-2 text-xs font-bold uppercase tracking-[0.16em] text-secondary/70">
              <span className="rounded-full bg-[#e9f5f4] px-2 py-1 text-primary">
                {values.organizationType || "Enterprise"}
              </span>
              <span className="rounded-full bg-[#edf2f7] px-2 py-1">
                Categorized
              </span>
            </div>
            <hr className="mt-3 border-border"/>
            <div className="mt-6 grid grid-cols-2 gap-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-secondary/60">
              <div>
                Current Status
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold tracking-normal text-secondary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Onboarding
                </div>
              </div>
              <div>
                Admin Seat
                <div className="mt-2 text-sm font-semibold tracking-normal text-secondary">You</div>
              </div>
            </div>
            <div className="mt-5 rounded-md bg-[#f3f5f9] px-4 py-3 text-center text-sm leading-5 text-secondary/78">
              {"\"Architecting systems with precision and clarity.\""}
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)]">
          <div className="relative aspect-square w-full">
            <Image
              src="/images/onboarding/organization-profile-illustration.png"
              alt="Organization profile setup illustration"
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              className="object-cover"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
