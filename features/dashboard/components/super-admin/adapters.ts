import {
  Building2,
  CreditCard,
  FolderInput,
  GraduationCap,
  Plus,
  UserPlus,
  Users,
  Waves,
} from "lucide-react";
import { createElement } from "react";

import type {
  DashboardRateMetric,
  SuperAdminDashboardResponse,
} from "@/features/dashboard/api/super-admin-dashboard";
import type {
  MetricCardData,
  SessionRow,
} from "@/features/dashboard/components/showcase";

import type {
  ActivityItem,
  AttentionItem,
  HealthStrip,
  QuickAction,
  SuperAdminDashboardData,
} from "./types";

function parseScopeLabel(scope: string | undefined) {
  if (!scope) return "Organisation";
  return scope.includes(":") ? (scope.split(":")[1]?.trim() ?? scope) : scope;
}

function formatPercentage(value: number | null) {
  return value === null ? "Unavailable" : `${value.toFixed(1)}%`;
}

function metricChange(
  metric: DashboardRateMetric,
  positiveIsGood: boolean,
): Pick<MetricCardData, "trend" | "trendTone"> {
  if (!metric.available || metric.change_vs_previous_period === null) {
    return { trend: "No comparison available", trendTone: "neutral" };
  }

  const change = metric.change_vs_previous_period;
  if (change === 0) {
    return { trend: "No change vs previous period", trendTone: "neutral" };
  }

  const improved = positiveIsGood ? change > 0 : change < 0;
  return {
    trend: `${change > 0 ? "Up" : "Down"} ${Math.abs(change).toFixed(1)} pts vs previous period`,
    trendTone: improved ? "success" : "warning",
  };
}

function unavailableText(metric: DashboardRateMetric) {
  return metric.available
    ? `${metric.numerator ?? 0} of ${metric.denominator ?? 0}`
    : metric.unavailable_reason ?? "This metric is not available yet.";
}

function mapMetrics(data: SuperAdminDashboardResponse): MetricCardData[] {
  const metrics = data.summary_metrics;
  const invitation = metrics.invitation_acceptance_rate;
  const dispute = metrics.attendance_dispute_rate;
  const duplicate = metrics.duplicate_attendance_rate;
  const lateSync = metrics.late_sync_rate;
  const failedQr = metrics.failed_qr_validation_rate;

  return [
    {
      title: "Subscription",
      value: metrics.subscription.available
        ? `${metrics.subscription.status?.toUpperCase() ?? "UNKNOWN"}\n(${metrics.subscription.plan_name ?? "No plan"})`
        : "Unavailable",
      accent: metrics.subscription.status === "active" ? "green" : "plain",
      subtitle: "Billing state",
      trend: metrics.subscription.available ? "Current subscription" : "No subscription found",
      trendTone: metrics.subscription.status === "active" ? "success" : "warning",
      icon: createElement(CreditCard, { className: "h-9 w-9" }),
    },
    {
      title: "Invite\nAcceptance",
      value: formatPercentage(invitation.value),
      subtitle: `${invitation.pending_count ?? 0} pending invites`,
      ...metricChange(invitation, true),
      icon: createElement(Users, { className: "h-9 w-9" }),
    },
    {
      title: "Dispute\nRate",
      value: formatPercentage(dispute.value),
      subtitle: unavailableText(dispute),
      ...metricChange(dispute, false),
      icon: createElement(Building2, { className: "h-9 w-9 text-rose-300" }),
    },
    {
      title: "Duplicate\nAttendance",
      value: formatPercentage(duplicate.value),
      subtitle: `${duplicate.flagged_duplicate_count ?? 0} duplicate check-ins`,
      ...metricChange(duplicate, false),
      icon: createElement(Waves, { className: "h-9 w-9 text-green-500" }),
    },
    {
      title: "Late Sync\nand QR Fail",
      value: `${lateSync.value === null ? "N/A" : `${lateSync.value.toFixed(1)}%`} / ${failedQr.value === null ? "N/A" : `${failedQr.value.toFixed(1)}%`}`,
      subtitle: lateSync.available ? "Late sync / failed QR" : "Late sync unavailable / failed QR",
      ...metricChange(failedQr, false),
      icon: createElement(Waves, { className: "h-9 w-9 -rotate-45 text-slate-400" }),
    },
  ];
}

