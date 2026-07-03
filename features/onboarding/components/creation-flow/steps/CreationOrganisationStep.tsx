"use client";

import { Controller } from "react-hook-form";

import { FormError } from "@/components/ui/FormError";
import { Icon } from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";

import type { CreationSharedProps } from "../types";

export function CreationOrganisationStep({
  register,
  control,
  errors,
  subdomain,
  organizationTypeOptions,
  industrySectorOptions,
  subdomainAvailabilityLabel,
  subdomainAvailabilityTone,
}: CreationSharedProps & {
  subdomain: string;
  organizationTypeOptions: SelectOption[];
  industrySectorOptions: SelectOption[];
  subdomainAvailabilityLabel: string;
  subdomainAvailabilityTone: "neutral" | "success" | "error";
}) {
  const availabilityToneClass =
    subdomainAvailabilityTone === "success"
      ? "text-primary"
      : subdomainAvailabilityTone === "error"
        ? "text-destructive"
        : "text-secondary/55";

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-[2.1rem] font-bold tracking-[-0.06em] text-secondary">
          Basics & Identity
        </h2>
        <p className="mt-2 text-base leading-6 text-muted-foreground">
          {"Let's set up the core identity of your workspace."}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="organisationName">Organisation Name</Label>
        <Input
          id="organisationName"
          placeholder="e.g. Global Tech Institute"
          error={Boolean(errors.organisationName)}
          {...register("organisationName")}
        />
        <FormError message={errors.organisationName?.message} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="organisationType">Organisation Type</Label>
        <Controller
          name="organisationType"
          control={control}
          render={({ field }) => (
            <Select
              id="organisationType"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Select type..."
              error={Boolean(errors.organisationType)}
              options={organizationTypeOptions}
            />
          )}
        />
        <FormError message={errors.organisationType?.message} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="industrySector">Industry Sector</Label>
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
              placeholder="Select industry..."
              error={Boolean(errors.industrySector)}
              options={industrySectorOptions}
            />
          )}
        />
        <FormError message={errors.industrySector?.message} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="subdomain">Preferred Subdomain</Label>
          <span className={`text-sm font-semibold ${availabilityToneClass}`}>
            {subdomainAvailabilityLabel}
          </span>
        </div>
        <Input
          id="subdomain"
          placeholder="yourorg"
          error={Boolean(errors.subdomain)}
          suffix={
            <span className="rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-secondary/80">
              .synkup.app
            </span>
          }
          {...register("subdomain")}
        />
        <FormError message={errors.subdomain?.message} />
      </div>
      <div className="rounded-[1.35rem] bg-[#d9ebf2] p-4">
        <div className="flex items-center gap-4 text-xs font-bold tracking-[0.08em] text-secondary/45">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
            <Icon name="globe" className="h-5 w-5" />
          </span>
          <div>
            <div className="uppercase">Live URL Preview</div>
            <p className="mt-2 text-sm font-semibold text-primary">
              https://{subdomain || "yourorg"}.synkup.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
