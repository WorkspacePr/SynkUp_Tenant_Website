import { AlertTriangle, CheckCircle2, Lock, RefreshCcw, SearchX } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

import type { DashboardWidgetState } from "./types";

export function renderWidgetState(params: {
  darkMode: boolean;
  state: DashboardWidgetState;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const { darkMode, state, title, description, onRetry } = params;

  if (state === "default") {
    return null;
  }

  const icon = {
    loading: RefreshCcw,
    empty: SearchX,
    error: AlertTriangle,
    permission: Lock,
    success: CheckCircle2,
  }[state];

  const accent = {
    loading: "text-primary",
    empty: darkMode ? "text-slate-300" : "text-slate-500",
    error: "text-destructive",
    permission: "text-warning",
    success: "text-success",
  }[state];

  const Icon = icon;

  return (
    <Card
      className={cn(
        "flex min-h-48 flex-col items-start justify-center rounded-[28px] border p-6",
        darkMode ? "border-border bg-card text-card-foreground" : "border-border bg-card",
      )}
    >
      <Icon
        className={cn(
          "h-8 w-8",
          accent,
          state === "loading" ? "animate-spin" : "",
        )}
      />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
      {state === "error" && onRetry ? (
        <Button className="mt-5 min-h-11 rounded-full px-4 py-2.5 text-sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Card>
  );
}
