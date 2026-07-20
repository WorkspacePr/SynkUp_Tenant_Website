"use client";

import { Activity, BellRing, Building2, Users } from "lucide-react";

import type {
  AdminCandidate,
  AdminRole,
  AssignedUnitAdmin,
  AudienceSummary,
  CreateUnitStatus,
  OverviewMetric,
  UnitFormDefaults,
  UnitLifecycleStatus,
  UnitSummary,
  UnitType,
} from "./types";

export const LIFECYCLE_STATES: UnitLifecycleStatus[] = [
  "ACTIVE",
  "ARCHIVED",
  "RESTRICTED",
  "PENDING ARCHIVE",
];

export const UNIT_TYPES: UnitType[] = ["Campus", "Branch", "Department", "Subsidiary"];
export const UNIT_CREATION_STATUSES: CreateUnitStatus[] = ["Active", "Draft"];
export const ADMIN_ROLES: AdminRole[] = ["Unit Admin", "Read-Only Admin"];
export const PLAN_UNIT_LIMIT = 5;
export const PLAN_LABEL = "Growth";
export const UNLIMITED_UNITS = false;

export const ADMIN_CANDIDATES: AdminCandidate[] = [
  {
    id: "john-doe",
    name: "Prof. John Doe",
    email: "john.doe@synkup.edu",
    tenant: "current",
    active: true,
    assignedUnitId: 1,
    maxRole: "Unit Admin",
  },
  {
    id: "mary-ogu",
    name: "Mary Ogu",
    email: "mary.ogu@synkup.edu",
    tenant: "current",
    active: true,
    maxRole: "Read-Only Admin",
  },
  {
    id: "daniel-uwa",
    name: "Daniel Uwa",
    email: "daniel.uwa@synkup.edu",
    tenant: "current",
    active: false,
    maxRole: "Unit Admin",
  },
  {
    id: "grace-obaseki",
    name: "Grace Obaseki",
    email: "grace@othertenant.io",
    tenant: "other",
    active: true,
    maxRole: "Unit Admin",
  },
];

export const UNITS: UnitSummary[] = [
  {
    id: 1,
    name: "LEGACY CAMPUS",
    totalUsers: "8,249",
    audiences: "26",
    sessions: "14",
    admins: [
      "Prof. John Doe",
      "Mrs. Akaonye Ifeoma",
      "Prof. Ikhu Omoregbie",
      "Dr. Betty Isokhen",
    ],
    organization: "Benson Idahosa University",
    createdAt: "Sept 12, 2023",
    statusLabel: "Operational",
    statusMessage: "All systems active",
    lifecycleStatus: "ACTIVE",
    criticalAlertsCount: 0,
    affectedUsers: 8249,
    affectedAudiences: 26,
    activeSessionsCount: 14,
    alerts: [
      {
        title: "Active session failure",
        description: "No failed session launches or attendance captures were detected.",
        state: "healthy",
      },
      {
        title: "High flagged attendance count",
        description: "Flagged attendance volume is below the unit escalation threshold.",
        state: "healthy",
      },
      {
        title: "Unit admin missing",
        description: "At least one unit admin is actively assigned and verified.",
        state: "healthy",
      },
      {
        title: "Sync backlog affecting the unit",
        description: "Queue depth is within SLA and no unit-specific backlog is blocking updates.",
        state: "healthy",
      },
      {
        title: "Geofence / QR validation issues",
        description: "No validation anomalies are currently open for this unit.",
        state: "healthy",
      },
      {
        title: "Unresolved high-severity disputes",
        description: "There are no unresolved high-severity disputes for this unit.",
        state: "healthy",
      },
      {
        title: "No assigned Unit Admin",
        description: "The unit has an assigned admin coverage plan and no access gap exists.",
        state: "healthy",
      },
    ],
  },
  {
    id: 2,
    name: "HERITAGE CAMPUS",
    totalUsers: "7,149",
    audiences: "20",
    sessions: "12",
    admins: [
      "Prof. John Doe",
      "Mrs. Akaonye Ifeoma",
      "Mr. Joseph Momoh",
      "Dr. Theophilus Gregory",
    ],
    organization: "Benson Idahosa University",
    createdAt: "Sept 12, 2023",
    statusLabel: "Restricted",
    statusMessage: "Validation checks require admin review",
    lifecycleStatus: "RESTRICTED",
    criticalAlertsCount: 3,
    affectedUsers: 7149,
    affectedAudiences: 20,
    activeSessionsCount: 12,
    alerts: [
      {
        title: "Active session failure",
        description: "One audience session failed to complete its final sync retry.",
        state: "critical",
      },
      {
        title: "High flagged attendance count",
        description: "Flagged attendance volume is above the review threshold for this week.",
        state: "warning",
      },
      {
        title: "Unit admin missing",
        description: "Unit admin coverage is present and verified.",
        state: "healthy",
      },
      {
        title: "Sync backlog affecting the unit",
        description: "A queue backlog is delaying one session reconciliation batch.",
        state: "critical",
      },
      {
        title: "Geofence / QR validation issues",
        description: "Multiple QR validation mismatches were detected in the last 24 hours.",
        state: "warning",
      },
      {
        title: "Unresolved high-severity disputes",
        description: "One unresolved dispute remains escalated for unit review.",
        state: "warning",
      },
      {
        title: "No assigned Unit Admin",
        description: "One admin slot is vacant for this unit and requires reassignment.",
        state: "critical",
      },
    ],
  },
];

