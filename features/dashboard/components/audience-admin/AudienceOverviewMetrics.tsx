import { Card } from "@/components/ui/Card";

import type { AudienceDashboardMetric } from "./types";

export function AudienceOverviewMetrics({
  metrics,
}: {
  metrics: AudienceDashboardMetric[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.id} className="rounded-[28px] border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{metric.value}</div>
                {metric.supportingText ? (
                  <div className="mt-2 text-sm font-medium">{metric.supportingText}</div>
                ) : null}
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
