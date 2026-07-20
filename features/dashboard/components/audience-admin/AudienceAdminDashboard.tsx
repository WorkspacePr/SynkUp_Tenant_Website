"use client";

import { memo } from "react";

import { AttentionPanel } from "@/features/dashboard/components/super-admin/AttentionPanel";
import { DashboardSection } from "@/features/dashboard/components/super-admin/DashboardSection";
import { QuickActions } from "@/features/dashboard/components/super-admin/QuickActions";
import { RecentActivity } from "@/features/dashboard/components/super-admin/RecentActivity";
import {
  AudienceLivePanelMatch,
  AudienceMetrics,
  roleConfigs,
  type SelectOption,
} from "@/features/dashboard/components/showcase";

import { buildAudienceAdminDashboardData } from "./adapters";
import { AudienceDashboardHeader } from "./AudienceDashboardHeader";
import { TodayAudienceSessions } from "./TodayAudienceSessions";

type AudienceAdminDashboardProps = {
  darkMode: boolean;
  activeScope: string;
  assignedAudienceOptions: SelectOption[];
  userName?: string;
  onAudienceChange: (value: string) => void;
};

function AudienceAdminDashboardComponent({
  darkMode,
  activeScope,
  assignedAudienceOptions,
  userName = "John Doe",
  onAudienceChange,
}: AudienceAdminDashboardProps) {
  const config = roleConfigs.audience;
  const data = buildAudienceAdminDashboardData({
    activeScope,
    assignedAudienceOptions,
    userName,
  });

  return (
    <div className="space-y-6 py-4">
      <AudienceDashboardHeader
        darkMode={darkMode}
        greeting={data.greeting}
        audienceName={data.context.audienceName}
        unitName={data.context.unitName}
        organisationName={data.context.organisationName}
        currentDate={data.context.currentDate}
        statusMessage={data.statusMessage}
        primaryActionLabel={data.primaryActionLabel}
        audienceOptions={data.audienceOptions}
        onAudienceChange={onAudienceChange}
      />
      
      <DashboardSection darkMode={darkMode}>
        <AudienceMetrics metrics={config.metrics} darkMode={darkMode} />
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        {config.audienceLivePanel ? (
          <AudienceLivePanelMatch panel={config.audienceLivePanel} darkMode={darkMode} />
        ) : null}
      </DashboardSection>

      <DashboardSection
        darkMode={darkMode}
        title="Attention Required"
        subtitle="Issues requiring action for the selected audience."
        action={<button type="button" className="text-sm font-semibold text-primary">View all</button>}
      >
        <AttentionPanel darkMode={darkMode} items={data.attentionItems} />
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        <TodayAudienceSessions darkMode={darkMode} sessions={data.sessions} />
      </DashboardSection>

      <DashboardSection darkMode={darkMode}>
        <RecentActivity darkMode={darkMode} items={data.activity} />
      </DashboardSection>

      <DashboardSection
        darkMode={darkMode}
        title="Quick Actions"
        subtitle="Audience-scoped shortcuts for your most common tasks."
      >
        <QuickActions darkMode={darkMode} actions={data.quickActions} />
      </DashboardSection>
    </div>
  );
}

export const AudienceAdminDashboard = memo(AudienceAdminDashboardComponent);
