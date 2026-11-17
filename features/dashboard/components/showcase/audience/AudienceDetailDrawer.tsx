"use client";

import { useMemo, useRef, useState } from "react";
import {
  Archive,
  CalendarDays,
  LoaderCircle,
  Mail,
  Pencil,
  ShieldCheck,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import type {
  OrganizationOnboardingAdminInvite,
  OrganizationOnboardingAudience,
  OrganizationOnboardingAudienceMember,
} from "@/types/onboarding";
import { cn } from "@/utils";

export type NewAudienceMember = {
  first_name: string;
  last_name: string;
  email: string;
  identifier: string;
};

type AudienceDetailDrawerProps = {
  darkMode: boolean;
  audience: OrganizationOnboardingAudience;
  unitName: string;
  members: OrganizationOnboardingAudienceMember[];
  admins: OrganizationOnboardingAdminInvite[];
  loading: boolean;
  busy: boolean;
  error: string;
  canAssignAdmin: boolean;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onAddMember: (member: NewAudienceMember) => Promise<boolean>;
  onImportMembers: (file: File) => Promise<boolean>;
  onInviteAdmin: (email: string) => Promise<boolean>;
};

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function AudienceDetailDrawer({
  darkMode,
  audience,
  unitName,
  members,
  admins,
  loading,
  busy,
  error,
  canAssignAdmin,
  onClose,
  onEdit,
  onArchive,
  onAddMember,
  onImportMembers,
  onInviteAdmin,
}: AudienceDetailDrawerProps) {
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [member, setMember] = useState<NewAudienceMember>({ first_name: "", last_name: "", email: "", identifier: "" });
  const [adminEmail, setAdminEmail] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldClass = cn(
    "w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15",
    darkMode ? "border-slate-700 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-900",
  );
  const border = darkMode ? "border-slate-800" : "border-slate-200";
  const muted = darkMode ? "text-slate-400" : "text-slate-500";
  const filteredMembers = useMemo(() => {
    const term = memberSearch.trim().toLowerCase();
    if (!term) return members;
    return members.filter((item) => `${item.username} ${item.email}`.toLowerCase().includes(term));
  }, [memberSearch, members]);
  const pendingAdmins = admins.filter((admin) => admin.status.toLowerCase() === "pending").length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" onMouseDown={onClose}>
      <aside
        className={cn(
          "scrollbar-dashboard ml-auto h-full w-full max-w-[720px] overflow-y-auto border-l shadow-2xl",
          darkMode ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-950",
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={cn("sticky top-0 z-20 flex items-center justify-between border-b px-5 py-4 backdrop-blur-xl sm:px-6", border, darkMode ? "bg-slate-900/95" : "bg-white/95")}>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Audience profile</div>
            <div className={cn("mt-1 text-sm", muted)}>Members, admins and audience access</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close audience profile" className={cn("grid h-10 w-10 place-items-center rounded-xl", darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200")}><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{audience.name}</h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{audience.is_archived ? "Archived" : audience.is_active ? "Active" : "Inactive"}</span>
              </div>
              <p className={cn("mt-2 text-sm", muted)}>{unitName} · {audience.audience_type.replaceAll("_", " ")}</p>
              <p className={cn("mt-1 flex items-center gap-1.5 text-xs", muted)}><CalendarDays className="h-3.5 w-3.5" />Created {formatDate(audience.created_at)}</p>
            </div>
            <button type="button" onClick={onEdit} className={cn("inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold", border)}><Pencil className="h-4 w-4" />Edit details</button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Active members", value: members.length, icon: Users },
              { label: "Expected members", value: audience.expected_member_count ?? "-", icon: UserPlus },
              { label: "Pending admin invites", value: pendingAdmins, icon: Mail },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className={cn("rounded-2xl border p-4", border, darkMode ? "bg-slate-800/50" : "bg-slate-50")}>
                <Icon className="h-4 w-4 text-primary" /><div className="mt-3 text-2xl font-bold">{value}</div><div className={cn("mt-1 text-xs", muted)}>{label}</div>
              </div>
            ))}
          </div>

          <section className={cn("mt-6 rounded-2xl border", border)}>
            <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b p-4", border)}>
              <div><h3 className="font-semibold">Audience admin(s)</h3><p className={cn("mt-1 text-xs", muted)}>People invited to manage this audience.</p></div>
              {canAssignAdmin ? <button type="button" onClick={() => setShowAdminForm((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-semibold text-primary"><ShieldCheck className="h-4 w-4" />Assign admin</button> : null}
            </div>
            {showAdminForm ? (
              <form className={cn("flex gap-2 border-b p-4", border)} onSubmit={async (event) => { event.preventDefault(); if (await onInviteAdmin(adminEmail.trim())) { setAdminEmail(""); setShowAdminForm(false); } }}>
                <input required type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="admin@example.com" className={fieldClass} />
                <button disabled={busy} className="rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Invite"}</button>
              </form>
            ) : null}
            <div className="p-4">
              {admins.length === 0 ? <p className={cn("py-3 text-center text-sm", muted)}>No audience admin has been assigned yet.</p> : admins.map((admin) => (
                <div key={admin.invite_id} className={cn("flex items-center gap-3 border-t py-3 first:border-t-0", border)}>
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-xs font-bold text-primary">{initials(admin.invited_email)}</div>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{admin.invited_email}</div><div className={cn("mt-0.5 text-xs", muted)}>Audience Admin</div></div>
                  <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", admin.status.toLowerCase() === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{admin.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={cn("mt-5 rounded-2xl border", border)}>
            <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b p-4", border)}>
              <div><h3 className="font-semibold">Members</h3><p className={cn("mt-1 text-xs", muted)}>View and add people in this audience.</p></div>
              <div className="flex gap-2">
                <input ref={fileInputRef} className="hidden" type="file" accept=".csv,.xlsx,.xls" onChange={async (event) => { const file = event.target.files?.[0]; if (file) await onImportMembers(file); event.target.value = ""; }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold", border)}><Upload className="h-4 w-4" />Import</button>
                <button type="button" onClick={() => setShowMemberForm((value) => !value)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"><UserPlus className="h-4 w-4" />Add member</button>
              </div>
            </div>
            {showMemberForm ? (
              <form className={cn("grid gap-3 border-b p-4 sm:grid-cols-2", border)} onSubmit={async (event) => { event.preventDefault(); if (await onAddMember(member)) { setMember({ first_name: "", last_name: "", email: "", identifier: "" }); setShowMemberForm(false); } }}>
                <input required value={member.first_name} onChange={(event) => setMember({ ...member, first_name: event.target.value })} placeholder="First name" className={fieldClass} />
                <input required value={member.last_name} onChange={(event) => setMember({ ...member, last_name: event.target.value })} placeholder="Last name" className={fieldClass} />
                <input required type="email" value={member.email} onChange={(event) => setMember({ ...member, email: event.target.value })} placeholder="Email address" className={fieldClass} />
                <input value={member.identifier} onChange={(event) => setMember({ ...member, identifier: event.target.value })} placeholder="Member ID (optional)" className={fieldClass} />
                <button disabled={busy} className="min-h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{busy ? "Adding member…" : "Add to audience"}</button>
              </form>
            ) : null}
            <div className="p-4">
              <input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search members by name or email" className={fieldClass} />
              {loading ? <div className={cn("flex min-h-40 flex-col items-center justify-center gap-3", muted)}><LoaderCircle className="h-6 w-6 animate-spin text-primary" /><span className="text-sm">Loading audience members.</span></div> : error ? <p className="py-8 text-center text-sm text-rose-600">{error}</p> : filteredMembers.length === 0 ? <p className={cn("py-8 text-center text-sm", muted)}>No members have been added yet.</p> : (
                <div className="mt-3">
                  {filteredMembers.map((item) => <div key={item.id} className={cn("flex items-center gap-3 border-t py-3 first:border-t-0", border)}><div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{initials(item.username || item.email)}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{item.username || item.email}</div><div className={cn("truncate text-xs", muted)}>{item.email}</div></div><div className={cn("text-right text-[11px]", muted)}>Joined<br />{formatDate(item.joined_at)}</div></div>)}
                </div>
              )}
            </div>
          </section>

          {!audience.is_archived ? <button type="button" disabled={busy} onClick={onArchive} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Archive className="h-4 w-4" />Archive audience</button> : null}
        </div>
      </aside>
    </div>
  );
}
