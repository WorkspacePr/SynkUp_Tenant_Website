import {
  CalendarClock,
  CheckCircle2,
  FileSpreadsheet,
  FolderOpen,
  Play,
  ShieldAlert,
  Users,
} from "lucide-react";

import type { SelectOption, ListItem, RoleConfig } from "@/features/dashboard/components/showcase";
import { roleConfigs } from "@/features/dashboard/components/showcase";
import type { ActivityItem, AttentionItem, QuickAction } from "@/features/dashboard/components/super-admin/types";

import type {
  AudienceAdminDashboardData,
  AudienceAttendanceFilter,
  AudienceAttendanceOverview,
  AudienceDashboardMetric,
  AudienceSessionSummary,
  LiveSessionWorkspaceData,
} from "./types";

function parseScopeLabel(scope: string | undefined) {
  if (!scope) return "No audience assigned";
  return scope.includes(":") ? (scope.split(":")[1]?.trim() ?? scope) : scope;
}

function formatGreeting(userName?: string) {
  const firstName = userName?.split(" ")[0]?.trim() || "Admin";
  const hour = new Date().getHours();
  const prefix =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return `${prefix}, ${firstName}`;
}

function parseSessionStat(stat: string) {
  const match = stat.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return { checkedInCount: 0, expectedCount: 0 };
  }

  return {
    checkedInCount: Number(match[1]),
    expectedCount: Number(match[2]),
  };
}

function mapAudienceSessions(config: RoleConfig, selectedAudience: string): AudienceSessionSummary[] {
  const source = [
    {
      id: "lecture-live",
      title: "Monday Lecture",
      audienceName: selectedAudience,
      startsAt: "9:00 AM",
      endsAt: "11:00 AM",
      status: "live" as const,
      checkedInCount: 124,
      expectedCount: 160,
      lateCount: 8,
      flaggedCount: 3,
      actor: "Dr. John Doe",
    },
    {
      id: "seminar-upcoming",
      title: "Practical Session B",
      audienceName: selectedAudience,
      startsAt: "11:30 AM",
      endsAt: "1:00 PM",
      status: "upcoming" as const,
      checkedInCount: 0,
      expectedCount: 160,
      lateCount: 0,
      flaggedCount: 0,
      actor: "Dr. John Doe",
    },
    {
      id: "completed-review",
      title: "HTML Review Session",
      audienceName: selectedAudience,
      startsAt: "2:00 PM",
      endsAt: "3:00 PM",
      status: "requires_review" as const,
      checkedInCount: 85,
      expectedCount: 150,
      lateCount: 6,
      flaggedCount: 2,
      actor: "Dr. John Doe",
    },
    {
      id: "completed",
      title: "Discussion Hour",
      audienceName: selectedAudience,
      startsAt: "4:00 PM",
      endsAt: "5:00 PM",
      status: "completed" as const,
      checkedInCount: 112,
      expectedCount: 150,
      lateCount: 4,
      flaggedCount: 0,
      actor: "Mr. John Doe",
    },
  ];

  if (config.sessions.length > 0) {
    return config.sessions.slice(0, 4).map((session, index) => {
      const parsed = parseSessionStat(session.stat);
      const fallback = source[index] ?? source[0];
      return {
        ...fallback,
        title: session.title,
        checkedInCount: parsed.checkedInCount || fallback.checkedInCount,
        expectedCount: parsed.expectedCount || fallback.expectedCount,
      };
    });
  }

  return source;
}

