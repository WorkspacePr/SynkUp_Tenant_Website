"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";
import { CompactSelect } from "../ShowcaseParts";
import {
  OVERVIEW_METRICS,
  PLAN_LABEL,
  PLAN_UNIT_LIMIT,
} from "./data";
import type {
  AssignedUnitAdmin,
  FilterSegment,
  FilterSelectConfig,
  PaginationItem,
  UnitAlert,
  UnitLifecycleStatus,
} from "./types";

export function MetricGrid({ darkMode }: { darkMode: boolean }) {
  return (
    <MetricGridInternal darkMode={darkMode} metrics={OVERVIEW_METRICS} />
  );
}

export function MetricGridInternal({
  darkMode,
  metrics,
}: {
  darkMode: boolean;
  metrics: typeof OVERVIEW_METRICS;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <DetailMetricCard
          key={metric.title}
          darkMode={darkMode}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          accent={metric.accent}
          titleClassName={metric.titleClassName}
          valueClassName={metric.valueClassName}
        />
      ))}
    </div>
  );
}

export function TableFilterBar({
  darkMode,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  selects,
  segments,
  activeSegment,
  onSegmentChange,
}: {
  darkMode: boolean;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selects: FilterSelectConfig[];
  segments: FilterSegment[];
  activeSegment: string;
  onSegmentChange: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3",
        darkMode ? "border-slate-800" : "border-slate-100",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {selects.map((select) => (
          <CompactSelect
            key={select.label}
            value={select.value}
            options={select.options}
            onChange={select.onChange}
            className={cn("w-auto", select.className)}
            buttonClassName={cn(
              "min-h-10 rounded-xl border px-3.5 text-sm font-semibold shadow-none",
              darkMode
                ? "border-slate-700 bg-slate-950 text-slate-200"
                : "border-slate-200 bg-white text-slate-700",
            )}
            darkMode={darkMode}
          />
        ))}

        <div
          className={cn(
            "flex flex-wrap items-center gap-1 rounded-xl border p-1",
            darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-slate-50",
          )}
        >
          {segments.map((segment) => {
            const isActive = segment.value === activeSegment;

            return (
              <button
                key={segment.value}
                type="button"
                onClick={() => onSegmentChange(segment.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition",
                  isActive
                    ? darkMode
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-900 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)]"
                    : darkMode
                      ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      : "text-slate-500 hover:bg-white hover:text-slate-700",
                )}
              >
                <span>{segment.label}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px]",
                    isActive
                      ? "bg-[#16a394] text-white"
                      : darkMode
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-200 text-slate-500",
                  )}
                >
                  {segment.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <label
        className={cn(
          "flex min-h-10 w-full items-center gap-2 rounded-xl border px-3 text-sm md:max-w-72",
          darkMode
            ? "border-slate-700 bg-slate-950 text-slate-300"
            : "border-slate-200 bg-white text-slate-500",
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            "w-full bg-transparent outline-none placeholder:text-inherit",
            darkMode ? "text-white" : "text-slate-700",
          )}
        />
      </label>
    </div>
  );
}

