"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  Grid2X2,
  List,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import { DataTable } from "@/components/ui/DataTable";
import { DataTablePanel } from "@/components/ui/DataTablePanel";
import { Card } from "@/components/ui/Card";
import { getTenantUnits, type TenantUnitListItem } from "@/features/dashboard/api/tenant-units";
import {
  exportTenantSessionAttendance,
  getTenantAttendanceSession,
  getTenantAttendanceOverview,
  getTenantAttendanceSessions,
  getTenantSessionAttendance,
  getTenantSessionAttendanceSummary,
  type TenantAttendanceOverview,
  type TenantAttendanceSession,
  type TenantAttendanceStatus,
  type TenantSessionAttendancePage,
  type TenantSessionAttendanceSummary,
} from "@/features/dashboard/api/tenant-attendance";
import { getOrganizationOnboardingAudiences } from "@/features/onboarding/api/tenant-onboarding";
import { readTenantLoginContext } from "@/lib/auth/tenant-session";
import { cn } from "@/utils";
import { TableFilterBar } from "../units/shared";
import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";
import type { RoleKey } from "../types";

type AttendanceView = "table" | "grid";
type FlagFilter = "all" | "flagged" | "clear";
const PAGE_SIZE = 10;

const statusOptions: Array<{ label: string; value: TenantAttendanceStatus }> = [
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
  { label: "Locked", value: "locked" },
  { label: "Archived", value: "archived" },
  { label: "Cancelled", value: "cancelled" },
];

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "" };
  return {
    date: new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date),
  };
}

function statusLabel(status: string) {
  return status === "active" ? "Active" : status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    completed: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
    locked: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
    archived: "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
    draft: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
    scheduled: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200",
    cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]", styles[status] ?? styles.archived)}>
      {status === "locked" ? <LockKeyhole className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {statusLabel(status)}
    </span>
  );
}

function MetricCard({ label, value, tone = "default", helper }: { label: string; value: string; tone?: "default" | "success" | "warning" | "primary"; helper?: string }) {
  const toneClass = tone === "success" ? "text-emerald-600 dark:text-emerald-300" : tone === "warning" ? "text-amber-700 dark:text-amber-300" : tone === "primary" ? "text-primary dark:text-teal-300" : "";
  return (
    <Card className="min-h-24 rounded-[18px] border border-slate-200 bg-white p-4 shadow-none dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</div>
      <div className={cn("mt-2 text-xl font-bold", toneClass)}>{value}</div>
      {helper ? <div className="mt-2 text-xs font-semibold leading-4 text-slate-500 dark:text-slate-400">{helper}</div> : null}
    </Card>
  );
}

function Pagination({
  page,
  pageSize,
  count,
  hasPrevious,
  hasNext,
  onChange,
}: {
  page: number;
  pageSize: number;
  count: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onChange: (page: number) => void;
}) {
  const start = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(count, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800">
      <span className="font-semibold text-slate-500 dark:text-slate-400">Showing {start}–{end} of {count} sessions</span>
      <div className="flex items-center gap-2">
        <button type="button" disabled={!hasPrevious} onClick={() => onChange(page - 1)} aria-label="Previous page" className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200"><ChevronLeft className="mx-auto h-4 w-4" /></button>
        <span className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Page {page}</span>
        <button type="button" disabled={!hasNext} onClick={() => onChange(page + 1)} aria-label="Next page" className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200"><ChevronRight className="mx-auto h-4 w-4" /></button>
      </div>
    </div>
  );
}

