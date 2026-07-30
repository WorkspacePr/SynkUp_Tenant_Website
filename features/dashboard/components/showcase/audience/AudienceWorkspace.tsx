"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Eye,
  Factory,
  Grid2X2,
  List,
  Search,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import { AvatarSeed, DashboardDataTable, PaginationControl, TableFilterBar } from "../units/shared";
import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";

type AudienceStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
type Health = "healthy" | "warning" | "critical" | "neutral";
type AudienceHealth = { state: Health; reasons: string[] };
type AudienceHealthSignals = {
  pendingInvitationThreshold: number;
  staleActivity: boolean;
  deliveryFailures: number;
  syncFailures: number;
  blockedAttendance: boolean;
  unresolvedCriticalIssues: number;
  insufficientData: boolean;
};
type AudienceAdminStatus = "ACTIVE" | "PENDING" | "INACTIVE";
type MembershipTab = "active" | "pending" | "inactive";
type AudienceAdmin = {
  id: string;
  name: string;
  email: string;
  role: "Lead Audience Admin" | "Audience Admin" | "Read-Only Admin";
  status: AudienceAdminStatus;
  lastActivity: string;
  unitScope: string;
  isPrimary: boolean;
};
type AudienceTransferEvent = {
  id: string;
  userName: string;
  fromUnit: string;
  toUnit: string;
  transferredAt: string;
  actor: string;
  invalidatedMemberships: string[];
  reassignedMemberships: string[];
};
type Audience = {
  id: number;
  name: string;
  unitId: number;
  unit: string;
  type: string;
  identifier: string;
  admins: AudienceAdmin[];
  members: number | null;
  pending: number | null;
  invalidatedMemberships: number;
  status: AudienceStatus;
  healthSignals: AudienceHealthSignals;
  transferEvents: AudienceTransferEvent[];
};

