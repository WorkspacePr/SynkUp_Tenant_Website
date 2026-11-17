"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

import {
  PerformanceCard,
  RoleMetrics,
  SessionCard,
  TrendCard,
  roleConfigs,
} from "@/features/dashboard/components/showcase";
import type { SuperAdminDashboardResponse } from "@/features/dashboard/api/super-admin-dashboard";
import { getSuperAdminDashboard } from "@/features/dashboard/api/super-admin-dashboard";

import { mapSuperAdminDashboardData } from "./adapters";
import { AttentionPanel } from "./AttentionPanel";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSection } from "./DashboardSection";
import { HealthStatusStrip } from "./HealthStatusStrip";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import { renderWidgetState } from "./DashboardStates";

type SuperAdminDashboardProps = {
  darkMode: boolean;
  activeScope: string;
  userName?: string;
};

function SuperAdminDashboardComponent({
  darkMode,
  activeScope,
  userName = "John Doe",
}: SuperAdminDashboardProps) {
  const [response, setResponse] = useState<SuperAdminDashboardResponse | null>(null);
  const [requestState, setRequestState] = useState<"loading" | "error" | "permission" | "default">("loading");
  const [requestMessage, setRequestMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setRequestState("loading");

    void getSuperAdminDashboard().then((result) => {
      if (!active) return;
      if (!result.success) {
        setRequestMessage(result.message);
        setRequestState(result.status === 401 || result.status === 403 ? "permission" : "error");
        return;
      }

      setResponse(result.data);
      setRequestMessage("");
      setRequestState("default");
    });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const data = useMemo(
    () => response ? mapSuperAdminDashboardData({ response, activeScope, userName }) : null,
    [activeScope, response, userName],
  );
  const config = useMemo(
    () => data ? {
      ...roleConfigs.super,
      metrics: data.metrics,
      performanceBars: data.performanceBars,
      sessions: data.sessions,
    } : roleConfigs.super,
    [data],
  );

  if (!data) {
    return (
      <div className="space-y-6 py-4">
        {renderWidgetState({
          darkMode,
          state: requestState === "default" ? "error" : requestState,
          title:
            requestState === "loading"
              ? "Loading Super Admin dashboard"
              : requestState === "permission"
                ? "Super Admin access is required"
                : "Unable to load the dashboard",
          description:
            requestState === "loading"
              ? "Preparing the latest organisation metrics, sessions, and activity."
              : requestMessage || "Try loading the dashboard again.",
          onRetry: retry,
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <DashboardHeader
        darkMode={darkMode}
        greeting={data.greeting}
        organisationName={data.organisationName}
        statusMessage={data.statusMessage}
        attentionSummary={data.attentionSummary}
        primaryActionLabel={data.primaryActionLabel}
      />

      <DashboardSection darkMode={darkMode}>
        <RoleMetrics darkMode={darkMode} metrics={config.metrics} />
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        <HealthStatusStrip darkMode={darkMode} strip={data.healthStrip} />
      </DashboardSection>

      <DashboardSection
        darkMode={darkMode}
        title="Attention Required"
        subtitle="One place to review the issues that matter most right now."
        action={
          <button type="button" className="text-sm font-semibold text-primary">
            View all
          </button>
        }
      >
        <AttentionPanel darkMode={darkMode} items={data.attentionItems} />
      </DashboardSection>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <TrendCard
          title={config.trendTitle}
          subtitle={config.trendSubtitle}
          darkMode={darkMode}
          heights={data.trendHeights}
          labels={data.trendLabels}
          role="super"
        />
        <PerformanceCard
          title={config.performanceTitle}
          subtitle={config.performanceSubtitle}
          bars={config.performanceBars}
          darkMode={darkMode}
        />
      </div>

      <DashboardSection darkMode={darkMode}>
        {data.sessions.length > 0 ? (
          <SessionCard config={config} darkMode={darkMode} role="super" />
        ) : (
          renderWidgetState({
            darkMode,
            state: "empty",
            title: "No sessions today",
            description: "No live or upcoming sessions are scheduled right now.",
          })
        )}
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        <RecentActivity
          darkMode={darkMode}
          items={data.activity}
          state={data.activity.length > 0 ? "default" : "empty"}
        />
      </DashboardSection>

      <DashboardSection
        darkMode={darkMode}
        title="Quick Actions"
        subtitle="Fast access to the workflows you perform most often."
      >
        <QuickActions darkMode={darkMode} actions={data.quickActions} />
      </DashboardSection>
    </div>
  );
}

export const SuperAdminDashboard = memo(SuperAdminDashboardComponent);