export const UNIT_FORM_DEFAULTS: Record<number, UnitFormDefaults> = {
  1: {
    unitType: "Campus",
    location: "Benin City, Edo State",
    description:
      "Primary academic campus managing live audiences, active sessions, and daily attendance operations.",
    shortCode: "LEG-CMP",
    status: "Active",
    assignedAdmins: ["john-doe", "mary-ogu"],
  },
  2: {
    unitType: "Campus",
    location: "Benin City, Edo State",
    description:
      "Secondary campus with dedicated admin oversight, session monitoring, and audience management.",
    shortCode: "HER-CMP",
    status: "Active",
    assignedAdmins: ["mary-ogu"],
  },
};

export const AUDIENCE_LOOKUP: Record<number, AudienceSummary[]> = {
  1: [
    { name: "CFI Service", admin: "Rev. John Doe", totalUsers: "8,249", status: "LIVE" },
    { name: "Chapel Service", admin: "Prof. John Doe", totalUsers: "8,249", status: "LIVE" },
    { name: "Mechanical Laboratory", admin: "Prof. John Doe", totalUsers: "8,249", status: "LIVE" },
    { name: "Civil Laboratory", admin: "Prof. John Doe", totalUsers: "8,249", status: "LIVE" },
    { name: "Electrical Laboratory", admin: "Prof. John Doe", totalUsers: "8,249", status: "LIVE" },
    { name: "Computer Laboratory", admin: "Prof. John Doe", totalUsers: "8,249", status: "LIVE" },
  ],
  2: [
    { name: "MBA Students", admin: "Prof. John Doe", totalUsers: "7,149", status: "LIVE" },
    { name: "Biochemistry", admin: "Mrs. Akaonye Ifeoma", totalUsers: "7,149", status: "REVIEW" },
    { name: "Anatomy Lab", admin: "Mr. Joseph Momoh", totalUsers: "7,149", status: "LIVE" },
    { name: "Nursing Clinicals", admin: "Dr. Theophilus Gregory", totalUsers: "7,149", status: "FLAGGED" },
    { name: "Accounting Year 2", admin: "Prof. John Doe", totalUsers: "7,149", status: "LIVE" },
    { name: "Architecture Studio", admin: "Mrs. Akaonye Ifeoma", totalUsers: "7,149", status: "LIVE" },
  ],
};

export const ASSIGNED_UNIT_ADMINS_LOOKUP: Record<number, AssignedUnitAdmin[]> = {
  1: [
    {
      name: "Prof. John Doe",
      email: "john.doe@synkup.edu",
      role: "Lead Unit Admin",
      status: "Active",
      lastActive: "2 mins ago",
    },
    {
      name: "Mrs. Akaonye Ifeoma",
      email: "ifeoma@synkup.edu",
      role: "Unit Admin",
      status: "Active",
      lastActive: "18 mins ago",
    },
    {
      name: "Prof. Ikhu Omoregbie",
      email: "omoregbie@synkup.edu",
      role: "Read-Only Admin",
      status: "Pending",
      lastActive: "Invitation sent",
    },
  ],
  2: [
    {
      name: "Prof. John Doe",
      email: "john.doe@synkup.edu",
      role: "Lead Unit Admin",
      status: "Active",
      lastActive: "9 mins ago",
    },
    {
      name: "Mr. Joseph Momoh",
      email: "momoh@synkup.edu",
      role: "Unit Admin",
      status: "Active",
      lastActive: "43 mins ago",
    },
    {
      name: "Dr. Theophilus Gregory",
      email: "gregory@synkup.edu",
      role: "Read-Only Admin",
      status: "Inactive",
      lastActive: "3 days ago",
    },
  ],
};

export const OVERVIEW_METRICS: OverviewMetric[] = [
  {
    title: "Total Units",
    value: "2",
    icon: <Building2 className="h-9 w-9" />,
    accent: "green",
  },
  {
    title: "Total Audiences",
    value: "2,847",
    icon: <Users className="h-9 w-9" />,
  },
  {
    title: "Active Sessions",
    value: "312",
    icon: <Activity className="h-9 w-9 text-[#22c55e]" />,
  },
  {
    title: "Critical Alerts",
    value: "3",
    icon: <BellRing className="h-9 w-9 text-[#ff2d2d]" />,
    valueClassName: "text-[#ff2d2d]",
    titleClassName: "text-[#ff2d2d]",
  },
];
