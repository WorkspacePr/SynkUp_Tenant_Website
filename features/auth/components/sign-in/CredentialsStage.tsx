import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface CredentialsStageProps {
  organizationName: string;
  organizationLogo: string;
  subdomain: string;
  email: string;
  password: string;
  rememberMe: boolean;
  error: string;
  supportsEmailPassword: boolean;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onBack: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function CredentialsStage({
  organizationName,
  organizationLogo,
  subdomain,
  email,
  password,
  rememberMe,
  error,
  supportsEmailPassword,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onBack,
  onSubmit,
}: CredentialsStageProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-7" onSubmit={onSubmit}>
      <div className="space-y-2">
        {organizationLogo ? (
          <img
            src={organizationLogo}
            alt={`${organizationName} logo`}
            className="h-10 w-auto rounded-lg object-contain"
          />
        ) : null}
        <h2 className="text-[2.1rem] font-bold leading-none tracking-[-0.06em] text-secondary">
          Welcome back, {organizationName}
        </h2>
        <p className="max-w-md text-base leading-6 text-muted-foreground">
          Sign in with your admin credentials for{" "}
          <span className="text-primary">
            {subdomain || "yourorg"}.synkup.app
          </span>
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-1">
          <Label htmlFor="signin-email">Email Address</Label>
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="name@company.com"
            error={Boolean(error)}
            suffix={
              <Mail className="h-4 w-4 text-secondary/45" strokeWidth={1.8} />
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="signin-password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Enter your password"
            error={Boolean(error)}
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
          {error ? (
            <div className="flex items-start gap-2 text-[0.72rem] font-medium leading-5 text-destructive">
              <AlertCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                strokeWidth={2}
              />
              <span>{error}</span>
            </div>
          ) : null}
          {!error && !supportsEmailPassword ? (
            <div className="flex items-start gap-2 text-[0.72rem] font-medium leading-5 text-destructive">
              <AlertCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                strokeWidth={2}
              />
              <span>
                Email/password sign-in is not enabled for this organisation.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm text-secondary/78">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(event) => onRememberMeChange(event.target.checked)}
          className="h-4.5 w-4.5 rounded border border-border accent-primary"
        />
        Remember me
      </label>

      <Button
        className="w-full"
        type="submit"
        disabled={isSubmitting || !supportsEmailPassword}
        loading={isSubmitting}
      >
        <span>Sign in</span>
        <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
      </Button>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
          Back to organization selection
        </button>
      </div>
    </form>
  );
}
