"use client";

import { DataTable } from "@/components/ui/DataTable";
import { DataTablePanel } from "@/components/ui/DataTablePanel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  LayoutGrid,
  List,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { DashboardToast, type DashboardToastTone } from "@/components/ui/DashboardToast";
import { Select } from "@/components/ui/Select";
import {
  archiveOrganizationOnboardingAudience,
  addOrganizationOnboardingAudienceMembers,
  createOrganizationOnboardingAudience,
  createOrganizationOnboardingAdminInvite,
  getOrganizationOnboardingAdminInviteRoles,
  getOrganizationOnboardingAdminInvites,
  getOrganizationOnboardingAudienceMembers,
  getOrganizationOnboardingAudiences,
  importOrganizationOnboardingAudienceMembers,
  updateOrganizationOnboardingAudience,
} from "@/features/onboarding/api/tenant-onboarding";
import { getTenantUnits, type TenantUnitListItem } from "@/features/dashboard/api/tenant-units";
import { readTenantLoginContext } from "@/lib/auth/tenant-session";
import type {
  OrganizationOnboardingAdminInvite,
  OrganizationOnboardingAdminInviteRole,
  OrganizationOnboardingAudience,
  OrganizationOnboardingAudienceMember,
} from "@/types/onboarding";
import { cn } from "@/utils";
import { AudienceDetailDrawer, type NewAudienceMember } from "./AudienceDetailDrawer";

type AudienceWorkspaceProps = {
  darkMode: boolean;
  role?: "super" | "unit" | "audience";
  accessRole?: "super" | "unit" | "audience";
  allowedUnitIds?: number[];
  allowedAudienceIds?: number[];
};
type AudienceStatus = "Active" | "Inactive" | "Archived";
type WorkspaceAudience = OrganizationOnboardingAudience;
type ToastState = { tone: DashboardToastTone; title: string; description: string };
type AudienceFormValues = {
  name: string;
  audience_type: string;
  unit_id: string;
  description: string;
  expected_member_count: string;
  members: NewAudienceMember[];
  admin_email: string;
};

const defaultForm: AudienceFormValues = {
  name: "",
  audience_type: "class",
  unit_id: "",
  description: "",
  expected_member_count: "",
  members: [],
  admin_email: "",
};
const audienceTypeChoices = [
  "class", "department", "team",
];

function audienceStatus(audience: WorkspaceAudience): AudienceStatus {
  if (audience.is_archived) return "Archived";
  return audience.is_active ? "Active" : "Inactive";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function StatusBadge({ audience }: { audience: WorkspaceAudience }) {
  const status = audienceStatus(audience);
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
      status === "Active" ? "bg-emerald-50 text-emerald-700" :
        status === "Inactive" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600",
    )}>{status}</span>
  );
}

