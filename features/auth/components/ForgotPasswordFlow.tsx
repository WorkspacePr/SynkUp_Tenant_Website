"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  requestTenantPasswordReset,
  resendTenantPasswordReset,
} from "@/features/auth/api/tenant-auth";
import { AuthExperienceShell } from "@/features/auth/components/AuthExperienceShell";

type RecoveryStage = "request" | "sent";

export function ForgotPasswordFlow() {
  const [stage, setStage] = useState<RecoveryStage>("request");
  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [requestError, setRequestError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const content = {
    request: {
      title: "Recover Access.",
      description:
        "Your security is our priority. We use industry-standard secure recovery protocols to help you safely regain access to your account.",
      footer: "Secure Recovery Protocol",
    },
    sent: {
      title: "Check your Inbox.",
      description:
        "We've sent a secure access link to help you get back into your account.",
      footer: "Logical Architect Security Layer",
    },
  }[stage];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSubdomain = subdomain.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedSubdomain) {
      setRequestError("Enter your organisation subdomain to continue.");
      return;
    }

    if (!normalizedEmail) {
      setRequestError("Enter your email address to continue.");
      return;
    }

    setIsSubmitting(true);
    setRequestError("");
    setResponseMessage("");

    void requestTenantPasswordReset({
      subdomain: normalizedSubdomain,
      email: normalizedEmail,
    }).then((result) => {
      setIsSubmitting(false);

      if (!result.success) {
        setRequestError(result.message);
        return;
      }

      setResponseMessage(result.message);
      setStage("sent");
    });
  }

  function handleResend() {
    const normalizedSubdomain = subdomain.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedSubdomain || !normalizedEmail) {
      setRequestError("Enter your organisation subdomain and email address again.");
      setStage("request");
      return;
    }

    setIsResending(true);
    setRequestError("");

    void resendTenantPasswordReset({
      subdomain: normalizedSubdomain,
      email: normalizedEmail,
    }).then((result) => {
      setIsResending(false);

      if (!result.success) {
        setRequestError(result.message);
        return;
      }

      setResponseMessage(result.message);
    });
  }

  return (
    <AuthExperienceShell
      stageTitle={content.title}
      stageDescription={content.description}
      stageFooter={content.footer}
      hideContinueLater
      compact
    >
      {stage === "request" ? (
        <form className="space-y-7" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2 className="text-[2.1rem] font-bold tracking-[-0.06em] text-secondary">
              Forgot Password
            </h2>
            <p className="max-w-sm text-base leading-6 text-muted-foreground">
              Enter your organisation domain and email address to receive a
              secure password reset link.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="recovery-subdomain">Organisation Subdomain</Label>
            <div className="flex h-13 items-center overflow-hidden rounded-[1.1rem] border border-border bg-card shadow-[0_12px_26px_-24px_rgba(15,23,42,0.7)]">
              <input
                id="recovery-subdomain"
                value={subdomain}
                onChange={(event) => setSubdomain(event.target.value)}
                placeholder="yourorg"
                className="h-full flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <span className="mr-2 rounded-[0.9rem] bg-[#edf3f3] px-3 py-2 text-xs text-secondary/75">
                .synkup.app
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="recovery-email">Email Address</Label>
            <Input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              suffix={<Mail className="h-4 w-4 text-secondary/45" strokeWidth={1.8} />}
            />
          </div>
          <FormError message={requestError} className="text-sm" />

          <Button className="w-full" type="submit" disabled={isSubmitting} loading={isSubmitting}>
            <span>Send Reset Link</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
          </Button>

          <div className="flex justify-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-sm text-primary transition hover:underline"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Back to Login
            </Link>
          </div>
        </form>
      ) : null}

      {stage === "sent" ? (
        <StatusPanel
          icon={
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eef8f6]">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#d7f0eb] text-primary">
                <Check className="h-5 w-5" strokeWidth={3} />
              </div>
            </div>
          }
          title="Link Sent"
          description={
            responseMessage ||
            "If an account exists, a password reset link has been sent. Please follow the instructions in your email."
          }
          notice={requestError}
          primaryAction={{
            label: isResending ? "Resending..." : "Resend Link",
            onClick: handleResend,
            loading: isResending,
          }}
          secondaryLink={{ href: "/signin", label: "Back to Login" }}
        />
      ) : null}
    </AuthExperienceShell>
  );
}

function StatusPanel({
  icon,
  title,
  description,
  notice,
  primaryAction,
  secondaryLink,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  notice?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
    badge?: string;
    loading?: boolean;
  };
  secondaryLink: {
    href: string;
    label: string;
  };
}) {
  return (
    <div className="space-y-8 text-center">
      <div className="mx-auto">{icon}</div>

      <div className="space-y-3">
        <h2 className="text-[2.1rem] font-bold leading-[1.05] tracking-[-0.06em] text-secondary">
          {title}
        </h2>
        <p className="mx-auto max-w-sm text-base leading-6 text-muted-foreground">
          {description}
        </p>
        {notice ? (
          <p className="mx-auto max-w-sm text-sm leading-6 text-destructive">
            {notice}
          </p>
        ) : null}
      </div>

      <Button
        className="w-full"
        type="button"
        onClick={primaryAction.onClick}
        disabled={primaryAction.loading}
        loading={primaryAction.loading}
      >
        <span>{primaryAction.label}</span>
        {primaryAction.badge ? (
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.65rem] font-bold tracking-[0.08em]">
            {primaryAction.badge}
          </span>
        ) : null}
      </Button>

      <div className="flex justify-center">
        <Link
          href={secondaryLink.href}
          className="inline-flex items-center gap-2 text-sm text-primary transition hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          {secondaryLink.label}
        </Link>
      </div>

      <div className="space-y-2 text-center">
        <p className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-secondary/42">
          Didn&apos;t receive the email?
        </p>
        <p className="text-sm leading-5 text-secondary/62">
          Check your spam folder or contact{" "}
          <a className="font-medium text-primary hover:underline" href="#">
            Support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
