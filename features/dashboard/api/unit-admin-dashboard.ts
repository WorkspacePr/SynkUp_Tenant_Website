import { formatApiError } from "@/lib/api/errors";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getValidOnboardingAccessToken } from "@/lib/auth/tenant-session";

export type UnitAdminDashboardResponse = {
  generated_at: string;
  timezone: string;
  reporting_period: {
    current_start: string;
    current_end: string;
    previous_start: string;
    previous_end: string;
    days: number;
  };
  scope: {
    tenant_id: number;
    tenant_name: string;
    unit_id: number | null;
    unit_name: string | null;
    is_aggregate: boolean;
    accessible_units: Array<{ id: number; name: string }>;
  };
  summary: {
    total_audiences: number;
    total_members: number;
    active_sessions: number;
    upcoming_sessions: number;
    completed_sessions: number;
    attendance_rate: number;
  };
  attendance: {
    present: number;
    late: number;
    absent: number;
    excused: number;
    total_expected: number;
    rate: number;
    comparison: {
      previous_rate: number;
      change: number;
      direction: "up" | "down" | "flat";
    };
  };
  session_activity: {
    active: number;
    upcoming: number;
    completed: number;
    cancelled: number;
    recent_sessions: Array<{
      id: string;
      name: string;
      audience_id: number;
      audience_name: string;
      unit_id: number;
      unit_name: string;
      starts_at: string;
      ends_at: string;
      status: string;
      expected_count: number;
      present_count: number;
      late_count: number;
      absent_count: number;
      attendance_rate: number;
    }>;
  };
  audiences: {
    total: number;
    active: number;
    inactive: number;
    items: Array<{
      id: number;
      name: string;
      audience_type: string;
      unit_id: number;
      unit_name: string;
      expected_members: number | null;
      member_count: number;
      upcoming_sessions: number;
      last_session_at: string | null;
      last_attendance_rate: number | null;
    }>;
  };
  attendance_trend: Array<{
    period: string;
    label: string;
    present: number;
    late: number;
    absent: number;
    rate: number;
  }>;
  attention_required: Array<{
    id: string;
    type: string;
    severity: "warning" | "critical";
    title: string;
    description: string;
    unit_id: number;
    audience_id: number | null;
    session_id: string | null;
    occurred_at: string;
    action_url: string | null;
  }>;
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    actor_name: string | null;
    unit_id: number;
    audience_id: number | null;
    session_id: string | null;
    occurred_at: string;
  }>;
};

export async function getUnitAdminDashboard(unitId?: number) {
  const query = new URLSearchParams();
  if (unitId) query.set("unit_id", String(unitId));

  try {
    const headers = new Headers({ Accept: "application/json" });
    const token = await getValidOnboardingAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const suffix = query.size ? `?${query.toString()}` : "";
    const response = await fetch(
      `${apiEndpoints.tenantUnitAdminDashboard}${suffix}`,
      { headers, cache: "no-store" },
    );
    const rawBody = await response.text();
    let body: unknown = {};
    if (rawBody.trim()) {
      try {
        body = JSON.parse(rawBody) as unknown;
      } catch {
        body = { message: `The dashboard API returned HTTP ${response.status}.` };
      }
    }

    if (!response.ok) {
      return {
        success: false as const,
        status: response.status,
        message: formatApiError(
          body,
          `Unable to load the Unit Admin dashboard (HTTP ${response.status}).`,
        ),
      };
    }

    const envelope = body as {
      success?: boolean;
      data?: UnitAdminDashboardResponse;
    };
    if (!envelope.success || !envelope.data) {
      return {
        success: false as const,
        status: response.status,
        message: "The server returned an invalid dashboard response.",
      };
    }

    return { success: true as const, data: envelope.data };
  } catch {
    return {
      success: false as const,
      status: 0,
      message: "Unable to load the Unit Admin dashboard right now.",
    };
  }
}
