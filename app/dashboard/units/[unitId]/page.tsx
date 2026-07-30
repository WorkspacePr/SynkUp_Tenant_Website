import { TenantDashboardShell } from "@/features/dashboard/components/shell/TenantDashboardShell";

export default async function DashboardUnitDetailPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  const parsedUnitId = Number(unitId);

  return (
    <TenantDashboardShell
      initialSection="units"
      initialUnitWorkspaceView="detail"
      initialUnitId={Number.isFinite(parsedUnitId) ? parsedUnitId : 1}
    />
  );
}
