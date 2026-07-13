"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAssignedUnitAdmins,
  getTenantUnitDetail,
  getUnitAdminCandidates,
  getTenantUnits,
  type TenantUnitDetail,
  type TenantUnitListItem,
  type TenantUnitsPagination,
  type TenantUnitsPlanUsage,
} from "@/features/dashboard/api/tenant-units";
import { getReferenceData } from "@/features/onboarding/api/tenant-onboarding";
import { readTenantLoginContext } from "@/lib/auth/tenant-session";
import {
  AUDIENCE_LOOKUP,
  OVERVIEW_METRICS,
  PLAN_UNIT_LIMIT,
  UNITS,
  UNLIMITED_UNITS,
} from "./units/data";
import { CreateUnitModal } from "./units/modals";
import type {
  OverviewMetric,
  AssignedUnitAdmin,
  UnitLifecycleStatus,
  UnitSummary,
  UnitsWorkspaceProps,
} from "./units/types";
import { UnitDetail, UnitsList, UnitsOverview } from "./units/views";

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCreatedAt(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function normalizeLifecycleStatus(value: string): UnitLifecycleStatus {
  const normalized = value.trim().toUpperCase();
  if (
    normalized === "ACTIVE" ||
    normalized === "ARCHIVED" ||
    normalized === "RESTRICTED" ||
    normalized === "PENDING ARCHIVE"
  ) {
    return normalized;
  }

  return "ACTIVE";
}

function buildStatusMessage(unit: TenantUnitListItem, lifecycleStatus: UnitLifecycleStatus) {
  if (lifecycleStatus === "ARCHIVED") return "Archived and hidden from active operations";
  if (lifecycleStatus === "PENDING ARCHIVE") return "Pending archive review";
  if (lifecycleStatus === "RESTRICTED") return "Validation checks require admin review";
  return unit.critical_alerts_count > 0 ? "Operational with open alerts" : "All systems active";
}

function mapUnit(unit: TenantUnitListItem): UnitSummary {
  const lifecycleStatus = normalizeLifecycleStatus(unit.lifecycle_status);
  const admins = unit.assigned_admin_summary
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    id: unit.unit_id,
    name: unit.name,
    shortCode: unit.short_code,
    status: unit.status,
    type: unit.type,
    location: unit.location,
    city: unit.city,
    stateRegion: unit.state_region,
    country: unit.country,
    totalUsers: formatCount(unit.total_users),
    audiences: formatCount(unit.total_audiences),
    sessions: formatCount(unit.active_sessions),
    admins: admins.length > 0 ? admins : ["Unassigned"],
    organization: unit.organization_name,
    createdAt: formatCreatedAt(unit.created_at),
    updatedAt: unit.created_at,
    statusLabel: lifecycleStatus === "ACTIVE" ? "Operational" : lifecycleStatus,
    statusMessage: buildStatusMessage(unit, lifecycleStatus),
    lifecycleStatus,
    criticalAlertsCount: unit.critical_alerts_count,
    affectedUsers: unit.total_users,
    affectedAudiences: unit.total_audiences,
    activeSessionsCount: unit.active_sessions,
    alerts: [],
  };
}

function mapUnitDetail(detail: TenantUnitDetail): UnitSummary {
  const lifecycleStatus = normalizeLifecycleStatus(detail.lifecycle_status);
  return {
    id: detail.unit_id,
    name: detail.name,
    shortCode: detail.short_code,
    status: detail.status,
    type: detail.type,
    description: detail.description,
    location: detail.location,
    city: detail.city,
    stateRegion: detail.state_region,
    country: detail.country,
    totalUsers: formatCount(detail.total_users),
    audiences: formatCount(detail.total_audiences),
    sessions: formatCount(detail.active_sessions),
    admins: ["Assigned via governance"],
    organization: detail.organization_name,
    createdAt: formatCreatedAt(detail.created_at),
    updatedAt: detail.updated_at,
    archivedAt: detail.archived_at,
    archiveReason: detail.archive_reason,
    statusLabel:
      lifecycleStatus === "ACTIVE"
        ? "Operational"
        : lifecycleStatus === "RESTRICTED"
          ? "Restricted"
          : lifecycleStatus,
    statusMessage:
      lifecycleStatus === "ARCHIVED"
        ? "Archived and hidden from active operations"
        : lifecycleStatus === "PENDING ARCHIVE"
          ? "Pending archive review"
          : lifecycleStatus === "RESTRICTED"
            ? "Validation checks require admin review"
            : detail.critical_alerts_count > 0
              ? "Operational with open alerts"
              : "All systems active",
    lifecycleStatus,
    criticalAlertsCount: detail.critical_alerts_count,
    affectedUsers: detail.total_users,
    affectedAudiences: detail.total_audiences,
    activeSessionsCount: detail.active_sessions,
    alerts: [],
  };
}

