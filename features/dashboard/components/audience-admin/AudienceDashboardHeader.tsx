import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { cn } from "@/utils";

import { renderWidgetState } from "@/features/dashboard/components/super-admin/DashboardStates";
import type { DashboardWidgetState } from "@/features/dashboard/components/super-admin/types";
import type { SelectOption } from "@/features/dashboard/components/showcase";

export function AudienceDashboardHeader({
  darkMode,
  greeting,
  audienceName,
  unitName,
  organisationName,
  currentDate,
  statusMessage,
  primaryActionLabel,
  audienceOptions,
  onAudienceChange,
  selectorState = "default",
}: {
  darkMode: boolean;
  greeting: string;
  audienceName: string;
  unitName: string;
  organisationName: string;
  currentDate: string;
  statusMessage: string;
  primaryActionLabel: string;
  audienceOptions: SelectOption[];
  onAudienceChange: (value: string) => void;
  selectorState?: DashboardWidgetState;
}) {
  if (audienceOptions.length === 0) {
    return (
      <Card className="rounded-[32px] border border-border bg-card px-6 py-8 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-[-0.05em]">No audience assigned</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Your account is not currently assigned to an audience. Contact your Unit Admin for assistance.
        </p>
      </Card>
    );
  }

  const selectorWidget = renderWidgetState({
    darkMode,
    state: selectorState,
    title:
      selectorState === "loading"
        ? "Loading audiences"
        : selectorState === "empty"
          ? "No audience assigned"
          : selectorState === "permission"
            ? "Audience access restricted"
            : selectorState === "success"
              ? "Audience scope verified"
              : "Unable to load audience selector",
    description:
      selectorState === "loading"
        ? "Fetching your assigned audiences."
        : selectorState === "empty"
          ? "No audience is currently assigned to your account."
          : selectorState === "permission"
            ? "Your current role does not allow access to this audience selector."
            : selectorState === "success"
              ? "Only your assigned audiences are available."
              : "Retry the page or contact support if the problem persists.",
  });

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{greeting}</p>

          {audienceOptions.length > 1 ? (
            <div className="mt-4 w-full max-w-72">
              {selectorWidget ? (
                selectorWidget
              ) : (
                <Select
                  value={`Audience: ${audienceName}`}
                  options={audienceOptions}
                  onChange={onAudienceChange}
                  placeholder="Select assigned audience"
                />
              )}
            </div>
          ) : (
            <p className={cn("mt-4 text-lg font-semibold", darkMode ? "text-white" : "text-slate-900")}>
              {audienceName}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{unitName}</span>
            <span className="hidden sm:inline">•</span>
            <span>{organisationName}</span>
            <span className="hidden sm:inline">•</span>
            <span>{currentDate}</span>
          </div>
          <p className="mt-5 text-sm sm:text-base">{statusMessage}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button className="min-h-12 rounded-full px-5 py-3 text-sm">{primaryActionLabel}</Button>
        </div>
      </div>
    </div>
  );
}
