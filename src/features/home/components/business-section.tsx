"use client";

import type { CSSProperties, PointerEvent } from "react";
import Link from "next/link";
import { businessFeatures } from "../data";
import { StaggerGroup } from "../animation/stagger-group";
import { Reveal } from "../animation/reveal";
import { Icon } from "./icon";

function handleBusinessPointerMove(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType === "touch") return;
  const container = event.currentTarget;
  const bounds = container.getBoundingClientRect();
  container.style.setProperty("--cursor-x", `${event.clientX - bounds.left}px`);
  container.style.setProperty("--cursor-y", `${event.clientY - bounds.top}px`);
  container.style.setProperty("--cursor-glow-opacity", "1");
}

function handleBusinessPointerEnter(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "touch") event.currentTarget.style.setProperty("--cursor-glow-opacity", "1");
}

function handleBusinessPointerLeave(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.setProperty("--cursor-glow-opacity", "0");
}

export function BusinessSection() {
  return (
    <section id="business" className="scroll-mt-28 py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div onPointerMove={handleBusinessPointerMove} onPointerEnter={handleBusinessPointerEnter} onPointerLeave={handleBusinessPointerLeave} style={{ "--cursor-x": "50%", "--cursor-y": "50%", "--cursor-glow-opacity": "0" } as CSSProperties} className="relative isolate overflow-hidden rounded-[38px] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-6 text-white shadow-[0_40px_100px_rgba(29,78,216,0.2)] sm:p-10 lg:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 ease-out" style={{ opacity: "var(--cursor-glow-opacity)", background: "radial-gradient(145px circle at var(--cursor-x) var(--cursor-y), rgba(255,255,255,.46) 0%, rgba(165,243,252,.27) 24%, rgba(59,130,246,.13) 48%, transparent 74%)" }} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ease-out" style={{ opacity: "var(--cursor-glow-opacity)", background: "radial-gradient(430px circle at var(--cursor-x) var(--cursor-y), rgba(34,211,238,.15), rgba(96,165,250,.08) 38%, transparent 72%)", filter: "blur(12px)" }} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 mix-blend-screen transition-opacity duration-200 ease-out" style={{ opacity: "var(--cursor-glow-opacity)", background: "radial-gradient(54px circle at var(--cursor-x) var(--cursor-y), rgba(255,255,255,.3), transparent 78%)" }} />
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 z-0 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 z-0 h-96 w-96 rounded-full bg-violet-400/15 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 rounded-[38px] ring-1 ring-inset ring-white/10" />
            <div className="relative z-10 grid items-start gap-12 lg:grid-cols-[1fr_.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Business purchasing</p>
                <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">Built for laboratories and bulk buyers.</h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">Create a business account for structured quotations, dealer pricing, compliant invoicing, and dedicated order support.</p>
                <StaggerGroup className="mt-8 grid gap-3 sm:grid-cols-2" stagger={70}>
                  {businessFeatures.map((item) => <div key={item} className="flex items-center gap-3 text-sm font-medium text-blue-50"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-cyan-300"><Icon name="check" className="h-4 w-4" /></span>{item}</div>)}
                </StaggerGroup>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/account" className="ww-button-pop rounded-full bg-white px-6 py-3.5 text-center text-sm font-semibold text-blue-800 hover:bg-cyan-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white">Create Business Account</Link><Link href="/contact" className="ww-button-pop rounded-full border border-white/30 px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white">Talk to Sales</Link></div>
              </div>
              <div className="lg:sticky lg:top-32">
                <div className="rounded-[30px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                  <div className="rounded-[24px] bg-white p-5 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:p-6">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Quotation draft</p><h3 className="mt-1 text-xl font-semibold">Institutional Order</h3></div><span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Pending review</span></div>
                    <div className="mt-5 space-y-3">{[["Syringe Filters, Sterile", "10 × ₹2,480"], ["Conical Flasks, 500 ml", "8 × ₹1,320"], ["Magnetic Stirrer", "2 × ₹12,750"]].map(([name, price], index) => <div key={name} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 transition duration-500 hover:bg-blue-50" style={{ transform: `translateY(${index % 2 === 0 ? 0 : 1}px)` }}><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700"><Icon name="flask" className="h-5 w-5" /></span><span className="truncate text-sm font-medium">{name}</span></div><span className="shrink-0 text-sm font-semibold">{price}</span></div>)}</div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5"><span className="text-sm text-slate-500">Estimated total</span><span className="text-2xl font-bold tracking-[-0.04em]">₹60,860</span></div>
                    <Link href="/contact" className="ww-button-pop mt-5 block w-full rounded-full bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Submit enquiry</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
