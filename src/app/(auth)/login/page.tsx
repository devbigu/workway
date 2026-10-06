import { Suspense } from "react";

import { AuthForm } from "@/features/auth/components/auth-form";

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-[70vh]" aria-busy="true" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
