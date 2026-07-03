import * as React from "react";

import { cn } from "@/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[0.72rem] font-bold uppercase tracking-[0.18em] text-secondary/80",
        className,
      )}
      {...props}
    />
  );
}
