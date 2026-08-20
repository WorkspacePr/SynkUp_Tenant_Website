"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { AuthExperienceShell } from "@/features/auth/components/shared/AuthExperienceShell";
import { cn } from "@/utils";
import { formatApiError } from "@/lib/api/errors";

type SetupState = "checking" | "ready" | "expired" | "complete" | "error";

type SetupPayload = {
  organization?: {
    id?: number;
    name?: string;
    subdomain?: string;
    logo?: string | null;
  };
  email?: string;
  status?: string;
  expires_at?: string;
  requires_password?: boolean;
  tenant_login_url?: string;
  message?: string;
  already_accepted?: boolean;
};

export function AccountSetupForm({ token }: { token: string }) {
  const [state, setState] = useState<SetupState>("checking");
  const [payload, setPayload] = useState<SetupPayload>({});
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const organizationName = payload.organization?.name?.trim() || "your organization";
  const organizationLogo = payload.organization?.logo || null;
  const requiresPassword = payload.requires_password !== false;
  const invitationStatus = payload.status?.trim().toLowerCase() || "";

  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;
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
      ? { label: "Weak", activeSegments: 1 }
      : strengthCount <= 3
        ? { label: "Moderate", activeSegments: Math.max(2, strengthCount) }
        : { label: "Strong", activeSegments: 4 };
  const canSubmit =
    !submitting &&
    (
      !requiresPassword ||
      (
        strengthCount === passwordChecks.length &&
        password === passwordConfirm
      )
    );
  const loginUrl = useMemo(() => {
    if (payload.tenant_login_url?.trim()) {
      return payload.tenant_login_url;
    }

    const params = new URLSearchParams();
    const subdomain = payload.organization?.subdomain?.trim();
    const email = payload.email?.trim();
    if (subdomain) {
      params.set("subdomain", subdomain);
    }
    if (email) {
      params.set("email", email);
    }

    const query = params.toString();
    return query ? `/signin?${query}` : "/signin";
  }, [payload.email, payload.organization?.subdomain, payload.tenant_login_url]);
  const title = useMemo(() => {
    if (state === "complete") return "Account Setup Complete";
    if (state === "expired") return "Invitation Link Expired";
    if (state === "ready" && !requiresPassword) return "Join Your SynkUp Workspace";
    return "Set Up Your SynkUp Account";
  }, [requiresPassword, state]);

  useEffect(() => {
    let active = true;

    async function verifyToken() {
      try {
        const response = await fetch(
          `/api/users/account-setup/${encodeURIComponent(token)}/`,
          { method: "GET", cache: "no-store" },
        );
        const body = (await response.json().catch(() => ({}))) as SetupPayload;
        if (!active) return;

        setPayload(body);
        if (!response.ok) {
          setState(response.status === 410 ? "expired" : "error");
          setError(formatApiError(body, "This setup link is invalid or unavailable."));
          return;
        }

        const status = body.status?.trim().toLowerCase() || "";
        if (status === "accepted") {
          setState("complete");
          return;
        }
        if (status === "expired" || status === "revoked" || status === "declined") {
          setState("expired");
          return;
        }
        setState("ready");
      } catch {
        if (!active) return;
        setState("error");
        setError("Unable to verify this setup link right now.");
      }
    }

    void verifyToken();
    return () => {
      active = false;
    };
  }, [token]);

  async function submitSetup() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");

    try {
      const requestBody = requiresPassword
        ? {
            password,
            password_confirm: passwordConfirm,
          }
        : {};
      const response = await fetch(
        `/api/users/account-setup/${encodeURIComponent(token)}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        },
      );
      const body = (await response.json().catch(() => ({}))) as SetupPayload;
      setPayload((current) => ({ ...current, ...body }));

      if (!response.ok) {
        const alreadyAcceptedMessage =
          typeof body.message === "string"
            ? body.message
            : typeof (body as { error?: unknown }).error === "string"
              ? (body as { error: string }).error
              : "";
        if (alreadyAcceptedMessage.toLowerCase().includes("already accepted")) {
          setState("complete");
          setError("");
          return;
        }
        setError(formatApiError(body, "Unable to complete account setup."));
        return;
      }
      setState("complete");
    } catch {
      setError("Unable to complete account setup right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthExperienceShell
      stageTitle="Secure access starts with a trusted setup."
      stageDescription="Create your password through a protected, single-use invitation and join your organisation's SynkUp workspace."
      stageFooter="Secure account activation"
      hideContinueLater
      compact
    >
      <div className="space-y-7">
        <div className="space-y-3">
          {organizationLogo ? (
            <img
              src={organizationLogo}
              alt={`${organizationName || "Organisation"} logo`}
              className="h-11 w-auto rounded-lg object-contain"
            />
          ) : null}
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              state === "expired" || state === "error"
                ? "bg-red-50 text-destructive"
                : state === "complete"
                  ? "bg-emerald-50 text-emerald-600"
                : "bg-primary/10 text-primary",
            )}
          >
            {state === "complete" ? (
              <Check className="h-7 w-7" />
            ) : state === "expired" || state === "error" ? (
              <AlertCircle className="h-7 w-7" />
            ) : state === "checking" ? (
              <LoaderCircle className="h-7 w-7 animate-spin" />
            ) : (
              <LockKeyhole className="h-7 w-7" />
            )}
          </span>
          <h1 className="text-[2.1rem] font-bold leading-none tracking-[-0.06em] text-secondary">
            {title}
          </h1>
          <p className="max-w-md text-base leading-6 text-muted-foreground">
            {state === "ready"
              ? requiresPassword
                ? `Create your password to join ${organizationName} on SynkUp.`
                : `This account already has a password. Accept the invitation to join ${organizationName}, then sign in with your existing credentials.`
              : state === "complete"
                ? requiresPassword
                  ? "Your password has been created. You can now continue to tenant login."
                  : invitationStatus === "accepted" || payload.already_accepted
                    ? "This invitation has already been accepted. Continue to tenant login with your existing password."
                    : "Your invitation has been accepted. Continue to tenant login with your existing password."
                : state === "checking"
                  ? "Checking your invitation link..."
                  : error || "This invitation cannot be used."}
          </p>
        </div>

        {state === "ready" ? (
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              void submitSetup();
            }}
          >
            {requiresPassword ? (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="account-setup-password">Password</Label>
                  <Input
                    id="account-setup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    error={password.length > 0 && strengthCount < passwordChecks.length}
                    suffix={
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((current) => !current)}
                        className="text-slate-500"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                        password.length === 0
                          ? "text-secondary/40"
                          : "text-primary",
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
                          password.length > 0 &&
                            segment < strength.activeSegments
                            ? "bg-primary"
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
                          {item.valid ? <Check className="h-3 w-3" /> : null}
                        </span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="account-setup-password-confirm">
                    Confirm password
                  </Label>
                  <Input
                    id="account-setup-password-confirm"
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    placeholder="Confirm your password"
                    error={passwordMismatch}
                  />
                  {passwordMismatch ? (
                    <span className="text-xs font-medium text-destructive">
                      Passwords do not match.
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-secondary/80">
                You already have a SynkUp password for <strong>{payload.email || "this email"}</strong>.
                Accept this invitation to activate access for <strong>{organizationName}</strong>,
                then sign in with your existing password.
              </div>
            )}

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
              loading={submitting}
            >
              <span>{requiresPassword ? "Set Up Account" : "Accept Invitation"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        ) : null}

        {state === "complete" ? (
          <div>
            <Link href={loginUrl} className="block">
              <Button className="w-full">
                <span>Continue to Login</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : null}
        {state === "expired" || state === "error" ? (
          <Link
            href={loginUrl}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Return to login
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </AuthExperienceShell>
  );
}
