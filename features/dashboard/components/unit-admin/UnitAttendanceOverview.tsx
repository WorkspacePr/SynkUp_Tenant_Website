"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "@/features/dashboard/components/super-admin/DashboardStates";
import type { DashboardWidgetState } from "@/features/dashboard/components/super-admin/types";

import type {
  UnitAttendanceFilter,
  UnitAttendanceOverview,
} from "./types";

const filterLabels: Record<UnitAttendanceFilter, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7days": "7 Days",
  "30days": "30 Days",
  custom: "Custom",
};

export function UnitAttendanceOverviewCard({
  darkMode,
  views,
  state = "default",
}: {
  darkMode: boolean;
  views: Record<UnitAttendanceFilter, UnitAttendanceOverview>;
  state?: DashboardWidgetState;
}) {
  const [activeFilter, setActiveFilter] = useState<UnitAttendanceFilter>("today");
  const view = useMemo(() => views[activeFilter], [activeFilter, views]);

  const stateContent = renderWidgetState({
    darkMode,
    state,
    title:
      state === "loading"
        ? "Loading attendance overview"
        : state === "empty"
          ? "No attendance data"
          : state === "permission"
            ? "Attendance overview is restricted"
            : state === "success"
              ? "Attendance looks healthy"
              : "Unable to load attendance overview",
    description:
      state === "loading"
        ? "Preparing unit attendance summary and chart."
        : state === "empty"
          ? "Attendance analytics will appear once sessions begin."
          : state === "permission"
            ? "You do not currently have access to the attendance overview."
            : state === "success"
              ? "No attendance anomalies were detected in the selected range."
              : "Try again or use the reports module for deeper analysis.",
  });

  if (stateContent) {
    return stateContent;
  }

  const maxValue = Math.max(...view.points.map((point) => point.value), 1);

  return (
    <Card className={cn("rounded-2xl border p-5", darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Attendance Overview</h3>
          <p className={cn("mt-1 text-sm", darkMode ? "text-slate-400" : "text-slate-400")}>
            {view.summary}
          </p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View Reports
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as UnitAttendanceFilter[]).map((filter) => {
          const active = filter === activeFilter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {filterLabels[filter]}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        {[
          ["Present", view.breakdown.present],
          ["Late", view.breakdown.late],
          ["Absent", view.breakdown.absent],
          ["Excused", view.breakdown.excused],
          ["Flagged", view.breakdown.flagged],
        ].map(([label, value]) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl border p-4",
              darkMode ? "border-slate-800 bg-slate-950/45" : "border-slate-100 bg-[#fafbfc]",
            )}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] bg-muted/60 p-4 sm:p-5">
        <div className="flex h-56 items-end gap-3 sm:gap-4">
          {view.points.map((point) => (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
              <div className="w-full rounded-full bg-background/70 p-1">
                <div
                  className="w-full rounded-full bg-primary/15"
                  style={{ height: `${Math.max((point.value / maxValue) * 170, 18)}px` }}
                >
                  <div className="h-full w-full rounded-full bg-primary" style={{ opacity: 0.92 }} />
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground">{point.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
