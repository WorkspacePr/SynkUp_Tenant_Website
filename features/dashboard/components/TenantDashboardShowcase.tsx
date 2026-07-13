"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buildTenantSignInUrl, logoutTenantSession } from "@/lib/auth/tenant-session";
import { cn } from "@/utils";

import {
  ActionQueueCard,
  AudienceLivePanelMatch,
  AudienceMetrics,
  DisputeSlaCard,
  PerformanceCard,
  ProvisioningVisibilityCard,
  QuickActionsCard,
  RoleMetrics,
  SessionCard,
  SessionIntegrityCard,
  SavedViewsCard,
  SimpleListCard,
  SystemHealthCard,
  TrendCard,
  ReportCard,
  roleConfigs,
} from "./showcase";
import { ShowcaseNavbar } from "./showcase/ShowcaseNavbar";
import { ShowcaseSidebar } from "./showcase/ShowcaseSidebar";
import type { RoleKey, SelectOption } from "./showcase";
import { UnitsWorkspace } from "./showcase/UnitsWorkspace";

type SectionKey = "dashboard" | "units";
type UnitWorkspaceView = "overview" | "list" | "detail";

type TenantDashboardShowcaseProps = {
  initialSection?: SectionKey;
  initialUnitWorkspaceView?: UnitWorkspaceView;
  initialUnitId?: number;
};

