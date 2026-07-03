"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

import { AuthExperienceShell } from "@/features/auth/components/AuthExperienceShell";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { CheckIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { confirmTenantPasswordReset } from "@/features/auth/api/tenant-auth";
import { cn } from "@/utils";

type ResetStage = "form" | "success" | "invalid";

function isResetLinkErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("invalid") ||
    normalized.includes("expired") ||
    normalized.includes("token") ||
    normalized.includes("uid") ||
    normalized.includes("link")
  );
}

export function ResetPasswordFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid")?.trim() ?? "";
  const token = searchParams.get("token")?.trim() ?? "";
  const hasValidResetLink = Boolean(uid) && Boolean(token);
  const [stage, setStage] = useState<ResetStage>(
    hasValidResetLink ? "form" : "invalid",
  );
  const [subdomain, setSubdomain] = useState(
    searchParams.get("subdomain")?.trim() ?? "",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [submitError, setSubmitError] = useState(
    hasValidResetLink ? "" : "This password reset link is invalid or incomplete.",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = useMemo(
    () => [
      { label: "8+ characters", valid: password.length >= 8 },
      { label: "At least one number", valid: /\d/.test(password) },
      { label: "Capital letter", valid: /[A-Z]/.test(password) },
      { label: "Special symbol", valid: /[^A-Za-z0-9]/.test(password) },
    ],
    [password],
  );

  const strengthCount = passwordChecks.filter((item) => item.valid).length;
  const strength =
    strengthCount <= 1
      ? {
          label: "Weak",
          activeSegments: 1,
          colorClass: "text-primary",
          barClass: "bg-primary",
        }
      : strengthCount <= 3
        ? {
            label: "Moderate",
            activeSegments: Math.max(2, strengthCount),
            colorClass: "text-primary",
            barClass: "bg-primary",
          }
        : {
            label: "Strong",
            activeSegments: 4,
            colorClass: "text-primary",
            barClass: "bg-primary",
          };
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    strengthCount === passwordChecks.length &&
    passwordsMatch &&
    Boolean(subdomain.trim()) &&
    hasValidResetLink;

  useEffect(() => {
    if (stage !== "success" || seconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [seconds, stage]);

  useEffect(() => {
    if (stage === "success" && seconds === 0) {
      router.push("/signin");
    }
  }, [router, seconds, stage]);

  const content = {
    form: {
      title: "Reset Password",
      description:
        "Security is the cornerstone of logical architecture. We implement rigorous standards to protect your workspace integrity.\n\nA strong password significantly reduces the risk of unauthorized access. Use a combination of character types to achieve maximum entropy.",
      footer: "Secure Session Layer v4.0",
    },
    success: {
      title: "Access Restored",
      description:
        "Security is our priority. Your account access has been successfully reinstated.",
      footer: "Logical Architect Security Layer",
    },
    invalid: {
      title: "Security Check",
      description:
        "For your protection, password reset links must be valid, current, and tied to an active organization membership.",
      footer: "Logical Architect Security Layer",
    },
  }[stage];

  return (
    <AuthExperienceShell
      stageTitle={content.title}
      stageDescription={content.description}
      stageFooter={content.footer}
      hideContinueLater
      compact
    >
      {stage === "form" ? (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!subdomain.trim()) {
              setSubmitError("Enter your organisation subdomain to continue.");
              return;
            }

            if (!uid || !token) {
              setSubmitError("This password reset link is invalid or incomplete.");
              setStage("invalid");
              return;
            }

            if (!canSubmit) {
              return;
            }

            setIsSubmitting(true);
            setSubmitError("");

            void confirmTenantPasswordReset({
              subdomain: subdomain.trim().toLowerCase(),
              uid,
              token,
              newPassword: password,
            }).then((result) => {
              setIsSubmitting(false);

              if (!result.success) {
                setSubmitError(result.message);
                if (isResetLinkErrorMessage(result.message)) {
                  setStage("invalid");
                }
                return;
              }

              setSuccessMessage(result.message);
              setSeconds(5);
              setStage("success");
            });
          }}
        >
          <div className="space-y-2">
            <h2 className="text-[2.1rem] font-bold tracking-[-0.06em] text-secondary">
              Create New Password
            </h2>
            <p className="max-w-sm text-base leading-6 text-muted-foreground">
              Please enter and confirm your new credentials below to regain
              access to your dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="reset-subdomain">Organisation Subdomain</Label>
            <div className="flex h-13 items-center overflow-hidden rounded-[1.1rem] border border-border bg-card shadow-[0_12px_26px_-24px_rgba(15,23,42,0.7)]">
              <input
                id="reset-subdomain"
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
            <Label htmlFor="reset-password">Password</Label>
            <Input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="************"
              suffix={
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-muted-foreground transition hover:text-secondary"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-secondary/50">
                Strength
              </span>
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.12em]",
                  password.length === 0 ? "text-secondary/40" : strength.colorClass,
                )}
              >
                {password.length === 0 ? "No password" : strength.label}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((segment) => (
                <span
                  key={segment}
                  className={cn(
                    "h-1 rounded-full",
                    password.length > 0 && segment < strength.activeSegments
                      ? strength.barClass
                      : "bg-[#d7dff0]",
                  )}
                />
              ))}
            </div>
            <div className="grid gap-2 text-sm text-secondary/75 sm:grid-cols-2">
              {passwordChecks.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                      item.valid
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/40 text-muted-foreground",
                    )}
                  >
                    {item.valid ? <CheckIcon className="h-3 w-3" /> : null}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="************"
              suffix={
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="text-muted-foreground transition hover:text-secondary"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />
            {!passwordsMatch ? (
              <p className="text-xs font-medium text-destructive">
                Passwords must match.
              </p>
            ) : null}
          </div>
          <FormError message={submitError} className="text-sm" />

          <Button
            className="w-full"
            type="submit"
            disabled={!canSubmit || isSubmitting}
            loading={isSubmitting}
          >
            <span>Update Password</span>
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

      {stage === "success" ? (
        <div className="space-y-8 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eef8f6]">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#d7f0eb] text-primary">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.7} />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[2.1rem] font-bold leading-[1.05] tracking-[-0.06em] text-secondary">
              Password Updated Successfully
            </h2>
            <p className="mx-auto max-w-sm text-base leading-6 text-muted-foreground">
              {successMessage ||
                "You can now use your new credentials to access your account securely."}
            </p>
          </div>

          <Link href="/signin" className="block">
            <Button className="w-full" type="button">
              <span>Continue to Login</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
            </Button>
          </Link>

          <p className="text-xs text-secondary/65">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
            Redirecting to login in {seconds} seconds...
          </p>
        </div>
      ) : null}

      {stage === "invalid" ? (
        <div className="space-y-8 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1ef]">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ffd6d0] text-[#d85f4f]">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.7} />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-[2.1rem] font-bold leading-[1.05] tracking-[-0.06em] text-secondary">
              Invalid or Expired Link
            </h2>
            <p className="mx-auto max-w-sm text-base leading-6 text-muted-foreground">
              {submitError ||
                "For your protection, reset links are single-use and expire after a limited time."}
            </p>
          </div>

          <Link href="/forgot-password" className="block">
            <Button className="w-full" type="button">
              <span>Request New Link</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
            </Button>
          </Link>

          <div className="flex justify-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-sm text-primary transition hover:underline"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
              Back to Login
            </Link>
          </div>
        </div>
      ) : null}
    </AuthExperienceShell>
  );
}
