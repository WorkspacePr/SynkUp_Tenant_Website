"use client";

import { Button } from "@/components/ui/Button";

import type { CreationStepId } from "../types";
import { Pencil } from "lucide-react";

export function CreationReviewStep({
  organisationName,
  organisationType,
  industrySector,
  fullName,
  email,
  subdomain,
  onEdit,
  onCreate,
  isSubmitting,
}: {
  organisationName: string;
  organisationType: string;
  industrySector: string;
  fullName: string;
  email: string;
  subdomain: string;
  onEdit: (step: Exclude<CreationStepId, "review" | "plan">) => void;
  onCreate: () => void;
  isSubmitting?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[2.15rem] font-bold tracking-[-0.06em] text-secondary">
          Review Summary
        </h2>
      </div>

      <ReviewCard
        label="Organization Details"
        onEdit={() => onEdit("organisation")}
      >
        <div className="text-[1.35rem] font-bold tracking-[-0.04em] text-secondary">
          {organisationName}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary/45">
              Organisation Type
            </div>
            <div className="mt-1 text-base capitalize text-secondary/80">
              {organisationType}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary/45">
              Industry Sector
            </div>
            <div className="mt-1 text-base capitalize text-secondary/80">
              {industrySector}
            </div>
          </div>
        </div>
      </ReviewCard>

      <ReviewCard label="Primary Administrator" onEdit={() => onEdit("admin")}>
        <div className="text-[1.35rem] font-bold tracking-[-0.04em] text-secondary">
          {fullName}
        </div>
        <div className="mt-3 space-y-1.5 text-base text-secondary/78">
          <div>{email}</div>
          <div>Super Admin access enabled</div>
        </div>
      </ReviewCard>

      <ReviewCard label="Subdomain" onEdit={() => onEdit("organisation")}>
        <div className="text-xl font-bold tracking-[-0.04em] text-secondary">
          {subdomain ? `${subdomain}.synkup.io` : ""}
        </div>
        <div className="mt-4 rounded-md bg-[#fff2f0] px-3 py-2 text-xs text-[#d15353]">
          Secure SSL will be provisioned upon creation.
        </div>
      </ReviewCard>

      <Button
        type="button"
        className="mt-2 w-full gap-3"
        onClick={onCreate}
        loading={isSubmitting}
      >
        Create Organisation
      </Button>
    </div>
  );
}

function ReviewCard({
  label,
  children,
  onEdit,
}: {
  label: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-[0.7rem] border border-border bg-card p-4 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.2)]">
      <div className="flex items-start justify-between gap-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary/45">
          {label}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-[#0b857b]"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}
