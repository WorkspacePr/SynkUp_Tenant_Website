"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CloudUpload,
  Download,
  Eye,
  FileText,
  Grid2X2,
  List,
  LoaderCircle,
  Mail,
  MoreVertical,
  CircleHelp,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Clock3,
  UserX,
  UserPlus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DashboardToast,
  type DashboardToastTone,
} from "@/components/ui/DashboardToast";
import { getTenantUnits } from "@/features/dashboard/api/tenant-units";
import {
  activateTenantUser,
  bulkAssignTenantUsersAudience,
  bulkDeactivateTenantUsers,
  bulkExportTenantUsers,
  bulkResendTenantUserInvitations,
  bulkSendTenantUserInvitations,
  checkTenantUserIdentity,
  deactivateTenantUser,
  createTenantUser,
  confirmTenantUsersImport,
  getTenantUser,
  getTenantUserAuditLogs,
  getTenantUserInvitationStatus,
  getTenantUserRoles,
  getTenantUsers,
  getTenantUsersOverview,
  previewTenantUsersImport,
  resendTenantUserInvitation,
  revokeTenantUserInvitation,
  sendTenantUserInvitation,
  transferTenantUser,
  updateTenantUser,
  type TenantUserAccessStatus,
  type TenantUserAvailableActions,
  type TenantUserAttendanceSummary,
  type TenantUserAuditLogsResponse,
  type TenantUserDetail,
  type TenantUserInvitationStatusResponse,
  type TenantUserListItem,
  type TenantUserRecentActivity,
  type TenantUserRole,
  type TenantUserRoleOption,
  type TenantUserStatus,
  type TenantUsersImportConfirmResponse,
  type TenantUsersOverviewResponse,
} from "@/features/dashboard/api/tenant-users";
import { readTenantLoginContext } from "@/lib/auth/tenant-session";
import {
  formatDate,
  formatDateTime,
  formatDataValue,
  formatDisplayLabel,
  formatNumber,
} from "@/lib/formatters";
import { cn } from "@/utils";
import { CompactSelect } from "../cards/ShowcaseParts";
import {
  AvatarSeed,
  DashboardDataTable,
  DetailMetricCard,
  InlineNotice,
  PaginationControl,
  TableFilterBar,
} from "../units/shared";
import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";

type UserRecord = {
  id: number;
  name: string;
  email: string;
  matricOrStaffId: string;
  unit_id: number | null;
  unit: string;
  audience_ids: number[];
  audiences: string[];
  role: TenantUserRole;
  status: TenantUserStatus;
  accessStatus: TenantUserAccessStatus;
  loginEnabled: boolean;
  invitation: UserInvitation | null;
  dateAdded: string;
  lastLogin: string | null;
  attendanceSummary: TenantUserAttendanceSummary | null;
  recentActivity: TenantUserRecentActivity[];
  availableActions: TenantUserAvailableActions | null;
};

type ImportRow = {
  name: string;
  identity: string;
  email: string;
  unit: string;
  audience: string;
  status: "VALID" | "FLAGGED";
  reason?: string;
};

type UserInvitation = {
  status: "none" | "pending" | "sent" | "expired" | "revoked" | "failed";
  deliveryStatus: string | null;
  sentAt: string | null;
  expiresAt: string | null;
  acceptedAt: string | null;
};

type UserAccessScope = "organization" | "unit" | "audience";

type ToastNotice = {
  tone: DashboardToastTone;
  title: string;
  description: string;
};

const modalButtonClassName =
  "min-h-11 w-full rounded-xl px-5 py-3 text-sm sm:w-auto sm:min-w-28";

function isAdministrativeRole(role: string) {
  const normalizedRole = role.trim().toLowerCase();
  return ["admin", "owner", "manager"].some((term) =>
    normalizedRole.includes(term),
  );
}

function displayUserIdentity(user: UserRecord) {
  return user.email || user.matricOrStaffId || "—";
}

function displayUserRole(role: TenantUserRole) {
  return formatDisplayLabel(role);
}

function toUserRecord(user: TenantUserListItem): UserRecord {
  const hasEmail = Boolean(user.email?.trim());
  const detail = user as Partial<TenantUserDetail>;
  const accessStatus =
    user.access_status ?? (hasEmail ? "pending_setup" : "no_email");

  return {
    id: user.id,
    name: user.full_name,
    email: user.email ?? "",
    matricOrStaffId: user.matric_or_staff_id ?? "",
    unit_id: user.unit?.id ?? null,
    unit: user.unit?.name ?? "Unassigned",
    audience_ids: user.audiences.map((item) => item.id),
    audiences: user.audiences.map((item) => item.name),
    role: user.role,
    status: user.status,
    accessStatus,
    loginEnabled: user.login_enabled ?? accessStatus === "active",
    invitation: normalizeInvitation(user.invitation, hasEmail),
    dateAdded: formatDate(user.date_added),
    lastLogin: user.last_login ? formatDateTime(user.last_login) : null,
    attendanceSummary: detail.attendance_summary ?? null,
    recentActivity: detail.recent_activity ?? [],
    availableActions: detail.available_actions ?? null,
  };
}

function normalizeInvitation(
  invitation: TenantUserListItem["invitation"],
  hasEmail: boolean,
): UserInvitation | null {
  if (!hasEmail) return null;
  if (!invitation) {
    return {
      status: "pending",
      deliveryStatus: null,
      sentAt: null,
      expiresAt: "Aug. 1, 2026",
      acceptedAt: null,
    };
  }

  return {
    status: invitation.status ?? "pending",
    deliveryStatus: invitation.delivery_status ?? null,
    sentAt: invitation.sent_at ? formatDateTime(invitation.sent_at) : null,
    expiresAt: invitation.expires_at ? formatDateTime(invitation.expires_at) : null,
    acceptedAt: invitation.accepted_at
      ? formatDateTime(invitation.accepted_at)
      : null,
  };
}

function applyInvitationStatus(
  user: UserRecord,
  response: TenantUserInvitationStatusResponse,
): UserRecord {
  const allowedStatuses: UserInvitation["status"][] = [
    "none",
    "pending",
    "sent",
    "expired",
    "revoked",
    "failed",
  ];
  const status = response.invitation?.status?.toLowerCase();

  return {
    ...user,
    accessStatus: response.access_status,
    loginEnabled: response.login_enabled,
    invitation: response.invitation
      ? {
          status: allowedStatuses.includes(status as UserInvitation["status"])
            ? (status as UserInvitation["status"])
            : "pending",
          deliveryStatus: response.invitation.delivery_status || null,
          sentAt: response.invitation.sent_at
            ? formatDateTime(response.invitation.sent_at)
            : null,
          expiresAt: response.invitation.expires_at
            ? formatDateTime(response.invitation.expires_at)
            : null,
          acceptedAt: response.invitation.accepted_at
            ? formatDateTime(response.invitation.accepted_at)
            : null,
        }
      : null,
  };
}

function StatusPill({ status }: { status: TenantUserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[10px] font-bold",
        status === "active"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
      )}
    >
      {status.toUpperCase()}
    </span>
  );
}

function displayAccessStatus(status: TenantUserAccessStatus) {
  return {
    no_email: "NO EMAIL",
    pending_invitation: "PENDING INVITE",
    pending_setup: "PENDING SETUP",
    active: "LOGIN ACTIVE",
    invitation_expired: "INVITE EXPIRED",
    disabled: "LOGIN DISABLED",
  }[status];
}

function AccessStatusPill({ status }: { status: TenantUserAccessStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[10px] font-bold",
        status === "active"
          ? "bg-teal-50 text-primary dark:bg-primary/15 dark:text-teal-300"
          : status === "no_email" || status === "disabled"
            ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            : status === "invitation_expired"
              ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
      )}
    >
      {displayAccessStatus(status)}
    </span>
  );
}

function DeliveryStatusPill({ status }: { status: string | null | undefined }) {
  const normalized = status?.trim().toLowerCase() || "not_sent";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase",
        normalized === "delivered"
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : normalized === "failed" || normalized === "bounced"
            ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
            : normalized === "sent"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
      )}
    >
      {formatDisplayLabel(normalized)}
    </span>
  );
}

function AudienceTags({
  audiences,
  compact = false,
}: {
  audiences: string[];
  compact?: boolean;
}) {
  if (!audiences.length)
    return <span className="text-slate-400 dark:text-slate-500">N/A</span>;
  const visible = audiences.slice(0, compact ? 3 : 1);
  const remainder = audiences.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((audience) => (
        <span
          key={audience}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          {audience}
        </span>
      ))}
      {remainder > 0 ? (
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          + {remainder} Others
        </span>
      ) : null}
    </div>
  );
}

