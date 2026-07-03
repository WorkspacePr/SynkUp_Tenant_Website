import * as React from "react";

import { cn } from "@/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card text-card-foreground shadow-[0_28px_60px_-42px_rgba(15,23,42,0.45)]",
        className,
      )}
      {...props}
    />
  );
}