const AUDIENCES: Audience[] = [
  {
    id: 1,
    name: "Computer Science 101 Lecture",
    unitId: 1,
    unit: "Legacy Campus",
    type: "Lecture",
    identifier: "LEG-CSC-2026",
    admins: [
      {
        id: "john-doe",
        name: "Prof. John Doe",
        email: "john.d@synkup.edu",
        role: "Lead Audience Admin",
        status: "ACTIVE",
        lastActivity: "2 mins ago",
        unitScope: "Legacy Campus",
        isPrimary: true,
      },
      {
        id: "mary-ogu",
        name: "Mary Ogu",
        email: "mary.ogu@synkup.edu",
        role: "Audience Admin",
        status: "ACTIVE",
        lastActivity: "18 mins ago",
        unitScope: "Legacy Campus",
        isPrimary: false,
      },
    ],
    members: 302,
    pending: 12,
    invalidatedMemberships: 3,
    status: "ACTIVE",
    healthSignals: { pendingInvitationThreshold: 100, staleActivity: false, deliveryFailures: 0, syncFailures: 0, blockedAttendance: false, unresolvedCriticalIssues: 0, insufficientData: false },
    transferEvents: [
      {
        id: "transfer-001",
        userName: "David Eromosele",
        fromUnit: "Legacy Campus",
        toUnit: "Heritage Campus",
        transferredAt: "July 18, 2026",
        actor: "Prof. John Doe",
        invalidatedMemberships: ["Computer Science 101 Lecture"],
        reassignedMemberships: ["Introduction to Anatomy"],
      },
      {
        id: "transfer-002",
        userName: "Esther Bello",
        fromUnit: "Legacy Campus",
        toUnit: "Heritage Campus",
        transferredAt: "July 16, 2026",
        actor: "Mary Ogu",
        invalidatedMemberships: ["Computer Science 101 Lecture"],
        reassignedMemberships: ["Constitutional Law Seminar"],
      },
    ],
  },
  {
    id: 2,
    name: "Mechanical Lab Session",
    unitId: 1,
    unit: "Legacy Campus",
    type: "Laboratory",
    identifier: "LEG-MEE-2026",
    admins: [
      {
        id: "john-doe",
        name: "Prof. John Doe",
        email: "john.d@synkup.edu",
        role: "Lead Audience Admin",
        status: "ACTIVE",
        lastActivity: "9 mins ago",
        unitScope: "Legacy Campus",
        isPrimary: true,
      },
      {
        id: "ifeoma-akaonye",
        name: "Mrs. Akaonye Ifeoma",
        email: "ifeoma@synkup.edu",
        role: "Read-Only Admin",
        status: "PENDING",
        lastActivity: "Invitation sent",
        unitScope: "Legacy Campus",
        isPrimary: false,
      },
    ],
    members: 150,
    pending: 0,
    invalidatedMemberships: 1,
    status: "ACTIVE",
    healthSignals: { pendingInvitationThreshold: 50, staleActivity: false, deliveryFailures: 0, syncFailures: 1, blockedAttendance: false, unresolvedCriticalIssues: 0, insufficientData: false },
    transferEvents: [
      {
        id: "transfer-003",
        userName: "Samuel Adegboyega",
        fromUnit: "Legacy Campus",
        toUnit: "Heritage Campus",
        transferredAt: "July 19, 2026",
        actor: "Prof. John Doe",
        invalidatedMemberships: ["Mechanical Lab Session"],
        reassignedMemberships: ["Introduction to Anatomy"],
      },
    ],
  },
  {
    id: 3,
    name: "Constitutional Law Seminar",
    unitId: 2,
    unit: "Heritage Campus",
    type: "Seminar",
    identifier: "HER-LAW-2026",
    admins: [],
    members: null,
    pending: null,
    invalidatedMemberships: 0,
    status: "DRAFT",
    healthSignals: { pendingInvitationThreshold: 25, staleActivity: false, deliveryFailures: 0, syncFailures: 0, blockedAttendance: false, unresolvedCriticalIssues: 0, insufficientData: true },
    transferEvents: [],
  },
  {
    id: 4,
    name: "Introduction to Anatomy",
    unitId: 2,
    unit: "Heritage Campus",
    type: "Lecture",
    identifier: "HER-ANA-2026",
    admins: [
      {
        id: "joseph-momoh",
        name: "Mr. Joseph Momoh",
        email: "momoh@synkup.edu",
        role: "Lead Audience Admin",
        status: "ACTIVE",
        lastActivity: "43 mins ago",
        unitScope: "Heritage Campus",
        isPrimary: true,
      },
      {
        id: "theophilus-gregory",
        name: "Dr. Theophilus Gregory",
        email: "gregory@synkup.edu",
        role: "Audience Admin",
        status: "INACTIVE",
        lastActivity: "3 days ago",
        unitScope: "Heritage Campus",
        isPrimary: false,
      },
    ],
    members: 540,
    pending: 105,
    invalidatedMemberships: 0,
    status: "ARCHIVED",
    healthSignals: { pendingInvitationThreshold: 100, staleActivity: true, deliveryFailures: 0, syncFailures: 0, blockedAttendance: false, unresolvedCriticalIssues: 0, insufficientData: false },
    transferEvents: [
      {
        id: "transfer-004",
        userName: "David Eromosele",
        fromUnit: "Legacy Campus",
        toUnit: "Heritage Campus",
        transferredAt: "July 18, 2026",
        actor: "Prof. John Doe",
        invalidatedMemberships: ["Computer Science 101 Lecture"],
        reassignedMemberships: ["Introduction to Anatomy"],
      },
    ],
  },
  {
    id: 5,
    name: "CFI Service",
    unitId: 1,
    unit: "Legacy Campus",
    type: "Service",
    identifier: "LEG-CFI-2026",
    admins: [
      {
        id: "john-doe",
        name: "Prof. John Doe",
        email: "john.d@synkup.edu",
        role: "Lead Audience Admin",
        status: "ACTIVE",
        lastActivity: "Just now",
        unitScope: "Legacy Campus",
        isPrimary: true,
      },
      {
        id: "mary-ogu",
        name: "Mary Ogu",
        email: "mary.ogu@synkup.edu",
        role: "Audience Admin",
        status: "ACTIVE",
        lastActivity: "12 mins ago",
        unitScope: "Legacy Campus",
        isPrimary: false,
      },
      {
        id: "ifeoma-akaonye",
        name: "Mrs. Akaonye Ifeoma",
        email: "ifeoma@synkup.edu",
        role: "Read-Only Admin",
        status: "ACTIVE",
        lastActivity: "1 hour ago",
        unitScope: "Legacy Campus",
        isPrimary: false,
      },
    ],
    members: 2405,
    pending: 1142,
    invalidatedMemberships: 5,
    status: "ACTIVE",
    healthSignals: { pendingInvitationThreshold: 500, staleActivity: false, deliveryFailures: 3, syncFailures: 0, blockedAttendance: false, unresolvedCriticalIssues: 0, insufficientData: false },
    transferEvents: [
      {
        id: "transfer-005",
        userName: "Ada Okafor",
        fromUnit: "Legacy Campus",
        toUnit: "Heritage Campus",
        transferredAt: "July 20, 2026",
        actor: "Mrs. Akaonye Ifeoma",
        invalidatedMemberships: ["CFI Service"],
        reassignedMemberships: ["Constitutional Law Seminar"],
      },
      {
        id: "transfer-006",
        userName: "Chigozie Hauwa",
        fromUnit: "Legacy Campus",
        toUnit: "Heritage Campus",
        transferredAt: "July 17, 2026",
        actor: "Mary Ogu",
        invalidatedMemberships: ["CFI Service"],
        reassignedMemberships: ["Introduction to Anatomy"],
      },
    ],
  },
];