function buildLiveWorkspace(sessions: AudienceSessionSummary[], selectedAudience: string): LiveSessionWorkspaceData {
  const live = sessions.find((session) => session.status === "live");
  if (live) {
    const percentage =
      live.expectedCount && live.expectedCount > 0
        ? Math.round((live.checkedInCount / live.expectedCount) * 1000) / 10
        : 0;

    return {
      state: "live",
      title: "Live now",
      sessionName: `${selectedAudience} — ${live.title}`,
      audienceName: selectedAudience,
      startsAt: live.startsAt,
      endsAt: live.endsAt,
      checkedInCount: live.checkedInCount,
      expectedCount: live.expectedCount,
      lateCount: live.lateCount,
      flaggedCount: live.flaggedCount,
      attendancePercentage: percentage,
      timeLabel: "Time remaining: 00:32:55",
    };
  }

  const upcoming = sessions.find((session) => session.status === "upcoming");
  if (upcoming) {
    return {
      state: "next",
      title: "Next session",
      sessionName: upcoming.title,
      audienceName: selectedAudience,
      startsAt: upcoming.startsAt,
      endsAt: upcoming.endsAt,
      expectedCount: upcoming.expectedCount,
      timeLabel: `Starts at ${upcoming.startsAt}`,
    };
  }

  return {
    state: "none",
    title: "No sessions scheduled today",
  };
}

function mapMetrics(selectedAudience: string): AudienceDashboardMetric[] {
  return [
    {
      id: "members",
      label: "Audience Members",
      value: 160,
      supportingText: "154 active",
      icon: Users,
    },
    {
      id: "sessions",
      label: "Today's Sessions",
      value: 3,
      supportingText: "1 currently live",
      icon: CalendarClock,
    },
    {
      id: "attendance-rate",
      label: "Today's Attendance Rate",
      value: "92.4%",
      supportingText: "Up 1.8%",
      icon: CheckCircle2,
    },
    {
      id: "needs-review",
      label: "Needs Review",
      value: 4,
      supportingText: "3 flagged, 1 dispute",
      icon: ShieldAlert,
    },
  ];
}

function mapAttention(selectedAudience: string): AttentionItem[] {
  return [
    {
      id: "records-review",
      severity: "high",
      title: "Three attendance records need review",
      description: `Duplicate scans were detected in today’s ${selectedAudience} session.`,
      time: "10 minutes ago",
      actionLabel: "Review",
    },
    {
      id: "closure",
      severity: "medium",
      title: "Session requires closure",
      description: "The previous completed session still needs final confirmation and lock.",
      time: "24 minutes ago",
      actionLabel: "Open",
    },
    {
      id: "failed-export",
      severity: "low",
      title: "Report export failed",
      description: "The latest audience summary export did not complete successfully.",
      time: "35 minutes ago",
      actionLabel: "Retry",
    },
    {
      id: "missing-records",
      severity: "medium",
      title: "Missing attendance records",
      description: `Some entries were not fully synced for ${selectedAudience}.`,
      time: "1 hour ago",
      actionLabel: "Resolve",
    },
  ];
}

function mapActivity(items: ListItem[]): ActivityItem[] {
  const fallback: ActivityItem[] = [
    {
      id: "session-started",
      title: "Session started",
      subject: "Monday Lecture",
      time: "10 mins ago",
      tone: "success",
    },
    {
      id: "attendance-flagged",
      title: "Attendance flagged",
      subject: "Member #240022",
      time: "18 mins ago",
      tone: "warning",
    },
    {
      id: "report-exported",
      title: "Report exported",
      subject: "CSC 401 summary",
      time: "35 mins ago",
      tone: "info",
    },
    {
      id: "member-added",
      title: "Member added to audience",
      subject: "SCN/CSC/240622",
      time: "1 hour ago",
      tone: "success",
    },
  ];

  if (items.length === 0) {
    return fallback;
  }

  return items.slice(0, 5).map((item, index) => ({
    id: `${item.title}-${index}`,
    title: item.title,
    subject: item.subtitle,
    time: item.meta?.split("-").slice(-1)[0]?.trim() || item.meta || "Recently",
    tone: item.title.toLowerCase().includes("error")
      ? "warning"
      : item.title.toLowerCase().includes("started")
        ? "success"
        : "info",
  }));
}

