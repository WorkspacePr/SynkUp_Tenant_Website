import { TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/Card";

import type { UnitOverviewMetric } from "./types";

export function UnitOverviewMetrics({
  metrics,
}: {
  metrics: UnitOverviewMetric[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.label} className="rounded-[28px] border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
                <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{metric.value}</div>
                <div className="mt-2 text-sm font-medium">{metric.helper}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {metric.trend}
                </div>
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
