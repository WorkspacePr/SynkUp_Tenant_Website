"use client";

import {
  ArrowRight,
  TriangleAlert,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import {
  AdminStatusPill,
  AlertStatePill,
  AudienceStatusPill,
  AvatarSeed,
  PaginationControl,
  RolePill,
  RowActionsMenu,
  SummaryBadge,
  TableFilterBar,
  UnitAdminsTableSkeleton,
  toTitleCase,
} from "../shared";
import type {
  AssignedUnitAdmin,
  AudienceSummary,
  FilterOption,
  FilterSegment,
  UnitAlert,
} from "../types";

export type ArchiveDependencyItem = {
  key: "users" | "audiences" | "sessions";
  label: string;
  count: number;
  countLabel: string;
  description: string;
  ctaLabel: string;
  targetId: string;
};

export function ArchiveReadinessPanel({
  darkMode,
  isUnitRole,
  dependencies,
  onMoveUsers,
  onReviewArchive,
  onNavigate,
}: {
  darkMode: boolean;
  isUnitRole: boolean;
  dependencies: ArchiveDependencyItem[];
  onMoveUsers: () => void;
  onReviewArchive: () => void;
  onNavigate: (dependency: ArchiveDependencyItem) => void;
}) {
  if (dependencies.length === 0) {
    return null;
  }

  return (
    <Card
      className={cn(
        "mt-5 overflow-hidden rounded-[24px] border",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white text-slate-900",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-4 px-5 py-5",
          darkMode ? "bg-slate-950/40" : "bg-slate-50",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#f59e0b]">
            <TriangleAlert className="h-4 w-4" />
            Archive readiness
          </div>
          <div className="mt-2 text-lg font-semibold">
            Resolve the remaining dependencies before you archive this unit.
          </div>
          <div
            className={cn(
              "mt-2 text-sm",
              darkMode ? "text-slate-300" : "text-slate-600",
            )}
          >
            Clear each blocker in order. Once these dependencies are resolved,
            the archive flow can continue without interruption.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {dependencies.some((dependency) => dependency.key === "users") ? (
            <Button
              className="min-h-11 rounded-xl px-5 py-3 text-sm"
              onClick={onMoveUsers}
            >
              <Users className="h-4 w-4" />
              Move Users
            </Button>
          ) : null}
          {!isUnitRole ? (
            <Button
              variant="outline"
              className="min-h-11 rounded-xl px-5 py-3 text-sm"
              onClick={onReviewArchive}
            >
              Review Archive Request
            </Button>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="space-y-3">
          {dependencies.map((dependency, index) => (
            <div
              key={dependency.key}
              className={cn(
                "flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between",
                darkMode
                  ? "border-slate-800 bg-slate-950/50"
                  : "border-slate-100 bg-slate-50",
              )}
            >
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
                    darkMode
                      ? "bg-slate-900 text-[#f8b84e]"
                      : "bg-white text-[#b45309]",
                  )}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-base font-semibold">
                      {dependency.label}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        darkMode
                          ? "bg-slate-900 text-slate-200"
                          : "bg-white text-slate-600",
                      )}
                    >
                      {dependency.countLabel}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "mt-1 text-sm leading-6",
                      darkMode ? "text-slate-300" : "text-slate-600",
                    )}
                  >
                    {dependency.description}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => onNavigate(dependency)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#16a394]"
                >
                  {dependency.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function AssignedAdminsSection({
  darkMode,
  isUnitRole,
  assignedAdmins,
  filteredAssignedAdmins,
  assignedAdminsLoading,
  assignedAdminsError,
  adminSearch,
  onAdminSearchChange,
  adminRoleFilter,
  onAdminRoleFilterChange,
  adminSegments,
  adminSegment,
  onAdminSegmentChange,
  onAssignAdmin,
}: {
  darkMode: boolean;
  isUnitRole: boolean;
  assignedAdmins: AssignedUnitAdmin[];
  filteredAssignedAdmins: AssignedUnitAdmin[];
  assignedAdminsLoading: boolean;
  assignedAdminsError: string;
  adminSearch: string;
  onAdminSearchChange: (value: string) => void;
  adminRoleFilter: string;
  onAdminRoleFilterChange: (value: string) => void;
  adminSegments: FilterSegment[];
  adminSegment: string;
  onAdminSegmentChange: (value: string) => void;
  onAssignAdmin: () => void;
}) {
  return (
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
            Governance ownership, access state, and reassignment actions for
            this unit.
          </div>
        </div>
        {!isUnitRole ? (
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={onAssignAdmin}
          >
            <UserCog className="h-4 w-4" />
            {assignedAdmins.length > 0 ? "Reassign Admin" : "Assign Admin"}
          </Button>
        ) : null}
      </div>

      <TableFilterBar
        darkMode={darkMode}
        searchPlaceholder="Search admin by name or email"
        searchValue={adminSearch}
        onSearchChange={onAdminSearchChange}
        selects={[
          {
            label: "Role",
            value: adminRoleFilter,
            onChange: onAdminRoleFilterChange,
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
        onSegmentChange={onAdminSegmentChange}
      />

      <div className="overflow-x-auto">
        {assignedAdminsLoading ? (
          <UnitAdminsTableSkeleton darkMode={darkMode} />
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead
              className={cn(
                "text-[11px] font-bold uppercase tracking-[0.08em]",
                darkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-[#eef2f6] text-slate-500",
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
              {assignedAdminsError ? (
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
              ) : (
                filteredAssignedAdmins.map((admin) => (
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
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <PaginationControl
        darkMode={darkMode}
        summary={`Showing ${filteredAssignedAdmins.length} of ${assignedAdmins.length} assigned admins`}
        items={[1, 2, 3, "...", 8]}
        activePage={1}
      />
    </Card>
  );
}

export function AudiencesSection({
  darkMode,
  audiences,
  filteredAudiences,
  audienceSearch,
  onAudienceSearchChange,
  audienceAdminFilter,
  onAudienceAdminFilterChange,
  audienceAdminOptions,
  audienceSegments,
  audienceSegment,
  onAudienceSegmentChange,
}: {
  darkMode: boolean;
  audiences: AudienceSummary[];
  filteredAudiences: AudienceSummary[];
  audienceSearch: string;
  onAudienceSearchChange: (value: string) => void;
  audienceAdminFilter: string;
  onAudienceAdminFilterChange: (value: string) => void;
  audienceAdminOptions: FilterOption[];
  audienceSegments: FilterSegment[];
  audienceSegment: string;
  onAudienceSegmentChange: (value: string) => void;
}) {
  return (
    <Card
      id="unit-audiences-section"
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
          Review live, flagged, and in-review audiences without leaving the
          unit context.
        </div>
      </div>

      <TableFilterBar
        darkMode={darkMode}
        searchPlaceholder="Search audience or admin"
        searchValue={audienceSearch}
        onSearchChange={onAudienceSearchChange}
        selects={[
          {
            label: "Admin",
            value: audienceAdminFilter,
            onChange: onAudienceAdminFilterChange,
            options: audienceAdminOptions,
            className: "min-w-44",
          },
        ]}
        segments={audienceSegments}
        activeSegment={audienceSegment}
        onSegmentChange={onAudienceSegmentChange}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.08em]",
              darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-[#eef2f6] text-slate-500",
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
  );
}

export function UnitAlertsDrawer({
  darkMode,
  open,
  unitName,
  alerts,
  alertBreakdown,
  onClose,
}: {
  darkMode: boolean;
  open: boolean;
  unitName: string;
  alerts: UnitAlert[];
  alertBreakdown: {
    critical: number;
    warning: number;
    healthy: number;
  };
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/45 backdrop-blur-sm"
      onClick={onClose}
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
              Filtered operational alerts for {toTitleCase(unitName)}.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700",
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
          {alerts.map((alert) => (
            <Card
              key={`${alert.title}-${alert.description}`}
              className={cn(
                "rounded-2xl border p-4",
                darkMode
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-100 bg-slate-50 text-slate-900",
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
  );
}
