import { getValidOnboardingAccessToken } from "@/lib/auth/tenant-session";
import { formatApiError } from "@/lib/api/errors";

export type TenantUserRoleOption = {
  roleId: number;
  name: string;
};

export type TenantUserRole =
  | "audience_admin"
  | "read_only_admin"
  | "super_admin"
  | "unit_admin"
  | "user";

export type TenantUserStatus = "active" | "inactive";

export type TenantUserAccessStatus =
  | "no_email"
  | "pending_invitation"
  | "pending_setup"
  | "active"
  | "invitation_expired"
  | "disabled";

export type TenantUserOrdering =
  | "-date_added"
  | "-email"
  | "-full_name"
  | "-last_login"
  | "date_added"
  | "email"
  | "full_name"
  | "last_login";

export type TenantUserScope = {
  id: number;
  name: string;
};

export type TenantUserListItem = {
  id: number;
  full_name: string;
  email: string | null;
  matric_or_staff_id: string | null;
  unit: TenantUserScope | null;
  audiences: TenantUserScope[];
  role: TenantUserRole;
  status: TenantUserStatus;
  access_status?: TenantUserAccessStatus;
  login_enabled?: boolean;
  invitation?: {
    status?: "none" | "pending" | "sent" | "expired" | "revoked" | "failed";
    delivery_status?: string | null;
    sent_at?: string | null;
    expires_at?: string | null;
    accepted_at?: string | null;
  } | null;
  date_added: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
};

export type TenantUserAttendanceSummary = {
  sessions_attended: number;
  late_count: number;
  absences: number;
  last_attendance: string | null;
};

export type TenantUserRecentActivity = {
  id: number;
  title: string;
  timestamp: string;
};

export type TenantUserAvailableActions = {
  can_edit: boolean;
  can_transfer: boolean;
  can_deactivate: boolean;
  requires_reassignment_before_deactivation: boolean;
};

export type TenantUserDetail = TenantUserListItem & {
  attendance_summary: TenantUserAttendanceSummary;
  recent_activity: TenantUserRecentActivity[];
  available_actions: TenantUserAvailableActions;
};

export type UpdateTenantUserPayload = {
  full_name?: string;
  email?: string | null;
  matric_or_staff_id?: string;
  unit_id?: number;
  audience_ids?: number[];
  role?: TenantUserRole;
  status?: TenantUserStatus | "Active" | "Inactive";
  reason?: string;
};

export type ActivateTenantUserPayload = {
  reason?: string;
  replacement_admin_id?: number;
};

export type ActivateTenantUserResponse = {
  id: number;
  status: "active";
  activated_at: string | null;
  deactivated_at: string | null;
  message: string;
  history_preserved: boolean;
};

export type TenantUserInvitationStatusResponse = {
  access_status: TenantUserAccessStatus;
  login_enabled: boolean;
  invitation: {
    id: number;
    status: string;
    delivery_status: string | null;
    sent_at: string | null;
    expires_at: string | null;
    accepted_at: string | null;
  } | null;
};

export type TransferTenantUserPayload = {
  target_unit_id: number;
  audience_ids?: number[];
  reason?: string;
};

export type TransferTenantUserResponse = {
  id: number;
  full_name: string;
  previous_unit: TenantUserScope | null;
  new_unit: TenantUserScope | null;
  audiences_removed: unknown[];
  message: string;
};

export type TenantUserDuplicateCheckResponse = {
  email_available: boolean;
  matric_or_staff_id_available: boolean;
  conflicts: unknown[];
};

export type TenantUsersImportPreviewResponse = {
  import_id: string;
  total_rows: number;
  valid_count: number;
  flagged_count: number;
  rows: Array<Record<string, unknown>>;
};

export type TenantUsersImportConfirmResponse = {
  created_count: number;
  skipped_count: number;
  failed_count: number;
  created_users: TenantUserListItem[];
  report_url: string | null;
  invitation_eligible_count: number;
  invitations_queued_count: number;
  directory_only_count: number;
  existing_account_count: number;
};

