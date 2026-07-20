"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/utils";
import {
  MetricGridInternal,
  MetricGridSkeleton,
  PlanUsageActions,
  UnitsEmptyState,
  UnitsOverviewSkeleton,
} from "../shared";
import type { OverviewMetric, UnitSummary } from "../types";
import { InlineStateCard } from "./InlineStateCard";
import { UnitCard } from "./UnitCard";
import { UnitsPageHeader } from "./UnitsPageHeader";

export function UnitsOverview({
  darkMode,
  onOpenCreateUnit,
  unitUsageText,
  planLimitReached,
  units = [],
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
      ) : units.length === 0 ? (
        <UnitsEmptyState
          darkMode={darkMode}
          title="No units created yet"
          body="Your organisation does not have any units yet. Create one to start assigning admins, grouping audiences, and tracking activity from the dashboard."
          onAction={onOpenCreateUnit}
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
