import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Command,
  Clock3,
  CornerDownLeft,
  CreditCard,
  Moon,
  Search as SearchIcon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import type {
  ActionQueueItem,
  ActionQueuePanel,
  ActionQueueStat,
  CommandBarConfig,
  GuidedEmptyStatesPanel,
  QuickActionsPanel,
  DisputeSlaItem,
  DisputeSlaPanel,
  DisputeSlaStat,
  ListItem,
  MetricCardData,
  NavItem,
  ProvisioningPanel,
  ProvisioningStat,
  RoleConfig,
  RoleKey,
  SavedViewsPanel,
  SelectOption,
  SessionIntegrityPanel,
  SessionIntegrityItem,
  SessionIntegrityStat,
  ShowcaseCard,
  SystemHealthItem,
  SystemHealthPanel,
  SystemHealthStat,
  ToastData,
  Tone,
} from "../types";

export function SidebarItem({
  item,
  darkMode,
  collapsed,
  expanded,
  onToggle,
}: {
  item: NavItem;
  darkMode: boolean;
  collapsed: boolean;
  expanded: boolean;
  onToggle?: () => void;
}) {
  const baseClassName = cn(
    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition",
    collapsed && "justify-center px-2",
    item.active
      ? darkMode
        ? "bg-emerald-500/12 text-[#67d6cf]"
        : "bg-[#edf9f8] text-[#16a394]"
      : darkMode
        ? "text-slate-300 hover:bg-slate-900"
        : "text-slate-600 hover:bg-slate-50",
  );

  const content = (
    <>
      <span className={cn("shrink-0", item.active ? "text-[#16a394]" : "")}>
        {item.icon}
      </span>
      {!collapsed ? <span className="flex-1">{item.label}</span> : null}
      {!collapsed && item.children?.length ? (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            expanded ? "rotate-180" : "rotate-0",
            item.active ? "text-[#16a394]" : "text-slate-400",
          )}
        />
      ) : null}
    </>
  );

  return (
    <div className="rounded-2xl">
      {item.href && !item.children?.length ? (
        <Link href={item.href} className={baseClassName}>
          {content}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={baseClassName}
        >
          {content}
        </button>
      )}

      {!collapsed && item.children?.length && expanded ? (
        <div className="mt-2 ml-11 space-y-1 pl-4 dark:border-slate-800">
          {item.children.map((child, index) => (
            <div
              key={child}
              className={cn(
                "rounded-xl px-3 py-2 text-[13px] transition",
                index === 0 && item.active
                  ? darkMode
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-900"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              {child}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CompactSelect({
  value,
  options,
  onChange,
  className,
  buttonClassName,
  darkMode = false,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  darkMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

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
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-full border px-3 text-sm font-semibold shadow-sm transition",
          darkMode
            ? "border-slate-700 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-700",
          buttonClassName,
        )}
      >
        <span className="truncate">{selected?.label ?? value}</span>
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
            "absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-2xl border p-2 shadow-[0_24px_48px_-28px_rgba(15,23,42,0.42)]",
            darkMode
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-white",
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                  isSelected
                    ? darkMode
                      ? "bg-[#113c39] text-[#67d6cf]"
                      : "bg-[#edf9f8] text-[#16a394]"
                    : darkMode
                      ? "text-slate-200 hover:bg-slate-800"
                      : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16a394]" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function ThemeSwitch({
  themePreference,
  onChange,
  darkShell,
  collapsed = false,
}: {
  themePreference: "light" | "dark";
  onChange: (value: "light" | "dark") => void;
  darkShell: boolean;
  collapsed?: boolean;
}) {
  const options = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
  ];

  return (
    <div
      className={cn(
        "gap-1.5 p-1.5",
        collapsed
          ? "inline-flex flex-col rounded-[28px]"
          : "inline-flex w-full rounded-full",
        darkShell ? "bg-slate-900" : "bg-slate-100",
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = themePreference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center rounded-[18px] transition",
              collapsed ? "h-11 w-11 justify-center" : "min-h-11 min-w-0 flex-1 justify-center gap-2 px-3.5 py-3",
              isActive
                ? "bg-white text-slate-700 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.45)]"
                : darkShell
                  ? "text-slate-400"
                  : "text-slate-500",
            )}
            aria-pressed={isActive}
            title={option.label}
          >
            <Icon className="h-5 w-5" />
            {!collapsed ? <span className="text-sm font-medium leading-tight">{option.label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function CommandSearchBar({
  commandBar,
  darkMode,
}: {
  commandBar: CommandBarConfig;
  darkMode: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      const timeoutId = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(timeoutId);
    }

    setQuery("");
  }, [open]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = commandBar.groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = `${group.title} ${item.title} ${item.subtitle} ${item.meta} ${item.keyword}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-left transition md:max-w-105",
          darkMode
            ? "bg-slate-900 text-slate-400 hover:bg-slate-800"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200/70",
        )}
      >
        <SearchIcon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm">
          {commandBar.placeholder}
        </span>
        <span
          className={cn(
            "hidden items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold md:inline-flex",
            darkMode
              ? "border-slate-700 text-slate-400"
              : "border-slate-200 text-slate-500",
          )}
        >
          <Command className="h-3 w-3" />
          K
        </span>
      </button>

      {open ? (
        <div
          className={cn(
            "fixed inset-0 z-40 flex items-start justify-center bg-slate-950/45 px-4 py-12 backdrop-blur-sm",
          )}
          onClick={() => setOpen(false)}
        >
          <div
            className={cn(
              "w-full max-w-4xl overflow-hidden rounded-[28px] border shadow-[0_32px_80px_-28px_rgba(15,23,42,0.45)]",
              darkMode
                ? "border-slate-800 bg-[#0b1420] text-white"
                : "border-slate-200 bg-white text-slate-900",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={cn(
                "flex items-center gap-3 border-b px-5 py-4",
                darkMode ? "border-slate-800" : "border-slate-100",
              )}
            >
              <SearchIcon
                className={cn(
                  "h-5 w-5 shrink-0",
                  darkMode ? "text-slate-400" : "text-slate-500",
                )}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={commandBar.placeholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg border px-2 py-1 text-[11px] font-semibold",
                  darkMode
                    ? "border-slate-700 text-slate-400"
                    : "border-slate-200 text-slate-500",
                )}
              >
                Esc
              </button>
            </div>

            {!normalizedQuery ? (
              <div
                className={cn(
                  "border-b px-5 py-3 text-sm",
                  darkMode
                    ? "border-slate-800 bg-slate-950/40 text-slate-300"
                    : "border-slate-100 bg-slate-50/80 text-slate-600",
                )}
              >
                Recent:
                <span className="ml-2 inline-flex flex-wrap gap-2">
                  {commandBar.recentSearches.map((search) => (
                    <button
                      key={search}
                      type="button"
                      onClick={() => setQuery(search)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        darkMode
                          ? "bg-slate-800 text-slate-200"
                          : "bg-white text-slate-600",
                      )}
                    >
                      {search}
                    </button>
                  ))}
                </span>
              </div>
            ) : null}

            <div className="scrollbar-subtle max-h-[70vh] overflow-y-auto p-4">
              {filteredGroups.length > 0 ? (
                <div className="space-y-4">
                  {filteredGroups.map((group) => (
                    <div key={group.title}>
                      <div
                        className={cn(
                          "px-2 text-[11px] font-semibold uppercase tracking-[0.14em]",
                          darkMode ? "text-slate-400" : "text-slate-500",
                        )}
                      >
                        {group.title}
                      </div>
                      <div className="mt-2 space-y-2">
                        {group.items.map((item) => (
                          <button
                            key={`${group.title}-${item.title}-${item.meta}`}
                            type="button"
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
                              darkMode
                                ? "border-slate-800 bg-slate-900/70 hover:bg-slate-800"
                                : "border-slate-100 bg-slate-50/80 hover:bg-slate-100",
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{item.title}</span>
                                {item.status ? (
                                  <StatusPill
                                    status={item.status}
                                    tone={item.statusTone}
                                  />
                                ) : null}
                              </div>
                              <div
                                className={cn(
                                  "mt-1 text-sm",
                                  darkMode ? "text-slate-300" : "text-slate-600",
                                )}
                              >
                                {item.subtitle}
                              </div>
                              <div
                                className={cn(
                                  "mt-2 text-xs",
                                  darkMode ? "text-slate-400" : "text-slate-500",
                                )}
                              >
                                {item.meta}
                              </div>
                            </div>
                            <ArrowRight
                              className={cn(
                                "mt-1 h-4 w-4 shrink-0",
                                darkMode ? "text-slate-500" : "text-slate-400",
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-3xl border px-6 py-14 text-center",
                    darkMode
                      ? "border-slate-800 bg-slate-950/40 text-slate-300"
                      : "border-slate-100 bg-slate-50/80 text-slate-600",
                  )}
                >
                  <SearchIcon className="h-8 w-8" />
                  <div className="mt-4 text-base font-semibold">
                    {commandBar.emptyState}
                  </div>
                  <div className="mt-2 text-sm">
                    Try a user, session, audience, unit, ticket, dispute, or export.
                  </div>
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex items-center justify-between gap-3 border-t px-5 py-3 text-xs",
                darkMode ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500",
              )}
            >
              <span>Search across users, sessions, audiences, units, tickets, disputes, and exports</span>
              <span className="inline-flex items-center gap-1">
                <CornerDownLeft className="h-3.5 w-3.5" />
                Open
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function QuickActionsCard({
  panel,
  darkMode,
}: {
  panel: QuickActionsPanel;
  darkMode: boolean;
}) {
  const toneClass = {
    success: darkMode
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50/90",
    warning: darkMode
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-amber-200 bg-amber-50/90",
    danger: darkMode
      ? "border-rose-500/30 bg-rose-500/10"
      : "border-rose-200 bg-rose-50/90",
    info: darkMode
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-cyan-200 bg-cyan-50/90",
    neutral: darkMode
      ? "border-slate-800 bg-slate-900/80"
      : "border-slate-100 bg-white",
  };

  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{panel.title}</div>
          <div
            className={cn(
              "mt-1 text-sm",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            {panel.subtitle}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {panel.actions.map((action) => (
          <button
            key={action.title}
            type="button"
            className={cn(
              "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
              toneClass[action.tone ?? "neutral"],
            )}
          >
            <div className="font-semibold">{action.title}</div>
            <div
              className={cn(
                "mt-2 text-sm leading-6",
                darkMode ? "text-slate-300" : "text-slate-600",
              )}
            >
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

export function SavedViewsCard({
  panel,
  darkMode,
}: {
  panel: SavedViewsPanel;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div>
        <div className="text-lg font-semibold">{panel.title}</div>
        <div
          className={cn(
            "mt-1 text-sm",
            darkMode ? "text-slate-300" : "text-slate-500",
          )}
        >
          {panel.subtitle}
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {panel.views.map((view) => (
          <div
            key={view.title}
            className={cn(
              "rounded-2xl border p-4",
              darkMode ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/70",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{view.title}</div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-300" : "text-slate-600",
                  )}
                >
                  {view.subtitle}
                </div>
              </div>
              {view.status ? (
                <StatusPill status={view.status} tone={view.statusTone} />
              ) : null}
            </div>
            <div
              className={cn(
                "mt-3 text-sm leading-6",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {view.detail}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function GuidedEmptyStatesCard({
  panel,
  darkMode,
}: {
  panel: GuidedEmptyStatesPanel;
  darkMode: boolean;
}) {
  const toneClass = {
    success: darkMode
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50/90",
    warning: darkMode
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-amber-200 bg-amber-50/90",
    danger: darkMode
      ? "border-rose-500/30 bg-rose-500/10"
      : "border-rose-200 bg-rose-50/90",
    info: darkMode
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-cyan-200 bg-cyan-50/90",
    neutral: darkMode
      ? "border-slate-800 bg-slate-900/80"
      : "border-slate-100 bg-white",
  };

  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div>
        <div className="text-lg font-semibold">{panel.title}</div>
        <div
          className={cn(
            "mt-1 text-sm",
            darkMode ? "text-slate-300" : "text-slate-500",
          )}
        >
          {panel.subtitle}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {panel.items.map((item) => (
          <div
            key={item.title}
            className={cn("rounded-2xl border p-4", toneClass[item.tone ?? "neutral"])}
          >
            <div className="font-semibold">{item.title}</div>
            <div
              className={cn(
                "mt-2 text-sm leading-6",
                darkMode ? "text-slate-300" : "text-slate-600",
              )}
            >
              {item.description}
            </div>
            <button
              type="button"
              className={cn(
                "mt-4 inline-flex rounded-xl px-3 py-2 text-sm font-semibold",
                darkMode ? "bg-slate-950/70 text-white" : "bg-white text-slate-800",
              )}
            >
              {item.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SessionIntegrityStatCard({
  stat,
  darkMode,
}: {
  stat: SessionIntegrityStat;
  darkMode: boolean;
}) {
  const toneClass = {
    success: darkMode
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50/90",
    warning: darkMode
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-amber-200 bg-amber-50/90",
    danger: darkMode
      ? "border-rose-500/30 bg-rose-500/10"
      : "border-rose-200 bg-rose-50/90",
    info: darkMode
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-cyan-200 bg-cyan-50/90",
    neutral: darkMode
      ? "border-slate-700 bg-slate-800/80"
      : "border-slate-200 bg-slate-50/90",
  }[stat.tone ?? "neutral"];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.12em]",
          darkMode ? "text-slate-300" : "text-slate-500",
        )}
      >
        {stat.label}
      </div>
      <div className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em] sm:text-3xl">
        {stat.value}
      </div>
      <div
        className={cn(
          "mt-2 text-sm leading-5",
          darkMode ? "text-slate-400" : "text-slate-600",
        )}
      >
        {stat.helper}
      </div>
    </div>
  );
}

function SessionIntegrityGroup({
  title,
  subtitle,
  items,
  darkMode,
}: {
  title: string;
  subtitle: string;
  items: SessionIntegrityItem[];
  darkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        darkMode ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/70",
      )}
    >
      <div className="text-base font-semibold">{title}</div>
      <div
        className={cn(
          "mt-1 text-sm",
          darkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {subtitle}
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={`${title}-${item.title}-${item.status}`}
            className={cn(
              "rounded-2xl border p-4",
              darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{item.title}</div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-300" : "text-slate-600",
                  )}
                >
                  {item.subtitle}
                </div>
              </div>
              <StatusPill status={item.status} tone={item.statusTone} />
            </div>
            <div
              className={cn(
                "mt-3 text-sm leading-6",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SessionIntegrityCard({
  panel,
  darkMode,
}: {
  panel: SessionIntegrityPanel;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-lg font-semibold">{panel.title}</div>
          <div
            className={cn(
              "mt-1 max-w-2xl text-sm leading-6",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            {panel.subtitle}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 xl:ml-auto xl:justify-end">
          <Button className="min-h-10 rounded-xl px-4 py-2 text-sm">
            {panel.primaryAction}
          </Button>
          <button
            type="button"
            className={cn(
              "min-h-10 rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            {panel.secondaryAction}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
        {panel.stats.map((stat) => (
          <SessionIntegrityStatCard
            key={`${panel.title}-${stat.label}`}
            stat={stat}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SessionIntegrityGroup
          title="Conflict Watch"
          subtitle="Overlaps, ending-soon sessions, and start blockers"
          items={panel.conflicts}
          darkMode={darkMode}
        />
        <SessionIntegrityGroup
          title="Governance"
          subtitle="Lock status and late-attendance configuration"
          items={panel.governance}
          darkMode={darkMode}
        />
        <SessionIntegrityGroup
          title="Review Queue"
          subtitle="Archives and sessions that still need operational review"
          items={panel.reviews}
          darkMode={darkMode}
        />
      </div>
    </Card>
  );
}

function ProvisioningStatCard({
  stat,
  darkMode,
}: {
  stat: ProvisioningStat;
  darkMode: boolean;
}) {
  const toneClass = {
    success: darkMode
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50/80",
    warning: darkMode
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-amber-200 bg-amber-50/90",
    danger: darkMode
      ? "border-rose-500/30 bg-rose-500/10"
      : "border-rose-200 bg-rose-50/90",
    info: darkMode
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-cyan-200 bg-cyan-50/90",
    neutral: darkMode
      ? "border-slate-700 bg-slate-800/80"
      : "border-slate-200 bg-slate-50/90",
  }[stat.tone ?? "neutral"];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.12em]",
          darkMode ? "text-slate-300" : "text-slate-500",
        )}
      >
        {stat.label}
      </div>
      <div className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em] sm:text-3xl">
        {stat.value}
      </div>
      <div
        className={cn(
          "mt-2 text-sm leading-5",
          darkMode ? "text-slate-400" : "text-slate-600",
        )}
      >
        {stat.helper}
      </div>
    </div>
  );
}

export function ProvisioningVisibilityCard({
  panel,
  darkMode,
}: {
  panel: ProvisioningPanel;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-lg font-semibold">{panel.title}</div>
          <div
            className={cn(
              "mt-1 max-w-2xl text-sm leading-6",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            {panel.subtitle}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 xl:ml-auto xl:justify-end">
          <Button className="min-h-10 rounded-xl px-4 py-2 text-sm">
            {panel.primaryAction}
          </Button>
          <button
            type="button"
            className={cn(
              "min-h-10 rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            {panel.secondaryAction}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {panel.stats.map((stat) => (
          <ProvisioningStatCard
            key={`${panel.title}-${stat.label}`}
            stat={stat}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SimpleListCard
          title="Import Health"
          subtitle="Recent CSV runs, previews, and failed-row visibility"
          items={panel.importHealth}
          darkMode={darkMode}
        />
        <SimpleListCard
          title="Pending Invitations"
          subtitle="Manual creation, invite delivery, and acceptance bottlenecks"
          items={panel.pendingInvites}
          darkMode={darkMode}
        />
        <SimpleListCard
          title="Duplicate Queue"
          subtitle="Potential collisions, skipped rows, and the latest import summary"
          items={panel.duplicateQueue}
          darkMode={darkMode}
        />
      </div>
    </Card>
  );
}

function DisputeSlaStatCard({
  stat,
  darkMode,
}: {
  stat: DisputeSlaStat;
  darkMode: boolean;
}) {
  const toneClass = {
    success: darkMode
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50/80",
    warning: darkMode
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-amber-200 bg-amber-50/90",
    danger: darkMode
      ? "border-rose-500/30 bg-rose-500/10"
      : "border-rose-200 bg-rose-50/90",
    info: darkMode
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-cyan-200 bg-cyan-50/90",
    neutral: darkMode
      ? "border-slate-700 bg-slate-800/80"
      : "border-slate-200 bg-slate-50/90",
  }[stat.tone ?? "neutral"];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.12em]",
          darkMode ? "text-slate-300" : "text-slate-500",
        )}
      >
        {stat.label}
      </div>
      <div className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em] sm:text-3xl">
        {stat.value}
      </div>
      <div
        className={cn(
          "mt-2 text-sm",
          darkMode ? "text-slate-400" : "text-slate-600",
        )}
      >
        {stat.helper}
      </div>
    </div>
  );
}

function DisputeSlaRow({
  item,
  darkMode,
}: {
  item: DisputeSlaItem;
  darkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        darkMode ? "border-slate-800 bg-slate-950/50" : "border-slate-100 bg-slate-50/70",
      )}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="font-semibold">{item.title}</div>
          <div
            className={cn(
              "mt-1 text-sm",
              darkMode ? "text-slate-300" : "text-slate-600",
            )}
          >
            {item.subtitle}
          </div>
        </div>
        <StatusPill status={item.status} tone={item.statusTone} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <div
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.12em]",
              darkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Age
          </div>
          <div className="mt-1 text-sm font-medium">{item.age}</div>
        </div>
        <div>
          <div
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.12em]",
              darkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            SLA countdown
          </div>
          <div className="mt-1 text-sm font-medium">{item.countdown}</div>
        </div>
        <div>
          <div
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.12em]",
              darkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            Automation
          </div>
          <div className="mt-1 text-sm font-medium">{item.automation}</div>
        </div>
      </div>
    </div>
  );
}

export function DisputeSlaCard({
  panel,
  darkMode,
}: {
  panel: DisputeSlaPanel;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-lg font-semibold">{panel.title}</div>
          <div
            className={cn(
              "mt-1 max-w-2xl text-sm leading-6",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            {panel.subtitle}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 xl:ml-auto xl:justify-end">
          <Button className="min-h-10 rounded-xl px-4 py-2 text-sm">
            {panel.primaryAction}
          </Button>
          <button
            type="button"
            className={cn(
              "min-h-10 rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            {panel.secondaryAction}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {panel.stats.map((stat) => (
          <DisputeSlaStatCard
            key={`${panel.title}-${stat.label}`}
            stat={stat}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div
        className={cn(
          "mt-5 rounded-2xl border px-4 py-3 text-sm leading-6",
          darkMode
            ? "border-slate-700 bg-slate-950/50 text-slate-200"
            : "border-slate-200 bg-slate-50 text-slate-700",
        )}
      >
        {panel.automationSummary}
      </div>

      <div className="mt-5 space-y-3">
        {panel.items.map((item) => (
          <DisputeSlaRow
            key={`${panel.title}-${item.title}-${item.age}`}
            item={item}
            darkMode={darkMode}
          />
        ))}
      </div>
    </Card>
  );
}

function SystemHealthStatCard({
  stat,
  darkMode,
}: {
  stat: SystemHealthStat;
  darkMode: boolean;
}) {
  const toneClass = {
    success: darkMode
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50/80",
    warning: darkMode
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-amber-200 bg-amber-50/90",
    danger: darkMode
      ? "border-rose-500/30 bg-rose-500/10"
      : "border-rose-200 bg-rose-50/90",
    info: darkMode
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-cyan-200 bg-cyan-50/90",
    neutral: darkMode
      ? "border-slate-700 bg-slate-800/80"
      : "border-slate-200 bg-slate-50/90",
  }[stat.tone ?? "neutral"];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.12em]",
          darkMode ? "text-slate-300" : "text-slate-500",
        )}
      >
        {stat.label}
      </div>
      <div className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em] sm:text-3xl">
        {stat.value}
      </div>
      <div
        className={cn(
          "mt-2 text-sm",
          darkMode ? "text-slate-400" : "text-slate-600",
        )}
      >
        {stat.helper}
      </div>
    </div>
  );
}

function SystemHealthGroup({
  title,
  subtitle,
  items,
  darkMode,
}: {
  title: string;
  subtitle: string;
  items: SystemHealthItem[];
  darkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        darkMode ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/70",
      )}
    >
      <div className="text-base font-semibold">{title}</div>
      <div
        className={cn(
          "mt-1 text-sm",
          darkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {subtitle}
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={`${title}-${item.title}-${item.status}`}
            className={cn(
              "rounded-2xl border p-4",
              darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{item.title}</div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-300" : "text-slate-600",
                  )}
                >
                  {item.subtitle}
                </div>
              </div>
              <StatusPill status={item.status} tone={item.statusTone} />
            </div>
            <div
              className={cn(
                "mt-3 text-sm leading-6",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SystemHealthCard({
  panel,
  darkMode,
}: {
  panel: SystemHealthPanel;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-lg font-semibold">{panel.title}</div>
          <div
            className={cn(
              "mt-1 max-w-2xl text-sm leading-6",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            {panel.subtitle}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 xl:ml-auto xl:justify-end">
          <Button className="min-h-10 rounded-xl px-4 py-2 text-sm">
            {panel.primaryAction}
          </Button>
          <button
            type="button"
            className={cn(
              "min-h-10 rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            {panel.secondaryAction}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {panel.stats.map((stat) => (
          <SystemHealthStatCard
            key={`${panel.title}-${stat.label}`}
            stat={stat}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div
        className={cn(
          "mt-5 rounded-2xl border px-4 py-3 text-sm leading-6",
          darkMode
            ? "border-slate-700 bg-slate-950/50 text-slate-200"
            : "border-slate-200 bg-slate-50 text-slate-700",
        )}
      >
        {panel.accessSummary}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SystemHealthGroup
          title="Service Status"
          subtitle="Current services, sync backlog, and notification delivery"
          items={panel.serviceStatus}
          darkMode={darkMode}
        />
        <SystemHealthGroup
          title="Outage History"
          subtitle="Recent incidents and recovery windows"
          items={panel.outageHistory}
          darkMode={darkMode}
        />
        <SystemHealthGroup
          title="Maintenance Notices"
          subtitle="Scheduled work, risk windows, and customer-facing guidance"
          items={panel.maintenanceNotices}
          darkMode={darkMode}
        />
      </div>
    </Card>
  );
}

function ActionQueueStatCard({
  stat,
  darkMode,
}: {
  stat: ActionQueueStat;
  darkMode: boolean;
}) {
  const toneClass = {
    success: darkMode
      ? "border-emerald-500/30 bg-emerald-500/10"
      : "border-emerald-200 bg-emerald-50/80",
    warning: darkMode
      ? "border-amber-500/30 bg-amber-500/10"
      : "border-amber-200 bg-amber-50/90",
    danger: darkMode
      ? "border-rose-500/30 bg-rose-500/10"
      : "border-rose-200 bg-rose-50/90",
    info: darkMode
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-cyan-200 bg-cyan-50/90",
    neutral: darkMode
      ? "border-slate-700 bg-slate-800/80"
      : "border-slate-200 bg-slate-50/90",
  }[stat.tone ?? "neutral"];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.12em]",
          darkMode ? "text-slate-300" : "text-slate-500",
        )}
      >
        {stat.label}
      </div>
      <div className="mt-3 text-[1.75rem] font-semibold tracking-[-0.04em] sm:text-3xl">
        {stat.value}
      </div>
      <div
        className={cn(
          "mt-2 text-sm leading-5",
          darkMode ? "text-slate-400" : "text-slate-600",
        )}
      >
        {stat.helper}
      </div>
    </div>
  );
}

function ActionQueueGroup({
  title,
  subtitle,
  items,
  darkMode,
}: {
  title: string;
  subtitle: string;
  items: ActionQueueItem[];
  darkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        darkMode ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/70",
      )}
    >
      <div className="text-base font-semibold">{title}</div>
      <div
        className={cn(
          "mt-1 text-sm",
          darkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {subtitle}
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={`${title}-${item.title}-${item.status}`}
            className={cn(
              "rounded-2xl border p-4",
              darkMode ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-white",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{item.title}</div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-300" : "text-slate-600",
                  )}
                >
                  {item.subtitle}
                </div>
              </div>
              <StatusPill status={item.status} tone={item.statusTone} />
            </div>
            <div
              className={cn(
                "mt-3 text-sm leading-6",
                darkMode ? "text-slate-400" : "text-slate-500",
              )}
            >
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActionQueueCard({
  panel,
  darkMode,
}: {
  panel: ActionQueuePanel;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-lg font-semibold">{panel.title}</div>
          <div
            className={cn(
              "mt-1 max-w-2xl text-sm leading-6",
              darkMode ? "text-slate-300" : "text-slate-500",
            )}
          >
            {panel.subtitle}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 xl:ml-auto xl:justify-end">
          <Button className="min-h-10 rounded-xl px-4 py-2 text-sm">
            {panel.primaryAction}
          </Button>
          <button
            type="button"
            className={cn(
              "min-h-10 rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            {panel.secondaryAction}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {panel.stats.map((stat) => (
          <ActionQueueStatCard
            key={`${panel.title}-${stat.label}`}
            stat={stat}
            darkMode={darkMode}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <ActionQueueGroup
          title="Approvals"
          subtitle="Items awaiting your confirmation or final decision"
          items={panel.approvals}
          darkMode={darkMode}
        />
        <ActionQueueGroup
          title="Follow-ups"
          subtitle="Queues that need review, resend, or escalation"
          items={panel.followUps}
          darkMode={darkMode}
        />
        <ActionQueueGroup
          title="Time Sensitive"
          subtitle="Exports, invites, and high-risk tasks with expiry pressure"
          items={panel.timeSensitive}
          darkMode={darkMode}
        />
      </div>
    </Card>
  );
}

export function ToastCard({ toast }: { toast: ToastData }) {
  const toneClass = {
    warning: "border-[#f0c969] bg-[#fff9ea] text-[#8b4b12]",
    info: "border-[#9fd0ff] bg-[#eef7ff] text-[#17588f]",
    danger: "border-[#ffb2b2] bg-[#fff0f0] text-[#a31d1d]",
    success: "border-[#92ddb0] bg-[#effcf4] text-[#146534]",
  }[toast.tone];

  return (
    <div className={cn("rounded-[18px] border px-5 py-4", toneClass)}>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="text-sm font-semibold">{toast.title}</div>
          <div className="mt-1 text-sm opacity-90">{toast.description}</div>
        </div>
      </div>
    </div>
  );
}

export function RoleMetrics({
  metrics,
  darkMode,
}: {
  metrics: MetricCardData[];
  darkMode: boolean;
}) {
  const trendToneClass = {
    success: darkMode ? "text-emerald-300" : "text-emerald-700",
    warning: darkMode ? "text-amber-300" : "text-amber-700",
    danger: darkMode ? "text-rose-300" : "text-rose-700",
    info: darkMode ? "text-cyan-300" : "text-cyan-700",
    neutral: darkMode ? "text-slate-300" : "text-slate-500",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {metrics.map((metric, index) => (
        <Card
          key={`${metric.title}-${index}`}
          style={
            metric.accent === "green"
              ? {
                  backgroundColor: "#28b463",
                  borderColor: "#1fa85e",
                  color: "#ffffff",
                }
              : undefined
          }
          className={cn(
            "rounded-2xl border p-6 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.3)]",
            metric.accent === "green"
              ? ""
              : darkMode
                ? "border-slate-800 bg-slate-900 text-white"
                : "border-slate-100 bg-white text-[#232323]",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="whitespace-pre-line text-[16px] leading-[1.15]">
                {metric.title}
              </div>
              <div className="mt-3 whitespace-pre-line text-[18px] font-bold leading-[1.2]">
                {metric.value}
              </div>
              {metric.subtitle ? (
                <div
                  className={cn(
                    "mt-1 text-xs",
                    metric.accent === "green"
                      ? "text-[#ffffff]/75"
                      : darkMode
                        ? "text-slate-400"
                        : "text-slate-400",
                  )}
                >
                  {metric.subtitle}
                </div>
              ) : null}
              {metric.trend ? (
                <div
                  className={cn(
                    "mt-2 text-xs font-semibold",
                    metric.accent === "green"
                      ? "text-white/80"
                      : trendToneClass[metric.trendTone ?? "neutral"],
                  )}
                >
                  {metric.trend}
                </div>
              ) : null}
            </div>
            <div
              className={cn(
                metric.accent === "green"
                  ? "text-white"
                  : darkMode
                    ? "text-white"
                    : "text-black",
              )}
            >
              {metric.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AudienceMetrics({
  metrics,
  darkMode,
}: {
  metrics: MetricCardData[];
  darkMode: boolean;
}) {
  const trendToneClass = {
    success: darkMode ? "text-emerald-300" : "text-emerald-700",
    warning: darkMode ? "text-amber-300" : "text-amber-700",
    danger: darkMode ? "text-rose-300" : "text-rose-700",
    info: darkMode ? "text-cyan-300" : "text-cyan-700",
    neutral: darkMode ? "text-slate-300" : "text-slate-500",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metrics.map((metric, index) => (
        <Card
          key={`${metric.title}-${index}`}
          style={
            metric.accent === "green"
              ? {
                  backgroundColor: "#28b463",
                  borderColor: "#1fa85e",
                  color: "#ffffff",
                }
              : undefined
          }
          className={cn(
            "rounded-2xl border p-6 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.3)]",
            metric.accent === "green"
              ? ""
              : darkMode
                ? "border-slate-800 bg-slate-900 text-white"
                : "border-slate-100 bg-white text-[#232323]",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[17px] font-semibold">{metric.title}</div>
              {metric.value ? (
                <div className="mt-6 text-[22px] font-bold">{metric.value}</div>
              ) : null}
              {metric.trend ? (
                <div
                  className={cn(
                    "mt-2 text-xs font-semibold",
                    metric.accent === "green"
                      ? "text-white/80"
                      : trendToneClass[metric.trendTone ?? "neutral"],
                  )}
                >
                  {metric.trend}
                </div>
              ) : null}
            </div>
            <div
              className={cn(
                metric.accent === "green"
                  ? "text-white"
                  : darkMode
                    ? "text-white"
                    : "text-slate-700",
              )}
            >
              {metric.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TrendCard({
  title,
  subtitle,
  darkMode,
  heights,
  role,
}: {
  title: string;
  subtitle: string;
  darkMode: boolean;
  heights: number[];
  role: RoleKey;
}) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartHeight = 220;
  const barWidth = 72;
  const gap = 12;
  const leftPadding = 6;
  const svgWidth = heights.length * barWidth + (heights.length - 1) * gap + leftPadding * 2;

  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div
            className={cn(
              "mt-1 text-sm",
              darkMode ? "text-slate-400" : "text-slate-400",
            )}
          >
            {subtitle}
          </div>
        </div>
        {role === "unit" ? (
          <div className="flex gap-2 text-[10px] font-bold uppercase">
            <span
              className={cn(
                "rounded px-2 py-1",
                darkMode
                  ? "bg-slate-800 text-slate-200"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              Weekly
            </span>
            <span
              className={cn(
                "px-2 py-1",
                darkMode ? "text-slate-500" : "text-slate-400",
              )}
            >
              Monthly
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex min-h-72 flex-1 flex-col">
        <svg
          viewBox={`0 0 ${svgWidth} ${chartHeight}`}
          className="h-full min-h-55 w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {heights.map((height, index) => {
            const scaledHeight = Math.max((height / 100) * chartHeight, 18);
            const x = leftPadding + index * (barWidth + gap);
            const y = chartHeight - scaledHeight;
            const fill =
              role === "unit"
                ? index === 4
                  ? "#d7efee"
                  : "#94a3b8"
                : "#1aa59e";

            return (
              <rect
                key={`${labels[index]}-${height}`}
                x={x}
                y={y}
                width={barWidth}
                height={scaledHeight}
                rx={4}
                ry={4}
                fill={fill}
              />
            );
          })}
        </svg>

        <div className="mt-3 grid grid-cols-7 gap-3">
          {labels.map((label) => (
            <span key={label} className="text-center text-xs text-slate-400">
              {label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function PerformanceCard({
  title,
  subtitle,
  bars,
  darkMode,
}: {
  title: string;
  subtitle: string;
  bars: Array<{ label: string; value: number }>;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="text-lg font-semibold">{title}</div>
      <div
        className={cn(
          "mt-1 text-sm",
          darkMode ? "text-slate-400" : "text-slate-400",
        )}
      >
        {subtitle}
      </div>
      <div className="mt-8 space-y-5">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div
              className={cn(
                "mb-2 text-sm",
                darkMode ? "text-slate-300" : "text-slate-500",
              )}
            >
              {bar.label}
            </div>
            <div className="h-7 rounded-full bg-[#1f2c3c]">
              <div
                className="h-7 rounded-full bg-[#17a398]"
                style={{ width: `${bar.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between text-xs text-slate-400">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </Card>
  );
}

export function SessionCard({
  config,
  darkMode,
  role,
}: {
  config: RoleConfig;
  darkMode: boolean;
  role: RoleKey;
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{config.sessionCardTitle}</div>
          {config.sessionCardSubtitle ? (
            <div className="mt-1 text-sm text-slate-400">
              {config.sessionCardSubtitle}
            </div>
          ) : null}
        </div>

        <Button className="min-h-11 rounded-lg px-5 py-3 text-sm">
          {config.sessionAction}
        </Button>
      </div>

      {role === "unit" || role === "audience" ? (
        <div
          className={cn(
            "mt-5 overflow-hidden rounded-2xl border",
            darkMode ? "border-slate-800" : "border-slate-200",
          )}
        >
          <div
            className={cn(
              "hidden px-4 py-4 text-xs font-semibold uppercase tracking-[0.08em] md:grid md:grid-cols-[2.2fr_1fr_1.2fr_1.2fr_1fr_1fr]",
              darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-500",
            )}
          >
            <span>Session Name</span>
            <span>Audii</span>
            <span>Time</span>
            <span>
              {role === "audience" ? "Present/Total" : "Registered Users"}
            </span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {config.sessions.map((session) => (
            <div
              key={session.title}
              className={cn(
                "border-t px-4 py-4 text-sm md:grid md:grid-cols-[2.2fr_1fr_1.2fr_1.2fr_1fr_1fr] md:items-center md:py-5",
                darkMode ? "border-slate-800" : "border-slate-200",
              )}
            >
              <div className="md:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{session.title}</div>
                    <div
                      className={cn(
                        "mt-1 text-sm",
                        darkMode ? "text-slate-300" : "text-slate-500",
                      )}
                    >
                      {session.meta}
                    </div>
                  </div>
                  <SessionBadge tone={session.badgeTone}>{session.badge}</SessionBadge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.12em]",
                        darkMode ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      Time
                    </div>
                    <div className={cn("mt-1", darkMode ? "text-slate-200" : "text-slate-700")}>
                      {session.time || session.meta}
                    </div>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.12em]",
                        darkMode ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      {role === "audience" ? "Present/Total" : "Registered Users"}
                    </div>
                    <div className={cn("mt-1", darkMode ? "text-slate-200" : "text-slate-700")}>
                      {session.stat}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="font-semibold text-[#15a59d]">VIEW</span>
                  {role === "audience" && session.actionLabel ? (
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        session.actionLabel === "Archive disabled"
                          ? "text-slate-400"
                          : darkMode
                            ? "text-slate-300"
                            : "text-slate-600",
                      )}
                    >
                      {session.actionLabel}
                    </span>
                  ) : null}
                </div>
              </div>

              <span className="hidden font-medium md:block">{session.title}</span>
              <span
                className={cn(
                  "hidden md:block",
                  darkMode ? "text-slate-300" : "text-slate-500",
                )}
              >
                {session.meta}
              </span>
              <span
                className={cn(
                  "hidden md:block",
                  darkMode ? "text-slate-300" : "text-slate-500",
                )}
              >
                {session.time || session.meta}
              </span>
              <span
                className={cn(
                  "hidden md:block",
                  darkMode ? "text-slate-300" : "text-slate-500",
                )}
              >
                {session.stat}
              </span>
              <span className="hidden md:block">
                <SessionBadge tone={session.badgeTone}>
                  {session.badge}
                </SessionBadge>
              </span>
              <div className="hidden items-center gap-3 md:flex">
                <span className="font-semibold text-[#15a59d]">VIEW</span>
                {role === "audience" && session.actionLabel ? (
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      session.actionLabel === "Archive disabled"
                        ? "text-slate-400"
                        : darkMode
                          ? "text-slate-300"
                          : "text-slate-600",
                    )}
                  >
                    {session.actionLabel}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {config.sessions.map((session) => (
            <div
              key={session.title}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between",
                darkMode ? "border-slate-800" : "border-slate-100",
              )}
            >
              <div className="min-w-0">
                <div className="font-semibold">{session.title}</div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
                  <span>{session.meta}</span>
                  <span>{session.time}</span>
                  <span
                    className={cn(
                      "font-semibold",
                      darkMode ? "text-slate-200" : "text-slate-700",
                    )}
                  >
                    {session.stat}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <SessionBadge tone={session.badgeTone}>
                  {session.badge}
                </SessionBadge>
                <button
                  type="button"
                  className={cn(
                    "rounded-xl border px-5 py-2 text-sm",
                    darkMode
                      ? "border-slate-700 text-slate-200"
                      : "border-slate-200 text-slate-500",
                  )}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SessionBadge({
  tone,
  children,
}: {
  tone: "live" | "upcoming" | "archived" | "completed" | "locked";
  children: ReactNode;
}) {
  const toneClass = {
    live: "bg-[#ebfbf6] text-[#2dbd8d]",
    upcoming: "bg-[#1f2937] text-white",
    archived: "bg-[#c7ccd4] text-white",
    completed: "bg-[#1f2937] text-white",
    locked: "bg-[#fef3c7] text-[#92400e]",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-bold",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

function StatusPill({
  status,
  tone,
}: {
  status: string;
  tone?: Tone | "neutral";
}) {
  const toneClass = {
    success: "bg-[#dcfce7] text-[#16a34a]",
    warning: "bg-[#fef3c7] text-[#d97706]",
    danger: "bg-[#fee2e2] text-[#ef4444]",
    info: "bg-[#dbeafe] text-[#2563eb]",
    neutral: "bg-[#e5e7eb] text-[#6b7280]",
  }[tone ?? "neutral"];

  return (
    <span
      className={cn("rounded-full px-3 py-1 text-[11px] font-bold", toneClass)}
    >
      {status}
    </span>
  );
}

export function SimpleListCard({
  title,
  subtitle,
  items,
  footer,
  darkMode,
  showAction,
  supportStyle,
  billingStyle,
}: {
  title: string;
  subtitle: string;
  items: ListItem[];
  footer?: string;
  darkMode: boolean;
  showAction?: boolean;
  supportStyle?: boolean;
  billingStyle?: boolean;
}) {
  if (billingStyle) {
    const primaryItem = items[0];
    const planName = primaryItem?.subtitle.split(" - ")[1] ?? "Enterprise";
    const nextBillingDate =
      primaryItem?.meta?.replace(/^Next billing date\s*-\s*/i, "") ??
      "April 24, 2027";

    return (
      <Card
        className={cn(
          "rounded-2xl border p-5",
          darkMode
            ? "border-slate-700 text-white"
            : "border-transparent text-[#173433]",
        )}
        style={{
          backgroundColor: darkMode ? "#163b3a" : "#bfe5e3",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-1",
                darkMode ? "text-[#7fe1d8]" : "text-[#169f96]",
              )}
            >
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-semibold">{title}</div>
              <div
                className={cn(
                  "mt-1 text-sm",
                  darkMode ? "text-slate-300" : "text-slate-500",
                )}
              >
                {subtitle}
              </div>
            </div>
          </div>

          <StatusPill status="ACTIVE" tone="success" />
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 text-sm">
          <span className={cn(darkMode ? "text-slate-300" : "text-slate-500")}>
            Current Plan
          </span>
          <span
            className={cn(
              "text-sm font-semibold uppercase tracking-[0.08em]",
              darkMode ? "text-slate-200" : "text-slate-500",
            )}
          >
            {planName}
          </span>
        </div>

        <div className="mt-4 text-[2rem] font-semibold leading-none">
          {primaryItem?.title ?? "N750,000/Year"}
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 text-sm">
          <span className={cn(darkMode ? "text-slate-300" : "text-slate-500")}>
            Active Users
          </span>
          <span className={cn(darkMode ? "text-slate-200" : "text-slate-500")}>
            2,847 / Unlimited
          </span>
        </div>

        <div
          className={cn(
            "mt-2 h-1 rounded-full",
            darkMode ? "bg-slate-700" : "bg-[#1f2c3c]",
          )}
        >
          <div className="h-1 w-[82%] rounded-full bg-[#17a398]" />
        </div>

        <div
          className={cn(
            "mt-2 text-sm",
            darkMode ? "text-slate-300" : "text-slate-500",
          )}
        >
          No limit to users
        </div>

        <div
          className={cn(
            "mt-4 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
            darkMode
              ? "bg-[#5b3b45] text-slate-100"
              : "bg-[#e8cfd3] text-slate-700",
          )}
        >
          <span>Next billing date</span>
          <span className="font-semibold">{nextBillingDate}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-[#16a394] px-4 py-2 text-sm font-semibold text-white"
          >
            Manage Subscription
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-500 text-white"
                : "border-slate-500 text-slate-900",
            )}
          >
            View Invoices
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div
            className={cn(
              "mt-1 text-sm",
              darkMode ? "text-slate-300" : "text-slate-400",
            )}
          >
            {subtitle}
          </div>
        </div>
        {title.includes("Billing") ? (
          <StatusPill status="ACTIVE" tone="success" />
        ) : null}
        {title === "Support Tickets" ? (
          <StatusPill status="2 Open" tone="danger" />
        ) : null}
        {title === "Pending Disputes" ? (
          <div
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.12em]",
              darkMode ? "text-slate-300" : "text-slate-400",
            )}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {title.includes("Billing") ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-[#16a394] px-4 py-2 text-sm font-semibold text-white"
          >
            Manage Subscription
          </button>
          <button
            type="button"
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            View Invoices
          </button>
        </div>
      ) : null}

      {title === "Support Tickets" ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-[#16a394] px-4 py-2 text-sm font-semibold text-white"
          >
            View All Tickets
          </button>
          <button
            type="button"
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            Create Ticket
          </button>
          <button
            type="button"
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-semibold",
              darkMode
                ? "border-slate-700 text-slate-100"
                : "border-slate-200 text-slate-700",
            )}
          >
            Contact Support
          </button>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={`${title}-${item.title}-${item.subtitle}`}
            className={cn(
              supportStyle
                ? "rounded-2xl border border-slate-100 p-4"
                : "rounded-2xl border border-slate-100 p-4",
              darkMode && "border-slate-800",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{item.title}</div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-300" : "text-slate-500",
                  )}
                >
                  {item.subtitle}
                </div>
                {item.meta ? (
                  <div className="mt-2 text-sm text-slate-400">{item.meta}</div>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                {item.status ? (
                  <StatusPill status={item.status} tone={item.statusTone} />
                ) : null}
                {showAction ? (
                  <button
                    type="button"
                    className={cn(
                      "rounded-xl border px-5 py-2 text-sm",
                      darkMode
                        ? "border-slate-700 text-slate-200"
                        : "border-slate-200 text-slate-500",
                    )}
                  >
                    Review
                  </button>
                ) : item.actionLabel ? (
                  <button
                    type="button"
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm",
                      darkMode
                        ? "border-slate-700 text-slate-200"
                        : "border-slate-200 text-slate-500",
                    )}
                  >
                    {item.actionLabel}
                  </button>
                ) : supportStyle ? (
                  <button
                    type="button"
                    className={cn(
                      "rounded-xl border px-5 py-2 text-sm",
                      darkMode
                        ? "border-slate-700 text-slate-200"
                        : "border-slate-200 text-slate-500",
                    )}
                  >
                    View
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {footer ? (
        <button
          type="button"
          className="mt-5 text-sm font-semibold text-primary"
        >
          {footer} →
        </button>
      ) : null}
    </Card>
  );
}

export function ShowcaseSection({
  title,
  items,
  darkMode,
}: {
  title: string;
  items: ShowcaseCard[];
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "mt-5 rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className={cn(
              "rounded-2xl border p-4",
              item.tone === "danger" && "border-[#fecaca] bg-[#fff5f5]",
              item.tone === "warning" && "border-[#fde68a] bg-[#fffaf0]",
              item.tone === "success" && "border-[#bbf7d0] bg-[#f0fdf4]",
              item.tone === "info" && "border-[#bfdbfe] bg-[#eff6ff]",
              item.tone === "neutral" &&
                (darkMode
                  ? "border-slate-800 bg-[#111827]"
                  : "border-slate-200 bg-slate-50"),
            )}
          >
            <div className="font-semibold">{item.title}</div>
            <div
              className={cn(
                "mt-2 text-sm",
                item.tone === "neutral" && darkMode
                  ? "text-slate-300"
                  : "text-slate-600",
              )}
            >
              {item.description}
            </div>
            {item.bullets?.length ? (
              <div className="mt-3 space-y-2">
                {item.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className={cn(
                      "text-xs",
                      item.tone === "neutral" && darkMode
                        ? "text-slate-400"
                        : "text-slate-500",
                    )}
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AudienceLivePanel({
  panel,
  darkMode,
}: {
  panel: NonNullable<RoleConfig["audienceLivePanel"]>;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "mt-5 rounded-2xl border p-7",
        darkMode ? "border-slate-700" : "border-transparent",
      )}
      style={{
        backgroundColor: darkMode ? "#163b3a" : "#bfe5e3",
      }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-sm text-slate-600">
            Session is currently active ●
          </div>
          <div className="mt-4 text-[24px] font-semibold text-[#121212]">
            {panel.title}
          </div>
          <div className="mt-2 text-[16px] font-medium text-[#1f2937]">
            {panel.timer}
          </div>
          <div className="mt-8 text-sm text-slate-600">{panel.summary}</div>
          <div className="mt-2 h-3 rounded-full bg-[#1f2c3c]">
            <div
              className="h-3 rounded-full bg-[#13a39b]"
              style={{ width: `${panel.progress}%` }}
            />
          </div>
        </div>

        <div className="flex w-full max-w-60 flex-col gap-4">
          <button
            type="button"
            className="rounded-2xl bg-white px-6 py-4 text-xl font-semibold text-slate-700"
          >
            {panel.primaryAction}
          </button>
          <button
            type="button"
            className="rounded-2xl border-2 border-[#ff6868] px-6 py-4 text-xl font-semibold text-[#ff4444]"
          >
            {panel.secondaryAction}
          </button>
        </div>
      </div>
    </Card>
  );
}

export function AudienceLivePanelMatch({
  panel,
  darkMode,
}: {
  panel: NonNullable<RoleConfig["audienceLivePanel"]>;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "mt-5 rounded-2xl border p-7",
        darkMode ? "border-[#275554] text-white" : "border-transparent",
      )}
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #143433 0%, #193f3d 45%, #0f2726 100%)"
          : "#bfe5e3",
      }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              darkMode ? "text-slate-300" : "text-slate-600",
            )}
          >
            <span>Session is currently active</span>
            <span className="h-2 w-2 rounded-full bg-[#13a39b]" />
          </div>

          <div
            className={cn(
              "mt-4 text-[24px] font-semibold",
              darkMode ? "text-white" : "text-[#121212]",
            )}
          >
            {panel.title}
          </div>

          <div
            className={cn(
              "mt-2 flex items-center gap-2 text-[16px] font-medium",
              darkMode ? "text-[#d6f3ef]" : "text-[#1f2937]",
            )}
          >
            <Clock3 className="h-4 w-4" />
            <span>{panel.timer}</span>
          </div>

          <div
            className={cn(
              "mt-8 flex items-center justify-between gap-4 text-sm",
              darkMode ? "text-[#b8d9d4]" : "text-slate-600",
            )}
          >
            <span>{panel.summary}</span>
            <span
              className={cn(
                "font-semibold",
                darkMode ? "text-white" : "text-[#1f2937]",
              )}
            >
              {panel.progress}%
            </span>
          </div>

          <div
            className={cn(
              "mt-2 h-3 rounded-full",
              darkMode ? "bg-[#0c1f1f]" : "bg-[#233245]",
            )}
          >
            <div
              className={cn(
                "h-3 rounded-full",
                darkMode ? "bg-[#3ad1c3]" : "bg-[#13a39b]",
              )}
              style={{ width: `${panel.progress}%` }}
            />
          </div>
        </div>

        <div className="flex w-full max-w-64 flex-col gap-4">
          <button
            type="button"
            className={cn(
              "rounded-2xl px-6 py-4 text-lg font-semibold",
              darkMode
                ? "bg-white/92 text-[#173433] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.45)]"
                : "bg-white text-slate-700",
            )}
          >
            {panel.primaryAction}
          </button>
          <button
            type="button"
            className={cn(
              "rounded-2xl border-2 px-6 py-4 text-lg font-semibold",
              darkMode
                ? "border-[#ff8e8e] bg-[#2a1618] text-[#ff9d9d]"
                : "border-[#ff7d7d] text-[#ff4444]",
            )}
          >
            {panel.secondaryAction}
          </button>
        </div>
      </div>
    </Card>
  );
}

export function ReportCard({
  reportFilters,
  darkMode,
}: {
  reportFilters: NonNullable<RoleConfig["reportFilters"]>;
  darkMode: boolean;
}) {
  return (
    <Card
      className={cn(
        "mt-5 rounded-2xl border p-5",
        darkMode
          ? "border-slate-800 bg-slate-900 text-white"
          : "border-slate-100 bg-white",
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_220px]">
        <FilterField
          label="Date Range"
          value={reportFilters.dateRange}
          darkMode={darkMode}
        />
        <FilterField
          label="Session"
          value={reportFilters.session}
          darkMode={darkMode}
        />
        <FilterField
          label="Audience"
          value={reportFilters.audience}
          darkMode={darkMode}
        />
        <div className="flex items-end">
          <Button className="min-h-11 w-full rounded-lg px-5 py-3">
            Generate Report
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "mt-6 border-t pt-4 text-xs font-semibold uppercase tracking-[0.08em]",
          darkMode
            ? "border-slate-800 text-slate-300"
            : "border-slate-100 text-slate-400",
        )}
      >
        Recent Downloads
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {reportFilters.downloads.map((download) => (
          <div
            key={download.title}
            className={cn(
              "rounded-2xl p-4",
              darkMode ? "bg-slate-800" : "bg-slate-50",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{download.title}</div>
                <div
                  className={cn(
                    "mt-1 text-sm",
                    darkMode ? "text-slate-300" : "text-slate-500",
                  )}
                >
                  {download.meta}
                </div>
              </div>
              <div className="text-right text-sm font-semibold text-red-500">
                {download.expiry}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FilterField({
  label,
  value,
  darkMode,
}: {
  label: string;
  value: string;
  darkMode: boolean;
}) {
  return (
    <div>
      <div className="mb-3 text-[16px] font-semibold">{label}</div>
      <div
        className={cn(
          "flex min-h-11 items-center rounded-lg px-4",
          darkMode
            ? "bg-slate-800 text-slate-200"
            : "bg-slate-100 text-slate-500",
        )}
      >
        {value}
      </div>
    </div>
  );
}
