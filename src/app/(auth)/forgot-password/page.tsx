import Link from "next/link";

export default function Page() {
  return (
    <main className="page-wrap py-12 lg:py-16">
      <div className="mx-auto max-w-[26rem]">
        <h1 className="page-title">Reset your password</h1>
        <p className="mt-3 text-ink-2">Password reset by email isn’t available yet. Contact us and we’ll help you back into your account.</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/contact" className="btn btn-primary">Contact us</Link>
          <Link href="/login" className="link text-sm">Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}
