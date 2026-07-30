"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "./DashboardStates";
import type {
  AttendanceFilter,
  AttendanceOverviewData,
  DashboardWidgetState,
} from "./types";

const filterLabels: Record<AttendanceFilter, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7days": "7 Days",
  "30days": "30 Days",
  custom: "Custom",
};

export function AttendanceOverview({
  darkMode,
  views,
  state = "default",
}: {
  darkMode: boolean;
  views: Record<AttendanceFilter, AttendanceOverviewData>;
  state?: DashboardWidgetState;
}) {
  const [activeFilter, setActiveFilter] = useState<AttendanceFilter>("today");
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
            ? "Reports are restricted"
            : state === "success"
              ? "Attendance is healthy"
              : "Unable to load attendance overview",
    description:
      state === "loading"
        ? "Preparing attendance trends and session participation summary."
        : state === "empty"
          ? "Attendance data will appear here once sessions begin."
          : state === "permission"
            ? "You do not currently have access to this attendance summary."
            : state === "success"
              ? "No unusual attendance patterns were detected in the selected range."
              : "Try again or open the reports module for a deeper review.",
  });

  if (stateContent) {
    return stateContent;
  }

  const maxValue = Math.max(...view.points.map((point) => point.value), 1);

  return (
    <Card className="rounded-[28px] border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Attendance Overview</h3>
            <p className="mt-1 text-sm text-muted-foreground">{view.summary}</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            View Reports
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as AttendanceFilter[]).map((filter) => {
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

        <div className="rounded-[24px] bg-muted/60 p-4 sm:p-5">
          <div className="flex h-56 items-end gap-3 sm:gap-4">
            {view.points.map((point) => (
              <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="w-full rounded-full bg-background/70 p-1">
                  <div
                    className="w-full rounded-full bg-primary/15"
                    style={{ height: `${Math.max((point.value / maxValue) * 170, 18)}px` }}
                  >
                    <div
                      className="h-full w-full rounded-full bg-primary"
                      style={{ opacity: 0.92 }}
                    />
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground">{point.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
