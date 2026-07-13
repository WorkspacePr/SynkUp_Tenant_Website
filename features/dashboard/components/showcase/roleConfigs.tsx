import { AlertTriangle, Building, CalendarClock, CheckCircle2, CreditCard, FileText, FolderOpen, LayoutDashboard, LogOut, MonitorCog, Play, Settings, ShieldAlert, ShieldCheck, ShieldUser, Ticket, Users, UserSquare2, Waves } from "lucide-react";

import type { RoleConfig, RoleKey } from "./types";

export const roleConfigs: Record<RoleKey, RoleConfig> = {
  super: {
    roleLabel: "SUPER ADMIN",
    pageTitle: "Dashboard",
    pageSubtitle: "Welcome back! Here's what's happening today",
    scopeOptions: [
      "Organisation: SynkUp University",
      "Unit: Legacy Campus",
      "Unit: Heritage Campus",
    ],
    navMain: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        active: true,
      },
      { label: "Units", icon: <Building className="h-4 w-4" /> },
      {
        label: "Audiences",
        icon: <UserSquare2 className="h-4 w-4" />,
        children: [
          "All Audiences",
          "By Unit",
          "Audience Admins",
          "Archived Audiences",
        ],
      },
      {
        label: "Users",
        icon: <Users className="h-4 w-4" />,
        children: [
          "All Users",
          "Admin Users",
          "Invitations",
          "Bulk Import",
          "Deactivated Users",
        ],
      },
      {
        label: "Attendance",
        icon: <CheckCircle2 className="h-4 w-4" />,
        children: [
          "Sessions",
          "Live Sessions",
          "Attendance Records",
          "Flagged Records",
          "Overrides",
          "Disputes",
          "Archived Sessions",
        ],
      },
      { label: "Disputes", icon: <ShieldAlert className="h-4 w-4" /> },
      {
        label: "Roles & Permissions",
        icon: <ShieldUser className="h-4 w-4" />,
      },
      { label: "Reports", icon: <FileText className="h-4 w-4" /> },
      { label: "Subscription", icon: <CreditCard className="h-4 w-4" /> },
      {
        label: "System Status",
        icon: <Waves className="h-4 w-4" />,
        children: [
          "Service Status",
          "QR Validation",
          "Sync Backlog",
          "Notification Delivery",
          "Maintenance Notices",
        ],
      },
      { label: "Audit Logs", icon: <ShieldCheck className="h-4 w-4" /> },
    ],
    navBottom: [
      { label: "Support", icon: <Ticket className="h-4 w-4" /> },
      { label: "Settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Log Out", icon: <LogOut className="h-4 w-4" /> },
    ],
    toasts: [
      {
        title: "Trial active",
        description:
          "Trial environments can schedule sessions, but advanced exports and custom roles may be limited on the current plan.",
        tone: "success",
      },
      {
        title: "Trial ending soon",
        description:
          "Your trial expires in 3 days. Some actions may be restricted after expiry.",
        tone: "warning",
      },
      {
        title: "Organisation is in grace period",
        description:
          "Exports and new session creation will be disabled if renewal is not completed before July 9, 2026.",
        tone: "warning",
      },
      {
        title: "Organisation is in read-only mode",
        description:
          "Session creation and exports are disabled until subscription is renewed.",
        tone: "danger",
      },
      {
        title: "Feature unavailable on current plan",
        description:
          "Advanced exports, extra unit provisioning, and granular audit filters are unavailable until upgrade.",
        tone: "info",
      },
      {
        title: "2 role changes require re-auth confirmation",
        description:
          "High-risk permission updates are held until the acting admin completes a fresh confirmation.",
        tone: "info",
      },
    ],
    metrics: [
      {
        title: "Subscription",
        value: "ACTIVE\n(Enterprise)",
        accent: "green",
        subtitle: "Billing state",
        trend: "Export success rate 99.2% this week",
        trendTone: "success",
        icon: <CreditCard className="h-9 w-9" />,
      },
      {
        title: "Invite\nAcceptance",
        value: "78.4%",
        subtitle: "43 pending invites",
        trend: "Up 6.1% vs last week",
        trendTone: "success",
        icon: <Users className="h-9 w-9" />,
      },
      {
        title: "Dispute\nRate",
        value: "1.8%",
        subtitle: "Of all attendance records",
        trend: "Down 0.4 pts over 7 days",
        trendTone: "success",
        icon: <Building className="h-9 w-9 text-rose-300" />,
      },
      {
        title: "Duplicate\nAttendance",
        value: "0.7%",
        subtitle: "Flagged duplicate check-ins",
        trend: "Up 0.2 pts, Legacy is highest",
        trendTone: "warning",
        icon: <Waves className="h-9 w-9 text-green-500" />,
      },
      {
        title: "Late Sync\nand QR Fail",
        value: "2.3% / 1.1%",
        subtitle: "Late sync vs failed QR validations",
        trend: "Late sync improving, QR failures flat",
        trendTone: "info",
        icon: <Waves className="h-9 w-9 -rotate-45 text-slate-400" />,
      },
    ],
    commandBar: {
      placeholder:
        "Search users, sessions, audiences, units, tickets, disputes, exports...",
      emptyState: "No matching results found",
      recentSearches: [
        "Pending disputes",
        "Legacy Campus",
        "Export failures",
        "Audience admins",
      ],
      groups: [
        {
          title: "Users",
          items: [
            {
              title: "Emmanuel Ndurue",
              subtitle: "Unit Admin, Legacy Campus",
              meta: "Roles and Permissions",
              keyword: "user admin role legacy emmanuel",
              status: "Active",
              statusTone: "success",
            },
            {
              title: "Sarah Mumeya",
              subtitle: "Provisioning lead, Medical School",
              meta: "Users / Admin Users",
              keyword: "user admin provisioning sarah medical",
            },
          ],
        },
        {
          title: "Sessions",
          items: [
            {
              title: "Computer Science 101 - Lecture",
              subtitle: "Live session, Legacy Campus",
              meta: "Attendance / Live Sessions",
              keyword: "session cs101 lecture live attendance",
              status: "LIVE",
              statusTone: "success",
            },
            {
              title: "Mechanical Lab Session",
              subtitle: "Upcoming, Engineering (Civil)",
              meta: "Attendance / Sessions",
              keyword: "session mechanical lab upcoming engineering",
            },
          ],
        },
        {
          title: "Audiences",
          items: [
            {
              title: "CSC 411",
              subtitle: "Audience admin coverage and dispute backlog",
              meta: "Audiences / By Unit",
              keyword: "audience csc 411 admin dispute",
            },
            {
              title: "MBA Students",
              subtitle: "Heritage Campus audience roster",
              meta: "Audiences / All Audiences",
              keyword: "audience mba students heritage",
            },
          ],
        },
        {
          title: "Units",
          items: [
            {
              title: "Legacy Campus",
              subtitle: "Highest duplicate attendance rate this week",
              meta: "Units",
              keyword: "unit legacy campus duplicate attendance",
            },
            {
              title: "Medical School",
              subtitle: "Read-only risk if subscription changes",
              meta: "Units",
              keyword: "unit medical school read only risk",
              status: "At risk",
              statusTone: "warning",
            },
          ],
        },
        {
          title: "Tickets",
          items: [
            {
              title: "Cannot export attendance report",
              subtitle: "Support ticket #1245",
              meta: "Support Tickets",
              keyword: "ticket export attendance report 1245",
              status: "High",
              statusTone: "danger",
            },
            {
              title: "User unable to check in",
              subtitle: "Support ticket #1244",
              meta: "Support Tickets",
              keyword: "ticket check in user 1244",
              status: "Pending",
              statusTone: "warning",
            },
          ],
        },
        {
          title: "Disputes",
          items: [
            {
              title: "Medical attendance override dispute",
              subtitle: "Escalated to Super Admin",
              meta: "Disputes / SLA Monitor",
              keyword: "dispute medical override escalated overdue",
              status: "Overdue",
              statusTone: "danger",
            },
            {
              title: "CSC 411 duplicate check-in dispute",
              subtitle: "Approaching timeout threshold",
              meta: "Disputes / Pending",
              keyword: "dispute csc 411 duplicate timeout",
              status: "At risk",
              statusTone: "warning",
            },
          ],
        },
        {
          title: "Exports",
          items: [
            {
              title: "Attendance Summary Export",
              subtitle: "Signed link expires in 2 hours",
              meta: "Reports / Exports",
              keyword: "export attendance summary expiring",
              status: "Expiring",
              statusTone: "warning",
            },
            {
              title: "Audit Log Export",
              subtitle: "Generated successfully this morning",
              meta: "Reports / Audit Logs",
              keyword: "export audit log success",
              status: "Ready",
              statusTone: "success",
            },
          ],
        },
      ],
    },
    quickActionsPanel: {
      title: "Quick Actions",
      subtitle: "Run common admin tasks without leaving the dashboard.",
      actions: [
        {
          title: "Create User",
          description: "Add an admin or end user directly from the dashboard.",
          tone: "success",
        },
        {
          title: "Import CSV",
          description: "Start a bulk import and review duplicates or failed rows.",
          tone: "info",
        },
        {
          title: "Create Audience",
          description: "Open a new audience and assign its owner.",
          tone: "neutral",
        },
        {
          title: "Start Session",
          description: "Launch attendance for a ready audience.",
          tone: "warning",
        },
        {
          title: "Export Report",
          description: "Generate attendance, billing, dispute, or audit exports.",
          tone: "neutral",
        },
        {
          title: "Create Support Ticket",
          description: "Raise a product or operations issue with context attached.",
          tone: "danger",
        },
      ],
    },
    trendTitle: "Daily Attendance Trends",
    trendSubtitle: "Last 7 days attendance performance",
    performanceTitle: "Unit Performance",
    performanceSubtitle: "Attendance rate by unit",
    performanceBars: [
      { label: "Legacy", value: 88 },
      { label: "Heritage", value: 82 },
    ],
    sessionCardTitle: "Active & Upcoming Sessions",
    sessionCardSubtitle: "Live and scheduled sessions for today",
    sessionAction: "Create Session",
    sessions: [
      {
        title: "Computer Science 101 - Lecture",
        meta: "CS Year 1   Legacy Campus",
        time: "09:00 AM",
        stat: "142/150 present",
        badge: "LIVE",
        badgeTone: "live",
      },
      {
        title: "Business Analytics Workshop",
        meta: "MBA Students   Heritage Campus",
        time: "10:30 AM",
        stat: "68/80 present",
        badge: "LIVE",
        badgeTone: "live",
      },
      {
        title: "Constitutional Law Seminar",
        meta: "Law Year 3   Legacy Campus",
        time: "11:00 AM",
        stat: "Locked for review",
        badge: "UPCOMING",
        badgeTone: "upcoming",
      },
      {
        title: "Mechanical Lab Session",
        meta: "Engineering (Civil)   Legacy Campus",
        time: "01:30 PM",
        stat: "Read-only if grace period ends",
        badge: "UPCOMING",
        badgeTone: "upcoming",
      },
    ],
    provisioningPanel: {
      title: "Provisioning Control Center",
      subtitle:
        "Keep manual creation, CSV imports, duplicates, and pending invites visible without leaving the dashboard.",
      primaryAction: "Create User",
      secondaryAction: "Review Imports",
      stats: [
        {
          label: "Manual created today",
          value: "18",
          helper: "8 admins and 10 end users were created directly from the dashboard.",
          tone: "success",
        },
        {
          label: "Pending invites",
          value: "43",
          helper: "7 invitations expire within 48 hours and need a resend or follow-up.",
          tone: "info",
        },
        {
          label: "Failed rows",
          value: "12",
          helper: "Validation failures are available as a downloadable failed-row report.",
          tone: "danger",
        },
        {
          label: "Duplicate queue",
          value: "9",
          helper: "Potential profile collisions are waiting for merge or skip decisions.",
          tone: "warning",
        },
      ],
      importHealth: [
        {
          title: "July staff import · 1,248 rows",
          subtitle:
            "1,211 created, 25 skipped as duplicates, and 12 failed validation.",
          meta: "Completed 14 mins ago · Preview approved by Sarah Mumeya",
          status: "Needs review",
          statusTone: "warning",
        },
        {
          title: "Medical faculty intake · 380 rows",
          subtitle:
            "Preview saved and duplicate scan is still matching existing profiles.",
          meta: "Started 6 mins ago · Import summary will publish automatically",
          status: "Processing",
          statusTone: "info",
        },
        {
          title: "Freshers backfill · 92 rows",
          subtitle:
            "Upload rejected because the required email column was not mapped.",
          meta: "Failed-row report ready · Template mismatch detected",
          status: "Failed",
          statusTone: "danger",
        },
      ],
      pendingInvites: [
        {
          title: "43 pending invitations",
          subtitle: "19 admins and 24 end users are still waiting to accept.",
          meta: "7 expire in less than 48 hours",
          status: "Action",
          statusTone: "info",
        },
        {
          title: "7 bounced invite emails",
          subtitle:
            "Delivery failed for invalid inboxes or strict mail policies.",
          meta: "Retry after correction or fall back to manual creation",
          status: "Retry",
          statusTone: "warning",
        },
        {
          title: "12 manual accounts without email",
          subtitle:
            "Accounts were created manually and still need a secure handoff path.",
          meta: "Password setup remains pending for these users",
          status: "Pending",
          statusTone: "neutral",
        },
      ],
      duplicateQueue: [
        {
          title: "9 duplicate profiles awaiting decision",
          subtitle:
            "Possible matches span Legacy, Heritage, and Medical units.",
          meta: "6 can be auto-merged with confidence above 95%",
          status: "Review",
          statusTone: "warning",
        },
        {
          title: "4 failed rows require edits",
          subtitle:
            "Matric number and unit mapping conflicts were detected during import.",
          meta: "Download the failed-row report, fix the source CSV, and retry",
          status: "Fix",
          statusTone: "danger",
        },
        {
          title: "Latest import summary",
          subtitle:
            "Created 1,211 users, reactivated 14, and added 1,225 memberships.",
          meta: "Skipped duplicates: 25 · Failed rows: 12",
          status: "Summary",
          statusTone: "success",
        },
      ],
    },
    disputeSlaPanel: {
      title: "Dispute SLA and Timeout Monitor",
      subtitle:
        "Track dispute age, 14-day timeouts, overdue items, and automation status.",
      primaryAction: "Review At-Risk Disputes",
      secondaryAction: "Open Timeout Log",
      automationSummary:
        "Hourly automation auto-rejects disputes after 14 days, writes an audit event, and queues notifications for the reporter and assigned admins.",
      stats: [
        {
          label: "Pending disputes",
          value: "28",
          helper: "Across all units, 28 disputes are still inside the review workflow.",
          tone: "info",
        },
        {
          label: "Due in 48 hours",
          value: "6",
          helper: "These cases are approaching the 14-day timeout threshold.",
          tone: "warning",
        },
        {
          label: "Overdue or failed automation",
          value: "2",
          helper: "These need immediate review because timeout processing is blocked or late.",
          tone: "danger",
        },
        {
          label: "Auto-rejected today",
          value: "4",
          helper: "Each one should have a system log and outbound notification record.",
          tone: "success",
        },
      ],
      items: [
        {
          title: "CSC 411 duplicate check-in dispute",
          subtitle: "Reporter: Daniel Osa | Unit: Legacy Campus | Assignee: Unit Admin queue",
          age: "12 days old",
          countdown: "1 day 18 hours remaining",
          automation: "Reminder sent. Auto-reject is scheduled if untouched.",
          status: "At risk",
          statusTone: "warning",
        },
        {
          title: "Medical attendance override dispute",
          subtitle: "Reporter: Sarah Adeyemi | Unit: Medical School | Escalated to Super Admin",
          age: "15 days old",
          countdown: "Timeout breached by 1 day",
          automation: "Timeout job stalled on notification handoff. Audit retry needed.",
          status: "Overdue",
          statusTone: "danger",
        },
        {
          title: "Law session entry dispute",
          subtitle: "Reporter: Benson Idahosa | Unit: Heritage Campus | Recommendation attached",
          age: "14 days old",
          countdown: "Timed out 2 hours ago",
          automation: "Auto-rejected, logged, and queued for email notification.",
          status: "Auto-rejected",
          statusTone: "success",
        },
      ],
    },
    systemHealthPanel: {
      title: "System Health Operations",
      subtitle:
        "Track service health, sync pressure, delivery issues, outages, and maintenance.",
      primaryAction: "Open Status Center",
      secondaryAction: "Review Incidents",
      accessSummary:
        "If policy forces read-only access, session creation, exports, and other write actions should disable while records stay visible.",
      stats: [
        {
          label: "Core services",
          value: "5/6 healthy",
          helper: "One downstream notification provider is degraded but the platform is otherwise serving requests.",
          tone: "warning",
        },
        {
          label: "Sync backlog",
          value: "184 jobs",
          helper: "Mobile offline sync and report generation are the current backlog drivers.",
          tone: "warning",
        },
        {
          label: "Delivery success",
          value: "96.8%",
          helper: "Email and in-app notifications are healthy; SMS retries are dragging the rate down.",
          tone: "info",
        },
        {
          label: "Read-only tenants",
          value: "3",
          helper: "Three organisations are currently restricted from mutating actions.",
          tone: "danger",
        },
      ],
      serviceStatus: [
        {
          title: "Attendance API",
          subtitle: "Request latency is stable across all campuses.",
          detail: "P95 latency 340 ms. Error rate remains below 0.3% and no circuit breaking is active.",
          status: "Healthy",
          statusTone: "success",
        },
        {
          title: "Sync backlog processor",
          subtitle: "Offline attendance uploads are delayed but processing.",
          detail: "184 queued jobs. Oldest queued job is 23 minutes old and auto-scaling is already engaged.",
          status: "Degraded",
          statusTone: "warning",
        },
        {
          title: "Notification delivery",
          subtitle: "SMS provider is partially degraded; email and in-app remain available.",
          detail: "42 SMS retries are pending. Fallback notification copy is still being sent in-app to affected admins.",
          status: "Partial outage",
          statusTone: "danger",
        },
      ],
      outageHistory: [
        {
          title: "July 6, 2026 · SMS delivery delay",
          subtitle: "18-minute incident affecting OTP and invite reminders.",
          detail: "Resolved after provider failover. Incident log and impacted tenant list were published automatically.",
          status: "Resolved",
          statusTone: "success",
        },
        {
          title: "July 4, 2026 · Sync worker saturation",
          subtitle: "Large CSV imports caused sync queue pressure for 47 minutes.",
          detail: "Backlog cleared after worker scale-up and import throttling. No data loss reported.",
          status: "Resolved",
          statusTone: "success",
        },
        {
          title: "July 1, 2026 · Billing read-only enforcement",
          subtitle: "Three tenants were switched to read-only after grace period expiry.",
          detail: "Session creation and exports were disabled while attendance records remained visible.",
          status: "Policy event",
          statusTone: "info",
        },
      ],
      maintenanceNotices: [
        {
          title: "Scheduled maintenance · July 9, 2026 01:00-02:30 WAT",
          subtitle: "Database index maintenance and notification worker restart.",
          detail: "Attendance viewing stays available, but exports and some admin write actions may be temporarily read-only.",
          status: "Scheduled",
          statusTone: "warning",
        },
        {
          title: "QR validation certificate rotation",
          subtitle: "Planned background maintenance with no expected downtime.",
          detail: "A maintenance banner should appear, but session start remains available unless certificate health degrades.",
          status: "Low risk",
          statusTone: "info",
        },
        {
          title: "Read-only enforcement notice",
          subtitle: "Customers in grace period receive a guided restriction banner before lockout.",
          detail: "The dashboard should explain what stays accessible and which write actions are disabled.",
          status: "Policy active",
          statusTone: "neutral",
        },
      ],
    },
    actionQueuePanel: {
      title: "My Approvals and Action Queue",
      subtitle:
        "Your personal queue for decisions, confirmations, and follow-ups.",
      primaryAction: "Open My Queue",
      secondaryAction: "View Expiring Items",
      stats: [
        {
          label: "Awaiting my approval",
          value: "11",
          helper: "Final decisions or confirmations currently assigned to you.",
          tone: "warning",
        },
        {
          label: "High-risk confirmations",
          value: "2",
          helper: "Role or permission changes still require a fresh confirmation.",
          tone: "danger",
        },
        {
          label: "Pending invites",
          value: "7",
          helper: "Invite follow-ups, resends, and bounced deliveries in your queue.",
          tone: "info",
        },
        {
          label: "Expiring exports",
          value: "3",
          helper: "Signed links that need regeneration before they expire.",
          tone: "success",
        },
      ],
      approvals: [
        {
          title: "2 disputes awaiting final approval",
          subtitle: "One timeout exception and one override dispute are blocked on Super Admin review.",
          detail: "Medical attendance override and CSC 411 duplicate check-in both need a final decision today.",
          status: "Approval",
          statusTone: "warning",
        },
        {
          title: "4 flagged attendance records escalated",
          subtitle: "Unit admins tagged these records as high-risk and requested central review.",
          detail: "Duplicate check-in and late-sync anomalies have evidence attached and are ready for decision.",
          status: "Review",
          statusTone: "danger",
        },
        {
          title: "2 role changes need re-auth confirmation",
          subtitle: "High-risk permission updates are staged but not yet confirmed.",
          detail: "Engineering Unit Admin scope expansion and Finance audit-role grant are both waiting on you.",
          status: "Confirm",
          statusTone: "danger",
        },
      ],
      followUps: [
        {
          title: "7 invitation issues to resolve",
          subtitle: "Pending accepts, bounced emails, and no-email handoff cases.",
          detail: "3 need resend, 2 bounced, and 2 still need onboarding.",
          status: "Follow-up",
          statusTone: "info",
        },
        {
          title: "Duplicate queue has 4 unresolved user matches",
          subtitle: "Imports are blocked until merge or skip decisions are made.",
          detail: "The next CSV batch should not be approved until these identity collisions are cleared.",
          status: "Blocked",
          statusTone: "warning",
        },
        {
          title: "1 dispute timeout automation failure",
          subtitle: "The auto-reject job wrote partial state and needs manual verification.",
          detail: "Audit log retry and notification delivery confirmation are both still pending.",
          status: "Escalate",
          statusTone: "danger",
        },
      ],
      timeSensitive: [
        {
          title: "3 exports expire within 12 hours",
          subtitle: "Billing, attendance, and audit exports have signed links nearing expiry.",
          detail: "Regenerate the links now if the recipients still need access.",
          status: "Expiring",
          statusTone: "warning",
        },
        {
          title: "2 invites expire in less than 48 hours",
          subtitle: "Acceptance rate will drop unless these users are reminded.",
          detail: "One admin invite and one external stakeholder invite are close to expiry.",
          status: "Urgent",
          statusTone: "danger",
        },
        {
          title: "1 maintenance window affects approvals tonight",
          subtitle: "A short read-only period could pause some write actions.",
          detail: "Clear critical approvals before the maintenance banner goes live.",
          status: "Heads-up",
          statusTone: "info",
        },
      ],
    },
    sessionIntegrityPanel: {
      title: "Session Integrity Monitor",
      subtitle:
        "Watch conflicts, ending-soon sessions, lock state, late-attendance rules, and archive review.",
      primaryAction: "Review Session Risks",
      secondaryAction: "Open Archive Queue",
      stats: [
        {
          label: "Overlap conflicts",
          value: "3",
          helper: "Three active or scheduled sessions are colliding on audience or room scope.",
          tone: "danger",
        },
        {
          label: "Ending soon",
          value: "5",
          helper: "These sessions need wrap-up checks, lock decisions, or attendance review shortly.",
          tone: "warning",
        },
        {
          label: "Late-attendance custom rules",
          value: "12",
          helper: "Custom grace windows are active and should be reviewed for consistency.",
          tone: "info",
        },
        {
          label: "Locked sessions",
          value: "18",
          helper: "Editing is already closed and only controlled review paths remain.",
          tone: "success",
        },
        {
          label: "Archives pending review",
          value: "4",
          helper: "Archive requests or completed sessions still need final operational sign-off.",
          tone: "warning",
        },
      ],
      conflicts: [
        {
          title: "CSC 411 overlaps Sunday Service",
          subtitle: "Audience and room conflict detected for Heritage Campus.",
          detail: "Start Session should remain blocked until one of the sessions is rescheduled or closed.",
          status: "Blocked",
          statusTone: "danger",
        },
        {
          title: "Mechanical Lab ends in 18 minutes",
          subtitle: "Attendance capture is still live and export prep has not started.",
          detail: "Queue post-session review before the lock window starts.",
          status: "Ending soon",
          statusTone: "warning",
        },
        {
          title: "Constitutional Law Seminar queued behind active overlap",
          subtitle: "Late start risk because another scoped session is still live.",
          detail: "Warn the admins and preserve the overlap audit trail before allowing any manual override.",
          status: "At risk",
          statusTone: "warning",
        },
      ],
      governance: [
        {
          title: "18 sessions are currently locked",
          subtitle: "Direct edits are disabled and only dispute or override flows remain.",
          detail: "Super Admin should see lock status clearly before attempting changes or approving archive actions.",
          status: "Locked",
          statusTone: "success",
        },
        {
          title: "12 custom late-attendance rules are active",
          subtitle: "Grace windows vary across units and may affect dispute rates.",
          detail: "Review outliers against the standard campus policy.",
          status: "Review",
          statusTone: "info",
        },
        {
          title: "2 sessions still allow edits too close to end time",
          subtitle: "Configuration drift could weaken attendance integrity.",
          detail: "Tighten lock timing before the next wave of high-volume sessions starts.",
          status: "Fix",
          statusTone: "danger",
        },
      ],
      reviews: [
        {
          title: "4 archives are waiting for final review",
          subtitle: "Completed sessions were moved to archive but still need sign-off.",
          detail: "Check final counts, export state, and dispute status before approval.",
          status: "Review",
          statusTone: "warning",
        },
        {
          title: "2 completed sessions have unresolved export prompts",
          subtitle: "The archive flow finished before report generation was confirmed.",
          detail: "Regenerate the export prompt so staff do not lose the signed download window.",
          status: "Action",
          statusTone: "info",
        },
        {
          title: "1 archive request includes a dispute hold",
          subtitle: "A pending attendance dispute should delay final archival.",
          detail: "Keep the session visible in review until the dispute is resolved or times out.",
          status: "Hold",
          statusTone: "danger",
        },
      ],
    },
    savedViewsPanel: {
      title: "Saved Filters and Views",
      subtitle:
        "Keep your most-used filters one click away.",
      views: [
        {
          title: "Flagged Records · High Risk Only",
          subtitle: "Duplicate check-ins, spoofing, and late-sync exceptions",
          detail: "Scope: all units, severity high, unresolved only",
          status: "Pinned",
          statusTone: "warning",
        },
        {
          title: "Reports · This Week Export Queue",
          subtitle: "Attendance and billing exports generated in the last 7 days",
          detail: "Shows expiring links, failed jobs, and regenerated downloads",
          status: "Shared",
          statusTone: "info",
        },
        {
          title: "Audit Logs · Permission Changes",
          subtitle: "Role edits, re-auth confirmations, and high-risk policy changes",
          detail: "Saved for security review and weekly governance checks",
          status: "Monitored",
          statusTone: "danger",
        },
        {
          title: "Users · Pending Invite Follow-up",
          subtitle: "Bounced, expiring, or unaccepted invitations",
          detail: "Useful for daily outreach and manual onboarding handoff",
          status: "Actionable",
          statusTone: "success",
        },
      ],
    },
    lowerLeftTitle: "Flagged Attendance Records",
    lowerLeftSubtitle: "Records requiring review",
    lowerLeftItems: [
      {
        title: "John Okafor",
        subtitle: "CS101 Lecture - Duplicate check-in",
        meta: "09:15 AM",
        status: "HIGH",
        statusTone: "danger",
      },
      {
        title: "Sarah Adeyemi",
        subtitle: "Business Analytics Workshop - Geofencing validation failed",
        meta: "10:42 AM",
        status: "MEDIUM",
        statusTone: "warning",
      },
      {
        title: "David Eze",
        subtitle: "Mechanical Engineering Lab - Late sync (Offline Mode)",
        meta: "11:20 AM",
        status: "LOW",
        statusTone: "neutral",
      },
      {
        title: "Benson Idahosa",
        subtitle: "Law - Duplicate check-in",
        meta: "01:15 PM",
        status: "HIGH",
        statusTone: "danger",
      },
    ],
    lowerLeftFooter: "View all flagged records",
    lowerRightTitle: "Billing Overview",
    lowerRightSubtitle: "Current subscription status",
    lowerRightItems: [
      {
        title: "N750,000/Year",
        subtitle: "Current plan - Enterprise",
        meta: "Next billing date - April 24, 2027",
      },
      {
        title: "User limit reached",
        subtitle: "Medical School cannot invite new members on the current plan",
        meta: "Upgrade prompt required before new invitations",
      },
      {
        title: "Unit limit reached",
        subtitle: "No new unit can be created until the subscription is expanded",
        meta: "Applies to organisation provisioning flows",
      },
      {
        title: "Feature unavailable on current plan",
        subtitle: "Advanced exports and some audit filters are disabled",
        meta: "Upgrade to unlock the feature set",
      },
    ],
    extraBottomLeftTitle: "Recent Activity",
    extraBottomLeftSubtitle: "Audit trail of recent activities",
    extraBottomLeftItems: [
      {
        title: "Role changed: Audience Admin -> Unit Admin",
        subtitle: "Actor: You | Target: Emmanuel Ndurue",
        meta: "Scope: Legacy Campus | 15 mins ago | Status: Logged",
        actionLabel: "View log",
      },
      {
        title: "Attendance override approved",
        subtitle: "Actor: You | Target: Dr. Ikhu | Session: GEN 421 Lecture",
        meta: "Scope: Heritage Campus | 24 mins ago | Status: Confirmed",
        actionLabel: "View log",
      },
      {
        title: "User transfer completed",
        subtitle: "Actor: Sarah Mumeya | Target: Chidera Okoye",
        meta: "Scope: Medical School -> Business Hub | 40 mins ago | Status: Success",
        actionLabel: "View log",
      },
      {
        title: "Critical permission set updated",
        subtitle: "Actor: You | Target: Engineering Unit Admin role",
        meta: "Scope: Organisation | 1 hour ago | Status: Immutable log written",
        actionLabel: "View log",
      },
    ],
    extraBottomLeftFooter: "View full audit log",
    extraBottomRightTitle: "Support Tickets",
    extraBottomRightSubtitle: "Recent support requests",
    extraBottomRightItems: [
      {
        title: "Cannot export attendance report",
        subtitle: "#1245",
        meta: "Updated 2 hours ago",
        status: "High",
        statusTone: "danger",
      },
      {
        title: "User unable to check in",
        subtitle: "#1244",
        meta: "Updated 5 hours ago",
        status: "Pending",
        statusTone: "warning",
      },
      {
        title: "Feature Request: Bulk User Import",
        subtitle: "#1245",
        meta: "Updated 1 day ago",
        status: "Resolved",
        statusTone: "success",
      },
    ],
    stateShowcaseTitle: "Subscription & System States",
    stateShowcaseItems: [
      {
        title: "No users yet",
        description: "Create your first admin or import a CSV to begin organisation setup.",
        tone: "neutral",
      },
      {
        title: "No units created",
        description: "Units are required before audiences, sessions, and role assignment can be scoped.",
        tone: "neutral",
      },
      {
        title: "Failed to load billing",
        description: "Billing overview could not be fetched. Retry or contact support if the error persists.",
        tone: "danger",
      },
      {
        title: "Export expired",
        description: "Signed download link expired after 24 hours. Regenerate the report to create a new secure link.",
        tone: "warning",
      },
    ],
    modalExamplesTitle: "Confirmation & Export Flows",
    modalExamples: [
      {
        title: "Override attendance modal",
        description: "Show original value, new value, affected user, affected session, and mandatory reason input.",
        tone: "info",
        bullets: [
          "This action will be logged",
          "Re-auth may be required",
          "Concurrent update conflicts must be handled",
        ],
      },
      {
        title: "Export report flow",
        description: "Date range, unit or audience scope, async generation, report-ready notification, and expired-link state.",
        tone: "success",
        bullets: [
          "Background processing",
          "Signed temporary link",
          "Report ready notification",
        ],
      },
    ],
    guidedEmptyStatesPanel: {
      title: "Guided Empty States",
      subtitle:
        "When a module has no data yet, show the next best action instead of a blank surface.",
      items: [
        {
          title: "No units yet",
          description: "Units are required before audiences, sessions, and scoped permissions can work.",
          actionLabel: "Create first unit",
          tone: "neutral",
        },
        {
          title: "No audience admins assigned",
          description: "Audiences exist, but nobody owns day-to-day attendance operations for them.",
          actionLabel: "Assign admin",
          tone: "warning",
        },
        {
          title: "No payment method",
          description: "Billing actions and automatic renewals are blocked until a payment method is added.",
          actionLabel: "Add payment method",
          tone: "danger",
        },
      ],
    },
  },
  unit: {
    roleLabel: "UNIT ADMIN",
    pageTitle: "Unit Overview",
    pageSubtitle: "Real-time operational status for LEGACY unit",
    scopeOptions: ["Unit: Legacy Campus", "Unit: Heritage Campus"],
    navMain: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        active: true,
      },
      { label: "Audiences", icon: <UserSquare2 className="h-4 w-4" /> },
      {
        label: "Users",
        icon: <Users className="h-4 w-4" />,
        children: [
          "All Users",
          "Add User",
          "Invitations",
          "Bulk Import",
          "Deactivated Users",
        ],
      },
      { label: "Sessions", icon: <CalendarClock className="h-4 w-4" /> },
      { label: "Attendance", icon: <CheckCircle2 className="h-4 w-4" /> },
      { label: "Flagged Records", icon: <AlertTriangle className="h-4 w-4" /> },
      { label: "Disputes", icon: <ShieldAlert className="h-4 w-4" /> },
      { label: "Reports", icon: <FileText className="h-4 w-4" /> },
      { label: "Unit Activity Logs", icon: <ShieldCheck className="h-4 w-4" /> },
    ],
    navBottom: [
      { label: "Support", icon: <Ticket className="h-4 w-4" /> },
      { label: "Settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Log Out", icon: <LogOut className="h-4 w-4" /> },
    ],
    toasts: [
      {
        title: "This action is restricted to Super Admin",
        description:
          "Billing changes are hidden here, but permission and export state feedback remain visible.",
        tone: "info",
      },
      {
        title: "You cannot access this unit",
        description:
          "Cross-unit access is blocked and logged. Switch back to your assigned unit to continue.",
        tone: "danger",
      },
      {
        title: "You do not have permission to manage billing",
        description:
          "Billing changes are restricted to Super Admin and should not appear as an available action here.",
        tone: "warning",
      },
      {
        title: "Export disabled by subscription",
        description:
          "Large report generation is unavailable while the organisation remains in grace period or read-only mode.",
        tone: "warning",
      },
      {
        title: "Session cannot be edited after start",
        description:
          "Session edits are locked after start time. Use dispute or override flow instead of direct mutation.",
        tone: "info",
      },
    ],
    metrics: [
      {
        title: "STATUS",
        value: "Operational",
        subtitle: "All systems active",
        accent: "green",
        trend: "Export success rate 97.6% this week",
        trendTone: "success",
        icon: <MonitorCog className="h-9 w-9" />,
      },
      {
        title: "Dispute\nRate",
        value: "2.4%",
        subtitle: "Of attendance records in this unit",
        trend: "Up 0.3 pts after last week's session spikes",
        trendTone: "warning",
        icon: <Users className="h-9 w-9 text-slate-300" />,
      },
      {
        title: "Duplicate\nAttendance",
        value: "1.2%",
        subtitle: "Duplicate check-in exceptions",
        trend: "Down 0.5 pts after stricter validation",
        trendTone: "success",
        icon: <UserSquare2 className="h-9 w-9 text-rose-200" />,
      },
      {
        title: "Late Sync\nRate",
        value: "3.1%",
        subtitle: "Offline uploads arriving late",
        trend: "27 jobs still queued",
        trendTone: "warning",
        icon: <Waves className="h-9 w-9 text-green-300" />,
      },
      {
        title: "Invite and QR\nQuality",
        value: "81.9% / 1.6%",
        subtitle: "Invite acceptance vs failed QR validations",
        trend: "Invite acceptance rising, QR failures unchanged",
        trendTone: "info",
        icon: <FileText className="h-9 w-9 text-[#b8e9e4]" />,
      },
    ],
    quickActionsPanel: {
      title: "Quick Actions",
      subtitle: "Move through common unit workflows without switching pages.",
      actions: [
        {
          title: "Create User",
          description: "Add a user to this unit and assign role scope.",
          tone: "success",
        },
        {
          title: "Import CSV",
          description: "Upload a roster, preview matches, and resolve duplicates.",
          tone: "info",
        },
        {
          title: "Create Audience",
          description: "Set up a new audience in the current unit.",
          tone: "neutral",
        },
        {
          title: "Start Session",
          description: "Launch attendance capture for a ready audience.",
          tone: "warning",
        },
        {
          title: "Export Report",
          description: "Generate a unit attendance or dispute report.",
          tone: "neutral",
        },
        {
          title: "Create Support Ticket",
          description: "Escalate a product, sync, or delivery issue with context.",
          tone: "danger",
        },
      ],
    },
    commandBar: {
      placeholder:
        "Search users, sessions, audiences, tickets, disputes, exports...",
      emptyState: "No matching unit results found",
      recentSearches: [
        "Pending invites",
        "ENG321 dispute",
        "Export links",
        "CSC 421 Lecture",
      ],
      groups: [
        {
          title: "Users",
          items: [
            {
              title: "Dr. Betty",
              subtitle: "Audience Admin, CSC 421 Lecture",
              meta: "Users / All Users",
              keyword: "user dr betty audience admin csc 421",
              status: "Active",
              statusTone: "success",
            },
            {
              title: "Destiny Jaja",
              subtitle: "Flagged GPS mismatch user",
              meta: "Users / Flagged Records",
              keyword: "user destiny jaja gps mismatch flagged",
            },
          ],
        },
        {
          title: "Sessions",
          items: [
            {
              title: "Computer Science 101 Lecture",
              subtitle: "Live now, 142/150 present",
              meta: "Sessions",
              keyword: "session computer science 101 live",
              status: "LIVE",
              statusTone: "success",
            },
            {
              title: "Sunday Service",
              subtitle: "Upcoming session with 253 registered",
              meta: "Sessions",
              keyword: "session sunday service upcoming",
            },
          ],
        },
        {
          title: "Audiences",
          items: [
            {
              title: "Engineering",
              subtitle: "Highest attendance volume this week",
              meta: "Audiences",
              keyword: "audience engineering attendance volume",
            },
            {
              title: "Law Y",
              subtitle: "Dispute and late-sync pressure",
              meta: "Audiences",
              keyword: "audience law dispute late sync",
              status: "At risk",
              statusTone: "warning",
            },
          ],
        },
        {
          title: "Units",
          items: [
            {
              title: "Legacy Campus",
              subtitle: "Current unit scope",
              meta: "Units",
              keyword: "unit legacy campus current",
              status: "Current",
              statusTone: "info",
            },
          ],
        },
        {
          title: "Tickets",
          items: [
            {
              title: "Bulk Load CSV Formatting",
              subtitle: "Support ticket #1245",
              meta: "Support Tickets",
              keyword: "ticket bulk load csv formatting",
              status: "Pending",
              statusTone: "warning",
            },
            {
              title: "User unable to check in",
              subtitle: "Support ticket #1244",
              meta: "Support Tickets",
              keyword: "ticket user unable check in",
              status: "Open",
              statusTone: "danger",
            },
          ],
        },
        {
          title: "Disputes",
          items: [
            {
              title: "Odion Adekunle absence dispute",
              subtitle: "Needs unit review",
              meta: "Disputes / Pending",
              keyword: "dispute odion absence pending",
              status: "Review",
              statusTone: "warning",
            },
            {
              title: "Chizaram Mac-Pepple network dispute",
              subtitle: "Timeout due in 35 minutes",
              meta: "Disputes / SLA Monitor",
              keyword: "dispute chizaram network timeout",
              status: "Urgent",
              statusTone: "danger",
            },
          ],
        },
        {
          title: "Exports",
          items: [
            {
              title: "Attendance Report Export",
              subtitle: "Signed link expires today",
              meta: "Reports / Exports",
              keyword: "export attendance report expiring",
              status: "Expiring",
              statusTone: "warning",
            },
            {
              title: "Dispute Summary Export",
              subtitle: "Ready for download",
              meta: "Reports / Disputes",
              keyword: "export dispute summary ready",
              status: "Ready",
              statusTone: "success",
            },
          ],
        },
      ],
    },
    trendTitle: "Attendance Trends",
    trendSubtitle: "This week's attendance performance",
    performanceTitle: "Audience Performance",
    performanceSubtitle: "Attendance rate by Audience",
    performanceBars: [
      { label: "Engineering", value: 90 },
      { label: "Sciences", value: 84 },
      { label: "Agric", value: 79 },
      { label: "Law", value: 68 },
      { label: "Chapel", value: 94 },
    ],
    sessionCardTitle: "Active & Upcoming Sessions",
    sessionCardSubtitle: "Live and scheduled sessions for today",
    sessionAction: "Create Session",
    sessions: [
      {
        title: "Computer Science 101 Lecture",
        meta: "CS Y",
        time: "Now - 11:00 AM",
        stat: "142/150",
        badge: "LIVE",
        badgeTone: "live",
      },
      {
        title: "Mechanical Lab Session",
        meta: "Engineering",
        time: "01:30 PM - 2:45 PM",
        stat: "-/60",
        badge: "UPCOMING",
        badgeTone: "upcoming",
      },
      {
        title: "Constitutional Law Seminar",
        meta: "Law Y",
        time: "11:00 AM - 12:30 PM",
        stat: "-/253",
        badge: "UPCOMING",
        badgeTone: "upcoming",
      },
      {
        title: "Sunday Service",
        meta: "Che",
        time: "08:00 AM - 10:30 PM",
        stat: "-/253",
        badge: "UPCOMING",
        badgeTone: "upcoming",
      },
    ],
    provisioningPanel: {
      title: "User Provisioning Visibility",
      subtitle:
        "Monitor manual additions, CSV readiness, duplicates, and invite acceptance for this unit in one place.",
      primaryAction: "Add User",
      secondaryAction: "Open Duplicate Queue",
      stats: [
        {
          label: "Added manually today",
          value: "7",
          helper: "Audience admins created 5 users and unit admins created 2.",
          tone: "success",
        },
        {
          label: "Pending invites",
          value: "14",
          helper: "4 invites are close to expiry and need a resend.",
          tone: "info",
        },
        {
          label: "Failed rows",
          value: "5",
          helper: "Row-level errors are blocking completion of the latest import.",
          tone: "danger",
        },
        {
          label: "Duplicate matches",
          value: "3",
          helper: "Potential overlaps were held out of the active user list.",
          tone: "warning",
        },
      ],
      importHealth: [
        {
          title: "Engineering intake · 260 rows",
          subtitle:
            "242 users created, 13 skipped as duplicates, and 5 rows failed.",
          meta: "Completed 22 mins ago · Failed-row CSV ready to download",
          status: "Review",
          statusTone: "warning",
        },
        {
          title: "Law transfer batch · 48 rows",
          subtitle:
            "Preview is waiting for confirmation before memberships are applied.",
          meta: "Preview saved by Daniel Osa · Duplicate scan complete",
          status: "Pending",
          statusTone: "info",
        },
        {
          title: "Freshers hostel list · 73 rows",
          subtitle: "Rejected because two required columns were missing.",
          meta: "Template guidance should be shown before retry",
          status: "Failed",
          statusTone: "danger",
        },
      ],
      pendingInvites: [
        {
          title: "14 pending invitations",
          subtitle:
            "8 users have not accepted, and 6 invites were opened but not completed.",
          meta: "4 expire this week",
          status: "Action",
          statusTone: "info",
        },
        {
          title: "3 manual accounts need password handoff",
          subtitle:
            "These users were created without email and are not fully activated yet.",
          meta: "Use secure credential distribution before first login",
          status: "Pending",
          statusTone: "neutral",
        },
        {
          title: "2 invite emails bounced",
          subtitle: "Domain-level delivery checks failed for external addresses.",
          meta: "Correct the address or switch to manual provisioning",
          status: "Retry",
          statusTone: "warning",
        },
      ],
      duplicateQueue: [
        {
          title: "3 duplicate candidates",
          subtitle:
            "Matched by matric number, phone, and similar names within Legacy Campus.",
          meta: "One candidate can be auto-merged safely",
          status: "Review",
          statusTone: "warning",
        },
        {
          title: "5 failed rows waiting for correction",
          subtitle:
            "Department mapping and invalid email formatting need attention.",
          meta: "Failed-row report should link back to the source upload",
          status: "Fix",
          statusTone: "danger",
        },
        {
          title: "Most recent import summary",
          subtitle:
            "Created 242 users and reactivated 9 previously inactive members.",
          meta: "Skipped duplicates: 13 · Failed rows: 5",
          status: "Summary",
          statusTone: "success",
        },
      ],
    },
    disputeSlaPanel: {
      title: "Dispute SLA Visibility",
      subtitle:
        "Show which disputes are aging out, which will auto-reject after 14 days, and whether timeout logging and notifications are healthy for this unit.",
      primaryAction: "Prioritize Queue",
      secondaryAction: "View Audit Trail",
      automationSummary:
        "Pending disputes auto-reject at 14 days. When that happens, the system records the timeout event and sends notifications to the dispute owner and unit reviewers.",
      stats: [
        {
          label: "Pending in unit",
          value: "9",
          helper: "Nine disputes are actively waiting for unit or higher-scope action.",
          tone: "info",
        },
        {
          label: "Due in 48 hours",
          value: "3",
          helper: "These should be reviewed before the timeout automation closes them.",
          tone: "warning",
        },
        {
          label: "Overdue",
          value: "1",
          helper: "One case crossed 14 days and needs automation verification.",
          tone: "danger",
        },
        {
          label: "Timed out this week",
          value: "2",
          helper: "Both timeout actions should appear in the system log with notification records.",
          tone: "success",
        },
      ],
      items: [
        {
          title: "Odion Adekunle absence dispute",
          subtitle: "Audience: ENG321 | Reviewer: Unit Admin queue",
          age: "11 days old",
          countdown: "2 days 21 hours remaining",
          automation: "Reminder issued. Timeout job will reject automatically if untouched.",
          status: "At risk",
          statusTone: "warning",
        },
        {
          title: "Chizaram Mac-Pepple network dispute",
          subtitle: "Audience: CSC312 | Recommendation already submitted",
          age: "14 days old",
          countdown: "Timeout due in 35 minutes",
          automation: "System log entry is pre-staged and notification payload is ready.",
          status: "Due now",
          statusTone: "danger",
        },
        {
          title: "Jason Idhemudia session entry dispute",
          subtitle: "Audience: LAW204 | Final unit review completed",
          age: "15 days old",
          countdown: "Timed out yesterday",
          automation: "Auto-rejected on schedule. Audit log and reporter notification completed.",
          status: "Auto-rejected",
          statusTone: "success",
        },
      ],
    },
    systemHealthPanel: {
      title: "Unit System Health",
      subtitle:
        "Track service degradation, sync backlog, delivery issues, outages, and read-only restrictions.",
      primaryAction: "Check Current Status",
      secondaryAction: "View Maintenance Plan",
      accessSummary:
        "When the organisation enters read-only mode, viewing stays available while exports, session creation, and provisioning actions are disabled for the unit.",
      stats: [
        {
          label: "Unit-facing services",
          value: "4/5 healthy",
          helper: "The only active degradation is delayed SMS and reminder delivery.",
          tone: "warning",
        },
        {
          label: "Backlog affecting unit",
          value: "27 jobs",
          helper: "Most are offline attendance syncs from mobile capture devices.",
          tone: "warning",
        },
        {
          label: "Reminder delivery",
          value: "91.4%",
          helper: "Email reminders are healthy but SMS and some push attempts are retrying.",
          tone: "info",
        },
        {
          label: "Read-only state",
          value: "Inactive",
          helper: "This unit is still operational, but restriction guidance is ready if the org lock triggers.",
          tone: "success",
        },
      ],
      serviceStatus: [
        {
          title: "Session start and attendance capture",
          subtitle: "Core classroom operations remain available.",
          detail: "No blocking outage is active. QR validation and geofence checks are within normal latency.",
          status: "Healthy",
          statusTone: "success",
        },
        {
          title: "Offline sync queue",
          subtitle: "27 uploads are queued from recent field capture.",
          detail: "Oldest upload is 16 minutes old. Unit admins should see a delay banner rather than silent stale counts.",
          status: "Degraded",
          statusTone: "warning",
        },
        {
          title: "Invite and reminder delivery",
          subtitle: "SMS confirmations are retrying for a subset of users.",
          detail: "Email completed successfully, and the dashboard should surface the fallback notification path.",
          status: "Partial outage",
          statusTone: "danger",
        },
      ],
      outageHistory: [
        {
          title: "Today · Reminder delivery lag",
          subtitle: "15-minute SMS slowdown for invite and dispute reminders.",
          detail: "No user action required, but unit admins should know why some reminders remain pending.",
          status: "Monitoring",
          statusTone: "warning",
        },
        {
          title: "Yesterday · Offline sync delay",
          subtitle: "Backlog spiked after a large attendance import.",
          detail: "Recovered after worker scale-up. Affected uploads were processed without manual intervention.",
          status: "Resolved",
          statusTone: "success",
        },
        {
          title: "This week · Read-only drill",
          subtitle: "A simulated restriction event verified unit messaging and disabled actions.",
          detail: "The dashboard copy was validated so users understand why write actions are unavailable.",
          status: "Verified",
          statusTone: "info",
        },
      ],
      maintenanceNotices: [
        {
          title: "Planned maintenance banner",
          subtitle: "July 9, 2026 01:00-02:30 WAT.",
          detail: "Unit admins should be warned that report export and invite sending may pause during the window.",
          status: "Scheduled",
          statusTone: "warning",
        },
        {
          title: "Notification worker restart",
          subtitle: "Short risk window for delayed invite and dispute reminders.",
          detail: "In-app banners should remain visible until the retry queue returns to normal.",
          status: "Low risk",
          statusTone: "info",
        },
        {
          title: "Restriction guidance",
          subtitle: "Read-only state preserves visibility but blocks mutations.",
          detail: "Create Session, exports, provisioning, and some dispute actions must explain the restriction clearly.",
          status: "Ready",
          statusTone: "neutral",
        },
      ],
    },
    actionQueuePanel: {
      title: "My Approvals and Action Queue",
      subtitle:
        "Your unit queue for disputes, flagged records, invites, confirmations, and expiring exports.",
      primaryAction: "Open Action Queue",
      secondaryAction: "View Urgent Items",
      stats: [
        {
          label: "Awaiting my review",
          value: "8",
          helper: "Disputes, flagged records, and queue items currently assigned to you.",
          tone: "warning",
        },
        {
          label: "Flagged records",
          value: "4",
          helper: "These records are already triaged and waiting for action.",
          tone: "danger",
        },
        {
          label: "Invite follow-ups",
          value: "5",
          helper: "Pending accepts, bounced deliveries, and manual handoff cases.",
          tone: "info",
        },
        {
          label: "Expiring exports",
          value: "2",
          helper: "Two report links should be regenerated before the users lose access.",
          tone: "success",
        },
      ],
      approvals: [
        {
          title: "3 pending disputes require unit review",
          subtitle: "Attendance exceptions and entry errors are waiting in your queue.",
          detail: "One dispute is due today, while two others need recommendation updates before escalation.",
          status: "Review",
          statusTone: "warning",
        },
        {
          title: "4 flagged attendance records need action",
          subtitle: "Duplicate check-ins, spoofing, and GPS mismatch events are unresolved.",
          detail: "These records are already scored and should move to approve, dispute, or override next.",
          status: "Priority",
          statusTone: "danger",
        },
        {
          title: "1 access change awaiting confirmation",
          subtitle: "A sensitive audience-scope role update is staged for this unit.",
          detail: "Fresh confirmation is still required before the permission set goes live.",
          status: "Confirm",
          statusTone: "danger",
        },
      ],
      followUps: [
        {
          title: "5 invitation follow-ups",
          subtitle: "Users still have not accepted or their invite delivery failed.",
          detail: "2 invites expire this week, 2 bounced, and 1 manual account still needs password handoff.",
          status: "Follow-up",
          statusTone: "info",
        },
        {
          title: "2 duplicate import decisions outstanding",
          subtitle: "User matches were held back from the latest CSV upload.",
          detail: "Resolve these before the next audience roster import is approved.",
          status: "Blocked",
          statusTone: "warning",
        },
        {
          title: "1 stale dispute reminder needs resend",
          subtitle: "A reminder notification was delayed during the SMS slowdown.",
          detail: "Use the fallback path so the owner sees the dispute deadline in time.",
          status: "Resend",
          statusTone: "info",
        },
      ],
      timeSensitive: [
        {
          title: "2 exports expire today",
          subtitle: "Attendance and dispute summary links will stop working soon.",
          detail: "Regenerate them now if staff still need access.",
          status: "Expiring",
          statusTone: "warning",
        },
        {
          title: "1 dispute hits timeout in 35 minutes",
          subtitle: "The recommendation is already attached but the final unit action is missing.",
          detail: "Either resolve it now or let the automation auto-reject and log the timeout.",
          status: "Urgent",
          statusTone: "danger",
        },
        {
          title: "Maintenance window starts tonight",
          subtitle: "Invite sends and some report actions may pause briefly.",
          detail: "Complete critical queue items before the scheduled maintenance banner appears.",
          status: "Heads-up",
          statusTone: "info",
        },
      ],
    },
    sessionIntegrityPanel: {
      title: "Session Integrity Monitor",
      subtitle:
        "Track overlaps, ending-soon sessions, lock state, late-attendance rules, and archive reviews.",
      primaryAction: "Open Integrity Queue",
      secondaryAction: "Review Ending Sessions",
      stats: [
        {
          label: "Overlap conflicts",
          value: "2",
          helper: "Two sessions in this unit are blocked or at risk because of active overlap.",
          tone: "danger",
        },
        {
          label: "Ending soon",
          value: "3",
          helper: "These sessions need end-of-session checks within the next 30 minutes.",
          tone: "warning",
        },
        {
          label: "Late-attendance rules",
          value: "5",
          helper: "Five audiences currently use custom grace windows in this unit.",
          tone: "info",
        },
        {
          label: "Locked sessions",
          value: "7",
          helper: "These sessions are closed to direct edits and must use review flows.",
          tone: "success",
        },
        {
          label: "Archives pending review",
          value: "2",
          helper: "Archive requests still need confirmation before they are final.",
          tone: "warning",
        },
      ],
      conflicts: [
        {
          title: "CSC 421 Lecture overlaps another live audience session",
          subtitle: "The same audience scope still has an active session open.",
          detail: "Keep Start Session disabled until the active one ends or is formally archived.",
          status: "Blocked",
          statusTone: "danger",
        },
        {
          title: "Sunday Service ends in 22 minutes",
          subtitle: "Attendance is still climbing and no lock reminder has been acknowledged yet.",
          detail: "Prepare the end-session flow and alert the admin if post-session review is still outstanding.",
          status: "Ending soon",
          statusTone: "warning",
        },
        {
          title: "LAW Y seminar has a delayed start because of scope conflict",
          subtitle: "A previously scheduled session was not archived on time.",
          detail: "Resolve the archive queue first so the next session can start cleanly.",
          status: "At risk",
          statusTone: "warning",
        },
      ],
      governance: [
        {
          title: "7 sessions are locked",
          subtitle: "Manual edits are disabled for already-completed or protected sessions.",
          detail: "Use dispute, override, or archive review flows instead of direct editing.",
          status: "Locked",
          statusTone: "success",
        },
        {
          title: "5 late-attendance rules need consistency review",
          subtitle: "Custom grace windows vary between Engineering, Law, and Chapel.",
          detail: "Compare them against the unit default before another attendance spike increases disputes.",
          status: "Review",
          statusTone: "info",
        },
        {
          title: "1 session is still editable beyond the normal cutoff",
          subtitle: "This weakens the expected integrity guardrails for attendance edits.",
          detail: "Correct the lock policy before the next cycle of exports and archive actions.",
          status: "Fix",
          statusTone: "danger",
        },
      ],
      reviews: [
        {
          title: "2 archives await final review",
          subtitle: "Completed sessions were archived but still need unit confirmation.",
          detail: "Confirm attendee totals, export readiness, and dispute state before final approval.",
          status: "Review",
          statusTone: "warning",
        },
        {
          title: "1 archive has pending export confirmation",
          subtitle: "The signed report link has not been sent to the owner yet.",
          detail: "Send or regenerate the export before the archive is treated as complete.",
          status: "Action",
          statusTone: "info",
        },
        {
          title: "1 archive request is blocked by open dispute",
          subtitle: "A network-failure dispute still references the session.",
          detail: "Do not finalize the archive until the dispute path closes.",
          status: "Hold",
          statusTone: "danger",
        },
      ],
    },
    savedViewsPanel: {
      title: "Saved Filters and Views",
      subtitle:
        "Reuse your most important filters across this unit.",
      views: [
        {
          title: "Flagged Records · GPS and Spoofing",
          subtitle: "Security-sensitive anomalies for this unit",
          detail: "Saved severity filter focused on spoofing, GPS mismatch, and duplicate check-ins",
          status: "Pinned",
          statusTone: "warning",
        },
        {
          title: "Sessions · Upcoming and Unlocked",
          subtitle: "Sessions that still allow setup changes",
          detail: "Helpful for final pre-start checks and audience readiness review",
          status: "Daily",
          statusTone: "info",
        },
        {
          title: "Users · Pending Invite Acceptance",
          subtitle: "People who still have not completed onboarding",
          detail: "Combines expiring invites, bounced delivery, and manual handoff cases",
          status: "Actionable",
          statusTone: "success",
        },
        {
          title: "Reports · Export Failures and Expiring Links",
          subtitle: "Recent report generation risk states",
          detail: "Shows which downloads need regeneration or support follow-up",
          status: "Monitored",
          statusTone: "danger",
        },
      ],
    },
    lowerLeftTitle: "Flagged Attendance Records",
    lowerLeftSubtitle: "Records requiring review",
    lowerLeftItems: [
      {
        title: "Sylvester Bright",
        subtitle: "Multiple Login Attempt - ENG321 Lecture",
        meta: "09:15 AM",
        status: "HIGH",
        statusTone: "danger",
      },
      {
        title: "Chidera Desmond",
        subtitle: "Early Checkout - ISD 214",
        meta: "11:20 AM",
        status: "LOW",
        statusTone: "neutral",
      },
      {
        title: "Osakpolor Divine",
        subtitle: "Geofencing Spoofing Detected - CSC312 Lecture",
        meta: "10:42 AM",
        status: "HIGH",
        statusTone: "danger",
      },
      {
        title: "Destiny Jaja",
        subtitle: "GPS Mismatch - GEN 132",
        meta: "01:15 PM",
        status: "MEDIUM",
        statusTone: "warning",
      },
    ],
    lowerLeftFooter: "View all flagged records",
    lowerRightTitle: "Pending Disputes",
    lowerRightSubtitle: "HISTORY",
    lowerRightItems: [
      {
        title: "Odion Adekunle",
        subtitle: "Incorrect Absence Mark - 2 hours ago",
        meta: "Final approval restricted to higher scope",
        status: "PENDING",
        statusTone: "neutral",
      },
      {
        title: "Jason Idhemudia",
        subtitle: "Session Entry Error - 8 hours ago",
        meta: "Audience recommendation attached",
        status: "RESOLVED",
        statusTone: "success",
      },
      {
        title: "Chizaram Mac-Pepple",
        subtitle: "Network Failure - 12 hours ago",
        meta: "Recommendation submitted",
        status: "PENDING",
        statusTone: "neutral",
      },
    ],
    lowerRightFooter: "View all disputes",
    extraBottomLeftTitle: "Unit Activity Logs",
    extraBottomLeftSubtitle: "Audit trail of recent activities",
    extraBottomLeftItems: [
      {
        title: "Session Started “Q4 Review”",
        subtitle: "SYSTEM",
        meta: "System - 5 mins ago",
      },
      {
        title: "New Users Added",
        subtitle: "Session: CSC 421 Lecture - Dr. Betty",
        meta: "Audience Admin: Dr. Betty - 20 mins ago",
      },
      {
        title: "Attendance Report Exported",
        subtitle: "Session: GST 121 - Mrs Imekan",
        meta: "Audience Admin: Mrs Imekan - 40 mins ago",
      },
      {
        title: "Geofencing Feature Changed",
        subtitle: "GPS Radius for Audience - ISD 221 changed from 20m to 45m",
        meta: "Audience Admin: Mr Babalola - 1 hour ago",
      },
    ],
    extraBottomLeftFooter: "View full audit log",
    extraBottomRightTitle: "Support Tickets",
    extraBottomRightSubtitle: "Recent support requests",
    extraBottomRightItems: [
      {
        title: "App crash on Log-In",
        subtitle: "#1245",
        meta: "Updated 2 hours ago",
      },
      {
        title: "User unable to check in",
        subtitle: "#1244",
        meta: "Updated 5 hours ago",
      },
      {
        title: "Bulk Load CSV Formatting",
        subtitle: "#1245",
        meta: "Updated 1 day ago",
      },
    ],
    stateShowcaseTitle: "Restricted & Recovery States",
    stateShowcaseItems: [
      {
        title: "No audiences yet",
        description: "Create your first audience to start scheduling attendance sessions in this unit.",
        tone: "neutral",
      },
      {
        title: "Permission denied",
        description: "This action is restricted to Super Admin. Unit-level admins should see guidance, not a silent failure.",
        tone: "danger",
      },
      {
        title: "Attendance record already updated",
        description: "Another admin changed this record first. Refresh the page and review the latest audit trail before retrying.",
        tone: "warning",
      },
      {
        title: "Skeleton loading",
        description: "Metric cards, tables, charts, activity feeds, and support queues should render with loading placeholders.",
        tone: "info",
      },
    ],
    modalExamplesTitle: "Critical Confirmation Modals",
    modalExamples: [
      {
        title: "Resolve dispute modal",
        description: "Show affected user, evidence, recommendation, and the reminder that the action will be logged.",
        tone: "success",
      },
      {
        title: "Deactivate user modal",
        description: "Explain deactivation impact, unit scope, and log the admin actor for audit review.",
        tone: "warning",
      },
    ],
    guidedEmptyStatesPanel: {
      title: "Guided Empty States",
      subtitle:
        "Empty modules should show the next best action so unit admins always know how to move forward.",
      items: [
        {
          title: "No audiences yet",
          description: "This unit cannot schedule sessions until the first audience exists.",
          actionLabel: "Create first audience",
          tone: "neutral",
        },
        {
          title: "No audience admins assigned",
          description: "Daily attendance operations need an owner before sessions scale cleanly.",
          actionLabel: "Assign admin",
          tone: "warning",
        },
        {
          title: "No payment method at organisation level",
          description: "If billing stays incomplete, the unit may lose write access later.",
          actionLabel: "Request billing update",
          tone: "danger",
        },
      ],
    },
  },
  audience: {
    roleLabel: "AUDIENCE ADMIN",
    pageTitle: "Hello John Doe!",
    pageSubtitle: "Welcome back! Here's what's happening today",
    scopeOptions: ["Audience: CSC 411", "Audience: CSC 311", "Audience: CSC 221"],
    audienceTabs: ["CSC 411", "CSC 311", "CSC 221", "CSC 111"],
    navMain: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        active: true,
      },
      { label: "Sessions", icon: <CalendarClock className="h-4 w-4" /> },
      { label: "Attendance", icon: <CheckCircle2 className="h-4 w-4" /> },
      { label: "Disputes", icon: <ShieldAlert className="h-4 w-4" /> },
      { label: "Reports", icon: <FileText className="h-4 w-4" /> },
      {
        label: "Activity Feed",
        icon: <ShieldCheck className="h-4 w-4" />,
        children: [
          "Session started",
          "Session ended",
          "Report exported",
          "Attendance marked",
          "Check-in failed",
        ],
      },
    ],
    navBottom: [
      { label: "Settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Support", icon: <Ticket className="h-4 w-4" /> },
      { label: "Log Out", icon: <LogOut className="h-4 w-4" /> },
    ],
    toasts: [
      {
        title: "Attendance override approval is restricted",
        description:
          "You can comment and attach evidence, but final override decisions remain with Unit Admin or Super Admin.",
        tone: "warning",
      },
      {
        title: "Archive does not delete attendance records",
        description:
          "Archive requires confirmation, creates an activity log entry, and is disabled while a session is live.",
        tone: "info",
      },
      {
        title: "Start Session safeguard: overlap detected",
        description:
          "Another live session overlaps this audience. Start Session stays disabled until the active one ends.",
        tone: "danger",
      },
      {
        title: "Start Session safeguard: QR or geofence unavailable",
        description:
          "Show QR validation unavailable, offline mode, geofence unavailable, subscription restriction, and user-limit states before session start.",
        tone: "warning",
      },
    ],
    metrics: [
      {
        title: "Start Session",
        value: "",
        accent: "green",
        icon: <Play className="h-10 w-10" />,
      },
      {
        title: "Schedule Session",
        value: "",
        icon: <CalendarClock className="h-10 w-10 text-slate-700" />,
      },
      {
        title: "View Records",
        value: "",
        icon: <FolderOpen className="h-10 w-10 text-slate-700" />,
      },
      {
        title: "Total Users",
        value: "67",
        icon: <Users className="h-9 w-9 text-slate-700" />,
      },
    ],
    trendTitle: "Recent Sessions",
    trendSubtitle: "View all past session",
    performanceTitle: "LIVE FEED",
    performanceSubtitle: "Attendance live record of ongoing session",
    performanceBars: [],
    sessionCardTitle: "Recent Sessions",
    sessionCardSubtitle: "",
    sessionAction: "View all past session",
    sessions: [
      {
        title: "CSC 411 Afternoon Seminar",
        meta: "Oct 24, 2024",
        time: "",
        stat: "102/150",
        badge: "LIVE",
        badgeTone: "live",
        actionLabel: "Archive disabled",
      },
      {
        title: "CSC 411 Practical Session B",
        meta: "Oct 22, 2024",
        time: "",
        stat: "92/150",
        badge: "ARCHIVED",
        badgeTone: "archived",
        actionLabel: "Unarchive",
      },
      {
        title: "REVIEW: Introduction to HTML",
        meta: "Oct 18, 2024",
        time: "",
        stat: "85/150",
        badge: "COMPLETED",
        badgeTone: "completed",
        actionLabel: "Archive",
      },
    ],
    lowerLeftTitle: "LIVE FEED",
    lowerLeftSubtitle: "Attendance live record of ongoing session",
    lowerLeftItems: [
      {
        title: "User Check In: ERROR",
        subtitle: "SCN/CSC/240022",
        meta: "Audience - 11:08AM",
      },
      {
        title: "User Check In",
        subtitle: "SCN/CSC/240111",
        meta: "Audience - 11:04AM",
      },
      {
        title: "User Check In",
        subtitle: "SCN/CSC/240419",
        meta: "Audience - 11:03AM",
      },
      {
        title: "Session Started",
        subtitle: "Audience Admin - Mr. John Doe",
        meta: "ADMIN - 10:00AM",
      },
    ],
    lowerLeftFooter: "View full feed",
    lowerRightTitle: "Support Tickets",
    lowerRightSubtitle: "Recent support requests",
    lowerRightItems: [
      {
        title: "App crash on Log-In",
        subtitle: "#1245",
        meta: "Updated 12 minutes ago",
      },
      {
        title: "User unable to check in",
        subtitle: "#1244",
        meta: "Updated 15 minutes ago",
      },
    ],
    audienceLivePanel: {
      title: "CSC 411: Introduction to C",
      timer: "00:32:55",
      progress: 80,
      summary: "84/105 Students Checked In",
      primaryAction: "View Session Stats",
      secondaryAction: "End Session",
    },
    reportFilters: {
      dateRange: "Start Date - End Date",
      session: "All Sessions",
      audience: "CSC 411",
      downloads: [
        {
          title: "Attendance_Oct_24.csv",
          meta: "2.4 MB - CSV Format",
          expiry: "Expires in 2h",
        },
        {
          title: "Monthly_Summary_Q3.pdf",
          meta: "8.1 MB - PDF Format",
          expiry: "Expires in 12h",
        },
      ],
    },
    stateShowcaseTitle: "Audience Workflow States",
    stateShowcaseItems: [
      {
        title: "No active sessions",
        description: "No active session yet. Start a session or schedule one to begin attendance tracking.",
        tone: "neutral",
      },
      {
        title: "Report generation failed",
        description: "The export job failed. Retry in the background queue or inspect the signed-link expiry state.",
        tone: "danger",
      },
      {
        title: "Session conflict detected",
        description: "Another admin updated the attendance record first. Refresh before attempting another change.",
        tone: "warning",
      },
      {
        title: "No support tickets",
        description: "There are no open support requests for this audience right now.",
        tone: "success",
      },
    ],
    modalExamplesTitle: "Archive & End Session Modals",
    modalExamples: [
      {
        title: "Archive session confirmation",
        description: "Message: Archiving does not delete attendance records. Disable this action while session is live.",
        tone: "info",
        bullets: [
          "This action will be logged",
          "Archived sessions remain reportable",
          "Show actor and timestamp in activity feed",
        ],
      },
      {
        title: "End live session confirmation",
        description: "Confirm the final attendee count, lock editing, and send a post-session export prompt.",
        tone: "warning",
      },
    ],
  },
};