export type TenantUsersOverviewResponse = {
  total_users: number;
  active_users: number;
  pending_access: number;
  no_email: number;
  creation_blocked?: boolean;
  upgrade_required?: boolean;
  suggested_action?: string | null;
  plan_usage: {
    used: number;
    limit: number;
    percentage: number;
    is_unlimited: boolean;
    creation_blocked?: boolean;
    upgrade_required?: boolean;
    suggested_action?: string | null;
  };
  total_active_users: number;
  new_registrations_this_week: number;
  unit_distribution: Array<Record<string, unknown>>;
};

export type TenantUsersBulkResultItem = {
  user_id?: number;
  id?: number;
  success?: boolean;
  status?: string;
  message?: string;
  error?: string;
};

export type TenantUsersBulkActionResponse = {
  message?: string;
  success_count?: number;
  failed_count?: number;
  processed_count?: number;
  results?: TenantUsersBulkResultItem[];
};

export type TenantUserAccountSetupResponse = {
  organization: unknown;
  email: string;
  status: string;
  expires_at: string;
  requires_password: boolean;
};

export type TenantUserAuditLog = {
  id: number | string;
  event: string;
  title: string;
  description: string | null;
  timestamp: string | null;
  actor: {
    id?: number;
    name: string;
    email?: string;
  } | null;
  status: string | null;
  metadata: Record<string, unknown>;
};

export type TenantUserAuditLogsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TenantUserAuditLog[];
};

export type CreateTenantUserPayload = {
  full_name: string;
  email: string;
  matric_or_staff_id: string;
  unit_id: number;
  initial_audience_ids?: number[];
  role?: TenantUserRole;
  status?: TenantUserStatus | "Active" | "Inactive";
  send_invitation?: boolean;
};

export type TenantUsersResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TenantUserListItem[];
};

export type GetTenantUsersParams = {
  audience_id?: number;
  ordering?: TenantUserOrdering;
  page?: number;
  page_size?: number;
  role?: TenantUserRole;
  search?: string;
  status?: TenantUserStatus;
  unit_id?: number;
};

async function buildUsersRequestHeaders() {
  const headers = new Headers({ Accept: "application/json" });
  const accessToken = await getValidOnboardingAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTenantUser(value: unknown): value is TenantUserListItem {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.full_name === "string" &&
    (typeof value.email === "string" || value.email === null)
  );
}

function isTenantUserDetail(value: unknown): value is TenantUserDetail {
  const record = isRecord(value) ? value : {};
  return (
    isTenantUser(value) &&
    isRecord(record.attendance_summary) &&
    Array.isArray(record.recent_activity) &&
    isRecord(record.available_actions)
  );
}

function findTenantUserDetail(payload: unknown): TenantUserDetail | null {
  const queue: unknown[] = [payload];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const candidate = queue.shift();
    if (!isRecord(candidate) || visited.has(candidate)) continue;
    visited.add(candidate);

    if (isTenantUserDetail(candidate)) return candidate;

    for (const value of Object.values(candidate)) {
      if (isRecord(value)) queue.push(value);
    }
  }

  return null;
}

function findPaginatedUsers(payload: unknown): TenantUsersResponse {
  const queue: unknown[] = [payload];
  const visited = new Set<unknown>();

  while (queue.length > 0) {
    const candidate = queue.shift();
    if (!isRecord(candidate) || visited.has(candidate)) {
      continue;
    }
    visited.add(candidate);

    const results = candidate.results;
    if (Array.isArray(results) && results.every(isTenantUser)) {
      return {
        count:
          typeof candidate.count === "number" ? candidate.count : results.length,
        next: typeof candidate.next === "string" ? candidate.next : null,
        previous:
          typeof candidate.previous === "string" ? candidate.previous : null,
        results,
      };
    }

    if (Array.isArray(results)) {
      queue.push(...results);
    }
    if (isRecord(candidate.data)) {
      queue.push(candidate.data);
    }
  }

  return { count: 0, next: null, previous: null, results: [] };
}

function getApiErrorMessage(payload: unknown, fallback: string) {
  return formatApiError(payload, fallback);
}

