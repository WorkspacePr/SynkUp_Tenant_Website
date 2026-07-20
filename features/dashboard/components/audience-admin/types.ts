"use client";

import type { LucideIcon } from "lucide-react";

import type {
  ActivityItem,
  AttentionItem,
  DashboardWidgetState,
  QuickAction,
} from "@/features/dashboard/components/super-admin/types";
import type { SelectOption } from "@/features/dashboard/components/showcase";

export interface AudienceDashboardContext {
  audienceName: string;
  unitName: string;
  organisationName: string;
  currentDate: string;
}

export interface AudienceDashboardMetric {
  id: string;
  label: string;
  value: number | string;
  supportingText?: string;
  icon: LucideIcon;
}

export interface AudienceSessionSummary {
  id: string;
  title: string;
  audienceName: string;
  startsAt: string;
  endsAt: string;
  status:
    | "live"
    | "upcoming"
    | "completed"
    | "delayed"
    | "requires_review"
    | "locked"
    | "archived";
  checkedInCount: number;
  expectedCount?: number;
  lateCount?: number;
  flaggedCount?: number;
  actor?: string;
}

export type AudienceAttendanceFilter =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "custom";

export interface AudienceAttendanceOverview {
  activeFilter: AudienceAttendanceFilter;
  summary: string;
  points: Array<{ label: string; value: number }>;
  breakdown: {
    present: string;
    late: string;
    absent: string;
    excused: string;
    flagged: string;
  };
}

export interface LiveSessionWorkspaceData {
  state: "live" | "next" | "none";
  title: string;
  sessionName?: string;
  audienceName?: string;
  startsAt?: string;
  endsAt?: string;
  timeLabel?: string;
  checkedInCount?: number;
  expectedCount?: number;
  lateCount?: number;
  flaggedCount?: number;
  attendancePercentage?: number;
}

export interface AudienceAdminDashboardData {
  greeting: string;
  statusMessage: string;
  primaryActionLabel: string;
  audienceOptions: SelectOption[];
  selectedAudience: string;
  context: AudienceDashboardContext;
  liveWorkspace: LiveSessionWorkspaceData;
  metrics: AudienceDashboardMetric[];
  attentionItems: AttentionItem[];
  sessions: AudienceSessionSummary[];
  attendanceViews: Record<AudienceAttendanceFilter, AudienceAttendanceOverview>;
  activity: ActivityItem[];
  quickActions: QuickAction[];
  widgetStates?: {
    selector?: DashboardWidgetState;
    liveWorkspace?: DashboardWidgetState;
    metrics?: DashboardWidgetState;
    attention?: DashboardWidgetState;
    sessions?: DashboardWidgetState;
    attendance?: DashboardWidgetState;
    activity?: DashboardWidgetState;
    actions?: DashboardWidgetState;
  };
}