export function RowActionsMenu({
  darkMode,
  label,
  actions,
}: {
  darkMode: boolean;
  label: string;
  actions: string[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
          darkMode
            ? "border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            darkMode ? "text-slate-500" : "text-slate-400",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 z-20 mt-2 min-w-56 rounded-2xl border p-2 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]",
            darkMode
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-white",
          )}
        >
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setOpen(false)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                darkMode
                  ? "text-slate-200 hover:bg-slate-800"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              <span>{action}</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PaginationControl({
  darkMode,
  summary,
  items,
  activePage,
  onPageChange,
  onPreviousPage,
  onNextPage,
  hasPreviousPage = false,
  hasNextPage = false,
}: {
  darkMode: boolean;
  summary: string;
  items: PaginationItem[];
  activePage: number;
  onPageChange?: (page: number) => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs",
        darkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500",
      )}
    >
      <span>{summary}</span>
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-[14px] border px-2 py-1.5",
          darkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white",
        )}
      >
        <button
          type="button"
          aria-label="Previous page"
          disabled={!hasPreviousPage}
          onClick={onPreviousPage}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-[10px] border transition disabled:pointer-events-none disabled:opacity-40",
            darkMode
              ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        {items.map((item, index) =>
          item === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sm font-semibold">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center rounded-[10px] px-2 text-sm font-semibold transition",
                item === activePage
                  ? "bg-primary text-primary-foreground"
                  : darkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={!hasNextPage}
          onClick={onNextPage}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-[10px] border transition disabled:pointer-events-none disabled:opacity-40",
            darkMode
              ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function DetailMetricCard({
  darkMode,
  title,
  value,
  icon,
  accent,
  titleClassName,
  valueClassName,
  interactive,
  helperText,
}: {
  darkMode: boolean;
  title: string;
  value: string;
  icon: ReactNode;
  accent?: "green";
  titleClassName?: string;
  valueClassName?: string;
  interactive?: boolean;
  helperText?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[18px] border p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)]",
        interactive &&
          "transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_-28px_rgba(15,23,42,0.4)]",
        accent === "green"
          ? "border-[#22a85a] text-white"
          : darkMode
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-100 bg-white text-[#232323]",
      )}
      style={accent === "green" ? { backgroundColor: "#28b463" } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={cn(
              "whitespace-pre-line text-[16px] leading-[1.15]",
              accent === "green" ? "text-white" : titleClassName,
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              "mt-4 text-[18px] font-bold leading-none",
              accent === "green" ? "text-white" : valueClassName,
            )}
          >
            {value}
          </div>
          {helperText ? (
            <div
              className={cn(
                "mt-3 text-xs font-semibold",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {helperText}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            accent === "green" ? "text-white" : darkMode ? "text-white" : "text-black",
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function StatBlock({
  darkMode,
  label,
  value,
  valueClassName,
}: {
  darkMode: boolean;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "border-r px-6 py-4 last:border-r-0",
        darkMode ? "border-slate-800" : "border-slate-200",
      )}
    >
      <div
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.08em]",
          darkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {label}
      </div>
      <div className={cn("mt-2 text-[2rem] font-semibold leading-none", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

export function UnitStatusPill({ status }: { status: UnitLifecycleStatus }) {
  const classes = {
    ACTIVE: "bg-[#dff6e8] text-[#16a34a]",
    ARCHIVED: "bg-[#e5e7eb] text-[#6b7280]",
    RESTRICTED: "bg-[#fff1cc] text-[#b45309]",
    "PENDING ARCHIVE": "bg-[#ffe4e6] text-[#be123c]",
  }[status];

  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", classes)}>
      {status}
    </span>
  );
}

export function StatusStateChip({
  status,
  active,
  darkMode,
}: {
  status: UnitLifecycleStatus;
  active: boolean;
  darkMode: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold",
        active
          ? "border-[#16a394] bg-[#edf9f8] text-[#0f766e]"
          : darkMode
            ? "border-slate-700 bg-slate-900 text-slate-300"
            : "border-slate-200 bg-white text-slate-500",
      )}
    >
      {status}
    </span>
  );
}

export function RolePill({ role }: { role: AssignedUnitAdmin["role"] }) {
  const classes =
    role === "Lead Unit Admin"
      ? "bg-[#dcfce7] text-[#166534]"
      : role === "Unit Admin"
        ? "bg-[#dbeafe] text-[#1d4ed8]"
        : "bg-[#f3f4f6] text-[#6b7280]";

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-bold", classes)}>
      {role}
    </span>
  );
}

export function AdminStatusPill({ status }: { status: AssignedUnitAdmin["status"] }) {
  const classes =
    status === "Active"
      ? "bg-[#ebfbf6] text-[#16b364]"
      : status === "Pending"
        ? "bg-[#fff1cc] text-[#b45309]"
        : "bg-[#f3f4f6] text-[#6b7280]";

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-bold", classes)}>
      {status}
    </span>
  );
}

export function AudienceStatusPill({ status }: { status: string }) {
  const classes =
    status === "FLAGGED"
      ? "bg-[#fff1cc] text-[#b45309]"
      : status === "REVIEW"
        ? "bg-[#dbeafe] text-[#2563eb]"
        : "bg-[#ebfbf6] text-[#16b364]";

  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] font-bold", classes)}>
      {status}
    </span>
  );
}

