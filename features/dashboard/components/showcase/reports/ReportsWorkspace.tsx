"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Download, FileText, LoaderCircle, Plus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createTenantReport, getTenantReports, type TenantReport, type TenantReportStatus, type TenantReportType } from "@/features/dashboard/api/tenant-reports";
import { getTenantUnits, type TenantUnitListItem } from "@/features/dashboard/api/tenant-units";
import { cn } from "@/utils";

import { CompactSelect } from "../cards/ShowcaseParts";
import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";
import { PaginationControl, TableFilterBar } from "../units/shared";

const typeLabels: Record<TenantReportType, string> = { attendance_summary: "Attendance Summary", audience_report: "Audience Report", unit_overview: "Unit Overview", user_roster: "User Roster" };
const scopeLabels = { organization: "Organization-Wide", unit: "Unit Restricted", audience: "Audience Restricted" };

function ReportStatusPill({ status }: { status: TenantReportStatus }) {
  const styles = { ready: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300", expired: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300", failed: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300", generating: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300" };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em]", styles[status])}>{status === "ready" ? <CheckCircle2 className="h-3.5 w-3.5" /> : status === "generating" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}{status}</span>;
}

function ReportRowAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <div className="group relative inline-flex"><button type="button" aria-label={label} onClick={onClick} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{children}</button><span className="pointer-events-none absolute right-0 top-[calc(100%+0.4rem)] z-20 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-700">{label}</span></div>;
}

function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—"; }
function rangeStart(value: string) { const date = new Date(); date.setDate(date.getDate() - Number(value)); return date.toISOString().slice(0, 10); }

