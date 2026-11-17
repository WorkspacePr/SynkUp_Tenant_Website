"use client";

import { AlertTriangle, LoaderCircle, Lock } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils";

export function DashboardScopeState({
  darkMode,
  state,
  scopeLabel,
  onRetry,
}: {
  darkMode: boolean;
  state: "loading" | "error" | "permission";
  scopeLabel: "unit" | "audience";
  onRetry?: () => void;
}) {
  const loading = state === "loading";
  const permissionDenied = state === "permission";

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[28px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]",
        darkMode ? "border-slate-800 bg-slate-900 text-white" : "border-slate-100 bg-white",
      )}
    >
      <div
        className={cn(
          "flex min-h-105 flex-col items-center justify-center px-6 py-12 text-center sm:px-10",
          darkMode ? "bg-slate-950/40" : "bg-[linear-gradient(180deg,#f8fffd_0%,#ffffff_100%)]",
        )}
        aria-live="polite"
        aria-busy={loading}
      >
        <div
          className={cn(
            "inline-flex h-16 w-16 items-center justify-center rounded-2xl",
            loading
              ? darkMode
                ? "bg-slate-800 text-[#32d2c5]"
                : "bg-[#dff8f4] text-[#16a394]"
              : darkMode
                ? "bg-rose-950/50 text-rose-300"
                : "bg-rose-50 text-rose-600",
          )}
        >
          {loading ? (
            <LoaderCircle className="h-8 w-8 animate-spin" />
          ) : permissionDenied ? (
            <Lock className="h-8 w-8" />
          ) : (
            <AlertTriangle className="h-8 w-8" />
          )}
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
          {loading
            ? `Checking your ${scopeLabel} access`
            : permissionDenied
              ? `You cannot access this ${scopeLabel}`
              : `We couldn't verify your ${scopeLabel}`}
        </h1>
        <p
          className={cn(
            "mt-3 max-w-xl text-sm leading-6 sm:text-base",
            darkMode ? "text-slate-300" : "text-slate-500",
          )}
        >
          {loading
            ? `Please wait while we confirm the ${scopeLabel} assigned to your account.`
            : permissionDenied
              ? `This ${scopeLabel} is outside the scope assigned to your account.`
            : `The ${scopeLabel} check did not complete. Retry before using this dashboard.`}
        </p>
        {state === "error" && onRetry ? (
          <Button className="mt-7 min-h-11 rounded-xl px-5 py-3" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
