"use client";

import { memo } from "react";

import {
  PerformanceCard,
  RoleMetrics,
  SessionCard,
  TrendCard,
  roleConfigs,
} from "@/features/dashboard/components/showcase";

import { buildSuperAdminDashboardData } from "./adapters";
import { AttentionPanel } from "./AttentionPanel";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSection } from "./DashboardSection";
import { HealthStatusStrip } from "./HealthStatusStrip";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";

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
  const data = buildSuperAdminDashboardData({
    activeScope,
    userName,
  });
  const config = roleConfigs.super;
  const chartHeights = [41, 48, 43, 57, 51, 62, 58];

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
          heights={chartHeights}
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
        <SessionCard config={config} darkMode={darkMode} role="super" />
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        <RecentActivity darkMode={darkMode} items={data.activity} />
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
