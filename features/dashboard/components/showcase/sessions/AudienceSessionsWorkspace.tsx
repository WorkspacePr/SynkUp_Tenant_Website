"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid2X2,
  List,
  LoaderCircle,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  SearchX,
  ShieldCheck,
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
  getTenantAttendanceSessions,
  getTenantSessionQr,
  type TenantAttendanceSession,
  type TenantAttendanceStatus,
  type TenantSessionQr,
} from "@/features/dashboard/api/tenant-attendance";
import { getOrganizationOnboardingAudiences } from "@/features/onboarding/api/tenant-onboarding";
import { readTenantLoginContext } from "@/lib/auth/tenant-session";
import { cn } from "@/utils";

import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";

const PAGE_SIZE = 10;
type ViewMode = "table" | "grid";
type CreateStep = "details" | "rules" | "review" | "success";
type AudienceOption = { id: number; name: string; unitId: number };
type FormValues = {
  name: string;
  audienceId: string;
  date: string;
  startTime: string;
  duration: string;
  lateAllowance: string;
};

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Locked", value: "locked" },
  { label: "Archived", value: "archived" },
  { label: "Cancelled", value: "cancelled" },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "-" };
  return {
    date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

function StatusPill({ status }: { status: TenantAttendanceStatus }) {
  const tones: Record<TenantAttendanceStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    scheduled: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    completed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    locked: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    archived: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide", tones[status])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

function Stepper({ step }: { step: CreateStep }) {
  const current = step === "details" ? 0 : step === "rules" ? 1 : 2;
  return <div className="grid grid-cols-3 gap-2">{["Details", "Validation rules", "Review"].map((label, index) => <div key={label} className="min-w-0"><div className={cn("h-1.5 rounded-full", index <= current ? "bg-primary" : "bg-slate-200 dark:bg-slate-700")} /><div className={cn("mt-2 truncate text-xs font-semibold", index <= current ? "text-primary" : "text-slate-400")}>{index < current ? "✓ " : ""}{label}</div></div>)}</div>;
}

function CreateSessionFlow({ darkMode, audiences, onClose, onCreated, onView }: {
  darkMode: boolean;
  audiences: AudienceOption[];
  onClose: () => void;
  onCreated: (session: TenantAttendanceSession) => void;
  onView: (session: TenantAttendanceSession) => void;
}) {
  const [step, setStep] = useState<CreateStep>("details");
  const [values, setValues] = useState<FormValues>({ name: "", audienceId: String(audiences[0]?.id ?? ""), date: "", startTime: "", duration: "60", lateAllowance: "10" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<TenantAttendanceSession | null>(null);
  const [qr, setQr] = useState<TenantSessionQr | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const selectedAudience = audiences.find((audience) => String(audience.id) === values.audienceId);
  const start = values.date && values.startTime ? new Date(`${values.date}T${values.startTime}`) : null;
  const end = start ? new Date(start.getTime() + Number(values.duration) * 60_000) : null;
  const detailsValid = Boolean(values.name.trim() && values.audienceId && start && end);
  const panel = darkMode ? "border-slate-700 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950";
  const input = cn("mt-2 min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15", darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white");

  async function createSession() {
    if (!start || !end) return;
    setSaving(true);
    setError("");
    const result = await createTenantAttendanceSession({
      audience_id: Number(values.audienceId),
      name: values.name.trim(),
      scheduled_date: values.date,
      scheduled_start_at: start.toISOString(),
      scheduled_end_at: end.toISOString(),
      late_allowance_minutes: Number(values.lateAllowance),
      eligibility_rule: { type: "audience_members", validation_method: "qr_code" },
      qr_refresh_interval_seconds: 30,
    });
    setSaving(false);
    if (!result.success) { setError(result.message); return; }
    setCreated(result.data);
    setStep("success");
    onCreated(result.data);
    setQrLoading(true);
    const qrResult = await getTenantSessionQr(result.data.id);
    setQrLoading(false);
    if (qrResult.success) setQr(qrResult.data);
  }

  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={() => { if (!saving) onClose(); }}>
    <Card className={cn("max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border p-6 shadow-2xl", panel)} onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Audience session</p><h2 className="mt-2 text-2xl font-semibold">{step === "success" ? "Session created" : "Create a session"}</h2></div><button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><X className="h-5 w-5" /></button></div>
      {step !== "success" ? <div className="mt-6"><Stepper step={step} /></div> : null}

      {step === "details" ? <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="text-sm font-semibold">Session name</span><input autoFocus value={values.name} maxLength={150} onChange={(event) => setValues({ ...values, name: event.target.value })} className={input} placeholder="e.g. Week 6 lecture" /></label>
        <label className="sm:col-span-2"><span className="text-sm font-semibold">Audience</span><Select value={values.audienceId} onChange={(audienceId) => setValues({ ...values, audienceId })} options={audiences.map((audience) => ({ label: audience.name, value: String(audience.id) }))} className="mt-2" variant="compact" darkMode={darkMode} buttonClassName="min-h-11 rounded-xl px-3.5 font-normal shadow-none" aria-label="Audience" /></label>
        <label><span className="text-sm font-semibold">Date</span><input type="date" value={values.date} onChange={(event) => setValues({ ...values, date: event.target.value })} className={input} /></label>
        <label><span className="text-sm font-semibold">Start time</span><input type="time" value={values.startTime} onChange={(event) => setValues({ ...values, startTime: event.target.value })} className={input} /></label>
        <label className="sm:col-span-2"><span className="text-sm font-semibold">Expected duration</span><Select value={values.duration} onChange={(duration) => setValues({ ...values, duration })} options={[{ label: "30 minutes", value: "30" }, { label: "1 hour", value: "60" }, { label: "1 hour 30 minutes", value: "90" }, { label: "2 hours", value: "120" }]} className="mt-2" variant="compact" darkMode={darkMode} buttonClassName="min-h-11 rounded-xl px-3.5 font-normal shadow-none" aria-label="Expected duration" /></label>
      </div> : null}

      {step === "rules" ? <div className="mt-7 space-y-5">
        <div><div className="text-sm font-semibold">Validation method</div><div className="mt-2 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white"><QrCode className="h-5 w-5" /></div><div><div className="font-semibold">Rotating QR code</div><p className="text-xs text-slate-500 dark:text-slate-400">The code refreshes every 30 seconds to reduce shared check-ins.</p></div><CheckCircle2 className="ml-auto h-5 w-5 text-primary" /></div></div>
        <label><span className="text-sm font-semibold">Late allowance</span><Select value={values.lateAllowance} onChange={(lateAllowance) => setValues({ ...values, lateAllowance })} options={[{ label: "No late allowance", value: "0" }, { label: "5 minutes", value: "5" }, { label: "10 minutes", value: "10" }, { label: "15 minutes", value: "15" }, { label: "30 minutes", value: "30" }]} className="mt-2" variant="compact" darkMode={darkMode} buttonClassName="min-h-11 rounded-xl px-3.5 font-normal shadow-none" aria-label="Late allowance" /></label>
        <div><div className="text-sm font-semibold">Expected attendees</div><div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><UsersRound className="h-5 w-5 text-primary" /><div><div className="font-semibold">All active audience members</div><p className="text-xs text-slate-500 dark:text-slate-400">Eligibility is resolved by the backend when the session starts.</p></div></div></div>
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"><ShieldCheck className="mr-2 inline h-4 w-4" />Validation rules are enforced server-side and recorded in the activity log.</div>
      </div> : null}

      {step === "review" ? <div className="mt-7">
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"><div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-wide text-slate-400">Session</div><h3 className="mt-1 text-xl font-semibold">{values.name}</h3><p className="mt-1 text-sm text-slate-500">{selectedAudience?.name}</p></div><CalendarDays className="h-6 w-6 text-primary" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{[["Starts", start ? formatDateTime(start.toISOString()).date + " · " + formatDateTime(start.toISOString()).time : "-"], ["Ends", end ? formatDateTime(end.toISOString()).time : "-"], ["Validation", "Rotating QR code"], ["Late allowance", `${values.lateAllowance} minutes`]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><div className="text-xs font-semibold uppercase text-slate-400">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div>)}</div></div>
        <p className="mt-4 text-sm text-slate-500">Please confirm the schedule. If it conflicts with another session, the server will stop creation and return the exact conflict.</p>
      </div> : null}

      {step === "success" && created ? <div className="mt-7 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"><Check className="h-10 w-10" /></div><h3 className="mt-5 text-2xl font-semibold">Ready for attendance</h3><p className="mt-2 text-sm text-slate-500">{created.name} has been scheduled for {formatDateTime(created.scheduled_start_at).date} at {formatDateTime(created.scheduled_start_at).time}.</p><div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 p-5 text-left dark:border-slate-700"><div className="flex items-center gap-3"><QrCode className="h-8 w-8 text-primary" /><div><div className="font-semibold">Session QR secured</div><div className="text-xs text-slate-500">The active token rotates automatically.</div></div></div>{qr?.session_code || qr?.token || qr?.qr_token ? <div className="mt-4 rounded-xl bg-slate-100 p-3 font-mono text-xs break-all dark:bg-slate-900">{qr.session_code || qr.token || qr.qr_token}</div> : qrLoading ? <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Preparing session token…</div> : <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-900">The rotating QR token becomes available when the session is ready to accept check-ins.</div>}</div><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center"><Button variant="outline" onClick={onClose}>Done</Button><Button onClick={() => { onClose(); onView(created); }}><Eye className="h-4 w-4" />View session</Button></div></div> : null}

      {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-500/10 dark:text-rose-200">{error}</div> : null}
      {step !== "success" ? <div className="mt-7 flex items-center justify-between gap-3"><Button variant="outline" disabled={saving} onClick={() => step === "details" ? onClose() : setStep(step === "review" ? "rules" : "details")}><ChevronLeft className="h-4 w-4" />{step === "details" ? "Cancel" : "Back"}</Button><Button disabled={(step === "details" && !detailsValid) || saving} onClick={() => step === "details" ? setStep("rules") : step === "rules" ? setStep("review") : void createSession()}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : step === "review" ? <Check className="h-4 w-4" /> : null}{saving ? "Creating…" : step === "review" ? "Create session" : "Continue"}<ChevronRight className="h-4 w-4" /></Button></div> : null}
    </Card>
  </div>;
}

export function AudienceSessionsWorkspace({ darkMode, allowedAudienceIds }: { darkMode: boolean; allowedAudienceIds: number[] }) {
  const router = useRouter();
  const [audiences, setAudiences] = useState<AudienceOption[]>([]);
  const [activeAudience, setActiveAudience] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("30");
  const [view, setView] = useState<ViewMode>("table");
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<TenantAttendanceSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    const organizationId = readTenantLoginContext()?.organizationId;
    if (!organizationId) return;
    void getOrganizationOnboardingAudiences(organizationId).then((result) => {
      if (!result.success) return;
      setAudiences(result.data.results.filter((audience) => allowedAudienceIds.includes(audience.audience_id)).map((audience) => ({ id: audience.audience_id, name: audience.name, unitId: audience.unit })));
    });
  }, [allowedAudienceIds]);

  const loadSessions = useCallback(async () => {
    const request = ++latestRequest.current;
    setLoading(true);
    setError("");
    const end = new Date(); const start = new Date(); start.setDate(end.getDate() - Number(range));
    const result = await getTenantAttendanceSessions({ search: query.trim() || undefined, audience_id: activeAudience === "all" ? undefined : Number(activeAudience), status: status === "all" ? undefined : status as TenantAttendanceStatus, date_from: range === "all" ? undefined : start.toISOString().slice(0, 10), date_to: range === "all" ? undefined : end.toISOString().slice(0, 10), page, page_size: PAGE_SIZE });
    if (request !== latestRequest.current) return;
    if (result.success) { setSessions(result.data.results); setTotal(result.data.count); } else { setSessions([]); setTotal(0); setError(result.message); }
    setLoading(false);
  }, [activeAudience, page, query, range, status]);

  useEffect(() => { const timer = window.setTimeout(() => void loadSessions(), 250); return () => window.clearTimeout(timer); }, [loadSessions]);
  const filtersActive = Boolean(query || status !== "all" || range !== "all" || activeAudience !== "all");
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const clearFilters = () => { setQuery(""); setStatus("all"); setRange("all"); setActiveAudience("all"); setPage(1); };

  return <section className="pb-10">
    <UnitsPageHeader darkMode={darkMode} title="Sessions" description="Create sessions and manage attendance for your assigned audiences" actionSlot={<Button disabled={audiences.length === 0} onClick={() => setCreateOpen(true)} className="rounded-xl"><Plus className="h-4 w-4" />Create session</Button>} />
    <div className="mt-5 overflow-x-auto border-b border-slate-200 dark:border-slate-800"><div className="flex min-w-max items-center gap-1"><button onClick={() => { setActiveAudience("all"); setPage(1); }} className={cn("border-b-2 px-4 py-3 text-sm font-semibold", activeAudience === "all" ? "border-primary text-primary" : "border-transparent text-slate-500")}>All audiences</button>{audiences.map((audience) => <button key={audience.id} onClick={() => { setActiveAudience(String(audience.id)); setPage(1); }} className={cn("border-b-2 px-4 py-3 text-sm font-semibold", activeAudience === String(audience.id) ? "border-primary text-primary" : "border-transparent text-slate-500")}>{audience.name}</button>)}</div></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900"><button onClick={() => setView("table")} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold", view === "table" && "bg-white text-primary shadow-sm dark:bg-slate-800")}><List className="h-4 w-4" />Table</button><button onClick={() => setView("grid")} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold", view === "grid" && "bg-white text-primary shadow-sm dark:bg-slate-800")}><Grid2X2 className="h-4 w-4" />Grid</button></div><button onClick={() => void loadSessions()} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 dark:border-slate-700" aria-label="Refresh sessions"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button></div>
    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="w-full bg-transparent text-sm outline-none" placeholder="Search sessions…" /></label><Select value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={statusOptions} variant="compact" darkMode={darkMode} className="min-w-40" buttonClassName="min-h-11 rounded-xl shadow-none" aria-label="Status" /><Select value={range} onChange={(value) => { setRange(value); setPage(1); }} options={[{ label: "All time", value: "all" }, { label: "Last 7 days", value: "7" }, { label: "Last 30 days", value: "30" }, { label: "Last 90 days", value: "90" }]} variant="compact" darkMode={darkMode} className="min-w-40" buttonClassName="min-h-11 rounded-xl shadow-none" aria-label="Date range" /></div>
    <DataTablePanel darkMode={darkMode} className="mt-4">
      {error ? <div className="grid min-h-80 place-items-center p-8 text-center"><div><p className="text-rose-600">{error}</p><Button className="mt-4" onClick={() => void loadSessions()}>Try again</Button></div></div> : loading ? <div className="flex min-h-80 items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-primary" />Loading sessions…</div> : sessions.length === 0 ? <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center"><div className="grid h-20 w-20 place-items-center rounded-3xl bg-teal-50 text-primary dark:bg-teal-500/10">{filtersActive ? <SearchX className="h-9 w-9" /> : <CalendarDays className="h-9 w-9" />}</div><h2 className="mt-5 text-xl font-semibold">{filtersActive ? "No sessions match your filters" : "No sessions yet"}</h2><p className="mt-2 max-w-md text-sm text-slate-500">{filtersActive ? "Adjust the search, audience, status, or date range." : "Create your first attendance session for an assigned audience."}</p>{filtersActive ? <Button variant="outline" className="mt-5" onClick={clearFilters}>Clear filters</Button> : <Button className="mt-5" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Create session</Button>}</div> : view === "table" ? <DataTable darkMode={darkMode} minWidthClassName="min-w-[900px]"><thead><tr><th>Session</th><th>Date & time</th><th>Attendance</th><th>Late allowance</th><th>Status</th><th className="text-right">Action</th></tr></thead><tbody>{sessions.map((session) => { const when = formatDateTime(session.scheduled_start_at); const percent = session.eligible ? Math.round(session.present / session.eligible * 100) : 0; return <tr key={session.id}><td><div className="font-semibold">{session.name}</div><div className="mt-1 text-xs text-slate-400">{session.audience.name}</div></td><td className="text-slate-500">{when.date}<br /><span className="text-xs">{when.time}</span></td><td className="min-w-40"><div className="text-xs text-slate-500">{session.present}/{session.eligible}</div><div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div></td><td>{session.late_allowance_minutes} minutes</td><td><StatusPill status={session.status} /></td><td className="text-right"><button onClick={() => router.push(`/dashboard/attendance?view=audience&sessionId=${encodeURIComponent(session.id)}`)} className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-teal-50">View</button></td></tr>; })}</tbody></DataTable> : <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">{sessions.map((session) => { const when = formatDateTime(session.scheduled_start_at); return <Card key={session.id} className="rounded-2xl border border-slate-200 p-5 shadow-none dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{session.name}</h3><p className="mt-1 text-xs text-slate-500">{session.audience.name}</p></div><StatusPill status={session.status} /></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><div className="text-xs text-slate-400">Schedule</div><div className="mt-1 font-semibold">{when.date}<br />{when.time}</div></div><div><div className="text-xs text-slate-400">Attendance</div><div className="mt-1 text-2xl font-semibold">{session.present}/{session.eligible}</div></div></div><Button variant="outline" className="mt-5 w-full" onClick={() => router.push(`/dashboard/attendance?view=audience&sessionId=${encodeURIComponent(session.id)}`)}><Eye className="h-4 w-4" />View session</Button></Card>; })}</div>}
      {!loading && sessions.length > 0 ? <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800"><span className="text-slate-500">Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}</span><div className="flex items-center gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="font-semibold">{page} / {totalPages}</span><Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div> : null}
    </DataTablePanel>
    {createOpen ? <CreateSessionFlow darkMode={darkMode} audiences={audiences} onClose={() => setCreateOpen(false)} onCreated={() => { setPage(1); void loadSessions(); }} onView={(session) => router.push(`/dashboard/attendance?view=audience&sessionId=${encodeURIComponent(session.id)}`)} /> : null}
  </section>;
}
