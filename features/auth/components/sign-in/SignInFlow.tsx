"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  findTenantOrganization,
  loginTenant,
  requestTenantPasswordReset,
  resendTenantLoginOtp,
  verifyTenantLoginOtp,
} from "@/features/auth/api/tenant-auth";
import { AuthExperienceShell } from "@/features/auth/components/shared/AuthExperienceShell";
import { SIGN_IN_STORY_CONTENT } from "@/features/auth/components/sign-in/model/story-content";
import type { SignInStage } from "@/features/auth/components/sign-in/model/types";
import { CredentialsStage } from "@/features/auth/components/sign-in/stages/CredentialsStage";
import { OrganizationStage } from "@/features/auth/components/sign-in/stages/OrganizationStage";
import { PasswordExpiredStage } from "@/features/auth/components/sign-in/stages/PasswordExpiredStage";
import { VerificationStage } from "@/features/auth/components/sign-in/stages/VerificationStage";
import { resolvePostLoginRoute } from "@/features/auth/utils/post-login-route";
import {
  clearTenantLoginContext,
  readTenantLoginContext,
  storeAuthenticatedRoute,
  storeOnboardingTokens,
  storeTenantLoginContext,
} from "@/lib/auth/tenant-session";

function normalizeTenantSubdomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.synkup\.app$/, "");
}

function buildRestoredContext(context: ReturnType<typeof readTenantLoginContext>) {
  if (!context) {
    return null;
  }

  return {
    userId: context.userId,
    organizationId: context.organizationId,
    dashboardRole: context.dashboardRole,
    unitScope: context.unitScope,
    audienceScope: context.audienceScope,
    onboardingStatus: context.onboardingStatus,
    onboardingCurrentStep: context.onboardingCurrentStep,
    onboardingLaunched: context.onboardingLaunched,
    subdomain: context.subdomain,
    email: context.email,
  };
}

