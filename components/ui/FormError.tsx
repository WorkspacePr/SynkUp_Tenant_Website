import { cn } from "@/utils";

interface FormErrorProps {
  id?: string;
  message?: string;
  className?: string;
}

export function FormError({ id, message, className }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className={cn("text-sm font-medium text-destructive", className)}
      role="alert"
    >
      {message}
    </p>
  );
}
