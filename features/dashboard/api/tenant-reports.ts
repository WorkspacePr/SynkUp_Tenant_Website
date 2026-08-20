import { formatApiError } from "@/lib/api/errors";
import { apiEndpoints } from "@/lib/api/endpoints";
import { getValidOnboardingAccessToken } from "@/lib/auth/tenant-session";

export type TenantReportType = "attendance_summary" | "audience_report" | "unit_overview" | "user_roster";
export type TenantReportScope = "organization" | "unit" | "audience";
export type TenantReportStatus = "expired" | "failed" | "generating" | "ready";

export type TenantReport = {
  report_id: number;
  name: string;
  report_type: TenantReportType;
  scope: TenantReportScope;
  unit: number | null;
  audience: number | null;
  filters: Record<string, unknown> | null;
  requested_format: "csv";
  status: TenantReportStatus;
  file_name: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  generated_by: number;
  generated_by_username: string;
  safe_failure_message: string | null;
  download_url: string | null;
  download_eligible: boolean;
};

export type GetTenantReportsParams = {
  generated_after?: string;
  generated_before?: string;
  generated_by?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
  report_type?: TenantReportType;
  search?: string;
  status?: TenantReportStatus;
};

export type CreateTenantReportPayload = {
  report_type: TenantReportType;
  scope: TenantReportScope;
  name?: string;
  unit_id?: number;
  audience_id?: number;
  start_date?: string | null;
  end_date?: string | null;
  requested_format: "csv";
};

export type TenantReportsResponse = { count: number; next: string | null; previous: string | null; results: TenantReport[] };

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function isReport(value: unknown): value is TenantReport {
  return isRecord(value) && typeof value.report_id === "number" && typeof value.name === "string" && typeof value.report_type === "string" && typeof value.status === "string" && typeof value.created_at === "string";
}
function findReport(value: unknown): TenantReport | null {
  if (isReport(value)) return value;
  if (!isRecord(value)) return null;
  for (const child of Object.values(value)) { const report = findReport(child); if (report) return report; }
  return null;
}
function findReports(value: unknown): TenantReportsResponse {
  if (!isRecord(value)) return { count: 0, next: null, previous: null, results: [] };
  if (Array.isArray(value.results)) {
    const reports = value.results.map(findReport).filter((item): item is TenantReport => item !== null);
    if (reports.length || value.results.length === 0) return { count: typeof value.count === "number" ? value.count : reports.length, next: typeof value.next === "string" ? value.next : null, previous: typeof value.previous === "string" ? value.previous : null, results: reports };
  }
  for (const child of Object.values(value)) { const response = findReports(child); if (response.results.length) return response; }
  return { count: 0, next: null, previous: null, results: [] };
}
async function headers(json = false) { const value = new Headers({ Accept: "application/json" }); const token = await getValidOnboardingAccessToken(); if (token) value.set("Authorization", `Bearer ${token}`); if (json) value.set("Content-Type", "application/json"); return value; }
async function read(response: Response) { return response.json().catch(() => ({})) as Promise<unknown>; }

export async function getTenantReports(params: GetTenantReportsParams = {}) {
  const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") query.set(key, String(value)); });
  try { const response = await fetch(`${apiEndpoints.tenantReports}${query.size ? `?${query}` : ""}`, { headers: await headers(), cache: "no-store" }); const body = await read(response); return response.ok ? { success: true as const, data: findReports(body) } : { success: false as const, message: formatApiError(body, "Unable to load reports right now.") }; } catch { return { success: false as const, message: "Unable to load reports right now." }; }
}

export async function createTenantReport(payload: CreateTenantReportPayload) {
  try { const response = await fetch(apiEndpoints.tenantReports, { method: "POST", headers: await headers(true), body: JSON.stringify(payload), cache: "no-store" }); const body = await read(response); const report = findReport(body); return response.ok && report ? { success: true as const, data: report } : { success: false as const, message: response.ok ? "The server returned an invalid report record." : formatApiError(body, "Unable to request this report.") }; } catch { return { success: false as const, message: "Unable to request this report." }; }
}

export async function getTenantReport(reportId: number) {
  try { const response = await fetch(apiEndpoints.tenantReportDetail(reportId), { headers: await headers(), cache: "no-store" }); const body = await read(response); const report = findReport(body); return response.ok && report ? { success: true as const, data: report } : { success: false as const, message: response.ok ? "The server returned an invalid report record." : formatApiError(body, "Unable to load this report.") }; } catch { return { success: false as const, message: "Unable to load this report." }; }
}
