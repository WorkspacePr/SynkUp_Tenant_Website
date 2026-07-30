"use client";

import { ArrowLeft, ArrowRight, MailCheck, RotateCcw, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

interface PasswordExpiredStageProps {
  email: string;
  error: string;
  statusMessage: string;
  isSubmitting: boolean;
  resetLinkSent: boolean;
  onBack: () => void;
  onSendResetLink: () => void;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) {
    return email;
  }

  const visibleName = name.length <= 2 ? name.slice(0, 1) : name.slice(0, 2);
  return `${visibleName}${"*".repeat(Math.max(3, name.length - visibleName.length))}@${domain}`;
}

export function PasswordExpiredStage({
  email,
  error,
  statusMessage,
  isSubmitting,
  resetLinkSent,
  onBack,
  onSendResetLink,
}: PasswordExpiredStageProps) {
  return (
    <div className="space-y-7">
      <div className="space-y-4">
        <div className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          {resetLinkSent ? (
            <MailCheck className="h-6 w-6" strokeWidth={2} />
          ) : (
            <ShieldAlert className="h-6 w-6" strokeWidth={2} />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Monthly security renewal
          </p>
          <h2 className="text-[2.1rem] font-bold leading-[1.05] tracking-[-0.06em] text-secondary">
            {resetLinkSent ? "Check your inbox" : "Your password has expired"}
          </h2>
          <p className="max-w-md text-base leading-6 text-muted-foreground">
            {resetLinkSent
              ? `We sent a time-limited password reset link to ${maskEmail(email)}. Open it to create a new password, then sign in again.`
              : "For administrator accounts, passwords must be renewed every 30 days. We will email you a secure link to create a new one."}
          </p>
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-border bg-[#f7faf9] p-4">
        <div className="flex gap-3">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          <p className="text-sm leading-6 text-secondary/75">
            No dashboard session has been created. Your workspace stays protected
            until the password change is complete.
          </p>
        </div>
      </div>

      {statusMessage ? (
        <p className="text-sm font-medium text-primary" role="status">
          {statusMessage}
        </p>
      ) : null}
      <FormError message={error} />

      <Button
        className="w-full"
        type="button"
        loading={isSubmitting}
        onClick={onSendResetLink}
      >
        {resetLinkSent ? (
          <>
            <RotateCcw className="h-4 w-4" strokeWidth={1.9} />
            <span>Resend secure link</span>
          </>
        ) : (
          <>
            <span>Send secure reset link</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="mx-auto flex items-center gap-2 text-sm font-medium text-secondary/65 transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
        Sign in with another account
      </button>
    </div>
  );
}
