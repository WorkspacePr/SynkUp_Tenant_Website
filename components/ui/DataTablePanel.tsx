import type { HTMLAttributes } from "react";

import { cn } from "@/utils";

type DataTablePanelProps = HTMLAttributes<HTMLDivElement> & {
  darkMode: boolean;
};

/** Shared rounded surface used around data tables and their loading states. */
export function DataTablePanel({
  children,
  className,
  darkMode,
  ...props
}: DataTablePanelProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden rounded-2xl border",
        darkMode
          ? "border-slate-800 bg-slate-900 text-slate-100"
          : "border-slate-200 bg-white text-slate-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