function mapQuickActions(): QuickAction[] {
  return [
    { id: "create-session", title: "Create Session", icon: Play },
    { id: "view-members", title: "View Members", icon: Users },
    { id: "view-attendance", title: "View Attendance", icon: FolderOpen },
    { id: "export-report", title: "Export Report", icon: FileSpreadsheet },
    { id: "review-issues", title: "Review Issues", icon: ShieldAlert },
  ];
}

function buildAttendanceViews(selectedAudience: string): Record<AudienceAttendanceFilter, AudienceAttendanceOverview> {
  return {
    today: {
      activeFilter: "today",
      summary: `Attendance is stable for today’s ${selectedAudience} live session, with 3 flagged records.`,
      points: [
        { label: "08:00", value: 12 },
        { label: "09:00", value: 28 },
        { label: "10:00", value: 44 },
        { label: "11:00", value: 36 },
        { label: "12:00", value: 18 },
      ],
      breakdown: {
        present: "124",
        late: "8",
        absent: "22",
        excused: "3",
        flagged: "4",
      },
    },
    yesterday: {
      activeFilter: "yesterday",
      summary: "Yesterday ended without unresolved issues and only one late-sync follow-up.",
      points: [
        { label: "08:00", value: 9 },
        { label: "09:00", value: 24 },
        { label: "10:00", value: 41 },
        { label: "11:00", value: 33 },
        { label: "12:00", value: 15 },
      ],
      breakdown: {
        present: "118",
        late: "5",
        absent: "28",
        excused: "4",
        flagged: "1",
      },
    },
    "7days": {
      activeFilter: "7days",
      summary: "The last 7 days show stable attendance, with Monday and Thursday carrying the strongest turnout.",
      points: [
        { label: "Mon", value: 48 },
        { label: "Tue", value: 41 },
        { label: "Wed", value: 39 },
        { label: "Thu", value: 52 },
        { label: "Fri", value: 46 },
        { label: "Sat", value: 12 },
        { label: "Sun", value: 8 },
      ],
      breakdown: {
        present: "628",
        late: "34",
        absent: "121",
        excused: "19",
        flagged: "10",
      },
    },
    "30days": {
      activeFilter: "30days",
      summary: "Attendance trends remain healthy across the past month, with only brief dips near holiday sessions.",
      points: [
        { label: "Wk 1", value: 45 },
        { label: "Wk 2", value: 50 },
        { label: "Wk 3", value: 47 },
        { label: "Wk 4", value: 54 },
      ],
      breakdown: {
        present: "2,410",
        late: "122",
        absent: "408",
        excused: "67",
        flagged: "29",
      },
    },
    custom: {
      activeFilter: "custom",
      summary: "Custom range reporting is available when you need a more detailed attendance export.",
      points: [
        { label: "Range 1", value: 24 },
        { label: "Range 2", value: 38 },
        { label: "Range 3", value: 31 },
        { label: "Range 4", value: 45 },
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

export function buildAudienceAdminDashboardData(params: {
  activeScope: string;
  assignedAudienceOptions: SelectOption[];
  userName?: string;
}): AudienceAdminDashboardData {
  const config = roleConfigs.audience;
  const selectedAudience = parseScopeLabel(params.activeScope || params.assignedAudienceOptions[0]?.value);
  const sessions = mapAudienceSessions(config, selectedAudience);

  return {
    greeting: formatGreeting(params.userName),
    statusMessage: "You have one live session and two upcoming sessions today.",
    primaryActionLabel: "Create Session",
    audienceOptions: params.assignedAudienceOptions,
    selectedAudience,
    context: {
      audienceName: selectedAudience,
      unitName: "Legacy Campus",
      organisationName: "Benson Idahosa University",
      currentDate: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    },
    liveWorkspace: buildLiveWorkspace(sessions, selectedAudience),
    metrics: mapMetrics(selectedAudience),
    attentionItems: mapAttention(selectedAudience),
    sessions,
    attendanceViews: buildAttendanceViews(selectedAudience),
    activity: mapActivity(config.lowerLeftItems ?? []),
    quickActions: mapQuickActions(),
  };
}
