import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import type { UnitHeaderAction } from "./types";

export function UnitAdminHeader({
  darkMode,
  greeting,
  unitName,
  organisationName,
  currentDate,
  statusMessage,
  actions,
}: {
  darkMode: boolean;
  greeting: string;
  unitName: string;
  organisationName: string;
  currentDate: string;
  statusMessage: string;
  actions: UnitHeaderAction[];
}) {
  const primaryAction = actions.find((action) => action.variant === "primary");
  const secondaryActions = actions.filter((action) => action.variant === "secondary");

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            {greeting}
          </p>
          <p className={cn("mt-3 text-lg font-semibold", darkMode ? "text-white" : "text-slate-900")}>
            Unit: {unitName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{organisationName}</span>
            <span className="hidden sm:inline">•</span>
            <span>{currentDate}</span>
          </div>
          <p className="mt-5 text-sm sm:text-base">{statusMessage}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {primaryAction ? (
            <Button className="min-h-12 rounded-full px-5 py-3 text-sm">
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={cn(
                "inline-flex min-h-12 items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition",
                darkMode
                  ? "border-border bg-muted text-card-foreground hover:border-primary"
                  : "border-border bg-muted text-foreground hover:border-primary",
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
