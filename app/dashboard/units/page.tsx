import { TenantDashboardShowcase } from "@/features/dashboard/components/TenantDashboardShowcase";

export default async function DashboardUnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;

  return (
    <TenantDashboardShowcase
      initialSection="units"
      initialUnitWorkspaceView={params.view === "list" ? "list" : "overview"}
    />
  );
}
