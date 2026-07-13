import { TenantDashboardShowcase } from "@/features/dashboard/components/TenantDashboardShowcase";

export default async function DashboardUnitDetailPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  const parsedUnitId = Number(unitId);

  return (
    <TenantDashboardShowcase
      initialSection="units"
      initialUnitWorkspaceView="detail"
      initialUnitId={Number.isFinite(parsedUnitId) ? parsedUnitId : 1}
    />
  );
}
