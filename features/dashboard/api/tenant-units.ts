import { getValidOnboardingAccessToken } from "@/lib/auth/tenant-session";

export type TenantUnitLifecycleStatus =
  | "ACTIVE"
  | "ARCHIVED"
  | "RESTRICTED"
  | "PENDING ARCHIVE";

export type TenantUnitListItem = {
  unit_id: number;
  name: string;
  short_code: string;
  status: string;
  lifecycle_status: string;
  organization_name: string;
  location: string;
  city: string;
  state_region: string;
  country: string;
  type: string;
  created_at: string;
  updated_at?: string;
  assigned_admin_summary: unknown;
  total_users: number;
  total_audiences: number;
  active_sessions: number;
  critical_alerts_count: number;
  health_state: string;
  available_actions: unknown;
};

export type TenantUnitsPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type TenantUnitsEmptyState = {
  code: string;
  title: string;
  message: string;
};

export type TenantUnitsPlanUsage = {
  units_used: number;
  unit_limit: number;
  creation_blocked: boolean;
  upgrade_prompt?: {
    show: boolean;
    variant: string;
  } | null;
  subscription_status?: string | null;
};

export type TenantUnitOverviewSummaryCards = {
  totalUnits: number;
  activeUnits: number;
  draftUnits: number;
  archivedUnits: number;
};

export type TenantUnitsOverviewResponse = {
  data: {
    summaryCards: TenantUnitOverviewSummaryCards;
    featuredUnits: TenantUnitListItem[];
  };
  meta?: unknown;
  planUsage?: TenantUnitsPlanUsage | null;
};

export type TenantUnitsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  data: TenantUnitListItem[];
  meta: {
    pagination: TenantUnitsPagination;
    filters?: unknown;
    emptyState?: TenantUnitsEmptyState | null;
    query?: unknown;
  };
  planUsage?: TenantUnitsPlanUsage | null;
};

export type TenantUnitDetail = {
  unit_id: number;
  name: string;
  short_code: string | null;
  status: string;
  lifecycle_status: string;
  type: string | null;
  description: string | null;
  location: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  organization_name: string;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  archive_reason: string | null;
  total_users: number;
  total_audiences: number;
  active_sessions: number;
  critical_alerts_count: number;
  health_state: string;
  warnings: unknown;
  restrictions: unknown;
  assigned_admins: unknown;
  action_availability: unknown;
  audience_preview: unknown;
  links: unknown;
  plan_usage: unknown;
};

export type UpdateTenantUnitPayload = {
  name?: string;
  short_code?: string | null;
  type?: string | null;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
  status?: "draft" | "active" | "archived";
  assigned_admin_ids?: number[];
  last_updated_at?: string;
};

export type CreateTenantUnitPayload = {
  name: string;
  short_code?: string | null;
  type?: string | null;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
  status: "draft" | "active" | "archived";
  assigned_admin_ids?: number[];
  last_updated_at: string;
};

export type UnitAdminCandidate = {
  id: number;
  name: string;
  email: string;
  source: "primary_admin";
  is_primary_admin: boolean;
};

export type UnitAssignedAdmin = {
  id?: number;
  name: string;
  email: string;
  role: string;
  status: string;
  last_active: string;
};

export type UnitArchiveBlocker = {
  code?: string;
  title: string;
  message?: string;
};

type ApiEnvelope = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: unknown;
  data?: unknown;
  meta?: unknown;
  planUsage?: unknown;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isUnitListItem(value: unknown): value is TenantUnitListItem {
  return (
    isRecord(value) &&
    typeof value.unit_id === "number" &&
    typeof value.name === "string"
  );
}