function buildPaginationItems(activePage: number, totalPages: number) {
  if (totalPages <= 1) return [1];
  const pages = new Set<number>([1, totalPages, activePage - 1, activePage, activePage + 1]);
  const sortedPages = [...pages].filter((page) => page > 0 && page <= totalPages).sort((a, b) => a - b);
  const items: Array<number | "..."> = [];

  sortedPages.forEach((page, index) => {
    const previous = sortedPages[index - 1];
    if (previous && page - previous > 1) {
      items.push("...");
    }
    items.push(page);
  });

  return items;
}

function createMetrics(units: UnitSummary[]): OverviewMetric[] {
  if (units.length === 0) {
    return OVERVIEW_METRICS;
  }

  const totalAudiences = units.reduce((sum, unit) => sum + unit.affectedAudiences, 0);
  const activeSessions = units.reduce((sum, unit) => sum + unit.activeSessionsCount, 0);
  const criticalAlerts = units.reduce((sum, unit) => sum + unit.criticalAlertsCount, 0);

  return [
    { ...OVERVIEW_METRICS[0], value: formatCount(units.length) },
    { ...OVERVIEW_METRICS[1], value: formatCount(totalAudiences) },
    { ...OVERVIEW_METRICS[2], value: formatCount(activeSessions) },
    { ...OVERVIEW_METRICS[3], value: formatCount(criticalAlerts) },
  ];
}

