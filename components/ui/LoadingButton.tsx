import { Button, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({
  loading,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn("gap-3", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          Processing
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
