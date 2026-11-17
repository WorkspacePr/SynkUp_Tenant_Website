import { CalendarPlus2, FileSpreadsheet, FolderInput, GraduationCap, ShieldCheck, UserPlus, Users } from "lucide-react";

import type { UnitAdminDashboardResponse } from "@/features/dashboard/api/unit-admin-dashboard";
import type { ActivityItem, AttentionItem, QuickAction } from "@/features/dashboard/components/super-admin/types";
import type { UnitAdminDashboardData, UnitOverviewMetric, UnitSessionItem } from "./types";

function formatGreeting(userName?: string) {
  const firstName = userName?.split(" ")[0]?.trim() || "Admin";
  const hour = new Date().getHours();
  const prefix = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return `${prefix}, ${firstName} \u{1F44B}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" }).format(date);
}

function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000], ["month", 2_592_000], ["day", 86_400], ["hour", 3_600], ["minute", 60],
  ];
  for (const [unit, size] of ranges) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function mapMetrics(response: UnitAdminDashboardResponse): UnitOverviewMetric[] {
  const change = response.attendance.comparison.change;
  return [
    { label: "Unit Members", value: response.summary.total_members.toLocaleString(), helper: "Distinct active members", trend: response.scope.is_aggregate ? "Across assigned units" : "In this unit", icon: Users },
    { label: "Active Audiences", value: response.audiences.active.toLocaleString(), helper: `${response.audiences.inactive.toLocaleString()} inactive`, trend: `${response.audiences.total.toLocaleString()} total audiences`, icon: GraduationCap },
    { label: "Live Sessions", value: response.summary.active_sessions.toLocaleString(), helper: `${response.summary.upcoming_sessions.toLocaleString()} upcoming`, trend: `${response.summary.completed_sessions.toLocaleString()} completed in ${response.reporting_period.days} days`, icon: CalendarPlus2 },
    { label: "Attendance Rate", value: `${response.summary.attendance_rate.toFixed(1)}%`, helper: `${change > 0 ? "+" : ""}${change.toFixed(1)} percentage points`, trend: `Previous period: ${response.attendance.comparison.previous_rate.toFixed(1)}%`, icon: ShieldCheck },
  ];
}

function mapSessions(response: UnitAdminDashboardResponse): UnitSessionItem[] {
  return response.session_activity.recent_sessions.map((session) => ({
    id: session.id,
    audienceName: session.audience_name,
    sessionName: session.name,
    unitName: session.unit_name,
    startTime: formatTime(session.starts_at),
    endTime: formatTime(session.ends_at),
    checkedIn: session.present_count + session.late_count,
    total: session.expected_count,
    status: session.status === "active" ? "live" : session.status === "upcoming" ? "upcoming" : "review",
  }));
}

function mapAttention(response: UnitAdminDashboardResponse): AttentionItem[] {
  return response.attention_required.map((item) => ({
    id: item.id,
    severity: item.severity === "critical" ? "critical" : "medium",
    title: item.title,
    description: item.description,
    time: relativeTime(item.occurred_at),
    actionLabel: item.action_url ? "Review" : "View",
    actionType: item.type,
    reference: item.action_url ? { action_url: item.action_url } : null,
  }));
}

function mapActivity(response: UnitAdminDashboardResponse): ActivityItem[] {
  return response.recent_activity.map((item) => ({
    id: item.id,
    title: item.title,
    subject: [item.actor_name, item.description].filter(Boolean).join(" · ") || "Unit activity",
    time: relativeTime(item.occurred_at),
    tone: item.type.toLowerCase().includes("fail") ? "warning" : "info",
  }));
}

function mapQuickActions(): QuickAction[] {
  return [
    { id: "add-user", title: "Add User", icon: UserPlus },
    { id: "import-users", title: "Import Users", icon: FolderInput },
    { id: "create-audience", title: "Create Audience", icon: GraduationCap },
    { id: "create-session", title: "Create Session", icon: CalendarPlus2 },
    { id: "export-report", title: "Export Report", icon: FileSpreadsheet },
  ];
}

export function mapUnitAdminDashboardData(params: { response: UnitAdminDashboardResponse; userName?: string }): UnitAdminDashboardData {
  const { response } = params;
  const attentionCount = response.attention_required.length;
  const maxTrendRate = Math.max(...response.attendance_trend.map((item) => item.rate), 1);
  return {
    greeting: formatGreeting(params.userName),
    unitName: response.scope.unit_name ?? "All assigned units",
    organisationName: response.scope.tenant_name,
    currentDate: formatDate(response.generated_at),
    statusMessage: attentionCount ? `${attentionCount} item${attentionCount === 1 ? "" : "s"} need your attention.` : "Everything is running normally across your unit scope.",
    headerActions: [
      { id: "create-session", label: "Create Session", variant: "primary" },
      { id: "create-audience", label: "Create Audience", variant: "secondary" },
      { id: "add-user", label: "Add User", variant: "secondary" },
    ],
    metrics: mapMetrics(response),
    attentionItems: mapAttention(response),
    sessions: mapSessions(response),
    trendHeights: response.attendance_trend.map((item) => item.rate === 0 ? 4 : Math.max(8, Math.round((item.rate / maxTrendRate) * 100))),
    trendLabels: response.attendance_trend.map((item) => item.label),
    performanceBars: response.audiences.items.filter((item) => item.last_attendance_rate !== null).slice(0, 5).map((item) => ({ label: item.name, value: item.last_attendance_rate ?? 0 })),
    activity: mapActivity(response),
    quickActions: mapQuickActions(),
  };
}
