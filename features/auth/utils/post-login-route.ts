function isSafeInternalRoute(route: string | null | undefined) {
  if (!route?.trim()) {
    return false;
  }

  const trimmed = route.trim();
  return (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("://")
  );
}

function cleanInternalRoute(route: string | null | undefined) {
  return isSafeInternalRoute(route) ? route?.trim() ?? null : null;
}

export function resolvePostLoginRoute(args: {
  dashboardRole?: "super" | "unit" | "audience" | null;
  unitScope?: number[];
  audienceScope?: number[];
  onboardingStatus?: string | null;
  onboardingCurrentStep?: string | null;
  onboardingLaunched?: boolean | null;
  redirectTarget?: string | null;
  searchRedirectTo?: string | null;
  resume?: string | null;
}) {
  const redirectTarget = cleanInternalRoute(args.redirectTarget);
  const searchRedirectTo = cleanInternalRoute(args.searchRedirectTo);
  const onboardingStatus = args.onboardingStatus?.trim().toLowerCase() ?? "";
  const onboardingCurrentStep =
    args.onboardingCurrentStep?.trim().toLowerCase() ?? "";
  const hasDashboardRedirect =
    redirectTarget?.startsWith("/dashboard") ?? false;
  const isOnboardingCompleted =
    onboardingStatus === "completed" ||
    onboardingStatus === "complete" ||
    onboardingStatus === "launched" ||
    onboardingStatus.includes("complete") ||
    onboardingStatus.includes("launch") ||
    onboardingCurrentStep === "complete" ||
    onboardingCurrentStep === "completed" ||
    args.onboardingLaunched === true ||
    hasDashboardRedirect;

  if (args.dashboardRole === "super" && !isOnboardingCompleted) {
    return "/onboarding";
  }

  if (
    redirectTarget &&
    !redirectTarget.startsWith("/dashboard") &&
    !redirectTarget.startsWith("/onboarding")
  ) {
    return redirectTarget;
  }

  const params = new URLSearchParams();

  if (args.dashboardRole) {
    params.set("role", args.dashboardRole);
  }

  if (args.dashboardRole === "unit" && args.unitScope?.[0]) {
    params.set("unitId", String(args.unitScope[0]));
  }

  if (args.dashboardRole === "audience" && args.audienceScope?.[0]) {
    params.set("audienceId", String(args.audienceScope[0]));
  }

  const query = params.toString();
  if (query) {
    return `/dashboard?${query}`;
  }

  if (redirectTarget) {
    return redirectTarget;
  }

  return searchRedirectTo?.startsWith("/onboarding")
    ? "/dashboard"
    : searchRedirectTo || "/dashboard";
}