function SessionDetailDialog({
  session,
  darkMode,
  onClose,
  onExportError,
}: {
  session: TenantAttendanceSession;
  darkMode: boolean;
  onClose: () => void;
  onExportError: (message: string) => void;
}) {
  const [summary, setSummary] = useState<TenantSessionAttendanceSummary | null>(null);
  const [attendance, setAttendance] = useState<TenantSessionAttendancePage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const dark = darkMode;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void Promise.all([
      getTenantSessionAttendanceSummary(session.id),
      getTenantSessionAttendance(session.id, { page, page_size: PAGE_SIZE }),
    ]).then(([summaryResult, attendanceResult]) => {
      if (!active) return;
      if (summaryResult.success) setSummary(summaryResult.data);
      else setError(summaryResult.message);
      if (attendanceResult.success) setAttendance(attendanceResult.data);
      else setError((current) => current || attendanceResult.message);
      setLoading(false);
    });
    return () => { active = false; };
  }, [session.id, page]);

  async function handleExport() {
    setExporting(true);
    const result = await exportTenantSessionAttendance(session.id);
    setExporting(false);
    if (!result.success) {
      onExportError(result.message);
      return;
    }
    const url = URL.createObjectURL(result.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const scheduled = formatDateTime(session.scheduled_start_at);
  const panelClass = dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${session.name} attendance`} onMouseDown={onClose}>
      <div className={cn("max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border shadow-2xl", panelClass)} onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-inherit p-6 dark:border-slate-700">
          <div>
            <div className="flex flex-wrap items-center gap-3"><h2 className={cn("text-2xl font-bold", dark ? "text-white" : "text-slate-950")}>{session.name}</h2><StatusPill status={session.status} /></div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{session.audience.name} · {session.unit.name} · {scheduled.date}, {scheduled.time}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close attendance details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Checked in" value={summary ? String(summary.checked_in_count) : "—"} tone="success" />
            <MetricCard label="Eligible users" value={summary ? String(summary.eligible_count) : "—"} />
            <MetricCard label="Attendance rate" value={summary ? `${Math.round(summary.attendance_percentage)}%` : "—"} tone="primary" />
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className={cn("text-lg font-bold", dark ? "text-white" : "text-slate-950")}>Attendance records</h3><p className="text-sm text-slate-500 dark:text-slate-400">Eligible members, check-in timestamps, and validation results.</p></div>
            <button type="button" disabled={exporting} onClick={() => void handleExport()} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"><FileDown className="h-4 w-4" />{exporting ? "Preparing CSV…" : "Export CSV"}</button>
          </div>
          {error ? <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}
          <DataTablePanel darkMode={darkMode} className="mt-4">
            <div className="overflow-x-auto">
              <DataTable darkMode={darkMode} className="min-w-[760px] w-full text-left text-sm">
                <thead className={dark ? "bg-slate-800" : "bg-slate-100"}><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">ID</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Notes</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500"><LoaderCircle className="mx-auto h-5 w-5 animate-spin text-primary" /><span className="mt-2 block">Loading attendance records…</span></td></tr> : null}
                  {!loading && attendance?.results.map((record, index) => <tr key={record.id ?? `${record.member_id ?? record.user_name}-${index}`} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-4 font-semibold">{record.user_name}</td><td className="px-4 py-4 text-slate-500 dark:text-slate-400">{record.member_id || "—"}</td><td className="px-4 py-4">{record.check_in_time ? formatDateTime(record.check_in_time).time : "—"}</td>
                    <td className="px-4 py-4"><span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", record.status === "Present" ? "bg-emerald-50 text-emerald-700" : record.status === "Late" ? "bg-sky-50 text-sky-700" : record.status === "Flagged" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600")}>{record.status}</span></td><td className="px-4 py-4">{record.method || "—"}</td><td className="px-4 py-4 text-slate-500 dark:text-slate-400">{record.notes || "—"}</td>
                  </tr>)}
                  {!loading && attendance?.results.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No attendance records are available for this session.</td></tr> : null}
                </tbody>
              </DataTable>
            </div>
            {attendance ? <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <span>Showing {attendance.count === 0 ? 0 : (page - 1) * attendance.page_size + 1}–{Math.min(page * attendance.page_size, attendance.count)} of {attendance.count} eligible members</span>
              <div className="flex gap-2"><button type="button" disabled={!attendance.previous} onClick={() => setPage((current) => current - 1)} aria-label="Previous attendance page" className="rounded-lg bg-slate-100 p-2 disabled:opacity-40 dark:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={!attendance.next} onClick={() => setPage((current) => current + 1)} aria-label="Next attendance page" className="rounded-lg bg-slate-100 p-2 disabled:opacity-40 dark:bg-slate-800"><ChevronRight className="h-4 w-4" /></button></div>
            </div> : null}
          </DataTablePanel>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Results are scoped to your organisation and role.</div>
        </div>
      </div>
    </div>
  );
}

export function AttendanceWorkspace({
  darkMode,
  accessRole,
  allowedUnitIds,
  allowedAudienceIds,
}: {
  darkMode: boolean;
  accessRole: RoleKey;
  allowedUnitIds: number[];
  allowedAudienceIds: number[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSessionId = searchParams.get("sessionId");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [unitId, setUnitId] = useState("all");
  const [audienceId, setAudienceId] = useState("all");
  const [status, setStatus] = useState("all");
  const [flags, setFlags] = useState<FlagFilter>("all");
  const [view, setView] = useState<AttendanceView>("table");
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<TenantAttendanceSession[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [overview, setOverview] = useState<TenantAttendanceOverview | null>(null);
  const [units, setUnits] = useState<TenantUnitListItem[]>([]);
  const [audiences, setAudiences] = useState<Array<{ id: number; name: string; unitId: number }>>([]);
  const [selected, setSelected] = useState<TenantAttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [listError, setListError] = useState("");
  const [exportError, setExportError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const latestRequest = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => { setPage(1); }, [debouncedQuery, unitId, audienceId, status, flags]);

  useEffect(() => {
    let active = true;
    const organizationId = readTenantLoginContext()?.organizationId;
    if (!organizationId) return () => { active = false; };
    void Promise.all([getTenantUnits({ page: 1 }), getOrganizationOnboardingAudiences(organizationId)]).then(([unitResult, audienceResult]) => {
      if (!active) return;
      const visibleAudiences = audienceResult.success
        ? audienceResult.data.results.filter((audience) =>
            accessRole === "super" ||
            (accessRole === "unit" && allowedUnitIds.includes(audience.unit)) ||
            (accessRole === "audience" && allowedAudienceIds.includes(audience.audience_id)),
          )
        : [];
      if (unitResult.success) {
        setUnits(unitResult.data.data.filter((unit) =>
          accessRole === "super" ||
          allowedUnitIds.includes(unit.unit_id) ||
          visibleAudiences.some((audience) => audience.unit === unit.unit_id),
        ));
      }
      setAudiences(visibleAudiences.map((audience) => ({
        id: audience.audience_id,
        name: audience.name,
        unitId: audience.unit,
      })));
    });
    return () => { active = false; };
  }, [accessRole, allowedAudienceIds, allowedUnitIds]);

  useEffect(() => {
    let active = true;
    if (!requestedSessionId) return () => { active = false; };

    void getTenantAttendanceSession(requestedSessionId).then((result) => {
      if (!active) return;
      if (result.success) {
        setSelected(result.data);
        setExportError("");
      } else {
        setExportError(result.message);
      }
    });

    return () => { active = false; };
  }, [requestedSessionId]);

  const filters = useMemo(() => ({
    ...(debouncedQuery ? { search: debouncedQuery } : {}),
    ...(unitId !== "all" ? { unit_id: Number(unitId) } : {}),
    ...(audienceId !== "all" ? { audience_id: Number(audienceId) } : {}),
    ...(status !== "all" ? { status: status as TenantAttendanceStatus } : {}),
    flag_state: flags,
  }), [audienceId, debouncedQuery, flags, status, unitId]);

  const loadData = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setRefreshing(true);
    setListError("");
    const [listResult, overviewResult] = await Promise.all([
      getTenantAttendanceSessions({ ...filters, page, page_size: PAGE_SIZE }),
      getTenantAttendanceOverview(filters),
    ]);
    if (requestId !== latestRequest.current) return;
    if (listResult.success) {
      setSessions(listResult.data.results);
      setTotal(listResult.data.count);
      setHasNext(Boolean(listResult.data.next));
      setHasPrevious(Boolean(listResult.data.previous));
    } else {
      setSessions([]);
      setTotal(0);
      setHasNext(false);
      setHasPrevious(false);
      setListError(listResult.message);
    }
    if (overviewResult.success) {
      setOverview(overviewResult.data);
      setOverviewError("");
    } else {
      setOverview(null);
      setOverviewError(overviewResult.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, [filters, page]);

  useEffect(() => { void loadData(); }, [loadData]);

  const unitOptions = useMemo(() => [
    { label: "All Units", value: "all" },
    ...units.map((unit) => ({ label: unit.name, value: String(unit.unit_id) })),
  ], [units]);
  const audienceOptions = useMemo(() => [
    { label: "All Audiences", value: "all" },
    ...audiences
      .filter((audience) => unitId === "all" || audience.unitId === Number(unitId))
      .map((audience) => ({ label: audience.name, value: String(audience.id) })),
  ], [audiences, unitId]);

  function closeSessionDetails() {
    setSelected(null);
    if (requestedSessionId) {
      router.replace(`/dashboard/attendance?view=${accessRole}`);
    }
  }

  function handleExportError(message: string) {
    setExportError(message);
  }

  const metricValue = (value: number | undefined) => value === undefined ? "—" : value.toLocaleString();

  return (
    <section className="pb-8">
      <UnitsPageHeader darkMode={darkMode} title="Attendance" description={accessRole === "unit" ? "Session and attendance oversight for your assigned unit" : accessRole === "audience" ? "Attendance records for your assigned audience" : "Organization-wide session and attendance oversight"} />

      <div className={cn("mt-2 flex items-start gap-4 rounded-2xl border-l-4 border-green-600 px-5 py-4 text-sm", darkMode ? "bg-slate-800 text-slate-200" : "bg-[#eeeeee] text-slate-800")}>
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
        <p>Sessions are created by <strong>Audience Admins</strong>. You can view records and export attendance results within your assigned scope.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Total sessions" value={overview ? metricValue(overview.total_sessions) : "—"} />
        <MetricCard label="Active sessions" value={overview ? metricValue(overview.active_sessions) : "—"} tone="success" />
        <MetricCard label="Flagged records" value={overview ? metricValue(overview.flagged_attendance_records) : "—"} tone="warning" />
        <MetricCard label="Validation mode" value={overview?.validation_mode ?? "—"} tone="success" helper={overview?.validation_description ?? (overviewError || "Loading validation policy…")} />
        <MetricCard label="Avg. attendance rate" value={overview ? `${Math.round(overview.average_attendance_rate)}%` : "—"} tone="primary" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setView("table")} aria-pressed={view === "table"} className={cn("flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold", view === "table" ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400")}><List className="h-5 w-5" /> Table</button>
          <button type="button" onClick={() => setView("grid")} aria-pressed={view === "grid"} className={cn("flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold", view === "grid" ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400")}><Grid2X2 className="h-5 w-5" /> Grid</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><ShieldCheck className="h-4 w-4 text-primary" /> Tenant scoped</div>
          <button type="button" onClick={() => void loadData()} disabled={refreshing} aria-label="Refresh attendance" className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /></button>
        </div>
      </div>

      <div className="mt-1">
        <TableFilterBar
          darkMode={darkMode}
          searchPlaceholder="Search sessions, units, or audiences…"
          searchValue={query}
          onSearchChange={setQuery}
          selects={[
            ...(accessRole !== "audience" ? [{ label: "Unit", value: unitId, onChange: (value: string) => { setUnitId(value); setAudienceId("all"); }, options: unitOptions, className: "w-full sm:w-auto sm:min-w-40" }] : []),
            { label: "Audience", value: audienceId, onChange: setAudienceId, options: audienceOptions, className: "w-full sm:w-auto sm:min-w-44" },
            { label: "Status", value: status, onChange: setStatus, options: [{ label: "All Statuses", value: "all" }, ...statusOptions], className: "w-full sm:w-auto sm:min-w-36" },
            { label: "Flags", value: flags, onChange: (value) => setFlags(value as FlagFilter), options: [{ label: "All Flags", value: "all" }, { label: "Flagged Only", value: "flagged" }, { label: "No Flags", value: "clear" }], className: "w-full sm:w-auto sm:min-w-36" },
          ]}
          segments={[]}
          activeSegment=""
          onSegmentChange={() => undefined}
        />
      </div>

      {overviewError ? <p role="status" className="mt-3 text-xs text-amber-700 dark:text-amber-300">Attendance overview unavailable: {overviewError}</p> : null}
      {listError ? <Card className="mt-5 flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center"><p className="max-w-xl text-sm text-rose-700 dark:text-rose-300">{listError}</p><button type="button" onClick={() => void loadData()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Try again</button></Card> : (
        <>
          {view === "table" ? (
            <DataTablePanel darkMode={darkMode} className="mt-7">
              <div className="overflow-x-auto">
                <DataTable darkMode={darkMode} className="min-w-[1040px] w-full text-left text-sm">
                  <thead className={cn("text-xs uppercase tracking-[0.04em]", darkMode ? "bg-slate-800 text-slate-300" : "bg-[#e7eaee] text-slate-600")}><tr><th className="px-5 py-4">Session name</th><th className="px-4 py-4">Unit</th><th className="px-4 py-4">Audience</th><th className="px-4 py-4">Date/time</th><th className="px-4 py-4">Attendance</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Flags</th><th className="px-4 py-4 text-right">View</th></tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-500"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" /><span className="mt-2 block">Loading attendance sessions…</span></td></tr> : null}
                    {!loading && sessions.map((session) => {
                      const scheduled = formatDateTime(session.scheduled_start_at);
                      const progress = session.eligible > 0 ? Math.min(100, Math.round(session.present / session.eligible * 100)) : 0;
                      return <tr key={session.id} className={cn("border-t transition", darkMode ? "border-slate-800 hover:bg-slate-800/60" : "border-slate-200 hover:bg-slate-50")}>
                        <td className="px-5 py-4 font-semibold">{session.name}</td><td className="px-4 py-4 text-xs font-bold uppercase">{session.unit.name}</td><td className="px-4 py-4 text-slate-500 dark:text-slate-400">{session.audience.name}</td><td className="px-4 py-4 text-slate-500 dark:text-slate-400">{scheduled.date}<br />{scheduled.time}</td>
                        <td className="min-w-36 px-4 py-4"><div className="text-slate-500 dark:text-slate-400">{session.present}/{session.eligible}</div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div></td>
                        <td className="px-4 py-4"><StatusPill status={session.status} /></td><td className="px-4 py-4">{session.flags ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{session.flags} Flagged</span> : <span className="text-slate-400">—</span>}</td><td className="px-4 py-4 text-right"><button type="button" onClick={() => { setSelected(session); setExportError(""); }} aria-label={`View ${session.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="h-4 w-4" /></button></td>
                      </tr>;
                    })}
                    {!loading && sessions.length === 0 ? <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-500">No sessions match the selected filters.</td></tr> : null}
                  </tbody>
                </DataTable>
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} count={total} hasPrevious={hasPrevious} hasNext={hasNext} onChange={setPage} />
            </DataTablePanel>
          ) : (
            <>
              {loading ? <Card className="mt-7 flex min-h-52 items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-primary" />Loading attendance sessions…</Card> : sessions.length === 0 ? <div className="py-20 text-center text-slate-500">No sessions match the selected filters.</div> : <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sessions.map((session) => {
                  const scheduled = formatDateTime(session.scheduled_start_at);
                  const progress = session.eligible > 0 ? Math.min(100, Math.round(session.present / session.eligible * 100)) : 0;
                  return <Card key={session.id} role="button" tabIndex={0} onClick={() => { setSelected(session); setExportError(""); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(session); setExportError(""); } }} className={cn("cursor-pointer rounded-2xl border p-5 transition hover:-translate-y-0.5", darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white")}>
                    <div className="flex items-start justify-between gap-3"><h3 className="font-bold">{session.name}</h3><StatusPill status={session.status} /></div><div className="mt-2 text-sm text-slate-500">{session.audience.name} · {session.unit.name}</div>
                    <div className="mt-5 flex items-end justify-between"><div><div className="text-xs uppercase text-slate-400">Attendance</div><div className="mt-1 text-2xl font-black">{session.present}/{session.eligible}</div></div><div className="text-right text-sm text-slate-500">{scheduled.date}<br />{scheduled.time}</div></div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div>
                    <div className="mt-4 flex items-center justify-between text-xs"><span className="text-slate-500">{session.flags ? `${session.flags} flagged` : "No flags"}</span><span className="font-semibold text-primary">View records</span></div>
                  </Card>;
                })}
              </div>}
              {!loading && !listError ? <DataTablePanel darkMode={darkMode} className="mt-4"><Pagination page={page} pageSize={PAGE_SIZE} count={total} hasPrevious={hasPrevious} hasNext={hasNext} onChange={setPage} /></DataTablePanel> : null}
            </>
          )}
        </>
      )}

      {selected ? <SessionDetailDialog session={selected} darkMode={darkMode} onClose={closeSessionDetails} onExportError={handleExportError} /> : null}
      {exportError ? <div role="alert" className="fixed bottom-4 right-4 z-[70] flex max-w-md items-start gap-3 rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-800 shadow-xl dark:border-rose-900 dark:bg-slate-900 dark:text-rose-200"><span className="flex-1">{exportError}</span><button type="button" aria-label="Dismiss export error" onClick={() => setExportError("")}><X className="h-4 w-4" /></button></div> : null}
    </section>
  );
}
