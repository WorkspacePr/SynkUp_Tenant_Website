import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "./DashboardStates";
import type { DashboardWidgetState, SessionItem } from "./types";

function statusClass(status: SessionItem["status"]) {
  return {
    live: "bg-success/10 text-success",
    upcoming: "bg-primary/10 text-primary",
    review: "bg-warning/10 text-warning",
  }[status];
}

function statusLabel(status: SessionItem["status"]) {
  return {
    live: "LIVE",
    upcoming: "UPCOMING",
    review: "REVIEW",
  }[status];
}

export function SessionList({
  darkMode,
  sessions,
  state = "default",
}: {
  darkMode: boolean;
  sessions: SessionItem[];
  state?: DashboardWidgetState;
}) {
  const stateContent = renderWidgetState({
    darkMode,
    state,
    title:
      state === "loading"
        ? "Loading today's sessions"
        : state === "empty"
          ? "No sessions today"
          : state === "permission"
            ? "Session access is restricted"
            : state === "success"
              ? "Sessions are on track"
              : "Unable to load sessions",
    description:
      state === "loading"
        ? "Fetching live and upcoming attendance sessions."
        : state === "empty"
          ? "No live or upcoming sessions are scheduled right now."
          : state === "permission"
            ? "This session summary is currently outside your permission scope."
            : state === "success"
              ? "All scheduled sessions are progressing without issues."
              : "Refresh the dashboard or open the attendance module for more detail.",
  });

  if (stateContent) {
    return stateContent;
  }

  return (
    <Card className="rounded-[28px] border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Today&apos;s Sessions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Live and upcoming sessions that need quick visibility.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          View All Sessions
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {sessions.map((session) => {
          const progress =
            session.total > 0
              ? Math.min(100, Math.round((session.checkedIn / session.total) * 100))
              : 0;

          return (
            <div
              key={session.id}
              className={cn(
                "rounded-[22px] border border-border bg-muted/30 p-4",
                darkMode ? "bg-muted/35" : "bg-muted/40",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{session.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{session.time}</div>
                </div>

                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                    statusClass(session.status),
                  )}
                >
                  {statusLabel(session.status)}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {session.checkedIn.toLocaleString()} / {session.total.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-border/70">
                  <div
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