export async function getTenantUsers(params: GetTenantUsersParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  try {
    const query = searchParams.toString();
    const response = await fetch(`/api/users${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: await buildUsersRequestHeaders(),
      cache: "no-store",
    });
    const body: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to load users right now."),
      };
    }

    return {
      success: true as const,
      data: findPaginatedUsers(body),
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load users right now.",
    };
  }
}

export async function createTenantUser(payload: CreateTenantUserPayload) {
  try {
    const headers = await buildUsersRequestHeaders();
    headers.set("Content-Type", "application/json");
    const response = await fetch("/api/users", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const body: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to create user right now."),
      };
    }

    if (!isTenantUser(body)) {
      return {
        success: false as const,
        message: "The user was created, but the server returned an invalid user record.",
      };
    }

    return { success: true as const, data: body };
  } catch {
    return {
      success: false as const,
      message: "Unable to create user right now.",
    };
  }
}

export async function getTenantUser(userId: number) {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(String(userId))}`, {
      method: "GET",
      headers: await buildUsersRequestHeaders(),
      cache: "no-store",
    });
    const body: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to load this user right now."),
      };
    }
    const detail = findTenantUserDetail(body);
    if (!detail) {
      return {
        success: false as const,
        message: "The server returned an invalid user profile.",
      };
    }

    return { success: true as const, data: detail };
  } catch {
    return {
      success: false as const,
      message: "Unable to load this user right now.",
    };
  }
}

export async function updateTenantUser(
  userId: number,
  payload: UpdateTenantUserPayload,
  method: "PUT" | "PATCH" = "PATCH",
) {
  try {
    const headers = await buildUsersRequestHeaders();
    headers.set("Content-Type", "application/json");
    const response = await fetch(`/api/users/${encodeURIComponent(String(userId))}`, {
      method,
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const body: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to update this user right now."),
      };
    }
    const detail = findTenantUserDetail(body);
    if (!detail) {
      return {
        success: false as const,
        message: "The user was updated, but the server returned an invalid profile.",
      };
    }

    return { success: true as const, data: detail };
  } catch {
    return {
      success: false as const,
      message: "Unable to update this user right now.",
    };
  }
}

export async function activateTenantUser(
  userId: number,
  payload: ActivateTenantUserPayload = {},
) {
  try {
    const headers = await buildUsersRequestHeaders();
    headers.set("Content-Type", "application/json");
    const response = await fetch(
      `/api/users/${encodeURIComponent(String(userId))}/activate`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );
    const body: unknown = await response.json();

    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to activate this user right now."),
      };
    }

    return { success: true as const, data: body as ActivateTenantUserResponse };
  } catch {
    return {
      success: false as const,
      message: "Unable to activate this user right now.",
    };
  }
}

async function postTenantUserAction<T>(
  path: string,
  payload?: object,
) {
  try {
    const headers = await buildUsersRequestHeaders();
    if (payload) headers.set("Content-Type", "application/json");
    const response = await fetch(path, {
      method: "POST",
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
      cache: "no-store",
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      return {
        success: false as const,
        status: response.status,
        message: getApiErrorMessage(body, "Unable to complete this user action."),
        data: body,
      };
    }
    return { success: true as const, data: body as T };
  } catch {
    return {
      success: false as const,
      status: 0,
      message: "Unable to complete this user action.",
      data: null,
    };
  }
}

async function postTenantUsersBulkAction(
  action:
    | "send-invitations"
    | "resend-invitations"
    | "deactivate"
    | "assign-audience",
  payload: Record<string, unknown>,
) {
  return postTenantUserAction<TenantUsersBulkActionResponse>(
    `/api/users/bulk/${action}`,
    payload,
  );
}

export function bulkSendTenantUserInvitations(userIds: number[]) {
  return postTenantUsersBulkAction("send-invitations", { user_ids: userIds });
}

export function bulkResendTenantUserInvitations(userIds: number[]) {
  return postTenantUsersBulkAction("resend-invitations", { user_ids: userIds });
}

export function bulkDeactivateTenantUsers(
  userIds: number[],
  payload: { reason?: string; confirm_admins: boolean },
) {
  return postTenantUsersBulkAction("deactivate", {
    user_ids: userIds,
    ...payload,
  });
}

export function bulkAssignTenantUsersAudience(
  userIds: number[],
  audienceId: number,
) {
  return postTenantUsersBulkAction("assign-audience", {
    user_ids: userIds,
    audience_id: audienceId,
  });
}

export async function bulkExportTenantUsers(userIds: number[]) {
  try {
    const headers = await buildUsersRequestHeaders();
    headers.set("Content-Type", "application/json");
    const response = await fetch("/api/users/bulk/export", {
      method: "POST",
      headers,
      body: JSON.stringify({ user_ids: userIds }),
    });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => ({}));
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to export selected users."),
      };
    }
    return {
      success: true as const,
      data: await response.blob(),
      filename:
        response.headers
          .get("content-disposition")
          ?.match(/filename="?([^";]+)"?/i)?.[1] ?? "selected-users.csv",
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to export selected users.",
    };
  }
}