export function SignInFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMountedRef = useRef(false);
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
  const [passwordExpiryError, setPasswordExpiryError] = useState("");
  const [passwordExpiryStatus, setPasswordExpiryStatus] = useState("");
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [passwordResetLinkSent, setPasswordResetLinkSent] = useState(false);

  const normalizedSubdomain = normalizeTenantSubdomain(subdomain);
  const normalizedEmail = email.trim().toLowerCase();

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const transitionToStage = useCallback((nextStage: SignInStage) => {
    if (nextStage !== "verify") {
      setVerifyError("");
      setStatusMessage("");
      setVerificationCode("");
      setChallengeId(null);
      setCodeTouched(false);
      setIsSubmittingVerification(false);
      setIsResendingCode(false);
    }

    if (nextStage !== "credentials") {
      setCredentialError("");
    }

    if (nextStage !== "organization") {
      setOrgError("");
    }

    if (nextStage !== "password-expired") {
      setPasswordExpiryError("");
      setPasswordExpiryStatus("");
      setIsSendingPasswordReset(false);
      setPasswordResetLinkSent(false);
    }

    setStage(nextStage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const context = readTenantLoginContext();
    const incomingResume = searchParams.get("resume");
    const incomingRedirectTo = searchParams.get("redirectTo");
    const shouldClearStaleOnboardingRedirect =
      !incomingResume &&
      (!incomingRedirectTo || incomingRedirectTo === "/onboarding") &&
      (context?.resumeTarget === "onboarding" ||
        context?.redirectTo === "/onboarding" ||
        incomingRedirectTo === "/onboarding");

    if (shouldClearStaleOnboardingRedirect && context) {
      clearTenantLoginContext();
      const cleanContext = buildRestoredContext(context);
      if (cleanContext) {
        storeTenantLoginContext(cleanContext);
      }
    }

    const resolvedContext =
      shouldClearStaleOnboardingRedirect && context
        ? buildRestoredContext(context)
        : context;
    const legacySubdomain = searchParams.get("subdomain")?.trim() || "";
    const legacyEmail = searchParams.get("email")?.trim() || "";
    const restoredSubdomain = normalizeTenantSubdomain(
      resolvedContext?.subdomain?.trim() || legacySubdomain,
    );
    const restoredEmail = resolvedContext?.email?.trim() || legacyEmail;

    const timeout = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      setSubdomain(restoredSubdomain);
      setEmail(restoredEmail);

      if (legacySubdomain || legacyEmail) {
        if (legacySubdomain && !resolvedContext?.subdomain) {
          storeTenantLoginContext({ subdomain: legacySubdomain });
        }

        if (legacyEmail && !resolvedContext?.email) {
          storeTenantLoginContext({ email: legacyEmail });
        }

        const sanitizedParams = new URLSearchParams(searchParams.toString());
        sanitizedParams.delete("subdomain");
        sanitizedParams.delete("email");
        const sanitizedQuery = sanitizedParams.toString();
        const sanitizedUrl = sanitizedQuery ? `/signin?${sanitizedQuery}` : "/signin";
        router.replace(sanitizedUrl);
      }

      if (shouldClearStaleOnboardingRedirect && incomingRedirectTo === "/onboarding") {
        const sanitizedParams = new URLSearchParams(searchParams.toString());
        sanitizedParams.delete("redirectTo");
        const sanitizedQuery = sanitizedParams.toString();
        const sanitizedUrl = sanitizedQuery ? `/signin?${sanitizedQuery}` : "/signin";
        router.replace(sanitizedUrl);
      }

      if (restoredSubdomain) {
        setIsFindingOrganization(true);
        setOrgError("");
        setCredentialError("");
        setStatusMessage("");
        void (async () => {
          const result = await findTenantOrganization(restoredSubdomain);

          if (cancelled) {
            return;
          }

          setIsFindingOrganization(false);

          if (!result.success) {
            transitionToStage("credentials");
            setOrgError("");
            setOrganizationName(`${restoredSubdomain}.synkup.app`);
            setOrganizationLogo("");
            setSupportsEmailPassword(true);
            return;
          }

          setOrganizationName(
            result.organization.name || `${restoredSubdomain}.synkup.app`,
          );
          setOrganizationLogo(result.organization.logo ?? "");
          setSupportsEmailPassword(result.authentication.emailPassword);
          transitionToStage("credentials");
        })();
        return;
      }

      transitionToStage("organization");
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [router, searchParams, transitionToStage]);

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

    if (!isMountedRef.current) {
      return;
    }

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

    transitionToStage("credentials");
  }

  async function finalizeLogin(args?: {
    dashboardRole?: "super" | "unit" | "audience" | null;
    unitScope?: number[];
    audienceScope?: number[];
    onboardingStatus?: string | null;
    onboardingCurrentStep?: string | null;
    onboardingLaunched?: boolean | null;
    redirectTarget?: string | null;
  }) {
    const resume = searchParams.get("resume");
    const nextTarget = resolvePostLoginRoute({
      dashboardRole: args?.dashboardRole,
      unitScope: args?.unitScope,
      audienceScope: args?.audienceScope,
      onboardingStatus: args?.onboardingStatus,
      onboardingCurrentStep: args?.onboardingCurrentStep,
      onboardingLaunched: args?.onboardingLaunched,
      redirectTarget: args?.redirectTarget,
      searchRedirectTo: searchParams.get("redirectTo"),
      resume,
    });

    storeAuthenticatedRoute(nextTarget);
    const currentLoginContext = readTenantLoginContext();
    clearTenantLoginContext();

    if (nextTarget.startsWith("/onboarding") && currentLoginContext) {
      storeTenantLoginContext({
        userId: currentLoginContext.userId,
        organizationId: currentLoginContext.organizationId,
        dashboardRole: currentLoginContext.dashboardRole,
        unitScope: currentLoginContext.unitScope,
        audienceScope: currentLoginContext.audienceScope,
        onboardingStatus: currentLoginContext.onboardingStatus,
        onboardingCurrentStep: currentLoginContext.onboardingCurrentStep,
        onboardingLaunched: currentLoginContext.onboardingLaunched,
        subdomain: currentLoginContext.subdomain,
        email: currentLoginContext.email,
        redirectTo: "/onboarding",
        resumeTarget: "onboarding",
      });
    }

    router.push(nextTarget);
  }

  async function handleCredentialSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedSubdomain) {
      transitionToStage("organization");
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
    setVerifyError("");
    setVerificationCode("");
    setChallengeId(null);
    setCodeTouched(false);

    const result = await loginTenant({
      subdomain: normalizedSubdomain,
      email: normalizedEmail,
      password,
      remember: rememberMe,
    });

    if (!isMountedRef.current) {
      return;
    }

    setIsSubmittingCredentials(false);

    if (!result.success) {
      if (result.passwordChangeRequired) {
        setPassword("");
        transitionToStage("password-expired");
        return;
      }

      setCredentialError(result.message);
      return;
    }

    storeTenantLoginContext({
      userId: result.userId ?? undefined,
      organizationId: result.organizationId ?? undefined,
      dashboardRole: result.dashboardRole ?? undefined,
      unitScope: result.unitScope,
      audienceScope: result.audienceScope,
      onboardingStatus: result.onboardingStatus ?? undefined,
      onboardingCurrentStep: result.onboardingCurrentStep ?? undefined,
      onboardingLaunched: result.onboardingLaunched ?? undefined,
      subdomain: normalizeTenantSubdomain(
        result.organizationSubdomain || normalizedSubdomain,
      ),
      email: result.email || normalizedEmail,
      redirectTo: searchParams.get("redirectTo") || undefined,
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
      setVerifyError("");
      transitionToStage("verify");
      setStatusMessage(result.message);
      return;
    }

    if (result.tokens.access) {
      storeOnboardingTokens(result.tokens);
      await finalizeLogin({
        dashboardRole: result.dashboardRole,
        unitScope: result.unitScope,
        audienceScope: result.audienceScope,
        onboardingStatus: result.onboardingStatus,
        onboardingCurrentStep: result.onboardingCurrentStep,
        onboardingLaunched: result.onboardingLaunched,
        redirectTarget: result.redirectTarget,
      });
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
      transitionToStage("credentials");
      return;
    }

    setIsSubmittingVerification(true);
    setVerifyError("");
    setStatusMessage("");

    const result = await verifyTenantLoginOtp({
      challengeId,
      code: verificationCode,
    });

    if (!isMountedRef.current) {
      return;
    }

    setIsSubmittingVerification(false);

    if (!result.success) {
      setVerifyError(result.message);
      return;
    }

    storeOnboardingTokens(result.tokens);
    const loginContext = readTenantLoginContext();
    await finalizeLogin({
      dashboardRole: result.dashboardRole ?? loginContext?.dashboardRole,
      unitScope:
        result.unitScope.length > 0 ? result.unitScope : loginContext?.unitScope,
      audienceScope:
        result.audienceScope.length > 0
          ? result.audienceScope
          : loginContext?.audienceScope,
      onboardingStatus: result.onboardingStatus ?? loginContext?.onboardingStatus,
      onboardingCurrentStep:
        result.onboardingCurrentStep ?? loginContext?.onboardingCurrentStep,
      onboardingLaunched:
        result.onboardingLaunched ?? loginContext?.onboardingLaunched,
      redirectTarget: result.redirectTarget,
    });
  }

  function syncVerificationCode(nextValue: string) {
    const digits = nextValue.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(digits);
    setStatusMessage("");

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

    if (!isMountedRef.current) {
      return;
    }

    setIsResendingCode(false);
    setStatusMessage(result.message);

    if (!result.success) {
      setVerifyError(result.message);
    }
  }

  async function handleSendPasswordReset() {
    if (!normalizedSubdomain || !normalizedEmail || isSendingPasswordReset) {
      return;
    }

    setIsSendingPasswordReset(true);
    setPasswordExpiryError("");
    setPasswordExpiryStatus("");

    const result = await requestTenantPasswordReset({
      subdomain: normalizedSubdomain,
      email: normalizedEmail,
    });

    if (!isMountedRef.current) {
      return;
    }

    setIsSendingPasswordReset(false);

    if (!result.success) {
      setPasswordExpiryError(result.message);
      return;
    }

    setPasswordResetLinkSent(true);
    setPasswordExpiryStatus(result.message);
  }

  return (
    <AuthExperienceShell
      stageTitle={SIGN_IN_STORY_CONTENT[stage].title}
      stageDescription={SIGN_IN_STORY_CONTENT[stage].description}
      stageFooter={SIGN_IN_STORY_CONTENT[stage].footer}
      // stepperLabel={stage === "verify" ? "STEP 1 OF 3" : undefined}
      // stepperPhase={stage === "verify" ? 1 : undefined}
      compact
    >
      {stage === "organization" ? (
        <OrganizationStage
          subdomain={subdomain}
          error={orgError}
          isSubmitting={isFindingOrganization}
          onSubdomainChange={(value) => {
            setSubdomain(value);
            setOrgError("");
            setStatusMessage("");
          }}
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
          onEmailChange={(value) => {
            setEmail(value);
            setCredentialError("");
            setStatusMessage("");
          }}
          onPasswordChange={(value) => {
            setPassword(value);
            setCredentialError("");
            setStatusMessage("");
          }}
          onRememberMeChange={setRememberMe}
          onBack={() => {
            setCredentialError("");
            setStatusMessage("");
            transitionToStage("organization");
          }}
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
          onBack={() => {
            setVerifyError("");
            setStatusMessage("");
            setVerificationCode("");
            transitionToStage("credentials");
          }}
          onChange={handleCodeChange}
          onValueChange={handleCodeValueChange}
          onResend={handleResendCode}
          onSubmit={handleVerificationSubmit}
        />
      ) : null}

      {stage === "password-expired" ? (
        <PasswordExpiredStage
          email={normalizedEmail}
          error={passwordExpiryError}
          statusMessage={passwordExpiryStatus}
          isSubmitting={isSendingPasswordReset}
          resetLinkSent={passwordResetLinkSent}
          onBack={() => transitionToStage("credentials")}
          onSendResetLink={handleSendPasswordReset}
        />
      ) : null}
    </AuthExperienceShell>
  );
}
