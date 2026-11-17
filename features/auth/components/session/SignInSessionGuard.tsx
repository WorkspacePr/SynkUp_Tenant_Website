"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getValidOnboardingAccessToken,
  readAuthenticatedRoute,
  readTenantLoginContext,
} from "@/lib/auth/tenant-session";
import { getEffectiveDashboardRole } from "@/lib/auth/rbac";

export function SignInSessionGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const accessToken = await getValidOnboardingAccessToken();

      // A token without its tenant role context cannot enter the dashboard.
      // Leave the sign-in flow available so the user can establish a complete
      // session instead of bouncing between /dashboard and /signin forever.
      if (accessToken && getEffectiveDashboardRole(readTenantLoginContext())) {
        router.replace(readAuthenticatedRoute() || "/dashboard");
        return;
      }

      if (isMounted) {
        setIsCheckingSession(false);
      }
    };

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
