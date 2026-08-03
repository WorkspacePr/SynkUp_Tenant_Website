"use client";

import { useMemo, useState } from "react";
import { Grid2X2, List } from "lucide-react";

import { cn } from "@/utils";
import {
  MetricGridInternal,
  MetricGridSkeleton,
  PaginationControl,
  PlanUsageActions,
  TableFilterBar,
  UnitsEmptyState,
  UnitsOverviewSkeleton,
} from "../shared";
import type { OverviewMetric, UnitSummary } from "../types";
import { InlineStateCard } from "./InlineStateCard";
import { UnitCard } from "./UnitCard";
import { UnitTablePanel } from "./UnitTablePanel";
import { UnitsPageHeader } from "./UnitsPageHeader";

export function UnitsOverview({
  darkMode,
  onOpenCreateUnit,
  unitUsageText,
  planLimitReached,
  gridUnits = [],
  tableUnits = [],
  loading = false,
  tableLoading = false,
  error = "",
  tableError = "",
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
  onOpenUnit,
  metrics,
}: {
  darkMode: boolean;
  onOpenCreateUnit: () => void;
  unitUsageText: string;
  planLimitReached: boolean;
  gridUnits?: UnitSummary[];
  tableUnits?: UnitSummary[];
  loading?: boolean;
  tableLoading?: boolean;
  error?: string;
  tableError?: string;
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
  onOpenUnit?: (unit: UnitSummary) => void;
  metrics?: OverviewMetric[];
}) {
  const [view, setView] = useState<"table" | "grid">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segment, setSegment] = useState("all");

  const filteredTableUnits = useMemo(() => {
    return tableUnits.filter((unit) => {
      const matchesStatus =
        statusFilter === "all" || unit.lifecycleStatus === statusFilter;
      const matchesSegment =
        segment === "all" ||
        (segment === "healthy" && unit.lifecycleStatus === "ACTIVE") ||
        (segment === "attention" && unit.lifecycleStatus !== "ACTIVE");

      return matchesStatus && matchesSegment;
    });
  }, [segment, statusFilter, tableUnits]);

  const gridUnitsByPage = useMemo(() => {
    const pageUnitIds = new Set(filteredTableUnits.map((unit) => unit.id));

    if (pageUnitIds.size === 0) {
      return [];
    }

    const matchingFeaturedUnits = gridUnits.filter((unit) => pageUnitIds.has(unit.id));

    if (matchingFeaturedUnits.length > 0) {
      return matchingFeaturedUnits;
    }

    return filteredTableUnits;
  }, [filteredTableUnits, gridUnits]);

  return (
    <div>
      <UnitsPageHeader
        darkMode={darkMode}
        title="Units"
        description="Manage your organisation's units and audiences"
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

      {error ? (
        <InlineStateCard darkMode={darkMode} title="Unable to load units" body={error} />
      ) : loading ? (
        <UnitsOverviewSkeleton darkMode={darkMode} />
      ) : tableUnits.length === 0 ? (
        <UnitsEmptyState
          darkMode={darkMode}
          title="No units created yet"
          body="Your organisation does not have any units yet. Create one to start assigning admins, grouping audiences, and tracking activity from the dashboard."
          onAction={onOpenCreateUnit}
        />
      ) : (
        <>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
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
              type="button"
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

          <div
            className={cn(
              "mt-1",
              darkMode
                ? "text-white"
                : "text-slate-900",
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
              segments={[
                { label: "All", value: "all", count: tableUnits.length },
                {
                  label: "Healthy",
                  value: "healthy",
                  count: tableUnits.filter((unit) => unit.lifecycleStatus === "ACTIVE").length,
                },
                {
                  label: "Needs Review",
                  value: "attention",
                  count: tableUnits.filter((unit) => unit.lifecycleStatus !== "ACTIVE").length,
                },
              ]}
              activeSegment={segment}
              onSegmentChange={setSegment}
            />

            {view === "grid" ? (
              <>
                {gridUnitsByPage.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-slate-500">
                    No units found for this view.
                  </div>
                ) : (
                  <div className="grid gap-5 p-5 xl:grid-cols-2">
                    {gridUnitsByPage.map((unit) => (
                      <UnitCard
                        key={unit.id}
                        darkMode={darkMode}
                        unit={unit}
                        onOpen={onOpenUnit}
                      />
                    ))}
                  </div>
                )}
                <PaginationControl
                  darkMode={darkMode}
                  summary={`Showing ${filteredTableUnits.length} of ${totalUnits} units`}
                  items={paginationItems}
                  activePage={activePage}
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                  onPreviousPage={onPreviousPage}
                  onNextPage={onNextPage}
                  onPageChange={onPageChange}
                />
              </>
            ) : (
              <UnitTablePanel
                darkMode={darkMode}
                units={tableUnits}
                tableLoading={tableLoading}
                error={tableError}
                query={query}
                onQueryChange={onQueryChange}
                ordering={ordering}
                onOrderingChange={onOrderingChange}
                activePage={activePage}
                paginationItems={paginationItems}
                totalUnits={totalUnits}
                hasPreviousPage={hasPreviousPage}
                hasNextPage={hasNextPage}
                onPreviousPage={onPreviousPage}
                onNextPage={onNextPage}
                onPageChange={onPageChange}
                showControls={false}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                segment={segment}
                onSegmentChange={setSegment}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
