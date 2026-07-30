"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  Check,
  CircleAlert,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/utils";

export type DashboardToastTone = "success" | "error" | "warning" | "info";

const toneStyles: Record<
  DashboardToastTone,
  { Icon: LucideIcon; shell: string; icon: string }
> = {
  success: {
    Icon: Check,
    shell:
      "border-emerald-200 border-l-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:border-l-emerald-400 dark:bg-emerald-950/95 dark:text-emerald-100",
    icon: "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300",
  },
  error: {
    Icon: CircleAlert,
    shell:
      "border-red-200 border-l-red-600 bg-red-50 text-red-950 dark:border-red-500/30 dark:border-l-red-400 dark:bg-red-950/95 dark:text-red-100",
    icon: "border-red-600 text-red-700 dark:border-red-400 dark:text-red-300",
  },
  warning: {
    Icon: AlertTriangle,
    shell:
      "border-amber-200 border-l-amber-600 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:border-l-amber-400 dark:bg-amber-950/95 dark:text-amber-100",
    icon: "border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300",
  },
  info: {
    Icon: Info,
    shell:
      "border-blue-200 border-l-blue-600 bg-blue-50 text-blue-950 dark:border-blue-500/30 dark:border-l-blue-400 dark:bg-blue-950/95 dark:text-blue-100",
    icon: "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300",
  },
};

export function DashboardToast({
  title,
  description,
  tone = "success",
  onClose,
  duration = 4500,
}: {
  title: string;
  description: string;
  tone?: DashboardToastTone;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  const { Icon, shell, icon } = toneStyles[tone];
  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "fixed bottom-4 left-4 right-4 z-[70] flex items-center gap-4 rounded-2xl border border-l-4 px-5 py-4 shadow-[0_24px_55px_-25px_rgba(15,23,42,.5)] sm:bottom-5 sm:left-auto sm:right-5 sm:w-full sm:max-w-md",
        shell,
      )}
    >
      <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2", icon)}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-5">{title}</span>
        <span className="mt-0.5 block text-sm leading-5 opacity-80">
          {description}
        </span>
      </span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification" className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
