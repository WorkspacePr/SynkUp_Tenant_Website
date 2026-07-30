import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FolderInput,
  GraduationCap,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";

import { roleConfigs } from "@/features/dashboard/components/showcase";
import type { ListItem, RoleConfig, SessionRow } from "@/features/dashboard/components/showcase";

import type {
  ActivityItem,
  AttendanceFilter,
  AttentionItem,
  AttentionSeverity,
  OverviewMetric,
  QuickAction,
  SessionItem,
  SuperAdminDashboardData,
} from "./types";

function parseScopeLabel(scope: string | undefined) {
  if (!scope) {
    return "SynkUp University";
  }

  return scope.includes(":") ? (scope.split(":")[1]?.trim() ?? scope) : scope;
}

function parseSessionStat(stat: string) {
  const match = stat.match(/(\d+)\s*\/\s*(\d+)/);

  if (!match) {
    return { checkedIn: 0, total: 0 };
  }

  return {
    checkedIn: Number(match[1]),
    total: Number(match[2]),
  };
}

function mapSessionStatus(row: SessionRow): SessionItem["status"] {
  if (row.badgeTone === "live") return "live";
  if (row.badgeTone === "upcoming") return "upcoming";
  return "review";
}

function mapSessions(config: RoleConfig): SessionItem[] {
  return config.sessions.slice(0, 4).map((session, index) => {
    const parsed = parseSessionStat(session.stat);

    return {
      id: `${session.title}-${index}`,
      title: session.title,
      time: session.time,
      checkedIn: parsed.checkedIn,
      total: parsed.total,
      status: mapSessionStatus(session),
    };
  });
}

function mapMetrics(): OverviewMetric[] {
  return [
    {
      label: "Active Users",
      value: "2,847",
      helper: "+43 this week",
      trend: "Healthy growth",
      icon: Users,
    },
    {
      label: "Active Units",
      value: "12 / 12",
      helper: "All healthy",
      trend: "No restrictions",
      icon: Building2,
    },
    {
      label: "Today's Sessions",
      value: "18",
      helper: "3 live now",
      trend: "Steady flow",
      icon: CalendarDays,
    },
    {
      label: "Attendance Rate",
      value: "94.6%",
      helper: "Up 2.1%",
      trend: "Higher than yesterday",
      icon: BadgeCheck,
    },
  ];
}

function severityRank(severity: AttentionSeverity) {
  return {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }[severity];
}

function mapAttention(config: RoleConfig): AttentionItem[] {
  const source: AttentionItem[] = [
    {
      id: "duplicate-attendance",
      severity: "critical",
      title: "Duplicate attendance detected",
      description: "14 scans require review across flagged attendance records.",
      time: "2 mins ago",
      actionLabel: "Review",
    },
    {
      id: "role-confirmation",
      severity: "high",
      title: "Role changes awaiting confirmation",
      description:
        "2 high-risk permission updates still require re-auth confirmation.",
      time: "8 mins ago",
      actionLabel: "Confirm",
    },
    {
      id: "invite-expiry",
      severity: "medium",
      title: "Invitations expiring soon",
      description:
        "7 invitations expire within 48 hours and may delay onboarding.",
      time: "22 mins ago",
      actionLabel: "Open",
    },
    {
      id: "export-expiry",
      severity: "low",
      title: "Export links expiring today",
      description: "3 signed report links will expire unless they are regenerated.",
      time: "1 hour ago",
      actionLabel: "Renew",
    },
    {
      id: "dispute-timeout",
      severity: "high",
      title: "Disputes nearing timeout",
      description:
        "6 disputes are approaching SLA thresholds and need central review.",
      time: "1 hour ago",
      actionLabel: "Review",
    },
  ];

  return source
    .slice()
    .sort((left, right) => severityRank(left.severity) - severityRank(right.severity));
}