function normalizeAssignedAdmin(value: unknown): UnitAssignedAdmin | null {
  if (!isRecord(value)) {
    return null;
  }

  const name =
    typeof value.name === "string" && value.name.trim()
      ? value.name
      : typeof value.full_name === "string" && value.full_name.trim()
        ? value.full_name
        : typeof value.admin_name === "string" && value.admin_name.trim()
          ? value.admin_name
          : null;
  const email =
    typeof value.email === "string" && value.email.trim()
      ? value.email
      : typeof value.admin_email === "string" && value.admin_email.trim()
        ? value.admin_email
        : null;

  if (!name || !email) {
    return null;
  }

  return {
    id:
      typeof value.id === "number"
        ? value.id
        : typeof value.user_id === "number"
          ? value.user_id
          : typeof value.admin_id === "number"
            ? value.admin_id
            : undefined,
    name,
    email,
    role:
      typeof value.role === "string" && value.role.trim()
        ? value.role
        : typeof value.role_name === "string" && value.role_name.trim()
          ? value.role_name
          : "Unit Admin",
    status:
      typeof value.status === "string" && value.status.trim()
        ? value.status
        : typeof value.membership_status === "string" && value.membership_status.trim()
          ? value.membership_status
          : "Active",
    last_active:
      typeof value.last_active === "string" && value.last_active.trim()
        ? value.last_active
        : typeof value.lastActive === "string" && value.lastActive.trim()
          ? value.lastActive
          : typeof value.updated_at === "string" && value.updated_at.trim()
            ? value.updated_at
            : "Recently active",
  };
}

async function buildUnitsRequestHeaders(includeJsonBody = false) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (includeJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = await getValidOnboardingAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function normalizePagination(value: unknown, count: number): TenantUnitsPagination {
  const record = isRecord(value) ? value : {};
  const page = Number(record.page ?? 1);
  const pageSize = Number(record.pageSize ?? count ?? 0);
  const total = Number(record.total ?? count ?? 0);
  const totalPages = Number(
    record.totalPages ?? (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1),
  );

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize >= 0 ? pageSize : 0,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    hasNext: Boolean(record.hasNext),
    hasPrevious: Boolean(record.hasPrevious),
  };
}

function normalizeEnvelope(payload: ApiEnvelope): TenantUnitsResponse {
  const resultsArray = Array.isArray(payload.results) ? payload.results : null;
  const directResultsData =
    resultsArray && resultsArray.every((item) => isUnitListItem(item))
      ? (resultsArray as TenantUnitListItem[])
      : null;
  const resultWrapper =
    resultsArray && !directResultsData
      ? resultsArray.find((item) => isRecord(item))
      : undefined;
  const wrapperRecord = isRecord(resultWrapper) ? resultWrapper : undefined;
  const dataSource = directResultsData ?? wrapperRecord?.data ?? payload.data;
  const metaRecord = isRecord(wrapperRecord?.meta) ? wrapperRecord.meta : {};
  const paginationRecord = isRecord(metaRecord.pagination) ? metaRecord.pagination : {};
  const data = Array.isArray(dataSource) ? (dataSource as TenantUnitListItem[]) : [];
  const count = Number(payload.count ?? paginationRecord.total ?? data.length);
  const emptyState = isRecord(metaRecord.emptyState)
    ? (metaRecord.emptyState as TenantUnitsEmptyState)
    : null;
  const planUsage = isRecord(wrapperRecord?.planUsage)
    ? (wrapperRecord.planUsage as TenantUnitsPlanUsage)
    : isRecord(payload.planUsage)
      ? (payload.planUsage as TenantUnitsPlanUsage)
      : null;

  return {
    count: Number.isFinite(count) ? count : data.length,
    next: typeof payload.next === "string" ? payload.next : null,
    previous: typeof payload.previous === "string" ? payload.previous : null,
    data,
    meta: {
      pagination: normalizePagination(paginationRecord, data.length),
      filters: metaRecord.filters,
      emptyState,
      query: metaRecord.query,
    },
    planUsage,
  };
}

function extractApiErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) {
    return fallback;
  }

  const directMessage =
    typeof payload.message === "string" && payload.message.trim()
      ? payload.message.trim()
      : typeof payload.detail === "string" && payload.detail.trim()
        ? payload.detail.trim()
        : null;

  if (directMessage) {
    return directMessage;
  }

  const errors = payload.errors;
  if (Array.isArray(errors)) {
    const firstError = errors.find(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
    if (typeof firstError === "string") {
      return firstError.trim();
    }
  }

  if (isRecord(errors)) {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (typeof first === "string" && first.trim()) {
          return first.trim();
        }
      }

      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === "string" && first.trim()) {
        return first.trim();
      }
    }
  }

  return fallback;
}

