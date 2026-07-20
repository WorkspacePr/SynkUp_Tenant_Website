import { AlertTriangle, ArrowRight, CheckCircle2, Info, ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import type { HealthStrip } from "./types";

export function HealthStatusStrip({
  darkMode,
  strip,
}: {
  darkMode: boolean;
  strip: HealthStrip;
}) {
  const iconMap = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: ShieldAlert,
    info: Info,
  };

  const toneClass = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-primary/10 text-primary",
  }[strip.tone];

  const Icon = iconMap[strip.tone];

  return (
    <Card
      className={cn(
        "rounded-[24px] border px-5 py-4",
        darkMode ? "border-border bg-card" : "border-border bg-card",
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className={cn("rounded-2xl p-2.5", toneClass)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">{strip.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{strip.summary}</div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          {strip.actionLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
