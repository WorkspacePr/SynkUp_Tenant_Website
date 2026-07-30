"use client";

import { useState } from "react";

import {
  MetricGridInternal,
  MetricGridSkeleton,
  PlanUsageActions,
  UnitsEmptyState,
} from "../shared";
import type { OverviewMetric, UnitSummary } from "../types";
import { UnitTablePanel } from "./UnitTablePanel";
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

      {!loading && !error && units.length === 0 && !query.trim() ? (
        <UnitsEmptyState
          darkMode={darkMode}
          title="No units yet"
          body="Create your first unit to assign administrators, organise audiences, and begin tracking activity."
          actionLabel="Create New Unit"
          onAction={onOpenCreateUnit}
        />
      ) : (
        <>
      {loading ? (
        <MetricGridSkeleton darkMode={darkMode} />
      ) : (
        <MetricGridInternal darkMode={darkMode} metrics={metrics ?? []} />
      )}
      <UnitTablePanel
        darkMode={darkMode}
        units={units}
        tableLoading={tableLoading}
        error={error}
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
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        segment={segment}
        onSegmentChange={setSegment}
      />
        </>
      )}
    </div>
  );
}
