"use client";

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
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          An unexpected error occurred while loading this page.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