export function AlertStatePill({ state }: { state: UnitAlert["state"] }) {
  const classes = {
    healthy: "bg-[#ebfbf6] text-[#16b364]",
    warning: "bg-[#fff1cc] text-[#b45309]",
    critical: "bg-[#fee2e2] text-[#dc2626]",
  }[state];

  return (
    <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase", classes)}>
      {state}
    </span>
  );
}

export function SummaryBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "critical" | "warning" | "healthy";
}) {
  const classes = {
    critical: "border-[#fee2e2] bg-[#fff5f5] text-[#dc2626]",
    warning: "border-[#ffe9b5] bg-[#fff8e1] text-[#b45309]",
    healthy: "border-[#dff6e8] bg-[#f2fcf6] text-[#16a34a]",
  }[tone];

  return (
    <div className={cn("rounded-2xl border px-4 py-4", classes)}>
      <div className="text-xs font-semibold uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export function ArchiveInfo({
  label,
  value,
  darkMode,
}: {
  label: string;
  value: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4",
        darkMode
          ? "border-slate-700 bg-slate-900"
          : "border-slate-200 bg-slate-50",
      )}
    >
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.08em]",
          darkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {label}
      </div>
      <div className={cn("mt-2 text-lg font-semibold", darkMode ? "text-white" : "text-slate-900")}>
        {value}
      </div>
    </div>
  );
}

export function SupportCard({
  icon,
  title,
  body,
  darkMode,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-4",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-slate-50 text-slate-900",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-[#16a394]">{icon}</span>
        <span>{title}</span>
      </div>
      <div
        className={cn(
          "mt-2 text-sm",
          darkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {body}
      </div>
    </Card>
  );
}

export function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

export function InlineNotice({
  tone,
  title,
  body,
}: {
  tone: "warning" | "danger";
  title: string;
  body: string;
}) {
  const classes =
    tone === "danger"
      ? "border-[#ffd4d4] bg-[#fff5f5] text-[#b91c1c]"
      : "border-[#ffe4b5] bg-[#fff8e1] text-[#b45309]";

  return (
    <div className={cn("mt-5 rounded-2xl border px-4 py-4 text-sm", classes)}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1">{body}</div>
    </div>
  );
}

export function PlanUsageActions({
  darkMode,
  unitUsageText,
  planLimitReached,
  onCreateUnit,
  compact = false,
}: {
  darkMode: boolean;
  unitUsageText: string;
  planLimitReached: boolean;
  onCreateUnit: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", compact && "justify-end")}>
      <div
        className={cn(
          "rounded-2xl border px-4 py-3",
          darkMode
            ? "border-slate-700 bg-slate-900 text-slate-200"
            : "border-slate-200 bg-white text-slate-700",
        )}
        title={
          planLimitReached
            ? `Your current plan supports ${PLAN_UNIT_LIMIT} units.`
            : `${PLAN_LABEL} plan unit allowance`
        }
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Units Used
        </div>
        <div className="mt-1 text-sm font-semibold">{unitUsageText}</div>
      </div>

      <Button
        className="min-h-11 rounded-xl px-5 py-3 text-sm"
        onClick={onCreateUnit}
        disabled={planLimitReached}
        title={
          planLimitReached
            ? `Your current plan supports ${PLAN_UNIT_LIMIT} units.`
            : "Create a new unit"
        }
      >
        <PlusCircle className="h-4 w-4" />
        Create New Unit
      </Button>

      {planLimitReached ? (
        <Button variant="outline" className="min-h-11 rounded-xl px-5 py-3 text-sm">
          Upgrade Plan
        </Button>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-semibold">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function FieldError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return <div className={cn("text-sm font-medium text-[#dc2626]", className)}>{message}</div>;
}

export function FieldWarning({ message }: { message: string }) {
  return <div className="mt-3 text-sm font-medium text-[#b45309]">{message}</div>;
}

export function inputClassName(darkMode: boolean) {
  return cn(
    "min-h-12 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
    darkMode
      ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
  );
}

export function AvatarSeed({ seed }: { seed: string }) {
  const colors = [
    "from-[#4827ff] to-[#0ea5e9]",
    "from-[#ff6b6b] to-[#f59e0b]",
    "from-[#0f766e] to-[#22c55e]",
    "from-[#9333ea] to-[#ec4899]",
  ];
  const color = colors[seed.length % colors.length];

  return (
    <span
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br text-[10px] font-bold text-white",
        color,
      )}
    >
      {seed
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}

export function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