export function deactivateTenantUser(
  userId: number,
  payload: ActivateTenantUserPayload = {},
) {
  return postTenantUserAction<ActivateTenantUserResponse>(
    `/api/users/${encodeURIComponent(String(userId))}/deactivate`,
    payload,
  );
}

export function sendTenantUserInvitation(userId: number) {
  return postTenantUserAction<TenantUserInvitationStatusResponse>(
    `/api/users/${encodeURIComponent(String(userId))}/send-invitation`,
  );
}

export function resendTenantUserInvitation(userId: number) {
  return postTenantUserAction<TenantUserInvitationStatusResponse>(
    `/api/users/${encodeURIComponent(String(userId))}/resend-invitation`,
  );
}

export function revokeTenantUserInvitation(userId: number) {
  return postTenantUserAction<TenantUserInvitationStatusResponse>(
    `/api/users/${encodeURIComponent(String(userId))}/revoke-invitation`,
  );
}

export function transferTenantUser(
  userId: number,
  payload: TransferTenantUserPayload,
) {
  return postTenantUserAction<TransferTenantUserResponse>(
    `/api/users/${encodeURIComponent(String(userId))}/transfer`,
    payload,
  );
}

export async function getTenantUserInvitationStatus(userId: number) {
  try {
    const response = await fetch(
      `/api/users/${encodeURIComponent(String(userId))}/invitation-status`,
      {
        headers: await buildUsersRequestHeaders(),
        cache: "no-store",
      },
    );
    const body: unknown = await response.json();
    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to load invitation status."),
      };
    }
    return { success: true as const, data: body as TenantUserInvitationStatusResponse };
  } catch {
    return { success: false as const, message: "Unable to load invitation status." };
  }
}

function normalizeAuditLog(value: unknown, index: number): TenantUserAuditLog | null {
  if (!isRecord(value)) return null;
  const actorRecord = isRecord(value.actor) ? value.actor : null;
  const actorName =
    actorRecord && typeof actorRecord.name === "string"
      ? actorRecord.name
      : actorRecord && typeof actorRecord.full_name === "string"
        ? actorRecord.full_name
        : typeof value.actor_name === "string"
          ? value.actor_name
          : "";
  const event =
    typeof value.event === "string"
      ? value.event
      : typeof value.event_type === "string"
        ? value.event_type
        : typeof value.action === "string"
          ? value.action
          : typeof value.code === "string"
            ? value.code
            : typeof value.title === "string"
              ? value.title
              : "audit_event";

  return {
    id:
      typeof value.id === "number" || typeof value.id === "string"
        ? value.id
        : `${event}-${index}`,
    event,
    title: typeof value.title === "string" ? value.title : event,
    description:
      typeof value.description === "string"
        ? value.description
        : typeof value.message === "string"
          ? value.message
          : typeof value.reason === "string"
            ? value.reason
            : null,
    timestamp:
      typeof value.timestamp === "string"
        ? value.timestamp
        : typeof value.created_at === "string"
          ? value.created_at
          : null,
    actor: actorName
      ? {
          id:
            actorRecord && typeof actorRecord.id === "number"
              ? actorRecord.id
              : undefined,
          name: actorName,
          email:
            actorRecord && typeof actorRecord.email === "string"
              ? actorRecord.email
              : undefined,
        }
      : null,
    status:
      typeof value.status === "string"
        ? value.status
        : typeof value.outcome === "string"
          ? value.outcome
          : null,
    metadata: isRecord(value.metadata) ? value.metadata : {},
  };
}