export function TenantDashboardShowcase({
  initialSection = "dashboard",
  initialUnitWorkspaceView = "overview",
  initialUnitId,
}: TenantDashboardShowcaseProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<RoleKey>("super");
  const [themePreference, setThemePreference] = useState<
    "system" | "light" | "dark"
  >("system");
  const [systemDarkMode, setSystemDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      "super-Audiences": false,
      "super-Users": true,
      "super-Attendance": false,
      "super-System Status": false,
      "unit-Users": true,
      "audience-Activity Feed": true,
    },
  );
  const [selectedScope, setSelectedScope] = useState(
    roleConfigs.super.scopeOptions?.[0] ?? "Organisation: SynkUp University",
  );

  useEffect(() => {
    const requestedRole = searchParams.get("role");
    const requestedUnitId = searchParams.get("unitId");
    const requestedAudienceId = searchParams.get("audienceId");

    const nextRole: RoleKey =
      requestedRole === "unit" || requestedRole === "audience"
        ? requestedRole
        : "super";

    setRole(nextRole);

    if (nextRole === "unit" && requestedUnitId) {
      setSelectedScope(`Unit: #${requestedUnitId}`);
      return;
    }

    if (nextRole === "audience" && requestedAudienceId) {
      setSelectedScope(`Audience: #${requestedAudienceId}`);
      return;
    }

    setSelectedScope(
      roleConfigs[nextRole].scopeOptions?.[0] ?? "Organisation: SynkUp University",
    );
  }, [searchParams]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = (matches: boolean) => {
      setSystemDarkMode(matches);
    };

    applySystemTheme(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applySystemTheme(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const config = roleConfigs[role];
  const activeSection = initialSection;
  const unitWorkspaceView = initialUnitWorkspaceView;
  const selectedUnitId =
    Number(searchParams.get("unitId") ?? initialUnitId ?? 1) || 1;
  const navMain = useMemo(
    () =>
      config.navMain.map((item) => ({
        ...item,
        href:
          item.label === "Dashboard"
            ? "/dashboard"
            : item.label === "Units"
              ? "/dashboard/units"
              : item.href,
        active:
          activeSection === "units"
            ? item.label === "Units"
            : item.label === "Dashboard",
      })),
    [activeSection, config.navMain],
  );
  const darkMode =
    themePreference === "system"
      ? systemDarkMode
      : themePreference === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    await logoutTenantSession();
    window.location.replace(buildTenantSignInUrl());
  }

  const chartHeights = useMemo(
    () =>
      role === "unit"
        ? [34, 58, 42, 71, 65, 35, 43]
        : role === "audience"
          ? [54, 66, 58, 71, 64, 68, 62]
          : [41, 48, 43, 57, 51, 62, 58],
    [role],
  );

  const activeScope =
    selectedScope || (config.scopeOptions?.[0] ?? "Organisation: SynkUp University");

  const compactScopeLabel = activeScope.includes(":")
    ? activeScope.split(":")[1]?.trim() || activeScope
    : activeScope;

  const roleOptions: SelectOption[] = [
    { label: "SUPER ADMIN", value: "super" },
    { label: "UNIT ADMIN", value: "unit" },
    { label: "AUDIENCE ADMIN", value: "audience" },
  ];

  const nextUnitDashboardId =
    Number(searchParams.get("unitId") ?? initialUnitId ?? 1) || 1;

  const scopeOptions: SelectOption[] = (config.scopeOptions ?? []).map((scope) => ({
    label: scope.includes(":") ? scope.split(":")[1]?.trim() || scope : scope,
    value: scope,
  }));

  return (
    <main
      className={cn(
        "h-screen overflow-hidden transition-colors",
        darkMode ? "bg-[#09131f] text-white" : "bg-[#f7f8fb] text-[#0f172a]",
      )}
    >
      <div className="flex h-screen">
        <ShowcaseSidebar
          darkMode={darkMode}
          sidebarCollapsed={sidebarCollapsed}
          role={role}
          navMain={navMain}
          navBottom={config.navBottom}
          expandedGroups={expandedGroups}
          onToggleGroup={(label, hasChildren) => {
            if (sidebarCollapsed || !hasChildren) {
              return;
            }

            setExpandedGroups((current) => ({
              ...current,
              [`${role}-${label}`]: !current[`${role}-${label}`],
            }));
          }}
          themePreference={themePreference}
          systemDarkMode={systemDarkMode}
          onThemeChange={setThemePreference}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="min-w-0 flex flex-1 flex-col overflow-hidden">
          <ShowcaseNavbar
            darkMode={darkMode}
            role={role}
            roleLabel={config.roleLabel}
            roleOptions={roleOptions}
            activeScope={activeScope}
            compactScopeLabel={compactScopeLabel}
            scopeOptions={scopeOptions}
            onRoleChange={(value) => {
              const nextRole = value as RoleKey;
              setRole(nextRole);

              const nextScope =
                roleConfigs[nextRole].scopeOptions?.[0] ??
                "Organisation: SynkUp University";
              setSelectedScope(nextScope);

              const params = new URLSearchParams();
              params.set("role", nextRole);

              if (nextRole === "unit") {
                params.set("unitId", String(nextUnitDashboardId));
              }

              if (pathname.startsWith("/dashboard/units")) {
                router.push(`/dashboard?${params.toString()}`);
                return;
              }

              router.push(`/dashboard?${params.toString()}`);
            }}
            onScopeChange={setSelectedScope}
            onToggleSidebar={() => {
              if (window.innerWidth < 1024) {
                setMobileSidebarOpen(true);
                return;
              }

              setSidebarCollapsed((current) => !current);
            }}
            onLogout={() => {
              void handleLogout();
            }}
            isLoggingOut={isLoggingOut}
            commandBar={config.commandBar}
          />

          <div className="scrollbar-dashboard min-h-0 flex-1 overflow-y-auto px-5 pb-10 sm:px-8 lg:px-8">
            {activeSection === "units" ? (
              <UnitsWorkspace
                darkMode={darkMode}
                role={role}
                view={unitWorkspaceView}
                selectedUnitId={selectedUnitId}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <h1
                      className={cn(
                        "text-4xl font-semibold tracking-[-0.04em]",
                        darkMode ? "text-white" : "text-black",
                      )}
                    >
                      {config.pageTitle}
                    </h1>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        darkMode ? "text-slate-300" : "text-slate-500",
                      )}
                    >
                      {config.pageSubtitle}
                    </p>
                    <div
                      className={cn(
                        "mt-4 inline-flex min-h-11 items-center rounded-xl border px-4 py-2 text-sm font-semibold",
                        darkMode
                          ? "border-slate-700 bg-slate-900 text-[#8fd3cf]"
                          : "border-[#cfeeed] bg-[#edf9f8] text-[#0f766e]",
                      )}
                    >
                      {activeScope}
                    </div>
                  </div>
                </div>

                {role === "audience" ? (
                  <AudienceMetrics metrics={config.metrics} darkMode={darkMode} />
                ) : (
                  <RoleMetrics metrics={config.metrics} darkMode={darkMode} />
                )}

                {config.quickActionsPanel ? (
                  <div className="mt-5">
                    <QuickActionsCard
                      panel={config.quickActionsPanel}
                      darkMode={darkMode}
                    />
                  </div>
                ) : null}

                {config.audienceLivePanel ? (
                  <AudienceLivePanelMatch
                    panel={config.audienceLivePanel}
                    darkMode={darkMode}
                  />
                ) : (
                  <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_320px]">
                    <TrendCard
                      title={config.trendTitle}
                      subtitle={config.trendSubtitle}
                      darkMode={darkMode}
                      heights={chartHeights}
                      role={role}
                    />
                    <PerformanceCard
                      title={config.performanceTitle}
                      subtitle={config.performanceSubtitle}
                      bars={config.performanceBars}
                      darkMode={darkMode}
                    />
                  </div>
                )}

                <div className="mt-5">
                  <SessionCard config={config} darkMode={darkMode} role={role} />
                </div>

                {config.provisioningPanel ? (
                  <div className="mt-5">
                    <ProvisioningVisibilityCard
                      panel={config.provisioningPanel}
                      darkMode={darkMode}
                    />
                  </div>
                ) : null}

                {config.disputeSlaPanel ? (
                  <div className="mt-5">
                    <DisputeSlaCard panel={config.disputeSlaPanel} darkMode={darkMode} />
                  </div>
                ) : null}

                {config.systemHealthPanel ? (
                  <div className="mt-5">
                    <SystemHealthCard
                      panel={config.systemHealthPanel}
                      darkMode={darkMode}
                    />
                  </div>
                ) : null}

                {config.actionQueuePanel ? (
                  <div className="mt-5">
                    <ActionQueueCard
                      panel={config.actionQueuePanel}
                      darkMode={darkMode}
                    />
                  </div>
                ) : null}

                {config.sessionIntegrityPanel ? (
                  <div className="mt-5">
                    <SessionIntegrityCard
                      panel={config.sessionIntegrityPanel}
                      darkMode={darkMode}
                    />
                  </div>
                ) : null}

                {config.savedViewsPanel ? (
                  <div className="mt-5">
                    <SavedViewsCard
                      panel={config.savedViewsPanel}
                      darkMode={darkMode}
                    />
                  </div>
                ) : null}

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  <SimpleListCard
                    title={config.lowerLeftTitle}
                    subtitle={config.lowerLeftSubtitle}
                    items={config.lowerLeftItems}
                    footer={config.lowerLeftFooter}
                    darkMode={darkMode}
                    showAction={role !== "audience"}
                  />
                  <SimpleListCard
                    title={config.lowerRightTitle}
                    subtitle={config.lowerRightSubtitle}
                    items={config.lowerRightItems}
                    footer={config.lowerRightFooter}
                    darkMode={darkMode}
                    supportStyle={config.lowerRightTitle === "Support Tickets"}
                    billingStyle={config.lowerRightTitle === "Billing Overview"}
                  />
                </div>

                {config.extraBottomLeftItems && config.extraBottomRightItems ? (
                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <SimpleListCard
                      title={config.extraBottomLeftTitle ?? ""}
                      subtitle={config.extraBottomLeftSubtitle ?? ""}
                      items={config.extraBottomLeftItems}
                      footer={config.extraBottomLeftFooter}
                      darkMode={darkMode}
                    />
                    <SimpleListCard
                      title={config.extraBottomRightTitle ?? ""}
                      subtitle={config.extraBottomRightSubtitle ?? ""}
                      items={config.extraBottomRightItems}
                      footer={config.extraBottomRightFooter}
                      darkMode={darkMode}
                      supportStyle
                    />
                  </div>
                ) : null}

                {config.reportFilters ? (
                  <ReportCard
                    reportFilters={config.reportFilters}
                    darkMode={darkMode}
                  />
                ) : null}
              </>
            )}

            <div className={cn("mt-10 text-center text-sm text-slate-400")}>
              Copyright © SYNKUP Admin Panel - v1.0
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
