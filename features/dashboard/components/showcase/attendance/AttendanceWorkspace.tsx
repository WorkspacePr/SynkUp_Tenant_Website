"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  Grid2X2,
  List,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import { TableFilterBar } from "../units/shared";
import { UnitsPageHeader } from "../units/sections/UnitsPageHeader";

type SessionStatus = "active" | "completed" | "locked" | "archived";

type AttendanceSession = {
  id: number;
  name: string;
  unit: string;
  audience: string;
  date: string;
  time: string;
  present: number;
  eligible: number;
  status: SessionStatus;
  flags: number;
};

const sessions: AttendanceSession[] = [
  { id: 1, name: "CSC 401 - Week 6 Lecture", unit: "Legacy Campus", audience: "CSC 401", date: "Feb 3, 2026", time: "9:00 AM", present: 42, eligible: 50, status: "active", flags: 3 },
  { id: 2, name: "Chapel Service - Wednesday", unit: "Heritage Campus", audience: "Spiritual Life Department", date: "Feb 2, 2026", time: "7:00 AM", present: 210, eligible: 240, status: "completed", flags: 0 },
  { id: 3, name: "HR Onboarding", unit: "Heritage Campus", audience: "HR Department", date: "Jan 30, 2026", time: "10:00 AM", present: 18, eligible: 20, status: "locked", flags: 2 },
  { id: 4, name: "EEE 305 - Lab Session", unit: "Legacy Campus", audience: "EEE 305", date: "Jan 29, 2026", time: "2:00 PM", present: 35, eligible: 38, status: "completed", flags: 6 },
  { id: 5, name: "CSC 401 - Week 5 Lecture", unit: "Legacy Campus", audience: "CSC 401", date: "Jan 27, 2026", time: "9:00 AM", present: 44, eligible: 50, status: "archived", flags: 3 },
  { id: 6, name: "Sunday Service", unit: "Heritage Campus", audience: "Spiritual Life Department", date: "Jan 25, 2026", time: "8:00 AM", present: 198, eligible: 240, status: "completed", flags: 0 },
];

const attendees = [
  { name: "Adaeze Nwosu", id: "SCN/CSC/240918", time: "9:02 AM", status: "Present", method: "QR", note: "" },
  { name: "Chidi Okafor", id: "SCN/CSC/240661", time: "9:14 AM", status: "Late", method: "QR", note: "" },
  { name: "Ngozi Eze", id: "SCN/CSC/250419", time: "9:03 AM", status: "Flagged", method: "QR", note: "Duplicate scan" },
  { name: "Yemisi Bakare", id: "SCN/CSC/230109", time: "—", status: "Absent", method: "—", note: "" },
  { name: "Owie Paula", id: "SCN/CSC/240018", time: "9:01 AM", status: "Present", method: "QR", note: "" },
];