export async function getTenantUserAuditLogs(
  userId: number,
  params: { page?: number; page_size?: number } = {},
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));

  try {
    const response = await fetch(
      `/api/users/${encodeURIComponent(String(userId))}/audit-logs${
        query.size ? `?${query}` : ""
      }`,
      {
        headers: await buildUsersRequestHeaders(),
        cache: "no-store",
      },
    );
    const body: unknown = await response.json();
    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to load audit logs."),
      };
    }

    const record = isRecord(body) ? body : {};
    const rawResults = Array.isArray(record.results)
      ? record.results
      : Array.isArray(record.data)
        ? record.data
        : [];
    const results = rawResults
      .map(normalizeAuditLog)
      .filter((item): item is TenantUserAuditLog => item !== null);

    return {
      success: true as const,
      data: {
        count: typeof record.count === "number" ? record.count : results.length,
        next: typeof record.next === "string" ? record.next : null,
        previous: typeof record.previous === "string" ? record.previous : null,
        results,
      } satisfies TenantUserAuditLogsResponse,
    };
  } catch {
    return { success: false as const, message: "Unable to load audit logs." };
  }
}

export async function checkTenantUserIdentity(params: {
  email?: string;
  matric_or_staff_id?: string;
  exclude_user_id?: number;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  try {
    const response = await fetch(`/api/users/duplicate-check?${query}`, {
      headers: await buildUsersRequestHeaders(),
      cache: "no-store",
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to check identity availability."),
      };
    }
    return { success: true as const, data: body as TenantUserDuplicateCheckResponse };
  } catch {
    return { success: false as const, message: "Unable to check identity availability." };
  }
}

export async function previewTenantUsersImport(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  try {
    const response = await fetch("/api/users/import/preview", {
      method: "POST",
      headers: await buildUsersRequestHeaders(),
      body: formData,
      cache: "no-store",
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to preview this CSV file."),
      };
    }
    return { success: true as const, data: body as TenantUsersImportPreviewResponse };
  } catch {
    return { success: false as const, message: "Unable to preview this CSV file." };
  }
}

export function confirmTenantUsersImport(importId: string, sendInvitations = false) {
  return postTenantUserAction<TenantUsersImportConfirmResponse>(
    "/api/users/import/confirm",
    { import_id: importId, send_invitations: sendInvitations },
  );
}

export async function getTenantUsersOverview(params: {
  audience_id?: number;
  role?: TenantUserRole;
  status?: TenantUserStatus;
  unit_id?: number;
} = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  try {
    const response = await fetch(`/api/users/overview${query.size ? `?${query}` : ""}`, {
      headers: await buildUsersRequestHeaders(),
      cache: "no-store",
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to load users overview."),
      };
    }
    return { success: true as const, data: body as TenantUsersOverviewResponse };
  } catch {
    return { success: false as const, message: "Unable to load users overview." };
  }
}

export async function inspectTenantUserAccountSetup(token: string) {
  const response = await fetch(`/api/users/account-setup/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  const body: unknown = await response.json();
  return response.ok
    ? { success: true as const, data: body as TenantUserAccountSetupResponse }
    : { success: false as const, message: getApiErrorMessage(body, "Invalid invitation.") };
}

export function completeTenantUserAccountSetup(
  token: string,
  payload: { password?: string; password_confirm?: string },
) {
  return postTenantUserAction<{
    message: string;
    invitation_id: number;
    organization_id: number;
    user_id: number;
    created_user: boolean;
  }>(`/api/users/account-setup/${encodeURIComponent(token)}`, payload);
}

export async function getTenantUserRoles(organizationId: number) {
  try {
    const response = await fetch(
      `/api/organizations/${encodeURIComponent(String(organizationId))}/onboarding/admin-invite-roles`,
      {
        method: "GET",
        headers: await buildUsersRequestHeaders(),
        cache: "no-store",
      },
    );

    const body = (await response.json()) as {
      results?: Array<{ role_id?: number; name?: string }>;
      message?: string;
      detail?: string;
    };

    if (!response.ok) {
      return {
        success: false as const,
        message: getApiErrorMessage(body, "Unable to load user roles right now."),
      };
    }

    const roles = (Array.isArray(body.results) ? body.results : [])
      .filter(
        (role): role is { role_id: number; name: string } =>
          typeof role.role_id === "number" &&
          typeof role.name === "string" &&
          Boolean(role.name.trim()),
      )
      .map((role) => ({ roleId: role.role_id, name: role.name.trim() }));

    return { success: true as const, data: roles };
  } catch {
    return {
      success: false as const,
      message: "Unable to load user roles right now.",
    };
  }
}
