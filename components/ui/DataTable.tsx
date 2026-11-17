import type { TableHTMLAttributes } from "react";

import { cn } from "@/utils";

type DataTableProps = TableHTMLAttributes<HTMLTableElement> & {
  darkMode?: boolean;
  minWidthClassName?: string;
};

/** Shared responsive table styling based on the Audience workspace table. */
export function DataTable({
  children,
  className,
  darkMode = false,
  minWidthClassName,
  ...props
}: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        {...props}
        className={cn(
          "w-full text-left text-sm",
          minWidthClassName,
          "[&_thead]:text-xs [&_thead]:uppercase [&_thead]:tracking-wide",
          darkMode
            ? "[&_thead]:bg-slate-950/50 [&_thead]:text-slate-400 [&_tbody_tr]:border-slate-800 [&_tbody_tr:hover]:bg-slate-800/60"
            : "[&_thead]:bg-slate-50 [&_thead]:text-slate-500 [&_tbody_tr]:border-slate-200 [&_tbody_tr:hover]:bg-slate-50",
          "[&_th]:px-5 [&_th]:py-3 [&_th]:font-semibold [&_td]:px-5 [&_td]:py-4 [&_tbody_tr]:border-t [&_tbody_tr]:transition-colors",
          className,
        )}
      >
        {children}
      </table>
    </div>
  );
}
