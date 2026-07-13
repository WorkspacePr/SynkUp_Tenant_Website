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
  if (args.resume === "onboarding") {
    return "/onboarding";
  }

  const onboardingStatus = args.onboardingStatus?.trim().toLowerCase() ?? "";
  const onboardingCurrentStep =
    args.onboardingCurrentStep?.trim().toLowerCase() ?? "";
  const hasDashboardRedirect =
    args.redirectTarget?.trim().startsWith("/dashboard") ?? false;
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

  if (!isOnboardingCompleted) {
    return "/onboarding";
  }

  if (
    args.redirectTarget?.trim() &&
    !args.redirectTarget.startsWith("/dashboard")
  ) {
    return args.redirectTarget;
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

  if (args.redirectTarget?.trim()) {
    return args.redirectTarget;
  }

  return args.searchRedirectTo || "/dashboard";
}
