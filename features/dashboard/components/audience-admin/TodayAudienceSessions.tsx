import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils";

import { renderWidgetState } from "@/features/dashboard/components/super-admin/DashboardStates";
import type { DashboardWidgetState } from "@/features/dashboard/components/super-admin/types";

import type { AudienceSessionSummary } from "./types";

function statusClass(status: AudienceSessionSummary["status"]) {
  return {
    live: "bg-success/10 text-success",
    upcoming: "bg-primary/10 text-primary",
    completed: "bg-muted text-muted-foreground",
    delayed: "bg-warning/10 text-warning",
    requires_review: "bg-warning/10 text-warning",
    locked: "bg-muted text-foreground",
    archived: "bg-muted text-muted-foreground",
  }[status];
}

function statusLabel(status: AudienceSessionSummary["status"]) {
  return {
    live: "Live",
    upcoming: "Upcoming",
    completed: "Completed",
    delayed: "Delayed",
    requires_review: "Requires Review",
    locked: "Locked",
    archived: "Archived",
  }[status];
}

export function TodayAudienceSessions({
  darkMode,
  sessions,
  state = "default",
}: {
  darkMode: boolean;
  sessions: AudienceSessionSummary[];
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
            ? "Session access restricted"
            : state === "success"
              ? "Sessions loaded"
              : "Unable to load today’s sessions",
    description:
      state === "loading"
        ? "Fetching sessions for the selected assigned audience."
        : state === "empty"
          ? "No sessions are scheduled for the selected audience today."
          : state === "permission"
            ? "Your role does not allow access to these session details."
            : state === "success"
              ? "All relevant sessions are available."
              : "Retry the widget or visit the sessions module.",
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
            Active, upcoming, and recently completed sessions for this audience.
          </p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View all sessions
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {sessions.filter((session) => session.status !== "archived").slice(0, 4).map((session) => {
          const progress =
            session.expectedCount && session.expectedCount > 0
              ? Math.round((session.checkedInCount / session.expectedCount) * 100)
              : 0;

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
                  <div className="text-base font-semibold">{session.title}</div>
                  <div className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-slate-500")}>
                    {session.startsAt} – {session.endsAt}
                  </div>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]", statusClass(session.status))}>
                  {statusLabel(session.status)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="font-medium">
                  {session.checkedInCount} / {session.expectedCount ?? 0}
                </span>
                <span className="text-muted-foreground">{progress}%</span>
                {typeof session.lateCount === "number" ? <span className="text-muted-foreground">Late: {session.lateCount}</span> : null}
                {typeof session.flaggedCount === "number" ? <span className="text-muted-foreground">Flagged: {session.flaggedCount}</span> : null}
              </div>

              <div className="mt-4 h-2.5 rounded-full bg-border/70">
                <div className="h-2.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="min-h-11 rounded-lg px-4 py-2.5 text-sm">View Session</Button>
                <button
                  type="button"
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition",
                    darkMode
                      ? "border-slate-700 text-slate-300 hover:text-white"
                      : "border-slate-200 text-slate-700 hover:text-slate-900",
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