function mapActivity(items: ListItem[]): ActivityItem[] {
  return items.slice(0, 5).map((item, index) => ({
    id: `${item.title}-${index}`,
    title: item.title,
    subject: item.subtitle,
    time: item.meta?.split("|")[1]?.trim() ?? item.meta ?? "Recently",
    tone:
      item.title.toLowerCase().includes("override")
        ? "info"
        : item.title.toLowerCase().includes("role")
          ? "warning"
          : "success",
  }));
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

function buildHealthStrip(attentionItems: AttentionItem[], sessions: SessionItem[]) {
  const criticalCount = attentionItems.filter(
    (item) => item.severity === "critical" || item.severity === "high",
  ).length;
  const liveSessions = sessions.filter((session) => session.status === "live").length;

  if (criticalCount > 0) {
    return {
      tone: "warning" as const,
      title: "Needs Attention",
      summary: `${liveSessions} live sessions are active. ${criticalCount} high-priority issues need review today.`,
      actionLabel: "View Details",
    };
  }

  return {
    tone: "success" as const,
    title: "System Healthy",
    summary: `No critical attendance issues. ${liveSessions} live sessions are active and operations are stable.`,
    actionLabel: "View Details",
  };
}

export function buildSuperAdminDashboardData(params: {
  activeScope: string;
  userName?: string;
}): SuperAdminDashboardData {
  const config = roleConfigs.super;
  const sessions = mapSessions(config);
  const attentionItems = mapAttention(config);
  const organisationName = parseScopeLabel(params.activeScope || config.scopeOptions?.[0]);
  const firstName = params.userName?.split(" ")[0]?.trim() || "Admin";
  const currentHour = new Date().getHours();
  const greetingPrefix =
    currentHour < 12 ? "Good Morning" : currentHour < 17 ? "Good Afternoon" : "Good Evening";
  const totalCheckIns = sessions.reduce((sum, session) => sum + session.checkedIn, 0);

  const attendanceOverview: Record<AttendanceFilter, { activeFilter: AttendanceFilter; summary: string; points: Array<{ label: string; value: number }> }> =
    {
      today: {
        activeFilter: "today",
        summary: `${totalCheckIns.toLocaleString()} check-ins recorded today across 18 sessions. Attendance is up 2.1% from yesterday.`,
        points: [
          { label: "08:00", value: 18 },
          { label: "10:00", value: 42 },
          { label: "12:00", value: 61 },
          { label: "14:00", value: 74 },
          { label: "16:00", value: 58 },
        ],
      },
      yesterday: {
        activeFilter: "yesterday",
        summary: `Yesterday closed with 1,104 check-ins and two flagged exceptions that were resolved before close of day.`,
        points: [
          { label: "08:00", value: 15 },
          { label: "10:00", value: 38 },
          { label: "12:00", value: 57 },
          { label: "14:00", value: 67 },
          { label: "16:00", value: 51 },
        ],
      },
      "7days": {
        activeFilter: "7days",
        summary: `Attendance has remained stable over the last 7 days, with Friday showing the strongest session participation.`,
        points: [
          { label: "Mon", value: 56 },
          { label: "Tue", value: 61 },
          { label: "Wed", value: 59 },
          { label: "Thu", value: 69 },
          { label: "Fri", value: 74 },
          { label: "Sat", value: 51 },
          { label: "Sun", value: 63 },
        ],
      },
      "30days": {
        activeFilter: "30days",
        summary: `The 30-day trend shows steady growth in participation with only minor dips during maintenance windows.`,
        points: [
          { label: "Wk 1", value: 64 },
          { label: "Wk 2", value: 67 },
          { label: "Wk 3", value: 71 },
          { label: "Wk 4", value: 76 },
        ],
      },
      custom: {
        activeFilter: "custom",
        summary: `Custom range analytics are ready. Use the report workspace for deeper filters and exports.`,
        points: [
          { label: "Range 1", value: 49 },
          { label: "Range 2", value: 58 },
          { label: "Range 3", value: 66 },
          { label: "Range 4", value: 62 },
        ],
      },
    };

  return {
    greeting: `${greetingPrefix}, ${firstName} \u{1F44B}`,
    organisationName,
    statusMessage: "Everything is running normally today.",
    attentionSummary: `${attentionItems.length} items require your attention.`,
    primaryActionLabel: "Add User",
    metrics: mapMetrics(),
    healthStrip: buildHealthStrip(attentionItems, sessions),
    attentionItems,
    attendanceOverview,
    sessions,
    activity: mapActivity(config.extraBottomLeftItems ?? []),
    quickActions: mapQuickActions(),
  };
}
