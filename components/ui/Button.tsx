import * as React from "react";

import { cn } from "@/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "destructive";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_18px_34px_-24px_rgba(13,148,136,0.9)] hover:bg-[#0b857b] disabled:bg-[#94908f] disabled:text-white disabled:shadow-none",
  outline:
    "border border-border bg-card text-primary hover:border-primary hover:text-primary disabled:border-[#d5d2d1] disabled:bg-[#f1eeee] disabled:text-[#8d8888]",
  ghost: "bg-transparent text-secondary hover:bg-muted",
  destructive: "bg-destructive text-white hover:opacity-95",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      type = "button",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-14 items-center justify-center rounded-full px-6 py-4 text-sm font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-3 whitespace-nowrap">
        {loading ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {children}
      </span>
    </button>
  ),
);

Button.displayName = "Button";
