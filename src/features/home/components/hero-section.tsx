"use client";

/**
 * HeroSection: Editorial Minimal (DESIGN.md v2)
 * Single file: component + styles (HERO_CSS, injected via <style>). Tokens and fonts come from globals.css / layout.tsx.
 * Motion tier L1: the headline rises and the drawing draws itself once, then everything stays still.
 * No pointer effects, no timers, no auto-rotation.
 */

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { Icon } from "./icon";

/* ────────────────────────────────────────────────────────────────────────────
 * CONTENT: edit copy here.
 * ──────────────────────────────────────────────────────────────────────────── */
const CONTENT = {
  meta: { left: "Laboratory glassware & scientific supplies", right: "Catalogue 2026" },
  headline: { plain: "Precision, supplied", italic: "by the case." },
  lead:
    "Glassware, filtration, plasticware, instruments and certified reagents for labs that order in volume. Search by name or catalogue number, request a bulk quote, ship anywhere in India.",
  search: { action: "/products", placeholder: "Product or catalogue no." },
  links: [
    { label: "Browse the catalogue", href: "/products" },
    { label: "Request a bulk quote", href: "#business" },
  ],
  trust: ["Verified products", "Technical documentation", "Pan-India delivery"],
  figure: "Fig. 1 — Measuring cylinder, conical flask, low-form beaker",
  categories: [
    { label: "Glassware", href: "/products?category=glassware" },
    { label: "Filtration", href: "/products?category=filtration" },
    { label: "Plasticware", href: "/products?category=plasticware" },
    { label: "Instruments", href: "/products?category=instruments" },
    { label: "Chemicals & reagents", href: "/products?category=chemicals" },
    { label: "Consumables", href: "/products?category=consumables" },
  ],
};

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

/* ────────────────────────────────────────────────────────────────────────────
 * Still life: three vessels on one baseline, drawn in hairline ink.
 * Drawn on a 480×500 canvas, baseline y = 470; the viewBox crops the empty top.
 * ──────────────────────────────────────────────────────────────────────────── */
const flaskWall = (y: number) => 214 - (y - 240) * (58 / 206); // left wall x of the conical body at height y

