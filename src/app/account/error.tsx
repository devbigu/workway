"use client";

export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-black">We couldn’t load your account</h2>
      <p className="mt-2 text-sm text-slate-500">Your account data is safe. Try loading this page again.</p>
      <button type="button" onClick={reset} className="mt-5 min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white">Try again</button>
    </div>
  );
}
