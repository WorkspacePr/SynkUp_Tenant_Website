import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import { renderWidgetState } from "./DashboardStates";
import type { DashboardWidgetState, QuickAction } from "./types";

export function QuickActions({
  darkMode,
  actions,
  state = "default",
}: {
  darkMode: boolean;
  actions: QuickAction[];
  state?: DashboardWidgetState;
}) {
  const stateContent = renderWidgetState({
    darkMode,
    state,
    title:
      state === "loading"
        ? "Loading quick actions"
        : state === "empty"
          ? "No quick actions available"
          : state === "permission"
            ? "Actions unavailable"
            : state === "success"
              ? "Actions are ready"
              : "Unable to load quick actions",
    description:
      state === "loading"
        ? "Preparing common administrative shortcuts."
        : state === "empty"
          ? "There are no quick actions configured for this role."
          : state === "permission"
            ? "Some actions are disabled based on your current permission scope."
            : state === "success"
              ? "Administrative shortcuts are available below."
              : "Refresh the dashboard and try again.",
  });

  if (stateContent) {
    return stateContent;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.id}
            type="button"
            className="text-left"
          >
            <Card
              className={cn(
                "h-full rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_18px_42px_-28px_rgba(13,148,136,0.45)]",
                darkMode
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-[#dbe5ec] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfc_100%)] text-[#172033]",
              )}
            >
              <div
                className={cn(
                  "inline-flex rounded-2xl p-3 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.08)]",
                  darkMode
                    ? "bg-[#113c39] text-[#67d6cf]"
                    : "bg-[#e8f8f6] text-[#129488]",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-8 border-t border-black/5 pt-4 dark:border-white/8">
                <div className="text-base font-semibold">{action.title}</div>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
