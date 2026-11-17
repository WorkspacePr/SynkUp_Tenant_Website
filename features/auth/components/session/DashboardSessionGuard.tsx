"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  getValidOnboardingAccessToken,
  readTenantLoginContext,
  redirectToTenantSignIn,
} from "@/lib/auth/tenant-session";
import {
  canAccessDashboardSection,
  getDashboardSection,
  getEffectiveDashboardRole,
  getAllowedDashboardPath,
  getRequestedDashboardRole,
} from "@/lib/auth/rbac";

function buildCurrentRoute(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function DashboardSessionGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      if (isMounted) {
        setIsAuthorized(false);
      }

      const currentRoute = buildCurrentRoute(pathname, searchParams);
      const accessToken = await getValidOnboardingAccessToken();

      if (!accessToken) {
        redirectToTenantSignIn(currentRoute);
        return;
      }

      const authenticatedRole = getEffectiveDashboardRole(readTenantLoginContext());
      if (!authenticatedRole) {
        redirectToTenantSignIn(currentRoute);
        return;
      }

      const activeRole = getRequestedDashboardRole(
        authenticatedRole,
        searchParams.get("view"),
      );

      if (!canAccessDashboardSection(activeRole, getDashboardSection(pathname))) {
        const allowedPath = getAllowedDashboardPath(activeRole);
        window.location.replace(`${allowedPath}?view=${activeRole}`);
        return;
      }

      if (isMounted) {
        setIsAuthorized(true);
      }
    };

    void verifySession();

    const handleFocus = () => {
      void verifySession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void verifySession();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, searchParams]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
        Verifying your session...
      </div>
    );
  }

  return <>{children}</>;
}
