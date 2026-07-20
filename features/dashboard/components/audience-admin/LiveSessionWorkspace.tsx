import { AlertTriangle, ArrowRight, Clock3, Flag, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "@/features/dashboard/components/super-admin/DashboardStates";
import type { DashboardWidgetState } from "@/features/dashboard/components/super-admin/types";

import type { LiveSessionWorkspaceData } from "./types";

export function LiveSessionWorkspace({
  darkMode,
  data,
  state = "default",
}: {
  darkMode: boolean;
  data: LiveSessionWorkspaceData;
  state?: DashboardWidgetState;
}) {
  const stateContent = renderWidgetState({
    darkMode,
    state,
    title:
      state === "loading"
        ? "Loading session workspace"
        : state === "empty"
          ? "No session available"
          : state === "permission"
            ? "Session workspace restricted"
            : state === "success"
              ? "Session workspace ready"
              : "Unable to load session workspace",
    description:
      state === "loading"
        ? "Preparing live or next session details."
        : state === "empty"
          ? "Create a session when you are ready to begin attendance."
          : state === "permission"
            ? "You do not have permission to access this session."
            : state === "success"
              ? "The session workspace loaded successfully."
              : "Retry the page or open the sessions module for more detail.",
  });

  if (stateContent) {
    return stateContent;
  }

  if (data.state === "none") {
    return (
      <Card className="rounded-[32px] border border-border bg-card p-6 sm:p-7">
        <h2 className="text-2xl font-semibold tracking-[-0.04em]">{data.title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Create a session when you are ready to begin attendance.
        </p>
        <Button className="mt-6 min-h-12 rounded-full px-5 py-3 text-sm">Create Session</Button>
      </Card>
    );
  }

  const progress = data.attendancePercentage ?? 0;

  return (
    <Card className="rounded-[32px] border border-border bg-card p-6 sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1",
                data.state === "live"
                  ? "bg-success/10 text-success"
                  : "bg-primary/10 text-primary",
              )}
            >
              <PlayCircle className="h-4 w-4" />
              {data.title}
            </span>
          </div>

          <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.04em]">
            {data.sessionName}
          </h2>

          {(data.startsAt || data.endsAt) ? (
            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              <span>{data.startsAt} – {data.endsAt}</span>
            </div>
          ) : null}

          {data.timeLabel ? (
            <div className="mt-3 text-sm text-muted-foreground">{data.timeLabel}</div>
          ) : null}

          {data.state === "live" ? (
            <>
              <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
                <div>
                  <div className="text-3xl font-semibold tracking-[-0.05em]">
                    {data.checkedInCount} <span className="text-lg font-medium text-muted-foreground">of {data.expectedCount}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">checked in</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{progress}%</div>
                  <div className="mt-1 text-sm text-muted-foreground">attendance</div>
                </div>
              </div>

              <div className="mt-5 h-3 rounded-full bg-border/70">
                <div className="h-3 rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-foreground">
                  <Clock3 className="h-4 w-4 text-warning" />
                  <span>{data.lateCount ?? 0} late</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-foreground">
                  <Flag className="h-4 w-4 text-destructive" />
                  <span>{data.flaggedCount ?? 0} flagged</span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <div className="text-2xl font-semibold tracking-[-0.04em]">
                {data.expectedCount ?? 0}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">expected members</div>
            </div>
          )}
        </div>

        <div className="flex w-full max-w-64 flex-col gap-3">
          <Button className="min-h-12 rounded-lg px-5 py-3 text-sm">
            {data.state === "live" ? "Open Session" : "View Session"}
          </Button>
          <button
            type="button"
            className={cn(
              "inline-flex min-h-12 items-center justify-center rounded-lg border px-5 py-3 text-sm font-semibold transition",
              darkMode
                ? "border-slate-700 text-slate-300 hover:text-white"
                : "border-slate-200 text-slate-700 hover:text-slate-900",
            )}
          >
            {data.state === "live" ? "View Attendance" : "Start Session"}
          </button>
          {data.state === "live" ? (
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#ff7d7d] px-5 py-3 text-sm font-semibold text-[#ff4444] transition hover:bg-[#fff5f5] dark:hover:bg-[#2a1416]"
            >
              End Session
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
