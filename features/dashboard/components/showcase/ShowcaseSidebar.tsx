"use client";

import { X } from "lucide-react";

import { cn } from "@/utils";

import { SidebarItem, ThemeSwitch } from "./ShowcaseParts";
import type { NavItem, RoleKey } from "./types";

type ShowcaseSidebarProps = {
  darkMode: boolean;
  sidebarCollapsed: boolean;
  role: RoleKey;
  navMain: NavItem[];
  navBottom: NavItem[];
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (label: string, hasChildren: boolean) => void;
  themePreference: "system" | "light" | "dark";
  systemDarkMode: boolean;
  onThemeChange: (value: "system" | "light" | "dark") => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function ShowcaseSidebar({
  darkMode,
  sidebarCollapsed,
  role,
  navMain,
  navBottom,
  expandedGroups,
  onToggleGroup,
  themePreference,
  systemDarkMode,
  onThemeChange,
  mobileOpen,
  onCloseMobile,
}: ShowcaseSidebarProps) {
  const sidebarContent = (
    <div className="flex min-h-full flex-col px-5 py-6">
      <div>
        <div
          className={cn(
            "mb-10 text-[36px] font-semibold tracking-tighter",
            darkMode ? "text-white" : "text-[#2d3b1f]",
          )}
        >
          {sidebarCollapsed ? "S" : "Synkup"}
        </div>

        {!sidebarCollapsed ? (
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </div>
        ) : null}

        <nav className="space-y-1.5">
          {navMain.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              darkMode={darkMode}
              collapsed={sidebarCollapsed}
              expanded={
                expandedGroups[`${role}-${item.label}`] ?? Boolean(item.active)
              }
              onToggle={() => onToggleGroup(item.label, Boolean(item.children?.length))}
            />
          ))}
        </nav>
      </div>

      <div className="mt-8 dark:border-slate-800">
        <div className={cn("mb-4", sidebarCollapsed && "flex justify-center")}>
          {!sidebarCollapsed ? (
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Appearance
            </div>
          ) : null}

          <ThemeSwitch
            themePreference={themePreference}
            systemDarkMode={systemDarkMode}
            onChange={onThemeChange}
            darkShell={darkMode}
            collapsed={sidebarCollapsed}
          />
        </div>

        {!sidebarCollapsed ? (
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Preferences
          </div>
        ) : null}

        <nav className="space-y-1.5">
          {navBottom.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              darkMode={darkMode}
              collapsed={sidebarCollapsed}
              expanded={false}
            />
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "scrollbar-dashboard fixed inset-y-0 left-0 z-40 w-[88vw] max-w-84 overflow-y-auto border-r transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          darkMode ? "border-slate-800 bg-[#0b1420]" : "border-slate-100 bg-white",
        )}
      >
        <div className="flex items-center justify-end px-5 pt-4">
          <button
            type="button"
            onClick={onCloseMobile}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl",
              darkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          "scrollbar-dashboard hidden h-screen shrink-0 overflow-y-auto border-r transition-all duration-300 lg:block",
          sidebarCollapsed ? "w-24" : "w-75",
          darkMode ? "border-slate-800 bg-[#0b1420]" : "border-slate-100 bg-white",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
