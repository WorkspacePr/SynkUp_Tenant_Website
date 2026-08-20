"use client";

import { Building2, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

type EmptyStateKind = "unit" | "audience";

export function InheritedDashboardEmptyState({
  darkMode,
  kind,
  canCreate,
  hasUnits,
  onPrimaryAction,
  onReturn,
}: {
  darkMode: boolean;
  kind: EmptyStateKind;
  canCreate: boolean;
  hasUnits: boolean;
  onPrimaryAction: () => void;
  onReturn: () => void;
}) {
  const isUnit = kind === "unit";
  const needsUnitFirst = !isUnit && !hasUnits;
  const title = isUnit
    ? "No units have been created yet"
    : needsUnitFirst
      ? "Create a unit before adding audiences"
      : "No audiences have been created yet";
  const description = isUnit
    ? canCreate
      ? "Create the first unit to begin assigning Unit Admins, organising audiences, and tracking attendance."
      : "This organisation does not have a unit for you to manage yet. Contact a Super Admin when a unit is ready."
    : needsUnitFirst
      ? "Audiences belong to a unit. Set up the organisation’s first unit before creating an audience."
      : canCreate
        ? "Create an audience to start setting up sessions, attendance, and audience-level administration."
        : "This organisation does not have an audience for you to manage yet. Contact your Unit Admin when one is ready.";
  const primaryLabel = isUnit || needsUnitFirst ? "Create first unit" : "Set up audiences";
  const Icon = isUnit || needsUnitFirst ? Building2 : UsersRound;

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[28px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
        darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white",
      )}
    >
      <div className={cn(
        "flex min-h-105 flex-col items-center justify-center px-6 py-12 text-center sm:px-10",
        darkMode ? "bg-slate-950/40" : "bg-[linear-gradient(180deg,#f8fffd_0%,#ffffff_100%)]",
      )}>
        <div className={cn(
          "inline-flex h-16 w-16 items-center justify-center rounded-2xl",
          darkMode ? "bg-slate-800 text-[#32d2c5]" : "bg-[#dff8f4] text-[#16a394]",
        )}>
          <Icon className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{title}</h1>
        <p className={cn("mt-3 max-w-xl text-sm leading-6 sm:text-base", darkMode ? "text-slate-300" : "text-slate-500")}>
          {description}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {canCreate ? (
            <Button className="min-h-11 rounded-xl px-5 py-3" onClick={onPrimaryAction}>
              {primaryLabel}
            </Button>
          ) : null}
          <Button variant={canCreate ? "outline" : "primary"} className="min-h-11 rounded-xl px-5 py-3" onClick={onReturn}>
            Return to dashboard
          </Button>
        </div>
      </div>
    </Card>
  );
}
