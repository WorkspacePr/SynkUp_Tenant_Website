"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { cn } from "@/utils";

import type { CreationSharedProps } from "../types";
import { Fingerprint } from "lucide-react";

export function CreationVerifyStep({
  register,
  errors,
  email,
  verificationCode,
  resendCounter,
  canResend,
  onResend,
  onBack,
  onContinue,
  isContinuing,
  isResending,
}: CreationSharedProps & {
  email: string;
  verificationCode: string;
  resendCounter: number;
  canResend: boolean;
  onResend: () => void;
  onBack: () => void;
  onContinue: () => void;
  isContinuing?: boolean;
  isResending?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const { onBlur, onChange, name, ref } = register("verificationCode");
  const allowedControlKeys = new Set([
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    "Home",
    "End",
  ]);

  return (
    <div className="space-y-8 text-center">
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
            id="verificationCode"
            ref={ref}
            name={name}
            value={verificationCode}
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="absolute inset-0 z-10 cursor-text opacity-0"
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
              const digitsOnly = pastedText.replace(/\D/g, "").slice(0, 6);
              event.currentTarget.value = digitsOnly;
              onChange(event);
            }}
            onFocus={() => setFocused(true)}
            onBlur={(event) => {
              setFocused(false);
              onBlur(event);
            }}
          />
          <div className="flex justify-center gap-3">
            {Array.from({ length: 6 }).map((_, index) => {
              const digit = verificationCode[index] ?? "";
              const isActive =
                focused && index === Math.min(verificationCode.length, 5);

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
          </div>
        </div>
        <FormError message={errors.verificationCode?.message} />
      </div>
      <Button
        type="button"
        className="w-full gap-3"
        onClick={onContinue}
        loading={isContinuing}
      >
        Continue to Plan Selection
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{"Didn't receive the code?"}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onResend}
            disabled={!canResend || isResending}
            className="inline-flex items-center gap-2 font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            {isResending ? (
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            ) : null}
            {isResending ? "Resending..." : "Resend code"}
          </button>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-secondary/70">
            00:{String(resendCounter).padStart(2, "0")}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center justify-center gap-2 text-sm text-secondary/80 transition hover:text-secondary"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Go Back
      </button>
    </div>
  );
}
