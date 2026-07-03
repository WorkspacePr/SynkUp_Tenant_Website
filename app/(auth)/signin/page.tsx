import { Suspense } from "react";

import { SignInFlow } from "@/features/auth/components/SignInFlow";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInFlow />
    </Suspense>
  );
}
