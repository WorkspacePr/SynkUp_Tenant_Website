import { formatApiError } from "@/lib/api/errors";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getValidOnboardingAccessToken } from "@/lib/auth/tenant-session";

export type DashboardPeriod = {
  start: string;
  end: string;
  days: number;
};

export type DashboardRateMetric = {
  available: boolean;
  value: number | null;
  numerator: number | null;
  denominator: number | null;
  period: DashboardPeriod;
  change_vs_previous_period: number | null;
  change_unit: "percentage_points" | string;
  unavailable_reason: string | null;
  definition?: string;
  pending_count?: number;
  flagged_duplicate_count?: number;
};

export type SuperAdminDashboardResponse = {
  scope: {
    type: "organization" | "unit";
    organization_id: number;
    unit_id: number | null;
  };
  timezone: string;
  generated_at: string;
  dashboard_period: DashboardPeriod;
  summary_metrics: {
    subscription: {
      available: boolean;
      status: string | null;
      plan_name: string | null;
    };
    invitation_acceptance_rate: DashboardRateMetric;
    attendance_dispute_rate: DashboardRateMetric;
    duplicate_attendance_rate: DashboardRateMetric;
    late_sync_rate: DashboardRateMetric;
    failed_qr_validation_rate: DashboardRateMetric;
  };
  system_health: {
    state: "healthy" | "attention" | "critical";
    summary: string;
    attention_count: number;
    unhealthy_services: Array<{
      service: string;
      status: string;
      last_checked: string;
    }>;
  };
  attention_queue: Array<{
    id: string;
    severity: "warning" | "critical";
    title: string;
    description: string;
    timestamp: string;
    action_type: string | null;
    reference: Record<string, string | number> | null;
  }>;
  attendance_trend: Array<{
    date: string;
    eligible_count: number;
    present_count: number;
    attendance_rate: number;
  }>;
  unit_performance: Array<{
    unit_id: number;
    unit_name: string;
    eligible_count: number;
    present_count: number;
    attendance_rate: number;
  }>;
  sessions: Array<{
    session_id: string;
    name: string;
    unit_name: string;
    audience_name: string;
    start_time: string;
    end_time: string;
    present_count: number;
    eligible_count: number;
    status: "active" | "upcoming";
  }>;
  recent_activity: Array<{
    log_id: number;
    event: string;
    actor: string | null;
    target: string | null;
    subject_type: string | null;
    scope: {
      unit_id: number | null;
      unit_name: string | null;
      audience_id: number | null;
      audience_name: string | null;
    };
    timestamp: string;
    outcome: string | null;
    tone: "positive" | "negative" | "warning" | null;
  }>;
};

export type SuperAdminDashboardParams =
  | { scope?: "organization"; unitId?: never }
  | { scope: "unit"; unitId: number };

export async function getSuperAdminDashboard(
  params: SuperAdminDashboardParams = {},
) {
  const query = new URLSearchParams();
  if (params.scope === "unit") {
    query.set("scope", "unit");
    query.set("unit_id", String(params.unitId));
  }

  try {
    const headers = new Headers({ Accept: "application/json" });
    const token = await getValidOnboardingAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const suffix = query.size ? `?${query.toString()}` : "";
    const response = await fetch(
      `${apiEndpoints.tenantSuperAdminDashboard}${suffix}`,
      { headers, cache: "no-store" },
    );
    const body: unknown = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false as const,
        status: response.status,
        message: formatApiError(body, "Unable to load the Super Admin dashboard."),
      };
    }

    const envelope = body as {
      success?: boolean;
      data?: SuperAdminDashboardResponse;
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
      message: "Unable to load the Super Admin dashboard right now.",
    };
  }
}
