import { Suspense } from "react";

import { ResetPasswordFlow } from "@/features/auth/components/ResetPasswordFlow";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFlow />
    </Suspense>
  );
}
