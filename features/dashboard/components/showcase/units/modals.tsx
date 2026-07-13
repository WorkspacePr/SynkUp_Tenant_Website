"use client";

import { useState } from "react";
import {
  ClipboardList,
  Lock,
  MapPin,
  UserCog,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  createTenantUnit,
  updateTenantUnit,
} from "@/features/dashboard/api/tenant-units";
import { cn } from "@/utils";
import { CompactSelect } from "../ShowcaseParts";
import {
  ADMIN_CANDIDATES,
  ADMIN_ROLES,
  UNIT_CREATION_STATUSES,
  UNIT_FORM_DEFAULTS,
  UNIT_TYPES,
} from "./data";
import {
  ArchiveInfo,
  Field,
  FieldError,
  FieldWarning,
  InlineNotice,
  SummaryLine,
  SupportCard,
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
  UnitType,
} from "./types";

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

  if (!open) return null;

  const normalizedUnitName = unitName.trim().toLowerCase();
  const duplicateName = existingUnitNames.some(
    (unitNameValue) => unitNameValue.trim().toLowerCase() === normalizedUnitName,
  );

  async function handleSave(asDraft: boolean) {
    setShowDuplicateError(duplicateName);
    setShowMissingAdminWarning(!asDraft && assignedAdmins.length === 0);

    if (duplicateName) {
      return;
    }

    setSubmitError("");
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
      return;
    }

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
    await onCreated?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={onClose}
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
            onClick={onClose}
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
              <div className="grid gap-2">
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
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={() => void handleSave(true)}
            loading={submitting}
          >
            Save as Draft
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={planLimitReached || unitName.trim().length === 0}
            onClick={() => void handleSave(false)}
            loading={submitting}
          >
            Create Unit
          </Button>
        </div>
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

  if (!open) return null;

  const normalizedUnitName = unitName.trim().toLowerCase();
  const duplicateName = existingUnitNames.some(
    (existingUnitName) =>
      existingUnitName.trim().toLowerCase() === normalizedUnitName &&
      existingUnitName.trim().toLowerCase() !== unit.name.trim().toLowerCase(),
  );

  async function handleSave() {
    setShowDuplicateError(duplicateName);
    setShowMissingAdminWarning(status === "Active" && assignedAdmins.length === 0);

    if (duplicateName) {
      return;
    }

    setSubmitError("");
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
      return;
    }

    await onUpdated?.();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
      onClick={onClose}
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
            onClick={onClose}
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
              <div className="grid gap-2">
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
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={unitName.trim().length === 0}
            onClick={() => void handleSave()}
            loading={submitting}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function ArchiveUnitModal({
  darkMode,
  open,
  onClose,
  unit,
}: ArchiveUnitModalProps) {
  const [archiveReason, setArchiveReason] = useState("");
  const [archiveConfirmed, setArchiveConfirmed] = useState(false);

  if (!open) return null;

  const canArchive = archiveReason.trim().length > 0 && archiveConfirmed;
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
            onChange={(event) => setArchiveReason(event.target.value)}
            className={cn(
              "mt-2 min-h-32 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
              darkMode
                ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
            )}
            placeholder="Provide the operational reason for archiving this unit."
          />
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
          <Button
            variant="outline"
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={!canArchive}
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
}: AssignAdminModalProps) {
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<AdminRole>("Unit Admin");
  const [leadAdmin, setLeadAdmin] = useState(false);
  const [twoFactorConfirmed, setTwoFactorConfirmed] = useState(false);

  if (!open) return null;

  const filteredCandidates = ADMIN_CANDIDATES.filter((candidate) => {
    const haystack = `${candidate.name} ${candidate.email}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const selectedUser =
    ADMIN_CANDIDATES.find((candidate) => candidate.id === selectedUserId) ?? null;
  const highPrivilege = selectedRole === "Unit Admin" || leadAdmin;

  let blockingError = "";
  if (query.trim().length > 0 && filteredCandidates.length === 0) {
    blockingError = "No eligible admins found.";
  } else if (selectedUser) {
    if (selectedUser.assignedUnitId === unit.id) {
      blockingError = "User already assigned.";
    } else if (selectedUser.tenant === "other") {
      blockingError = "User belongs to another tenant.";
    } else if (!selectedUser.active) {
      blockingError = "User is inactive.";
    } else if (
      selectedRole === "Unit Admin" && selectedUser.maxRole === "Read-Only Admin"
    ) {
      blockingError = "Cannot assign role higher than your privilege.";
    }
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
            <div className="text-xl font-semibold">Assign Admin</div>
            <div
              className={cn(
                "mt-1 text-sm",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              Role assignment validates privilege, locks scope to this unit, and logs the event.
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

        <div className="mt-6 grid gap-5 md:grid-cols-2">
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
                  value: candidate.id,
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
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 rounded-xl px-5 py-3 text-sm"
            disabled={!canSubmit}
          >
            Assign Admin
          </Button>
        </div>
      </Card>
    </div>
  );
}
