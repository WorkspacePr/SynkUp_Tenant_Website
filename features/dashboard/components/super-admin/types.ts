"use client";

import type { LucideIcon } from "lucide-react";

export type DashboardWidgetState =
  | "default"
  | "loading"
  | "empty"
  | "error"
  | "permission"
  | "success";

export type OverviewMetric = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  icon: LucideIcon;
};

export type HealthStripTone = "success" | "warning" | "danger" | "info";

export type HealthStrip = {
  tone: HealthStripTone;
  title: string;
  summary: string;
  actionLabel: string;
};

export type AttentionSeverity = "critical" | "high" | "medium" | "low";

export type AttentionItem = {
  id: string;
  severity: AttentionSeverity;
  title: string;
  description: string;
  time: string;
  actionLabel: string;
};

export type AttendanceFilter =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "custom";

export type AttendanceSeries = {
  label: string;
  value: number;
};

export type AttendanceOverviewData = {
  activeFilter: AttendanceFilter;
  summary: string;
  points: AttendanceSeries[];
};

export type SessionStatus = "live" | "upcoming" | "review";

export type SessionItem = {
  id: string;
  title: string;
  time: string;
  checkedIn: number;
  total: number;
  status: SessionStatus;
};

export type ActivityTone = "success" | "warning" | "info" | "neutral";

export type ActivityItem = {
  id: string;
  title: string;
  subject: string;
  time: string;
  tone: ActivityTone;
};

export type QuickAction = {
  id: string;
  title: string;
  icon: LucideIcon;
};

export type SuperAdminDashboardData = {
  greeting: string;
  organisationName: string;
  statusMessage: string;
  attentionSummary: string;
  primaryActionLabel: string;
  metrics: OverviewMetric[];
  healthStrip: HealthStrip;
  attentionItems: AttentionItem[];
  attendanceOverview: Record<AttendanceFilter, AttendanceOverviewData>;
  sessions: SessionItem[];
  activity: ActivityItem[];
  quickActions: QuickAction[];
};
