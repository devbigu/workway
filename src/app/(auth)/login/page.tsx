import { Suspense } from "react";

import { AuthForm } from "@/features/auth/components/auth-form";

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen animate-pulse bg-[#f6f9fd]" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