function StillLife() {
  const flaskMarks = [
    { y: 300, v: 200 },
    { y: 340, v: 150 },
    { y: 380, v: 100 },
    { y: 420, v: 50 },
  ];
  const cylTicks = Array.from({ length: 23 }, (_, i) => 426 - i * 14);

  return (
    <svg viewBox="0 64 480 416" className="lx-svg" role="img" aria-labelledby="lx-fig-title">
      <title id="lx-fig-title">Line drawing of a measuring cylinder, a conical flask and a low-form beaker</title>
      <defs>
        <clipPath id="lx-clip-cyl"><path d="M84 92 V438 H124 V92 Z" /></clipPath>
        <clipPath id="lx-clip-flask"><path d="M216 124 V240 L158 446 Q154 468 176 468 H284 Q306 468 302 446 L244 240 V124 Z" /></clipPath>
        <clipPath id="lx-clip-beaker"><path d="M338 362 V456 Q338 468 350 468 H426 Q438 468 438 456 V358 Z" /></clipPath>
      </defs>

      {/* Liquid: the faintest wash, fades in after the outlines */}
      <g className="lx-late lx-liquid" style={{ "--d": "2100ms" } as CSSVars}>
        <rect x={60} y={210} width={80} height={240} clipPath="url(#lx-clip-cyl)" />
        <rect x={140} y={360} width={180} height={120} clipPath="url(#lx-clip-flask)" />
        <rect x={330} y={420} width={120} height={60} clipPath="url(#lx-clip-beaker)" />
      </g>

      {/* Outlines draw once, in sequence */}
      <g className="lx-glass">
        <path className="lx-draw" pathLength={1} style={{ "--i": 0 } as CSSVars} d="M70 78 Q80 80 82 92 V440 H126 V90 Q126 82 134 78" />
        <path className="lx-draw" pathLength={1} style={{ "--i": 0.5 } as CSSVars} d="M58 440 H150 L158 470 H50 Z" />
        <path className="lx-draw" pathLength={1} style={{ "--i": 1 } as CSSVars} d="M210 114 Q214 116 214 124 V240 L156 446 Q151 470 176 470 H284 Q309 470 304 446 L246 240 V124 Q246 116 250 114" />
        <path className="lx-draw" pathLength={1} style={{ "--i": 2 } as CSSVars} d="M326 350 Q334 352 336 362 V456 Q336 470 350 470 H426 Q440 470 440 456 V358 Q441 352 448 350" />
      </g>

      {/* Graduations + meniscus lines */}
      <g className="lx-late" style={{ "--d": "1900ms" } as CSSVars}>
        <g className="lx-tick">
          {cylTicks.map((y, i) => (
            <line key={y} x1={84} x2={i % 5 === 0 ? 100 : 92} y1={y} y2={y} />
          ))}
          {flaskMarks.map(({ y }) => (
            <line key={y} x1={flaskWall(y) + 10} x2={flaskWall(y) + 24} y1={y} y2={y} />
          ))}
          {[440, 420, 400, 380].map((y, i) => (
            <line key={y} x1={i % 2 ? 428 : 420} x2={438} y1={y} y2={y} />
          ))}
        </g>
        <g className="lx-tick-label">
          {flaskMarks.map(({ y, v }) => (
            <text key={y} x={flaskWall(y) + 28} y={y + 3}>{v}</text>
          ))}
          <text x={230} y={276} textAnchor="middle">250 mL</text>
        </g>
        <g className="lx-meniscus">
          <path d="M84 210 Q104 215 124 210" />
          <path d="M181 360 Q230 366 279 360" />
          <path d="M338 420 Q388 425 438 420" />
        </g>
      </g>

      <line className="lx-base lx-late" style={{ "--d": "300ms" } as CSSVars} x1={20} x2={460} y1={470.5} y2={470.5} />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Hero
 * ──────────────────────────────────────────────────────────────────────────── */
export function HeroSection() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* "/" focuses search while it's on screen. The header defers to [data-primary-search]. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const input = inputRef.current;
      if (!input) return;
      const r = input.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) return;
      e.preventDefault();
      input.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="lx" aria-labelledby="hero-title">
      {/* dangerouslySetInnerHTML so selectors like `>` aren't HTML-escaped during SSR */}
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

      <div className="lx-wrap">
        <div className="lx-meta lx-fade" style={{ "--d": "0ms" } as CSSVars}>
          <span>{CONTENT.meta.left}</span>
          <span className="lx-meta__right">{CONTENT.meta.right}</span>
        </div>

        <div className="lx-grid">
          <div className="lx-copy">
            <h1 id="hero-title" className="lx-h1">
              <span className="lx-line">
                <span style={{ "--i": 0 } as CSSVars}>{CONTENT.headline.plain}</span>
              </span>
              <span className="lx-line">
                <em style={{ "--i": 1 } as CSSVars}>{CONTENT.headline.italic}</em>
              </span>
            </h1>

            <p className="lx-lead lx-fade" style={{ "--d": "520ms" } as CSSVars}>
              {CONTENT.lead}
            </p>

            <form action={CONTENT.search.action} method="GET" role="search" className="lx-search lx-fade" style={{ "--d": "640ms" } as CSSVars}>
              <Icon name="search" className="lx-search__icon" />
              <label htmlFor="hero-q" className="lx-sr">Search products by name or catalogue number</label>
              <input
                ref={inputRef}
                id="hero-q"
                data-primary-search=""
                name="q"
                type="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder={CONTENT.search.placeholder}
                className="lx-search__input"
              />
              <kbd className="lx-kbd" aria-hidden="true">/</kbd>
              <button type="submit" className="lx-submit" aria-label="Search">
                <Icon name="arrow" className="lx-submit__icon" />
              </button>
            </form>

            <div className="lx-links lx-fade" style={{ "--d": "760ms" } as CSSVars}>
              {CONTENT.links.map((l) => (
                <Link key={l.href} href={l.href} className="lx-link">
                  {l.label}
                  <Icon name="arrow" className="lx-link__arrow" />
                </Link>
              ))}
            </div>

            <ul className="lx-trust lx-fade" style={{ "--d": "860ms" } as CSSVars}>
              {CONTENT.trust.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <figure className="lx-figure">
            <StillLife />
            <figcaption className="lx-caption lx-late" style={{ "--d": "2200ms" } as CSSVars}>
              {CONTENT.figure}
            </figcaption>
          </figure>
        </div>

        <nav className="lx-index lx-fade" style={{ "--d": "980ms" } as CSSVars} aria-label="Product categories">
          <ol>
            {CONTENT.categories.map((c, i) => (
              <li key={c.href}>
                <Link href={c.href} className="lx-index__link">
                  <span className="lx-index__n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="lx-index__label">{c.label}</span>
                  <Icon name="arrow" className="lx-index__arrow" />
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Styles (DESIGN.md v2.1). --lab- tokens live in app/globals.css.
 * Layout is plain CSS, not Tailwind, so the component doesn't depend on the Tailwind version.
 * ──────────────────────────────────────────────────────────────────────────── */
const HERO_CSS = /* css */ `
.lx {
  --lab-font-serif: var(--font-lab-serif, "Instrument Serif"), "Iowan Old Style", Georgia, serif;
  --lab-font-display: var(--font-lab-display, "Instrument Sans"), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --lab-font-mono: var(--font-lab-mono, "IBM Plex Mono"), ui-monospace, SFMono-Regular, Menlo, monospace;
  --lx-ease: cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  background: var(--lab-bg);
  color: var(--lab-text);
  font-family: var(--lab-font-display);
}
.lx *, .lx *::before, .lx *::after { box-sizing: border-box; }
.lx-wrap { max-width: 1280px; margin: 0 auto; padding: 48px 16px 0; }
@media (min-width: 640px) { .lx-wrap { padding: 56px 24px 0; } }
@media (min-width: 1024px) { .lx-wrap { padding: 56px 32px 0; } }

/* ---------- Meta row ---------- */
.lx-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--lab-border);
  font: 400 0.75rem/1.5 var(--lab-font-mono);
  letter-spacing: 0.02em;
  color: var(--lab-text-tertiary);
}
.lx-meta__right { display: none; }
@media (min-width: 640px) { .lx-meta__right { display: inline; } }

/* ---------- Grid ---------- */
.lx-grid { display: grid; gap: 48px; padding: 48px 0 56px; }
@media (min-width: 1024px) {
  .lx-grid { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 64px; align-items: end; padding: 56px 0 64px; }
}

/* ---------- Headline ---------- */
.lx-h1 {
  margin: 0;
  font-family: var(--lab-font-serif);
  font-weight: 400;
  font-size: clamp(3.25rem, 1.2rem + 6.4vw, 7.25rem);
  line-height: 0.94;
  letter-spacing: -0.025em;
  color: var(--lab-text);
}
.lx-h1 em { font-style: italic; letter-spacing: -0.02em; }
.lx-line { display: block; overflow: clip; padding: 0 0.08em 0.06em 0; margin-bottom: -0.06em; }
.lx-line > * {
  display: inline-block;
  transform: translateY(102%);
  animation: lx-rise 1.1s var(--lx-ease) forwards;
  animation-delay: calc(var(--i, 0) * 140ms + 120ms);
}
@keyframes lx-rise { to { transform: none; } }

.lx-lead {
  max-width: 34rem;
  margin: 32px 0 0;
  font-size: clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem);
  line-height: 1.65;
  color: var(--lab-text-secondary);
  text-wrap: pretty;
}

/* ---------- Search ---------- */
.lx-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 36rem;
  height: 60px;
  margin-top: 36px;
  padding: 0 6px 0 20px;
  border: 1px solid var(--lab-border);
  border-radius: 999px;
  background: var(--lab-surface);
  transition: border-color 0.25s, box-shadow 0.25s;
}
.lx-search:hover { border-color: var(--lab-border-hover); }
.lx-search:focus-within { border-color: var(--lab-text); box-shadow: 0 0 0 4px rgba(var(--lab-text-rgb), 0.06); }
.lx-search__icon { width: 18px; height: 18px; flex-shrink: 0; color: var(--lab-text-tertiary); }
.lx-search__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--lab-text);
  font: 400 1rem var(--lab-font-display);
}
.lx-search__input::placeholder { color: var(--lab-text-tertiary); opacity: 1; }
.lx-search__input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
.lx-kbd {
  display: none;
  font: 400 0.6875rem/1 var(--lab-font-mono);
  padding: 0.3rem 0.45rem;
  border: 1px solid var(--lab-border);
  border-radius: 6px;
  color: var(--lab-text-tertiary);
}
@media (min-width: 640px) and (hover: hover) { .lx-kbd { display: inline-block; } }
.lx-submit {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: var(--lab-text);
  color: var(--lab-text-inverse);
  cursor: pointer;
  transition: background-color 0.25s, transform 0.2s var(--lab-ease-out);
}
.lx-submit:hover { background: var(--lab-accent); }
.lx-submit:active { background: var(--lab-accent-active); transform: scale(0.96); }
.lx-submit:focus-visible { outline: 2px solid var(--lab-accent); outline-offset: 3px; }
.lx-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.lx-submit__icon { width: 18px; height: 18px; transition: transform 0.3s var(--lab-ease-out); }
.lx-submit:hover .lx-submit__icon { transform: translateX(2px); }

/* ---------- Secondary links ---------- */
.lx-links { display: flex; flex-wrap: wrap; gap: 4px 32px; margin-top: 20px; }
.lx-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  color: var(--lab-text);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  background: linear-gradient(currentColor, currentColor) 0 calc(100% - 10px) / 100% 1px no-repeat;
  transition: background-size 0.35s var(--lx-ease), color 0.2s;
}
.lx-link:hover { color: var(--lab-accent); background-size: 0 1px; background-position: 100% calc(100% - 10px); }
.lx-link:active { opacity: 0.7; }
.lx-link:focus-visible { outline: 2px solid var(--lab-accent); outline-offset: 4px; border-radius: 2px; }
.lx-link__arrow { width: 15px; height: 15px; transition: transform 0.3s var(--lx-ease); }
.lx-link:hover .lx-link__arrow { transform: translateX(3px); }

/* ---------- Trust line ---------- */
.lx-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
  font: 400 0.75rem/1.5 var(--lab-font-mono);
  letter-spacing: 0.02em;
  color: var(--lab-text-tertiary);
}
.lx-trust li { white-space: nowrap; }
.lx-trust li:not(:last-child)::after { content: "·"; margin: 0 0.75em; }

/* ---------- Figure ---------- */
.lx-figure { margin: 0; justify-self: center; width: 100%; max-width: 320px; }
@media (min-width: 640px) { .lx-figure { max-width: 400px; } }
@media (min-width: 1024px) { .lx-figure { max-width: 480px; justify-self: end; } }
.lx-svg { display: block; width: 100%; height: auto; overflow: visible; }
.lx-glass path { fill: none; stroke: var(--lab-text); stroke-width: 1.25; stroke-linecap: round; stroke-linejoin: round; }
.lx-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: lx-stroke 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  animation-delay: calc(var(--i, 0) * 200ms + 450ms);
}
@keyframes lx-stroke { to { stroke-dashoffset: 0; } }
.lx-tick line { stroke: var(--lab-text); stroke-width: 1; opacity: 0.55; }
.lx-tick-label text { fill: var(--lab-text-tertiary); font: 400 9.5px var(--lab-font-mono); }
.lx-meniscus path { fill: none; stroke: var(--lab-accent); stroke-width: 1.25; }
.lx-liquid rect { fill: rgba(var(--lab-accent-rgb), 0.07); }
.lx-base { stroke: var(--lab-border-hover); stroke-width: 1; }
.lx-late { opacity: 0; animation: lx-fade 0.9s ease forwards; animation-delay: var(--d, 0ms); }
.lx-caption {
  margin-top: 14px;
  font: 400 0.75rem/1.5 var(--lab-font-mono);
  letter-spacing: 0.02em;
  color: var(--lab-text-tertiary);
  text-align: center;
}
@media (min-width: 1024px) { .lx-caption { text-align: left; padding-left: 4%; } }

/* ---------- Catalogue index ---------- */
.lx-index { border-top: 1px solid var(--lab-border); }
.lx-index ol {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 640px) { .lx-index ol { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .lx-index ol { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
.lx-index li { border-bottom: 1px solid var(--lab-border); }
@media (min-width: 1024px) {
  .lx-index li { border-bottom: 0; }
  .lx-index li + li { border-left: 1px solid var(--lab-border); }
}
.lx-index__link {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
  min-height: 56px;
  padding: 18px 12px 18px 0;
  color: var(--lab-text);
  text-decoration: none;
  transition: color 0.2s;
}
@media (min-width: 1024px) { .lx-index li + li .lx-index__link { padding-left: 16px; } }
.lx-index__n { font: 400 0.6875rem/1 var(--lab-font-mono); color: var(--lab-text-tertiary); }
.lx-index__label { font-size: 0.9375rem; font-weight: 500; transition: transform 0.35s var(--lx-ease); }
.lx-index__arrow { width: 14px; height: 14px; margin-left: auto; align-self: center; opacity: 0; transform: translateX(-4px); transition: opacity 0.25s, transform 0.35s var(--lx-ease); }
.lx-index__link:hover { color: var(--lab-accent); }
.lx-index__link:hover .lx-index__label { transform: translateX(4px); }
.lx-index__link:hover .lx-index__arrow { opacity: 1; transform: none; }
.lx-index__link:active { opacity: 0.7; }
.lx-index__link:focus-visible { outline: 2px solid var(--lab-accent); outline-offset: -2px; border-radius: 2px; }

/* ---------- Shared ---------- */
.lx-fade { opacity: 0; animation: lx-fade 0.9s ease forwards; animation-delay: var(--d, 0ms); }
@keyframes lx-fade { to { opacity: 1; } }
.lx-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@media (prefers-reduced-motion: reduce) {
  .lx-line > *, .lx-fade, .lx-late, .lx-draw {
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
    stroke-dashoffset: 0 !important;
  }
  .lx *, .lx *::before, .lx *::after { transition-duration: 0s !important; }
}
`;