"use client";

import { memo } from "react";

import {
  PerformanceCard,
  RoleMetrics,
  TrendCard,
  roleConfigs,
} from "@/features/dashboard/components/showcase";
import { AttentionPanel } from "@/features/dashboard/components/super-admin/AttentionPanel";
import { DashboardSection } from "@/features/dashboard/components/super-admin/DashboardSection";
import { QuickActions } from "@/features/dashboard/components/super-admin/QuickActions";
import { RecentActivity } from "@/features/dashboard/components/super-admin/RecentActivity";

import { buildUnitAdminDashboardData } from "./adapters";
import { UnitAdminHeader } from "./UnitAdminHeader";
import { UnitSessionWorkspace } from "./UnitSessionWorkspace";

type UnitAdminDashboardProps = {
  darkMode: boolean;
  activeScope: string;
  userName?: string;
};

function UnitAdminDashboardComponent({
  darkMode,
  activeScope,
  userName = "John Doe",
}: UnitAdminDashboardProps) {
  const config = roleConfigs.unit;
  const data = buildUnitAdminDashboardData({
    activeScope,
    userName,
  });
  const chartHeights = [34, 58, 42, 71, 65, 35, 43];

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
        <RoleMetrics darkMode={darkMode} metrics={config.metrics} />
      </DashboardSection>

      <DashboardSection
        darkMode={darkMode}
        title="Attention Required"
        subtitle="Review attendance, user, and audience issues that need unit action."
        action={<button type="button" className="text-sm font-semibold text-primary">View all</button>}
      >
        <AttentionPanel darkMode={darkMode} items={data.attentionItems} />
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        <UnitSessionWorkspace darkMode={darkMode} sessions={data.sessions} />
      </DashboardSection>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <TrendCard
          title={config.trendTitle}
          subtitle={config.trendSubtitle}
          darkMode={darkMode}
          heights={chartHeights}
          role="unit"
        />
        <PerformanceCard
          title={config.performanceTitle}
          subtitle={config.performanceSubtitle}
          bars={config.performanceBars}
          darkMode={darkMode}
        />
      </div>

      <DashboardSection darkMode={darkMode}>
        <RecentActivity darkMode={darkMode} items={data.activity} />
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
