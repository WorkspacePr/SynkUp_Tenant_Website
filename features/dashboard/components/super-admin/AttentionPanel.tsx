"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BellDot, CheckCheck, CircleX, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "./DashboardStates";
import type { AttentionItem, DashboardWidgetState } from "./types";

function severityStyle(severity: AttentionItem["severity"]) {
  return {
    critical: {
      badge: "bg-destructive/10 text-destructive",
      icon: ShieldAlert,
      label: "Critical",
    },
    high: {
      badge: "bg-warning/10 text-warning",
      icon: AlertTriangle,
      label: "High",
    },
    medium: {
      badge: "bg-primary/10 text-primary",
      icon: BellDot,
      label: "Medium",
    },
    low: {
      badge: "bg-muted text-muted-foreground",
      icon: CircleX,
      label: "Low",
    },
  }[severity];
}

export function AttentionPanel({
  darkMode,
  items,
  state = "default",
}: {
  darkMode: boolean;
  items: AttentionItem[];
  state?: DashboardWidgetState;
}) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleItems = useMemo(
    () => items.filter((item) => !dismissedIds.includes(item.id)).slice(0, 5),
    [dismissedIds, items],
  );

  const stateContent = renderWidgetState({
    darkMode,
    state,
    title:
      state === "loading"
        ? "Loading attention queue"
        : state === "empty"
          ? "No action items"
          : state === "permission"
            ? "Access restricted"
            : state === "success"
              ? "Everything looks good"
              : "Unable to load the attention queue",
    description:
      state === "loading"
        ? "Checking flags, approvals, disputes, invitations, and export risks."
        : state === "empty"
          ? "There are no alerts requiring action right now."
          : state === "permission"
            ? "You do not have permission to view this queue right now."
            : state === "success"
              ? "No critical issues are affecting organisation operations."
              : "Refresh the dashboard or retry this section in a moment.",
  });

  if (stateContent) {
    return stateContent;
  }

  if (visibleItems.length === 0) {
    return (
      <Card
        className={cn(
          "rounded-2xl border p-5",
          darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white",
        )}
      >
        <div className="flex items-center gap-3 text-success">
          <CheckCheck className="h-5 w-5" />
          <div>
            <div className="text-lg font-semibold text-card-foreground">All clear</div>
            <div className="mt-1 text-sm text-muted-foreground">
              There are no critical issues requiring your attention right now.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white",
      )}
    >
      <div className="space-y-2">
        {visibleItems.map((item) => {
          const style = severityStyle(item.severity);
          const Icon = style.icon;

          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col gap-4 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between",
                darkMode
                  ? "border-slate-800 bg-slate-950/45"
                  : "border-slate-100 bg-[#fafbfc]",
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className={cn("rounded-2xl p-2.5", style.badge)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]", style.badge)}>
                      {style.label}
                    </span>
                    <span className={cn("text-xs", darkMode ? "text-slate-500" : "text-slate-400")}>
                      {item.time}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                  <p className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-slate-500")}>
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button className="min-h-11 rounded-lg px-4 py-2.5 text-sm">
                  {item.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <button
                  type="button"
                  onClick={() =>
                    setDismissedIds((current) => [...current, item.id])
                  }
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition",
                    darkMode
                      ? "border-slate-700 text-slate-300 hover:text-white"
                      : "border-slate-200 text-slate-500 hover:text-slate-900",
                  )}
                  aria-label={`Dismiss ${item.title}`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
