"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { Stepper } from "@/components/ui/Stepper";
import { cn, formatCurrency } from "@/utils";
import type { PlanId } from "@/types/onboarding";

import { planDetails } from "../planDetails";

export function CreationPlanStep({
  value,
  onChange,
  onContinue,
  billingCycle,
  onBillingCycleChange,
  isContinuing,
}: {
  value: PlanId | "";
  onChange: (plan: PlanId) => void;
  onContinue: () => void;
  billingCycle: "monthly" | "yearly";
  onBillingCycleChange: (cycle: "monthly" | "yearly") => void;
  isContinuing?: boolean;
}) {
  const plans = [
    {
      id: "basic" as const,
      name: "Basic",
      description: "Essential tools for small agile teams looking to organize.",
      features: planDetails.basic.features,
    },
    {
      id: "pro" as const,
      name: "Pro",
      description:
        "Advanced collaboration features for scaling organizations.",
      features: planDetails.pro.features,
      recommended: true,
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      description: "Maximum control and security for global enterprises.",
      features: planDetails.enterprise.features,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center">
        <Stepper label="STEP 3 OF 3" phase={3} />
      </div>
      <div className="mt-10 text-center">
        <h2 className="text-[2.6rem] font-bold tracking-[-0.06em] text-secondary">
          Choose your growth path
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
          Scalable solutions designed for modern technical teams. Start with
          precision, grow with confidence.
        </p>
      </div>
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.3)]">
          {(["monthly", "yearly"] as const).map((cycle) => {
            const active = billingCycle === cycle;
            return (
              <button
                key={cycle}
                type="button"
                onClick={() => onBillingCycleChange(cycle)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_12px_26px_-18px_rgba(13,148,136,0.65)]"
                    : "text-secondary/70 hover:text-secondary",
                )}
              >
                {cycle}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        {plans.map((plan) => {
          const selected = value === plan.id;
          const planPrice = planDetails[plan.id].monthlyPrice;
          const displayPrice =
            billingCycle === "yearly" ? planPrice * 12 : planPrice;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              className={cn(
                "relative rounded-[1.35rem] border bg-card p-6 text-left shadow-[0_20px_55px_-44px_rgba(15,23,42,0.45)] transition",
                selected
                  ? "border-primary shadow-[0_26px_62px_-42px_rgba(13,148,136,0.4)]"
                  : "border-border",
              )}
            >
              {plan.recommended ? (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground">
                  Recommended
                </span>
              ) : null}
              <div className="text-[1.7rem] font-bold tracking-[-0.04em] text-secondary">
                {plan.name}
              </div>
              <div className="mt-3 text-[3rem] font-bold tracking-[-0.07em] text-secondary">
                {formatCurrency(displayPrice)}
                <span className="ml-1 text-lg font-medium text-muted-foreground">
                  {billingCycle === "yearly" ? "/yr" : "/mo"}
                </span>
              </div>
              <p className="mt-4 min-h-14 text-sm leading-6 text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm text-secondary/85"
                  >
                    <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                      <CheckIcon className="h-2.5 w-2.5" />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[0.95rem] border px-5 text-sm font-semibold transition",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary text-primary hover:bg-primary/5",
                )}
              >
                {plan.name === "Basic"
                  ? "Select Basic"
                  : plan.name === "Pro"
                    ? "Select Pro"
                    : "Select Enterprise"}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-12 flex flex-col items-center gap-4">
        <Button
          type="button"
          className="min-w-[18rem] gap-3"
          onClick={onContinue}
          loading={isContinuing}
        >
          Review & Create Organisation
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
        <p className="text-sm text-muted-foreground">
          By continuing, you agree to our platform architecture standards.
        </p>
      </div>
    </>
  );
}
