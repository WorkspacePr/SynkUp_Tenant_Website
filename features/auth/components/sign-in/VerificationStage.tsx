import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Fingerprint } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { cn } from "@/utils";

interface VerificationStageProps {
  email: string;
  value: string;
  error: string;
  statusMessage: string;
  isSubmitting: boolean;
  isResending: boolean;
  onBack: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange: (value: string) => void;
  onResend: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const allowedControlKeys = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "Tab",
  "Home",
  "End",
]);

export function VerificationStage({
  email,
  value,
  error,
  statusMessage,
  isSubmitting,
  isResending,
  onBack,
  onChange,
  onValueChange,
  onResend,
  onSubmit,
}: VerificationStageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  return (
    <form className="space-y-8 text-center" onSubmit={onSubmit}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6edf2] text-primary">
        <Fingerprint className="h-5 w-5" strokeWidth={2} />
      </div>
      <div>
        <h2 className="text-[2.1rem] font-bold tracking-[-0.06em] text-secondary">
          Enter Verification Code
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-muted-foreground">
          We have sent a 6-digit verification code to{" "}
          <span className="font-semibold text-primary">
            {email || "your email"}
          </span>
          . Please enter it below to secure your account.
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative mx-auto w-fit">
          <input
            ref={inputRef}
            value={value}
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="absolute inset-0 z-10 cursor-text opacity-0"
            aria-label="Verification code"
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "").slice(0, 6);
              event.target.value = nextValue;
              onChange(event);
            }}
            onKeyDown={(event) => {
              if (
                allowedControlKeys.has(event.key) ||
                event.ctrlKey ||
                event.metaKey
              ) {
                return;
              }

              if (!/^\d$/.test(event.key)) {
                event.preventDefault();
              }
            }}
            onPaste={(event) => {
              const pastedText = event.clipboardData.getData("text");
              event.preventDefault();
              onValueChange(pastedText);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="flex justify-center gap-3"
          >
            {Array.from({ length: 6 }).map((_, index) => {
              const digit = value[index] ?? "";
              const isActive = focused && index === Math.min(value.length, 5);

              return (
                <div
                  key={index}
                  className={cn(
                    "flex h-15 w-12 items-center justify-center rounded-2xl border bg-[#f3f6ff] text-xl font-bold transition sm:h-13 sm:w-13",
                    digit
                      ? "border-primary/25 text-primary"
                      : "border-border text-secondary",
                    isActive && "border-primary ring-2 ring-ring/30",
                  )}
                >
                  {digit || ""}
                </div>
              );
            })}
          </button>
        </div>
        <FormError message={error} className="text-center text-xs" />
        {!error && statusMessage ? (
          <p className="text-center text-xs text-primary">{statusMessage}</p>
        ) : null}
      </div>

      <Button
        className="w-full gap-3"
        type="submit"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        Continue
        <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
      </Button>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{"Didn't receive the code?"}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className="font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            {isResending ? "Resending..." : "Resend code"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center justify-center gap-2 text-sm text-secondary/80 transition hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
        Go Back
      </button>
    </form>
  );
}