function calculateAudienceHealth(audience: Audience): AudienceHealth {
  if (audience.status === "ARCHIVED" || audience.status === "INACTIVE") {
    return { state: "neutral", reasons: [`Audience is ${audience.status.toLowerCase()}.`] };
  }
  if (audience.status === "DRAFT") {
    return {
      state: "neutral",
      reasons: [
        "Audience is still a draft.",
        ...(audience.admins.length === 0
          ? ["Administrator assignment is pending before activation."]
          : []),
      ],
    };
  }
  if (audience.healthSignals.insufficientData || audience.members === null) {
    return { state: "neutral", reasons: ["There is insufficient operational data."] };
  }

  const criticalReasons = [
    ...(audience.admins.length === 0 ? ["No administrator is assigned."] : []),
    ...(audience.healthSignals.syncFailures > 0
      ? [`${audience.healthSignals.syncFailures} synchronization failure(s) detected.`]
      : []),
    ...(audience.healthSignals.blockedAttendance ? ["Attendance processing is blocked."] : []),
    ...(audience.healthSignals.unresolvedCriticalIssues > 0
      ? [`${audience.healthSignals.unresolvedCriticalIssues} critical issue(s) remain unresolved.`]
      : []),
  ];
  if (criticalReasons.length) return { state: "critical", reasons: criticalReasons };

  const warningReasons = [
    ...((audience.pending ?? 0) >= audience.healthSignals.pendingInvitationThreshold
      ? [`${audience.pending ?? 0} pending invitations meet or exceed the configured threshold of ${audience.healthSignals.pendingInvitationThreshold}.`]
      : []),
    ...(audience.healthSignals.staleActivity ? ["Audience activity is stale."] : []),
    ...(audience.healthSignals.deliveryFailures > 0
      ? [`${audience.healthSignals.deliveryFailures} invitation delivery failure(s) detected.`]
      : []),
  ];
  if (warningReasons.length) return { state: "warning", reasons: warningReasons };
  if ((audience.members ?? 0) === 0) {
    return { state: "neutral", reasons: ["No member activity is available yet."] };
  }
  return {
    state: "healthy",
    reasons: [
      "Audience is active with administrator coverage and members present.",
      "No synchronization, attendance, invitation, or critical issues were detected.",
    ],
  };
}

function StatusPill({ status }: { status: AudienceStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold",
        status === "ACTIVE"
          ? "bg-[#dff6e8] text-[#16a34a]"
          : status === "DRAFT"
            ? "bg-amber-100 text-amber-700"
            : "bg-[#e5e7eb] text-[#6b7280]",
      )}
    >
      {status}
    </span>
  );
}

function HealthDot({ health }: { health: Health }) {
  const color = {
    healthy: "bg-green-600",
    warning: "bg-yellow-400",
    critical: "bg-red-600",
    neutral: "bg-slate-400",
  }[health];
  return (
    <span
      aria-label={`${health} health`}
      className={cn(
        "inline-flex h-7 w-12 items-center justify-center rounded-full bg-[#ecfbf5]",
        color === "bg-red-600" && "bg-red-50",
      )}
    >
      <span className={cn("h-3 w-3 rounded-full", color)} />
    </span>
  );
}

function MetricCard({
  label,
  value,
  tone,
  darkMode,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warning" | "muted";
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-[18px] border px-4 py-4 shadow-none",
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white",
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-slate-500">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-xl font-bold text-primary",
          tone === "danger" && "text-red-600",
          tone === "warning" && "text-amber-600",
          tone === "muted" && "text-slate-500",
        )}
      >
        {value}
      </div>
    </Card>
  );
}

