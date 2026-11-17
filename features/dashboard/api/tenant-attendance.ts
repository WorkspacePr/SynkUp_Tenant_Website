import { formatApiError } from "@/lib/api/errors";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getValidOnboardingAccessToken } from "@/lib/auth/tenant-session";

export type TenantAttendanceStatus =
  | "active"
  | "completed"
  | "locked"
  | "archived"
  | "draft"
  | "scheduled"
  | "cancelled";

export type TenantAttendanceSession = {
  id: string;
  organization: number;
  unit: { id: number; name: string };
  audience: { id: number; name: string };
  created_by: { id: number; display_name: string };
  name: string;
  scheduled_date: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  actual_started_at: string | null;
  actual_ended_at: string | null;
  late_allowance_minutes: number;
  eligibility_rule: Record<string, unknown>;
  qr_refresh_interval_seconds: number;
  status: TenantAttendanceStatus;
  is_archived: boolean;
  locked_at: string | null;
  version: number;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  actions: {
    edit?: boolean;
    start?: boolean;
    extend?: boolean;
    adjust_late_allowance?: boolean;
    complete?: boolean;
    lock?: boolean;
    archive?: boolean;
    cancel?: boolean;
    view_attendance?: boolean;
  };
  present: number;
  eligible: number;
  flags: number;
};

export type TenantAttendanceSessionPage = {
  results: TenantAttendanceSession[];
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
};

export type TenantAttendanceOverview = {
  total_sessions: number;
  active_sessions: number;
  flagged_attendance_records: number;
  validation_mode: string;
  validation_description: string;
  average_attendance_rate: number;
};

export type TenantSessionAttendanceSummary = {
  eligible_count: number;
  checked_in_count: number;
  present_count: number;
  late_count: number;
  flagged_count: number;
  rejected_scan_count: number;
  attendance_percentage: number;
  last_updated_at: string;
};

export type TenantSessionAttendanceRecord = {
  id: string | null;
  user_name: string;
  member_id: string | null;
  check_in_time: string | null;
  status: "Present" | "Late" | "Flagged" | "Absent";
  method: string | null;
  notes: string | null;
};

export type TenantSessionAttendancePage = {
  results: TenantSessionAttendanceRecord[];
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  eligible_count: number;
};

type SessionListParams = {
  search?: string;
  unit_id?: number;
  audience_id?: number;
  status?: TenantAttendanceStatus;
  flag_state?: "all" | "flagged" | "clear";
  page?: number;
  page_size?: number;
  date_from?: string;
  date_to?: string;
};

type AttendanceFilters = Pick<SessionListParams, "search" | "unit_id" | "audience_id" | "status" | "flag_state">;

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.size ? `?${query.toString()}` : "";
}

