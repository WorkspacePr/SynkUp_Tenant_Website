"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  findTenantOrganization,
  loginTenant,
  resendTenantLoginOtp,
  verifyTenantLoginOtp,
} from "@/features/auth/api/tenant-auth";
import { AuthExperienceShell } from "@/features/auth/components/AuthExperienceShell";
import { SIGN_IN_STORY_CONTENT } from "@/features/auth/components/sign-in/config";
import { CredentialsStage } from "@/features/auth/components/sign-in/CredentialsStage";
import { OrganizationStage } from "@/features/auth/components/sign-in/OrganizationStage";
import { VerificationStage } from "@/features/auth/components/sign-in/VerificationStage";
import type { SignInStage } from "@/features/auth/components/sign-in/types";
import {
  clearTenantLoginContext,
  readTenantLoginContext,
  storeOnboardingTokens,
  storeTenantLoginContext,
} from "@/lib/auth/tenant-session";

export function SignInFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<SignInStage>("organization");
  const [subdomain, setSubdomain] = useState("");
  const [organizationName, setOrganizationName] = useState("your workspace");
  const [organizationLogo, setOrganizationLogo] = useState("");
  const [supportsEmailPassword, setSupportsEmailPassword] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [orgError, setOrgError] = useState("");
  const [credentialError, setCredentialError] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [isFindingOrganization, setIsFindingOrganization] = useState(false);
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  const normalizedSubdomain = subdomain.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  useEffect(() => {
    const context = readTenantLoginContext();
    const restoredSubdomain =
      searchParams.get("subdomain")?.trim() || context?.subdomain?.trim() || "";
    const restoredEmail =
      searchParams.get("email")?.trim() || context?.email?.trim() || "";

    const timeout = window.setTimeout(() => {
      setSubdomain(restoredSubdomain);
      setEmail(restoredEmail);

      if (restoredSubdomain) {
        setStage("credentials");
        setOrganizationName(`${restoredSubdomain}.synkup.app`);
        setOrganizationLogo("");
        setSupportsEmailPassword(true);
        setOrgError("");
        return;
      }

      setStage("organization");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [searchParams]);

  async function handleOrganizationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalizedSubdomain) {
      setOrgError("Enter your organisation subdomain to continue.");
      return;
    }

    setIsFindingOrganization(true);
    setOrgError("");
    setCredentialError("");
    setStatusMessage("");

    const result = await findTenantOrganization(normalizedSubdomain);

    setIsFindingOrganization(false);

    if (!result.success) {
      setOrgError(result.message);
      return;
    }

    setOrganizationName(
      result.organization.name || `${normalizedSubdomain}.synkup.app`,
    );
    setOrganizationLogo(result.organization.logo ?? "");
    setSupportsEmailPassword(result.authentication.emailPassword);

    if (!result.authentication.emailPassword) {
      setOrgError(
        "This organisation does not support email and password sign-in here.",
      );
      return;
    }

    setStage("credentials");
  }

  async function finalizeLogin(redirectTarget?: string | null) {
    const resume = searchParams.get("resume");
    const nextTarget =
      resume === "onboarding"
        ? "/onboarding"
        : redirectTarget?.trim() || searchParams.get("redirectTo") || "/onboarding";

    clearTenantLoginContext();
    router.push(nextTarget);
  }

  async function handleCredentialSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedSubdomain) {
      setStage("organization");
      setOrgError("Enter your organisation subdomain to continue.");
      return;
    }

    if (!normalizedEmail || !password.trim()) {
      setCredentialError("Enter your email address and password to continue.");
      return;
    }

    setIsSubmittingCredentials(true);
    setCredentialError("");
    setStatusMessage("");

    const result = await loginTenant({
      subdomain: normalizedSubdomain,
      email: normalizedEmail,
      password,
      remember: rememberMe,
    });

    setIsSubmittingCredentials(false);

    if (!result.success) {
      setCredentialError(result.message);
      return;
    }

    storeTenantLoginContext({
      subdomain: result.organizationSubdomain || normalizedSubdomain,
      email: result.email || normalizedEmail,
      redirectTo: searchParams.get("redirectTo") || "/onboarding",
      resumeTarget:
        searchParams.get("resume") === "onboarding" ? "onboarding" : undefined,
    });

    setOrganizationName(
      result.organizationName || `${normalizedSubdomain}.synkup.app`,
    );
    setEmail(result.email || normalizedEmail);

    if (result.requiresOtp && result.challengeId) {
      setChallengeId(result.challengeId);
      setCodeTouched(false);
      setVerificationCode("");
      setStage("verify");
      setStatusMessage(result.message);
      return;
    }

    if (result.tokens.access) {
      storeOnboardingTokens(result.tokens);
      await finalizeLogin(result.redirectTarget);
      return;
    }

    setCredentialError(
      "Additional verification is required before you can continue.",
    );
  }

  async function handleVerificationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCodeTouched(true);

    if (verificationCode.length < 6) {
      setVerifyError("Enter the full 6-digit verification code.");
      return;
    }

    if (!challengeId) {
      setVerifyError("Your login session expired. Please sign in again.");
      setStage("credentials");
      return;
    }

    setIsSubmittingVerification(true);
    setVerifyError("");
    setStatusMessage("");

    const result = await verifyTenantLoginOtp({
      challengeId,
      code: verificationCode,
    });

    setIsSubmittingVerification(false);

    if (!result.success) {
      setVerifyError(result.message);
      return;
    }

    storeOnboardingTokens(result.tokens);
    await finalizeLogin(result.redirectTarget);
  }

  function syncVerificationCode(nextValue: string) {
    const digits = nextValue.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(digits);

    if (codeTouched) {
      setVerifyError(
        digits.length < 6 ? "Enter the full 6-digit verification code." : "",
      );
    }
  }

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    syncVerificationCode(event.target.value);
  }

  function handleCodeValueChange(nextValue: string) {
    syncVerificationCode(nextValue);
  }

  async function handleResendCode() {
    if (!challengeId || isResendingCode) {
      return;
    }

    setIsResendingCode(true);
    setVerifyError("");

    const result = await resendTenantLoginOtp(challengeId);

    setIsResendingCode(false);
    setStatusMessage(result.message);

    if (!result.success) {
      setVerifyError(result.message);
    }
  }

  return (
    <AuthExperienceShell
      stageTitle={SIGN_IN_STORY_CONTENT[stage].title}
      stageDescription={SIGN_IN_STORY_CONTENT[stage].description}
      stageFooter={SIGN_IN_STORY_CONTENT[stage].footer}
      stepperLabel={stage === "verify" ? "STEP 1 OF 3" : undefined}
      stepperPhase={stage === "verify" ? 1 : undefined}
      compact
    >
      {stage === "organization" ? (
        <OrganizationStage
          subdomain={subdomain}
          error={orgError}
          isSubmitting={isFindingOrganization}
          onSubdomainChange={setSubdomain}
          onSubmit={handleOrganizationSubmit}
        />
      ) : null}

      {stage === "credentials" ? (
        <CredentialsStage
          organizationName={organizationName}
          organizationLogo={organizationLogo}
          subdomain={normalizedSubdomain}
          email={email}
          password={password}
          rememberMe={rememberMe}
          error={credentialError}
          supportsEmailPassword={supportsEmailPassword}
          isSubmitting={isSubmittingCredentials}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRememberMeChange={setRememberMe}
          onBack={() => setStage("organization")}
          onSubmit={handleCredentialSubmit}
        />
      ) : null}

      {stage === "verify" ? (
        <VerificationStage
          email={normalizedEmail}
          value={verificationCode}
          error={verifyError}
          statusMessage={statusMessage}
          isSubmitting={isSubmittingVerification}
          isResending={isResendingCode}
          onBack={() => setStage("credentials")}
          onChange={handleCodeChange}
          onValueChange={handleCodeValueChange}
          onResend={handleResendCode}
          onSubmit={handleVerificationSubmit}
        />
      ) : null}
    </AuthExperienceShell>
  );
}
