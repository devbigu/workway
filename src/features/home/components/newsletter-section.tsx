import Link from "next/link";
import { Reveal } from "../animation/reveal";
import { Icon } from "./icon";

export function NewsletterSection() {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[38px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 sm:p-10 lg:p-14">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-300/25 blur-3xl" />
            <div className="relative grid items-center gap-9 lg:grid-cols-[1fr_.9fr]"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Catalogue updates</p><h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-5xl">Stay updated with new products and catalogues.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Receive product launches, category updates, and technical catalogue announcements.</p></div><div><form action="/contact" method="GET" className="flex flex-col gap-2 rounded-[24px] border border-slate-200 bg-white p-2 shadow-lg sm:flex-row"><label className="min-w-0 flex-1"><span className="sr-only">Email address</span><input name="email" type="email" required placeholder="Enter your business email" className="h-12 w-full min-w-0 bg-transparent px-4 text-sm outline-none placeholder:text-slate-400" /></label><button type="submit" className="ww-button-pop rounded-[18px] bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">Subscribe</button></form><Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-blue-700"><Icon name="download" className="h-4 w-4" />Download latest catalogue</Link></div></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}


