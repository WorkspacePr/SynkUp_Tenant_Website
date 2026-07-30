"use client";

import type { LucideIcon } from "lucide-react";

import type {
  ActivityItem,
  AttentionItem,
  DashboardWidgetState,
  QuickAction,
} from "@/features/dashboard/components/super-admin/types";

export type UnitOverviewMetric = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: LucideIcon;
};

export type UnitHeaderAction = {
  id: string;
  label: string;
  variant: "primary" | "secondary";
};

export type UnitSessionItem = {
  id: string;
  audienceName: string;
  audienceAdmin: string;
  startTime: string;
  endTime: string;
  checkedIn: number;
  total: number;
  status: "live" | "upcoming" | "review";
};

export type UnitAttendanceFilter =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "custom";

export type UnitAttendancePoint = {
  label: string;
  value: number;
};

export type UnitAttendanceBreakdown = {
  present: string;
  late: string;
  absent: string;
  excused: string;
  flagged: string;
};

export type UnitAttendanceOverview = {
  activeFilter: UnitAttendanceFilter;
  summary: string;
  points: UnitAttendancePoint[];
  breakdown: UnitAttendanceBreakdown;
};

export type UnitAdminDashboardData = {
  greeting: string;
  unitName: string;
  organisationName: string;
  currentDate: string;
  statusMessage: string;
  headerActions: UnitHeaderAction[];
  metrics: UnitOverviewMetric[];
  attentionItems: AttentionItem[];
  sessions: UnitSessionItem[];
  attendanceViews: Record<UnitAttendanceFilter, UnitAttendanceOverview>;
  activity: ActivityItem[];
  quickActions: QuickAction[];
  widgetStates?: {
    attention?: DashboardWidgetState;
    sessions?: DashboardWidgetState;
    attendance?: DashboardWidgetState;
    activity?: DashboardWidgetState;
    actions?: DashboardWidgetState;
  };
};
