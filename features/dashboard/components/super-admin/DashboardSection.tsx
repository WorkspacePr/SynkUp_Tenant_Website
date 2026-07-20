import type { ReactNode } from "react";

import { cn } from "@/utils";

type DashboardSectionProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  darkMode: boolean;
  className?: string;
};

export function DashboardSection({
  title,
  subtitle,
  action,
  children,
  darkMode,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
            {subtitle ? (
              <p
                className={cn(
                  "mt-1 text-sm",
                  darkMode ? "text-slate-400" : "text-slate-400",
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