export function UnitsWorkspace({
  darkMode,
  role,
  view,
  selectedUnitId,
}: UnitsWorkspaceProps) {
  const [createUnitOpen, setCreateUnitOpen] = useState(false);
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [query, setQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<TenantUnitsPagination>({
    page: 1,
    pageSize: 0,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [planUsage, setPlanUsage] = useState<TenantUnitsPlanUsage | null>(null);
  const [unitTypeOptions, setUnitTypeOptions] = useState<Array<{ label: string; value: string }>>(
    [],
  );
  const [countryOptions, setCountryOptions] = useState<Array<{ label: string; value: string }>>(
    [],
  );
  const [adminOptions, setAdminOptions] = useState<Array<{ id: number; name: string; email: string }>>(
    [],
  );
  const [adminOptionsNote, setAdminOptionsNote] = useState("");
  const [assignedAdmins, setAssignedAdmins] = useState<AssignedUnitAdmin[]>([]);
  const [assignedAdminsLoading, setAssignedAdminsLoading] = useState(false);
  const [assignedAdminsError, setAssignedAdminsError] = useState("");
  const [detailUnit, setDetailUnit] = useState<UnitSummary | null>(null);
  const [detailError, setDetailError] = useState("");

  const loadUnits = async (
    nextPage = page,
    nextQuery = query,
    nextOrdering = ordering,
  ) => {
    setError("");
    const result = await getTenantUnits({
      page: nextPage,
      search: nextQuery,
      ordering: nextOrdering,
    });

    if (!result.success) {
      setError(result.message);
      setUnits([]);
      return;
    }

    setUnits(result.data.data.map(mapUnit));
    setPagination(result.data.meta.pagination);
    setPlanUsage(result.data.planUsage ?? null);
  };

  useEffect(() => {
    const loadSupportData = async () => {
      const referenceData = await getReferenceData();
      setUnitTypeOptions(referenceData.unitTypeOptions);
      setCountryOptions(referenceData.countryOptions ?? []);

      const organizationId = readTenantLoginContext()?.organizationId;
      if (!organizationId) {
        setAdminOptionsNote("Sign in context is missing the organization id, so live unit-admin assignment cannot be loaded yet.");
        return;
      }

      const adminCandidatesResult = await getUnitAdminCandidates(organizationId);

      if (!adminCandidatesResult.success) {
        setAdminOptions([]);
        setAdminOptionsNote(adminCandidatesResult.message);
        return;
      }

      setAdminOptions(adminCandidatesResult.data.results);
      setAdminOptionsNote(
        adminCandidatesResult.data.note ||
          (adminCandidatesResult.data.results.length === 0
            ? "No live assignable admins are available yet. Add or accept an admin first, then assign during unit creation."
            : ""),
      );
    };

    void loadSupportData();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      setLoading(true);
      await loadUnits(page, query, ordering);
      if (!cancelled) setLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, query, ordering]);

  useEffect(() => {
    if (view !== "detail") {
      return;
    }

    const unitId = selectedUnitId ?? units[0]?.id ?? UNITS[0]?.id;
    if (!unitId) {
      return;
    }

    let cancelled = false;

    const loadDetail = async () => {
      setDetailError("");
      const result = await getTenantUnitDetail(unitId);

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setDetailError(result.message);
        setDetailUnit(null);
        return;
      }

      if (!result.data) {
        setDetailError("Unit detail payload was empty.");
        setDetailUnit(null);
        return;
      }

      setDetailUnit(mapUnitDetail(result.data));
    };

    const loadAssignedAdmins = async () => {
      setAssignedAdminsLoading(true);
      setAssignedAdminsError("");

      const result = await getAssignedUnitAdmins(unitId);

      if (cancelled) {
        return;
      }

      if (!result.success) {
        setAssignedAdminsError(result.message);
        setAssignedAdmins([]);
        setAssignedAdminsLoading(false);
        return;
      }

      setAssignedAdmins(
        result.data.results.map((admin) => ({
          name: admin.name,
          email: admin.email,
          role:
            admin.role === "Lead Unit Admin" ||
            admin.role === "Unit Admin" ||
            admin.role === "Read-Only Admin"
              ? admin.role
              : "Unit Admin",
          status:
            admin.status === "Active" ||
            admin.status === "Inactive" ||
            admin.status === "Pending"
              ? admin.status
              : "Active",
          lastActive: admin.last_active,
        })),
      );
      setAssignedAdminsLoading(false);
    };

    void loadDetail();
    void loadAssignedAdmins();

    return () => {
      cancelled = true;
    };
  }, [selectedUnitId, units, view]);

  const primaryUnit =
    detailUnit ??
    units.find((unit) => unit.id === selectedUnitId) ??
    UNITS.find((unit) => unit.id === selectedUnitId) ??
    units[0] ??
    UNITS[0];
  const totalUnits = planUsage?.units_used ?? pagination.total ?? units.length;
  const unitLimit = planUsage?.unit_limit ?? PLAN_UNIT_LIMIT;
  const unitUsageText =
    planUsage && unitLimit <= 0
      ? `${totalUnits} / Unlimited`
      : UNLIMITED_UNITS
        ? `${totalUnits} / Unlimited`
        : `${totalUnits} / ${unitLimit}`;
  const planLimitReached =
    planUsage?.creation_blocked ?? (!UNLIMITED_UNITS && totalUnits >= PLAN_UNIT_LIMIT);
  const paginationItems = useMemo(
    () => buildPaginationItems(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  );
  const metrics = useMemo(() => createMetrics(units), [units]);

  return (
    <>
      <section className="pb-10">
        {view === "overview" ? (
          <UnitsOverview
            darkMode={darkMode}
            onOpenCreateUnit={() => setCreateUnitOpen(true)}
            unitUsageText={unitUsageText}
            planLimitReached={planLimitReached}
            units={units}
            loading={loading}
            error={error}
            metrics={metrics}
          />
        ) : null}

        {view === "list" ? (
          <UnitsList
            darkMode={darkMode}
            onOpenCreateUnit={() => setCreateUnitOpen(true)}
            unitUsageText={unitUsageText}
            planLimitReached={planLimitReached}
            units={units}
            loading={loading}
            error={error}
            query={query}
            onQueryChange={(value) => {
              setPage(1);
              setQuery(value);
            }}
            ordering={ordering}
            onOrderingChange={(value) => {
              setPage(1);
              setOrdering(value);
            }}
            activePage={pagination.page}
            paginationItems={paginationItems}
            totalUnits={pagination.total}
            hasPreviousPage={pagination.hasPrevious}
            hasNextPage={pagination.hasNext}
            onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
            onNextPage={() =>
              setPage((current) => Math.min(pagination.totalPages, current + 1))
            }
            onPageChange={setPage}
            metrics={metrics}
          />
        ) : null}

        {view === "detail" ? (
          <UnitDetail
            darkMode={darkMode}
            unit={primaryUnit}
            audiences={AUDIENCE_LOOKUP[primaryUnit.id] ?? AUDIENCE_LOOKUP[1]}
            assignedAdmins={assignedAdmins}
            isUnitRole={role === "unit"}
            assignedAdminsLoading={assignedAdminsLoading}
            assignedAdminsError={assignedAdminsError}
            detailError={detailError}
            existingUnitNames={units.map((unitValue) => unitValue.name)}
            unitTypeOptions={unitTypeOptions}
            countryOptions={countryOptions}
            adminOptions={adminOptions}
            adminOptionsNote={adminOptionsNote}
            onUnitUpdated={async () => {
              const unitId = primaryUnit?.id;
              await loadUnits(page, query, ordering);
              if (!unitId) return;
              const detailResult = await getTenantUnitDetail(unitId);
              if (detailResult.success && detailResult.data) {
                setDetailUnit(mapUnitDetail(detailResult.data));
              }
            }}
          />
        ) : null}
      </section>

      <CreateUnitModal
        darkMode={darkMode}
        open={createUnitOpen}
        onClose={() => setCreateUnitOpen(false)}
        planLimitReached={planLimitReached}
        existingUnitNames={units.map((unit) => unit.name)}
        unitTypeOptions={unitTypeOptions}
        countryOptions={countryOptions}
        adminOptions={adminOptions}
        adminOptionsNote={adminOptionsNote}
        onCreated={async () => {
          setPage(1);
          await loadUnits(1, query, ordering);
        }}
      />
    </>
  );
}
