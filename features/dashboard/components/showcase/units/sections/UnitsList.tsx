"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import {
  AvatarSeed,
  MetricGridInternal,
  MetricGridSkeleton,
  PaginationControl,
  PlanUsageActions,
  TableFilterBar,
  toTitleCase,
  UnitStatusPill,
  UnitsTableSkeleton,
} from "../shared";
import type {
  FilterSegment,
  OverviewMetric,
  UnitSummary,
} from "../types";
import { UnitsPageHeader } from "./UnitsPageHeader";

export function UnitsList({
  darkMode,
  onOpenCreateUnit,
  unitUsageText,
  planLimitReached,
  units = [],
  loading = false,
  tableLoading = false,
  error = "",
  query = "",
  onQueryChange,
  ordering = "-created_at",
  onOrderingChange,
  activePage = 1,
  paginationItems = [1],
  totalUnits = 0,
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
  tableLoading?: boolean;
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
      <UnitsPageHeader
        darkMode={darkMode}
        title="Units"
        description="A complete list of all units in your organisation"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
        breadcrumb={[
          { label: "Dashboard" },
          { label: "Units", active: true },
        ]}
        actionSlot={
          <PlanUsageActions
            darkMode={darkMode}
            unitUsageText={unitUsageText}
            planLimitReached={planLimitReached}
            onCreateUnit={onOpenCreateUnit}
            loading={loading}
          />
        }
      />

      {loading ? (
        <MetricGridSkeleton darkMode={darkMode} />
      ) : (
        <MetricGridInternal darkMode={darkMode} metrics={metrics ?? []} />
      )}

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
          {tableLoading ? (
            <UnitsTableSkeleton darkMode={darkMode} rows={5} columns={7} />
          ) : (
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
                {error ? (
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
          )}
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
