import { cn } from "@/utils";

interface StepperProps {
  label: string;
  phase: 1 | 2 | 3;
}

export function Stepper({ label, phase }: StepperProps) {
  return (
    <div
      className="flex items-center gap-4"
      aria-label={label}
      aria-current="step"
      role="status"
    >
      <span className="text-xs font-extrabold tracking-[0.22em] text-primary">
        {label}
      </span>
      <div className="flex items-center gap-2" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={cn(
              "block h-[3px] rounded-full transition-all",
              item === phase ? "w-6 bg-primary" : "w-9 bg-[#d7dff0]",
            )}
          />
        ))}
      </div>
    </div>
  );
}
