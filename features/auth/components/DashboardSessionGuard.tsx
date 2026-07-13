"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  getValidOnboardingAccessToken,
  redirectToTenantSignIn,
} from "@/lib/auth/tenant-session";

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
      const currentRoute = buildCurrentRoute(pathname, searchParams);
      const accessToken = await getValidOnboardingAccessToken();

      if (!accessToken) {
        redirectToTenantSignIn(currentRoute);
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-6 text-center text-sm text-slate-600">
        Verifying your session...
      </div>
    );
  }

  return <>{children}</>;
}
