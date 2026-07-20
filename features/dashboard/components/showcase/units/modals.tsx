"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Lock,
  MapPin,
  MoreVertical,
  Shuffle,
  UserCog,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  archiveUnit,
  assignUnitAdmin,
  createTenantUnit,
  reassignUnitAdmin,
  updateTenantUnit,
} from "@/features/dashboard/api/tenant-units";
import { cn } from "@/utils";
import { CompactSelect } from "../cards/ShowcaseParts";
import {
  ADMIN_CANDIDATES,
  ADMIN_ROLES,
  UNIT_CREATION_STATUSES,
  UNIT_FORM_DEFAULTS,
  UNIT_TYPES,
} from "./data";
import {
  ArchiveInfo,
  AvatarSeed,
  Field,
  FieldError,
  FieldWarning,
  InlineNotice,
  SummaryLine,
  SupportCard,
  UnitStatusPill,
  inputClassName,
  toTitleCase,
} from "./shared";
import type {
  AdminRole,
  ArchiveUnitModalProps,
  AssignAdminModalProps,
  CreateUnitModalProps,
  CreateUnitStatus,
  EditUnitModalProps,
  MoveUsersModalProps,
  UnitType,
} from "./types";
import type {
  TenantUnitDetail,
  UnitArchiveBlocker,
} from "@/features/dashboard/api/tenant-units";

type UnitActionState = "draft" | "create" | "edit" | "archive" | null;

type UnitSuccessPreview = {
  id: number;
  name: string;
  lifecycleStatus: "ACTIVE" | "ARCHIVED" | "RESTRICTED" | "PENDING ARCHIVE";
  totalUsers: string;
  audiences: string;
  sessions: string;
  admins: string[];
};

