import {
  CalendarPlus2,
  FileSpreadsheet,
  FolderInput,
  GraduationCap,
  LayoutList,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { roleConfigs } from "@/features/dashboard/components/showcase";
import type { ListItem, RoleConfig, SessionRow } from "@/features/dashboard/components/showcase";
import type { ActivityItem, AttentionItem, QuickAction } from "@/features/dashboard/components/super-admin/types";

import type {
  UnitAdminDashboardData,
  UnitAttendanceFilter,
  UnitAttendanceOverview,
  UnitOverviewMetric,
  UnitSessionItem,
} from "./types";

function parseScopeLabel(scope: string | undefined) {
  if (!scope) return "Legacy Campus";
  return scope.includes(":") ? (scope.split(":")[1]?.trim() ?? scope) : scope;
}

function formatGreeting(userName?: string) {
  const firstName = userName?.split(" ")[0]?.trim() || "Admin";
  const hour = new Date().getHours();
  const prefix =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return `${prefix}, ${firstName} \u{1F44B}`;
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

function mapSessionStatus(row: SessionRow): UnitSessionItem["status"] {
  if (row.badgeTone === "live") return "live";
  if (row.badgeTone === "upcoming") return "upcoming";
  return "review";
}

function mapSessions(config: RoleConfig): UnitSessionItem[] {
  const admins = [
    "Dr. Betty",
    "Mr. James",
    "Mrs. Imekan",
    "Mr. Babalola",
  ];

  return config.sessions.slice(0, 4).map((session, index) => {
    const parsed = parseSessionStat(session.stat);
    const timeParts = session.time.split("-");
    return {
      id: `${session.title}-${index}`,
      audienceName: session.title,
      audienceAdmin: admins[index] ?? "Audience Admin",
      startTime: timeParts[0]?.trim() || session.time,
      endTime: timeParts[1]?.trim() || session.time,
      checkedIn: parsed.checkedIn,
      total: parsed.total,
      status: mapSessionStatus(session),
    };
  });
}

function mapMetrics(): UnitOverviewMetric[] {
  return [
    {
      label: "Unit Users",
      value: "1,284",
      helper: "+12 this week",
      trend: "Steady onboarding",
      icon: Users,
    },
    {
      label: "Active Audiences",
      value: "26",
      helper: "2 need admin",
      trend: "Coverage gap detected",
      icon: GraduationCap,
    },
    {
      label: "Today's Sessions",
      value: "8",
      helper: "3 live now",
      trend: "2 start in the next hour",
      icon: CalendarPlus2,
    },
    {
      label: "Attendance Rate",
      value: "92.1%",
      helper: "Up 1.4%",
      trend: "Better than yesterday",
      icon: ShieldCheck,
    },
  ];
}

function mapAttention(): AttentionItem[] {
  return [
    {
      id: "flagged-attendance",
      severity: "critical",
      title: "Duplicate attendance spike",
      description: "9 flagged scans need review before unit attendance closes today.",
      time: "6 mins ago",
      actionLabel: "Review",
    },
    {
      id: "pending-disputes",
      severity: "high",
      title: "Pending disputes",
      description: "3 attendance disputes still require final unit action.",
      time: "18 mins ago",
      actionLabel: "Open",
    },
    {
      id: "expiring-invites",
      severity: "medium",
      title: "Invitations expiring soon",
      description: "5 users are still inactive and their invites expire this week.",
      time: "32 mins ago",
      actionLabel: "View",
    },
    {
      id: "failed-import",
      severity: "medium",
      title: "Failed user import",
      description: "1 CSV batch needs correction before new audience users can be created.",
      time: "48 mins ago",
      actionLabel: "Fix",
    },
    {
      id: "audience-admin-gap",
      severity: "low",
      title: "Audience Admin unassigned",
      description: "2 audiences still need an assigned admin before the next session starts.",
      time: "1 hour ago",
      actionLabel: "Assign",
    },
  ];
}

function mapActivity(items: ListItem[]): ActivityItem[] {
  return items.slice(0, 5).map((item, index) => ({
    id: `${item.title}-${index}`,
    title: item.title,
    subject: item.subtitle,
    time: item.meta?.split("-").slice(-1)[0]?.trim() || item.meta || "Recently",
    tone:
      item.title.toLowerCase().includes("assigned")
        ? "warning"
        : item.title.toLowerCase().includes("report")
          ? "info"
          : "success",
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

function buildAttendanceViews(): Record<UnitAttendanceFilter, UnitAttendanceOverview> {
  return {
    today: {
      activeFilter: "today",
      summary:
        "Attendance is stable across the unit today, with three live sessions and a small flagged review queue.",
      points: [
        { label: "08:00", value: 22 },
        { label: "10:00", value: 49 },
        { label: "12:00", value: 63 },
        { label: "14:00", value: 58 },
        { label: "16:00", value: 35 },
      ],
      breakdown: {
        present: "1,204",
        late: "84",
        absent: "92",
        excused: "31",
        flagged: "14",
      },
    },
    yesterday: {
      activeFilter: "yesterday",
      summary:
        "Yesterday closed with slightly lower attendance and two disputes that rolled into today.",
      points: [
        { label: "08:00", value: 18 },
        { label: "10:00", value: 43 },
        { label: "12:00", value: 57 },
        { label: "14:00", value: 53 },
        { label: "16:00", value: 30 },
      ],
      breakdown: {
        present: "1,118",
        late: "73",
        absent: "106",
        excused: "29",
        flagged: "11",
      },
    },
    "7days": {
      activeFilter: "7days",
      summary:
        "The last 7 days show steady unit participation, with Friday leading attendance volume.",
      points: [
        { label: "Mon", value: 58 },
        { label: "Tue", value: 64 },
        { label: "Wed", value: 61 },
        { label: "Thu", value: 69 },
        { label: "Fri", value: 73 },
        { label: "Sat", value: 44 },
        { label: "Sun", value: 51 },
      ],
      breakdown: {
        present: "7,842",
        late: "403",
        absent: "612",
        excused: "208",
        flagged: "41",
      },
    },
    "30days": {
      activeFilter: "30days",
      summary:
        "Thirty-day attendance remains healthy, with a few spikes caused by high-enrollment audiences.",
      points: [
        { label: "Wk 1", value: 61 },
        { label: "Wk 2", value: 66 },
        { label: "Wk 3", value: 70 },
        { label: "Wk 4", value: 74 },
      ],
      breakdown: {
        present: "28,480",
        late: "1,412",
        absent: "2,218",
        excused: "640",
        flagged: "129",
      },
    },
    custom: {
      activeFilter: "custom",
      summary:
        "Use custom range reporting when you need deeper unit attendance analysis or export-ready breakdowns.",
      points: [
        { label: "Range 1", value: 49 },
        { label: "Range 2", value: 62 },
        { label: "Range 3", value: 59 },
        { label: "Range 4", value: 68 },
      ],
      breakdown: {
        present: "Custom",
        late: "Custom",
        absent: "Custom",
        excused: "Custom",
        flagged: "Custom",
      },
    },
  };
}

export function buildUnitAdminDashboardData(params: {
  activeScope: string;
  userName?: string;
}): UnitAdminDashboardData {
  const config = roleConfigs.unit;
  const unitName = parseScopeLabel(params.activeScope || config.scopeOptions?.[0]);

  return {
    greeting: formatGreeting(params.userName),
    unitName,
    organisationName: "Benson Idahosa University",
    currentDate: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date()),
    statusMessage: "Operations are stable today. 4 items need review.",
    headerActions: [
      { id: "create-session", label: "Create Session", variant: "primary" },
      { id: "create-audience", label: "Create Audience", variant: "secondary" },
      { id: "add-user", label: "Add User", variant: "secondary" },
    ],
    metrics: mapMetrics(),
    attentionItems: mapAttention(),
    sessions: mapSessions(config),
    attendanceViews: buildAttendanceViews(),
    activity: mapActivity(config.extraBottomLeftItems ?? []),
    quickActions: mapQuickActions(),
  };
}
