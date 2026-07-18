import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-[#f8fbff] px-4 py-16 text-slate-950">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The page you are looking for is unavailable or has moved.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
