import Link from "next/link";

import { Icon } from "@/features/home/components/icon";

export default function NotFound() {
  return (
    <main className="page-wrap grid min-h-[70vh] place-items-center py-16">
      <div className="grid max-w-[36rem] justify-items-center text-center">
        <p className="meta">Error 404</p>
        <h1 className="page-title mt-4">This page isn’t in the <em>catalogue</em>.</h1>
        <p className="mt-4 text-ink-2">It may have moved, or the link may be mistyped. Search for what you need instead.</p>
        <form action="/products" method="GET" role="search" className="mt-8 flex h-14 w-full items-center gap-3 rounded-full border border-line-strong bg-surface pl-5 pr-1.5 focus-within:border-ink">
          <Icon name="search" className="h-4 w-4 shrink-0 text-ink-3" />
          <label htmlFor="not-found-q" className="sr-only">Search products by name or catalogue number</label>
          <input id="not-found-q" name="q" type="search" placeholder="Product or catalogue no." className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3" />
          <button type="submit" className="btn btn-primary min-h-11 w-11 px-0" aria-label="Search"><Icon name="arrow" className="h-4 w-4" /></button>
        </form>
        <p className="mt-6 flex gap-6 text-sm">
          <Link href="/products" className="link">Products</Link>
          <Link href="/" className="link">Home</Link>
        </p>
      </div>
    </main>
  );
}
