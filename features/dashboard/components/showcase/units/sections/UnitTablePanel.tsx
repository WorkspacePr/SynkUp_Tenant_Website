"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import {
  AvatarSeed,
  DashboardDataTable,
  PaginationControl,
  TableFilterBar,
  toTitleCase,
  UnitStatusPill,
  UnitsTableSkeleton,
} from "../shared";
import type { FilterSegment, UnitSummary } from "../types";

export function UnitTablePanel({
  darkMode,
  units = [],
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
  showControls = true,
  statusFilter = "all",
  onStatusFilterChange,
  segment = "all",
  onSegmentChange,
}: {
  darkMode: boolean;
  units?: UnitSummary[];
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
  showControls?: boolean;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  segment?: string;
  onSegmentChange?: (value: string) => void;
}) {
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
    <Card
      className={cn(
        "mt-3 overflow-hidden rounded-[22px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      {showControls ? (
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
              onChange: (value) =>
                onStatusFilterChange ? onStatusFilterChange(value) : undefined,
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
          onSegmentChange={(value) =>
            onSegmentChange ? onSegmentChange(value) : undefined
          }
        />
      ) : null}

      {tableLoading ? (
          <UnitsTableSkeleton darkMode={darkMode} rows={5} columns={7} />
        ) : (
          <DashboardDataTable
            darkMode={darkMode}
            headers={["Unit", "Unit Admin", "Total Audiences", "Total Users", "Active Sessions", "Status", "Actions"]}
          >
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
              ) : (
                filteredUnits.map((unit) => (
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
                        aria-label={`View ${unit.name}`}
                        title={`View ${unit.name}`}
                        className="inline-flex rounded-lg p-2 text-[#16a394] transition hover:bg-[#e7f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
          </DashboardDataTable>
        )}

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
  );
}
