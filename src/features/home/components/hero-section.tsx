"use client";

import Link from "next/link";
import { useEffect, useRef, type PointerEvent } from "react";
import { Icon } from "./icon";

export function HeroSection() {
  const visualRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0, r: 0 });
  const currentRef = useRef({ x: 0, y: 0, r: 0 });

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function scheduleParallax() {
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(function run() {
      const node = visualRef.current;
      if (!node) return;
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.r += (target.r - current.r) * 0.12;
      node.style.setProperty("--parallax-x", `${current.x.toFixed(2)}px`);
      node.style.setProperty("--parallax-y", `${current.y.toFixed(2)}px`);
      node.style.setProperty("--parallax-rotate", `${current.r.toFixed(3)}deg`);
      if (Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05 || Math.abs(target.r - current.r) > 0.01) frameRef.current = requestAnimationFrame(run);
      else frameRef.current = null;
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - bounds.left) / bounds.width - 0.5;
    const ny = (event.clientY - bounds.top) / bounds.height - 0.5;
    targetRef.current = { x: nx * 14, y: ny * 12, r: nx * 1.2 };
    scheduleParallax();
  }

  function handlePointerLeave() {
    targetRef.current = { x: 0, y: 0, r: 0 };
    scheduleParallax();
  }

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="ww-pulse-soft absolute -left-32 top-20 -z-10 h-96 w-96 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="ww-pulse-soft absolute -right-32 top-8 -z-10 h-[30rem] w-[30rem] rounded-full bg-cyan-300/25 blur-3xl [animation-delay:1.5s]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.09)_1px,transparent_0)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="mx-auto grid max-w-[1380px] items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:px-8">
        <div>
          <div className="ww-hero-step inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-700 shadow-sm backdrop-blur" style={{ "--hero-delay": "40ms" } as React.CSSProperties}><Icon name="sparkles" className="h-4 w-4" />Scientific commerce, simplified</div>
          <h1 className="mt-7 max-w-4xl text-balance text-[clamp(3.4rem,7vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.075em] text-slate-950">
            <span className="ww-hero-step block" style={{ "--hero-delay": "120ms" } as React.CSSProperties}>Scientific supplies.</span>
            <span className="ww-hero-step mt-2 block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 bg-clip-text text-transparent" style={{ "--hero-delay": "200ms" } as React.CSSProperties}>Built for discovery.</span>
          </h1>
          <p className="ww-hero-step mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg" style={{ "--hero-delay": "280ms" } as React.CSSProperties}>Source laboratory equipment, consumables, glassware, filters, and certified scientific products from one reliable B2B platform.</p>
          <div className="ww-hero-step mt-8 flex flex-col gap-3 sm:flex-row" style={{ "--hero-delay": "360ms" } as React.CSSProperties}>
            <Link href="/products" className="ww-button-pop inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Explore Products <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
            <a href="#business" className="ww-button-pop inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:border-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Request Bulk Quote</a>
          </div>
          <form action="/search" method="GET" className="ww-hero-step mt-9 flex max-w-2xl flex-col gap-2 rounded-[24px] border border-white bg-white/90 p-2 shadow-[0_22px_65px_rgba(37,99,235,0.13)] backdrop-blur sm:flex-row" style={{ "--hero-delay": "440ms" } as React.CSSProperties}>
            <label className="flex min-w-0 flex-1 items-center gap-3 px-3"><span className="sr-only">Search products</span><Icon name="search" className="h-5 w-5 shrink-0 text-slate-400" /><input name="q" type="search" placeholder="Search by product name or catalogue number" className="h-12 min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400" /></label>
            <button type="submit" className="ww-button-pop rounded-[18px] bg-slate-950 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Search</button>
          </form>
          <div className="ww-hero-step mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600" style={{ "--hero-delay": "520ms" } as React.CSSProperties}>
            {["Verified products", "Technical documentation", "Pan-India delivery"].map((item) => <span key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="check" className="h-3.5 w-3.5" /></span>{item}</span>)}
          </div>
        </div>
        <div ref={visualRef} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} className="ww-hero-step relative mx-auto w-full max-w-2xl lg:mx-0" style={{ "--hero-delay": "600ms" } as React.CSSProperties}>
          <div className="absolute -inset-8 -z-10 rounded-[54px] bg-gradient-to-br from-blue-400/20 via-cyan-300/20 to-violet-300/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[42px] border border-white/80 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-5 shadow-[0_45px_110px_rgba(15,23,42,0.28)] sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="relative flex items-center justify-between text-white"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Featured collection</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Precision Essentials</h2></div><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">2026 Catalogue</span></div>
            <div className="relative mt-7 grid min-h-[360px] place-items-center overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:min-h-[430px]">
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-2xl" />
              <div className="ww-float-soft relative flex items-end gap-5"><div className="relative h-48 w-28 rounded-b-[42px] rounded-t-[18px] border border-white/50 bg-gradient-to-b from-white/80 to-cyan-100/50 shadow-2xl backdrop-blur sm:h-60 sm:w-36"><div className="absolute left-1/2 top-0 h-10 w-14 -translate-x-1/2 -translate-y-7 rounded-t-xl border border-white/60 bg-cyan-100/70" /><div className="absolute inset-x-4 bottom-5 rounded-2xl bg-blue-600/90 p-3 text-center text-white shadow-lg"><p className="text-[10px] font-bold uppercase tracking-[0.2em]">Workway</p><p className="mt-1 text-xs">Certified Reagent</p></div></div><div className="relative h-40 w-32 sm:h-52 sm:w-40"><div className="absolute bottom-0 left-1/2 h-36 w-32 -translate-x-1/2 rounded-b-[52px] border border-white/60 bg-gradient-to-t from-blue-300/60 to-white/75 shadow-2xl sm:h-44 sm:w-40" /><div className="absolute left-1/2 top-0 h-20 w-12 -translate-x-1/2 rounded-t-xl border-x border-white/60 bg-white/65" /><div className="absolute bottom-16 left-1/2 h-px w-24 -translate-x-1/2 bg-blue-700/30" /></div></div>
              <div className="ww-float-soft absolute left-4 top-5 rounded-2xl border border-white/20 bg-white/15 p-3 text-white shadow-xl backdrop-blur-xl [animation-delay:1s] sm:left-6 sm:top-8"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-400/20 text-emerald-300"><Icon name="shield" className="h-4 w-4" /></span><div><p className="text-[10px] text-blue-100">Quality status</p><p className="text-xs font-semibold">Certified</p></div></div></div>
              <div className="ww-float-soft absolute bottom-5 right-4 rounded-2xl border border-white/20 bg-slate-950/45 p-4 text-white shadow-xl backdrop-blur-xl [animation-delay:2s] sm:bottom-7 sm:right-6"><p className="text-[10px] uppercase tracking-[0.16em] text-blue-200">Orders dispatched</p><p className="mt-1 text-2xl font-bold tracking-[-0.04em]">1,248</p><p className="mt-1 text-[10px] text-emerald-300">+18.4% this month</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


