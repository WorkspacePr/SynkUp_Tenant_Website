import { TenantDashboardShell } from "@/features/dashboard/components/shell/TenantDashboardShell";

export default async function DashboardUnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;

  return (
    <TenantDashboardShell
      initialSection="units"
      initialUnitWorkspaceView={params.view === "list" ? "list" : "overview"}
    />
  );
}
