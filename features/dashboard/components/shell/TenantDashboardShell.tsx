"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildTenantSignInUrl, logoutTenantSession, readTenantLoginContext } from "@/lib/auth/tenant-session";
import type { TenantLoginContext } from "@/lib/auth/tenant-session";
import { canAccessNavigationItem, getAccessibleDashboardRoles, getEffectiveDashboardRole } from "@/lib/auth/rbac";
import { getTenantUnits } from "@/features/dashboard/api/tenant-units";
import { getOrganizationOnboardingAudiences } from "@/features/onboarding/api/tenant-onboarding";
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
} from "../showcase";
import { AudienceAdminDashboard } from "../audience-admin/AudienceAdminDashboard";
import { SuperAdminDashboard } from "../super-admin/SuperAdminDashboard";
import { UnitAdminDashboard } from "../unit-admin/UnitAdminDashboard";
import { ShowcaseNavbar } from "../showcase/shell/ShowcaseNavbar";
import { ShowcaseSidebar } from "../showcase/shell/ShowcaseSidebar";
import type { RoleKey, SelectOption } from "../showcase";
import { UnitsWorkspace } from "../showcase/units/UnitsWorkspace";
import { AudienceWorkspace } from "../showcase/audience/AudienceWorkspace";
import { UsersWorkspace } from "../showcase/users/UsersWorkspace";
import { AttendanceWorkspace } from "../showcase/attendance/AttendanceWorkspace";
import { ReportsWorkspace } from "../showcase/reports/ReportsWorkspace";
import { SubscriptionWorkspace } from "../showcase/subscription/SubscriptionWorkspace";
import { SettingsWorkspace } from "../showcase/settings/SettingsWorkspace";
import { InheritedDashboardEmptyState } from "./InheritedDashboardEmptyState";

type SectionKey = "dashboard" | "units" | "audience" | "users" | "attendance" | "reports" | "subscription" | "settings";
type UnitWorkspaceView = "overview" | "list" | "detail";
type ThemePreference = "light" | "dark";

const THEME_PREFERENCE_STORAGE_KEY = "synkup-theme-preference";

type TenantDashboardShellProps = {
  initialSection?: SectionKey;
  initialUnitWorkspaceView?: UnitWorkspaceView;
  initialUnitId?: number;
};