function EmptyAudience({ darkMode }: { darkMode: boolean }) {
  return (
    <Card
      className={cn(
        "mt-6 flex min-h-[430px] flex-col items-center justify-center rounded-[22px] border p-8 text-center",
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 ring-8 ring-teal-50/60">
        <Factory className="h-12 w-12 text-primary" />
      </div>
      <h2 className="mt-8 text-3xl font-semibold tracking-tight text-primary">
        No Audience Available
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
        Audiences are created and managed within individual units.
        <br />
        Once a <span className="font-bold text-primary">Unit Admin</span>{" "}
        creates an audience, it will automatically appear here.
      </p>
      <div className="mt-7 flex items-center gap-3 text-sm">
        <AlertCircle className="h-5 w-5" />
        <span>Need help structuring your organization?</span>
        <button className="font-bold text-primary underline">
          View Setup guide
        </button>
      </div>
    </Card>
  );
}

function AudienceDrawer({
  audience,
  darkMode,
  onClose,
}: {
  audience: Audience;
  darkMode: boolean;
  onClose: () => void;
}) {
  const [membershipTab, setMembershipTab] = useState<MembershipTab>("active");
  const audienceHealth = calculateAudienceHealth(audience);
  const transferEvents = audience.transferEvents;
  const transferInvalidationCount = audience.invalidatedMemberships;
  const activeMembers = [
    {
      id: "ENG/MEE/230011",
      name: "Samuel Adegboyega",
      joinedAt: "July 19, 2026",
      lastActivity: "2 hours ago",
    },
    {
      id: "ENG/CSC/230104",
      name: "Iwinosa Elizabeth",
      joinedAt: "July 18, 2026",
      lastActivity: "Yesterday",
    },
    {
      id: "ENG/EEE/230042",
      name: "Chigozie Hauwa",
      joinedAt: "July 16, 2026",
      lastActivity: "2 days ago",
    },
  ];
  const pendingInvitations = [
    {
      id: "invite-001",
      recipient: "ada.okafor@synkup.edu",
      identifier: "SCI/BCH/240031",
      invitedAt: "July 20, 2026",
      deliveryState: "DELIVERED",
      expiresAt: "July 27, 2026",
    },
    {
      id: "invite-002",
      recipient: "LAW/240118",
      identifier: "User ID invitation",
      invitedAt: "July 18, 2026",
      deliveryState: "BOUNCED",
      expiresAt: "July 25, 2026",
    },
  ];
  const inactiveMembers = [
    {
      id: "ENG/MEE/220019",
      name: "David Eromosele",
      inactiveAt: "July 12, 2026",
      reason: "Account deactivated",
      lastActivity: "July 10, 2026",
    },
    {
      id: "SCI/MCB/220077",
      name: "Esther Bello",
      inactiveAt: "June 30, 2026",
      reason: "Removed from parent unit",
      lastActivity: "June 28, 2026",
    },
  ];
  return (
    <div className="fixed inset-0 z-50 bg-black/45" onMouseDown={onClose}>
      <aside
        className={cn(
          "scrollbar-subtle ml-auto h-full w-full max-w-[680px] overflow-y-auto border-l p-6 shadow-2xl",
          darkMode
            ? "border-slate-700 bg-slate-900 text-white"
            : "border-teal-200 bg-[#ecfaef] text-slate-950",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{audience.name}</h2>
            <div className="mt-3 flex items-center gap-3">
              <StatusPill status={audience.status} />
              <span className="text-sm font-semibold text-slate-500">
                {audience.unit.toUpperCase()}
              </span>
            </div>
            <div className="mt-3 text-sm italic text-slate-500">
              {audience.identifier}
            </div>
          </div>
          <button
            aria-label="Close audience details"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <section
          className={cn(
            "mt-6 rounded-2xl border p-4",
            audienceHealth.state === "healthy" && "border-green-200 bg-green-50/70",
            audienceHealth.state === "warning" && "border-amber-300 bg-amber-50/70",
            audienceHealth.state === "critical" && "border-red-300 bg-red-50/70",
            audienceHealth.state === "neutral" &&
              (darkMode ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-100"),
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold">AUDIENCE HEALTH</h3>
            <div className="flex items-center gap-2 text-xs font-bold uppercase">
              <HealthDot health={audienceHealth.state} />
              {audienceHealth.state}
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {audienceHealth.reasons.map((reason) => (
              <li key={reason} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-8">
          <div className="flex justify-between text-sm font-bold">
            <h3>AUDIENCE ADMIN(S)</h3>
            <span>
              {audience.admins.length} {audience.admins.length === 1 ? "Administrator" : "Administrators"}
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {audience.admins.length ? (
              audience.admins.map((admin) => (
                <Card
                  key={admin.id}
                  className={cn(
                    "rounded-2xl border p-4",
                    darkMode
                      ? "border-slate-700 bg-slate-800"
                      : "border-teal-200 bg-white/50",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <AvatarSeed seed={admin.name} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-bold">{admin.name}</div>
                          {admin.isPrimary ? (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                              PRIMARY
                            </span>
                          ) : null}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {admin.email}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[9px] font-bold",
                        admin.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : admin.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-600",
                      )}
                    >
                      {admin.status}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">Access level</dt>
                      <dd className="mt-1 font-semibold">{admin.role}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Unit scope</dt>
                      <dd className="mt-1 font-semibold">{admin.unitScope}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Last activity</dt>
                      <dd className="mt-1 font-semibold">{admin.lastActivity}</dd>
                    </div>
                  </dl>
                </Card>
              ))
            ) : (
              <Card
                className={cn(
                  "rounded-2xl border p-4",
                  darkMode
                    ? "border-slate-700 bg-slate-800"
                    : "border-teal-200 bg-white/50",
                )}
              >
                <div className="font-bold">Draft awaiting administrator assignment</div>
                <div className="mt-1 text-xs text-slate-500">
                  This audience cannot be activated until a Unit Admin assigns at
                  least one Audience Admin.
                </div>
              </Card>
            )}
          </div>
          <Link
            href={`/dashboard/units/${audience.unitId}`}
            className="mt-4 inline-flex text-xs font-bold text-primary hover:underline"
          >
            VIEW ALL ADMINISTRATORS
          </Link>
        </section>
        <section className="mt-7">
          <h3 className="text-sm font-bold">AUDIENCE METADATA</h3>
          <Card
            className={cn(
              "mt-3 grid grid-cols-2 gap-6 rounded-2xl border p-5",
              darkMode
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white",
            )}
          >
            <div>
              <div className="text-sm text-slate-500">Created By:</div>
              <b className="mt-2 block">SYSTEM ADMIN</b>
            </div>
            <div>
              <div className="text-sm text-slate-500">Date Created:</div>
              <b className="mt-2 block">March 21, 2026</b>
            </div>
            <div>
              <div className="text-sm text-slate-500">Last Modified:</div>
              <b className="mt-2 block">July 21, 2026</b>
            </div>
            <div>
              <div className="text-sm text-slate-500">Members</div>
              <b className="mt-2 block">{audience.members ?? 0}</b>
              {transferInvalidationCount > 0 ? (
                <div className="mt-2 text-xs text-slate-500">
                  Count excludes {transferInvalidationCount} membership
                  {transferInvalidationCount === 1 ? "" : "s"} invalidated after unit transfer.
                </div>
              ) : null}
            </div>
          </Card>
        </section>
        <section className="mt-7">
          <h3 className="text-sm font-bold">AUDIENCE STATISTICS</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["ACTIVE MEMBERS", audience.members ?? 0],
              ["PENDING INVITES", audience.pending ?? 0],
              ["INVALIDATED AFTER TRANSFER", transferInvalidationCount],
              ["SESSIONS HELD", 17],
            ].map(([label, value]) => (
              <Card
                key={label}
                className={cn(
                  "rounded-2xl border p-4",
                  darkMode
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-200 bg-white",
                )}
              >
                <div className="text-xs font-semibold text-slate-500">
                  {label}
                </div>
                <div className="mt-2 text-2xl font-bold">{value}</div>
              </Card>
            ))}
          </div>
          {transferInvalidationCount > 0 ? (
            <Card
              className={cn(
                "mt-3 rounded-2xl border px-4 py-4 text-sm",
                darkMode
                  ? "border-amber-700/40 bg-amber-950/20 text-amber-100"
                  : "border-amber-200 bg-amber-50 text-amber-900",
              )}
            >
              User transfers update the source unit assignment, invalidate old audience memberships, and keep only memberships that match the user&apos;s current unit.
            </Card>
          ) : null}
        </section>
        <section className="mt-7">
          <h3 className="text-sm font-bold">AUDIENCE MEMBERS</h3>
          <div
            className={cn(
              "mt-3 grid grid-cols-3 rounded-xl border p-1",
              darkMode ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-white/50",
            )}
          >
            {(
              [
                ["active", "Active", audience.members ?? 0],
                ["pending", "Pending", audience.pending ?? 0],
                ["inactive", "Invalidated", transferInvalidationCount],
              ] as const
            ).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMembershipTab(value)}
                className={cn(
                  "rounded-lg px-2 py-2 text-xs font-bold transition-colors",
                  membershipTab === value
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-black/5",
                )}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          <div className="mt-3 flex rounded-xl border border-slate-400 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="ml-2 w-full bg-transparent text-sm outline-none"
              placeholder={
                membershipTab === "pending"
                  ? "Search invitations..."
                  : "Search members..."
              }
            />
          </div>
          <div className="mt-3 space-y-3">
            {membershipTab === "active"
              ? activeMembers.map((member) => (
                  <Card
                    key={member.id}
                    className={cn(
                      "rounded-xl border p-3",
                      darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white/60",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <AvatarSeed seed={member.name} />
                      <div className="min-w-0 flex-1">
                        <b className="text-sm">{member.name}</b>
                        <div className="text-xs text-slate-500">{member.id}</div>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-bold text-green-700">
                        ACTIVE
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <dt className="text-slate-500">Joined</dt>
                        <dd className="mt-1 font-semibold">{member.joinedAt}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Last activity</dt>
                        <dd className="mt-1 font-semibold">{member.lastActivity}</dd>
                      </div>
                    </dl>
                    <Link
                      href={`/dashboard/units/${audience.unitId}`}
                      className="mt-3 inline-flex text-xs font-bold text-primary"
                    >
                      VIEW MEMBER IN UNIT ADMIN PORTAL
                    </Link>
                  </Card>
                ))
              : membershipTab === "pending"
                ? pendingInvitations.map((invitation) => (
                    <Card
                      key={invitation.id}
                      className={cn(
                        "rounded-xl border p-3",
                        darkMode ? "border-slate-700 bg-slate-800" : "border-amber-200 bg-amber-50/70",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <b className="text-sm">{invitation.recipient}</b>
                          <div className="text-xs text-slate-500">{invitation.identifier}</div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-[9px] font-bold",
                            invitation.deliveryState === "DELIVERED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {invitation.deliveryState}
                        </span>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <dt className="text-slate-500">Invitation sent</dt>
                          <dd className="mt-1 font-semibold">{invitation.invitedAt}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500">Expires</dt>
                          <dd className="mt-1 font-semibold">{invitation.expiresAt}</dd>
                        </div>
                      </dl>
                      <Link
                        href={`/dashboard/units/${audience.unitId}`}
                        className="mt-3 inline-flex text-xs font-bold text-primary"
                      >
                        RESEND OR CANCEL IN UNIT ADMIN PORTAL
                      </Link>
                    </Card>
                  ))
                : transferEvents.length > 0
                  ? transferEvents.map((event) => (
                      <Card
                        key={event.id}
                        className={cn(
                          "rounded-xl border p-3",
                          darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white/60",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <AvatarSeed seed={event.userName} />
                          <div className="min-w-0 flex-1">
                            <b className="text-sm">{event.userName}</b>
                            <div className="text-xs text-slate-500">
                              {event.fromUnit} to {event.toUnit}
                            </div>
                          </div>
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700">
                            TRANSFERRED
                          </span>
                        </div>
                        <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                          <div>
                            <dt className="text-slate-500">Transferred</dt>
                            <dd className="mt-1 font-semibold">{event.transferredAt}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Logged by</dt>
                            <dd className="mt-1 font-semibold">{event.actor}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Invalidated memberships</dt>
                            <dd className="mt-1 font-semibold">
                              {event.invalidatedMemberships.join(", ")}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Reassigned memberships</dt>
                            <dd className="mt-1 font-semibold">
                              {event.reassignedMemberships.join(", ")}
                            </dd>
                          </div>
                        </dl>
                        <Link
                          href={`/dashboard/units/${audience.unitId}`}
                          className="mt-3 inline-flex text-xs font-bold text-primary"
                        >
                          VIEW TRANSFER IN UNIT ADMIN PORTAL
                        </Link>
                      </Card>
                    ))
                  : inactiveMembers.map((member) => (
                      <Card
                        key={member.id}
                        className={cn(
                          "rounded-xl border p-3",
                          darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white/60",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <AvatarSeed seed={member.name} />
                          <div className="min-w-0 flex-1">
                            <b className="text-sm">{member.name}</b>
                            <div className="text-xs text-slate-500">{member.id}</div>
                          </div>
                          <span className="rounded-full bg-slate-200 px-2 py-1 text-[9px] font-bold text-slate-600">
                            INACTIVE
                          </span>
                        </div>
                        <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                          <div>
                            <dt className="text-slate-500">Inactive since</dt>
                            <dd className="mt-1 font-semibold">{member.inactiveAt}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Reason</dt>
                            <dd className="mt-1 font-semibold">{member.reason}</dd>
                          </div>
                          <div>
                            <dt className="text-slate-500">Last activity</dt>
                            <dd className="mt-1 font-semibold">{member.lastActivity}</dd>
                          </div>
                        </dl>
                        <Link
                          href={`/dashboard/units/${audience.unitId}`}
                          className="mt-3 inline-flex text-xs font-bold text-primary"
                        >
                          VIEW MEMBERSHIP AUDIT IN UNIT ADMIN PORTAL
                        </Link>
                      </Card>
                    ))}
          </div>
          <Link
            href={`/dashboard/units/${audience.unitId}`}
            className="mt-4 inline-flex text-xs font-bold text-primary hover:underline"
          >
            VIEW ALL {membershipTab === "active" ? "ACTIVE MEMBERS" : membershipTab === "pending" ? "PENDING INVITATIONS" : "INVALIDATED MEMBERSHIPS"}
          </Link>
        </section>
        <section className="mt-7">
          <h3 className="text-sm font-bold">RECENT ACTIVITY</h3>
          <div className="mt-3 space-y-3">
            {transferEvents.length > 0 ? (
              transferEvents.map((event) => (
                <Card
                  key={event.id}
                  className={cn(
                    "rounded-2xl border p-4",
                    darkMode
                      ? "border-slate-700 bg-slate-800"
                      : "border-teal-200 bg-white/40",
                  )}
                >
                  <b>
                    {event.userName} transferred from {event.fromUnit} to {event.toUnit}
                  </b>
                  <div className="mt-1 text-xs text-slate-500">
                    {event.transferredAt} by {event.actor}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Invalidated memberships: {event.invalidatedMemberships.join(", ")}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Reassigned memberships: {event.reassignedMemberships.join(", ")}
                  </div>
                </Card>
              ))
            ) : (
              <Card
                className={cn(
                  "rounded-2xl border p-4",
                  darkMode
                    ? "border-slate-700 bg-slate-800"
                    : "border-teal-200 bg-white/40",
                )}
              >
                <b>Admin added 7 new users</b>
                <div className="mt-1 text-xs text-slate-500">2 days ago</div>
              </Card>
            )}
          </div>
          <Link
            href={`/dashboard/units/${audience.unitId}`}
            className="mt-4 inline-flex text-xs font-bold text-primary hover:underline"
          >
            VIEW ALL ACTIVITY
          </Link>
        </section>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <button className="rounded-xl border border-slate-500 py-3 text-sm font-bold">
            VIEW UNIT
          </button>
          <button className="rounded-xl border border-slate-500 py-3 text-sm font-bold">
            VIEW AUDIT LOG
          </button>
        </div>
      </aside>
    </div>
  );
}

export function AudienceWorkspace({ darkMode }: { darkMode: boolean }) {
  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [health, setHealth] = useState("all");
  const [selected, setSelected] = useState<Audience | null>(null);
  const filtered = useMemo(
    () =>
      AUDIENCES.filter(
        (item) =>
          `${item.name} ${item.unit} ${item.admins.map((admin) => `${admin.name} ${admin.email} ${admin.role}`).join(" ")} ${item.type} ${item.identifier}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (unit === "all" || item.unit === unit) &&
          (type === "all" || item.type === type) &&
          (status === "all" || item.status === status) &&
          (health === "all" || calculateAudienceHealth(item).state === health),
      ),
    [query, unit, type, status, health],
  );
  const adminCoverageAlerts = AUDIENCES.filter(
    (audience) =>
      audience.status !== "DRAFT" && audience.admins.length === 0,
  ).length;
  const metrics = [
    { label: "Total Audiences", value: AUDIENCES.length },
    {
      label: "Active Audiences",
      value: AUDIENCES.filter((a) => a.status === "ACTIVE").length,
    },
    {
      label: "Admin Coverage Alerts",
      value: adminCoverageAlerts,
      tone: adminCoverageAlerts > 0 ? ("danger" as const) : ("muted" as const),
    },
    {
      label: "Drafts Awaiting Admin",
      value: AUDIENCES.filter(
        (a) => a.status === "DRAFT" && a.admins.length === 0,
      ).length,
      tone: "warning" as const,
    },
    {
      label: "No Members",
      value: AUDIENCES.filter((a) => !a.members).length,
      tone: "danger" as const,
    },
    {
      label: "Pending Invites",
      value: AUDIENCES.reduce((sum, a) => sum + (a.pending ?? 0), 0),
    },
  ];
  const options = (values: string[], all: string) => [
    { label: all, value: "all" },
    ...values.map((value) => ({ label: value, value })),
  ];
  return (
    <section className="pb-10">
      <UnitsPageHeader
        darkMode={darkMode}
        title="Audience Oversight"
        description="Organisation-wide view of all audience across units"
        // backHref="/dashboard"
        // backLabel="Back to Dashboard"
        breadcrumb={[
          { label: "Dashboard" },
          { label: "Audience", active: true },
        ]}
      />
      <div
        className={cn(
          "mt-2 flex items-start gap-4 rounded-2xl border-l-4 border-green-600 px-5 py-4 text-sm",
          darkMode ? "bg-slate-900" : "bg-[#eef1f3]",
        )}
      >
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <p>
          Audience Management is locked for each unit. This is a{" "}
          <b>READ-ONLY</b> view; all edits and creation happen in the Unit Admin
          Portal.
        </p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} darkMode={darkMode} />
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setView("table")}
          className={cn(
            "flex min-h-11 items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold",
            view === "table"
              ? "border-primary text-primary"
              : darkMode
                ? "border-transparent text-slate-400"
                : "border-transparent text-slate-500",
          )}
        >
          <List className="h-4 w-4" />
          Table
        </button>
        <button
          onClick={() => setView("grid")}
          className={cn(
            "flex min-h-11 items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold",
            view === "grid"
              ? "border-primary text-primary"
              : darkMode
                ? "border-transparent text-slate-400"
                : "border-transparent text-slate-500",
          )}
        >
          <Grid2X2 className="h-4 w-4" />
          Grid
        </button>
      </div>
      <Card
        className={cn(
          "mt-1",
          darkMode
            ? "text-white"
            : "text-slate-900",
        )}
      >
        <TableFilterBar
          darkMode={darkMode}
          searchPlaceholder="Search by audience name, unit, admin, type, or identifier"
          searchValue={query}
          onSearchChange={setQuery}
          selects={[
            {
              label: "Unit",
              value: unit,
              onChange: setUnit,
              options: options(
                ["Legacy Campus", "Heritage Campus"],
                "All Units",
              ),
            },
            {
              label: "Type",
              value: type,
              onChange: setType,
              options: options(
                ["Lecture", "Laboratory", "Seminar", "Service"],
                "All Types",
              ),
            },
            {
              label: "Status",
              value: status,
              onChange: setStatus,
              options: options(
                ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"],
                "All Status",
              ),
            },
            {
              label: "Health",
              value: health,
              onChange: setHealth,
              options: options(
                ["healthy", "warning", "critical", "neutral"],
                "All Health",
              ),
            },
          ]}
          segments={[]}
          activeSegment="all"
          onSegmentChange={() => undefined}
        />
        {filtered.length === 0 ? (
          <EmptyAudience darkMode={darkMode} />
        ) : view === "table" ? (
          <DashboardDataTable
            darkMode={darkMode}
            headers={["Audience Name", "Parent Unit", "Assigned Admin", "Audience Members", "Pending", "Status", "Health", "Actions"]}
          >
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className={cn(
                      "border-t",
                      darkMode ? "border-slate-800" : "border-slate-200",
                    )}
                  >
                    <td className="px-4 py-5 font-semibold">{a.name}</td>
                    <td className="px-4 py-5 text-slate-500">{a.unit}</td>
                    <td className="px-4 py-5">
                      {a.admins.length ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {a.admins.slice(0, 3).map((admin) => (
                              <div
                                key={admin.id}
                                className={cn(
                                  "rounded-full ring-2",
                                  darkMode ? "ring-slate-900" : "ring-white",
                                )}
                              >
                                <AvatarSeed seed={admin.name} />
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {a.admins.find((admin) => admin.isPrimary)?.name ??
                                a.admins[0].name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {a.admins.length} assigned
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-600">
                          Draft · Assignment pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5 text-slate-500">
                      {a.members ?? "-"}
                    </td>
                    <td className="px-4 py-5 text-slate-500">
                      {a.pending ?? "-"}
                    </td>
                    <td className="px-4 py-5">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="px-4 py-5">
                      <HealthDot health={calculateAudienceHealth(a).state} />
                    </td>
                    <td className="px-4 py-5">
                      <button
                        onClick={() => setSelected(a)}
                        aria-label={`View ${a.name}`}
                        title={`View ${a.name}`}
                        className="inline-flex rounded-lg p-2 text-primary transition hover:bg-[#e7f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
          </DashboardDataTable>
        ) : (
          <div className="grid gap-5 p-5 lg:grid-cols-2">
            {filtered.map((a) => (
              <Card
                key={a.id}
                className={cn(
                  "rounded-[22px] border p-5",
                  calculateAudienceHealth(a).state === "warning"
                    ? "border-yellow-400 bg-yellow-50"
                    : calculateAudienceHealth(a).state === "critical"
                      ? "border-red-400 bg-red-50"
                      : darkMode
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-white",
                )}
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => setSelected(a)}
                    className="text-left text-lg font-bold hover:text-primary"
                  >
                    {a.name}
                  </button>
                  <StatusPill status={a.status} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Building2 className="h-3.5 w-3.5" />
                  {a.unit.toUpperCase()}
                </div>
                <div className="mt-7 grid grid-cols-2 text-center">
                  <div>
                    <b className="text-2xl">{a.members ?? "-"}</b>
                    <div className="mt-1 text-xs text-slate-500">
                      AUDIENCE MEMBERS
                    </div>
                  </div>
                  <div>
                    <b className="text-2xl">{a.pending ?? "-"}</b>
                    <div className="mt-1 text-xs text-slate-500">PENDING</div>
                  </div>
                </div>
                <div className="mt-7 flex items-center gap-3">
                  {a.admins.length ? (
                    <>
                      <div className="flex -space-x-2">
                        {a.admins.slice(0, 3).map((admin) => (
                          <div
                            key={admin.id}
                            className={cn(
                              "rounded-full ring-2",
                              darkMode ? "ring-slate-800" : "ring-white",
                            )}
                          >
                            <AvatarSeed seed={admin.name} />
                          </div>
                        ))}
                      </div>
                      <div>
                        <b>{a.admins.length} assigned</b>
                        <div className="text-xs text-slate-500">
                          {a.admins.find((admin) => admin.isPrimary)?.name ??
                            a.admins[0].name}{" "}
                          · Primary
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <b>Draft awaiting admin</b>
                      <div className="text-xs text-amber-600">
                        Required before activation
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
        <PaginationControl
          darkMode={darkMode}
          summary={`Showing ${filtered.length} of ${AUDIENCES.length} audiences`}
          items={[1]}
          activePage={1}
        />
      </Card>
      {selected ? (
        <AudienceDrawer
          audience={selected}
          darkMode={darkMode}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </section>
  );
}
