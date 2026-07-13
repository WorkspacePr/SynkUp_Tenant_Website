"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
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
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import { LIFECYCLE_STATES, UNITS } from "./data";
import {
  ArchiveUnitModal,
  AssignAdminModal,
  EditUnitModal,
} from "./modals";
import {
  AdminStatusPill,
  AlertStatePill,
  AudienceStatusPill,
  AvatarSeed,
  DetailMetricCard,
  MetricGridInternal,
  PaginationControl,
  PlanUsageActions,
  RolePill,
  RowActionsMenu,
  StatBlock,
  StatusStateChip,
  SummaryBadge,
  TableFilterBar,
  UnitStatusPill,
  toTitleCase,
} from "./shared";
import type {
  AssignedUnitAdmin,
  AudienceSummary,
  FilterOption,
  FilterSegment,
  OverviewMetric,
  UnitSummary,
} from "./types";

type UnitDetailAction = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  tone?: "danger";
};

export function UnitsOverview({
  darkMode,
  onOpenCreateUnit,
  unitUsageText,
  planLimitReached,
  units = UNITS,
  loading = false,
  error = "",
  metrics,
}: {
  darkMode: boolean;
  onOpenCreateUnit: () => void;
  unitUsageText: string;
  planLimitReached: boolean;
  units?: UnitSummary[];
  loading?: boolean;
  error?: string;
  metrics?: OverviewMetric[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 py-4">
        <div>
          <h1
            className={cn(
              "text-4xl font-semibold tracking-[-0.04em]",
              darkMode ? "text-white" : "text-black",
            )}
          >
            Units
          </h1>
          <p
            className={cn(
              "mt-1 text-sm",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            Manage your organisation&apos;s units and audiences
          </p>
        </div>

        <PlanUsageActions
          darkMode={darkMode}
          unitUsageText={unitUsageText}
          planLimitReached={planLimitReached}
          onCreateUnit={onOpenCreateUnit}
        />
      </div>

      <MetricGridInternal darkMode={darkMode} metrics={metrics ?? []} />

      {error ? (
        <InlineStateCard darkMode={darkMode} title="Unable to load units" body={error} />
      ) : loading ? (
        <InlineStateCard
          darkMode={darkMode}
          title="Loading units"
          body="Fetching the latest tenant-scoped units."
        />
      ) : (
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {units.map((unit) => (
          <UnitCard key={unit.id} darkMode={darkMode} unit={unit} />
        ))}
      </div>
      )}

      <div className="mt-5 flex justify-center">
        <Link
          href="/dashboard/units?view=list"
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-xl border px-11 text-sm font-semibold",
            darkMode
              ? "border-[#27c2b5] text-[#8fe5dd]"
              : "border-[#16a394] text-[#16a394]",
          )}
        >
          View All Units
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function UnitsList({
  darkMode,
  onOpenCreateUnit,
  unitUsageText,
  planLimitReached,
  units = UNITS,
  loading = false,
  error = "",
  query = "",
  onQueryChange,
  ordering = "-created_at",
  onOrderingChange,
  activePage = 1,
  paginationItems = [1],
  totalUnits = UNITS.length,
  hasPreviousPage = false,
  hasNextPage = false,
  onPreviousPage,
  onNextPage,
  onPageChange,
  metrics,
}: {
  darkMode: boolean;
  onOpenCreateUnit: () => void;
  unitUsageText: string;
  planLimitReached: boolean;
  units?: UnitSummary[];
  loading?: boolean;
  error?: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  ordering?: string;
  onOrderingChange?: (value: string) => void;
  activePage?: number;
  paginationItems?: Array<number | "...">;
  totalUnits?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onPageChange?: (page: number) => void;
  metrics?: OverviewMetric[];
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [segment, setSegment] = useState("all");

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesStatus =
        statusFilter === "all" || unit.lifecycleStatus === statusFilter;
      const matchesSegment =
        segment === "all" ||
        (segment === "healthy" && unit.lifecycleStatus === "ACTIVE") ||
        (segment === "attention" && unit.lifecycleStatus !== "ACTIVE");

      return matchesStatus && matchesSegment;
    });
  }, [segment, statusFilter, units]);

  const unitSegments: FilterSegment[] = [
    { label: "All", value: "all", count: units.length },
    {
      label: "Healthy",
      value: "healthy",
      count: units.filter((unit) => unit.lifecycleStatus === "ACTIVE").length,
    },
    {
      label: "Needs Review",
      value: "attention",
      count: units.filter((unit) => unit.lifecycleStatus !== "ACTIVE").length,
    },
  ];

  return (
    <div>
      <Link
        href="/dashboard"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-1 py-2 text-sm font-semibold transition",
          darkMode
            ? "text-slate-300 hover:text-white"
            : "text-slate-500 hover:text-slate-900",
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4 py-4">
        <div>
          <h1
            className={cn(
              "text-4xl font-semibold tracking-[-0.04em]",
              darkMode ? "text-white" : "text-black",
            )}
          >
            Units
          </h1>
          <div
            className={cn(
              "mt-2 text-sm",
              darkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            <span>Dashboard</span>
            <span className="px-2">|</span>
            <span className="text-[#1bb4a5]">Units</span>
          </div>
          <p
            className={cn(
              "mt-1 text-sm",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            A complete list of all units in your organisation
          </p>
        </div>

        <PlanUsageActions
          darkMode={darkMode}
          unitUsageText={unitUsageText}
          planLimitReached={planLimitReached}
          onCreateUnit={onOpenCreateUnit}
        />
      </div>

      <MetricGridInternal darkMode={darkMode} metrics={metrics ?? []} />

      <Card
        className={cn(
          "mt-6 overflow-hidden rounded-[22px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
          darkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-100 bg-white",
        )}
      >
        <TableFilterBar
          darkMode={darkMode}
          searchPlaceholder="Search unit or admin"
          searchValue={query}
          onSearchChange={(value) => onQueryChange?.(value)}
          selects={[
            {
              label: "Sort",
              value: ordering,
              onChange: (value) => onOrderingChange?.(value),
              options: [
                { label: "Newest first", value: "-created_at" },
                { label: "Oldest first", value: "created_at" },
                { label: "Name A-Z", value: "name" },
                { label: "Name Z-A", value: "-name" },
              ],
              className: "min-w-40",
            },
            {
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { label: "All statuses", value: "all" },
                { label: "Active", value: "ACTIVE" },
                { label: "Restricted", value: "RESTRICTED" },
                { label: "Archived", value: "ARCHIVED" },
                { label: "Pending Archive", value: "PENDING ARCHIVE" },
              ],
              className: "min-w-40",
            },
          ]}
          segments={unitSegments}
          activeSegment={segment}
          onSegmentChange={setSegment}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead
              className={cn(
                "text-[11px] font-bold uppercase tracking-[0.08em]",
                darkMode ? "bg-slate-800 text-slate-300" : "bg-[#eef2f6] text-slate-500",
              )}
            >
              <tr>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Unit Admin</th>
                <th className="px-4 py-3">Total Audiences</th>
                <th className="px-4 py-3">Total Users</th>
                <th className="px-4 py-3">Active Sessions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading units...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#dc2626]">
                    {error}
                  </td>
                </tr>
              ) : filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No units found for this view.
                  </td>
                </tr>
              ) : filteredUnits.map((unit) => (
                <tr
                  key={unit.id}
                  className={cn(
                    "border-t",
                    darkMode ? "border-slate-800" : "border-slate-200",
                  )}
                >
                  <td className="px-4 py-5">{toTitleCase(unit.name)}</td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2">
                      <AvatarSeed seed={unit.name} />
                      <span>{unit.admins[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-slate-500">{unit.audiences}</td>
                  <td className="px-4 py-5 text-slate-500">{unit.totalUsers}</td>
                  <td className="px-4 py-5 text-slate-500">{unit.sessions}</td>
                  <td className="px-4 py-5">
                    <UnitStatusPill status={unit.lifecycleStatus} />
                  </td>
                  <td className="px-4 py-5">
                    <Link
                      href={`/dashboard/units/${unit.id}`}
                      className="text-xs font-bold text-[#16a394]"
                    >
                      VIEW
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControl
          darkMode={darkMode}
          summary={`Showing ${filteredUnits.length} of ${totalUnits} units`}
          items={paginationItems}
          activePage={activePage}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          onPageChange={onPageChange}
        />
      </Card>
    </div>
  );
}

function InlineStateCard({
  darkMode,
  title,
  body,
}: {
  darkMode: boolean;
  title: string;
  body: string;
}) {
  return (
    <Card
      className={cn(
        "mt-6 rounded-[22px] border px-6 py-5",
        darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white",
      )}
    >
      <div className="text-base font-semibold">{title}</div>
      <div className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-slate-500")}>
        {body}
      </div>
    </Card>
  );
}

export function UnitDetail({
  darkMode,
  unit,
  audiences,
  assignedAdmins,
  isUnitRole,
  assignedAdminsLoading = false,
  assignedAdminsError = "",
  detailError = "",
  existingUnitNames = [],
  unitTypeOptions,
  countryOptions,
  adminOptions,
  adminOptionsNote,
  onUnitUpdated,
}: {
  darkMode: boolean;
  unit: UnitSummary;
  audiences: AudienceSummary[];
  assignedAdmins: AssignedUnitAdmin[];
  isUnitRole: boolean;
  assignedAdminsLoading?: boolean;
  assignedAdminsError?: string;
  detailError?: string;
  existingUnitNames?: string[];
  unitTypeOptions?: Array<{ label: string; value: string }>;
  countryOptions?: Array<{ label: string; value: string }>;
  adminOptions?: Array<{ id: number; name: string; email: string }>;
  adminOptionsNote?: string;
  onUnitUpdated?: () => Promise<void> | void;
}) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [assignAdminOpen, setAssignAdminOpen] = useState(false);
  const [editUnitOpen, setEditUnitOpen] = useState(false);

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

  const alertBreakdown = useMemo(
    () => ({
      critical: unit.alerts.filter((alert) => alert.state === "critical").length,
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
      count: assignedAdmins.filter((admin) => admin.status === "Pending").length,
    },
    {
      label: "Inactive",
      value: "inactive",
      count: assignedAdmins.filter((admin) => admin.status === "Inactive").length,
    },
  ];

  const audienceAdminOptions: FilterOption[] = [
    { label: "All admins", value: "all" },
    ...Array.from(new Set(audiences.map((audience) => audience.admin))).map((admin) => ({
      label: admin,
      value: admin,
    })),
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
      count: audiences.filter((audience) => audience.status === "REVIEW").length,
    },
    {
      label: "Flagged",
      value: "flagged",
      count: audiences.filter((audience) => audience.status === "FLAGGED").length,
    },
  ];

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
              <div className="text-[18px] font-medium tracking-[0.08em]">STATUS</div>
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

        <Card
          className={cn(
            "mt-5 overflow-hidden rounded-[22px] border",
            darkMode
              ? "border-slate-800 bg-slate-900 text-white"
              : "border-slate-100 bg-white",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
            <div>
              <div className="text-lg font-semibold">Assigned Unit Admins</div>
              <div
                className={cn(
                  "mt-1 text-sm",
                  darkMode ? "text-slate-400" : "text-slate-500",
                )}
              >
                Governance ownership, access state, and reassignment actions for this unit.
              </div>
            </div>
            {!isUnitRole ? (
              <Button
                variant="outline"
                className="min-h-11 rounded-xl px-5 py-3 text-sm"
                onClick={() => setAssignAdminOpen(true)}
              >
                <UserCog className="h-4 w-4" />
                Assign Admin
              </Button>
            ) : null}
          </div>

          <TableFilterBar
            darkMode={darkMode}
            searchPlaceholder="Search admin by name or email"
            searchValue={adminSearch}
            onSearchChange={setAdminSearch}
            selects={[
              {
                label: "Role",
                value: adminRoleFilter,
                onChange: setAdminRoleFilter,
                options: [
                  { label: "All roles", value: "all" },
                  { label: "Lead Unit Admin", value: "Lead Unit Admin" },
                  { label: "Unit Admin", value: "Unit Admin" },
                  { label: "Read-Only Admin", value: "Read-Only Admin" },
                ],
                className: "min-w-44",
              },
            ]}
            segments={adminSegments}
            activeSegment={adminSegment}
            onSegmentChange={setAdminSegment}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.08em]",
                  darkMode ? "bg-slate-800 text-slate-300" : "bg-[#eef2f6] text-slate-500",
                )}
              >
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedAdminsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      Loading assigned unit admins...
                    </td>
                  </tr>
                ) : assignedAdminsError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#dc2626]">
                      {assignedAdminsError}
                    </td>
                  </tr>
                ) : filteredAssignedAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      No assigned unit admins found for this unit.
                    </td>
                  </tr>
                ) : filteredAssignedAdmins.map((admin) => (
                  <tr
                    key={`${admin.email}-${admin.role}`}
                    className={cn(
                      "border-t",
                      darkMode ? "border-slate-800" : "border-slate-200",
                    )}
                  >
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <AvatarSeed seed={admin.name} />
                        <span>{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-slate-500">{admin.email}</td>
                    <td className="px-4 py-5">
                      <RolePill role={admin.role} />
                    </td>
                    <td className="px-4 py-5">
                      <AdminStatusPill status={admin.status} />
                    </td>
                    <td className="px-4 py-5 text-slate-500">{admin.lastActive}</td>
                    <td className="px-4 py-5">
                      <RowActionsMenu
                        darkMode={darkMode}
                        label="Admin Actions"
                        actions={[
                          "Change lead admin",
                          "Remove from unit",
                          "View activity",
                          "Reassign ownership",
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControl
            darkMode={darkMode}
            summary={`Showing ${filteredAssignedAdmins.length} of ${assignedAdmins.length} assigned admins`}
            items={[1, 2, 3, "...", 8]}
            activePage={1}
          />
        </Card>

        <Card
          className={cn(
            "mt-5 overflow-hidden rounded-[22px] border",
            darkMode
              ? "border-slate-800 bg-slate-900 text-white"
              : "border-slate-100 bg-white",
          )}
        >
          <div className="px-5 py-4">
            <div className="text-lg font-semibold">Audiences in this Unit</div>
            <div
              className={cn(
                "mt-1 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Review live, flagged, and in-review audiences without leaving the unit context.
            </div>
          </div>

          <TableFilterBar
            darkMode={darkMode}
            searchPlaceholder="Search audience or admin"
            searchValue={audienceSearch}
            onSearchChange={setAudienceSearch}
            selects={[
              {
                label: "Admin",
                value: audienceAdminFilter,
                onChange: setAudienceAdminFilter,
                options: audienceAdminOptions,
                className: "min-w-44",
              },
            ]}
            segments={audienceSegments}
            activeSegment={audienceSegment}
            onSegmentChange={setAudienceSegment}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.08em]",
                  darkMode ? "bg-slate-800 text-slate-300" : "bg-[#eef2f6] text-slate-500",
                )}
              >
                <tr>
                  <th className="px-4 py-3">Audiences</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Total Users</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudiences.map((audience) => (
                  <tr
                    key={audience.name}
                    className={cn(
                      "border-t",
                      darkMode ? "border-slate-800" : "border-slate-200",
                    )}
                  >
                    <td className="px-4 py-5">{audience.name}</td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <AvatarSeed seed={audience.name} />
                        <span>{audience.admin}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-slate-500">{audience.totalUsers}</td>
                    <td className="px-4 py-5">
                      <AudienceStatusPill status={audience.status} />
                    </td>
                    <td className="px-4 py-5">
                      <button
                        type="button"
                        className="text-xs font-bold text-[#16a394]"
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControl
            darkMode={darkMode}
            summary={`Showing ${filteredAudiences.length} of ${audiences.length} audiences`}
            items={[1, 2, 3, "...", 29]}
            activePage={5}
          />
        </Card>
      </div>

      {alertsOpen ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-slate-950/45 backdrop-blur-sm"
          onClick={() => setAlertsOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "scrollbar-dashboard h-full w-full max-w-130 overflow-y-auto border-l px-6 py-6",
              darkMode
                ? "border-slate-800 bg-[#0b1420] text-white"
                : "border-slate-200 bg-white text-slate-900",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Critical Alerts</div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Filtered operational alerts for {toTitleCase(unit.name)}.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertsOpen(false)}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                  darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <SummaryBadge
                label="Critical"
                value={String(alertBreakdown.critical)}
                tone="critical"
              />
              <SummaryBadge
                label="Warnings"
                value={String(alertBreakdown.warning)}
                tone="warning"
              />
              <SummaryBadge
                label="Healthy checks"
                value={String(alertBreakdown.healthy)}
                tone="healthy"
              />
            </div>

            <div className="mt-6 space-y-3">
              {unit.alerts.map((alert) => (
                <Card
                  key={alert.title}
                  className={cn(
                    "rounded-2xl border p-4",
                    darkMode
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-100 bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{alert.title}</div>
                      <div
                        className={cn(
                          "mt-1 text-sm",
                          darkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        {alert.description}
                      </div>
                    </div>
                    <AlertStatePill state={alert.state} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ArchiveUnitModal
        darkMode={darkMode}
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        unit={unit}
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
      />
    </>
  );
}

function UnitCard({
  darkMode,
  unit,
}: {
  darkMode: boolean;
  unit: UnitSummary;
}) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [assignAdminOpen, setAssignAdminOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const actionItems = [
    {
      label: "Edit Unit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => setEditUnitOpen(true),
    },
    {
      label: "Assign / Reassign Unit Admin",
      icon: <UserCog className="h-4 w-4" />,
      onClick: () => setAssignAdminOpen(true),
    },
    {
      label: "Archive Unit",
      icon: <Trash2 className="h-4 w-4" />,
      tone: "danger" as const,
      onClick: () => setArchiveOpen(true),
    },
    {
      label: "View Unit Audit",
      icon: <ClipboardList className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
    {
      label: "View Users in Unit",
      icon: <Users className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
    {
      label: "View Audiences",
      icon: <Eye className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
    {
      label: "Generate Unit Report",
      icon: <FileSpreadsheet className="h-4 w-4" />,
      href: `/dashboard/units/${unit.id}`,
    },
  ];

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden rounded-[22px] border shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)]",
          darkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-100 bg-white",
        )}
      >
        <div className="flex items-start justify-between px-6 pt-4">
          <UnitStatusPill status={unit.lifecycleStatus} />
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionMenuOpen((current) => !current)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
                darkMode
                  ? "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
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
                {actionItems.map((item) =>
                  item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActionMenuOpen(false)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                        darkMode
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ) : (
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
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-6 pb-4 pt-3">
          <div className="text-[2rem] font-semibold tracking-[-0.04em]">
            {unit.name}
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-3 border-y",
            darkMode ? "border-slate-800" : "border-slate-200",
          )}
        >
          <StatBlock darkMode={darkMode} label="Total Users" value={unit.totalUsers} />
          <StatBlock darkMode={darkMode} label="Audiences" value={unit.audiences} />
          <StatBlock
            darkMode={darkMode}
            label="Sessions"
            value={unit.sessions}
            valueClassName="text-[#22c55e]"
          />
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">ASSIGNED ADMINS</div>
            <Link
              href={`/dashboard/units/${unit.id}`}
              className="text-xs font-bold text-[#16a394]"
            >
              View Unit Audit
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {unit.admins.map((admin) => (
              <div key={admin} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <AvatarSeed seed={admin} />
                  <span>{admin}</span>
                </div>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[9px] font-bold uppercase",
                    darkMode
                      ? "bg-slate-800 text-slate-300"
                      : "bg-[#eeeeee] text-slate-500",
                  )}
                >
                  Admin
                </span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-sm",
              darkMode
                ? "border-[#5b3b45] bg-[#24151b] text-slate-200"
                : "border-[#fee2e2] bg-[#fff8f8] text-slate-700",
            )}
          >
            <div className="font-semibold text-[#dc2626]">
              Critical Alerts: {unit.criticalAlertsCount}
            </div>
            <div
              className={cn(
                "mt-1 text-xs",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Includes session failures, sync backlog, missing admins, disputes, and validation issues.
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/dashboard/units/${unit.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b]"
            >
              View Unit
            </Link>
            <Button
              variant="outline"
              className="min-h-11 rounded-xl px-5 py-3 text-sm"
              onClick={() => setEditUnitOpen(true)}
            >
              Edit Unit
            </Button>
          </div>
        </div>
      </Card>

      <EditUnitModal
        key={`card-edit-${unit.id}-${editUnitOpen ? "open" : "closed"}`}
        darkMode={darkMode}
        open={editUnitOpen}
        onClose={() => setEditUnitOpen(false)}
        unit={unit}
      />
      <AssignAdminModal
        darkMode={darkMode}
        open={assignAdminOpen}
        onClose={() => setAssignAdminOpen(false)}
        unit={unit}
      />
      <ArchiveUnitModal
        darkMode={darkMode}
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        unit={unit}
      />
    </>
  );
}
