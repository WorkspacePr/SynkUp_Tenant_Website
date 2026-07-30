import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "@/features/dashboard/components/super-admin/DashboardStates";
import type { DashboardWidgetState } from "@/features/dashboard/components/super-admin/types";

import type { UnitSessionItem } from "./types";

function statusClass(status: UnitSessionItem["status"]) {
  return {
    live: "bg-success/10 text-success",
    upcoming: "bg-primary/10 text-primary",
    review: "bg-warning/10 text-warning",
  }[status];
}

function statusLabel(status: UnitSessionItem["status"]) {
  return {
    live: "LIVE",
    upcoming: "UPCOMING",
    review: "REVIEW",
  }[status];
}

export function UnitSessionWorkspace({
  darkMode,
  sessions,
  state = "default",
}: {
  darkMode: boolean;
  sessions: UnitSessionItem[];
  state?: DashboardWidgetState;
}) {
  const stateContent = renderWidgetState({
    darkMode,
    state,
    title:
      state === "loading"
        ? "Loading today's sessions"
        : state === "empty"
          ? "No sessions scheduled"
          : state === "permission"
            ? "Session visibility is restricted"
            : state === "success"
              ? "Sessions are healthy"
              : "Unable to load sessions",
    description:
      state === "loading"
        ? "Preparing live and upcoming unit sessions."
        : state === "empty"
          ? "No live or upcoming sessions are scheduled in this unit right now."
          : state === "permission"
            ? "You do not have access to these sessions at the moment."
            : state === "success"
              ? "No session issues are affecting the unit right now."
              : "Refresh the dashboard or open the sessions module for more detail.",
  });

  if (stateContent) {
    return stateContent;
  }

  return (
    <Card className={cn("rounded-2xl border p-5", darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Today&apos;s Sessions</h3>
          <p className={cn("mt-1 text-sm", darkMode ? "text-slate-400" : "text-slate-400")}>
            Active and upcoming sessions that need unit-level visibility.
          </p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View All Sessions
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {sessions.map((session) => {
          const progress = session.total > 0 ? Math.min(100, Math.round((session.checkedIn / session.total) * 100)) : 0;

          return (
            <div
              key={session.id}
              className={cn(
                "rounded-2xl border p-4",
                darkMode ? "border-slate-800 bg-slate-950/45" : "border-slate-100 bg-[#fafbfc]",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold">{session.audienceName}</div>
                  <div className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-slate-500")}>
                    {session.startTime} - {session.endTime}
                  </div>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]", statusClass(session.status))}>
                  {statusLabel(session.status)}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {session.checkedIn.toLocaleString()} / {session.total.toLocaleString()} checked in
                  </span>
                  <span className={cn(darkMode ? "text-slate-400" : "text-slate-500")}>{progress}%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-border/70">
                  <div className="h-2.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className={cn("mt-4 text-sm", darkMode ? "text-slate-300" : "text-slate-500")}>
                Audience Admin: <span className={cn("font-medium", darkMode ? "text-white" : "text-slate-800")}>{session.audienceAdmin}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="min-h-11 rounded-lg px-4 py-2.5 text-sm">Open Session</Button>
                <button
                  type="button"
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition",
                    darkMode
                      ? "border-slate-700 text-slate-300 hover:text-white"
                      : "border-slate-200 text-slate-600 hover:text-slate-900",
                  )}
                >
                  View Attendance
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