function AudienceModal({
  darkMode,
  units,
  audience,
  saving,
  canAssignAdmin,
  onClose,
  onSubmit,
}: {
  darkMode: boolean;
  units: TenantUnitListItem[];
  audience: WorkspaceAudience | null;
  saving: boolean;
  canAssignAdmin: boolean;
  onClose: () => void;
  onSubmit: (values: AudienceFormValues) => void;
}) {
  const [values, setValues] = useState<AudienceFormValues>(() => audience ? {
    name: audience.name,
    audience_type: audience.audience_type || "class",
    unit_id: String(audience.unit),
    description: audience.description ?? "",
    expected_member_count: audience.expected_member_count == null ? "" : String(audience.expected_member_count),
    members: [],
    admin_email: "",
  } : { ...defaultForm, unit_id: units[0] ? String(units[0].unit_id) : "" });
  const [draftMember, setDraftMember] = useState<NewAudienceMember>({ first_name: "", last_name: "", email: "", identifier: "" });

  const fieldClass = cn(
    "mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15",
    darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-900",
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={onClose}>
      <form
        onSubmit={(event) => { event.preventDefault(); onSubmit(values); }}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn("max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border p-6 shadow-2xl", darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900")}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{audience ? "Edit audience" : "Create audience"}</h2>
            <p className="mt-1 text-sm text-slate-500">Set the audience details and the unit it belongs to.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Audience name
            <input autoFocus required maxLength={150} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} placeholder="e.g. Customer Support Team" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold">Unit
            <Select
              value={values.unit_id}
              onChange={(unit_id) => setValues({ ...values, unit_id })}
              options={units.map((unit) => ({ label: unit.name, value: String(unit.unit_id) }))}
              placeholder="Select a unit"
              className="mt-1.5"
              buttonClassName="min-h-[42px] rounded-xl px-3.5 py-2.5 text-sm font-normal shadow-none"
              variant="compact"
              darkMode={darkMode}
              aria-label="Unit"
            />
          </label>
          <label className="text-sm font-semibold">Audience type
            <Select
              value={values.audience_type}
              onChange={(audience_type) => setValues({ ...values, audience_type })}
              options={[...new Set([...audienceTypeChoices, ...(audience && !audienceTypeChoices.includes(audience.audience_type) ? [audience.audience_type] : [])])].map((type) => ({ label: type.replaceAll("_", " "), value: type }))}
              className="mt-1.5"
              buttonClassName="min-h-[42px] rounded-xl px-3.5 py-2.5 text-sm font-normal shadow-none capitalize"
              variant="compact"
              darkMode={darkMode}
              aria-label="Audience type"
            />
          </label>
          <label className="text-sm font-semibold">Expected members <span className="font-normal text-slate-400">(optional)</span>
            <input type="number" min="0" value={values.expected_member_count} onChange={(event) => setValues({ ...values, expected_member_count: event.target.value })} placeholder="0" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">Description <span className="font-normal text-slate-400">(optional)</span>
            <textarea rows={3} maxLength={1000} value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} placeholder="What is this audience for?" className={cn(fieldClass, "resize-y")} />
          </label>
          {!audience ? (
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between gap-3"><div><div className="text-sm font-semibold">Initial members <span className="font-normal text-slate-400">(optional)</span></div><p className="mt-1 text-xs text-slate-500">Add people now, or manage them later from the audience profile.</p></div><span className="text-xs font-semibold text-primary">{values.members.length} added</span></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input value={draftMember.first_name} onChange={(event) => setDraftMember({ ...draftMember, first_name: event.target.value })} placeholder="First name" className={fieldClass} />
                <input value={draftMember.last_name} onChange={(event) => setDraftMember({ ...draftMember, last_name: event.target.value })} placeholder="Last name" className={fieldClass} />
                <input type="email" value={draftMember.email} onChange={(event) => setDraftMember({ ...draftMember, email: event.target.value })} placeholder="Email address" className={fieldClass} />
                <div className="flex gap-2"><input value={draftMember.identifier} onChange={(event) => setDraftMember({ ...draftMember, identifier: event.target.value })} placeholder="Member ID" className={fieldClass} /><button type="button" disabled={!draftMember.first_name.trim() || !draftMember.last_name.trim() || !draftMember.email.trim()} onClick={() => { setValues({ ...values, members: [...values.members, draftMember] }); setDraftMember({ first_name: "", last_name: "", email: "", identifier: "" }); }} className="mt-1.5 rounded-xl bg-teal-50 px-3 text-xs font-semibold text-primary disabled:opacity-40">Add</button></div>
              </div>
              {values.members.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{values.members.map((member, index) => <button key={`${member.email}-${index}`} type="button" onClick={() => setValues({ ...values, members: values.members.filter((_, memberIndex) => memberIndex !== index) })} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">{member.first_name} {member.last_name}<X className="h-3 w-3" /></button>)}</div> : null}
            </div>
          ) : null}
          {!audience && canAssignAdmin ? (
            <label className="text-sm font-semibold sm:col-span-2">Audience admin email <span className="font-normal text-slate-400">(optional)</span>
              <input type="email" value={values.admin_email} onChange={(event) => setValues({ ...values, admin_email: event.target.value })} placeholder="admin@example.com" className={fieldClass} />
              <span className="mt-1.5 block text-xs font-normal text-slate-500">They will receive an invitation to manage this audience.</span>
            </label>
          ) : null}
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="submit" disabled={saving || units.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Saving…" : audience ? "Save changes" : "Create audience"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AudienceWorkspace({
  darkMode,
  role = "super",
  accessRole = "super",
  allowedUnitIds = [],
  allowedAudienceIds = [],
}: AudienceWorkspaceProps) {
  const [organizationId] = useState<number | null>(() => readTenantLoginContext()?.organizationId ?? null);
  const [audiences, setAudiences] = useState<WorkspaceAudience[]>([]);
  const [units, setUnits] = useState<TenantUnitListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const [modalAudience, setModalAudience] = useState<WorkspaceAudience | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [busyAudienceId, setBusyAudienceId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [adminRoles, setAdminRoles] = useState<OrganizationOnboardingAdminInviteRole[]>([]);
  const [adminInvites, setAdminInvites] = useState<OrganizationOnboardingAdminInvite[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<WorkspaceAudience | null>(null);
  const [audienceMembers, setAudienceMembers] = useState<OrganizationOnboardingAudienceMember[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const [detailError, setDetailError] = useState("");

  const loadWorkspace = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      setError("Your organization could not be identified. Sign in again to manage audiences.");
      return;
    }
    setLoading(true);
    setError("");
    const [audiencesResult, unitsResult] = await Promise.all([
      getOrganizationOnboardingAudiences(organizationId),
      getTenantUnits({ page: 1 }),
    ]);
    const visibleAudiences = audiencesResult.success
      ? audiencesResult.data.results.filter((audience) => {
          if (accessRole === "super") return true;
          if (accessRole === "unit") return allowedUnitIds.includes(audience.unit);
          return allowedAudienceIds.includes(audience.audience_id);
        })
      : [];
    if (audiencesResult.success) setAudiences(visibleAudiences);
    else setError(audiencesResult.message);
    if (unitsResult.success) {
      const visibleUnitIds = accessRole === "audience"
        ? new Set(visibleAudiences.map((audience) => audience.unit))
        : null;
      setUnits(unitsResult.data.data.filter((unit) => {
        if (accessRole === "super") return true;
        if (accessRole === "unit") return allowedUnitIds.includes(unit.unit_id);
        return visibleUnitIds?.has(unit.unit_id) ?? false;
      }));
    }
    setLoading(false);
  }, [accessRole, allowedAudienceIds, allowedUnitIds, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const timer = window.setTimeout(() => void loadWorkspace(), 0);
    return () => window.clearTimeout(timer);
  }, [loadWorkspace, organizationId]);

  const loadAdminSupport = useCallback(async () => {
    if (!organizationId || accessRole === "audience") return;
    const [rolesResult, invitesResult] = await Promise.all([
      getOrganizationOnboardingAdminInviteRoles(organizationId),
      getOrganizationOnboardingAdminInvites(organizationId),
    ]);
    if (rolesResult.success) setAdminRoles(rolesResult.data);
    if (invitesResult.success) setAdminInvites(invitesResult.data.results);
  }, [accessRole, organizationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAdminSupport(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAdminSupport]);

  const unitNames = useMemo(() => new Map(units.map((unit) => [unit.unit_id, unit.name])), [units]);
  const audienceTypes = useMemo(() => [...new Set(audiences.map((audience) => audience.audience_type).filter(Boolean))].sort(), [audiences]);
  const filtered = useMemo(() => audiences.filter((audience) => {
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [audience.name, audience.description ?? "", unitNames.get(audience.unit) ?? ""].some((value) => value.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || audienceStatus(audience).toLowerCase() === statusFilter;
    const matchesType = typeFilter === "all" || audience.audience_type === typeFilter;
    return matchesQuery && matchesStatus && matchesType;
  }), [audiences, query, statusFilter, typeFilter, unitNames]);

  const activeCount = audiences.filter((audience) => audience.is_active && !audience.is_archived).length;
  const archivedCount = audiences.filter((audience) => audience.is_archived).length;
  const expectedMembers = audiences.reduce((total, audience) => total + (audience.expected_member_count ?? 0), 0);

  async function saveAudience(values: AudienceFormValues) {
    if (!organizationId) return;
    if (accessRole === "audience" || (accessRole === "unit" && !allowedUnitIds.includes(Number(values.unit_id)))) {
      setToast({ tone: "error", title: "Access denied", description: "You cannot manage an audience outside your assigned scope." });
      return;
    }
    setSaving(true);
    const payload = {
      name: values.name.trim(),
      audience_type: values.audience_type,
      unit_id: Number(values.unit_id),
      description: values.description.trim() || null,
      expected_member_count: values.expected_member_count === "" ? null : Number(values.expected_member_count),
    };
    const result = modalAudience
      ? await updateOrganizationOnboardingAudience(organizationId, modalAudience.audience_id, payload)
      : await createOrganizationOnboardingAudience(organizationId, payload);
    if (!result.success) {
      setSaving(false);
      setToast({ tone: "error", title: "Could not save audience", description: result.message });
      return;
    }
    const createdAudience = result.data;
    const setupErrors: string[] = [];
    if (!modalAudience && values.members.length > 0) {
      const membersResult = await addOrganizationOnboardingAudienceMembers(organizationId, createdAudience.audience_id, {
        members: values.members.map((member) => ({
          first_name: member.first_name.trim(),
          last_name: member.last_name.trim(),
          email: member.email.trim(),
          identifier: member.identifier.trim() || undefined,
          identifier_type: member.identifier.trim() ? "member_id" : undefined,
        })),
      });
      if (!membersResult.success) setupErrors.push(membersResult.message);
    }
    if (!modalAudience && values.admin_email.trim()) {
      const audienceAdminRole = adminRoles.find((role) => role.name.toLowerCase().replaceAll("_", " ").includes("audience admin"));
      if (!audienceAdminRole) {
        setupErrors.push("The Audience Admin role is not available for invitations.");
      } else {
        const inviteResult = await createOrganizationOnboardingAdminInvite(organizationId, {
          invited_email: values.admin_email.trim(),
          invited_role_id: audienceAdminRole.role_id,
          invited_unit_id: createdAudience.unit,
          invited_audience_id: createdAudience.audience_id,
        });
        if (!inviteResult.success) setupErrors.push(inviteResult.message);
      }
    }
    setSaving(false);
    setModalAudience(undefined);
    setToast({ tone: setupErrors.length > 0 ? "warning" : "success", title: modalAudience ? "Audience updated" : "Audience created", description: setupErrors.length > 0 ? `${createdAudience.name} was saved, but some setup could not be completed: ${setupErrors.join(" ")}` : `${createdAudience.name} and its initial access have been saved.` });
    await loadWorkspace();
    await loadAdminSupport();
  }

  const loadAudienceMembers = useCallback(async (audience: WorkspaceAudience) => {
    if (!organizationId) return;
    setDetailLoading(true);
    setDetailError("");
    const result = await getOrganizationOnboardingAudienceMembers(organizationId, audience.audience_id);
    if (result.success) setAudienceMembers(result.data.results);
    else { setAudienceMembers([]); setDetailError(result.message); }
    setDetailLoading(false);
  }, [organizationId]);

  function openAudience(audience: WorkspaceAudience) {
    setSelectedAudience(audience);
    setAudienceMembers([]);
    void loadAudienceMembers(audience);
  }

  async function addAudienceMember(member: NewAudienceMember) {
    if (!organizationId || !selectedAudience) return false;
    setDetailBusy(true);
    const result = await addOrganizationOnboardingAudienceMembers(organizationId, selectedAudience.audience_id, { members: [{ ...member, identifier: member.identifier.trim() || undefined, identifier_type: member.identifier.trim() ? "member_id" : undefined }] });
    setDetailBusy(false);
    if (!result.success) { setToast({ tone: "error", title: "Could not add member", description: result.message }); return false; }
    setToast({ tone: "success", title: "Member added", description: `${member.first_name} ${member.last_name} was added to ${selectedAudience.name}.` });
    await loadAudienceMembers(selectedAudience);
    return true;
  }

  async function importAudienceMembers(file: File) {
    if (!organizationId || !selectedAudience) return false;
    setDetailBusy(true);
    const result = await importOrganizationOnboardingAudienceMembers(organizationId, selectedAudience.audience_id, file);
    setDetailBusy(false);
    if (!result.success) { setToast({ tone: "error", title: "Could not import members", description: result.message }); return false; }
    setToast({ tone: "success", title: "Members imported", description: `${result.data.added_to_audience ?? 0} member(s) were added to ${selectedAudience.name}.` });
    await loadAudienceMembers(selectedAudience);
    return true;
  }

  async function inviteAudienceAdmin(email: string) {
    if (!organizationId || !selectedAudience) return false;
    const audienceAdminRole = adminRoles.find((role) => role.name.toLowerCase().replaceAll("_", " ").includes("audience admin"));
    if (!audienceAdminRole) { setToast({ tone: "error", title: "Role unavailable", description: "The backend did not return an Audience Admin invite role." }); return false; }
    setDetailBusy(true);
    const result = await createOrganizationOnboardingAdminInvite(organizationId, { invited_email: email, invited_role_id: audienceAdminRole.role_id, invited_unit_id: selectedAudience.unit, invited_audience_id: selectedAudience.audience_id });
    setDetailBusy(false);
    if (!result.success) { setToast({ tone: "error", title: "Could not assign admin", description: result.message }); return false; }
    setToast({ tone: "success", title: "Admin invited", description: `${email} was invited to manage ${selectedAudience.name}.` });
    await loadAdminSupport();
    return true;
  }

  async function archiveAudience(audience: WorkspaceAudience) {
    if (!organizationId || !window.confirm(`Archive “${audience.name}”?`)) return;
    const canManageAudience =
      accessRole === "super" ||
      (accessRole === "unit" && allowedUnitIds.includes(audience.unit)) ||
      (accessRole === "audience" && allowedAudienceIds.includes(audience.audience_id));
    if (!canManageAudience) {
      setToast({ tone: "error", title: "Access denied", description: "You cannot manage an audience outside your assigned scope." });
      return;
    }
    setBusyAudienceId(audience.audience_id);
    const result = await archiveOrganizationOnboardingAudience(organizationId, audience.audience_id);
    setBusyAudienceId(null);
    if (!result.success) {
      setToast({ tone: "error", title: "Could not archive audience", description: result.message });
      return;
    }
    setToast({ tone: "success", title: "Audience archived", description: `${audience.name} was archived.` });
    if (selectedAudience?.audience_id === audience.audience_id) setSelectedAudience(null);
    await loadWorkspace();
  }

  const muted = darkMode ? "text-slate-400" : "text-slate-500";
  const border = darkMode ? "border-slate-800" : "border-slate-200";
  const surface = darkMode ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900";

  return (
    <section className="pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4 py-5">
        <div>
          <p className={cn("mb-2 text-xs font-semibold uppercase tracking-[0.16em]", muted)}>{role === "super" ? "Organisation-wide" : "Workspace"} management</p>
          <h1 className={cn("text-3xl font-semibold tracking-[-0.04em] sm:text-4xl", darkMode ? "text-white" : "text-slate-950")}>Audiences</h1>
          <p className={cn("mt-2 max-w-2xl text-sm", muted)}>Create and manage the groups that organize your members across units.</p>
        </div>
        {accessRole !== "audience" ? (
          <button onClick={() => setModalAudience(null)} disabled={units.length === 0} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-4 w-4" /> Create audience
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total audiences", value: audiences.length, icon: Users },
          { label: "Active audiences", value: activeCount, icon: Check },
          { label: "Expected members", value: expectedMembers.toLocaleString(), icon: Building2 },
          { label: "Archived", value: archivedCount, icon: Archive },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className={cn("rounded-2xl border p-5", surface, border)}>
            <div className="flex items-center justify-between"><span className={cn("text-sm font-medium", muted)}>{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-primary"><Icon className="h-4 w-4" /></span></div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
          </Card>
        ))}
      </div>

      <DataTablePanel darkMode={darkMode} className="mt-6">
        <div className={cn("flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between", border)}>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", muted)} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search audiences or units" className={cn("h-10 w-full rounded-xl border bg-transparent pl-9 pr-3 text-sm outline-none focus:border-teal-500", border)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[{ label: "All statuses", value: "all" }, { label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }, { label: "Archived", value: "archived" }]}
              className="min-w-36"
              buttonClassName="h-10 min-h-10 rounded-xl bg-transparent px-3 py-2 text-sm font-medium shadow-none"
              variant="compact"
              darkMode={darkMode}
              aria-label="Filter by status"
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[{ label: "All types", value: "all" }, ...audienceTypes.map((type) => ({ label: type.replaceAll("_", " "), value: type }))]}
              className="min-w-36 max-w-44"
              buttonClassName="h-10 min-h-10 rounded-xl bg-transparent px-3 py-2 text-sm font-medium shadow-none capitalize"
              variant="compact"
              darkMode={darkMode}
              aria-label="Filter by type"
            />
            <div className={cn("flex rounded-xl border p-1", border)}>
              <button onClick={() => setView("table")} aria-label="Table view" aria-pressed={view === "table"} className={cn("rounded-lg p-2", view === "table" ? "bg-teal-50 text-primary" : muted)}><List className="h-4 w-4" /></button>
              <button onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} className={cn("rounded-lg p-2", view === "grid" ? "bg-teal-50 text-primary" : muted)}><LayoutGrid className="h-4 w-4" /></button>
            </div>
            <button onClick={() => void loadWorkspace()} aria-label="Refresh audiences" className={cn("rounded-xl border p-2.5", border, muted)}><RefreshCw className="h-4 w-4" /></button>
          </div>
        </div>

        {loading ? (
          <div className={cn("flex min-h-64 flex-col items-center justify-center gap-3", muted)}><LoaderCircle className="h-7 w-7 animate-spin text-primary" /><span className="text-sm">Loading audiences…</span></div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <CircleAlert className="h-8 w-8 text-rose-500" /><p className="mt-3 max-w-lg text-sm">{error}</p><button onClick={() => void loadWorkspace()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Try again</button>
          </div>
        ) : audiences.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-primary"><Users className="h-7 w-7" /></div>
            <h2 className="mt-5 text-lg font-semibold">No audiences yet</h2><p className={cn("mt-2 max-w-md text-sm", muted)}>Create your first audience to start organizing members across your units.</p>
            {accessRole !== "audience" ? (
              <button onClick={() => setModalAudience(null)} disabled={units.length === 0} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />Create audience</button>
            ) : null}
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn("flex min-h-56 flex-col items-center justify-center gap-2 px-6 text-center", muted)}><Search className="h-6 w-6" /><p className="text-sm">No audiences match these filters.</p><button onClick={() => { setQuery(""); setStatusFilter("all"); setTypeFilter("all"); }} className="text-sm font-semibold text-primary">Clear filters</button></div>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <DataTable darkMode={darkMode} className="w-full min-w-[780px] text-left text-sm">
              <thead className={cn("text-xs uppercase tracking-wide", muted, darkMode ? "bg-slate-950/50" : "bg-slate-50")}><tr><th className="px-5 py-3 font-semibold">Audience</th><th className="px-5 py-3 font-semibold">Unit</th><th className="px-5 py-3 font-semibold">Type</th><th className="px-5 py-3 font-semibold">Expected members</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Created</th><th className="px-5 py-3" /></tr></thead>
              <tbody>{filtered.map((audience) => (
                <tr key={audience.audience_id} onClick={() => openAudience(audience)} className={cn("cursor-pointer border-t transition hover:bg-slate-50 dark:hover:bg-slate-800/50", border)}>
                  <td className="px-5 py-4"><div className="font-semibold">{audience.name}</div>{audience.description ? <div className={cn("mt-1 max-w-xs truncate text-xs", muted)}>{audience.description}</div> : null}</td>
                  <td className={cn("px-5 py-4", muted)}>{unitNames.get(audience.unit) ?? `Unit ${audience.unit}`}</td>
                  <td className={cn("px-5 py-4 capitalize", muted)}>{audience.audience_type.replaceAll("_", " ")}</td>
                  <td className={cn("px-5 py-4", muted)}>{audience.expected_member_count?.toLocaleString() ?? "—"}</td>
                  <td className="px-5 py-4"><StatusBadge audience={audience} /></td>
                  <td className={cn("px-5 py-4", muted)}>{formatDate(audience.created_at)}</td>
                  <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>{accessRole !== "audience" ? <AudienceActions audience={audience} darkMode={darkMode} busy={busyAudienceId === audience.audience_id} onView={() => openAudience(audience)} onEdit={() => setModalAudience(audience)} onArchive={() => void archiveAudience(audience)} /> : <button type="button" onClick={() => openAudience(audience)} className="text-xs font-semibold text-primary">View</button>}</td>
                </tr>
              ))}</tbody>
            </DataTable>
            <div className={cn("border-t px-5 py-3 text-xs", muted, border)}>Showing {filtered.length} of {audiences.length} audiences</div>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((audience) => <Card key={audience.audience_id} onClick={() => openAudience(audience)} className={cn("cursor-pointer rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-md", surface, border)}>
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{audience.name}</h3><p className={cn("mt-1 text-xs", muted)}>{unitNames.get(audience.unit) ?? `Unit ${audience.unit}`}</p></div><StatusBadge audience={audience} /></div>
              <p className={cn("mt-4 min-h-10 text-sm", muted)}>{audience.description || "No description provided."}</p>
              <div className={cn("mt-4 flex items-center justify-between border-t pt-4 text-xs", border, muted)}><span className="capitalize">{audience.audience_type.replaceAll("_", " ")}</span><span>{audience.expected_member_count?.toLocaleString() ?? "—"} expected</span></div>
              {accessRole !== "audience" ? <div className="mt-4 flex justify-end" onClick={(event) => event.stopPropagation()}><AudienceActions audience={audience} darkMode={darkMode} busy={busyAudienceId === audience.audience_id} onView={() => openAudience(audience)} onEdit={() => setModalAudience(audience)} onArchive={() => void archiveAudience(audience)} /></div> : null}
            </Card>)}
          </div>
        )}
      </DataTablePanel>

      {modalAudience !== undefined ? <AudienceModal darkMode={darkMode} units={units} audience={modalAudience} saving={saving} canAssignAdmin={accessRole !== "audience"} onClose={() => { if (!saving) setModalAudience(undefined); }} onSubmit={(values) => void saveAudience(values)} /> : null}
      {selectedAudience ? <AudienceDetailDrawer
        darkMode={darkMode}
        audience={selectedAudience}
        unitName={unitNames.get(selectedAudience.unit) ?? `Unit ${selectedAudience.unit}`}
        members={audienceMembers}
        admins={adminInvites.filter((invite) => invite.invited_audience === selectedAudience.audience_id && !["revoked", "expired"].includes(invite.status.toLowerCase()))}
        loading={detailLoading}
        busy={detailBusy || busyAudienceId === selectedAudience.audience_id}
        error={detailError}
        canAssignAdmin={accessRole !== "audience"}
        onClose={() => setSelectedAudience(null)}
        onEdit={() => { setSelectedAudience(null); setModalAudience(selectedAudience); }}
        onArchive={() => void archiveAudience(selectedAudience)}
        onAddMember={addAudienceMember}
        onImportMembers={importAudienceMembers}
        onInviteAdmin={inviteAudienceAdmin}
      /> : null}
      {toast ? <DashboardToast tone={toast.tone} title={toast.title} description={toast.description} onClose={() => setToast(null)} /> : null}
    </section>
  );
}

function AudienceActions({
  audience,
  darkMode,
  busy,
  onView,
  onEdit,
  onArchive,
}: {
  audience: WorkspaceAudience;
  darkMode: boolean;
  busy: boolean;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleScroll() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open]);

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const menuHeight = audience.is_archived ? 88 : 128;
      const menuWidth = 160;
      const fitsBelow = rect.bottom + menuHeight + 8 <= window.innerHeight;
      setMenuPosition({
        top: fitsBelow ? rect.bottom + 6 : Math.max(8, rect.top - menuHeight - 6),
        left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
      });
    }
    setOpen(true);
  }

  return (
    <div className="relative flex justify-end">
      <button ref={buttonRef} type="button" disabled={busy} aria-haspopup="menu" aria-expanded={open} onClick={toggleMenu} className={cn("inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50", darkMode ? "border-slate-700" : "border-slate-200")}>
        {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : "Manage"}<ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className={cn("fixed z-[1000] w-40 overflow-hidden rounded-xl border p-1 shadow-2xl", darkMode ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900")}
        >
          <button role="menuitem" onClick={() => { setOpen(false); onView(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><Users className="h-4 w-4" />View audience</button>
          <button role="menuitem" onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" />Edit details</button>
          {!audience.is_archived ? <button role="menuitem" onClick={() => { setOpen(false); onArchive(); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"><Archive className="h-4 w-4" />Archive</button> : null}
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
