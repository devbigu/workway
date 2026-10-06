"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-wrap grid min-h-[60vh] place-items-center py-16">
      <div className="grid max-w-[36rem] justify-items-center text-center">
        <p className="meta">Error 500</p>
        <h1 className="page-title mt-4">Something went wrong on our side.</h1>
        <p className="mt-4 text-ink-2">The page did not load. Try again, or contact us if it keeps happening.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/contact" className="link text-sm">Contact us</Link>
        </div>
      </div>
    </main>
  );
}
