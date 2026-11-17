"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

import {
  PerformanceCard,
  TrendCard,
  roleConfigs,
} from "@/features/dashboard/components/showcase";
import type { UnitAdminDashboardResponse } from "@/features/dashboard/api/unit-admin-dashboard";
import { getUnitAdminDashboard } from "@/features/dashboard/api/unit-admin-dashboard";
import { AttentionPanel } from "@/features/dashboard/components/super-admin/AttentionPanel";
import { DashboardSection } from "@/features/dashboard/components/super-admin/DashboardSection";
import { QuickActions } from "@/features/dashboard/components/super-admin/QuickActions";
import { RecentActivity } from "@/features/dashboard/components/super-admin/RecentActivity";
import { renderWidgetState } from "@/features/dashboard/components/super-admin/DashboardStates";

import { mapUnitAdminDashboardData } from "./adapters";
import { UnitAdminHeader } from "./UnitAdminHeader";
import { UnitOverviewMetrics } from "./UnitOverviewMetrics";
import { UnitSessionWorkspace } from "./UnitSessionWorkspace";

type UnitAdminDashboardProps = {
  darkMode: boolean;
  activeScope: string;
  unitId?: number;
  userName?: string;
};

function UnitAdminDashboardComponent({
  darkMode,
  activeScope,
  unitId,
  userName = "Admin",
}: UnitAdminDashboardProps) {
  const config = roleConfigs.unit;
  const [response, setResponse] = useState<UnitAdminDashboardResponse | null>(null);
  const [requestState, setRequestState] = useState<"loading" | "error" | "permission" | "default">("loading");
  const [requestMessage, setRequestMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setResponse(null);
    setRequestState("loading");

    void getUnitAdminDashboard(unitId).then((result) => {
      if (!active) return;
      if (!result.success) {
        setResponse(null);
        setRequestMessage(result.message);
        setRequestState(result.status === 401 || result.status === 403 ? "permission" : "error");
        return;
      }
      setResponse(result.data);
      setRequestMessage("");
      setRequestState("default");
    });

    return () => { active = false; };
  }, [reloadKey, unitId]);

  const data = useMemo(
    () => response ? mapUnitAdminDashboardData({ response, userName }) : null,
    [response, userName],
  );

  if (!data) {
    return (
      <div className="space-y-6 py-4">
        {renderWidgetState({
          darkMode,
          state: requestState === "default" ? "error" : requestState,
          title: requestState === "loading" ? "Loading Unit Admin dashboard" : requestState === "permission" ? "Unit Admin access is required" : "Unable to load the dashboard",
          description: requestState === "loading" ? `Preparing the latest metrics for ${activeScope}.` : requestMessage || "Try loading the dashboard again.",
          onRetry: retry,
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <UnitAdminHeader
        darkMode={darkMode}
        greeting={data.greeting}
        unitName={data.unitName}
        organisationName={data.organisationName}
        currentDate={data.currentDate}
        statusMessage={data.statusMessage}
        actions={data.headerActions}
      />

      <DashboardSection darkMode={darkMode}>
        <UnitOverviewMetrics metrics={data.metrics} />
      </DashboardSection>

      <DashboardSection
        darkMode={darkMode}
        title="Attention Required"
        subtitle="Review attendance, user, and audience issues that need unit action."
        action={<button type="button" className="text-sm font-semibold text-primary">View all</button>}
      >
        {data.attentionItems.length > 0 ? (
          <AttentionPanel darkMode={darkMode} items={data.attentionItems} />
        ) : (
          renderWidgetState({ darkMode, state: "success", title: "Nothing needs attention", description: "There are no unit issues requiring action right now." })
        )}
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        <UnitSessionWorkspace darkMode={darkMode} sessions={data.sessions} state={data.sessions.length > 0 ? "default" : "empty"} />
      </DashboardSection>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <TrendCard
          title={config.trendTitle}
          subtitle={config.trendSubtitle}
          darkMode={darkMode}
          heights={data.trendHeights}
          labels={data.trendLabels}
          role="unit"
        />
        <PerformanceCard
          title={config.performanceTitle}
          subtitle={config.performanceSubtitle}
          bars={data.performanceBars}
          darkMode={darkMode}
        />
      </div>

      <DashboardSection darkMode={darkMode}>
        <RecentActivity darkMode={darkMode} items={data.activity} state={data.activity.length > 0 ? "default" : "empty"} />
      </DashboardSection>

      <DashboardSection
        darkMode={darkMode}
        title="Quick Actions"
        subtitle="Fast access to the most common unit workflows."
      >
        <QuickActions darkMode={darkMode} actions={data.quickActions} />
      </DashboardSection>
    </div>
  );
}

export const UnitAdminDashboard = memo(UnitAdminDashboardComponent);