export function TenantDashboardShell({
  initialSection = "dashboard",
  initialUnitWorkspaceView = "overview",
  initialUnitId,
}: TenantDashboardShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginContext, setLoginContext] = useState<TenantLoginContext | null>(null);
  const authenticatedRole = getEffectiveDashboardRole(loginContext);
  const [role, setRole] = useState<RoleKey>("audience");
  const [themePreference, setThemePreference] = useState<ThemePreference>("light");
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
  const [selectedScope, setSelectedScope] = useState("");
  const [availability, setAvailability] = useState({
    loading: true,
    units: [] as { id: number; name: string }[],
    audiences: [] as { id: number; name: string; unitId: number }[],
  });

  useEffect(() => {
    const context = readTenantLoginContext();
    setLoginContext(context);
    const authenticatedDashboardRole = getEffectiveDashboardRole(context);
    if (!authenticatedDashboardRole) return;

    const requestedView = searchParams.get("view");
    const nextRole: RoleKey =
      (requestedView === "super" || requestedView === "unit" || requestedView === "audience") &&
      getAccessibleDashboardRoles(authenticatedDashboardRole).includes(requestedView)
        ? requestedView
        : authenticatedDashboardRole;

    setRole(nextRole);
    setSelectedScope(
      nextRole === "super"
        ? context?.organizationName || "Organisation"
        : "Loading scope...",
    );
  }, [searchParams]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
    const nextTheme: ThemePreference = storedTheme === "dark" ? "dark" : "light";

    setThemePreference(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  useEffect(() => {
    let active = true;
    const organizationId = loginContext?.organizationId;

    if (!organizationId) {
      setAvailability({ loading: false, units: [], audiences: [] });
      return () => { active = false; };
    }

    setAvailability((current) => ({ ...current, loading: true }));
    void Promise.all([
      getTenantUnits({ page: 1 }),
      getOrganizationOnboardingAudiences(organizationId),
    ]).then(([unitsResult, audiencesResult]) => {
      if (!active) return;
      setAvailability({
        loading: false,
        units: unitsResult.success
          ? unitsResult.data.data.map((unit) => ({ id: unit.unit_id, name: unit.name }))
          : [],
        audiences: audiencesResult.success
          ? audiencesResult.data.results.map((audience) => ({
              id: audience.audience_id,
              name: audience.name,
              unitId: audience.unit,
            }))
          : [],
      });
    });

    return () => { active = false; };
  }, [loginContext?.organizationId]);

  useEffect(() => {
    if (availability.loading) return;

    const options = role === "super"
      ? [loginContext?.organizationName || "Organisation"]
      : role === "unit"
        ? availability.units
            .filter((unit) => authenticatedRole === "super" || (loginContext?.unitScope ?? []).includes(unit.id))
            .map((unit) => `Unit: ${unit.name}`)
        : availability.audiences
            .filter((audience) =>
              authenticatedRole === "super" ||
              (authenticatedRole === "unit" && (loginContext?.unitScope ?? []).includes(audience.unitId)) ||
              (authenticatedRole === "audience" && (loginContext?.audienceScope ?? []).includes(audience.id)),
            )
            .map((audience) => `Audience: ${audience.name}`);

    if (options.length > 0 && !options.includes(selectedScope)) {
      setSelectedScope(options[0]);
    }
  }, [authenticatedRole, availability, loginContext, role, selectedScope]);

  const config = roleConfigs[role];
  const activeSection = initialSection;
  const unitWorkspaceView = initialUnitWorkspaceView;
  const selectedUnitId =
    Number(searchParams.get("unitId") ?? initialUnitId ?? 1) || 1;
  const dashboardViewQuery = `?view=${role}`;
  const navMain = useMemo(
    () =>
      config.navMain.filter((item) => canAccessNavigationItem(role, item.label)).map((item) => ({
        ...item,
        href:
          item.label === "Dashboard"
            ? `/dashboard${dashboardViewQuery}`
            : item.label === "Units"
              ? `/dashboard/units${dashboardViewQuery}`
            : item.label === "Audience" || item.label === "Audiences"
              ? `/dashboard/audience${dashboardViewQuery}`
            : item.label === "Users"
                ? `/dashboard/users${dashboardViewQuery}`
            : item.label === "Attendance"
                ? `/dashboard/attendance${dashboardViewQuery}`
                : item.label === "Reports"
                  ? `/dashboard/reports${dashboardViewQuery}`
                : item.label === "Subscription"
                  ? `/dashboard/subscription${dashboardViewQuery}`
                  : item.label === "Settings"
                    ? `/dashboard/settings${dashboardViewQuery}`
                  : item.href,
        active:
          activeSection === "units"
            ? item.label === "Units"
            : activeSection === "audience"
              ? item.label === "Audience" || item.label === "Audiences"
            : activeSection === "users"
              ? item.label === "Users"
            : activeSection === "attendance"
              ? item.label === "Attendance"
              : activeSection === "reports"
                ? item.label === "Reports"
                : activeSection === "subscription"
                  ? item.label === "Subscription"
                  : activeSection === "settings"
                    ? item.label === "Settings"
              : item.label === "Dashboard",
      })),
    [activeSection, config.navMain, dashboardViewQuery, role],
  );
  const navBottom = useMemo(
    () =>
      config.navBottom.map((item) => ({
        ...item,
        href: item.label === "Settings" ? `/dashboard/settings${dashboardViewQuery}` : item.href,
        active: item.label === "Settings" && activeSection === "settings",
      })),
    [activeSection, config.navBottom, dashboardViewQuery],
  );
  const darkMode = themePreference === "dark";

  function handleThemeChange(nextTheme: ThemePreference) {
    setThemePreference(nextTheme);
    window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

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

  const unitScopeOptions = availability.units
    .filter((unit) =>
      authenticatedRole === "super" || (loginContext?.unitScope ?? []).includes(unit.id),
    )
    .map((unit) => ({ label: unit.name, value: `Unit: ${unit.name}` }));
  const audienceScopeOptions = availability.audiences
    .filter((audience) => {
      if (authenticatedRole === "super") return true;
      if (authenticatedRole === "unit") return (loginContext?.unitScope ?? []).includes(audience.unitId);
      return (loginContext?.audienceScope ?? []).includes(audience.id);
    })
    .map((audience) => ({ label: audience.name, value: `Audience: ${audience.name}` }));
  const scopeOptions: SelectOption[] = role === "super"
    ? [{ label: loginContext?.organizationName || "Organisation", value: loginContext?.organizationName || "Organisation" }]
    : role === "unit"
      ? unitScopeOptions
      : audienceScopeOptions;
  const activeScope =
    scopeOptions.length === 0 && !availability.loading
      ? "No assigned scope"
      : selectedScope || scopeOptions[0]?.value || "Loading scope...";

  const compactScopeLabel = activeScope.includes(":")
    ? activeScope.split(":")[1]?.trim() || activeScope
    : activeScope;

  const roleOptions: SelectOption[] = getAccessibleDashboardRoles(
    authenticatedRole ?? role,
  ).map((accessibleRole) => ({
    label: roleConfigs[accessibleRole].roleLabel,
    value: accessibleRole,
  }));

  const shouldShowUnitEmptyState = role === "unit" && !availability.loading && unitScopeOptions.length === 0;
  const shouldShowAudienceEmptyState = role === "audience" && !availability.loading && audienceScopeOptions.length === 0;
  const canCreateInEmptyState =
    authenticatedRole === "super" ||
    (authenticatedRole === "unit" && role === "audience" && unitScopeOptions.length > 0);

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
          navBottom={navBottom}
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
          onThemeChange={handleThemeChange}
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
              if (
                !authenticatedRole ||
                !getAccessibleDashboardRoles(authenticatedRole).includes(nextRole)
              ) {
                return;
              }

              setRole(nextRole);
              setSelectedScope(
                nextRole === "super"
                  ? loginContext?.organizationName || "Organisation"
                  : "Loading scope...",
              );
              router.push(`/dashboard?view=${nextRole}`);
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
            settingsHref={`/dashboard/settings${dashboardViewQuery}`}
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
            ) : activeSection === "audience" ? (
              <AudienceWorkspace darkMode={darkMode} />
            ) : activeSection === "users" ? (
              <UsersWorkspace darkMode={darkMode} />
            ) : activeSection === "attendance" ? (
              <AttendanceWorkspace darkMode={darkMode} />
            ) : activeSection === "reports" ? (
              <ReportsWorkspace darkMode={darkMode} />
            ) : activeSection === "subscription" ? (
              <SubscriptionWorkspace darkMode={darkMode} expired={searchParams.get("state") === "expired"} />
            ) : activeSection === "settings" ? (
              <SettingsWorkspace darkMode={darkMode} organizationName={loginContext?.organizationName} />
            ) : shouldShowUnitEmptyState || shouldShowAudienceEmptyState ? (
              <InheritedDashboardEmptyState
                darkMode={darkMode}
                kind={shouldShowUnitEmptyState ? "unit" : "audience"}
                canCreate={canCreateInEmptyState}
                hasUnits={availability.units.length > 0}
                onPrimaryAction={() => router.push(
                  shouldShowUnitEmptyState || availability.units.length === 0
                    ? "/dashboard/units"
                    : "/dashboard/audience",
                )}
                onReturn={() => router.push("/dashboard")}
              />
            ) : role === "super" ? (
              <SuperAdminDashboard
                darkMode={darkMode}
                activeScope={activeScope}
                userName="John Doe"
              />
            ) : role === "unit" ? (
              <UnitAdminDashboard
                darkMode={darkMode}
                activeScope={activeScope}
                userName="John Doe"
              />
            ) : role === "audience" ? (
              <AudienceAdminDashboard
                darkMode={darkMode}
                activeScope={activeScope}
                assignedAudienceOptions={scopeOptions}
                userName="John Doe"
                onAudienceChange={setSelectedScope}
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
