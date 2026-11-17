"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Eye,
  Flag,
  LoaderCircle,
  Plus,
  RefreshCw,
  SearchX,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { DataTablePanel } from "@/components/ui/DataTablePanel";
import { Select } from "@/components/ui/Select";
import {
  createTenantAttendanceSession,
  getTenantAttendanceOverview,
  getTenantAttendanceSessions,
  type TenantAttendanceOverview,
  type TenantAttendanceSession,
  type TenantAttendanceStatus,
} from "@/features/dashboard/api/tenant-attendance";
import { getTenantUnits, type TenantUnitListItem } from "@/features/dashboard/api/tenant-units";
import { getOrganizationOnboardingAudiences } from "@/features/onboarding/api/tenant-onboarding";
import { readTenantLoginContext } from "@/lib/auth/tenant-session";
import { cn } from "@/utils";

import { TableFilterBar } from "../units/shared";
import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";
import type { RoleKey } from "../types";
import { AudienceSessionsWorkspace } from "./AudienceSessionsWorkspace";

const PAGE_SIZE = 10;
const statusOptions: Array<{ label: string; value: TenantAttendanceStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Locked", value: "locked" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
  { label: "Cancelled", value: "cancelled" },
];

function formatSessionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "-" };
  return {
    date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

function dateRange(value: string) {
  if (value === "all") return {};
  const days = Number(value);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return {
    date_from: start.toISOString().slice(0, 10),
    date_to: end.toISOString().slice(0, 10),
  };
}

function StatusPill({ status }: { status: TenantAttendanceStatus }) {
  const styles: Record<TenantAttendanceStatus, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    completed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    locked: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    archived: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    draft: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    scheduled: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  };
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide", styles[status])}>{status}</span>;
}

function MetricCard({ label, value, icon: Icon, tone = "primary" }: {
  label: string;
  value: string;
  icon: typeof CalendarClock;
  tone?: "primary" | "success" | "warning";
}) {
  const iconTone = tone === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" : tone === "warning" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50" : "bg-teal-50 text-primary dark:bg-teal-950/50";
  return <Card className="rounded-2xl border border-slate-200 p-5 shadow-none dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span><span className={cn("grid h-10 w-10 place-items-center rounded-xl", iconTone)}><Icon className="h-5 w-5" /></span></div>
    <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
  </Card>;
}

function EmptySessions({ filtered, darkMode, onClear }: { filtered: boolean; darkMode: boolean; onClear: () => void }) {
  const Icon = filtered ? SearchX : CalendarDays;
  return <div className="flex min-h-96 flex-col items-center justify-center px-6 py-14 text-center">
    <div className={cn("grid h-20 w-20 place-items-center rounded-3xl", darkMode ? "bg-slate-800 text-[#67d6cf]" : "bg-[#e6f8f5] text-primary")}><Icon className="h-9 w-9" /></div>
    <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{filtered ? "No sessions match your filters" : "No sessions yet"}</h2>
    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">{filtered ? "Try a different search, audience, status, flag, or date range." : "Sessions created by Audience Admins will appear here for everyone with access to that scope."}</p>
    {filtered ? <Button variant="outline" className="mt-6 rounded-xl" onClick={onClear}>Clear all filters</Button> : null}
  </div>;
}