function StatusPill({ status }: { status: SessionStatus }) {
  const styles = {
    active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    completed: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
    locked: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200",
    archived: "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]", styles[status])}>
      {status === "locked" ? <LockKeyhole className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {status}
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

export function AttendanceWorkspace({ darkMode }: { darkMode: boolean }) {
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("all");
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState("all");
  const [flags, setFlags] = useState("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<AttendanceSession | null>(null);

  const filtered = useMemo(() => sessions.filter((session) => {
    const matchesQuery = session.name.toLowerCase().includes(query.toLowerCase());
    const matchesUnit = unit === "all" || session.unit === unit;
    const matchesAudience = audience === "all" || session.audience === audience;
    const matchesStatus = status === "all" || session.status === status;
    const matchesFlags = flags === "all" || (flags === "flagged" ? session.flags > 0 : session.flags === 0);
    return matchesQuery && matchesUnit && matchesAudience && matchesStatus && matchesFlags;
  }), [audience, flags, query, status, unit]);

  function exportCsv(session: AttendanceSession) {
    const rows = [
      ["Name", "ID", "Time", "Status", "Method", "Notes"],
      ...attendees.map((attendee) => [attendee.name, attendee.id, attendee.time, attendee.status, attendee.method, attendee.note]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${session.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="pb-8">
      <UnitsPageHeader darkMode={darkMode} title="Attendance" description="Organization-wide session and attendance oversight" />

      <div className={cn("mt-2 flex items-start gap-4 rounded-2xl border-l-4 border-green-600 px-5 py-4 text-sm", darkMode ? "bg-slate-800 text-slate-200" : "bg-[#eeeeee] text-slate-800")}>
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
        <p>Sessions are created by <strong>Audience Admins</strong>. You can view all records and export attendance results.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Total sessions" value="174" />
        <MetricCard label="Active sessions" value="5" tone="success" />
        <MetricCard label="Flagged records" value="12" tone="warning" />
        <MetricCard label="Validation mode" value="Strict" tone="success" helper="Online · QR validation enforced" />
        <MetricCard label="Avg. attendance rate" value="91%" tone="primary" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setView("table")} className={cn("flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold", view === "table" ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400")}>
            <List className="h-5 w-5" /> Table
          </button>
          <button type="button" onClick={() => setView("grid")} className={cn("flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold", view === "grid" ? "border-primary text-primary" : "border-transparent text-slate-500 dark:text-slate-400")}>
            <Grid2X2 className="h-5 w-5" /> Grid
          </button>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <ShieldCheck className="h-4 w-4 text-primary" /> Tenant scoped
        </div>
      </div>

      <div className="mt-1">
        <TableFilterBar
          darkMode={darkMode}
          searchPlaceholder="Search by session name..."
          searchValue={query}
          onSearchChange={setQuery}
          selects={[
            {
              label: "Unit",
              value: unit,
              onChange: setUnit,
              options: [
                { label: "All Units", value: "all" },
                { label: "Legacy Campus", value: "Legacy Campus" },
                { label: "Heritage Campus", value: "Heritage Campus" },
              ],
              className: "w-full sm:w-auto sm:min-w-40",
            },
            {
              label: "Audience",
              value: audience,
              onChange: setAudience,
              options: [
                { label: "All Audiences", value: "all" },
                { label: "CSC 401", value: "CSC 401" },
                { label: "Spiritual Life Department", value: "Spiritual Life Department" },
                { label: "HR Department", value: "HR Department" },
                { label: "EEE 305", value: "EEE 305" },
              ],
              className: "w-full sm:w-auto sm:min-w-44",
            },
            {
              label: "Status",
              value: status,
              onChange: setStatus,
              options: [
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "active" },
                { label: "Completed", value: "completed" },
                { label: "Locked", value: "locked" },
                { label: "Archived", value: "archived" },
              ],
              className: "w-full sm:w-auto sm:min-w-36",
            },
            {
              label: "Flags",
              value: flags,
              onChange: setFlags,
              options: [
                { label: "All Flags", value: "all" },
                { label: "Flagged Only", value: "flagged" },
                { label: "No Flags", value: "clear" },
              ],
              className: "w-full sm:w-auto sm:min-w-36",
            },
          ]}
          segments={[]}
          activeSegment=""
          onSegmentChange={() => undefined}
        />
      </div>

      {view === "table" ? (
        <Card className={cn("mt-7 overflow-hidden rounded-xl border shadow-[0_18px_40px_-22px_rgba(15,23,42,0.45)]", darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white")}>
          <div className="overflow-x-auto">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead className={cn("text-xs uppercase tracking-[0.04em]", darkMode ? "bg-slate-800 text-slate-300" : "bg-[#e7eaee] text-slate-600")}>
                <tr><th className="px-5 py-4">Session name</th><th className="px-4 py-4">Unit</th><th className="px-4 py-4">Audience</th><th className="px-4 py-4">Date/time</th><th className="px-4 py-4">Attendance</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Flags</th><th className="px-4 py-4 text-right">View</th></tr>
              </thead>
              <tbody>
                {filtered.map((session) => (
                  <tr key={session.id} className={cn("border-t transition", darkMode ? "border-slate-800 hover:bg-slate-800/60" : "border-slate-200 hover:bg-slate-50")}>
                    <td className="px-5 py-4 font-semibold">{session.name}</td>
                    <td className="px-4 py-4 text-xs font-bold uppercase">{session.unit}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{session.audience}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{session.date}<br />{session.time}</td>
                    <td className="min-w-36 px-4 py-4">
                      <div className="text-slate-500 dark:text-slate-400">{session.present}/{session.eligible}</div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(session.present / session.eligible * 100)}%` }} /></div>
                    </td>
                    <td className="px-4 py-4"><StatusPill status={session.status} /></td>
                    <td className="px-4 py-4">{session.flags ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{session.flags} Flagged</span> : <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-4 text-right"><button type="button" onClick={() => setSelected(session)} aria-label={`View ${session.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800">
            <span className="font-semibold">Showing {filtered.length} of 174 sessions</span>
            <div className="flex gap-2"><button className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800"><ChevronLeft className="mx-auto h-4 w-4" /></button><button className="h-8 w-8 rounded bg-primary text-white">1</button><button className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800">2</button><button className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800"><ChevronRight className="mx-auto h-4 w-4" /></button></div>
          </div>
        </Card>
      ) : (
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((session) => (
            <Card key={session.id} role="button" tabIndex={0} onClick={() => setSelected(session)} onKeyDown={(event) => { if (event.key === "Enter") setSelected(session); }} className={cn("cursor-pointer rounded-2xl border p-5 transition hover:-translate-y-0.5", darkMode ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white")}>
              <div className="flex items-start justify-between gap-3"><h3 className="font-bold">{session.name}</h3><StatusPill status={session.status} /></div>
              <div className="mt-2 text-sm text-slate-500">{session.audience} · {session.unit}</div>
              <div className="mt-5 flex items-end justify-between"><div><div className="text-xs uppercase text-slate-400">Attendance</div><div className="mt-1 text-2xl font-black">{session.present}/{session.eligible}</div></div><div className="text-right text-sm text-slate-500">{session.date}<br />{session.time}</div></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full bg-primary" style={{ width: `${Math.round(session.present / session.eligible * 100)}%` }} /></div>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 ? <div className="py-20 text-center text-slate-500">No sessions match the selected filters.</div> : null}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setSelected(null)}
        >
          <div
            className={cn("max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border shadow-2xl", darkMode ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-inherit p-6 dark:border-slate-700">
              <div><div className="flex items-center gap-3"><h2 className="text-2xl font-bold">{selected.name}</h2><StatusPill status={selected.status} /></div><p className="mt-1 text-sm text-slate-500">{selected.audience} · {selected.unit} · {selected.date}, {selected.time}</p></div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Present" value={String(selected.present)} tone="success" />
                <MetricCard label="Eligible users" value={String(selected.eligible)} />
                <MetricCard label="Attendance rate" value={`${Math.round(selected.present / selected.eligible * 100)}%`} tone="primary" />
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold">Attendance records</h3><p className="text-sm text-slate-500">Timestamps and validation results for this session.</p></div><button type="button" onClick={() => exportCsv(selected)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"><FileDown className="h-4 w-4" /> Export CSV</button></div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-[760px] w-full text-left text-sm"><thead className={darkMode ? "bg-slate-800" : "bg-slate-100"}><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">ID</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Notes</th></tr></thead><tbody>{attendees.map((attendee) => <tr key={attendee.id} className="border-t border-slate-200 dark:border-slate-700"><td className="px-4 py-4 font-semibold">{attendee.name}</td><td className="px-4 py-4 text-slate-500">{attendee.id}</td><td className="px-4 py-4">{attendee.time}</td><td className="px-4 py-4"><span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", attendee.status === "Present" ? "bg-emerald-50 text-emerald-700" : attendee.status === "Flagged" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600")}>{attendee.status}</span></td><td className="px-4 py-4">{attendee.method}</td><td className="px-4 py-4 text-slate-500">{attendee.note || "—"}</td></tr>)}</tbody></table>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Results are scoped to this organisation and session.</div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
