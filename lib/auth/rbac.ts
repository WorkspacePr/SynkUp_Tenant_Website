import type { RoleKey } from "@/features/dashboard/components/showcase";

import type { TenantLoginContext } from "./tenant-session";

export type DashboardSection =
  | "dashboard"
  | "units"
  | "audience"
  | "users"
  | "attendance"
  | "reports"
  | "subscription";

const roleRank: Record<RoleKey, number> = {
  audience: 1,
  unit: 2,
  super: 3,
};

const sectionAccess: Record<DashboardSection, RoleKey[]> = {
  dashboard: ["audience", "unit", "super"],
  units: ["super"],
  audience: ["audience", "unit", "super"],
  users: ["unit", "super"],
  attendance: ["audience", "unit", "super"],
  reports: ["audience", "unit", "super"],
  subscription: ["super"],
};

const sectionPaths: Record<DashboardSection, string> = {
  dashboard: "/dashboard",
  units: "/dashboard/units",
  audience: "/dashboard/audience",
  users: "/dashboard/users",
  attendance: "/dashboard/attendance",
  reports: "/dashboard/reports",
  subscription: "/dashboard/subscription",
};

export function hasRoleAtLeast(role: RoleKey, required: RoleKey) {
  return roleRank[role] >= roleRank[required];
}

export function getAccessibleDashboardRoles(role: RoleKey): RoleKey[] {
  return (["super", "unit", "audience"] as RoleKey[]).filter((candidate) =>
    hasRoleAtLeast(role, candidate),
  );
}

export function canAccessDashboardSection(role: RoleKey, section: DashboardSection) {
  return sectionAccess[section].some((required) => hasRoleAtLeast(role, required));
}

export function canAccessNavigationItem(role: RoleKey, label: string) {
  const itemAccess: Record<string, RoleKey[]> = {
    Dashboard: ["audience", "unit", "super"],
    Units: ["super"],
    Audience: ["audience", "unit", "super"],
    Audiences: ["audience", "unit", "super"],
    Users: ["unit", "super"],
    Attendance: ["audience", "unit", "super"],
    Sessions: ["audience", "unit", "super"],
    Disputes: ["audience", "unit", "super"],
    Reports: ["audience", "unit", "super"],
    "Activity Feed": ["audience", "unit", "super"],
    "Roles & Permissions": ["super"],
    Subscription: ["super"],
    "System Status": ["super"],
    "Audit Logs": ["super"],
    Support: ["audience", "unit", "super"],
  };

  return (itemAccess[label] ?? []).some((required) => hasRoleAtLeast(role, required));
}

export function getDashboardSection(pathname: string): DashboardSection {
  const match = (Object.entries(sectionPaths) as [DashboardSection, string][]).find(
    ([section, path]) => section !== "dashboard" && pathname.startsWith(path),
  );
  return match?.[0] ?? "dashboard";
}

export function getAllowedDashboardPath(role: RoleKey) {
  return (
    (Object.entries(sectionPaths) as [DashboardSection, string][]).find(
      ([section]) => canAccessDashboardSection(role, section),
    )?.[1] ?? "/dashboard"
  );
}

export function getEffectiveDashboardRole(context: TenantLoginContext | null): RoleKey | null {
  return context?.dashboardRole ?? null;
}

export function getScopeOptions(context: TenantLoginContext | null, role: RoleKey) {
  if (role === "super") {
    return [context?.organizationName?.trim() || "Organisation"];
  }

  const scope = role === "unit" ? context?.unitScope : context?.audienceScope;
  const label = role === "unit" ? "Unit" : "Audience";
  return (scope ?? []).map((id) => `${label}: #${id}`);
}