function SessionDetails({ session, darkMode, onClose, onViewAttendance }: { session: TenantAttendanceSession; darkMode: boolean; onClose: () => void; onViewAttendance: () => void }) {
  const scheduled = formatSessionDate(session.scheduled_start_at);
  return <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" onMouseDown={onClose}>
    <aside className={cn("ml-auto h-full w-full max-w-xl overflow-y-auto border-l p-6 shadow-2xl", darkMode ? "border-slate-800 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900")} onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Session details</div><h2 className="mt-2 text-2xl font-semibold">{session.name}</h2></div><button type="button" onClick={onClose} aria-label="Close session details" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><X className="h-5 w-5" /></button></div>
      <div className="mt-6"><StatusPill status={session.status} /></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[['Unit', session.unit.name], ['Audience', session.audience.name], ['Date', scheduled.date], ['Time', scheduled.time], ['Attendance', `${session.present}/${session.eligible}`], ['Late allowance', `${session.late_allowance_minutes} minutes`]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 font-semibold">{value}</div></div>)}
      </div>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">Created by {session.created_by.display_name}. {session.flags ? `${session.flags} attendance record${session.flags === 1 ? " is" : "s are"} flagged for review.` : "No attendance records are currently flagged."}</div>
      {session.actions.view_attendance ? <Button className="mt-6 w-full rounded-xl" onClick={onViewAttendance}><Eye className="h-4 w-4" />View attendance records</Button> : null}
    </aside>
  </div>;
}

function CreateSessionDialog({ darkMode, audiences, saving, error, onClose, onSubmit }: {
  darkMode: boolean;
  audiences: Array<{ id: number; name: string }>;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (payload: { name: string; audienceId: number; start: string; end: string; lateAllowance: number }) => void;
}) {
  const [name, setName] = useState("");
  const [audienceId, setAudienceId] = useState(String(audiences[0]?.id ?? ""));
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [lateAllowance, setLateAllowance] = useState("15");
  const inputClass = cn("mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15", darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white");
  const valid = name.trim() && audienceId && start && end && new Date(end) > new Date(start);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
    <Card className={cn("w-full max-w-2xl rounded-3xl border p-6", darkMode ? "border-slate-700 bg-slate-950 text-white" : "border-slate-200 bg-white")} onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold">Create session</h2><p className="mt-1 text-sm text-slate-500">Schedule attendance for one of your assigned audiences.</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><X className="h-5 w-5" /></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="text-sm font-semibold">Session name</span><input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. CSC 401 - Week 6 Lecture" /></label>
        <label className="sm:col-span-2"><span className="text-sm font-semibold">Audience</span><Select value={audienceId} onChange={setAudienceId} options={audiences.map((audience) => ({ label: audience.name, value: String(audience.id) }))} placeholder="Select an audience" className="mt-1.5" buttonClassName="min-h-[42px] rounded-xl px-3.5 py-2.5 text-sm font-normal shadow-none" variant="compact" darkMode={darkMode} aria-label="Audience" /></label>
        <label><span className="text-sm font-semibold">Starts</span><input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} /></label>
        <label><span className="text-sm font-semibold">Ends</span><input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} /></label>
        <label><span className="text-sm font-semibold">Late allowance (minutes)</span><input type="number" min="0" max="120" value={lateAllowance} onChange={(e) => setLateAllowance(e.target.value)} className={inputClass} /></label>
      </div>
      {error ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button disabled={!valid || saving} onClick={() => onSubmit({ name: name.trim(), audienceId: Number(audienceId), start, end, lateAllowance: Number(lateAllowance) || 0 })}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{saving ? "Creating..." : "Create session"}</Button></div>
    </Card>
  </div>;
}

function SessionsOversightWorkspace({ darkMode, accessRole }: { darkMode: boolean; accessRole: RoleKey }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [unitId, setUnitId] = useState("all");
  const [audienceId, setAudienceId] = useState("all");
  const [status, setStatus] = useState("all");
  const [flags, setFlags] = useState("all");
  const [range, setRange] = useState("30");
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<TenantAttendanceSession[]>([]);
  const [overview, setOverview] = useState<TenantAttendanceOverview | null>(null);
  const [units, setUnits] = useState<TenantUnitListItem[]>([]);
  const [audiences, setAudiences] = useState<Array<{ id: number; name: string; unitId: number }>>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<TenantAttendanceSession | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const latestRequest = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    const context = readTenantLoginContext();
    const organizationId = context?.organizationId;
    if (!organizationId) return () => { active = false; };
    void Promise.all([getTenantUnits({ page: 1 }), getOrganizationOnboardingAudiences(organizationId)]).then(([unitResult, audienceResult]) => {
      if (!active) return;
      const visibleAudiences = audienceResult.success ? audienceResult.data.results.filter((audience) => accessRole === "super" || (accessRole === "unit" ? (context.unitScope ?? []).includes(audience.unit) : (context.audienceScope ?? []).includes(audience.audience_id))) : [];
      if (unitResult.success) setUnits(unitResult.data.data.filter((unit) => accessRole === "super" || (context.unitScope ?? []).includes(unit.unit_id) || visibleAudiences.some((audience) => audience.unit === unit.unit_id)));
      setAudiences(visibleAudiences.map((audience) => ({ id: audience.audience_id, name: audience.name, unitId: audience.unit })));
    });
    return () => { active = false; };
  }, [accessRole]);

  const filters = useMemo(() => ({
    ...(debouncedQuery ? { search: debouncedQuery } : {}),
    ...(unitId !== "all" ? { unit_id: Number(unitId) } : {}),
    ...(audienceId !== "all" ? { audience_id: Number(audienceId) } : {}),
    ...(status !== "all" ? { status: status as TenantAttendanceStatus } : {}),
    flag_state: flags as "all" | "flagged" | "clear",
    ...dateRange(range),
  }), [audienceId, debouncedQuery, flags, range, status, unitId]);

  const loadSessions = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setRefreshing(true);
    setError("");
    const [listResult, overviewResult] = await Promise.all([
      getTenantAttendanceSessions({ ...filters, page, page_size: PAGE_SIZE }),
      getTenantAttendanceOverview(filters),
    ]);
    if (requestId !== latestRequest.current) return;
    if (listResult.success) {
      setSessions(listResult.data.results);
      setTotal(listResult.data.count);
    } else {
      setSessions([]);
      setTotal(0);
      setError(listResult.message);
    }
    setOverview(overviewResult.success ? overviewResult.data : null);
    setLoading(false);
    setRefreshing(false);
  }, [filters, page]);

  // This effect is the route-level synchronization point for server-backed session data.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadSessions(); }, [loadSessions]);

  const audienceOptions = useMemo(() => [{ label: "All audiences", value: "all" }, ...audiences.filter((audience) => unitId === "all" || audience.unitId === Number(unitId)).map((audience) => ({ label: audience.name, value: String(audience.id) }))], [audiences, unitId]);
  const unitOptions = useMemo(() => [{ label: "All units", value: "all" }, ...units.map((unit) => ({ label: unit.name, value: String(unit.unit_id) }))], [units]);
  const filtersActive = Boolean(query.trim() || unitId !== "all" || audienceId !== "all" || status !== "all" || flags !== "all" || range !== "all");
  const clearFilters = () => { setQuery(""); setDebouncedQuery(""); setUnitId("all"); setAudienceId("all"); setStatus("all"); setFlags("all"); setRange("all"); setPage(1); };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function handleCreate(values: { name: string; audienceId: number; start: string; end: string; lateAllowance: number }) {
    setCreating(true);
    setCreateError("");
    const result = await createTenantAttendanceSession({ audience_id: values.audienceId, name: values.name, scheduled_date: values.start.slice(0, 10), scheduled_start_at: new Date(values.start).toISOString(), scheduled_end_at: new Date(values.end).toISOString(), late_allowance_minutes: values.lateAllowance, eligibility_rule: { type: "audience_members" }, qr_refresh_interval_seconds: 30 });
    setCreating(false);
    if (!result.success) { setCreateError(result.message); return; }
    setCreateOpen(false);
    setPage(1);
    await loadSessions();
  }

  return <section className="pb-10">
    <UnitsPageHeader darkMode={darkMode} title="Sessions" description="Monitor attendance sessions across your assigned scope" actionSlot={accessRole === "audience" ? <Button onClick={() => { setCreateError(""); setCreateOpen(true); }} disabled={audiences.length === 0} className="rounded-xl"><Plus className="h-4 w-4" />Create session</Button> : null} />
    <div className={cn("mt-2 flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm", darkMode ? "border-slate-800 bg-slate-900 text-slate-300" : "border-[#dbeae7] bg-[#f1faf8] text-slate-700")}><AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p>{accessRole === "audience" ? "Create and manage sessions only for audiences assigned to you." : <>Sessions are created by <strong>Audience Admins</strong>. This screen provides oversight within your assigned scope.</>}</p></div>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total sessions" value={overview ? overview.total_sessions.toLocaleString() : "-"} icon={CalendarClock} />
      <MetricCard label="Active sessions" value={overview ? overview.active_sessions.toLocaleString() : "-"} icon={CheckCircle2} tone="success" />
      <MetricCard label="Flagged records" value={overview ? overview.flagged_attendance_records.toLocaleString() : "-"} icon={Flag} tone="warning" />
      <MetricCard label="Average attendance" value={overview ? `${Math.round(overview.average_attendance_rate)}%` : "-"} icon={UsersRound} />
    </div>

    <div className="mt-6 flex justify-end"><button type="button" onClick={() => void loadSessions()} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />Refresh</button></div>
    <TableFilterBar darkMode={darkMode} searchPlaceholder="Search by session, unit, or audience" searchValue={query} onSearchChange={(value) => { setQuery(value); setPage(1); }} selects={[
      ...(accessRole !== "audience" ? [{ label: "Unit", value: unitId, onChange: (value: string) => { setUnitId(value); setAudienceId("all"); setPage(1); }, options: unitOptions, className: "min-w-36" }] : []),
      { label: "Audience", value: audienceId, onChange: (value) => { setAudienceId(value); setPage(1); }, options: audienceOptions, className: "min-w-40" },
      { label: "Status", value: status, onChange: (value) => { setStatus(value); setPage(1); }, options: statusOptions, className: "min-w-36" },
      { label: "Flags", value: flags, onChange: (value) => { setFlags(value); setPage(1); }, options: [{ label: "All flags", value: "all" }, { label: "Flagged only", value: "flagged" }, { label: "No flags", value: "clear" }], className: "min-w-32" },
      { label: "Date range", value: range, onChange: (value) => { setRange(value); setPage(1); }, options: [{ label: "All time", value: "all" }, { label: "Last 7 days", value: "7" }, { label: "Last 30 days", value: "30" }, { label: "Last 90 days", value: "90" }], className: "min-w-38" },
    ]} segments={[]} activeSegment="" onSegmentChange={() => undefined} />

    <DataTablePanel darkMode={darkMode} className="mt-3">
      {error ? <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center"><AlertCircle className="h-9 w-9 text-rose-500" /><h2 className="mt-4 text-lg font-semibold">Sessions could not be loaded</h2><p className="mt-2 max-w-lg text-sm text-slate-500">{error}</p><Button className="mt-5" onClick={() => void loadSessions()}>Try again</Button></div> : loading ? <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle className="h-7 w-7 animate-spin text-primary" />Loading sessions...</div> : sessions.length === 0 ? <EmptySessions filtered={Boolean(overview?.total_sessions) && filtersActive} darkMode={darkMode} onClear={clearFilters} /> : <>
        <DataTable darkMode={darkMode} minWidthClassName="min-w-[980px]"><thead><tr><th>Session</th><th>Scope</th><th>Date & time</th><th>Attendance</th><th>Status</th><th>Flags</th><th className="text-right">Details</th></tr></thead><tbody>{sessions.map((session) => { const scheduled = formatSessionDate(session.scheduled_start_at); const progress = session.eligible ? Math.min(100, Math.round(session.present / session.eligible * 100)) : 0; return <tr key={session.id}><td><div className="font-semibold">{session.name}</div><div className="mt-1 text-xs text-slate-400">Created by {session.created_by.display_name}</div></td><td><div className="font-medium">{session.audience.name}</div><div className="mt-1 text-xs text-slate-400">{session.unit.name}</div></td><td className="text-slate-500 dark:text-slate-400">{scheduled.date}<br /><span className="text-xs">{scheduled.time}</span></td><td className="min-w-40"><div className="text-sm text-slate-500">{session.present}/{session.eligible}</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div></td><td><StatusPill status={session.status} /></td><td>{session.flags ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{session.flags} flagged</span> : <span className="text-slate-400">-</span>}</td><td className="text-right"><button type="button" onClick={() => setSelected(session)} aria-label={`View ${session.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"><Eye className="h-4 w-4" /></button></td></tr>; })}</tbody></DataTable>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800"><span className="text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</span><div className="flex items-center gap-2"><Button variant="outline" className="h-9 px-3" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button><span className="px-2 text-sm font-semibold">{page} / {totalPages}</span><Button variant="outline" className="h-9 px-3" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button></div></div>
      </>}
    </DataTablePanel>
    {selected ? <SessionDetails session={selected} darkMode={darkMode} onClose={() => setSelected(null)} onViewAttendance={() => router.push(`/dashboard/attendance?view=${accessRole}&sessionId=${encodeURIComponent(selected.id)}`)} /> : null}
    {createOpen ? <CreateSessionDialog darkMode={darkMode} audiences={audiences} saving={creating} error={createError} onClose={() => { if (!creating) setCreateOpen(false); }} onSubmit={(values) => void handleCreate(values)} /> : null}
  </section>;
}

export function SessionsWorkspace({
  darkMode,
  role,
  accessRole,
  allowedAudienceIds,
}: {
  darkMode: boolean;
  role: RoleKey;
  accessRole: RoleKey;
  allowedAudienceIds: number[];
}) {
  if (role === "audience") {
    return <AudienceSessionsWorkspace darkMode={darkMode} allowedAudienceIds={allowedAudienceIds} />;
  }

  return <SessionsOversightWorkspace darkMode={darkMode} accessRole={accessRole} />;
}
