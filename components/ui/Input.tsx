import * as React from "react";

import { cn } from "@/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, suffix, ...props }, ref) => (
    <div
      className={cn(
        "flex h-13 items-center rounded-[1.15rem] border bg-card px-4 shadow-[0_12px_26px_-24px_rgba(15,23,42,0.7)] transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30",
        error ? "border-destructive" : "border-border",
      )}
    >
      <input
        ref={ref}
        className={cn(
          "h-full w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
      {suffix ? (
        <span className="ml-3 shrink-0 pointer-events-auto inline-flex items-center">
          {suffix}
        </span>
      ) : null}
    </div>
  ),
);

Input.displayName = "Input";
