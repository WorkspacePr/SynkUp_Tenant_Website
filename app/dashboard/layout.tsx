import { Suspense } from "react";

import { DashboardSessionGuard } from "@/features/auth/components/session/DashboardSessionGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
          Verifying your session...
        </div>
      }
    >
      <DashboardSessionGuard>{children}</DashboardSessionGuard>
    </Suspense>
  );
}
