import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

type DashboardHeaderProps = {
  darkMode: boolean;
  greeting: string;
  organisationName: string;
  statusMessage: string;
  attentionSummary: string;
  primaryActionLabel: string;
};

export function DashboardHeader({
  darkMode,
  greeting,
  organisationName,
  statusMessage,
  attentionSummary,
  primaryActionLabel,
}: DashboardHeaderProps) {
  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            {greeting}
          </p>
          <p className={cn("mt-2 text-base font-medium", darkMode ? "text-slate-200" : "text-slate-700")}>
            {organisationName}
          </p>
          <div className="mt-5 space-y-1.5">
            <p className="text-base">{statusMessage}</p>
            <p className="text-sm text-muted-foreground">{attentionSummary}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button className="min-h-12 rounded-full px-5 py-3 text-sm">
            <Plus className="h-4 w-4" />
            {primaryActionLabel}
          </Button>
          <button
            type="button"
            className={cn(
              "inline-flex min-h-12 items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition",
              darkMode
                ? "border-border bg-muted text-card-foreground hover:border-primary"
                : "border-border bg-muted text-foreground hover:border-primary",
            )}
          >
            View Reports
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
