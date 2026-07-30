"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getValidOnboardingAccessToken,
  readAuthenticatedRoute,
} from "@/lib/auth/tenant-session";

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

      if (accessToken) {
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-6 text-center text-sm text-slate-600">
        Checking your session...
      </div>
    );
  }

  return <>{children}</>;
}