function AddUserModal({
  darkMode,
  onClose,
  onAdd,
  onViewProfile,
  initialUser,
  unitOptions,
  audienceOptions,
}: {
  darkMode: boolean;
  onClose: () => void;
  onAdd: (user: UserRecord) => UserRecord | null | Promise<UserRecord | null>;
  onViewProfile?: (user: UserRecord) => void;
  initialUser?: UserRecord;
  unitOptions: Array<{ id: number; name: string }>;
  audienceOptions: Array<{ id: number; name: string }>;
}) {
  const editing = Boolean(initialUser);
  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [identity, setIdentity] = useState(initialUser?.matricOrStaffId ?? "");
  const [emailError, setEmailError] = useState("");
  const [identityError, setIdentityError] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [identityAvailable, setIdentityAvailable] = useState(false);
  const [checkingField, setCheckingField] = useState<
    "email" | "identity" | null
  >(null);
  const [role, setRole] = useState(initialUser?.role ?? "");
  const [unit, setUnit] = useState(
    initialUser?.unit_id === null || initialUser?.unit_id === undefined
      ? ""
      : String(initialUser.unit_id),
  );
  const [audienceIds, setAudienceIds] = useState<string[]>(
    initialUser?.audience_ids.map(String) ?? [],
  );
  const initialScope: UserAccessScope =
    initialUser?.role === "super_admin" || initialUser?.role === "read_only_admin"
      ? "organization"
      : initialUser?.role === "audience_admin" || initialUser?.audience_ids.length
        ? "audience"
        : "unit";
  const [accessScope, setAccessScope] =
    useState<UserAccessScope>(initialScope);
  const [status, setStatus] = useState<TenantUserStatus>(
    initialUser?.status ?? "active",
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserRecord | null>(null);
  const [roleOptions, setRoleOptions] = useState<TenantUserRoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");
  const [roleRequestKey, setRoleRequestKey] = useState(0);
  const normalizedRole = role
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_") as TenantUserRole;
  const allowedScopes: UserAccessScope[] =
    normalizedRole === "super_admin" || normalizedRole === "read_only_admin"
      ? ["organization"]
      : normalizedRole === "unit_admin"
        ? ["unit"]
        : normalizedRole === "audience_admin"
          ? ["audience"]
          : ["unit", "audience"];
  const hasError = (value: string) => submitted && !value.trim();
  const fieldClass = (invalid = false) =>
    cn(
      "mt-2 min-h-12 w-full rounded-2xl border px-4 py-3 text-sm font-normal outline-none transition",
      invalid
        ? "border-red-500"
        : darkMode
          ? "border-slate-700 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900",
    );
  const selectButtonClass = (invalid = false) =>
    cn(
      "min-h-12 w-full justify-between rounded-2xl border px-4 py-3 text-sm font-normal shadow-none",
      invalid
        ? "border-red-500"
        : darkMode
          ? "border-slate-700 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700",
    );

  useEffect(() => {
    let active = true;

    async function loadRoles() {
      setRolesLoading(true);
      setRolesError("");

      const organizationId = readTenantLoginContext()?.organizationId;
      if (!organizationId) {
        if (active) {
          setRolesLoading(false);
          setRolesError("Unable to identify the current organization.");
        }
        return;
      }

      const result = await getTenantUserRoles(organizationId);
      if (!active) return;

      setRolesLoading(false);
      if (!result.success) {
        setRolesError(result.message);
        return;
      }

      const nextOptions = [...result.data];
      if (
        initialUser?.role &&
        !nextOptions.some(
          (option) =>
            option.name.toLowerCase().replaceAll(" ", "_") ===
            initialUser.role.toLowerCase(),
        )
      ) {
        nextOptions.unshift({
          roleId: 0,
          name: displayUserRole(initialUser.role),
        });
      }
      setRoleOptions(nextOptions);
    }

    void loadRoles();
    return () => {
      active = false;
    };
  }, [initialUser?.role, roleRequestKey]);

  function resetForm() {
    setName("");
    setEmail("");
    setIdentity("");
    setEmailError("");
    setIdentityError("");
    setEmailAvailable(false);
    setIdentityAvailable(false);
    setRole("");
    setUnit("");
    setAudienceIds([]);
    setStatus("active");
    setSubmitted(false);
    setCreatedUser(null);
  }

  async function validateIdentityField(field: "email" | "identity") {
    const setAvailable =
      field === "email" ? setEmailAvailable : setIdentityAvailable;
    setAvailable(false);

    if (field === "email" && !email.trim()) {
      setEmailError("Email is required.");
      return false;
    }
    if (
      field === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setEmailError("Enter a valid email address.");
      return false;
    }
    if (field === "identity" && !identity.trim()) return false;

    setCheckingField(field);
    const result = await checkTenantUserIdentity({
      email: field === "email" ? email.trim() : undefined,
      matric_or_staff_id: field === "identity" ? identity.trim() : undefined,
      exclude_user_id: initialUser?.id,
    });
    setCheckingField(null);

    if (!result.success) {
      const setter = field === "email" ? setEmailError : setIdentityError;
      setter(result.message);
      return false;
    }

    const available =
      field === "email"
        ? result.data.email_available
        : result.data.matric_or_staff_id_available;
    const setter = field === "email" ? setEmailError : setIdentityError;
    setter(
      available
        ? ""
        : field === "email"
          ? "This email address is already in use."
          : "This user ID/staff ID is already in use.",
    );
    setAvailable(available);
    return available;
  }

  async function handleSubmit() {
    setSubmitted(true);
    if (
      !name.trim() ||
      !email.trim() ||
      !identity.trim() ||
      !role.trim() ||
      !unit ||
      (accessScope === "audience" && audienceIds.length === 0)
    )
      return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    const hasEmail = Boolean(email.trim());
    const emailChanged = initialUser?.email !== email.trim();
    const nextAccessStatus = !hasEmail
      ? "no_email"
      : editing && !emailChanged
        ? (initialUser?.accessStatus ?? "pending_setup")
        : "pending_invitation";
    const selectedUnit = unitOptions.find(
      (option) => String(option.id) === unit,
    );
    const selectedAudiences = audienceOptions.filter((option) =>
      audienceIds.includes(String(option.id)),
    );
    if (!selectedUnit) return;

    const user: UserRecord = {
      id: initialUser?.id ?? Date.now(),
      name: name.trim(),
      email: email.trim(),
      matricOrStaffId: identity.trim(),
      unit_id: selectedUnit.id,
      unit: selectedUnit.name,
      audience_ids:
        accessScope === "audience"
          ? selectedAudiences.map((option) => option.id)
          : [],
      audiences:
        accessScope === "audience"
          ? selectedAudiences.map((option) => option.name)
          : [],
      role: role.trim().toLowerCase().replaceAll(" ", "_") as TenantUserRole,
      status,
      accessStatus: nextAccessStatus,
      loginEnabled: hasEmail && nextAccessStatus !== "disabled",
      invitation:
        hasEmail && editing && !emailChanged
          ? (initialUser?.invitation ?? null)
          : hasEmail
            ? {
                status: "pending",
                deliveryStatus: null,
                sentAt: null,
                expiresAt: "Aug. 1, 2026",
                acceptedAt: null,
              }
            : null,
      dateAdded: initialUser?.dateAdded ?? "Jul. 23, 2026",
      lastLogin: initialUser?.lastLogin ?? null,
      attendanceSummary: initialUser?.attendanceSummary ?? null,
      recentActivity: initialUser?.recentActivity ?? [],
      availableActions: initialUser?.availableActions ?? null,
    };
    setSubmitting(true);
    setSubmitError("");
    const availability = await checkTenantUserIdentity({
      email: email.trim() || undefined,
      matric_or_staff_id: identity.trim(),
      exclude_user_id: initialUser?.id,
    });
    if (!availability.success) {
      setSubmitting(false);
      setSubmitError(availability.message);
      return;
    }
    if (
      !availability.data.email_available ||
      !availability.data.matric_or_staff_id_available
    ) {
      setSubmitting(false);
      setEmailError(
        availability.data.email_available
          ? ""
          : "This email address is already in use.",
      );
      setIdentityError(
        availability.data.matric_or_staff_id_available
          ? ""
          : "This user ID/staff ID is already in use.",
      );
      return;
    }
    const savedUser = await onAdd(user);
    setSubmitting(false);
    if (!savedUser) {
      setSubmitError(
        "Unable to save this user. Review the details and try again.",
      );
      return;
    }
    setCreatedUser(savedUser);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 backdrop-blur-sm sm:px-4"
      onMouseDown={onClose}
    >
      <Card
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-170 overflow-y-auto rounded-[24px] border p-4 sm:rounded-[28px] sm:p-6",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            {!createdUser ? (
              <>
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit User" : "Add User"}
                </h2>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {editing
                    ? "Update this user's profile, role, primary unit, audience assignment, and account status."
                    : "Create a new user and assign their role and primary unit."}
                </p>
              </>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${editing ? "edit" : "add"} user dialog`}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
              darkMode
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {!createdUser ? (
          <>
            <div
              className={cn(
                "mt-4 border-t pt-6",
                darkMode ? "border-slate-800" : "border-slate-100",
              )}
            >
              <div className="grid gap-5">
                <label className="text-sm font-semibold">
                  Full name <span className="text-red-600">*</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={fieldClass(hasError(name))}
                  />
                  {hasError(name) ? (
                    <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-red-600 dark:text-red-400">
                      This field is required
                    </span>
                  ) : null}
                </label>
                <label className="text-sm font-semibold">
                  Email <span className="text-red-600">*</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                      setEmailAvailable(false);
                    }}
                    onBlur={() => void validateIdentityField("email")}
                    placeholder="j.doe@synkup.com"
                    required
                    className={fieldClass(
                      hasError(email) || Boolean(emailError),
                    )}
                  />
                  {emailError ? (
                    <span className="mt-2 block text-sm font-normal text-red-600 dark:text-red-400">
                      {emailError}
                    </span>
                  ) : hasError(email) ? (
                    <span className="mt-2 block text-sm font-normal text-red-600 dark:text-red-400">
                      Email is required.
                    </span>
                  ) : checkingField === "email" ? (
                    <span className="mt-2 flex items-center gap-1.5 text-xs font-normal text-slate-500">
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      Checking email availability…
                    </span>
                  ) : emailAvailable ? (
                    <span className="mt-2 flex items-center gap-1.5 text-sm font-normal text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      Email address is available.
                    </span>
                  ) : (
                    <span className="mt-2 block text-xs font-normal leading-5 text-slate-500 dark:text-slate-400">
                      Used for account setup invitations and login access.
                    </span>
                  )}
                </label>
                <label className="text-sm font-semibold">
                  User ID / Staff ID <span className="text-red-600">*</span>
                  <input
                    value={identity}
                    onChange={(e) => {
                      setIdentity(e.target.value);
                      setIdentityError("");
                      setIdentityAvailable(false);
                    }}
                    onBlur={() => void validateIdentityField("identity")}
                    placeholder="USR/201406"
                    className={fieldClass(hasError(identity) || Boolean(identityError))}
                  />
                  {identityError ? (
                    <span className="mt-2 block text-sm font-normal text-red-600 dark:text-red-400">
                      {identityError}
                    </span>
                  ) : hasError(identity) ? (
                    <span className="mt-2 block text-sm font-normal normal-case tracking-normal text-red-600 dark:text-red-400">
                      This field is required
                    </span>
                  ) : checkingField === "identity" ? (
                    <span className="mt-2 flex items-center gap-1.5 text-xs font-normal text-slate-500">
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      Checking user ID/staff ID availability…
                    </span>
                  ) : identityAvailable ? (
                    <span className="mt-2 flex items-center gap-1.5 text-sm font-normal text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" />
                      User ID/staff ID is available.
                    </span>
                  ) : null}
                </label>
                <div>
                  <div className="text-sm font-semibold">
                    Role <span className="text-red-600">*</span>
                  </div>
                  <CompactSelect
                    value={role}
                    onChange={(value) => {
                      setRole(value);
                      const nextRole = value
                        .trim()
                        .toLowerCase()
                        .replaceAll(" ", "_");
                      const nextScope: UserAccessScope =
                        nextRole === "super_admin" ||
                        nextRole === "read_only_admin"
                          ? "organization"
                          : nextRole === "audience_admin"
                            ? "audience"
                            : "unit";
                      setAccessScope(nextScope);
                      if (nextScope !== "audience") setAudienceIds([]);
                    }}
                    options={[
                      {
                        label: rolesLoading
                          ? "Loading roles..."
                          : "Select a role",
                        value: "",
                      },
                      ...roleOptions.map((option) => ({
                        label: option.name,
                        value: option.name
                          .trim()
                          .toLowerCase()
                          .replaceAll(" ", "_"),
                      })),
                    ]}
                    className="mt-2 w-full"
                    buttonClassName={selectButtonClass(hasError(role))}
                    darkMode={darkMode}
                    disabled={rolesLoading || Boolean(rolesError)}
                  />
                  {hasError(role) ? (
                    <span className="mt-2 block text-sm text-red-600 dark:text-red-400">
                      Select a role
                    </span>
                  ) : null}
                  {rolesError ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-red-600 dark:text-red-400">
                      <span>{rolesError}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setRoleRequestKey((current) => current + 1)
                        }
                        className="font-semibold text-primary underline underline-offset-4 dark:text-teal-300"
                      >
                        Retry
                      </button>
                    </div>
                  ) : null}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    Access scope <span className="text-red-600">*</span>
                  </div>
                  <CompactSelect
                    value={accessScope}
                    onChange={(value) => {
                      const nextScope = value as UserAccessScope;
                      setAccessScope(nextScope);
                      if (nextScope !== "audience") setAudienceIds([]);
                    }}
                    options={allowedScopes.map((scope) => ({
                      label:
                        scope === "organization"
                          ? "Organisation-wide"
                          : scope === "unit"
                            ? "Assigned unit"
                            : "Specific audiences",
                      value: scope,
                    }))}
                    className="mt-2 w-full"
                    buttonClassName={selectButtonClass()}
                    darkMode={darkMode}
                    disabled={!role || allowedScopes.length === 1}
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {accessScope === "organization"
                      ? "Access applies across the organisation. The unit remains the user's primary directory unit."
                      : accessScope === "unit"
                        ? "Access is restricted to the selected unit."
                        : "Access is restricted to the selected audience assignments."}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    Unit <span className="text-red-600">*</span>
                  </div>
                  <CompactSelect
                    value={unit}
                    onChange={(value) => {
                      setUnit(value);
                      setAudienceIds([]);
                    }}
                    options={[
                      { label: "Select a unit", value: "" },
                      ...unitOptions.map((option) => ({
                        label: option.name,
                        value: String(option.id),
                      })),
                    ]}
                    className="mt-2 w-full"
                    buttonClassName={selectButtonClass(hasError(unit))}
                    darkMode={darkMode}
                  />
                  {hasError(unit) ? (
                    <span className="mt-2 block text-sm text-red-600 dark:text-red-400">
                      This field is required
                    </span>
                  ) : null}
                </div>
                {accessScope === "audience" ? (
                  <div>
                    <div className="text-sm font-semibold">
                      Audience scopes <span className="text-red-600">*</span>
                    </div>
                    <div
                      className={cn(
                        "mt-2 grid gap-2 rounded-2xl border p-3",
                        submitted && audienceIds.length === 0
                          ? "border-red-500"
                          : darkMode
                            ? "border-slate-700 bg-slate-900"
                            : "border-slate-200 bg-white",
                      )}
                    >
                      {audienceOptions.length > 0 ? (
                        audienceOptions.map((option) => {
                          const value = String(option.id);
                          return (
                            <label
                              key={option.id}
                              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium"
                            >
                              <input
                                type="checkbox"
                                checked={audienceIds.includes(value)}
                                onChange={(event) =>
                                  setAudienceIds((current) =>
                                    event.target.checked
                                      ? [...current, value]
                                      : current.filter((item) => item !== value),
                                  )
                                }
                                className="accent-primary"
                              />
                              {option.name}
                            </label>
                          );
                        })
                      ) : (
                        <span className="text-sm text-slate-500">
                          No audience scopes are available for this unit.
                        </span>
                      )}
                    </div>
                    {submitted && audienceIds.length === 0 ? (
                      <span className="mt-2 block text-sm text-red-600 dark:text-red-400">
                        Select at least one audience scope
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div>
                  <div className="text-sm font-semibold">Account status</div>
                  <button
                    type="button"
                    onClick={() =>
                      setStatus((current) =>
                        current === "active" ? "inactive" : "active",
                      )
                    }
                    className="mt-3 flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        "font-semibold",
                        status === "active" ? "text-primary" : "text-slate-400",
                      )}
                    >
                      Active
                    </span>
                    <span
                      className={cn(
                        "relative h-7 w-14 rounded-full transition",
                        status === "active" ? "bg-primary" : "bg-slate-400",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 h-5 w-5 rounded-full bg-slate-800 transition",
                          status === "active" ? "left-1" : "left-8",
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        status === "inactive"
                          ? "text-primary"
                          : "text-slate-400",
                      )}
                    >
                      Inactive
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {submitError ? (
              <InlineNotice
                tone="danger"
                title="Unable to save user"
                body={submitError}
              />
            ) : null}

            <div
              className={cn(
                "mt-6 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end",
                darkMode ? "border-slate-800" : "border-slate-100",
              )}
            >
              <Button
                variant="outline"
                className={modalButtonClassName}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className={modalButtonClassName}
                disabled={
                  submitting ||
                  Boolean(checkingField) ||
                  rolesLoading ||
                  (!editing && Boolean(rolesError))
                }
                onClick={handleSubmit}
              >
                {submitting
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Add User"}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-22 w-22 items-center justify-center rounded-full bg-[#16a394] text-white shadow-[0_24px_60px_-28px_rgba(22,163,148,0.55)]">
              <Check className="h-11 w-11" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">
              {editing
                ? "User Updated Successfully"
                : "User Created Successfully"}
            </h2>
            <p
              className={cn(
                "mx-auto mt-3 max-w-md text-sm leading-6",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              <strong>
                {createdUser.name} ({displayUserIdentity(createdUser)})
              </strong>{" "}
              {editing ? "has been updated in" : "has been added to"}{" "}
              <strong className="uppercase text-primary">
                {createdUser.unit}
              </strong>
              .
            </p>
            <InlineNotice
              tone="warning"
              title={
                createdUser.accessStatus === "no_email"
                  ? "Directory-only user created"
                  : "Login access is pending setup"
              }
              body={
                createdUser.accessStatus === "no_email"
                  ? "This user can be assigned to units, audiences, attendance, and reports, but login is disabled until an email is added."
                  : `A single-use setup invitation is ready for ${createdUser.email}. The user must create their own password before login is active.`
              }
            />
            <div
              className={cn(
                "mt-8 rounded-[24px] border p-5 text-left shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)]",
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-100 bg-white",
              )}
            >
              <div className="flex justify-between">
                <div className="flex flex-wrap gap-2">
                  <StatusPill status={createdUser.status} />
                  <AccessStatusPill status={createdUser.accessStatus} />
                </div>
                <MoreVertical className="h-5 w-5" />
              </div>
              <div className="mt-4 text-2xl font-bold">{createdUser.name}</div>
              <div className="mt-5 grid grid-cols-2 gap-5">
                <div>
                  <div className="font-bold uppercase text-slate-500 dark:text-slate-400">
                    Unit
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {createdUser.unit}
                  </div>
                </div>
                <div>
                  <div className="font-bold uppercase text-slate-500 dark:text-slate-400">
                    Role
                  </div>
                  <div className="mt-1 text-lg font-semibold capitalize">
                    {(createdUser.role).replaceAll("_", " ")}
                  </div>
                </div>
              </div>
              {createdUser.role.toLowerCase().includes("audience admin") ? (
                <>
                  <div className="mt-6 font-bold uppercase text-slate-500 dark:text-slate-400">
                    Initial audience
                  </div>
                  <div className="mt-2">
                    <AudienceTags audiences={createdUser.audiences} compact />
                  </div>
                </>
              ) : null}
              {createdUser.invitation ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
                  Invitation expires{" "}
                  {createdUser.invitation.expiresAt ?? "after 72 hours"} and can
                  only be used once.
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className={modalButtonClassName}
                onClick={() => {
                  onViewProfile?.(createdUser);
                  onClose();
                }}
              >
                View Profile
              </Button>
              <Button className={modalButtonClassName} onClick={onClose}>
                Done
              </Button>
            </div>
            {!editing ? (
              <button
                type="button"
                onClick={resetForm}
                className="mt-4 font-semibold text-primary"
              >
                Add another user
              </button>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function prepareUserImportFile(file: File, text: string) {
  const rows = parseCsv(text);
  if (!rows.length) return file;

  const normalizedHeaders = rows[0].map((header) =>
    header.toLowerCase().replace(/[\s_/-]/g, ""),
  );
  const identityHeaderIndex = normalizedHeaders.findIndex((header) =>
    [
      "useridstaffid",
      "userstaffid",
      "userid",
      "employeeid",
      "staffid",
      "matricstaffid",
      "matricno",
    ].includes(header),
  );

  if (identityHeaderIndex < 0) return file;

  // The API currently expects this canonical header. Keep the downloaded
  // template organization-neutral and translate only at the request boundary.
  rows[0][identityHeaderIndex] = "Matric/Staff ID";
  const escapeCell = (value: string) =>
    /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  const normalizedCsv = rows
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");

  return new File([normalizedCsv], file.name, {
    type: file.type || "text/csv",
    lastModified: file.lastModified,
  });
}

function ImportUsersModal({
  darkMode,
  existingUsers,
  onClose,
  onImport,
}: {
  darkMode: boolean;
  existingUsers: UserRecord[];
  onClose: () => void;
  onImport: (users: UserRecord[]) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [importId, setImportId] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [fileStatus, setFileStatus] = useState<
    "idle" | "validating" | "ready" | "error"
  >("idle");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSendingImportInvitations, setIsSendingImportInvitations] =
    useState(false);
  const [queuedInvitationCount, setQueuedInvitationCount] = useState(0);
  const [invitationsQueued, setInvitationsQueued] = useState(false);
  const [createdUsers, setCreatedUsers] = useState<TenantUserListItem[]>([]);
  const [importReport, setImportReport] =
    useState<TenantUsersImportConfirmResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const validRows = rows.filter((row) => row.status === "VALID");
  const flaggedRows = rows.filter((row) => row.status === "FLAGGED");
  const invitationEligibleRows = validRows.filter((row) => row.email);
  const directoryOnlyRows = validRows.filter((row) => !row.email);
  const duplicateRows = flaggedRows.filter((row) =>
    row.reason?.toLowerCase().includes("duplicate"),
  );
  const isPreparingFile = fileStatus === "validating";

  function formatFileSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  function clearFile() {
    setFile(null);
    setFileStatus("idle");
    setImportId("");
    setRows([]);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(nextFile?: File) {
    setError("");
    if (!nextFile) return;
    setFile(nextFile);
    setFileStatus("validating");
    setImportId("");
    setRows([]);
    const extension = nextFile.name.split(".").pop()?.toLowerCase();
    if (extension === "xlsx" || extension === "xls") {
      setError(
        "Excel files are not supported for this import. Export or save the workbook as a CSV file, then upload the CSV.",
      );
      setFileStatus("error");
      return;
    }
    if (!nextFile.name.toLowerCase().endsWith(".csv")) {
      setError("Unsupported file type. Please select a CSV file.");
      setFileStatus("error");
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setError("The CSV file must be 5MB or smaller.");
      setFileStatus("error");
      return;
    }
    try {
      const sourceText = await nextFile.text();
      const normalizedFile = prepareUserImportFile(
        nextFile,
        sourceText,
      );
      const sourceRows = parseCsv(sourceText);
      const sourceHeaders =
        sourceRows[0]?.map((header) =>
          header.trim().toLowerCase().replace(/[^a-z0-9]/g, ""),
        ) ?? [];
      const sourceValue = (
        rowIndex: number,
        aliases: string[],
      ) => {
        const columnIndex = sourceHeaders.findIndex((header) =>
          aliases.includes(header),
        );
        return columnIndex >= 0
          ? (sourceRows[rowIndex + 1]?.[columnIndex]?.trim() ?? "")
          : "";
      };
      const preview = await previewTenantUsersImport(normalizedFile);
      if (!preview.success) {
        setError(preview.message);
        setFileStatus("error");
        return;
      }
      const text = (value: unknown) =>
        typeof value === "string" ? value : "";
      const imported = preview.data.rows.map((row, rowIndex): ImportRow => {
        const nestedRow =
          (row.data && typeof row.data === "object" ? row.data : null) ||
          (row.raw_data && typeof row.raw_data === "object"
            ? row.raw_data
            : null) ||
          (row.normalized_data && typeof row.normalized_data === "object"
            ? row.normalized_data
            : null);
        const unitValue =
          row.unit ??
          row.unit_name ??
          (nestedRow && "unit" in nestedRow ? nestedRow.unit : undefined) ??
          (nestedRow && "unit_name" in nestedRow
            ? nestedRow.unit_name
            : undefined);
        const audienceValue =
          row.audience ??
          row.audience_name ??
          (nestedRow && "audience" in nestedRow
            ? nestedRow.audience
            : undefined) ??
          (nestedRow && "audience_name" in nestedRow
            ? nestedRow.audience_name
            : undefined);
        const unit =
          text(unitValue) ||
          (unitValue && typeof unitValue === "object" && "name" in unitValue
            ? text(unitValue.name)
            : "") ||
          sourceValue(rowIndex, ["unit", "unitname"]);
        const audience =
          text(audienceValue) ||
          (audienceValue &&
          typeof audienceValue === "object" &&
          "name" in audienceValue
            ? text(audienceValue.name)
            : "") ||
          sourceValue(rowIndex, ["audience", "audiencename"]);
        const reason =
          text(row.reason) ||
          (Array.isArray(row.errors) ? row.errors.map(String).join(", ") : "");
        const valid =
          row.valid === true || text(row.status).toLowerCase() === "valid";
        return {
          name: text(row.full_name) || text(row.name),
          identity: text(row.matric_or_staff_id) || text(row.identity),
          email: text(row.email),
          unit,
          audience,
          status: valid && !reason ? "VALID" : "FLAGGED",
          reason: reason || undefined,
        };
      });
      setImportId(preview.data.import_id);
      setRows(imported);
      setFileStatus("ready");
    } catch {
      setError("We couldn't read this CSV file. Please replace it and try again.");
      setFileStatus("error");
    }
  }

  function downloadCsv(filename: string, content: string) {
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadReport() {
    if (importReport?.report_url) {
      const link = document.createElement("a");
      link.href = importReport.report_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
      return;
    }

    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    downloadCsv(
      "synkup-user-import-report.csv",
      [
        "Name,User ID/Staff ID,Email,Unit,Audience,Status,Reason",
        ...rows.map((row) =>
          [
            row.name,
            row.identity,
            row.email,
            row.unit,
            row.audience,
            row.status,
            row.reason ?? "",
          ]
            .map(escape)
            .join(","),
        ),
      ].join("\n"),
    );
  }

  async function finishImport() {
    if (!importId) return;
    setIsConfirming(true);
    setError("");
    try {
      const confirmation = await confirmTenantUsersImport(importId, false);
      if (!confirmation.success) {
        setError(confirmation.message);
        return;
      }
      setCreatedUsers(confirmation.data.created_users);
      setImportReport(confirmation.data);
      onImport(confirmation.data.created_users.map(toUserRecord));
      setStep(3);
    } finally {
      setIsConfirming(false);
    }
  }

  const steps = ["Upload", "Preview", "Import Report"];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 backdrop-blur-sm sm:px-4"
      onMouseDown={onClose}
    >
      <Card
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full overflow-y-auto rounded-[24px] border p-4 transition-[max-width] sm:rounded-[28px] sm:p-6",
          step === 1 ? "max-w-200" : "max-w-[1080px]",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b pb-4",
            darkMode ? "border-slate-800" : "border-slate-100",
          )}
        >
          <h2 className="text-xl font-semibold">Import Users from CSV</h2>
          <button
            type="button"
            aria-label="Close import dialog"
            onClick={onClose}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className="mt-5 flex items-center"
          aria-label={`Import step ${step} of ${steps.length}`}
        >
          {steps.map((label, index) => {
            const number = index + 1;
            const complete = step > number;
            const active = step === number;
            return (
              <div
                key={label}
                className="flex min-w-0 flex-1 items-center last:flex-none"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                    complete
                      ? "border-green-600 bg-green-600 text-white"
                      : active
                        ? "border-primary text-primary"
                        : "border-slate-400 bg-slate-400 text-white",
                  )}
                >
                  {complete ? <Check className="h-4 w-4" /> : number}
                </span>
                <span
                  className={cn(
                    "ml-2 hidden whitespace-nowrap text-sm font-semibold tracking-wide sm:inline lg:text-base",
                    active
                      ? "text-slate-900 dark:text-white"
                      : complete
                        ? "text-slate-700 dark:text-slate-200"
                        : "text-slate-400",
                  )}
                >
                  {label}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    className={cn(
                      "mx-3 h-px flex-1 sm:mx-5",
                      complete
                        ? "bg-primary"
                        : "bg-slate-300 dark:bg-slate-600",
                    )}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {step === 1 ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!isPreparingFile) inputRef.current?.click();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (!isPreparingFile) {
                  void handleFile(event.dataTransfer.files[0]);
                }
              }}
              aria-disabled={isPreparingFile}
              className={cn(
                "mt-6 flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-primary/70 px-6 py-8 text-center transition",
                darkMode
                  ? "bg-primary/10 hover:bg-primary/15"
                  : "bg-[#edf9f8] hover:bg-[#e5f7f5]",
                dragging &&
                  (darkMode
                    ? "scale-[.995] bg-primary/20"
                    : "scale-[.995] bg-[#d8f4f1]"),
                isPreparingFile && "cursor-wait opacity-70",
              )}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c8efeb] text-primary dark:bg-primary/15 dark:text-teal-300">
                {isPreparingFile ? (
                  <LoaderCircle className="h-8 w-8 animate-spin" />
                ) : (
                  <CloudUpload className="h-9 w-9" />
                )}
              </span>
              <span className="mt-5 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                {isPreparingFile
                  ? "Validating your CSV..."
                  : file
                    ? "Drop a new CSV to replace this file"
                    : "Drag and drop your CSV file here"}
              </span>
              <span className="mt-2 text-sm font-semibold text-primary dark:text-teal-300">
                {isPreparingFile
                  ? "Checking columns, users, and duplicate records"
                  : file
                    ? "or choose another file"
                    : "or browse your computer"}
              </span>
              <span className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                CSV only / Up to 5 MB
              </span>
            </button>
            {file ? (
              <div
                className={cn(
                  "mt-4 rounded-2xl border px-4 py-4",
                  darkMode
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)]",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[10px] font-black uppercase tracking-wide",
                      fileStatus === "error"
                        ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                        : "border-teal-200 bg-teal-50 text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-teal-300",
                    )}
                  >
                    CSV
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">
                          {file.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 font-semibold",
                              fileStatus === "ready"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : fileStatus === "error"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-primary dark:text-teal-300",
                            )}
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                fileStatus === "ready"
                                  ? "bg-emerald-500"
                                  : fileStatus === "error"
                                    ? "bg-red-500"
                                    : "bg-primary",
                              )}
                            />
                            {fileStatus === "validating"
                              ? "Validating..."
                              : fileStatus === "ready"
                                ? `${rows.length} rows ready`
                                : "Needs attention"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        disabled={isPreparingFile}
                        aria-label="Remove selected CSV file"
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-wait disabled:opacity-50",
                          darkMode
                            ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div
                      className={cn(
                        "mt-3 h-1.5 overflow-hidden rounded-full",
                        darkMode ? "bg-slate-800" : "bg-slate-100",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          fileStatus === "error"
                            ? "bg-red-500"
                            : "bg-primary",
                          fileStatus === "validating" && "animate-pulse",
                        )}
                        style={{
                          width:
                            fileStatus === "validating"
                              ? "58%"
                              : fileStatus === "idle"
                                ? "0%"
                                : "100%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {error ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div>
                <div>Maximum 5,000 rows / Maximum file size 5MB</div>
                <div className="mt-2">
                  Required columns: Name, User ID/Staff ID, Unit
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    "synkup-users-template.csv",
                    "Name,User ID/Staff ID,Email,Unit,Audience\n",
                  )
                }
                className="flex items-center gap-2 font-bold not-italic tracking-wider text-primary"
              >
                <Download className="h-4 w-4" />
                Download CSV Template
              </button>
            </div>
            <div
              className={cn(
                "mt-6 flex flex-wrap items-center justify-end gap-3 border-t pt-5",
                darkMode ? "border-slate-800" : "border-slate-100",
              )}
            >
              <Button
                variant="outline"
                className={modalButtonClassName}
                onClick={onClose}
                disabled={isPreparingFile}
              >
                Cancel
              </Button>
              <Button
                className={modalButtonClassName}
                disabled={fileStatus !== "ready" || rows.length === 0}
                onClick={() => setStep(2)}
              >
                {isPreparingFile ? "Validating CSV…" : "Review users"}
              </Button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <InlineNotice
              tone="danger"
              title="Duplicate records will be skipped"
              body="Records matched by email or ID use the insert-only policy and will not update existing users."
              darkMode={darkMode}
            />
            {error ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {rows.length} rows detected
              </span>
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                {validRows.length} valid
              </span>
              <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-400" />
                {flaggedRows.length} flagged
              </span>
              <span className="ml-auto text-slate-500 dark:text-slate-400">
                Showing first {Math.min(rows.length, 5)} rows
              </span>
            </div>
            <ImportRowsTable rows={rows.slice(0, 5)} darkMode={darkMode} />
            <div
              className={cn(
                "mt-6 flex flex-wrap items-center justify-end gap-3 border-t pt-5",
                darkMode ? "border-slate-800" : "border-slate-100",
              )}
            >
              <Button
                variant="outline"
                className={modalButtonClassName}
                onClick={onClose}
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className={modalButtonClassName}
                onClick={() => setStep(1)}
                disabled={isConfirming}
              >
                Back
              </Button>
              <Button
                className={modalButtonClassName}
                disabled={validRows.length === 0}
                loading={isConfirming}
                onClick={finishImport}
              >
                Import users
              </Button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <div className="text-center">
            <div className="mx-auto mt-8 flex h-22 w-22 items-center justify-center rounded-full bg-[#16a394] text-white shadow-[0_24px_60px_-28px_rgba(22,163,148,0.55)]">
              <Check className="h-11 w-11" />
            </div>
            <h3 className="mt-6 text-3xl font-semibold tracking-[-0.03em]">
              Import Successful
            </h3>
            <p
              className={cn(
                "mx-auto mt-3 max-w-md text-sm leading-6",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              The import is complete. Valid users were added and flagged records
              were safely skipped.
            </p>
            <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
              <DetailMetricCard
                darkMode={darkMode}
                title="Total records"
                value={String(rows.length)}
                variant="simple"
              />
              <DetailMetricCard
                darkMode={darkMode}
                title="Successful"
                value={String(importReport?.created_count ?? validRows.length)}
                variant="simple"
                valueClassName="text-emerald-600 dark:text-emerald-400"
              />
              <DetailMetricCard
                darkMode={darkMode}
                title="Flagged"
                value={String(
                  importReport
                    ? importReport.skipped_count + importReport.failed_count
                    : flaggedRows.length,
                )}
                variant="simple"
                valueClassName="text-red-600 dark:text-red-400"
              />
            </div>
            <div className="mt-4 grid gap-4 text-left md:grid-cols-3">
              <DetailMetricCard
                darkMode={darkMode}
                title="Eligible for invitation"
                value={String(
                  importReport?.invitation_eligible_count ??
                    invitationEligibleRows.length,
                )}
                variant="simple"
                valueClassName="text-primary dark:text-teal-300"
              />
              <DetailMetricCard
                darkMode={darkMode}
                title="Directory only"
                value={String(
                  importReport?.directory_only_count ??
                    directoryOnlyRows.length,
                )}
                variant="simple"
                valueClassName="text-slate-500 dark:text-slate-400"
              />
              <DetailMetricCard
                darkMode={darkMode}
                title="Duplicates skipped"
                value={String(
                  importReport?.skipped_count ?? duplicateRows.length,
                )}
                variant="simple"
                valueClassName="text-amber-700 dark:text-amber-400"
              />
            </div>
            <InlineNotice
              tone="warning"
              title="Invitations are not sent automatically"
              body="Imported users are created as directory users first. Send setup invitations only when you are ready to queue the emails."
              darkMode={darkMode}
            />
            {invitationsQueued ? (
              <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-primary dark:border-primary/30 dark:bg-primary/10 dark:text-teal-300">
                {queuedInvitationCount} invitation email
                {queuedInvitationCount === 1 ? "" : "s"} queued for
                delivery.
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
            {flaggedRows.length || importReport?.report_url ? (
              <button
                type="button"
                onClick={downloadReport}
                className="mt-5 block text-sm font-semibold text-red-600 hover:underline dark:text-red-400"
              >
                {importReport?.report_url
                  ? "Download system import report"
                  : "Download failed records"}
              </button>
            ) : null}
            <div className="mt-7 text-left">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Import preview - first {Math.min(rows.length, 5)} records
              </div>
              <ImportRowsTable rows={rows.slice(0, 5)} darkMode={darkMode} />
            </div>
            <div
              className={cn(
                "mt-6 flex flex-wrap items-center justify-end gap-3 border-t pt-5",
                darkMode ? "border-slate-800" : "border-slate-100",
              )}
            >
              <Button
                variant="outline"
                className={modalButtonClassName}
                disabled={
                  invitationEligibleRows.length === 0 ||
                  invitationsQueued ||
                  isSendingImportInvitations
                }
                onClick={async () => {
                  const eligible = createdUsers.filter((user) =>
                    Boolean(user.email),
                  );
                  const userIds = eligible.map((user) => user.id);
                  if (!userIds.length) return;

                  setError("");
                  setIsSendingImportInvitations(true);
                  const result =
                    await bulkSendTenantUserInvitations(userIds);
                  setIsSendingImportInvitations(false);

                  if (!result.success) {
                    setError(result.message);
                    return;
                  }

                  const results = result.data.results ?? [];
                  const failedCount =
                    result.data.failed_count ??
                    results.filter(
                      (item) =>
                        item.success === false ||
                        item.status?.toLowerCase() === "failed",
                    ).length;
                  const successCount =
                    result.data.success_count ??
                    (results.length
                      ? results.filter(
                          (item) =>
                            item.success === true ||
                            item.status?.toLowerCase() === "success",
                        ).length
                      : Math.max(0, userIds.length - failedCount));

                  setQueuedInvitationCount(successCount);
                  if (failedCount > 0) {
                    setError(
                      `${successCount} invitation${successCount === 1 ? "" : "s"} queued, but ${failedCount} could not be queued. Review the affected users and retry from the Users table.`,
                    );
                    return;
                  }

                  setInvitationsQueued(true);
                }}
                loading={isSendingImportInvitations}
              >
                {!isSendingImportInvitations ? (
                  <Mail className="h-4 w-4" />
                ) : null}
                Send Invitations
              </Button>
              <Button
                variant="outline"
                className={modalButtonClassName}
                onClick={downloadReport}
              >
                <Download className="h-4 w-4" />
                Download Full Report
              </Button>
              <Button className={modalButtonClassName} onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function ImportRowsTable({
  rows,
  darkMode,
}: {
  rows: ImportRow[];
  darkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-4 overflow-hidden rounded-[22px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-100 bg-white",
      )}
    >
      <DashboardDataTable
        darkMode={darkMode}
        headers={["Name", "ID", "Email", "Unit", "Audience", "Status"]}
        minWidthClassName="min-w-[780px]"
      >
        {rows.map((row, index) => (
          <tr
            key={`${row.identity}-${index}`}
            className={cn(
              "border-t transition",
              darkMode
                ? "border-slate-800 hover:bg-slate-800/60"
                : "border-slate-200 hover:bg-slate-50",
            )}
          >
            <td className="px-4 py-3.5 font-semibold">{row.name || "-"}</td>
            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
              {row.identity || "-"}
            </td>
            <td className="px-4 py-3.5 font-semibold">{row.email || "-"}</td>
            <td className="px-4 py-3.5 uppercase text-slate-500 dark:text-slate-400">
              {row.unit || "-"}
            </td>
            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
              {row.audience || "-"}
            </td>
            <td className="px-4 py-3.5">
              {row.status === "VALID" ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  VALID
                </span>
              ) : (
                <span
                  className={cn(
                    "inline-flex min-w-28 flex-col rounded-xl px-3 py-1.5 text-center text-xs font-bold",
                    row.reason === "Missing Field"
                      ? "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
                  )}
                >
                  <span>FLAGGED</span>
                  <span className="mt-0.5 font-semibold">{row.reason}</span>
                </span>
              )}
            </td>
          </tr>
        ))}
      </DashboardDataTable>
    </div>
  );
}

function TransferUserModal({
  user,
  darkMode,
  onClose,
  onTransfer,
  unitOptions,
}: {
  user: UserRecord;
  darkMode: boolean;
  onClose: () => void;
  onTransfer: (unitId: number, unitName: string, reason: string) => void;
  unitOptions: Array<{ id: number; name: string }>;
}) {
  const [targetUnit, setTargetUnit] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const selectableUnits = unitOptions
    .filter((unit) => unit.id !== user.unit_id)
    .map((unit) => ({ label: unit.name, value: String(unit.id) }));

  function submitTransfer() {
    setSubmitted(true);
    if (!targetUnit) return;
    const selected = unitOptions.find((unit) => String(unit.id) === targetUnit);
    if (!selected) return;
    onTransfer(selected.id, selected.name, reason.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 backdrop-blur-sm sm:px-4"
      onMouseDown={onClose}
    >
      <Card
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-170 overflow-y-auto rounded-[24px] border p-4 sm:rounded-[28px] sm:p-6",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Transfer Unit</h2>
            <p
              className={cn(
                "mt-1 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Move this user to another unit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transfer dialog"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="text-sm font-semibold">
            Full name
            <input
              value={user.name}
              disabled
              className={cn(
                "mt-2 min-h-12 w-full rounded-2xl border px-4 py-3 text-sm",
                darkMode
                  ? "border-slate-700 bg-slate-900 text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500",
              )}
            />
          </label>
          <label className="text-sm font-semibold">
            Current unit
            <input
              value={user.unit}
              disabled
              className={cn(
                "mt-2 min-h-12 w-full rounded-2xl border px-4 py-3 text-sm font-semibold uppercase",
                darkMode
                  ? "border-slate-700 bg-slate-900 text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500",
              )}
            />
          </label>
          <div>
            <div className="text-sm font-semibold">
              New unit <span className="text-red-600">*</span>
            </div>
            <CompactSelect
              value={targetUnit}
              onChange={setTargetUnit}
              options={[
                { label: "Select target unit", value: "" },
                ...selectableUnits,
              ]}
              className="mt-2 w-full"
              buttonClassName={cn(
                "min-h-12 w-full justify-between rounded-2xl px-4 py-3 text-sm shadow-none",
                submitted && !targetUnit
                  ? "border-red-500"
                  : darkMode
                    ? "border-slate-700 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700",
              )}
              darkMode={darkMode}
            />
            {submitted && !targetUnit ? (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                Select a target unit.
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-sm leading-6">
              <div className="font-semibold">
                Audience memberships will be removed
              </div>
              <p>
                The user must be reassigned to audiences within the new unit
                after transfer.
              </p>
              <p className="mt-1 font-semibold">
                Current audiences:{" "}
                {user.audiences.length
                  ? user.audiences.join(", ")
                  : "None assigned"}
              </p>
            </div>
          </div>

          <label className="text-sm font-semibold">
            Reason for transfer
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. User moved to another department"
              rows={4}
              className={cn(
                "mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none",
                darkMode
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-900",
              )}
            />
          </label>
        </div>

        <div
          className={cn(
            "mt-6 flex flex-wrap items-center justify-end gap-3 border-t pt-5",
            darkMode ? "border-slate-800" : "border-slate-100",
          )}
        >
          <Button
            variant="outline"
            className={modalButtonClassName}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button className={modalButtonClassName} onClick={submitTransfer}>
            Transfer User
          </Button>
        </div>
      </Card>
    </div>
  );
}

function UserStatusModal({
  user,
  darkMode,
  replacementUsers,
  onClose,
  onConfirm,
}: {
  user: UserRecord;
  darkMode: boolean;
  replacementUsers: UserRecord[];
  onClose: () => void;
  onConfirm: (
    nextStatus: TenantUserStatus,
    reason?: string,
    replacementAdminId?: number,
  ) => void;
}) {
  const activating = user.status === "inactive";
  const needsReassignment = !activating && isAdministrativeRole(user.role);
  const [reason, setReason] = useState("");
  const [replacementId, setReplacementId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const shellClass = cn(
    "scrollbar-dashboard max-h-[92vh] w-full overflow-y-auto rounded-[24px] border p-4 sm:rounded-[28px] sm:p-6",
    needsReassignment ? "max-w-170" : "max-w-160",
    darkMode
      ? "border-slate-800 bg-[#0b1420] text-white"
      : "border-slate-100 bg-white text-slate-900",
  );

  function confirm() {
    setSubmitted(true);
    if (needsReassignment && !replacementId) return;
    onConfirm(
      activating ? "active" : "inactive",
      reason.trim(),
      replacementId ? Number(replacementId) : undefined,
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 backdrop-blur-sm sm:px-4"
      onMouseDown={onClose}
    >
      <Card
        className={shellClass}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-semibold">
              {activating
                ? `Reactivate ${user.name}?`
                : needsReassignment
                  ? `Can't Deactivate ${user.name}`
                  : "Deactivate User"}
            </h2>
            {!activating && !needsReassignment ? (
              <p
                className={cn(
                  "mt-1 text-sm",
                  darkMode ? "text-slate-400" : "text-slate-500",
                )}
              >
                Remove this user&apos;s access while preserving their historical
                data.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account status dialog"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {activating ? (
          <>
            <div
              className={cn(
                "mt-6 flex items-center gap-4 rounded-2xl border p-4",
                darkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <AvatarSeed seed={user.name} />
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {displayUserRole(user.role)} / {user.unit}
                </div>
              </div>
            </div>
            <p
              className={cn(
                "mt-6 text-sm leading-6",
                darkMode ? "text-slate-300" : "text-slate-500",
              )}
            >
              This user will regain access to log in and mark attendance. Their
              previous unit and audience settings will remain available.
            </p>
          </>
        ) : needsReassignment ? (
          <>
            <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-sm leading-6">
                <div className="font-semibold">
                  This administrator cannot be deactivated yet.
                </div>
                <p>
                  <strong>{user.name}</strong> currently has the{" "}
                  {displayUserRole(user.role)} role in {user.unit}. Reassign
                  their ownership before deactivation to avoid orphaned
                  administrative scopes.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-sm font-semibold">
                Reassign to{" "}
                <span className="text-red-600 dark:text-red-400">*</span>
              </div>
              <CompactSelect
                value={replacementId}
                onChange={setReplacementId}
                options={[
                  { label: "Select a replacement admin", value: "" },
                  ...replacementUsers.map((replacement) => ({
                    label: `${replacement.name} / ${replacement.role}`,
                    value: String(replacement.id),
                  })),
                ]}
                className="mt-2 w-full"
                buttonClassName={cn(
                  "min-h-12 w-full justify-between rounded-2xl px-4 py-3 text-sm shadow-none",
                  submitted && !replacementId
                    ? "border-red-500"
                    : darkMode
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700",
                )}
                darkMode={darkMode}
              />
              {submitted && !replacementId ? (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Select a replacement administrator.
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <label className="mt-6 block text-sm font-semibold">
              Full name
              <input
                value={user.name}
                disabled
                className={cn(
                  "mt-2 min-h-12 w-full rounded-2xl border px-4 py-3 text-sm",
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-500",
                )}
              />
            </label>
            <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-6">
                This user will no longer be able to log in or mark attendance.
                Their historical attendance data will remain intact.
              </p>
            </div>
            <label className="mt-5 block text-sm font-semibold">
              Reason for deactivation
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. User left the organization"
                rows={4}
                className={cn(
                  "mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none",
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900",
                )}
              />
            </label>
          </>
        )}

        <div
          className={cn(
            "mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end",
            darkMode ? "border-slate-800" : "border-slate-100",
          )}
        >
          <Button
            variant="outline"
            className={modalButtonClassName}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={confirm}
            className={cn(
              modalButtonClassName,
              !activating &&
                !needsReassignment &&
                "bg-amber-600 hover:bg-amber-700",
            )}
          >
            {!activating && !needsReassignment ? (
              <UserX className="h-4 w-4" />
            ) : null}
            {activating
              ? "Reactivate User"
              : needsReassignment
                ? "Reassign and Continue"
                : "Deactivate User"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function UserAuditLogsModal({
  user,
  darkMode,
  onClose,
}: {
  user: UserRecord;
  darkMode: boolean;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<TenantUserAuditLogsResponse | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    void getTenantUserAuditLogs(user.id, { page, page_size: 20 }).then(
      (result) => {
        if (!active) return;
        setLoading(false);
        if (!result.success) {
          setError(result.message);
          return;
        }
        setLogs(result.data);
      },
    );

    return () => {
      active = false;
    };
  }, [page, user.id]);

  const totalPages = Math.max(1, Math.ceil((logs?.count ?? 0) / 20));
  const paginationItems = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-3 backdrop-blur-sm sm:px-4"
      onMouseDown={onClose}
    >
      <Card
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[24px] border p-4 sm:rounded-[28px] sm:p-6",
          darkMode
            ? "border-slate-700 bg-slate-900 text-white"
            : "border-slate-100 bg-white text-slate-950",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold">User audit logs</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Provisioning, access, transfers, imports, role changes, and permission decisions for {user.name}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close audit logs"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading audit logs…
            </div>
          ) : error ? (
            <InlineNotice
              tone="danger"
              title="Unable to load audit logs"
              body={error}
              darkMode={darkMode}
            />
          ) : logs?.results.length ? (
            logs.results.map((log) => (
              <article
                key={log.id}
                className={cn(
                  "rounded-2xl border p-4",
                  darkMode
                    ? "border-slate-700 bg-slate-800/60"
                    : "border-slate-200 bg-slate-50",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      {formatDisplayLabel(log.title || log.event)}
                    </h3>
                    {log.description ? (
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {log.description}
                      </p>
                    ) : null}
                  </div>
                  {log.status ? (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {formatDisplayLabel(log.status)}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDateTime(log.timestamp)}
                  </span>
                  {log.actor ? <span>By {log.actor.name}</span> : null}
                </div>
                {Object.keys(log.metadata).length > 0 ? (
                  <dl className="mt-3 grid gap-2 rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-700 sm:grid-cols-2">
                    {Object.entries(log.metadata).map(([key, value]) => (
                      <div key={key}>
                        <dt className="font-semibold text-slate-500 dark:text-slate-400">
                          {formatDisplayLabel(key)}
                        </dt>
                        <dd className="mt-0.5 break-words font-medium">
                          {formatDataValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </article>
            ))
          ) : (
            <div className="flex min-h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              No audit events have been recorded for this user.
            </div>
          )}
        </div>

        {!loading && !error && logs && logs.count > 0 ? (
          <div className="mt-5">
            <PaginationControl
              darkMode={darkMode}
              summary={`Showing ${logs.results.length} of ${logs.count} audit events`}
              items={paginationItems}
              activePage={page}
              hasPreviousPage={Boolean(logs.previous)}
              hasNextPage={Boolean(logs.next)}
              onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
              onNextPage={() => setPage((current) => Math.min(totalPages, current + 1))}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function UserDetailDrawer({
  user,
  darkMode,
  onClose,
  onEdit,
  onTransfer,
  onDeactivate,
  onSendInvitation,
  onResendInvitation,
  onRevokeInvitation,
  isSelf,
}: {
  user: UserRecord;
  darkMode: boolean;
  onClose: () => void;
  onEdit: () => void;
  onTransfer: () => void;
  onDeactivate: () => void;
  onSendInvitation: () => void | Promise<void>;
  onResendInvitation: () => void | Promise<void>;
  onRevokeInvitation: () => void | Promise<void>;
  isSelf: boolean;
}) {
  const [invitationAction, setInvitationAction] = useState<
    "send" | "resend" | "revoke" | null
  >(null);
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);
  const invitationBusy = invitationAction !== null;
  const invitationWasSent =
    Boolean(user.invitation?.sentAt) || user.invitation?.status === "sent";
  const invitationCanBeRevoked =
    invitationWasSent &&
    user.invitation !== null &&
    user.invitation.status !== "revoked" &&
    user.invitation.status !== "expired" &&
    user.invitation.status !== "failed";

  async function runInvitationAction(
    action: "send" | "resend" | "revoke",
    callback: () => void | Promise<void>,
  ) {
    if (invitationBusy) return;
    setInvitationAction(action);
    try {
      await callback();
    } finally {
      setInvitationAction(null);
    }
  }

  const attendance = {
    sessions: user.attendanceSummary?.sessions_attended ?? 0,
    late: user.attendanceSummary?.late_count ?? 0,
    absences: user.attendanceSummary?.absences ?? 0,
    last: user.attendanceSummary?.last_attendance
      ? formatDate(user.attendanceSummary.last_attendance)
      : "No attendance recorded",
  };
  const infoCard = cn(
    "rounded-2xl border px-4 py-4",
    darkMode
      ? "border-slate-700 bg-slate-800/70"
      : "border-slate-200 bg-slate-50",
  );

  return (
    <>
    <div
      className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <aside
        className={cn(
          "scrollbar-subtle ml-auto flex h-full w-full max-w-[680px] flex-col overflow-y-auto border-l shadow-2xl",
          darkMode
            ? "border-slate-700 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-950",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Close user details"
              onClick={onClose}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                darkMode
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-700",
              )}
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="User actions"
              className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-200 bg-linear-to-br from-[#4827ff] to-[#0ea5e9] text-2xl font-bold text-white shadow-sm dark:border-slate-700">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .slice(-2)
                .join("")}
            </div>
            <h2 className="mt-5 text-2xl font-bold">{user.name}</h2>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase text-primary dark:bg-primary/15 dark:text-teal-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {displayUserRole(user.role)}
              </span>
              <StatusPill status={user.status} />
              <AccessStatusPill status={user.accessStatus} />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className={infoCard}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Email / ID
              </div>
              <div className="mt-2 break-all text-lg font-medium">
                {displayUserIdentity(user)}
              </div>
            </div>
            <div className={infoCard}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Role
              </div>
              <div className="mt-2 text-lg font-medium">
                {displayUserRole(user.role)}
              </div>
            </div>
            <div className={infoCard}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Primary unit
              </div>
              <div className="mt-2 text-lg font-semibold text-primary">
                {user.unit}
              </div>
            </div>
            <div className={infoCard}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Date added
              </div>
              <div className="mt-2 text-lg font-medium">{user.dateAdded}</div>
            </div>
            <div className={cn(infoCard, "sm:col-span-2")}>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Last login
              </div>
              <div className="mt-2 text-lg font-medium">
                {user.lastLogin ?? "Not available"}
              </div>
            </div>
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
                Access
              </h3>
              <AccessStatusPill status={user.accessStatus} />
            </div>
            <div
              className={cn(
                "mt-3 rounded-2xl border px-4 py-4",
                darkMode
                  ? "border-slate-700 bg-slate-800/70"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    Login enabled
                  </div>
                  <div className="mt-1 font-bold">
                    {user.loginEnabled ? "Yes" : "No"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    Invitation
                  </div>
                  <div className="mt-1">
                    <span className="font-bold">
                      {formatDisplayLabel(user.invitation?.status ?? "none")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    Delivery
                  </div>
                  <div className="mt-1">
                    <DeliveryStatusPill
                      status={user.invitation?.deliveryStatus}
                    />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    Sent
                  </div>
                  <div className="mt-1 font-bold">
                    {user.invitation?.sentAt ?? "Not sent"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500 dark:text-slate-400">
                    Expires
                  </div>
                  <div className="mt-1 font-bold">
                    {user.invitation?.expiresAt ?? "N/A"}
                  </div>
                </div>
                {user.invitation?.acceptedAt ? (
                  <div>
                    <div className="font-semibold text-slate-500 dark:text-slate-400">
                      Accepted
                    </div>
                    <div className="mt-1 font-bold">
                      {user.invitation.acceptedAt}
                    </div>
                  </div>
                ) : null}
              </div>
              {["failed", "bounced"].includes(
                user.invitation?.deliveryStatus?.toLowerCase() ?? "",
              ) ? (
                <div className="mt-4">
                  <InlineNotice
                    tone="danger"
                    title="Invitation delivery failed"
                    body="The invitation email was not delivered. Verify the email address, then resend the invitation."
                    darkMode={darkMode}
                  />
                </div>
              ) : null}
              {user.accessStatus === "no_email" ? (
                <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Add an email address before sending an account setup
                  invitation.
                </p>
              ) : null}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {invitationWasSent ? (
                  <Button
                    variant="outline"
                    className={cn(modalButtonClassName, "sm:w-full")}
                    disabled={!user.email || user.accessStatus === "active" || invitationBusy}
                    onClick={() => void runInvitationAction("resend", onResendInvitation)}
                  >
                    {invitationAction === "resend" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {invitationAction === "resend" ? "Resending..." : "Resend Invite"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className={cn(modalButtonClassName, "sm:w-full")}
                    disabled={!user.email || user.accessStatus === "active" || invitationBusy}
                    onClick={() => void runInvitationAction("send", onSendInvitation)}
                  >
                    {invitationAction === "send" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {invitationAction === "send" ? "Sending..." : "Send Invite"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={cn(modalButtonClassName, "sm:w-full")}
                  disabled={
                    !invitationCanBeRevoked ||
                    user.accessStatus === "active" ||
                    invitationBusy
                  }
                  onClick={() => void runInvitationAction("revoke", onRevokeInvitation)}
                >
                  {invitationAction === "revoke" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  {invitationAction === "revoke" ? "Revoking..." : "Revoke"}
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
                Audiences
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {user.audiences.length} assigned
              </span>
            </div>
            <div className="mt-3">
              <AudienceTags audiences={user.audiences} compact />
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-bold uppercase tracking-[0.08em]">
              Attendance summary
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={infoCard}>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Sessions attended
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {attendance.sessions}
                </div>
              </div>
              <div className={infoCard}>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Late count
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
                  {attendance.late}
                </div>
              </div>
              <div className={infoCard}>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Absences
                </div>
                <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                  {attendance.absences}
                </div>
              </div>
              <div className={infoCard}>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                  Last attendance
                </div>
                <div className="mt-2 font-semibold">{attendance.last}</div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-sm font-bold">Recent activity</h3>
            <div className="mt-3 space-y-3">
              {user.recentActivity.length > 0 ? (
                user.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "rounded-2xl border px-4 py-3",
                      darkMode ? "border-slate-700" : "border-slate-200",
                    )}
                  >
                    <div className="text-sm font-semibold">
                      {formatDisplayLabel(activity.title)}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No recent activity.
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setAuditLogsOpen(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              View full audit logs <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>

        <div
          className={cn(
            "sticky bottom-0 grid gap-3 border-t p-4 sm:grid-cols-3",
            darkMode
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-white",
          )}
        >
          <Button
            variant="outline"
            className={cn(modalButtonClassName, "sm:w-full")}
            disabled={!user.availableActions?.can_edit}
            onClick={onEdit}
            title={
              user.availableActions?.can_edit
                ? "Edit user"
                : "Editing is not available for this user"
            }
          >
            Edit User
          </Button>
          <Button
            variant="outline"
            className={cn(modalButtonClassName, "sm:w-full")}
            disabled={user.availableActions?.can_transfer === false}
            onClick={onTransfer}
          >
            Transfer Unit
          </Button>
          <Button
            variant="outline"
            className={cn(
              modalButtonClassName,
              "border-red-500 text-red-600 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500/10 sm:w-full",
            )}
            disabled={isSelf || user.availableActions?.can_deactivate === false}
            onClick={onDeactivate}
          >
            {isSelf
              ? "Self Action Blocked"
              : user.status === "active"
                ? "Deactivate"
                : "Reactivate"}
          </Button>
        </div>
      </aside>
    </div>
    {auditLogsOpen ? (
      <UserAuditLogsModal
        user={user}
        darkMode={darkMode}
        onClose={() => setAuditLogsOpen(false)}
      />
    ) : null}
    </>
  );
}

export function UsersWorkspace({ darkMode }: { darkMode: boolean }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersOverview, setUsersOverview] =
    useState<TenantUsersOverviewResponse | null>(null);
  const [availableUnits, setAvailableUnits] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("all");
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState("all");
  const [accessStatus, setAccessStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [transferringUser, setTransferringUser] = useState<UserRecord | null>(
    null,
  );
  const [statusUser, setStatusUser] = useState<UserRecord | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [bulkAudienceId, setBulkAudienceId] = useState("");
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkAudienceOpen, setBulkAudienceOpen] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [currentLoginContext] = useState(() => readTenantLoginContext());

  function showToast(
    tone: DashboardToastTone,
    title: string,
    description: string,
  ) {
    setToast({ tone, title, description });
  }

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(async () => {
      setUsersLoading(true);
      const result = await getTenantUsers({
        page,
        page_size: pageSize,
        search: query.trim() || undefined,
        unit_id: unit === "all" ? undefined : Number(unit),
        audience_id: audience === "all" ? undefined : Number(audience),
        status: status === "all" ? undefined : (status as TenantUserStatus),
        role: role === "all" ? undefined : (role as TenantUserRole),
        ordering: "-date_added",
      });

      if (!active) return;
      setUsersLoading(false);
      if (!result.success) {
        setUsers([]);
        setTotalUsers(0);
        showToast("error", "Unable to load users", result.message);
        return;
      }

      setUsers(result.data.results.map(toUserRecord));
      setTotalUsers(result.data.count);
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [audience, page, query, role, status, unit]);

  useEffect(() => {
    let active = true;
    void getTenantUsersOverview({
      audience_id: audience === "all" ? undefined : Number(audience),
      unit_id: unit === "all" ? undefined : Number(unit),
      role: role === "all" ? undefined : (role as TenantUserRole),
      status: status === "all" ? undefined : (status as TenantUserStatus),
    }).then((result) => {
      if (!active) return;
      if (result.success) {
        setUsersOverview(result.data);
      } else {
        setUsersOverview(null);
        showToast("error", "Unable to load users overview", result.message);
      }
    });
    return () => {
      active = false;
    };
  }, [audience, role, status, unit]);

  useEffect(() => {
    let active = true;

    void getTenantUnits({ page: 1 }).then((result) => {
      if (!active || !result.success) return;
      setAvailableUnits(
        result.data.data.map((item) => ({ id: item.unit_id, name: item.name })),
      );
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    let active = true;
    const userId = selectedUser.id;

    void Promise.all([
      getTenantUser(userId),
      getTenantUserInvitationStatus(userId),
    ]).then(([result, invitationResult]) => {
      if (!active) return;
      if (!result.success) {
        showToast("error", "Unable to load user", result.message);
        return;
      }

      const detailedUser = invitationResult.success
        ? applyInvitationStatus(toUserRecord(result.data), invitationResult.data)
        : toUserRecord(result.data);
      setSelectedUser((current) =>
        current?.id === userId ? detailedUser : current,
      );
      setUsers((current) =>
        current.map((user) => (user.id === userId ? detailedUser : user)),
      );
    });

    return () => {
      active = false;
    };
  }, [selectedUser?.id]);

  const filterOptions = {
    units: Array.from(
      new Map(
        users
          .filter((user) => user.unit_id !== null)
          .map((user) => [user.unit_id as number, user.unit]),
      ),
    ),
    audiences: Array.from(
      new Map(
        users.flatMap((user) =>
          user.audience_ids.map(
            (id, index) => [id, user.audiences[index]] as const,
          ),
        ),
      ),
    ),
    statuses: ["active", "inactive"],
    accessStatuses: [
      "no_email",
      "pending_invitation",
      "pending_setup",
      "active",
      "invitation_expired",
      "disabled",
    ] as TenantUserAccessStatus[],
    roles: Array.from(new Set(users.map((user) => user.role))),
  };
  const filtered =
    accessStatus === "all"
      ? users
      : users.filter((user) => user.accessStatus === accessStatus);
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const pageItems = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );
  const firstVisible = totalUsers === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastVisible = Math.min(page * pageSize, totalUsers);
  const addUserUnitOptions =
    availableUnits.length > 0
      ? availableUnits
      : filterOptions.units.map(([id, name]) => ({ id, name }));
  const planUsage = usersOverview?.plan_usage;
  const planPercentage = Math.max(0, Math.min(100, planUsage?.percentage ?? 0));
  const creationBlocked =
    usersOverview?.creation_blocked ??
    planUsage?.creation_blocked ??
    Boolean(
      planUsage &&
        !planUsage.is_unlimited &&
        planUsage.used >= planUsage.limit,
    );
  const creationBlockedMessage =
    usersOverview?.suggested_action ||
    planUsage?.suggested_action ||
    "Upgrade or renew your subscription to add or import more users.";

  function isCurrentUser(user: UserRecord) {
    if (currentLoginContext?.userId && user.id === currentLoginContext.userId) {
      return true;
    }

    return Boolean(
      currentLoginContext?.email &&
      user.email &&
      user.email.toLowerCase() === currentLoginContext.email.toLowerCase(),
    );
  }

  function updateUserAccess(userId: number, nextUser: UserRecord) {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? nextUser : user)),
    );
    setSelectedUser(nextUser);
  }

  async function refreshUserProfile(userId: number) {
    const [detail, invitationStatus] = await Promise.all([
      getTenantUser(userId),
      getTenantUserInvitationStatus(userId),
    ]);
    if (!detail.success) {
      showToast("error", "Unable to refresh user", detail.message);
      return null;
    }
    const updatedUser = invitationStatus.success
      ? applyInvitationStatus(toUserRecord(detail.data), invitationStatus.data)
      : toUserRecord(detail.data);
    updateUserAccess(userId, updatedUser);
    return updatedUser;
  }

  async function sendInvitation(user: UserRecord, resent = false) {
    if (!user.email) {
      showToast(
        "warning",
        "Email address required",
        "Add an email address before sending an account invitation.",
      );
      return;
    }

    const result = resent
      ? await resendTenantUserInvitation(user.id)
      : await sendTenantUserInvitation(user.id);
    if (!result.success) {
      showToast("error", "Unable to send invitation", result.message);
      return;
    }
    await refreshUserProfile(user.id);
    showToast(
      "success",
      resent ? "Invitation resent" : "Invitation sent",
      resent
        ? `A new invitation was sent to ${user.email}.`
        : `The account invitation was sent to ${user.email}.`,
    );
  }

  async function revokeInvitation(user: UserRecord) {
    const result = await revokeTenantUserInvitation(user.id);
    if (!result.success) {
      showToast("error", "Unable to revoke invitation", result.message);
      return;
    }
    await refreshUserProfile(user.id);
    showToast(
      "success",
      "Invitation revoked",
      `The pending invitation for ${user.name} was revoked.`,
    );
  }

  function toggleUserSelection(userId: number) {
    setSelectedUserIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function describeBulkResult(
    data: {
      message?: string;
      success_count?: number;
      failed_count?: number;
      processed_count?: number;
      results?: Array<{ success?: boolean; status?: string }>;
    },
    fallback: string,
  ) {
    const succeeded =
      data.success_count ??
      data.results?.filter(
        (item) => item.success === true || item.status === "success",
      ).length ??
      data.processed_count ??
      0;
    const failed =
      data.failed_count ??
      data.results?.filter(
        (item) => item.success === false || item.status === "failed",
      ).length ??
      0;
    return {
      succeeded,
      failed,
      description:
        data.message ||
        (failed > 0
          ? `${succeeded} succeeded and ${failed} failed. Review the reported safeguards before retrying.`
          : `${succeeded || selectedUserIds.size} ${fallback}.`),
    };
  }

  async function runBulkInvitationAction(resent: boolean) {
    const ids = [...selectedUserIds];
    if (!ids.length) return;
    setBulkAction(resent ? "resend" : "send");
    const result = resent
      ? await bulkResendTenantUserInvitations(ids)
      : await bulkSendTenantUserInvitations(ids);
    setBulkAction(null);
    if (!result.success) {
      showToast("error", "Bulk invitation failed", result.message);
      return;
    }
    const summary = describeBulkResult(result.data, "invitations queued");
    showToast(
      summary.failed > 0 ? "warning" : "success",
      summary.failed > 0 ? "Bulk invitation partially completed" : "Invitations queued",
      summary.description,
    );
    setSelectedUserIds(new Set());
  }

  async function runBulkDeactivation() {
    const selected = users.filter((user) => selectedUserIds.has(user.id));
    if (selected.some(isCurrentUser)) {
      showToast(
        "warning",
        "Self-deactivation blocked",
        "Remove your own account from the selection before continuing.",
      );
      return;
    }
    const includesAdmins = selected.some((user) =>
      isAdministrativeRole(user.role),
    );
    if (
      includesAdmins &&
      !window.confirm(
        "This selection contains administrators. Continue only if their scopes will not be orphaned.",
      )
    ) {
      return;
    }
    setBulkAction("deactivate");
    const result = await bulkDeactivateTenantUsers([...selectedUserIds], {
      confirm_admins: includesAdmins,
    });
    setBulkAction(null);
    if (!result.success) {
      showToast("error", "Bulk deactivation failed", result.message);
      return;
    }
    const summary = describeBulkResult(result.data, "users deactivated");
    const perUserResults = result.data.results;
    const successfulIds = new Set(
      perUserResults
        ?.filter((item) => item.success === true || item.status === "success")
        .map((item) => item.user_id ?? item.id)
        .filter((id): id is number => typeof id === "number") ?? [],
    );
    setUsers((current) =>
      current.map((user) =>
        selectedUserIds.has(user.id) &&
        (successfulIds.has(user.id) ||
          (!perUserResults && summary.failed === 0))
          ? { ...user, status: "inactive", loginEnabled: false }
          : user,
      ),
    );
    showToast(
      summary.failed > 0 ? "warning" : "success",
      summary.failed > 0
        ? "Bulk deactivation partially completed"
        : "Users deactivated",
      summary.description,
    );
    setSelectedUserIds(new Set());
  }

  async function runBulkAudienceAssignment() {
    const audienceId = Number(bulkAudienceId);
    if (!audienceId || !selectedUserIds.size) return;
    setBulkAction("audience");
    const result = await bulkAssignTenantUsersAudience(
      [...selectedUserIds],
      audienceId,
    );
    setBulkAction(null);
    if (!result.success) {
      showToast("error", "Audience assignment failed", result.message);
      return;
    }
    const summary = describeBulkResult(result.data, "users assigned");
    showToast(
      summary.failed > 0 ? "warning" : "success",
      summary.failed > 0
        ? "Audience assignment partially completed"
        : "Audience assigned",
      summary.description,
    );
    setBulkAudienceId("");
    setBulkAudienceOpen(false);
    setSelectedUserIds(new Set());
  }

  async function runBulkExport() {
    if (!selectedUserIds.size) return;
    setBulkAction("export");
    const result = await bulkExportTenantUsers([...selectedUserIds]);
    setBulkAction(null);
    if (!result.success) {
      showToast("error", "Unable to export users", result.message);
      return;
    }
    const url = URL.createObjectURL(result.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(
      "success",
      "Export ready",
      `${selectedUserIds.size} selected user${selectedUserIds.size === 1 ? "" : "s"} exported.`,
    );
  }

  return (
    <section className="pb-10">
      <UnitsPageHeader
        darkMode={darkMode}
        title="Users"
        description="Manage all users across your organization's ecosystem"
      />

      {users.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            {
              label: "Total Users",
              value: formatNumber(usersOverview?.total_users),
              tone: "default",
            },
            {
              label: "Active Users",
              value: formatNumber(usersOverview?.active_users),
              tone: "default",
            },
            {
              label: "Pending Access",
              value: formatNumber(usersOverview?.pending_access),
              tone: "muted",
            },
            {
              label: "No Email",
              value: formatNumber(usersOverview?.no_email),
              tone: "danger",
            },
          ].map((metric) => (
            <Card
              key={metric.label}
              className={cn(
                "min-h-24 rounded-[18px] border p-4 shadow-none",
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white",
              )}
            >
              <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                {metric.label}
              </div>
              <div
                className={cn(
                  "mt-2 text-xl font-bold",
                  metric.tone === "danger"
                    ? "text-red-600 dark:text-red-400"
                    : metric.tone === "muted"
                      ? "text-slate-500 dark:text-slate-400"
                      : "text-slate-950 dark:text-white",
                )}
              >
                {metric.value}
              </div>
            </Card>
          ))}
          <Card
            className={cn(
              "min-h-24 rounded-[18px] border p-4 shadow-none sm:col-span-2 lg:col-span-1",
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white",
            )}
          >
            <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Plan Usage
            </div>
            <div className="mt-2 text-base font-bold text-amber-700 dark:text-amber-400">
              {planUsage
                ? planUsage.is_unlimited
                  ? `${formatNumber(planUsage.used)} / Unlimited`
                  : `${formatNumber(planUsage.used)} / ${formatNumber(planUsage.limit)}`
                : "—"}
            </div>
            {planUsage && !planUsage.is_unlimited ? (
              <div
                className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                role="progressbar"
                aria-label="Plan usage"
                aria-valuemin={0}
                aria-valuemax={planUsage.limit}
                aria-valuenow={planUsage.used}
              >
                <span
                  className="rounded-full bg-primary"
                  style={{ width: `${planPercentage}%` }}
                />
              </div>
            ) : planUsage?.is_unlimited ? (
              <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Unlimited plan
              </div>
            ) : null}
          </Card>
        </div>
      ) : null}

        {users.length > 0 ? (
          <>
            {creationBlocked ? (
              <div className="mt-5">
                <InlineNotice
                  tone="warning"
                  title="User creation is blocked"
                  body={creationBlockedMessage}
                  darkMode={darkMode}
                />
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {(["table", "grid"] as const).map((item) => {
                const Icon = item === "table" ? List : Grid2X2;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setView(item)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold capitalize",
                      view === item
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 dark:text-slate-400",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setSelectedUserIds((current) => {
                    const next = new Set(current);
                    const allSelected = filtered.every((user) =>
                      next.has(user.id),
                    );
                    filtered.forEach((user) =>
                      allSelected ? next.delete(user.id) : next.add(user.id),
                    );
                    return next;
                  })
                }
                className="min-h-11 px-3 text-sm font-semibold text-slate-500 transition hover:text-primary dark:text-slate-400 dark:hover:text-teal-300"
              >
                {filtered.length > 0 &&
                filtered.every((user) => selectedUserIds.has(user.id))
                  ? "Clear page"
                  : "Select page"}
              </button>
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <Button
                variant="outline"
                className={cn(modalButtonClassName, "flex-1 sm:flex-none")}
                disabled={creationBlocked}
                title={creationBlocked ? creationBlockedMessage : "Import users"}
                onClick={() => setImportOpen(true)}
              >
                Import CSV
                <Download className="h-4 w-4" />
              </Button>
              <Button
                className={cn(modalButtonClassName, "flex-1 sm:flex-none")}
                disabled={creationBlocked}
                title={creationBlocked ? creationBlockedMessage : "Add user"}
                onClick={() => setAddOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>

          <div className="mt-1">
            <TableFilterBar
              darkMode={darkMode}
              searchPlaceholder="Search by user name, email, ID..."
              searchValue={query}
              onSearchChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              selects={[
                {
                  label: "Unit",
                  value: unit,
                  onChange: (value) => {
                    setUnit(value);
                    setPage(1);
                  },
                  options: [
                    { label: "All Units", value: "all" },
                    ...filterOptions.units.map(([id, name]) => ({
                      label: name,
                      value: String(id),
                    })),
                  ],
                  className: "w-full sm:w-auto sm:min-w-44",
                },
                {
                  label: "Audience",
                  value: audience,
                  onChange: (value) => {
                    setAudience(value);
                    setPage(1);
                  },
                  options: [
                    { label: "All Audiences", value: "all" },
                    ...filterOptions.audiences.map(([id, name]) => ({
                      label: name,
                      value: String(id),
                    })),
                  ],
                  className: "w-full sm:w-auto sm:min-w-52",
                },
                {
                  label: "Status",
                  value: status,
                  onChange: (value) => {
                    setStatus(value);
                    setPage(1);
                  },
                  options: [
                    { label: "All Status", value: "all" },
                    ...filterOptions.statuses.map((item) => ({
                      label: item.toUpperCase(),
                      value: item,
                    })),
                  ],
                  className: "w-full sm:w-auto sm:min-w-36",
                },
                {
                  label: "Access",
                  value: accessStatus,
                  onChange: (value) => {
                    setAccessStatus(value);
                    setPage(1);
                  },
                  options: [
                    { label: "All Access", value: "all" },
                    ...filterOptions.accessStatuses.map((item) => ({
                      label: displayAccessStatus(item),
                      value: item,
                    })),
                  ],
                  className: "w-full sm:w-auto sm:min-w-44",
                },
                {
                  label: "Role",
                  value: role,
                  onChange: (value) => {
                    setRole(value);
                    setPage(1);
                  },
                  options: [
                    { label: "All Roles", value: "all" },
                    ...filterOptions.roles.map((item) => ({
                      label: displayUserRole(item),
                      value: item,
                    })),
                  ],
                  className: "w-full sm:w-auto sm:min-w-36",
                },
              ]}
              segments={[]}
              activeSegment=""
              onSegmentChange={() => undefined}
            />
          </div>
          {selectedUserIds.size > 0 ? (
            <Card
              className={cn(
                "sticky top-3 z-20 mt-3 overflow-visible rounded-2xl border p-2.5 shadow-[0_22px_55px_-35px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-3",
                darkMode
                  ? "border-primary/25 bg-slate-900/95"
                  : "border-primary/20 bg-white/95",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-1 sm:px-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_12px_24px_-16px_rgba(13,148,136,0.9)]">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">
                      {selectedUserIds.size} user
                      {selectedUserIds.size === 1 ? "" : "s"} selected
                    </div>
                    <div className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                      Choose an action to apply to this selection
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="outline"
                    className="min-h-10 rounded-xl px-3 sm:px-4"
                    disabled={Boolean(bulkAction)}
                    onClick={() => void runBulkInvitationAction(false)}
                  >
                    {bulkAction === "send" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    <span className="hidden md:inline">Send invites</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "min-h-10 rounded-xl px-3 sm:px-4",
                      bulkAudienceOpen &&
                        "border-primary bg-primary/5 text-primary",
                    )}
                    disabled={Boolean(bulkAction)}
                    onClick={() => {
                      setBulkAudienceOpen((current) => !current);
                      setBulkMenuOpen(false);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden lg:inline">Assign audience</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-10 rounded-xl px-3 sm:px-4"
                    disabled={Boolean(bulkAction)}
                    onClick={() => void runBulkExport()}
                  >
                    {bulkAction === "export" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="hidden lg:inline">Export</span>
                  </Button>

                  <div className="relative">
                    <button
                      type="button"
                      aria-label="More bulk actions"
                      aria-expanded={bulkMenuOpen}
                      disabled={Boolean(bulkAction)}
                      onClick={() => {
                        setBulkMenuOpen((current) => !current);
                        setBulkAudienceOpen(false);
                      }}
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50",
                        bulkMenuOpen
                          ? "border-primary bg-primary text-white"
                          : darkMode
                            ? "border-slate-700 bg-slate-950 text-slate-300 hover:border-primary hover:text-teal-300"
                            : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary",
                      )}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {bulkMenuOpen ? (
                      <div
                        className={cn(
                          "absolute right-0 top-12 z-40 w-60 rounded-2xl border p-2 shadow-[0_24px_55px_-28px_rgba(15,23,42,0.55)]",
                          darkMode
                            ? "border-slate-700 bg-slate-900"
                            : "border-slate-200 bg-white",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setBulkMenuOpen(false);
                            void runBulkInvitationAction(true);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                            darkMode
                              ? "text-slate-200 hover:bg-slate-800"
                              : "text-slate-700 hover:bg-slate-50",
                          )}
                        >
                          <Mail className="h-4 w-4 text-primary" />
                          Resend invitations
                        </button>
                        <div
                          className={cn(
                            "my-1 border-t",
                            darkMode ? "border-slate-800" : "border-slate-100",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBulkMenuOpen(false);
                            void runBulkDeactivation();
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <UserX className="h-4 w-4" />
                          Deactivate users
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    aria-label="Clear selected users"
                    disabled={Boolean(bulkAction)}
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50",
                      darkMode
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
                    )}
                    onClick={() => {
                      setSelectedUserIds(new Set());
                      setBulkAudienceOpen(false);
                      setBulkMenuOpen(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {bulkAudienceOpen ? (
                <div
                  className={cn(
                    "mt-2 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center",
                    darkMode
                      ? "border-slate-700 bg-slate-950/70"
                      : "border-slate-200 bg-slate-50",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Audience assignment
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      The selected users will be added to the chosen audience.
                    </div>
                  </div>
                  <CompactSelect
                    ariaLabel="Audience for selected users"
                    value={bulkAudienceId}
                    disabled={Boolean(bulkAction)}
                    onChange={setBulkAudienceId}
                    options={[
                      { label: "Choose audience", value: "" },
                      ...filterOptions.audiences.map(([id, name]) => ({
                        label: name,
                        value: String(id),
                      })),
                    ]}
                    className="w-full sm:w-64"
                    buttonClassName="min-h-10 rounded-xl shadow-none"
                    darkMode={darkMode}
                  />
                  <Button
                    className="min-h-10 w-full rounded-xl px-4 sm:w-auto"
                    disabled={Boolean(bulkAction) || !bulkAudienceId}
                    loading={bulkAction === "audience"}
                    onClick={() => void runBulkAudienceAssignment()}
                  >
                    Apply audience
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : null}
        </>
      ) : null}

      {usersLoading ? (
        <div className="flex min-h-[420px] items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <div className="flex min-h-[620px] flex-col items-center justify-center px-4 py-12 text-center">
          <span className="flex h-28 w-28 items-center justify-center rounded-full border-[16px] border-primary/10 bg-primary/10 text-primary dark:border-primary/15 dark:bg-primary/15 dark:text-teal-300">
            <UserX className="h-12 w-12" />
          </span>
          <h2 className="mt-7 text-3xl font-bold text-primary dark:text-teal-300">
            No Users Yet
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
            Add users manually or import a CSV file to get started with your
            organization&apos;s user management.
          </p>
          <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Button
              className={modalButtonClassName}
              disabled={creationBlocked}
              title={creationBlocked ? creationBlockedMessage : "Add user"}
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
            <Button
              variant="outline"
              className={modalButtonClassName}
              disabled={creationBlocked}
              title={creationBlocked ? creationBlockedMessage : "Import users"}
              onClick={() => setImportOpen(true)}
            >
              Import CSV
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <CircleHelp className="h-5 w-5 text-slate-900 dark:text-slate-200" />
              Need help structuring your organization?
            </span>
            <button
              type="button"
              className="font-semibold text-primary underline underline-offset-4 dark:text-teal-300"
            >
              View Setup Guide
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[520px] flex-col justify-between py-10">
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <span className="flex h-28 w-28 items-center justify-center rounded-full border-[16px] border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
              <UserX className="h-12 w-12" />
            </span>
            <h2 className="mt-7 text-3xl font-bold text-amber-800 dark:text-amber-300">
              No users match your filters
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
              {query.trim() ? (
                <>
                  We couldn&apos;t find any record for{" "}
                  <strong className="text-red-600 dark:text-red-400">
                    &quot;{query.trim()}&quot;
                  </strong>
                  . Try adjusting your search or filters.
                </>
              ) : (
                "We couldn't find any users for the selected filters. Try adjusting or clearing them."
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setUnit("all");
                setAudience("all");
                setStatus("all");
                setAccessStatus("all");
                setRole("all");
              }}
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary transition hover:bg-primary/10 dark:text-teal-300"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All Filters
            </button>
          </div>
          <PaginationControl
            darkMode={darkMode}
            summary={`Showing 0 of ${totalUsers} users`}
            items={pageItems}
            activePage={page}
          />
        </div>
      ) : view === "table" ? (
        <Card
          className={cn(
            "mt-3 overflow-hidden rounded-[22px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-white",
          )}
        >
          <DashboardDataTable
            darkMode={darkMode}
            headers={[
              "Name",
              "Email / ID",
              "Unit",
              "Audience",
              "Role",
              "Status",
              "Access",
              "Date Added",
              "Actions",
            ]}
            minWidthClassName="min-w-[1160px]"
          >
            {filtered.map((user) => (
              <tr
                key={user.id}
                className={cn(
                  "border-t",
                  darkMode
                    ? "border-slate-800 hover:bg-slate-800/50"
                    : "border-slate-200 hover:bg-slate-50",
                )}
              >
                <td className="px-4 py-4">
                  <span className="flex items-center gap-2 font-semibold">
                    <input
                      className="accent-primary"
                      type="checkbox"
                      aria-label={`Select ${user.name}`}
                      checked={selectedUserIds.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                    <AvatarSeed seed={user.name} />
                    {user.name}
                    {isCurrentUser(user) ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary dark:bg-primary/15 dark:text-teal-300">
                        Me
                      </span>
                    ) : null}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                  {displayUserIdentity(user)}
                </td>
                <td className="px-4 py-4 text-xs font-bold uppercase">
                  {user.unit}
                </td>
                <td className="max-w-56 px-4 py-4">
                  <AudienceTags audiences={user.audiences} />
                </td>
                <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                  {displayUserRole(user.role)}
                </td>
                <td className="px-4 py-4">
                  <StatusPill status={user.status} />
                </td>
                <td className="px-4 py-4">
                  <AccessStatusPill status={user.accessStatus} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-500 dark:text-slate-400">
                  {user.dateAdded}
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    aria-label={`View ${user.name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </DashboardDataTable>
          <PaginationControl
            darkMode={darkMode}
            summary={`Showing ${firstVisible}-${lastVisible} of ${totalUsers} users`}
            items={pageItems}
            activePage={page}
            onPageChange={setPage}
            onPreviousPage={() =>
              setPage((current) => Math.max(1, current - 1))
            }
            onNextPage={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            hasPreviousPage={page > 1}
            hasNextPage={page < totalPages}
          />
        </Card>
      ) : (
        <>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((user) => (
              <Card
                key={user.id}
                role="button"
                tabIndex={0}
                aria-label={`View ${user.name} details`}
                onClick={() => setSelectedUser(user)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedUser(user);
                  }
                }}
                className={cn(
                  "min-h-72 cursor-pointer rounded-[22px] border p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.4)] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  darkMode
                    ? "border-slate-800 bg-slate-900 hover:border-primary/40 hover:bg-slate-800/80"
                    : "border-slate-100 bg-white hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_28px_65px_-38px_rgba(15,23,42,0.5)]",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 text-left">
                    <AvatarSeed seed={user.name} />
                    <div>
                      <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">
                        {user.name}
                        {isCurrentUser(user) ? (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary dark:bg-primary/15 dark:text-teal-300">
                            Me
                          </span>
                        ) : null}
                      </h3>
                      <div className="text-sm font-semibold text-primary">
                        {displayUserIdentity(user)}
                      </div>
                    </div>
                  </div>
                  <input
                    className="h-4 w-4 accent-primary"
                    type="checkbox"
                    aria-label={`Select ${user.name}`}
                    checked={selectedUserIds.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  />
                </div>
                <div className="mt-4 text-[10px] font-semibold uppercase">
                  Unit: <span className="text-primary">{user.unit}</span>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {displayUserRole(user.role)}
                  </span>
                  <StatusPill status={user.status} />
                </div>
                <div className="mt-3">
                  <AccessStatusPill status={user.accessStatus} />
                </div>
                <div className="mt-5 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Audiences
                </div>
                <div className="mt-2">
                  <AudienceTags audiences={user.audiences} compact />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <PaginationControl
              darkMode={darkMode}
              summary={`Showing ${firstVisible}-${lastVisible} of ${totalUsers} users`}
              items={pageItems}
              activePage={page}
              onPageChange={setPage}
              onPreviousPage={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              onNextPage={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              hasPreviousPage={page > 1}
              hasNextPage={page < totalPages}
            />
          </div>
        </>
      )}
      {addOpen ? (
        <AddUserModal
          darkMode={darkMode}
          onClose={() => setAddOpen(false)}
          unitOptions={addUserUnitOptions}
          audienceOptions={filterOptions.audiences.map(([id, name]) => ({
            id,
            name,
          }))}
          onAdd={async (user) => {
            if (user.unit_id === null) return null;
            const result = await createTenantUser({
              full_name: user.name,
              email: user.email,
              matric_or_staff_id: user.matricOrStaffId,
              unit_id: user.unit_id,
              initial_audience_ids: user.audience_ids,
              role: user.role,
              status: user.status,
              send_invitation: Boolean(user.email),
            });
            if (!result.success) {
              showToast("error", "Unable to create user", result.message);
              return null;
            }

            const createdUser = toUserRecord(result.data);
            setUsers((current) => [createdUser, ...current]);
            setTotalUsers((current) => current + 1);
            return createdUser;
          }}
          onViewProfile={setSelectedUser}
        />
      ) : null}
      {editingUser ? (
        <AddUserModal
          darkMode={darkMode}
          initialUser={editingUser}
          onClose={() => setEditingUser(null)}
          unitOptions={addUserUnitOptions}
          audienceOptions={filterOptions.audiences.map(([id, name]) => ({
            id,
            name,
          }))}
          onAdd={async (updatedUser) => {
            const result = await updateTenantUser(updatedUser.id, {
              full_name: updatedUser.name,
              email: updatedUser.email || null,
              matric_or_staff_id: updatedUser.matricOrStaffId,
              unit_id: updatedUser.unit_id ?? undefined,
              audience_ids: updatedUser.audience_ids,
              role: updatedUser.role,
              status: updatedUser.status,
            });
            if (!result.success) {
              showToast("error", "Unable to update user", result.message);
              return null;
            }

            const savedUser = toUserRecord(result.data);
            setUsers((current) =>
              current.map((user) =>
                user.id === savedUser.id ? savedUser : user,
              ),
            );
            setSelectedUser(savedUser);
            return savedUser;
          }}
          onViewProfile={setSelectedUser}
        />
      ) : null}
      {transferringUser ? (
        <TransferUserModal
          user={transferringUser}
          darkMode={darkMode}
          unitOptions={addUserUnitOptions}
          onClose={() => setTransferringUser(null)}
          onTransfer={async (targetUnitId, targetUnitName, reason) => {
            const result = await transferTenantUser(transferringUser.id, {
              target_unit_id: targetUnitId,
              audience_ids: [],
              reason: reason || undefined,
            });
            if (!result.success) {
              showToast("error", "Unable to transfer user", result.message);
              return;
            }
            const updatedUser = await refreshUserProfile(transferringUser.id);
            setTransferringUser(null);
            showToast(
              "success",
              "User transferred",
              result.data.message ||
                `${updatedUser?.name ?? transferringUser.name} was transferred to ${targetUnitName}.`,
            );
          }}
        />
      ) : null}
      {statusUser ? (
        <UserStatusModal
          user={statusUser}
          darkMode={darkMode}
          replacementUsers={users.filter(
            (user) =>
              user.id !== statusUser.id &&
              user.status === "active" &&
              isAdministrativeRole(user.role),
          )}
          onClose={() => setStatusUser(null)}
          onConfirm={async (nextStatus, reason, replacementAdminId) => {
            if (nextStatus === "inactive") {
              const deactivation = await deactivateTenantUser(statusUser.id, {
                reason: reason || undefined,
                replacement_admin_id: replacementAdminId,
              });
              if (!deactivation.success) {
                showToast(
                  deactivation.status === 409 ? "warning" : "error",
                  deactivation.status === 409
                    ? "Reassignment required"
                    : "Unable to deactivate user",
                  deactivation.message,
                );
                return;
              }
              const updatedUser = await refreshUserProfile(statusUser.id);
              setStatusUser(null);
              showToast(
                "success",
                "User deactivated",
                deactivation.data.message ||
                  `${updatedUser?.name ?? statusUser.name} was deactivated.`,
              );
              return;
            }

            const activation = await activateTenantUser(statusUser.id, {
              reason: reason || undefined,
              replacement_admin_id: replacementAdminId,
            });
            if (!activation.success) {
              showToast(
                "error",
                "Unable to reactivate user",
                activation.message,
              );
              return;
            }

            const detail = await getTenantUser(statusUser.id);
            const updatedUser = detail.success
              ? toUserRecord(detail.data)
              : {
                  ...statusUser,
                  status: "active" as const,
                  accessStatus: statusUser.email
                    ? ("pending_setup" as const)
                    : ("no_email" as const),
                  loginEnabled: Boolean(statusUser.email),
                };
            setUsers((current) =>
              current.map((user) =>
                user.id === updatedUser.id ? updatedUser : user,
              ),
            );
            setSelectedUser(updatedUser);
            setStatusUser(null);
            showToast(
              "success",
              "User reactivated",
              activation.data.message || `${updatedUser.name} was reactivated.`,
            );
          }}
        />
      ) : null}
      {importOpen ? (
        <ImportUsersModal
          darkMode={darkMode}
          existingUsers={users}
          onClose={() => setImportOpen(false)}
          onImport={(importedUsers) =>
            setUsers((current) => [...importedUsers, ...current])
          }
        />
      ) : null}
      {selectedUser ? (
        <UserDetailDrawer
          user={selectedUser}
          darkMode={darkMode}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            setEditingUser(selectedUser);
            setSelectedUser(null);
          }}
          onTransfer={() => {
            setTransferringUser(selectedUser);
            setSelectedUser(null);
          }}
          onDeactivate={() => {
            setStatusUser(selectedUser);
            setSelectedUser(null);
          }}
          onSendInvitation={() => sendInvitation(selectedUser)}
          onResendInvitation={() => sendInvitation(selectedUser, true)}
          onRevokeInvitation={() => revokeInvitation(selectedUser)}
          isSelf={isCurrentUser(selectedUser)}
        />
      ) : null}
      {toast ? (
        <DashboardToast
          tone={toast.tone}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      ) : null}
    </section>
  );
}
