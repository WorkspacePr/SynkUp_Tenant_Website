import { ArrowRight, CheckCircle2, Circle, Clock3, ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "./DashboardStates";
import type { ActivityItem, DashboardWidgetState } from "./types";

function activityToneIcon(tone: ActivityItem["tone"]) {
  return {
    success: CheckCircle2,
    warning: ShieldAlert,
    info: Clock3,
    neutral: Circle,
  }[tone];
}

function activityToneClass(tone: ActivityItem["tone"]) {
  return {
    success: "text-success",
    warning: "text-warning",
    info: "text-primary",
    neutral: "text-muted-foreground",
  }[tone];
}

export function RecentActivity({
  darkMode,
  items,
  state = "default",
}: {
  darkMode: boolean;
  items: ActivityItem[];
  state?: DashboardWidgetState;
}) {
  const stateContent = renderWidgetState({
    darkMode,
    state,
    title:
      state === "loading"
        ? "Loading recent activity"
        : state === "empty"
          ? "No recent activity"
          : state === "permission"
            ? "Audit visibility is restricted"
            : state === "success"
              ? "Recent activity looks normal"
              : "Unable to load recent activity",
    description:
      state === "loading"
        ? "Preparing the latest organisation timeline."
        : state === "empty"
          ? "No recent actions have been recorded yet."
          : state === "permission"
            ? "You do not have permission to view the activity timeline."
            : state === "success"
              ? "No unusual operational activity has been detected."
              : "Try again or visit the audit log module for a full history.",
  });

  if (stateContent) {
    return stateContent;
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className={cn("mt-1 text-sm", darkMode ? "text-slate-400" : "text-slate-400")}>
            A quick timeline of what changed across the organisation.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          View All Activity
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-0">
        {items.map((item, index) => {
          const Icon = activityToneIcon(item.tone);

          return (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "rounded-full p-2",
                    item.tone === "success"
                      ? "bg-[#ebfbf6] text-[#2dbd8d]"
                      : item.tone === "warning"
                        ? "bg-[#fef3c7] text-[#d97706]"
                        : item.tone === "info"
                          ? "bg-[#dbeafe] text-[#2563eb]"
                          : darkMode
                            ? "bg-slate-800 text-slate-400"
                            : "bg-slate-100 text-slate-400",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {index < items.length - 1 ? (
                  <div
                    className={cn(
                      "mt-2 h-full min-h-10 w-px",
                      darkMode ? "bg-slate-800" : "bg-slate-200",
                    )}
                  />
                ) : null}
              </div>

              <div className="flex-1 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-slate-500")}>
                      {item.subject}
                    </div>
                  </div>
                  <div className={cn("text-xs", darkMode ? "text-slate-500" : "text-slate-400")}>
                    {item.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