function formatUnitMetric(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function normalizeSuccessStatus(value: string | null | undefined): UnitSuccessPreview["lifecycleStatus"] {
  const normalized = value?.trim().toUpperCase();

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

function buildUnitSuccessPreview({
  data,
  fallbackName,
  fallbackStatus,
  admins,
}: {
  data?: TenantUnitDetail;
  fallbackName: string;
  fallbackStatus?: string;
  admins: string[];
}): UnitSuccessPreview {
  return {
    id: data?.unit_id ?? 0,
    name: toTitleCase(data?.name ?? fallbackName),
    lifecycleStatus: normalizeSuccessStatus(data?.lifecycle_status ?? fallbackStatus),
    totalUsers: formatUnitMetric(data?.total_users),
    audiences: formatUnitMetric(data?.total_audiences),
    sessions: formatUnitMetric(data?.active_sessions),
    admins: admins.length > 0 ? admins : ["Unassigned"],
  };
}

function UnitCompletionState({
  darkMode,
  title,
  description,
  preview,
  managementHref = "/dashboard/units",
}: {
  darkMode: boolean;
  title: string;
  description: string;
  preview: UnitSuccessPreview;
  managementHref?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-120">
      <div className="flex justify-center">
        <div className="inline-flex h-22 w-22 items-center justify-center rounded-full bg-[#16a394] text-white shadow-[0_24px_60px_-28px_rgba(22,163,148,0.55)]">
          <Check className="h-11 w-11" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="text-3xl font-semibold tracking-[-0.03em]">{title}</div>
        <p className={cn("mx-auto mt-3 max-w-85 text-sm leading-6", darkMode ? "text-slate-400" : "text-slate-500")}>
          {description}
        </p>
      </div>

      <Card
        className={cn(
          "mt-8 overflow-hidden rounded-[24px] border shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)]",
          darkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
      >
        <div className="flex items-start justify-between px-5 pt-4">
          <UnitStatusPill status={preview.lifecycleStatus} />
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-xl border",
              darkMode
                ? "border-slate-700 bg-slate-950 text-slate-300"
                : "border-slate-200 bg-white text-slate-500",
            )}
            disabled
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-4 pt-3">
          <div className="text-[1.9rem] font-semibold tracking-[-0.04em]">{preview.name}</div>
        </div>

        <div className={cn("grid grid-cols-3 border-y", darkMode ? "border-slate-800" : "border-slate-200")}>
          {[
            { label: "Total Users", value: preview.totalUsers },
            { label: "Audiences", value: preview.audiences },
            { label: "Sessions", value: preview.sessions, valueClassName: "text-[#22c55e]" },
          ].map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "border-r px-5 py-4 last:border-r-0",
                darkMode ? "border-slate-800" : "border-slate-200",
              )}
            >
              <div className={cn("text-[10px] font-semibold uppercase tracking-[0.08em]", darkMode ? "text-slate-400" : "text-slate-500")}>
                {metric.label}
              </div>
              <div className={cn("mt-2 text-[1.7rem] font-semibold leading-none", metric.valueClassName)}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4">
          <div className="text-sm font-semibold">ASSIGNED ADMINS</div>
          <div className="mt-4 space-y-3">
            {preview.admins.map((admin) => (
              <div key={admin} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <AvatarSeed seed={admin} />
                  <span>{admin}</span>
                </div>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[9px] font-bold uppercase",
                    darkMode
                      ? "bg-slate-800 text-slate-300"
                      : "bg-[#eeeeee] text-slate-500",
                  )}
                >
                  Admin
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href={managementHref}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition",
            darkMode
              ? "border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back To Unit Management
        </Link>
        <Link
          href={preview.id > 0 ? `/dashboard/units/${preview.id}` : managementHref}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b]"
        >
          View Unit Details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function MoveUsersModal({
  darkMode,
  open,
  onClose,
  unit,
  availableUnits = [],
}: MoveUsersModalProps) {
  const [destinationUnitId, setDestinationUnitId] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [notifyAdmins, setNotifyAdmins] = useState(true);
  const [confirmMove, setConfirmMove] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [planPrepared, setPlanPrepared] = useState(false);

  if (!open) return null;

  const destinationUnit =
    availableUnits.find((candidate) => String(candidate.id) === destinationUnitId) ?? null;
  const canSubmit =
    destinationUnitId.length > 0 &&
    moveReason.trim().length >= 10 &&
    confirmMove;

  function handleClose() {
    setDestinationUnitId("");
    setMoveReason("");
    setNotifyAdmins(true);
    setConfirmMove(false);
    setSubmitError("");
    setPlanPrepared(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <Card
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-170 overflow-y-auto rounded-[28px] border p-6",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
      >
        {planPrepared ? (
          <div className="mx-auto w-full max-w-110">
            <div className="flex justify-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#16a394] text-white shadow-[0_24px_60px_-28px_rgba(22,163,148,0.55)]">
                <Shuffle className="h-10 w-10" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-3xl font-semibold tracking-[-0.03em]">Move Plan Ready</div>
              <p className={cn("mx-auto mt-3 max-w-90 text-sm leading-6", darkMode ? "text-slate-400" : "text-slate-500")}>
                Users from <span className="font-semibold">{toTitleCase(unit.name)}</span> are prepared to be moved to{" "}
                <span className="font-semibold">{destinationUnit?.name ?? "the selected unit"}</span>.
              </p>
            </div>

            <Card
              className={cn(
                "mt-8 rounded-[24px] border p-5",
                darkMode
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-100 bg-slate-50 text-slate-900",
              )}
            >
              <div className="text-sm font-semibold">Transfer summary</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SummaryLine label="Source unit" value={toTitleCase(unit.name)} />
                <SummaryLine label="Destination unit" value={destinationUnit?.name ?? "Not selected"} />
                <SummaryLine label="Users to review" value={unit.totalUsers} />
                <SummaryLine label="Notify admins" value={notifyAdmins ? "Yes" : "No"} />
              </div>
              <div className={cn("mt-4 rounded-2xl border px-4 py-4 text-sm", darkMode ? "border-slate-800 bg-slate-950 text-slate-300" : "border-slate-200 bg-white text-slate-600")}>
                This screen now captures the destination and transfer rationale. The live bulk user-transfer endpoint is not connected on this unit detail page yet, so the move still needs backend execution support before records are actually relocated.
              </div>
            </Card>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                className="min-h-11 rounded-xl px-5 py-3 text-sm"
                onClick={handleClose}
              >
                Back To Unit
              </Button>
              {destinationUnit ? (
                <Link
                  href={`/dashboard/units/${destinationUnit.id}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] transition hover:bg-[#0b857b]"
                >
                  View Destination Unit
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold">Move Users</div>
                <div className={cn("mt-1 text-sm", darkMode ? "text-slate-400" : "text-slate-500")}>
                  Prepare a user-transfer plan so this unit can move closer to archive readiness.
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                  darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Card className={cn("rounded-2xl border p-4", darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-slate-50 text-slate-900")}>
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Source Unit</div>
                <div className="mt-2 text-lg font-semibold">{toTitleCase(unit.name)}</div>
              </Card>
              <Card className={cn("rounded-2xl border p-4", darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-slate-50 text-slate-900")}>
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Users To Move</div>
                <div className="mt-2 text-lg font-semibold">{unit.totalUsers}</div>
              </Card>
              <Card className={cn("rounded-2xl border p-4", darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-slate-50 text-slate-900")}>
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Archive Impact</div>
                <div className="mt-2 text-lg font-semibold">Users blocker</div>
              </Card>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Destination unit" required>
                <CompactSelect
                  value={destinationUnitId}
                  onChange={setDestinationUnitId}
                  options={[
                    { label: "Select destination unit", value: "" },
                    ...availableUnits.map((candidate) => ({
                      label: candidate.name,
                      value: String(candidate.id),
                    })),
                  ]}
                  className="w-full"
                  buttonClassName={cn(
                    "min-h-12 rounded-2xl px-4 py-3 text-sm shadow-none",
                    darkMode
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700",
                  )}
                  darkMode={darkMode}
                />
                {availableUnits.length === 0 ? (
                  <FieldWarning message="No other units are available as a destination yet." />
                ) : null}
              </Field>

              <Field label="Admin notification">
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm",
                    darkMode
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-100 bg-slate-50",
                  )}
                >
                  <Checkbox
                    id={`move-users-notify-${unit.id}`}
                    label="Notify source and destination unit admins when the transfer is executed."
                    checked={notifyAdmins}
                    onChange={(event) => setNotifyAdmins(event.target.checked)}
                    className={cn("w-full border-none bg-transparent px-0 py-0", darkMode ? "text-white" : "text-slate-900")}
                  />
                </div>
              </Field>
            </div>

            <Field label="Reason for moving users" className="mt-5" required>
              <textarea
                value={moveReason}
                onChange={(event) => {
                  setMoveReason(event.target.value);
                  setSubmitError("");
                }}
                className={cn(inputClassName(darkMode), "min-h-28")}
                placeholder="Explain why these users should be moved and what the destination unit should handle next."
              />
              {moveReason.trim().length > 0 && moveReason.trim().length < 10 ? (
                <FieldError message="Use at least 10 characters so the move plan is clear." />
              ) : null}
            </Field>

            <div
              className={cn(
                "mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm",
                darkMode
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-100 bg-slate-50",
              )}
            >
              <Checkbox
                id={`move-users-confirm-${unit.id}`}
                label="I understand this does not archive the unit yet and the transfer still needs execution support."
                checked={confirmMove}
                onChange={(event) => setConfirmMove(event.target.checked)}
                className={cn("w-full border-none bg-transparent px-0 py-0", darkMode ? "text-white" : "text-slate-900")}
              />
            </div>

            {submitError ? <FieldError message={submitError} className="mt-4" /> : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                className="min-h-11 rounded-xl px-5 py-3 text-sm"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="min-h-11 rounded-xl px-5 py-3 text-sm"
                disabled={!canSubmit}
                onClick={() => {
                  if (!destinationUnitId) {
                    setSubmitError("Choose a destination unit before continuing.");
                    return;
                  }
                  if (moveReason.trim().length < 10) {
                    setSubmitError("Use at least 10 characters so the move plan is clear.");
                    return;
                  }
                  setPlanPrepared(true);
                }}
              >
                Prepare Move Plan
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export function CreateUnitModal({
  darkMode,
  open,
  onClose,
  planLimitReached = false,
  existingUnitNames = [],
  unitTypeOptions = UNIT_TYPES.map((type) => ({ label: type, value: type })),
  countryOptions = [],
  adminOptions = [],
  adminOptionsNote,
  onCreated,
}: CreateUnitModalProps) {
  const [unitName, setUnitName] = useState("");
  const [unitType, setUnitType] = useState("Campus");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [status, setStatus] = useState<CreateUnitStatus>("Active");
  const [assignedAdmins, setAssignedAdmins] = useState<number[]>([]);
  const [showDuplicateError, setShowDuplicateError] = useState(false);
  const [showMissingAdminWarning, setShowMissingAdminWarning] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<UnitActionState>(null);
  const [successPreview, setSuccessPreview] = useState<UnitSuccessPreview | null>(null);
  const [successVariant, setSuccessVariant] = useState<"draft" | "create" | null>(null);

  if (!open) return null;

  const normalizedUnitName = unitName.trim().toLowerCase();
  const duplicateName = existingUnitNames.some(
    (unitNameValue) => unitNameValue.trim().toLowerCase() === normalizedUnitName,
  );

  function resetCreateForm() {
    setUnitName("");
    setUnitType(unitTypeOptions[0]?.value ?? "Campus");
    setLocation("");
    setCity("");
    setStateRegion("");
    setCountry("");
    setDescription("");
    setShortCode("");
    setStatus("Active");
    setAssignedAdmins([]);
    setShowDuplicateError(false);
    setShowMissingAdminWarning(false);
    setSubmitError("");
    setSubmitting(false);
    setSubmitAction(null);
    setSuccessPreview(null);
    setSuccessVariant(null);
  }

  function handleClose() {
    resetCreateForm();
    onClose();
  }

  async function handleSave(asDraft: boolean) {
    setShowDuplicateError(duplicateName);
    setShowMissingAdminWarning(!asDraft && assignedAdmins.length === 0);

    if (duplicateName) {
      return;
    }

    setSubmitError("");
    setSubmitAction(asDraft ? "draft" : "create");
    setSubmitting(true);

    const result = await createTenantUnit({
      name: unitName.trim(),
      short_code: shortCode.trim() || null,
      type: unitType.trim() || null,
      description: description.trim() || null,
      location: location.trim() || null,
      city: city.trim() || null,
      state_region: stateRegion.trim() || null,
      country: country.trim() || null,
      status: asDraft ? "draft" : status === "Active" ? "active" : "draft",
      assigned_admin_ids: assignedAdmins.length > 0 ? assignedAdmins : undefined,
      last_updated_at: new Date().toISOString(),
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.message);
      setSubmitAction(null);
      return;
    }

    const selectedAdminNames = adminOptions
      .filter((candidate) => assignedAdmins.includes(candidate.id))
      .map((candidate) => candidate.name);

    await onCreated?.();
    setSuccessPreview(
      buildUnitSuccessPreview({
        data: result.data,
        fallbackName: unitName,
        fallbackStatus: asDraft ? "draft" : status,
        admins: selectedAdminNames,
      }),
    );
    setSuccessVariant(asDraft ? "draft" : "create");
    setSubmitAction(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <Card
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-200 overflow-y-auto rounded-[28px] border p-6",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
      >
        {successPreview ? (
          <UnitCompletionState
            darkMode={darkMode}
            title={successVariant === "draft" ? "Unit Draft Saved Successfully" : "Unit Created Successfully"}
            description={
              successVariant === "draft"
                ? `Your unit draft "${successPreview.name}" has been saved and is ready for review.`
                : `Your new unit "${successPreview.name}" has been created successfully.`
            }
            preview={successPreview}
          />
        ) : (
          <>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">Create Unit</div>
            <div
              className={cn(
                "mt-1 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Create a tenant-scoped unit with isolated admin ownership and audit logging.
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {planLimitReached ? (
          <InlineNotice
            tone="warning"
            title="Plan limit warning"
            body="Your current plan has reached the unit limit. Upgrade or archive an unused unit before creating another."
          />
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Unit Name" required>
            <input
              value={unitName}
              onChange={(event) => {
                setUnitName(event.target.value);
                setShowDuplicateError(false);
              }}
              className={inputClassName(darkMode)}
              placeholder="Legacy Campus"
            />
            {showDuplicateError ? (
              <FieldError message="Duplicate name validation: a unit with this name already exists." />
            ) : null}
          </Field>

          <Field label="Unit Type" required>
            <CompactSelect
              value={unitType}
              onChange={(value) => setUnitType(value)}
              options={unitTypeOptions}
              className="w-full"
              buttonClassName={cn(
                "min-h-12 rounded-2xl px-4 py-3 text-sm shadow-none",
                darkMode
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700",
              )}
              darkMode={darkMode}
            />
          </Field>

          <Field label="Country">
            {countryOptions.length > 0 ? (
              <CompactSelect
                value={country}
                onChange={(value) => setCountry(value)}
                options={countryOptions}
                className="w-full"
                buttonClassName={cn(
                  "min-h-12 rounded-2xl px-4 py-3 text-sm shadow-none",
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700",
                )}
                darkMode={darkMode}
              />
            ) : (
              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className={inputClassName(darkMode)}
                placeholder="Nigeria"
              />
            )}
          </Field>

          <Field label="State / Region">
            <input
              value={stateRegion}
              onChange={(event) => setStateRegion(event.target.value)}
              className={inputClassName(darkMode)}
              placeholder="Edo State"
            />
          </Field>

          <Field label="City">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={inputClassName(darkMode)}
              placeholder="Benin City"
            />
          </Field>

          <Field label="Location Detail">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={cn(inputClassName(darkMode), "pl-10")}
                placeholder="Campus, building, or address detail"
              />
            </div>
          </Field>

          <Field label="Optional Code / Short Name">
            <input
              value={shortCode}
              onChange={(event) => setShortCode(event.target.value)}
              className={inputClassName(darkMode)}
              placeholder="LEG-CMP"
            />
          </Field>

          <Field label="Status" required>
            <div className="flex flex-wrap gap-2">
              {UNIT_CREATION_STATUSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    status === option
                      ? "border-[#16a394] bg-[#edf9f8] text-[#0f766e]"
                      : darkMode
                        ? "border-slate-700 bg-slate-900 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Assign Unit Admins">
            <div
              className={cn(
                "rounded-2xl border p-4",
                darkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <div
                className={cn(
                  "grid gap-2",
                  adminOptions.length > 3 && "max-h-64 overflow-y-auto pr-1",
                )}
              >
                {adminOptions.map((candidate) => (
                  <Checkbox
                    key={String(candidate.id)}
                    id={`create-unit-admin-${candidate.id}`}
                    label={
                      <span>
                        {candidate.name}
                        <span className="block text-xs text-slate-500">
                          {candidate.email}
                        </span>
                      </span>
                    }
                    checked={assignedAdmins.includes(candidate.id)}
                    onChange={(event) => {
                      setAssignedAdmins((current) =>
                        event.target.checked
                          ? [...current, candidate.id]
                          : current.filter((id) => id !== candidate.id),
                      );
                      setShowMissingAdminWarning(false);
                    }}
                    className={cn(
                      "border px-3 py-3",
                      darkMode
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-white",
                    )}
                  />
                ))}
              </div>
              {adminOptions.length === 0 ? (
                <FieldWarning message={adminOptionsNote ?? "No assignable unit admins are available from the live data source yet."} />
              ) : null}
              {adminOptions.length > 0 && adminOptionsNote ? (
                <FieldWarning message={adminOptionsNote} />
              ) : null}
              {showMissingAdminWarning ? (
                <FieldWarning message="Missing Unit Admin warning: you can save as draft, but creating an active unit without an assigned admin is discouraged." />
              ) : null}
            </div>
          </Field>
        </div>

        <Field label="Description" className="mt-5">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={cn(inputClassName(darkMode), "min-h-28")}
            placeholder="Describe the purpose, scope, or operational notes for this unit."
          />
        </Field>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SupportCard
            icon={<Lock className="h-4 w-4" />}
            title="Unit isolation"
            body="Users, admins, audiences, sessions, and attendance records remain scoped to this tenant unit."
            darkMode={darkMode}
          />
          <SupportCard
            icon={<UserCog className="h-4 w-4" />}
            title="Admin assignment"
            body="Role assignment is tracked, and initial admins can be attached at creation time."
            darkMode={darkMode}
          />
          <SupportCard
            icon={<ClipboardList className="h-4 w-4" />}
            title="Audit logging"
            body="Unit creation, isolation, admin assignment, and later lifecycle changes are all logged."
            darkMode={darkMode}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {submitError ? (
            <div className="w-full text-sm font-medium text-[#dc2626]">{submitError}</div>
          ) : null}
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={() => void handleSave(true)}
            disabled={submitting}
            loading={submitAction === "draft"}
          >
            Save as Draft
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={planLimitReached || unitName.trim().length === 0 || submitting}
            onClick={() => void handleSave(false)}
            loading={submitAction === "create"}
          >
            Create Unit
          </Button>
        </div>
          </>
        )}
      </Card>
    </div>
  );
}

export function EditUnitModal({
  darkMode,
  open,
  onClose,
  unit,
  existingUnitNames = [],
  unitTypeOptions = UNIT_TYPES.map((type) => ({ label: type, value: type })),
  countryOptions = [],
  adminOptions = [],
  adminOptionsNote,
  onUpdated,
}: EditUnitModalProps) {
  const defaults = UNIT_FORM_DEFAULTS[unit.id];
  const [unitName, setUnitName] = useState(toTitleCase(unit.name));
  const [unitType, setUnitType] = useState(
    unit.type || defaults?.unitType || unitTypeOptions[0]?.value || "Campus",
  );
  const [location, setLocation] = useState(unit.location || defaults?.location || "");
  const [city, setCity] = useState(unit.city || "");
  const [stateRegion, setStateRegion] = useState(unit.stateRegion || "");
  const [country, setCountry] = useState(unit.country || "");
  const [description, setDescription] = useState(
    unit.description || defaults?.description || "",
  );
  const [shortCode, setShortCode] = useState(unit.shortCode || defaults?.shortCode || "");
  const [status, setStatus] = useState<CreateUnitStatus>(
    unit.status?.toLowerCase() === "draft" ? "Draft" : defaults?.status || "Active",
  );
  const [assignedAdmins, setAssignedAdmins] = useState<number[]>([]);
  const [showDuplicateError, setShowDuplicateError] = useState(false);
  const [showMissingAdminWarning, setShowMissingAdminWarning] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<UnitActionState>(null);
  const [successPreview, setSuccessPreview] = useState<UnitSuccessPreview | null>(null);

  if (!open) return null;

  const normalizedUnitName = unitName.trim().toLowerCase();
  const duplicateName = existingUnitNames.some(
    (existingUnitName) =>
      existingUnitName.trim().toLowerCase() === normalizedUnitName &&
      existingUnitName.trim().toLowerCase() !== unit.name.trim().toLowerCase(),
  );

  function resetEditState() {
    setShowDuplicateError(false);
    setShowMissingAdminWarning(false);
    setSubmitError("");
    setSubmitting(false);
    setSubmitAction(null);
    setSuccessPreview(null);
  }

  function handleClose() {
    resetEditState();
    onClose();
  }

  async function handleSave() {
    setShowDuplicateError(duplicateName);
    setShowMissingAdminWarning(status === "Active" && assignedAdmins.length === 0);

    if (duplicateName) {
      return;
    }

    setSubmitError("");
    setSubmitAction("edit");
    setSubmitting(true);

    const result = await updateTenantUnit(unit.id, {
      name: unitName.trim(),
      short_code: shortCode.trim() || null,
      type: unitType.trim() || null,
      description: description.trim() || null,
      location: location.trim() || null,
      city: city.trim() || null,
      state_region: stateRegion.trim() || null,
      country: country.trim() || null,
      status: status === "Draft" ? "draft" : "active",
      assigned_admin_ids: assignedAdmins.length > 0 ? assignedAdmins : undefined,
      last_updated_at: unit.updatedAt || new Date().toISOString(),
    });

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.message);
      setSubmitAction(null);
      return;
    }

    const selectedAdminNames =
      assignedAdmins.length > 0
        ? adminOptions
            .filter((candidate) => assignedAdmins.includes(candidate.id))
            .map((candidate) => candidate.name)
        : unit.admins;

    await onUpdated?.();
    setSuccessPreview(
      buildUnitSuccessPreview({
        data: result.data,
        fallbackName: unitName,
        fallbackStatus: status,
        admins: selectedAdminNames,
      }),
    );
    setSubmitAction(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <Card
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-200 overflow-y-auto rounded-[28px] border p-6",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
      >
        {successPreview ? (
          <UnitCompletionState
            darkMode={darkMode}
            title="Unit Updated Successfully"
            description={`Your changes to "${successPreview.name}" have been saved successfully.`}
            preview={successPreview}
          />
        ) : (
          <>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">Edit Unit</div>
            <div
              className={cn(
                "mt-1 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Update unit metadata, admin ownership, and lifecycle configuration with audit visibility.
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Unit Name" required>
            <input
              value={unitName}
              onChange={(event) => {
                setUnitName(event.target.value);
                setShowDuplicateError(false);
              }}
              className={inputClassName(darkMode)}
              placeholder="Legacy Campus"
            />
            {showDuplicateError ? (
              <FieldError message="Duplicate name validation: another unit already uses this name." />
            ) : null}
          </Field>

          <Field label="Unit Type" required>
            <CompactSelect
              value={unitType}
              onChange={(value) => setUnitType(value)}
              options={unitTypeOptions}
              className="w-full"
              buttonClassName={cn(
                "min-h-12 rounded-2xl px-4 py-3 text-sm shadow-none",
                darkMode
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700",
              )}
              darkMode={darkMode}
            />
          </Field>

          <Field label="Country">
            {countryOptions.length > 0 ? (
              <CompactSelect
                value={country}
                onChange={(value) => setCountry(value)}
                options={countryOptions}
                className="w-full"
                buttonClassName={cn(
                  "min-h-12 rounded-2xl px-4 py-3 text-sm shadow-none",
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700",
                )}
                darkMode={darkMode}
              />
            ) : (
              <input
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className={inputClassName(darkMode)}
                placeholder="Nigeria"
              />
            )}
          </Field>

          <Field label="State / Region">
            <input
              value={stateRegion}
              onChange={(event) => setStateRegion(event.target.value)}
              className={inputClassName(darkMode)}
              placeholder="Edo State"
            />
          </Field>

          <Field label="City">
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className={inputClassName(darkMode)}
              placeholder="Benin City"
            />
          </Field>

          <Field label="Location Detail">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={cn(inputClassName(darkMode), "pl-10")}
                placeholder="Campus, building, or address detail"
              />
            </div>
          </Field>

          <Field label="Optional Code / Short Name">
            <input
              value={shortCode}
              onChange={(event) => setShortCode(event.target.value)}
              className={inputClassName(darkMode)}
              placeholder="LEG-CMP"
            />
          </Field>

          <Field label="Status" required>
            <div className="flex flex-wrap gap-2">
              {UNIT_CREATION_STATUSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    status === option
                      ? "border-[#16a394] bg-[#edf9f8] text-[#0f766e]"
                      : darkMode
                        ? "border-slate-700 bg-slate-900 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Assign Unit Admins">
            <div
              className={cn(
                "rounded-2xl border p-4",
                darkMode
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <div
                className={cn(
                  "grid gap-2",
                  adminOptions.length > 3 && "max-h-64 overflow-y-auto pr-1",
                )}
              >
                {adminOptions.map((candidate) => (
                  <Checkbox
                    key={String(candidate.id)}
                    id={`edit-unit-admin-${candidate.id}`}
                    label={
                      <span>
                        {candidate.name}
                        <span className="block text-xs text-slate-500">
                          {candidate.email}
                        </span>
                      </span>
                    }
                    checked={assignedAdmins.includes(candidate.id)}
                    onChange={(event) => {
                      setAssignedAdmins((current) =>
                        event.target.checked
                          ? [...current, candidate.id]
                          : current.filter((id) => id !== candidate.id),
                      );
                      setShowMissingAdminWarning(false);
                    }}
                    className={cn(
                      "border px-3 py-3",
                      darkMode
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-white",
                    )}
                  />
                ))}
              </div>
              {adminOptions.length === 0 ? (
                <FieldWarning message={adminOptionsNote ?? "No assignable unit admins are available from the live data source yet."} />
              ) : null}
              {adminOptions.length > 0 && adminOptionsNote ? (
                <FieldWarning message={adminOptionsNote} />
              ) : null}
              {showMissingAdminWarning ? (
                <FieldWarning message="At least one active Unit Admin is recommended before saving governance changes." />
              ) : null}
            </div>
          </Field>
        </div>

        <Field label="Description" className="mt-5">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={cn(inputClassName(darkMode), "min-h-28")}
            placeholder="Describe the purpose, scope, or operational notes for this unit."
          />
        </Field>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <SupportCard
            icon={<Lock className="h-4 w-4" />}
            title="Unit isolation"
            body="Edits preserve tenant isolation while keeping historical activity tied to this unit."
            darkMode={darkMode}
          />
          <SupportCard
            icon={<UserCog className="h-4 w-4" />}
            title="Admin governance"
            body="Admin changes stay scoped to this unit and remain visible to audit and support teams."
            darkMode={darkMode}
          />
          <SupportCard
            icon={<ClipboardList className="h-4 w-4" />}
            title="Change logging"
            body="Metadata updates, admin assignment changes, and status changes are recorded automatically."
            darkMode={darkMode}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {submitError ? (
            <div className="w-full text-sm font-medium text-[#dc2626]">{submitError}</div>
          ) : null}
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={unitName.trim().length === 0 || submitting}
            onClick={() => void handleSave()}
            loading={submitAction === "edit"}
          >
            Save Changes
          </Button>
        </div>
          </>
        )}
      </Card>
    </div>
  );
}

export function ArchiveUnitModal({
  darkMode,
  open,
  onClose,
  unit,
  onArchived,
}: ArchiveUnitModalProps) {
  const [archiveReason, setArchiveReason] = useState("");
  const [archiveConfirmed, setArchiveConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [archiveBlockers, setArchiveBlockers] = useState<UnitArchiveBlocker[]>([]);
  const [archiveActionHint, setArchiveActionHint] = useState("");

  if (!open) return null;

  const trimmedArchiveReason = archiveReason.trim();
  const archiveReasonTooShort =
    trimmedArchiveReason.length > 0 && trimmedArchiveReason.length < 10;
  const canArchive =
    trimmedArchiveReason.length >= 10 && archiveConfirmed && !archiveReasonTooShort;
  const archiveHelpText =
    unit.lifecycleStatus === "PENDING ARCHIVE"
      ? "An archive request is already pending review."
      : "Archiving this unit will hide it from active views but historical records remain available.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-160 overflow-y-auto rounded-[28px] border p-6",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">Archive Unit</div>
            <div
              className={cn(
                "mt-1 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              This action is controlled, auditable, and does not hard-delete historical records.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ArchiveInfo label="Unit name" value={toTitleCase(unit.name)} darkMode={darkMode} />
          <ArchiveInfo
            label="Users affected"
            value={unit.affectedUsers.toLocaleString()}
            darkMode={darkMode}
          />
          <ArchiveInfo
            label="Audiences affected"
            value={String(unit.affectedAudiences)}
            darkMode={darkMode}
          />
          <ArchiveInfo
            label="Active sessions"
            value={String(unit.activeSessionsCount)}
            darkMode={darkMode}
          />
        </div>

        <div
          className={cn(
            "mt-5 rounded-2xl border px-4 py-4 text-sm",
            darkMode
              ? "border-[#5b3b45] bg-[#24151b] text-slate-200"
              : "border-[#ffd4d4] bg-[#fff5f5] text-slate-700",
          )}
        >
          <div className="font-semibold text-[#dc2626]">Archive Warning</div>
          <div className="mt-2">{archiveHelpText}</div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold">Reason for archive</span>
          <textarea
            value={archiveReason}
            onChange={(event) => {
              setArchiveReason(event.target.value);
              setSubmitError("");
              setArchiveBlockers([]);
              setArchiveActionHint("");
            }}
            className={cn(
              "mt-2 min-h-32 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
              darkMode
                ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
            )}
            placeholder="Provide the operational reason for archiving this unit."
          />
          {archiveReasonTooShort ? (
            <FieldError message="Archive reason must be at least 10 characters." />
          ) : (
            <FieldWarning message="Use at least 10 characters so the archive request can be submitted." />
          )}
        </label>

        <div
          className={cn(
            "mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm",
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-slate-50",
          )}
        >
          <Checkbox
            id={`archive-confirmed-${unit.id}`}
            label="I understand this action will be logged."
            checked={archiveConfirmed}
            onChange={(event) => setArchiveConfirmed(event.target.checked)}
            className={cn(
              "w-full border-none bg-transparent px-0 py-0",
              darkMode ? "text-white" : "text-slate-900",
            )}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {submitError ? (
            <div className="w-full text-sm font-medium text-[#dc2626]">{submitError}</div>
          ) : null}
          {archiveBlockers.length > 0 ? (
            <div
              className={cn(
                "w-full rounded-2xl border px-4 py-4 text-sm",
                darkMode
                  ? "border-slate-800 bg-slate-950/60 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-900",
              )}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f59e0b]">
                <ClipboardList className="h-4 w-4" />
                Archive blockers
              </div>
              <div className={cn("mt-1 text-sm", darkMode ? "text-slate-300" : "text-slate-600")}>
                These dependencies need attention before this archive request can succeed.
              </div>
              <div className="mt-4 space-y-3">
                {archiveBlockers.map((blocker, index) => (
                  <div
                    key={`${blocker.code ?? blocker.title}-${blocker.message ?? ""}`}
                    className={cn(
                      "rounded-2xl border px-4 py-3",
                      darkMode
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
                          darkMode
                            ? "bg-slate-950 text-[#f8b84e]"
                            : "bg-slate-100 text-[#b45309]",
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{blocker.title}</div>
                        {blocker.message ? (
                          <div
                            className={cn(
                              "mt-1 text-sm",
                              darkMode ? "text-slate-300" : "text-slate-600",
                            )}
                          >
                            {blocker.message}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {archiveActionHint ? (
                <div
                  className={cn(
                    "mt-4 rounded-2xl px-4 py-3 text-sm",
                    darkMode
                      ? "bg-slate-900 text-slate-300"
                      : "bg-white text-slate-600",
                  )}
                >
                  {archiveActionHint}
                </div>
              ) : null}
            </div>
          ) : null}
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={!canArchive}
            loading={submitting}
            onClick={async () => {
              setSubmitError("");
              setArchiveBlockers([]);
              setArchiveActionHint("");

              if (trimmedArchiveReason.length < 10) {
                setSubmitError("Archive reason must be at least 10 characters.");
                return;
              }

              setSubmitting(true);
              const result = await archiveUnit(unit.id, {
                reason: trimmedArchiveReason,
                confirm: archiveConfirmed,
                ...(unit.updatedAt ? { last_updated_at: unit.updatedAt } : {}),
              });
              setSubmitting(false);

              if (!result.success) {
                setSubmitError(result.message);
                setArchiveBlockers(result.blockers ?? []);
                setArchiveActionHint(result.actionHint ?? "");
                return;
              }

              await onArchived?.();
              onClose();
            }}
          >
            Submit Archive Request
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function AssignAdminModal({
  darkMode,
  open,
  onClose,
  unit,
  assignedAdmins = [],
  adminOptions = [],
  adminOptionsNote,
  onAssigned,
}: AssignAdminModalProps) {
  const [assignmentMode, setAssignmentMode] = useState<"assign" | "reassign">("assign");
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<AdminRole>("Unit Admin");
  const [leadAdmin, setLeadAdmin] = useState(false);
  const [twoFactorConfirmed, setTwoFactorConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (assignedAdmins.length > 0) {
      setAssignmentMode("reassign");
      setCurrentAdminId(String(assignedAdmins[0].id ?? assignedAdmins[0].email));
    } else {
      setAssignmentMode("assign");
      setCurrentAdminId("");
    }
  }, [assignedAdmins, open]);

  if (!open) return null;

  const filteredCandidates = adminOptions.filter((candidate) => {
    const haystack = `${candidate.name} ${candidate.email}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const canReassign = assignedAdmins.length > 0;
  const effectiveAssignmentMode = canReassign ? assignmentMode : "assign";

  const selectedUser =
    adminOptions.find((candidate) => String(candidate.id) === selectedUserId) ?? null;
  const currentAdmin =
    assignedAdmins.find((admin) => String(admin.id ?? admin.email) === currentAdminId) ?? null;
  const highPrivilege = selectedRole === "Unit Admin" || leadAdmin;

  let blockingError = "";
  if (query.trim().length > 0 && filteredCandidates.length === 0) {
    blockingError = "No eligible admins found.";
  }
  if (effectiveAssignmentMode === "reassign" && !currentAdmin) {
    blockingError = "Select the current admin you want to replace.";
  }
  if (
    effectiveAssignmentMode === "reassign" &&
    currentAdmin &&
    selectedUser &&
    currentAdmin.email.toLowerCase() === selectedUser.email.toLowerCase()
  ) {
    blockingError = "Choose a different replacement admin.";
  }

  const canSubmit =
    Boolean(selectedUser) &&
    blockingError.length === 0 &&
    (!highPrivilege || twoFactorConfirmed);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "scrollbar-dashboard max-h-[92vh] w-full max-w-180 overflow-y-auto rounded-[28px] border p-6",
          darkMode
            ? "border-slate-800 bg-[#0b1420] text-white"
            : "border-slate-100 bg-white text-slate-900",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold">
              {effectiveAssignmentMode === "reassign" ? "Reassign Admin" : "Assign Admin"}
            </div>
            <div
              className={cn(
                "mt-1 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Choose whether you are adding a new admin or replacing an existing assignment for this unit.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setAssignmentMode("assign");
              setCurrentAdminId("");
              setSubmitError("");
            }}
            className={cn(
              "rounded-2xl border px-4 py-4 text-left transition",
              effectiveAssignmentMode === "assign"
                ? "border-[#16a394] bg-[#edf9f8] text-[#0f766e]"
                : darkMode
                  ? "border-slate-700 bg-slate-900 text-slate-200"
                  : "border-slate-200 bg-white text-slate-700",
            )}
          >
            <div className="text-sm font-semibold">Add new admin</div>
            <div className={cn("mt-1 text-xs leading-5", effectiveAssignmentMode === "assign" ? "text-[#0f766e]" : darkMode ? "text-slate-400" : "text-slate-500")}>
              Attach another admin to this unit without replacing anyone.
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canReassign) return;
              setAssignmentMode("reassign");
              setSubmitError("");
            }}
            disabled={!canReassign}
            className={cn(
              "rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
              effectiveAssignmentMode === "reassign"
                ? "border-[#16a394] bg-[#edf9f8] text-[#0f766e]"
                : darkMode
                  ? "border-slate-700 bg-slate-900 text-slate-200"
                  : "border-slate-200 bg-white text-slate-700",
            )}
          >
            <div className="text-sm font-semibold">Replace existing admin</div>
            <div className={cn("mt-1 text-xs leading-5", effectiveAssignmentMode === "reassign" ? "text-[#0f766e]" : darkMode ? "text-slate-400" : "text-slate-500")}>
              Transfer ownership from one assigned admin to another.
            </div>
          </button>
        </div>
        {!canReassign ? (
          <FieldWarning message="No current admin assignments were found yet, so reassignment is unavailable. You can add a new admin first." />
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {effectiveAssignmentMode === "reassign" ? (
            <Field label="Replace current admin" required>
              <CompactSelect
                value={currentAdminId}
                onChange={setCurrentAdminId}
                options={[
                  { label: "Select current admin", value: "" },
                  ...assignedAdmins.map((admin) => ({
                    label: `${admin.name} (${admin.email})`,
                    value: String(admin.id ?? admin.email),
                  })),
                ]}
                className="w-full"
                buttonClassName={cn(
                  "min-h-12 rounded-2xl px-4 py-3 text-sm shadow-none",
                  darkMode
                    ? "border-slate-700 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700",
                )}
                darkMode={darkMode}
              />
            </Field>
          ) : null}

          <Field label="Search existing admin / user" required>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={inputClassName(darkMode)}
              placeholder="Search by name or email"
            />
          </Field>

          <Field label="Select user" required>
            <CompactSelect
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={[
                { label: "Select an admin", value: "" },
                ...filteredCandidates.map((candidate) => ({
                  label: `${candidate.name} (${candidate.email})`,
                  value: String(candidate.id),
                })),
              ]}
              className="w-full"
              buttonClassName={cn(
                "min-h-12 rounded-2xl px-4 py-3 text-sm shadow-none",
                darkMode
                  ? "border-slate-700 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700",
              )}
              darkMode={darkMode}
            />
          </Field>

          <Field label="Select role" required>
            <div className="flex flex-wrap gap-2">
              {ADMIN_ROLES.map((roleOption) => (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => setSelectedRole(roleOption)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold",
                    selectedRole === roleOption
                      ? "border-[#16a394] bg-[#edf9f8] text-[#0f766e]"
                      : darkMode
                        ? "border-slate-700 bg-slate-900 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  {roleOption}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Scope">
            <div
              className={cn(
                "flex min-h-12 items-center rounded-2xl border px-4 py-3 text-sm font-semibold",
                darkMode
                  ? "border-slate-700 bg-slate-900 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-600",
              )}
            >
              <Lock className="mr-2 h-4 w-4 text-[#16a394]" />
              Locked to {toTitleCase(unit.name)}
            </div>
          </Field>
        </div>

        <div
          className={cn(
            "mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm",
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-slate-50",
          )}
        >
          <Checkbox
            id={`lead-admin-${unit.id}`}
            label={
              <span>
                Optional <span className="font-semibold">Lead Unit Admin</span> toggle
              </span>
            }
            checked={leadAdmin}
            onChange={(event) => setLeadAdmin(event.target.checked)}
            className={cn(
              "w-full border-none bg-transparent px-0 py-0",
              darkMode ? "text-white" : "text-slate-900",
            )}
          />
        </div>

        {highPrivilege ? (
          <div
            className={cn(
              "mt-4 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm",
              darkMode
                ? "border-[#5b3b45] bg-[#24151b]"
                : "border-[#ffe4b5] bg-[#fff8e1]",
            )}
          >
            <Checkbox
              id={`two-factor-confirmed-${unit.id}`}
              label="High privilege detected. Re-authentication / 2FA confirmation required before assignment."
              checked={twoFactorConfirmed}
              onChange={(event) => setTwoFactorConfirmed(event.target.checked)}
              className="w-full border-none bg-transparent px-0 py-0"
            />
          </div>
        ) : null}

        {blockingError ? <FieldError message={blockingError} className="mt-4" /> : null}
        {!blockingError && adminOptionsNote ? (
          <FieldWarning message={adminOptionsNote} />
        ) : null}
        {submitError ? <FieldError message={submitError} className="mt-4" /> : null}

        <Card
          className={cn(
            "mt-5 rounded-2xl border p-4",
            darkMode
              ? "border-slate-800 bg-slate-900 text-white"
              : "border-slate-100 bg-slate-50 text-slate-900",
          )}
        >
          <div className="text-sm font-semibold">Confirmation Summary</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <SummaryLine
              label="Action"
              value={effectiveAssignmentMode === "reassign" ? "Reassign admin" : "Assign admin"}
            />
            <SummaryLine
              label="Current Admin"
              value={effectiveAssignmentMode === "reassign" ? currentAdmin?.name ?? "Not selected" : "No replacement"}
            />
            <SummaryLine label="User" value={selectedUser?.name ?? "Not selected"} />
            <SummaryLine label="Role" value={selectedRole} />
            <SummaryLine label="Scope" value={toTitleCase(unit.name)} />
            <SummaryLine label="Lead Unit Admin" value={leadAdmin ? "Yes" : "No"} />
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Note: This assignment will be logged.
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={!canSubmit}
            loading={submitting}
            onClick={async () => {
              if (!selectedUser) {
                return;
              }

              setSubmitError("");
              setSubmitting(true);
              const result =
                effectiveAssignmentMode === "reassign"
                  ? await reassignUnitAdmin(unit.id, {
                      current_user_id: currentAdmin?.id,
                      current_user_email: currentAdmin?.email,
                      new_user_id: selectedUser.id,
                      role: selectedRole,
                      is_lead_admin: leadAdmin,
                    })
                  : await assignUnitAdmin(unit.id, {
                      user_id: selectedUser.id,
                    });
              setSubmitting(false);

              if (!result.success) {
                setSubmitError(result.message);
                return;
              }

              await onAssigned?.();
              onClose();
            }}
          >
            {effectiveAssignmentMode === "reassign" ? "Reassign Admin" : "Assign Admin"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