function normalizeArchiveBlockers(value: unknown): UnitArchiveBlocker[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value
    .map((item) => {
      if (typeof item === "string" && item.trim()) {
        return { title: item.trim() };
      }

      if (!isRecord(item)) {
        return null;
      }

      const title =
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : typeof item.label === "string" && item.label.trim()
            ? item.label.trim()
            : typeof item.message === "string" && item.message.trim()
              ? item.message.trim()
              : typeof item.code === "string" && item.code.trim()
                ? item.code.trim()
                : null;

      if (!title) {
        return null;
      }

      const rawMessage =
        typeof item.message === "string" && item.message.trim() ? item.message.trim() : undefined;
      const message =
        rawMessage &&
        rawMessage.localeCompare(title, undefined, { sensitivity: "accent" }) !== 0
          ? rawMessage
          : undefined;

      return {
        code: typeof item.code === "string" && item.code.trim() ? item.code.trim() : undefined,
        title,
        message,
      } satisfies UnitArchiveBlocker;
    })
    .filter((item): item is UnitArchiveBlocker => item !== null);

  const seen = new Set<string>();
  return normalized.filter((item) => {
    const key = `${item.code ?? ""}::${item.title.toLowerCase()}::${item.message?.toLowerCase() ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export async function getTenantUnits(params: {
  page?: number;
  search?: string;
  ordering?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.page && params.page > 0) {
    searchParams.set("page", String(params.page));
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.ordering?.trim()) {
    searchParams.set("ordering", params.ordering.trim());
  }

  const query = searchParams.toString();
  const response = await fetch(`/api/units${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: await buildUnitsRequestHeaders(),
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiEnvelope;

  if (!response.ok) {
    return {
      success: false as const,
      message:
        typeof payload.message === "string" && payload.message.trim()
          ? payload.message
          : "Unable to load units right now.",
    };
  }

  return {
    success: true as const,
    data: normalizeEnvelope(payload),
  };
}

export async function getTenantUnitsOverview() {
  const response = await fetch("/api/units/overview", {
    method: "GET",
    headers: await buildUnitsRequestHeaders(),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    data?: {
      summaryCards?: TenantUnitOverviewSummaryCards;
      featuredUnits?: TenantUnitListItem[];
    };
    meta?: unknown;
    planUsage?: TenantUnitsPlanUsage | null;
    message?: string;
    detail?: string;
  };

  if (!response.ok) {
    return {
      success: false as const,
      message:
        body.message?.trim() ||
        body.detail?.trim() ||
        "Unable to load unit overview right now.",
    };
  }

  return {
    success: true as const,
    data: {
      data: {
        summaryCards: body.data?.summaryCards ?? {
          totalUnits: 0,
          activeUnits: 0,
          draftUnits: 0,
          archivedUnits: 0,
        },
        featuredUnits: Array.isArray(body.data?.featuredUnits) ? body.data.featuredUnits : [],
      },
      meta: body.meta ?? null,
      planUsage: body.planUsage ?? null,
    } satisfies TenantUnitsOverviewResponse,
  };
}

export async function createTenantUnit(payload: CreateTenantUnitPayload) {
  const response = await fetch("/api/units", {
    method: "POST",
    headers: await buildUnitsRequestHeaders(true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    data?: TenantUnitDetail;
    message?: string;
    detail?: string;
  };

  if (!response.ok) {
    return {
      success: false as const,
      message:
        body.message?.trim() ||
        body.detail?.trim() ||
        "Unable to create unit right now.",
    };
  }

  return {
    success: true as const,
    data: body.data,
  };
}

export async function getTenantUnitDetail(unitId: number) {
  const response = await fetch(`/api/units/${unitId}`, {
    method: "GET",
    headers: await buildUnitsRequestHeaders(),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    data?: TenantUnitDetail;
    message?: string;
    detail?: string;
  };

  if (!response.ok) {
    return {
      success: false as const,
      message:
        body.message?.trim() ||
        body.detail?.trim() ||
        "Unable to load unit details right now.",
    };
  }

  return {
    success: true as const,
    data: body.data,
  };
}

export async function updateTenantUnit(
  unitId: number,
  payload: UpdateTenantUnitPayload,
  method: "PUT" | "PATCH" = "PATCH",
) {
  const response = await fetch(`/api/units/${unitId}`, {
    method,
    headers: await buildUnitsRequestHeaders(true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    data?: TenantUnitDetail;
    message?: string;
    detail?: string;
  };

  if (!response.ok) {
    return {
      success: false as const,
      status: response.status,
      message:
        body.message?.trim() ||
        body.detail?.trim() ||
        "Unable to update unit right now.",
    };
  }

  return {
    success: true as const,
    data: body.data,
  };
}

export async function getUnitAdminCandidates(organizationId: number) {
  const response = await fetch(
    `/api/unit-admin-candidates?organizationId=${encodeURIComponent(String(organizationId))}`,
    {
      method: "GET",
      headers: await buildUnitsRequestHeaders(),
      cache: "no-store",
    },
  );

  const body = (await response.json()) as {
    results?: UnitAdminCandidate[];
    meta?: {
      note?: string | null;
      accepted_invite_count?: number;
      organization_id?: number;
    };
    message?: string;
  };

  if (!response.ok) {
    return {
      success: false as const,
      message:
        body.message?.trim() || "Unable to load unit admin candidates right now.",
    };
  }

  return {
    success: true as const,
    data: {
      results: Array.isArray(body.results) ? body.results : [],
      note: body.meta?.note ?? "",
    },
  };
}

export async function getAssignedUnitAdmins(unitId: number) {
  const response = await fetch(`/api/units/${unitId}/admins`, {
    method: "GET",
    headers: await buildUnitsRequestHeaders(),
    cache: "no-store",
  });

  const body = (await response.json()) as {
    data?: unknown;
    meta?: {
      emptyState?: {
        title?: string;
        message?: string;
      } | null;
    } | null;
    message?: string;
  };

  if (!response.ok) {
    return {
      success: false as const,
      message:
        body.message?.trim() || "Unable to load assigned unit admins right now.",
    };
  }

  const admins = Array.isArray(body.data)
    ? body.data
        .map((item) => normalizeAssignedAdmin(item))
        .filter((item): item is UnitAssignedAdmin => item !== null)
    : [];

  return {
    success: true as const,
    data: {
      results: admins,
      emptyState: body.meta?.emptyState ?? null,
    },
  };
}

export async function assignUnitAdmin(unitId: number, payload: { user_id: number }) {
  const response = await fetch(`/api/units/${unitId}/admins/assign`, {
    method: "POST",
    headers: await buildUnitsRequestHeaders(true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = (await response.json()) as { message?: string };

  if (!response.ok) {
    return {
      success: false as const,
      message: body.message?.trim() || "Unable to assign unit admin right now.",
    };
  }

  return { success: true as const };
}

export async function reassignUnitAdmin(unitId: number, payload: Record<string, unknown>) {
  const response = await fetch(`/api/units/${unitId}/admins/reassign`, {
    method: "POST",
    headers: await buildUnitsRequestHeaders(true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = (await response.json()) as { message?: string };

  if (!response.ok) {
    return {
      success: false as const,
      message: body.message?.trim() || "Unable to reassign unit admin right now.",
    };
  }

  return { success: true as const };
}

export async function removeUnitAdmin(unitId: number, payload: { user_id: number }) {
  const response = await fetch(`/api/units/${unitId}/admins/remove`, {
    method: "POST",
    headers: await buildUnitsRequestHeaders(true),
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = (await response.json()) as { message?: string };

  if (!response.ok) {
    return {
      success: false as const,
      message: body.message?.trim() || "Unable to remove unit admin right now.",
    };
  }

  return { success: true as const };
}

export async function archiveUnit(
  unitId: number,
  payload: { reason: string; confirm: boolean; last_updated_at?: string },
) {
  let effectivePayload = payload;

  if (!effectivePayload.last_updated_at) {
    const detailResult = await getTenantUnitDetail(unitId);
    if (detailResult.success && detailResult.data?.updated_at) {
      effectivePayload = {
        ...effectivePayload,
        last_updated_at: detailResult.data.updated_at,
      };
    }
  }

  const response = await fetch(`/api/units/${unitId}/archive`, {
    method: "POST",
    headers: await buildUnitsRequestHeaders(true),
    body: JSON.stringify(effectivePayload),
    cache: "no-store",
  });
  const body = (await response.json()) as {
    code?: string;
    message?: string;
    detail?: string;
    errors?: unknown;
    actionHint?: string | null;
    blockers?: unknown;
    data?: TenantUnitDetail;
    [key: string]: unknown;
  };

  if (!response.ok) {
    return {
      success: false as const,
      code: body.code,
      message: extractApiErrorMessage(body, "Unable to archive unit right now."),
      actionHint:
        typeof body.actionHint === "string" && body.actionHint.trim()
          ? body.actionHint.trim()
          : null,
      blockers: normalizeArchiveBlockers(body.blockers),
    };
  }

  return { success: true as const, data: body.data };
}
