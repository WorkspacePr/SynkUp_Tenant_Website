import { Suspense } from "react";

import { SignInFlow } from "@/features/auth/components/sign-in/SignInFlow";
import { SignInSessionGuard } from "@/features/auth/components/session/SignInSessionGuard";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInSessionGuard>
        <SignInFlow />
      </SignInSessionGuard>
    </Suspense>
  );
}
