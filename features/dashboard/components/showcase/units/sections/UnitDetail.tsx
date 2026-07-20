"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BellRing,
  Building2,
  CalendarDays,
  ClipboardList,
  Eye,
  FileSpreadsheet,
  Monitor,
  MoreVertical,
  Pencil,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import { LIFECYCLE_STATES } from "../data";
import {
  ArchiveUnitModal,
  AssignAdminModal,
  EditUnitModal,
  MoveUsersModal,
} from "../modals";
import {
  DetailMetricCard,
  StatusStateChip,
  UnitDetailSkeleton,
  UnitStatusPill,
} from "../shared";
import type {
  AssignedUnitAdmin,
  AudienceSummary,
  FilterOption,
  FilterSegment,
  UnitSummary,
} from "../types";
import { InlineStateCard } from "./InlineStateCard";
import {
  ArchiveReadinessPanel,
  AssignedAdminsSection,
  AudiencesSection,
  type ArchiveDependencyItem,
  UnitAlertsDrawer,
} from "./UnitDetailPanels";

type UnitDetailAction = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  tone?: "danger";
};

export function UnitDetail({
  darkMode,
  unit,
  audiences,
  assignedAdmins,
  availableUnits = [],
  isUnitRole,
  loading = false,
  assignedAdminsLoading = false,
  assignedAdminsError = "",
  detailError = "",
  existingUnitNames = [],
  unitTypeOptions,
  countryOptions,
  adminOptions,
  adminOptionsNote,
  onUnitUpdated,
  onAssignedAdminChange,
  onArchived,
}: {
  darkMode: boolean;
  unit: UnitSummary;
  audiences: AudienceSummary[];
  assignedAdmins: AssignedUnitAdmin[];
  availableUnits?: UnitSummary[];
  isUnitRole: boolean;
  loading?: boolean;
  assignedAdminsLoading?: boolean;
  assignedAdminsError?: string;
  detailError?: string;
  existingUnitNames?: string[];
  unitTypeOptions?: Array<{ label: string; value: string }>;
  countryOptions?: Array<{ label: string; value: string }>;
  adminOptions?: Array<{ id: number; name: string; email: string }>;
  adminOptionsNote?: string;
  onUnitUpdated?: () => Promise<void> | void;
  onAssignedAdminChange?: () => Promise<void> | void;
  onArchived?: () => Promise<void> | void;
}) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [assignAdminOpen, setAssignAdminOpen] = useState(false);
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [moveUsersOpen, setMoveUsersOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const actionItems: UnitDetailAction[] = [
    ...(isUnitRole
      ? []
      : [
          {
            label: "Edit Unit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => setEditUnitOpen(true),
          },
          {
            label: "Archive Unit",
            icon: <Trash2 className="h-4 w-4" />,
            tone: "danger" as const,
            onClick: () => setArchiveOpen(true),
          },
          {
            label: "Assign / Reassign Unit Admin",
            icon: <UserCog className="h-4 w-4" />,
            onClick: () => setAssignAdminOpen(true),
          },
        ]),
    { label: "View Unit Audit", icon: <ClipboardList className="h-4 w-4" /> },
    { label: "View Users in Unit", icon: <Users className="h-4 w-4" /> },
    { label: "View Audiences", icon: <Eye className="h-4 w-4" /> },
    {
      label: "Generate Unit Report",
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
  ];

  const archiveDependencies = useMemo<ArchiveDependencyItem[]>(
    () =>
      (
        [
          {
            key: "users",
            label: "Users blocking archive",
            count: unit.affectedUsers,
            countLabel: unit.totalUsers,
            description:
              "Move or deactivate users in this unit before archiving.",
            ctaLabel: "Move users",
            targetId: "unit-users-blocker",
          },
          {
            key: "audiences",
            label: "Audiences blocking archive",
            count: unit.affectedAudiences,
            countLabel: unit.audiences,
            description:
              "Archive audiences in this unit before archiving the unit itself.",
            ctaLabel: "Archive audiences",
            targetId: "unit-audiences-section",
          },
          {
            key: "sessions",
            label: "Active sessions blocking archive",
            count: unit.activeSessionsCount,
            countLabel: unit.sessions,
            description:
              "Close active sessions before retrying the unit archive request.",
            ctaLabel: "Close active sessions",
            targetId: "unit-sessions-blocker",
          },
        ] satisfies ArchiveDependencyItem[]
      ).filter((item) => item.count > 0),
    [
      unit.activeSessionsCount,
      unit.affectedAudiences,
      unit.affectedUsers,
      unit.audiences,
      unit.sessions,
      unit.totalUsers,
    ],
  );

  const archiveBlocked =
    unit.lifecycleStatus !== "ARCHIVED" && archiveDependencies.length > 0;

  const alertBreakdown = useMemo(
    () => ({
      critical: unit.alerts.filter((alert) => alert.state === "critical")
        .length,
      warning: unit.alerts.filter((alert) => alert.state === "warning").length,
      healthy: unit.alerts.filter((alert) => alert.state === "healthy").length,
    }),
    [unit.alerts],
  );

  const [adminSearch, setAdminSearch] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("all");
  const [adminSegment, setAdminSegment] = useState("all");
  const [audienceSearch, setAudienceSearch] = useState("");
  const [audienceAdminFilter, setAudienceAdminFilter] = useState("all");
  const [audienceSegment, setAudienceSegment] = useState("all");

  const filteredAssignedAdmins = useMemo(() => {
    return assignedAdmins.filter((admin) => {
      const normalizedQuery = adminSearch.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        admin.name.toLowerCase().includes(normalizedQuery) ||
        admin.email.toLowerCase().includes(normalizedQuery);

      const matchesRole =
        adminRoleFilter === "all" || admin.role === adminRoleFilter;
      const matchesStatus =
        adminSegment === "all" || admin.status.toLowerCase() === adminSegment;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [adminRoleFilter, adminSearch, adminSegment, assignedAdmins]);

  const adminSegments: FilterSegment[] = [
    { label: "All", value: "all", count: assignedAdmins.length },
    {
      label: "Active",
      value: "active",
      count: assignedAdmins.filter((admin) => admin.status === "Active").length,
    },
    {
      label: "Pending",
      value: "pending",
      count: assignedAdmins.filter((admin) => admin.status === "Pending")
        .length,
    },
    {
      label: "Inactive",
      value: "inactive",
      count: assignedAdmins.filter((admin) => admin.status === "Inactive")
        .length,
    },
  ];

  const audienceAdminOptions: FilterOption[] = [
    { label: "All admins", value: "all" },
    ...Array.from(new Set(audiences.map((audience) => audience.admin))).map(
      (admin) => ({
        label: admin,
        value: admin,
      }),
    ),
  ];

  const filteredAudiences = useMemo(() => {
    return audiences.filter((audience) => {
      const normalizedQuery = audienceSearch.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        audience.name.toLowerCase().includes(normalizedQuery) ||
        audience.admin.toLowerCase().includes(normalizedQuery);

      const matchesAdmin =
        audienceAdminFilter === "all" || audience.admin === audienceAdminFilter;
      const matchesStatus =
        audienceSegment === "all" ||
        audience.status.toLowerCase() === audienceSegment;

      return matchesQuery && matchesAdmin && matchesStatus;
    });
  }, [audienceAdminFilter, audienceSearch, audienceSegment, audiences]);

  const audienceSegments: FilterSegment[] = [
    { label: "All", value: "all", count: audiences.length },
    {
      label: "Live",
      value: "live",
      count: audiences.filter((audience) => audience.status === "LIVE").length,
    },
    {
      label: "Review",
      value: "review",
      count: audiences.filter((audience) => audience.status === "REVIEW")
        .length,
    },
    {
      label: "Flagged",
      value: "flagged",
      count: audiences.filter((audience) => audience.status === "FLAGGED")
        .length,
    },
  ];

  if (loading) {
    return <UnitDetailSkeleton darkMode={darkMode} />;
  }

  return (
    <>
      <div>
        <Link
          href="/dashboard/units"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-semibold transition",
            darkMode
              ? "text-slate-300 hover:text-white"
              : "text-slate-500 hover:text-slate-900",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Units
        </Link>

        <div className="flex flex-row items-center justify-between pt-4">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <h2
              className={cn(
                "text-[2rem] font-semibold tracking-[-0.04em] normal-case",
                darkMode ? "text-white" : "text-black",
              )}
            >
              {unit.name}
            </h2>
            <UnitStatusPill status={unit.lifecycleStatus} />
          </div>

          <div className="flex items-center gap-2">
            {!isUnitRole ? (
              <Button
                variant="outline"
                className="min-h-11 rounded-xl px-5 py-3 text-sm"
                onClick={() => setEditUnitOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit Unit
              </Button>
            ) : null}

            <div className="relative">
              <button
                type="button"
                onClick={() => setActionMenuOpen((current) => !current)}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl border",
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-slate-200"
                    : "border-slate-200 bg-white text-slate-700",
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {actionMenuOpen ? (
                <div
                  className={cn(
                    "absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-65 rounded-2xl border p-2 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]",
                    darkMode
                      ? "border-slate-700 bg-slate-900"
                      : "border-slate-200 bg-white",
                  )}
                >
                  {actionItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setActionMenuOpen(false);
                        item.onClick?.();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                        item.tone === "danger"
                          ? "text-[#dc2626] hover:bg-[#fff1f1]"
                          : darkMode
                            ? "text-slate-200 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm",
            darkMode ? "text-slate-300" : "text-slate-600",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {unit.organization}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Created: {unit.createdAt}
          </span>
        </div>

        <div
          className={cn(
            "mt-2 text-sm",
            darkMode ? "text-slate-300" : "text-slate-600",
          )}
        >
          Admins: {unit.admins.slice(0, 2).join(", ")}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {LIFECYCLE_STATES.map((state) => (
            <StatusStateChip
              key={state}
              status={state}
              active={state === unit.lifecycleStatus}
              darkMode={darkMode}
            />
          ))}
        </div>

        {detailError ? (
          <InlineStateCard
            darkMode={darkMode}
            title="Using summary data"
            body={detailError}
          />
        ) : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_2fr]">
          <Card
            className="rounded-[22px] border-none p-6 text-black"
            style={{ backgroundColor: "#28b463" }}
          >
            <div className="flex items-start justify-between gap-4 text-white">
              <div className="text-[18px] font-medium tracking-[0.08em]">
                STATUS
              </div>
              <Monitor className="h-10 w-10" />
            </div>
            <div className="mt-16 text-[3rem] font-semibold leading-none text-white">
              {unit.statusLabel}
            </div>
            <div className="mt-3 text-3xl text-white">{unit.statusMessage}</div>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <DetailMetricCard
              darkMode={darkMode}
              title="Total Users"
              value={unit.totalUsers}
              icon={<Users className="h-9 w-9" />}
            />
            <DetailMetricCard
              darkMode={darkMode}
              title="Total Audiences"
              value={unit.audiences}
              icon={<Users className="h-9 w-9" />}
            />
            <DetailMetricCard
              darkMode={darkMode}
              title="Active Sessions"
              value={unit.sessions}
              icon={<Activity className="h-9 w-9 text-[#22c55e]" />}
            />
            <button
              type="button"
              onClick={() => setAlertsOpen(true)}
              className="text-left"
            >
              <DetailMetricCard
                darkMode={darkMode}
                title="Critical Alerts"
                value={String(unit.criticalAlertsCount)}
                icon={<BellRing className="h-9 w-9 text-[#ff2d2d]" />}
                titleClassName="text-[#ff2d2d]"
                valueClassName="text-[#ff2d2d]"
                interactive
                helperText="Open filtered unit alerts"
              />
            </button>
          </div>
        </div>

        <ArchiveReadinessPanel
          darkMode={darkMode}
          isUnitRole={isUnitRole}
          dependencies={archiveBlocked ? archiveDependencies : []}
          onMoveUsers={() => setMoveUsersOpen(true)}
          onReviewArchive={() => setArchiveOpen(true)}
          onNavigate={(dependency) =>
            dependency.key === "users"
              ? setMoveUsersOpen(true)
              : scrollToSection(dependency.targetId)
          }
        />

        <AssignedAdminsSection
          darkMode={darkMode}
          isUnitRole={isUnitRole}
          assignedAdmins={assignedAdmins}
          filteredAssignedAdmins={filteredAssignedAdmins}
          assignedAdminsLoading={assignedAdminsLoading}
          assignedAdminsError={assignedAdminsError}
          adminSearch={adminSearch}
          onAdminSearchChange={setAdminSearch}
          adminRoleFilter={adminRoleFilter}
          onAdminRoleFilterChange={setAdminRoleFilter}
          adminSegments={adminSegments}
          adminSegment={adminSegment}
          onAdminSegmentChange={setAdminSegment}
          onAssignAdmin={() => setAssignAdminOpen(true)}
        />

        <AudiencesSection
          darkMode={darkMode}
          audiences={audiences}
          filteredAudiences={filteredAudiences}
          audienceSearch={audienceSearch}
          onAudienceSearchChange={setAudienceSearch}
          audienceAdminFilter={audienceAdminFilter}
          onAudienceAdminFilterChange={setAudienceAdminFilter}
          audienceAdminOptions={audienceAdminOptions}
          audienceSegments={audienceSegments}
          audienceSegment={audienceSegment}
          onAudienceSegmentChange={setAudienceSegment}
        />
      </div>

      <UnitAlertsDrawer
        darkMode={darkMode}
        open={alertsOpen}
        unitName={unit.name}
        alerts={unit.alerts}
        alertBreakdown={alertBreakdown}
        onClose={() => setAlertsOpen(false)}
      />

      <ArchiveUnitModal
        darkMode={darkMode}
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        unit={unit}
        onArchived={onArchived}
      />
      <EditUnitModal
        key={`${unit.id}-${editUnitOpen ? "open" : "closed"}`}
        darkMode={darkMode}
        open={editUnitOpen}
        onClose={() => setEditUnitOpen(false)}
        unit={unit}
        existingUnitNames={existingUnitNames}
        unitTypeOptions={unitTypeOptions}
        countryOptions={countryOptions}
        adminOptions={adminOptions}
        adminOptionsNote={adminOptionsNote}
        onUpdated={onUnitUpdated}
      />
      <AssignAdminModal
        darkMode={darkMode}
        open={assignAdminOpen}
        onClose={() => setAssignAdminOpen(false)}
        unit={unit}
        assignedAdmins={assignedAdmins}
        adminOptions={adminOptions}
        adminOptionsNote={adminOptionsNote}
        onAssigned={onAssignedAdminChange}
      />
      <MoveUsersModal
        darkMode={darkMode}
        open={moveUsersOpen}
        onClose={() => setMoveUsersOpen(false)}
        unit={unit}
        availableUnits={availableUnits}
      />
    </>
  );
}