export function ReportsWorkspace({ darkMode }: { darkMode: boolean }) {
  const [reports, setReports] = useState<TenantReport[]>([]);
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("30");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [reportType, setReportType] = useState<TenantReportType>("attendance_summary");
  const [scope, setScope] = useState<"organization" | "unit" | "audience">("organization");
  const [unitId, setUnitId] = useState("");
  const [audienceId, setAudienceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [units, setUnits] = useState<TenantUnitListItem[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const params = useMemo(() => ({ page, page_size: 10, search: query || undefined, report_type: type === "all" ? undefined : type as TenantReportType, status: status === "all" ? undefined : status as TenantReportStatus, generated_after: rangeStart(range), ordering: "-created_at" }), [page, query, range, status, type]);
  const hasGeneratingReports = reports.some((report) => report.status === "generating");

  async function loadReports(silent = false) {
    if (!silent) setLoading(true);
    const response = await getTenantReports(params);
    if (response.success) { setReports(response.data.results); setCount(response.data.count); } else { setToast(response.message); }
    if (!silent) setLoading(false);
  }

  useEffect(() => { void loadReports(); }, [params]);
  useEffect(() => { void getTenantUnits({ page: 1 }).then((response) => { if (response.success) setUnits(response.data.data); }); }, []);
  useEffect(() => { if (!hasGeneratingReports) return; const interval = window.setInterval(() => void loadReports(true), 5000); return () => window.clearInterval(interval); }, [hasGeneratingReports, params]);

  async function generateReport() {
    let selectedScopeId: number | undefined;
    if (scope !== "organization") {
      const scopeId = Number(scope === "unit" ? unitId : audienceId);
      if (!Number.isInteger(scopeId) || scopeId < 1) { setToast(`Select a valid ${scope} before generating this report.`); return; }
      selectedScopeId = scopeId;
    }
    if (startDate && endDate && startDate > endDate) { setToast("The start date must be before the end date."); return; }
    setRequesting(true);
    const response = await createTenantReport({ report_type: reportType, scope, unit_id: scope === "unit" ? selectedScopeId : undefined, audience_id: scope === "audience" ? selectedScopeId : undefined, start_date: startDate || null, end_date: endDate || null, requested_format: "csv" });
    setRequesting(false);
    if (!response.success) { setToast(response.message); return; }
    setShowGenerator(false); setToast(`Your report “${response.data.name}” is being generated.`); setPage(1); await loadReports(true);
  }

  function download(report: TenantReport) {
    if (!report.download_eligible || !report.download_url) { setToast("This report is not available for download."); return; }
    window.open(report.download_url, "_blank", "noopener,noreferrer");
  }

  return <section className="pb-8">
    <div className="flex flex-wrap items-start justify-between gap-5"><UnitsPageHeader darkMode={darkMode} title="Reports" description="Generate and download organization-wide reports" /><Button className="min-h-12 rounded-xl px-5 py-3 text-sm" onClick={() => setShowGenerator(true)}><Plus className="h-5 w-5" /> Generate Report</Button></div>
    <TableFilterBar darkMode={darkMode} searchPlaceholder="Search reports..." searchValue={query} onSearchChange={(value) => { setQuery(value); setPage(1); }} segments={[]} activeSegment="" onSegmentChange={() => undefined} selects={[{ label: "Type", value: type, onChange: (value) => { setType(value); setPage(1); }, options: [{ label: "Type: All", value: "all" }, ...Object.entries(typeLabels).map(([value, label]) => ({ label, value }))], className: "w-full sm:w-44" }, { label: "Status", value: status, onChange: (value) => { setStatus(value); setPage(1); }, options: [{ label: "Status: All", value: "all" }, ...["ready", "expired", "failed", "generating"].map((value) => ({ label: `Status: ${value}`, value }))], className: "w-full sm:w-40" }, { label: "Range", value: range, onChange: (value) => { setRange(value); setPage(1); }, options: [{ label: "Range: Last 7 Days", value: "7" }, { label: "Range: Last 30 Days", value: "30" }, { label: "Range: Last 90 Days", value: "90" }], className: "w-full sm:w-48" }]} />
    <Card className={cn("mt-4 overflow-hidden rounded-xl border shadow-[0_18px_40px_-22px_rgba(15,23,42,0.45)]", darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white")}>
      <div className="overflow-x-auto"><table className="min-w-[970px] w-full text-left text-sm"><thead className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", darkMode ? "bg-slate-800 text-slate-300" : "bg-[#eef2f6] text-slate-500")}><tr><th className="px-5 py-4">Report name</th><th className="px-4 py-4">Type</th><th className="px-4 py-4">Scope</th><th className="px-4 py-4">Date range</th><th className="px-4 py-4">Generated by</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Generated on</th></tr></thead><tbody>{reports.map((report) => <tr key={report.report_id} className={cn("border-t", darkMode ? "border-slate-800 hover:bg-slate-800/60" : "border-slate-200 hover:bg-slate-50")}><td className="px-5 py-4 font-semibold"><span className="mr-3 inline-flex h-3 w-3 rounded-full bg-primary" />{report.name}</td><td className="px-4 py-4 text-slate-500 dark:text-slate-400">{typeLabels[report.report_type]}</td><td className="px-4 py-4 text-slate-500 dark:text-slate-400">{scopeLabels[report.scope]}</td><td className="px-4 py-4 text-slate-500 dark:text-slate-400">{String(report.filters?.start_date ?? report.filters?.date_range ?? "—")}</td><td className="px-4 py-4 font-medium">{report.generated_by_username || "You"}</td><td className="px-4 py-4"><ReportStatusPill status={report.status} /></td><td className="px-4 py-4"><div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{formatDate(report.completed_at ?? report.created_at)}</span>{report.status === "ready" ? <ReportRowAction label="Download report" onClick={() => download(report)}><Download className="h-4 w-4" /></ReportRowAction> : report.status === "expired" ? <ReportRowAction label="Report link expired" onClick={() => setToast("Regeneration is not available from the documented API yet.")}><RefreshCw className="h-4 w-4" /></ReportRowAction> : null}</div>{report.status === "failed" && report.safe_failure_message ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{report.safe_failure_message}</p> : null}</td></tr>)}</tbody></table></div>
      {loading ? <div className="px-5 py-12 text-center text-sm text-slate-500">Loading reports…</div> : reports.length === 0 ? <div className="flex flex-col items-center px-6 py-18 text-center"><div className={cn("flex h-20 w-20 items-center justify-center rounded-full", darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}><FileText className="h-10 w-10" /></div><h3 className="mt-5 text-xl font-bold">No reports match your filters</h3><p className="mt-2 max-w-md text-sm text-slate-500">Try adjusting your search or filters to find a report.</p><button type="button" onClick={() => { setQuery(""); setType("all"); setStatus("all"); }} className="mt-5 text-sm font-semibold text-primary">Clear all filters</button></div> : null}
      <PaginationControl darkMode={darkMode} summary={`Showing ${reports.length} of ${count} reports`} items={page > 1 ? [1, page] : [1]} activePage={page} onPageChange={setPage} onPreviousPage={() => setPage((current) => Math.max(1, current - 1))} onNextPage={() => setPage((current) => current + 1)} hasPreviousPage={page > 1} hasNextPage={page * 10 < count} />
    </Card>
    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Download links are valid for 24 hours and can only be accessed by the admin who generated them.</p>
    {showGenerator ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><Card className={cn("w-full max-w-xl rounded-2xl border p-6 shadow-2xl", darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}><div className="flex items-start justify-between"><div><h2 className="text-2xl font-bold tracking-[-0.03em]">Generate report</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create a secure, downloadable report for your organization.</p></div><button type="button" onClick={() => setShowGenerator(false)} aria-label="Close generate report dialog" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><div><p className="text-sm font-semibold">Report type</p><CompactSelect value={reportType} onChange={(value) => setReportType(value as TenantReportType)} options={Object.entries(typeLabels).map(([value, label]) => ({ label, value }))} className="mt-2 w-full" buttonClassName="min-h-12 rounded-xl border px-4 text-sm font-medium shadow-none" darkMode={darkMode} ariaLabel="Report type" /></div><div><p className="text-sm font-semibold">Scope</p><CompactSelect value={scope} onChange={(value) => setScope(value as typeof scope)} options={[{ label: "Organization-Wide", value: "organization" }, { label: "Unit Restricted", value: "unit" }, { label: "Audience Restricted", value: "audience" }]} className="mt-2 w-full" buttonClassName="min-h-12 rounded-xl border px-4 text-sm font-medium shadow-none" darkMode={darkMode} ariaLabel="Report scope" /></div></div>{scope === "unit" ? <div className="mt-5"><p className="text-sm font-semibold">Unit</p><CompactSelect value={unitId} onChange={setUnitId} options={[{ label: "Select a unit", value: "" }, ...units.map((unit) => ({ label: unit.name, value: String(unit.unit_id) }))]} className="mt-2 w-full" buttonClassName="min-h-12 rounded-xl border px-4 text-sm font-medium shadow-none" darkMode={darkMode} ariaLabel="Report unit" /></div> : null}{scope === "audience" ? <div className="mt-5"><p className="text-sm font-semibold">Audience ID</p><Input type="number" min="1" value={audienceId} onChange={(event) => setAudienceId(event.target.value)} className="mt-2" placeholder="Enter an assigned audience ID" /></div> : null}<div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="text-sm font-semibold">Start date <span className="font-normal text-slate-400">(optional)</span></p><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2" /></div><div><p className="text-sm font-semibold">End date <span className="font-normal text-slate-400">(optional)</span></p><Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-2" /></div></div><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">The report is generated asynchronously. Its secure link expires after 24 hours. Your role determines which scopes are available.</div><div className="mt-6 flex justify-end gap-3"><Button variant="outline" className="min-h-11 rounded-xl px-4 py-2 text-sm" onClick={() => setShowGenerator(false)}>Cancel</Button><Button loading={requesting} className="min-h-11 rounded-xl px-4 py-2 text-sm" onClick={() => void generateReport()}><FileText className="h-4 w-4" /> Generate report</Button></div></Card></div> : null}
    {toast ? <div className="fixed bottom-6 right-6 z-60 flex max-w-md items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl dark:border-emerald-900 dark:bg-slate-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /><div><p className="font-semibold">{toast}</p></div><button type="button" onClick={() => setToast(null)} aria-label="Dismiss message" className="text-slate-400"><X className="h-4 w-4" /></button></div> : null}
  </section>;
}