async function authHeaders() {
  const headers = new Headers({ Accept: "application/json" });
  const token = await getValidOnboardingAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function jsonRequest<T>(path: string, fallback: string) {
  try {
    const response = await fetch(path, { headers: await authHeaders(), cache: "no-store" });
    const body: unknown = await response.json().catch(() => ({}));
    if (!response.ok) return { success: false as const, message: formatApiError(body, fallback) };
    const envelope = body as { data?: T };
    if (!envelope || typeof envelope !== "object" || !envelope.data) {
      return { success: false as const, message: "The server returned an invalid attendance response." };
    }
    return { success: true as const, data: envelope.data };
  } catch {
    return { success: false as const, message: fallback };
  }
}

async function jsonMutation<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  payload: unknown,
  fallback: string,
) {
  try {
    const headers = await authHeaders();
    headers.set("Content-Type", "application/json");
    const response = await fetch(path, {
      method,
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const body: unknown = await response.json().catch(() => ({}));
    if (!response.ok) return { success: false as const, message: formatApiError(body, fallback) };
    const envelope = body as { data?: T };
    if (!envelope || typeof envelope !== "object" || !envelope.data) {
      return { success: false as const, message: "The server returned an invalid session response." };
    }
    return { success: true as const, data: envelope.data };
  } catch {
    return { success: false as const, message: fallback };
  }
}

export function getTenantAttendanceSessions(params: SessionListParams = {}) {
  return jsonRequest<TenantAttendanceSessionPage>(
    `${apiEndpoints.tenantAttendanceSessions}${buildQuery(params)}`,
    "Unable to load attendance sessions right now.",
  );
}

export async function getTenantAttendanceSession(sessionId: string) {
  const result = await jsonRequest<Omit<TenantAttendanceSession, "status" | "present" | "eligible" | "flags"> & {
    status: string;
    present?: number;
    eligible?: number;
    flags?: number;
  }>(
    apiEndpoints.tenantAttendanceSessionDetail(sessionId),
    "Unable to load the attendance session right now.",
  );
  if (!result.success) return result;

  const statusAliases: Record<string, TenantAttendanceStatus> = {
    LIVE: "active",
    SCHEDULED: "scheduled",
    DRAFT: "draft",
    COMPLETED: "completed",
    LOCKED: "locked",
    ARCHIVED: "archived",
    CANCELLED: "cancelled",
  };
  const normalizedStatus = statusAliases[result.data.status.toUpperCase()];

  return {
    success: true as const,
    data: {
      ...result.data,
      status: normalizedStatus ?? "draft",
      present: result.data.present ?? 0,
      eligible: result.data.eligible ?? 0,
      flags: result.data.flags ?? 0,
    } satisfies TenantAttendanceSession,
  };
}

export type CreateTenantSessionPayload = {
  audience_id: number;
  name: string;
  scheduled_date: string;
  scheduled_start_at: string;
  scheduled_end_at: string;
  late_allowance_minutes: number;
  eligibility_rule: Record<string, unknown>;
  qr_refresh_interval_seconds: number;
};

export function createTenantAttendanceSession(payload: CreateTenantSessionPayload) {
  return jsonMutation<TenantAttendanceSession>(
    apiEndpoints.tenantAttendanceSessions,
    "POST",
    payload,
    "Unable to create the session right now.",
  );
}

export type TenantSessionAction = "start" | "complete" | "lock" | "archive" | "cancel";

export function performTenantSessionAction(
  sessionId: string,
  action: TenantSessionAction,
  version: number,
  reason = "",
) {
  return jsonMutation<TenantAttendanceSession>(
    apiEndpoints.tenantAttendanceSessionAction(sessionId, action),
    "POST",
    { version, ...(reason ? { reason } : {}) },
    `Unable to ${action} the session right now.`,
  );
}

export type TenantSessionQr = {
  token?: string;
  qr_token?: string;
  qr_code?: string;
  qr_image?: string;
  expires_at?: string;
  session_code?: string;
};

export function getTenantSessionQr(sessionId: string) {
  return jsonRequest<TenantSessionQr>(
    apiEndpoints.tenantAttendanceSessionQr(sessionId),
    "Unable to load the session QR code right now.",
  );
}

export function getTenantAttendanceOverview(params: AttendanceFilters = {}) {
  return jsonRequest<TenantAttendanceOverview>(
    `${apiEndpoints.tenantAttendanceOverview}${buildQuery(params)}`,
    "Unable to load the attendance overview right now.",
  );
}

export function getTenantSessionAttendanceSummary(sessionId: string) {
  return jsonRequest<TenantSessionAttendanceSummary>(
    apiEndpoints.tenantSessionAttendanceSummary(sessionId),
    "Unable to load the session attendance summary.",
  );
}

export function getTenantSessionAttendance(
  sessionId: string,
  params: { page?: number; page_size?: number } = {},
) {
  return jsonRequest<TenantSessionAttendancePage>(
    `${apiEndpoints.tenantSessionAttendance(sessionId)}${buildQuery(params)}`,
    "Unable to load attendance records for this session.",
  );
}

export async function exportTenantSessionAttendance(sessionId: string) {
  try {
    const response = await fetch(apiEndpoints.tenantSessionAttendanceExport(sessionId), {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => ({}));
      return { success: false as const, message: formatApiError(body, "Unable to export session attendance.") };
    }
    const filename = response.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/i)?.[1] ?? `attendance-${sessionId}.csv`;
    return { success: true as const, data: await response.blob(), filename };
  } catch {
    return { success: false as const, message: "Unable to export session attendance." };
  }
}