function relativeTime(timestamp: string) {
  const value = new Date(timestamp).getTime();
  if (!Number.isFinite(value)) return "Recently";

  const differenceSeconds = Math.round((value - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(differenceSeconds) < 60) {
    return formatter.format(differenceSeconds, "second");
  }

  const minutes = Math.round(differenceSeconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");

  return formatter.format(Math.round(hours / 24), "day");
}

function attentionActionLabel(actionType: string | null) {
  return {
    attendance_record: "Review",
    invitation: "Open",
    report: "View report",
  }[actionType ?? ""] ?? "View";
}

function mapAttention(data: SuperAdminDashboardResponse): AttentionItem[] {
  return data.attention_queue.map((item) => ({
    id: item.id,
    severity: item.severity === "critical" ? "critical" : "high",
    title: item.title,
    description: item.description,
    time: relativeTime(item.timestamp),
    actionLabel: attentionActionLabel(item.action_type),
    actionType: item.action_type,
    reference: item.reference,
  }));
}

function mapHealth(data: SuperAdminDashboardResponse): HealthStrip {
  const health = data.system_health;
  const serviceSummary = health.unhealthy_services
    .map((service) => `${service.service}: ${service.status}`)
    .join(", ");

  return {
    tone:
      health.state === "healthy"
        ? "success"
        : health.state === "critical"
          ? "danger"
          : "warning",
    title:
      health.state === "healthy"
        ? "System Healthy"
        : health.state === "critical"
          ? "Critical Attention Required"
          : "Needs Attention",
    summary:
      serviceSummary ||
      (health.attention_count > 0
        ? `${health.attention_count} operational item${health.attention_count === 1 ? "" : "s"} need review.`
        : "No current tenant or service conditions require attention."),
    actionLabel: "View Details",
  };
}

function formatSessionTime(timestamp: string) {
  const value = new Date(timestamp);
  if (Number.isNaN(value.getTime())) return timestamp;
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function mapSessions(data: SuperAdminDashboardResponse): SessionRow[] {
  return data.sessions.map((session) => ({
    title: session.name,
    meta: `${session.audience_name}   ${session.unit_name}`,
    time: formatSessionTime(session.start_time),
    stat: `${session.present_count}/${session.eligible_count} present`,
    badge: session.status === "active" ? "LIVE" : "UPCOMING",
    badgeTone: session.status === "active" ? "live" : "upcoming",
  }));
}

function mapActivity(data: SuperAdminDashboardResponse): ActivityItem[] {
  return data.recent_activity.map((item) => {
    const subject = [
      item.actor ? `Actor: ${item.actor}` : null,
      item.target ? `Target: ${item.target}` : null,
      item.scope.unit_name ? `Unit: ${item.scope.unit_name}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      id: String(item.log_id),
      title: item.event,
      subject: subject || item.subject_type || "Organisation activity",
      time: relativeTime(item.timestamp),
      tone:
        item.tone === "positive"
          ? "success"
          : item.tone === "warning" || item.tone === "negative"
            ? "warning"
            : "neutral",
    };
  });
}

function mapQuickActions(): QuickAction[] {
  return [
    { id: "add-user", title: "Add User", icon: UserPlus },
    { id: "import-users", title: "Import Users", icon: FolderInput },
    { id: "create-unit", title: "Create Unit", icon: Building2 },
    { id: "create-audience", title: "Create Audience", icon: GraduationCap },
    { id: "create-session", title: "Create Session", icon: Plus },
  ];
}

function weekdayLabel(date: string) {
  const value = new Date(`${date}T12:00:00`);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(value);
}

export function mapSuperAdminDashboardData(params: {
  response: SuperAdminDashboardResponse;
  activeScope: string;
  userName?: string;
}): SuperAdminDashboardData {
  const { response } = params;
  const firstName = params.userName?.split(" ")[0]?.trim() || "Admin";
  const currentHour = new Date().getHours();
  const greetingPrefix =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
        ? "Good Afternoon"
        : "Good Evening";
  const attentionCount = response.system_health.attention_count;

  return {
    greeting: `${greetingPrefix}, ${firstName} 👋`,
    organisationName: parseScopeLabel(params.activeScope),
    statusMessage:
      response.system_health.state === "healthy"
        ? "Everything is running normally today."
        : `${attentionCount} item${attentionCount === 1 ? "" : "s"} currently need attention.`,
    attentionSummary: `${attentionCount} item${attentionCount === 1 ? "" : "s"} require your attention.`,
    primaryActionLabel: "Add User",
    metrics: mapMetrics(response),
    healthStrip: mapHealth(response),
    attentionItems: mapAttention(response),
    trendHeights: response.attendance_trend.map((point) => point.attendance_rate),
    trendLabels: response.attendance_trend.map((point) => weekdayLabel(point.date)),
    performanceBars: response.unit_performance.map((unit) => ({
      label: unit.unit_name,
      value: unit.attendance_rate,
    })),
    sessions: mapSessions(response),
    activity: mapActivity(response),
    quickActions: mapQuickActions(),
  };
}
