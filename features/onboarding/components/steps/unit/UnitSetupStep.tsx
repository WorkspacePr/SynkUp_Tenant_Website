"use client";

import Image from "next/image";
import { Controller } from "react-hook-form";
import { useMemo } from "react";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Box, Lightbulb, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import type { SelectOption } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";
import { cn } from "@/utils";
import type { OnboardingFormValues } from "@/types/onboarding";

interface UnitSetupStepProps {
  control: Control<OnboardingFormValues>;
  register: UseFormRegister<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  onSubmit: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  unitTypeOptions: SelectOption[];
  isReferenceDataLoading?: boolean;
}

export function UnitSetupStep({
  control,
  register,
  errors,
  onSubmit,
  onSkip,
  isSaving,
  unitTypeOptions,
  isReferenceDataLoading,
}: UnitSetupStepProps) {
  const unitTypeValue = useWatch({ control, name: "unitType" }) ?? "";
  const unitTypeSelectOptions = useMemo(() => {
    if (unitTypeOptions.some((option) => option.value === "other")) {
      return unitTypeOptions;
    }

    return [...unitTypeOptions, { value: "other", label: "Other" }];
  }, [unitTypeOptions]);

  return (
    <div className="mx-auto grid max-w-270 gap-8 lg:grid-cols-[1fr_0.5fr]">
      <section className="rounded-[0.35rem] border border-border bg-card p-8 shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)] lg:p-10">
        <div className="max-w-lg">
          <h2 className="text-[2.55rem] font-bold tracking-[-0.06em] text-secondary">
            Create your first unit
          </h2>
          <p className="mt-2 text-base leading-6 text-secondary/75">
            Units help you organize attendance by department, class, branch,
            group, or event category.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          <div className="flex flex-col gap-1">
            <Label htmlFor="unitName">Unit name</Label>
            <Input
              id="unitName"
              placeholder="e.g. Engineering Department"
              error={Boolean(errors.unitName)}
              {...register("unitName")}
            />
            <FormError message={errors.unitName?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="unitType">Unit type</Label>
            <Controller
              name="unitType"
              control={control}
              render={({ field }) => (
                <Select
                  id="unitType"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Select unit type"
                  error={Boolean(errors.unitType)}
                  options={unitTypeSelectOptions}
                  loading={isReferenceDataLoading}
                />
              )}
            />
            <FormError message={errors.unitType?.message} />
          </div>

          {unitTypeValue === "other" ? (
            <div className="flex flex-col gap-1">
              <Label htmlFor="unitTypeOther">Specify unit type</Label>
              <Input
                id="unitTypeOther"
                placeholder="Enter your unit type"
                error={Boolean(errors.unitTypeOther)}
                {...register("unitTypeOther")}
              />
              <FormError message={errors.unitTypeOther?.message} />
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <Label htmlFor="unitDescription">Description (Optional)</Label>
            <textarea
              id="unitDescription"
              rows={4}
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              placeholder="Describe the purpose of this unit..."
              {...register("unitDescription")}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" className="min-w-28 rounded-md px-7 py-3" onClick={onSubmit} loading={isSaving}>
            Create Unit
          </Button>
          <Button type="button" variant="outline" className="min-w-28 rounded-md px-7 py-3 text-secondary" onClick={onSkip}>
            Skip for now
          </Button>
        </div>
      </section>

      <aside className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          <Lightbulb className="h-4 w-4" strokeWidth={1.9} />
          <span>Examples</span>
        </div>
        {[
          {
            title: "Computer Science Dept",
            description: "Great for tracking student labs and lecture attendance.",
            accent: "bg-primary",
            icon: <Box className="h-5 w-5" strokeWidth={1.9} />,
            iconColor: "text-primary",
          },
          {
            title: "Main Campus",
            description: "Use for geographical organization across various facilities.",
            accent: "bg-[#6d7486]",
            icon: <MapPin className="h-5 w-5" strokeWidth={1.9} />,
            iconColor: "text-[#6d7486]",
          },
          {
            title: "Staff Team",
            description: "Manage internal employee clock-ins and meeting logs.",
            accent: "bg-[#b45b2f]",
            icon: <Users className="h-5 w-5" strokeWidth={1.9} />,
            iconColor: "text-[#b45b2f]",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="relative overflow-hidden rounded-[0.35rem] border border-border bg-card p-4 pl-5 shadow-[0_16px_35px_-30px_rgba(15,23,42,0.35)]"
          >
            <div className={cn("absolute inset-y-0 left-0 w-1", item.accent)} />
            <div className="flex items-start gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-[0.3rem] bg-[#eaf1ff]", item.iconColor)}>
                {item.icon}
              </div>
              <div>
                <div className="text-[1rem] font-bold tracking-[-0.03em] text-secondary">
                  {item.title}
                </div>
                <div className="mt-1 text-sm leading-6 text-secondary/74">
                  {item.description}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="mt-5 overflow-hidden rounded-[0.45rem] shadow-[0_22px_50px_-38px_rgba(15,23,42,0.3)]">
          <div className="relative aspect-[1.03/1] w-full overflow-hidden rounded-[0.45rem]">
            <Image
              src="/images/onboarding/setup-unit-illustration.png"
              alt="Laptop analytics illustration for unit setup"
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
