# DESIGN.md: Rootra App Design System (v2.1 · Editorial Minimal)

> A scientific catalogue, not a checkout funnel. Ink on paper, hairlines instead of boxes, one action per region.

**Scope.** Every screen in the app **except** the landing hero (`hero-section.tsx`) and the global header (`global-header.tsx`), which are already built to this system. That includes listing, search, product detail, cart, checkout, order confirmation, account, auth, contact/RFQ, content pages, footer, errors, and every shared component.

**Source of truth.** This file defines the tokens; `app/globals.css` implements them. When code and this file disagree, fix the code. When this file is wrong, update it first.

**Unlisted screens.** If a screen isn't covered in §10, build it from the page shell (§5), the page header pattern (§5.3) and the components in §4. Don't invent new colours, radii or shadows for it.

---

## 1. Visual Theme & Atmosphere

**Style**: Editorial Minimal (Cream Editorial × Swiss restraint)
**Keywords**: warm paper, serif titles, hairline rules, figure captions, catalogue numbers, tabular figures, restraint
**Tone**: Calm, expert, trustworthy. NOT playful, NOT glossy SaaS, NOT a discount marketplace
**Feel**: A well-edited scientific catalogue that also happens to take orders.

**Interaction Tier**: L1 (refined static) across the app. Feedback is immediate and quiet; nothing moves unless the user caused it.
**Dependencies**: CSS only, plus Tailwind (v4 preferred). No animation libraries.

### Five principles
1. **Catalogue first.** Buyers arrive with a catalogue number or a spec. Search, filter and compare beat promotion.
2. **Numbers are data.** Prices, SKUs, quantities and dates are set in mono with tabular figures, so columns line up.
3. **Lines, not boxes.** Group with whitespace and 1px hairlines. Use cards only for things that float or that need a boundary (summaries, dialogs).
4. **One filled button per region.** Everything else is secondary, outline or text.
5. **Serif speaks, sans works.** Serif is for page and section titles only. Every control, label and paragraph is sans.

---

## 2. Color Palette & Roles

### 2.1 Tokens (`app/globals.css`, outside any layer)
```css
:root {
  /* Surfaces */
  --lab-bg: #f5f3ee;              /* warm paper: page background */
  --lab-surface: #fdfcfa;         /* inputs, cards, menus, dialogs */
  --lab-surface-alt: #edeae3;     /* image tiles, hover wash, skeletons */
  --lab-surface-hover: #faf8f4;   /* row hover */
  --lab-surface-press: #e6e2d9;   /* image-tile hover, pressed wash */

  /* Lines */
  --lab-border: #ddd9cf;          /* decorative hairlines and dividers (not for control edges) */
  --lab-border-hover: #b3ad9f;    /* hovered hairline */
  --lab-border-strong: #8a8579;   /* edges of inputs, checkboxes and outline buttons (3.3:1, meets WCAG 1.4.11) */

  /* Text */
  --lab-text: #16191c;            /* ink: 15.9:1 on bg */
  --lab-text-secondary: #4b5056;  /* body: 7.3:1 */
  --lab-text-tertiary: #616468;   /* meta, help, placeholders: 5.4:1 on bg, 4.95:1 on surface-alt */
  --lab-text-inverse: #ffffff;

  /* Accent (deep cobalt): links on hover, focus, selection, progress. Used sparingly. */
  --lab-accent: #2340b0;          /* 7.8:1 */
  --lab-accent-hover: #1c3492;
  --lab-accent-active: #152873;
  --lab-accent-soft: #e8ebf6;     /* selected rows and chips (accent text on it: 7.3:1) */

  /* Status: text colour on its soft background is always ≥ 5:1 */
  --lab-success: #166534;  --lab-success-soft: #e3f1e7;
  --lab-warning: #9a4a0b;  --lab-warning-soft: #f8ecdc;
  --lab-error:   #b42318;  --lab-error-soft:   #f9e6e3;
  --lab-info:    var(--lab-accent); --lab-info-soft: var(--lab-accent-soft);

  /* RGB helpers for rgba() */
  --lab-bg-rgb: 245, 243, 238;
  --lab-text-rgb: 22, 25, 28;
  --lab-accent-rgb: 35, 64, 176;

  /* Elevation (floating layers only, see §6) */
  --lab-shadow-1: 0 1px 2px rgba(var(--lab-text-rgb), 0.06);
  --lab-shadow-2: 0 1px 2px rgba(var(--lab-text-rgb), 0.05), 0 12px 32px -12px rgba(var(--lab-text-rgb), 0.18);
  --lab-shadow-3: 0 2px 4px rgba(var(--lab-text-rgb), 0.06), 0 24px 48px -16px rgba(var(--lab-text-rgb), 0.24);
  --lab-scrim: rgba(var(--lab-text-rgb), 0.38);

  /* Radius */
  --lab-radius-xs: 6px;    /* kbd, thumbnails ≤ 40px, checkboxes */
  --lab-radius-sm: 10px;   /* inputs, selects, textareas, table thumbs */
  --lab-radius-md: 14px;   /* image tiles, cards, alerts */
  --lab-radius-lg: 18px;   /* menus, popovers, dialogs, drawers */
  --lab-radius-pill: 999px;/* buttons, chips, search fields, badges */

  /* Motion */
  --lab-ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --lab-ease-editorial: cubic-bezier(0.16, 1, 0.3, 1);
  --lab-ease-settle: cubic-bezier(0.34, 1.3, 0.64, 1);
  --lab-dur-fast: 150ms;   /* colour/border changes */
  --lab-dur-base: 250ms;   /* menus, toasts, chips */
  --lab-dur-slow: 350ms;   /* drawers, dialogs */

  /* Layering */
  --lab-z-sticky: 40;  --lab-z-header: 50;  --lab-z-dropdown: 60;
  --lab-z-drawer: 70;  --lab-z-modal: 80;   --lab-z-toast: 90;
}
```

> **v2.1 changes vs the shipped hero/header blocks:** `--lab-text-tertiary` is now `#616468` (was `#6b6e72`, which failed AA on `surface-alt`). `--lab-success` is now `#166534` (was `#15803d`, which failed on its soft background). New tokens: `--lab-border-strong`, `--lab-surface-press`, the status soft tokens, radius, motion and z-index. See §11 for removing the duplicated `:root` blocks in those two files.

### 2.2 Tailwind v4 mapping (so utilities use tokens instead of `slate-*`/`blue-*`)
```css
@theme inline {
  --color-paper: var(--lab-bg);
  --color-surface: var(--lab-surface);
  --color-surface-alt: var(--lab-surface-alt);
  --color-surface-hover: var(--lab-surface-hover);
  --color-surface-press: var(--lab-surface-press);
  --color-line: var(--lab-border);
  --color-line-hover: var(--lab-border-hover);
  --color-line-strong: var(--lab-border-strong);
  --color-ink: var(--lab-text);
  --color-ink-2: var(--lab-text-secondary);
  --color-ink-3: var(--lab-text-tertiary);
  --color-inverse: var(--lab-text-inverse);
  --color-accent: var(--lab-accent);
  --color-accent-hover: var(--lab-accent-hover);
  --color-accent-soft: var(--lab-accent-soft);
  --color-success: var(--lab-success);  --color-success-soft: var(--lab-success-soft);
  --color-warning: var(--lab-warning);  --color-warning-soft: var(--lab-warning-soft);
  --color-error: var(--lab-error);      --color-error-soft: var(--lab-error-soft);

  --font-serif: var(--font-lab-serif, "Instrument Serif"), "Iowan Old Style", Georgia, serif;
  --font-sans: var(--font-lab-display, "Instrument Sans"), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: var(--font-lab-mono, "IBM Plex Mono"), ui-monospace, SFMono-Regular, Menlo, monospace;

  --radius-xs: var(--lab-radius-xs);
  --radius-sm: var(--lab-radius-sm);
  --radius-md: var(--lab-radius-md);
  --radius-lg: var(--lab-radius-lg);
}
```
Each font `var()` carries a fallback. A `var()` with no fallback that's undefined invalidates the *whole* `font-family` list, and the text silently falls back to the system font.

This gives you `bg-paper text-ink border-line rounded-md font-serif text-ink-3 bg-success-soft text-success`, and so on.
*Tailwind v3:* put the same mapping under `theme.extend.colors / fontFamily / borderRadius` in `tailwind.config.ts`, using `var(--lab-…)` values.

### 2.3 Status mapping (use exactly these)
| Domain | State | Badge style | Copy |
|---|---|---|---|
| Stock | In stock | success | "In stock" |
| Stock | Low | warning | "Only {n} packs left" |
| Stock | Made to order | neutral | "Ships in {x}–{y} days" |
| Stock | Out of stock | neutral + disabled Add button | "Out of stock" plus a "Notify me" text button |
| Order | Pending payment | warning | "Awaiting payment" |
| Order | Confirmed / Processing | info | "Confirmed" / "Processing" |
| Order | Dispatched | info | "Dispatched" |
| Order | Delivered | success | "Delivered" |
| Order | Cancelled / Failed | error | "Cancelled" / "Payment failed" |
| Quote | Requested / Quoted / Accepted / Expired | neutral / info / success / neutral | same words |

**Color Rules**
- Every colour goes through a token or token-mapped utility. **No hex values, and no `slate-*`, `blue-*`, `gray-*` or `zinc-*` classes.**
- Cobalt fills almost nothing: it's for focus, selection, active filters, progress, link hover and info badges. Filled primary buttons are **ink**.
- Status colour always comes with a word, never colour alone.
- Pages are paper (`bg-paper`). Surfaces (`bg-surface`) are only for things that sit *on* the page: inputs, summary cards, menus, dialogs.

---

## 3. Typography Rules

### 3.1 Loading (once, in `app/layout.tsx`)
```tsx
import { Instrument_Sans, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-lab-display", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-lab-serif", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-lab-mono", display: "swap" });
// <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}> … <body className="bg-paper text-ink font-sans antialiased">
```
CDN equivalent: `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`

### 3.2 Scale
| Token / role | Font | Size | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|---|
| `page-title` (H1) | Serif | clamp(2.5rem, 1.6rem + 3vw, 4rem) | 400 | 1.0 | -0.02em | one per page |
| `section` (H2) | Serif | clamp(1.75rem, 1.3rem + 1.4vw, 2.5rem) | 400 | 1.05 | -0.015em | page sections |
| `subsection` (H3) | Sans | 1.125rem | 600 | 1.3 | -0.01em | card and panel titles, form groups |
| `body-lg` | Sans | 1.125rem | 400 | 1.6 | 0 | page intros |
| `body` | Sans | 1rem | 400 | 1.6 | 0 | default |
| `small` | Sans | 0.875rem | 400 | 1.5 | 0 | secondary text, table cells |
| `label` | Sans | 0.875rem | 500 | 1.3 | 0 | form labels, buttons (0.9375rem) |
| `eyebrow` | Mono | 0.6875rem | 500 | 1.3 | 0.08em, uppercase | table headers, overlines |
| `meta` | Mono | 0.75rem | 400 | 1.5 | 0.02em | captions, SKUs in lists, timestamps |
| `figure` | Mono | 0.875rem | 500 | 1.3 | 0 | prices and quantities in tables, tabular-nums |
| `figure-lg` | Mono | 1.5rem | 500 | 1.1 | -0.01em | PDP price, order totals |

### 3.3 Rules
- **Serif**: H1/H2 only, weight 400, never bold, never uppercase. One *italic* phrase per page at most (an empty-state headline or a confirmation title).
- **Mono + `tabular-nums`**: prices, quantities, SKUs and catalogue numbers, order numbers, dates in tables, counts.
- **Right-align numbers** in tables. Left-align everything else.
- Line length 60–75 characters for prose (`max-w-[68ch]`).
- **NEVER use**: Playfair Display, Inter as display, bold serif, all-caps serif, letter-spaced body text, text gradients, text shadows.

---

## 4. Component Stylings

Component classes live in `app/globals.css` inside **`@layer components`**, so Tailwind utilities can still override them. That is the opposite of the hero/header, whose injected CSS is unlayered (see §11). Every interactive component has **default / hover / active / focus-visible / disabled** states, plus loading and invalid where relevant.

```css
@layer components {
  /* ---------- Focus (global) ---------- */
  :where(a, button, input, select, textarea, [tabindex]):focus-visible {
    outline: 2px solid var(--lab-accent); outline-offset: 2px;
  }
```

### 4.1 Buttons
```css
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
    min-height: 44px; padding: 0 1.25rem; border: 1px solid transparent; border-radius: var(--lab-radius-pill);
    font: 600 .9375rem/1 var(--font-lab-display, "Instrument Sans"), sans-serif; white-space: nowrap; text-decoration: none; cursor: pointer;
    transition: background-color var(--lab-dur-fast), border-color var(--lab-dur-fast), color var(--lab-dur-fast), transform 200ms var(--lab-ease-out);
  }
  .btn:active { transform: translateY(1px) scale(.98); }
  .btn:focus-visible { outline-offset: 3px; }
  .btn:disabled, .btn[aria-disabled="true"] { opacity: .4; cursor: not-allowed; transform: none; }
  .btn[aria-busy="true"] { cursor: progress; }
  .btn-lg { min-height: 52px; padding: 0 1.5rem; font-size: 1rem; }
  .btn-sm { min-height: 36px; padding: 0 .875rem; font-size: .8125rem; } /* dense desktop tables only; never on touch-first screens */
  .btn-block { width: 100%; }

  /* Primary: ink. The one filled button per region. */
  .btn-primary { background: var(--lab-text); color: var(--lab-text-inverse); }
  .btn-primary:hover { background: var(--lab-accent); }
  .btn-primary:active { background: var(--lab-accent-active); }

  /* Secondary: outline */
  .btn-secondary { background: var(--lab-surface); color: var(--lab-text); border-color: var(--lab-border-strong); }
  .btn-secondary:hover { border-color: var(--lab-text); background: var(--lab-surface-hover); }
  .btn-secondary:active { background: var(--lab-surface-alt); }

  /* Text: inline actions ("Remove", "Edit", "Notify me") */
  .btn-text { min-height: 44px; padding: 0 .25rem; background: none; color: var(--lab-text); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; }
  .btn-text:hover { color: var(--lab-accent); text-decoration-color: transparent; }
  .btn-text:active { opacity: .7; }

  /* Destructive: outline by default; filled only inside a confirm dialog */
  .btn-danger { background: var(--lab-surface); color: var(--lab-error); border-color: currentColor; }
  .btn-danger:hover { background: var(--lab-error-soft); }
  .btn-danger-solid { background: var(--lab-error); color: var(--lab-text-inverse); }
  .btn-danger-solid:hover { filter: brightness(.92); }

  /* Icon-only: always has aria-label */
  .btn-icon { width: 44px; min-height: 44px; padding: 0; background: transparent; color: var(--lab-text-secondary); }
  .btn-icon:hover { background: var(--lab-surface-alt); color: var(--lab-text); }
```
- **Loading**: keep the label, add a 14px ring spinner before it, set `aria-busy="true"` and `disabled`, and keep the width fixed (no layout jump).
- **Success feedback** (Add to cart): the label swaps to "Added ✓" for 1.6s, the header badge pops, and the toast confirms (§4.13).
- Labels are verb-first and sentence case: "Add to cart", "Request quote", "Download invoice". No "Click here", no "Submit".

### 4.2 Links
```css
  .link { color: var(--lab-text); font-weight: 500; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: var(--lab-border-hover); transition: color var(--lab-dur-fast), text-decoration-color var(--lab-dur-fast); }
  .link:hover { color: var(--lab-accent); text-decoration-color: currentColor; }
  .link:active { opacity: .7; }
  .link-quiet { text-decoration: none; }            /* nav lists, footers */
  .link-quiet:hover { color: var(--lab-accent); }
  .link-arrow::after { content: "→"; display: inline-block; margin-left: .375em; transition: transform 300ms var(--lab-ease-editorial); }
  .link-arrow:hover::after { transform: translateX(3px); }
```
Body links are always underlined. Underlines are never colour-only.

### 4.3 Form fields
```css
  .field { display: grid; gap: .375rem; }
  .field-label { font: 500 .875rem/1.3 var(--font-lab-display, "Instrument Sans"), sans-serif; color: var(--lab-text); }
  .field-optional { font-weight: 400; color: var(--lab-text-tertiary); } /* "(optional)" — mark optional fields, not required ones */
  .field-help { font-size: .8125rem; line-height: 1.45; color: var(--lab-text-tertiary); }
  .field-error { display: flex; gap: .375rem; font-size: .8125rem; line-height: 1.45; color: var(--lab-error); }

  .input, .select, .textarea {
    width: 100%; min-height: 48px; padding: 0 .875rem;
    background: var(--lab-surface); color: var(--lab-text);
    border: 1px solid var(--lab-border-strong); border-radius: var(--lab-radius-sm);
    font: 400 1rem var(--font-lab-display, "Instrument Sans"), sans-serif; /* 16px stops iOS zoom */
    transition: border-color var(--lab-dur-fast), box-shadow var(--lab-dur-fast);
  }
  .textarea { min-height: 120px; padding: .75rem .875rem; line-height: 1.5; resize: vertical; }
  .input::placeholder, .textarea::placeholder { color: var(--lab-text-tertiary); opacity: 1; }
  .input:hover, .select:hover, .textarea:hover { border-color: var(--lab-text-secondary); }
  .input:focus, .select:focus, .textarea:focus { outline: none; border-color: var(--lab-text); box-shadow: 0 0 0 4px rgba(var(--lab-text-rgb), .08); }
  .input:disabled, .select:disabled, .textarea:disabled { background: var(--lab-surface-alt); color: var(--lab-text-tertiary); cursor: not-allowed; }
  .input[readonly] { background: transparent; border-style: dashed; }
  .input[aria-invalid="true"], .select[aria-invalid="true"], .textarea[aria-invalid="true"] { border-color: var(--lab-error); }
  .input[aria-invalid="true"]:focus { box-shadow: 0 0 0 4px rgba(180, 35, 24, .12); }
  .input-mono { font-family: var(--font-lab-mono, "IBM Plex Mono"), monospace; letter-spacing: .02em; } /* GSTIN, PO no., Cat. No. */
  .select { appearance: none; padding-right: 2.5rem; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2316191c' stroke-width='1.5'%3E%3Cpath d='M2 4.5 6 8.5l4-4'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right .875rem center; }
```
- The label sits above the field, and there are no floating labels. Help text goes under the label when it affects input, otherwise under the field. Errors replace help text and link to the field with `aria-describedby`.
- Validate on blur and on submit, never on each keystroke. On submit, show an error summary at the top that links to each field, and move focus there.
- Group related fields with `<fieldset>` + `<legend class="subsection">`.

### 4.4 Choice controls
```css
  .check, .radio { appearance: none; width: 20px; height: 20px; margin: 0; flex-shrink: 0; display: grid; place-content: center;
    background: var(--lab-surface); border: 1.5px solid var(--lab-border-strong); cursor: pointer;
    transition: background-color var(--lab-dur-fast), border-color var(--lab-dur-fast); }
  .check { border-radius: var(--lab-radius-xs); }
  .radio { border-radius: 50%; }
  .check:hover, .radio:hover { border-color: var(--lab-text); }
  .check:checked { background: var(--lab-text); border-color: var(--lab-text); }
  .check:checked::after { content: ""; width: 10px; height: 6px; border: 2px solid var(--lab-text-inverse); border-top: 0; border-right: 0; transform: translateY(-1px) rotate(-45deg); }
  .check:indeterminate { background: var(--lab-text); border-color: var(--lab-text); }
  .check:indeterminate::after { content: ""; width: 10px; height: 2px; background: var(--lab-text-inverse); }
  .radio:checked { border: 6px solid var(--lab-text); }
  .check:disabled, .radio:disabled { opacity: .4; cursor: not-allowed; }
  .choice { display: flex; align-items: center; gap: .75rem; min-height: 44px; cursor: pointer; } /* the whole row is the hit area */

  /* Segmented options: capacity / pack size on the PDP */
  .option { min-height: 44px; padding: 0 1rem; border: 1px solid var(--lab-border-strong); border-radius: var(--lab-radius-pill);
    background: var(--lab-surface); font: 500 .875rem var(--font-lab-mono, "IBM Plex Mono"), monospace; cursor: pointer;
    transition: border-color var(--lab-dur-fast), background-color var(--lab-dur-fast); }
  .option:hover { border-color: var(--lab-text); }
  .option[aria-checked="true"], .option[aria-pressed="true"] { background: var(--lab-text); color: var(--lab-text-inverse); border-color: var(--lab-text); }
  .option[aria-disabled="true"] { color: var(--lab-text-tertiary); border-style: dashed; text-decoration: line-through; cursor: not-allowed; }

  /* Switch */
  .switch { appearance: none; width: 40px; height: 24px; border-radius: 999px; background: var(--lab-border-strong); position: relative; cursor: pointer; transition: background-color var(--lab-dur-base); }
  .switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--lab-surface); transition: transform var(--lab-dur-base) var(--lab-ease-out); }
  .switch:checked { background: var(--lab-text); }
  .switch:checked::after { transform: translateX(16px); }
  .switch:disabled { opacity: .4; }
```

### 4.5 Quantity stepper (packs)
```css
  .qty { display: inline-flex; justify-self: start; width: max-content; align-items: center; height: 44px; border: 1px solid var(--lab-border-strong); border-radius: var(--lab-radius-pill); background: var(--lab-surface); }
  .qty:focus-within { border-color: var(--lab-text); box-shadow: 0 0 0 4px rgba(var(--lab-text-rgb), .08); }
  .qty button { width: 44px; height: 100%; border: 0; background: none; color: var(--lab-text-secondary); border-radius: inherit; cursor: pointer; }
  .qty button:hover { color: var(--lab-text); background: var(--lab-surface-alt); }
  .qty button:disabled { opacity: .35; cursor: not-allowed; }
  .qty input { width: 4.5ch; text-align: center; border: 0; background: none; font: 500 1rem var(--font-lab-mono, "IBM Plex Mono"), monospace; font-variant-numeric: tabular-nums; }
```
- The input is typeable (`inputmode="numeric"`), because bulk buyers type "120", not +1 × 120.
- The decrement button is disabled at the minimum order. If an entry is above stock, clamp it and show a field-help line.
- Show the unit under or next to the stepper: "packs of 12", in `meta`.

### 4.6 Badges and chips
```css
  .badge { display: inline-flex; align-items: center; gap: .375rem; height: 24px; padding: 0 .625rem; border-radius: var(--lab-radius-pill);
    font: 500 .75rem/1 var(--font-lab-display, "Instrument Sans"), sans-serif; background: var(--lab-surface-alt); color: var(--lab-text-secondary); }
  .badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; } /* dot + word, never colour alone */
  .badge-success { background: var(--lab-success-soft); color: var(--lab-success); }
  .badge-warning { background: var(--lab-warning-soft); color: var(--lab-warning); }
  .badge-error   { background: var(--lab-error-soft);   color: var(--lab-error); }
  .badge-info    { background: var(--lab-accent-soft);  color: var(--lab-accent); }

  /* Filter chips: removable applied filters */
  .chip { display: inline-flex; align-items: center; gap: .375rem; min-height: 36px; padding: 0 .5rem 0 .875rem; border: 1px solid var(--lab-border-strong); border-radius: var(--lab-radius-pill); background: var(--lab-surface); font-size: .8125rem; }
  .chip:hover { border-color: var(--lab-text); }
  .chip[aria-pressed="true"] { background: var(--lab-accent-soft); border-color: var(--lab-accent); color: var(--lab-accent); }
  .chip button { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; } /* × with aria-label "Remove filter: 250 mL"; 44px hit area via ::after */
  .chip button:hover { background: var(--lab-surface-alt); }
```

### 4.7 Navigation primitives
```css
  /* Breadcrumbs */
  .crumbs { display: flex; flex-wrap: wrap; gap: .5rem; font: 400 .75rem/1.5 var(--font-lab-mono, "IBM Plex Mono"), monospace; color: var(--lab-text-tertiary); }
  .crumbs a { color: inherit; text-decoration: none; } .crumbs a:hover { color: var(--lab-accent); }
  .crumbs li + li::before { content: "/"; margin-right: .5rem; color: var(--lab-border-hover); }
  .crumbs [aria-current="page"] { color: var(--lab-text-secondary); }

  /* Tabs: underline style */
  .tabs { display: flex; gap: 1.75rem; border-bottom: 1px solid var(--lab-border); overflow-x: auto; scrollbar-width: none; }
  .tab { position: relative; min-height: 48px; padding: 0; background: none; border: 0; color: var(--lab-text-tertiary); font: 500 .9375rem var(--font-lab-display, "Instrument Sans"), sans-serif; white-space: nowrap; cursor: pointer; }
  .tab:hover { color: var(--lab-text); }
  .tab[aria-selected="true"] { color: var(--lab-text); }
  .tab[aria-selected="true"]::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--lab-text); }
  .tab:disabled { opacity: .4; }

  /* Pagination */
  .pager { display: flex; align-items: center; gap: .25rem; font: 500 .875rem var(--font-lab-mono, "IBM Plex Mono"), monospace; }
  .pager a, .pager button { display: grid; place-items: center; min-width: 44px; height: 44px; border-radius: var(--lab-radius-pill); color: var(--lab-text-secondary); }
  .pager a:hover { background: var(--lab-surface-alt); color: var(--lab-text); }
  .pager [aria-current="page"] { background: var(--lab-text); color: var(--lab-text-inverse); }

  /* Account / settings side nav */
  .sidenav a { display: flex; align-items: center; min-height: 44px; padding: 0 .75rem; border-left: 2px solid transparent; color: var(--lab-text-secondary); text-decoration: none; }
  .sidenav a:hover { color: var(--lab-text); background: var(--lab-surface-hover); }
  .sidenav a[aria-current="page"] { color: var(--lab-text); border-left-color: var(--lab-text); font-weight: 600; }
```
- Long result sets get pagination with a "Showing 1–24 of 312" meta line. Use "Load more" only on mobile, and keep the page number in the URL.

### 4.8 Product card
```css
  .pcard { position: relative; display: grid; gap: .75rem; }
  .pcard-media { position: relative; aspect-ratio: 1; border-radius: var(--lab-radius-md); background: var(--lab-surface-alt); overflow: hidden; transition: background-color var(--lab-dur-base); }
  .pcard-media img { object-fit: contain; padding: 12%; mix-blend-mode: multiply; transition: transform 500ms var(--lab-ease-editorial); }
  .pcard:hover .pcard-media { background: var(--lab-surface-press); }
  .pcard:hover .pcard-media img { transform: scale(1.03); }
  .pcard-sku { font: 400 .75rem var(--font-lab-mono, "IBM Plex Mono"), monospace; color: var(--lab-text-tertiary); }
  .pcard-title { font: 500 .9375rem/1.35 var(--font-lab-display, "Instrument Sans"), sans-serif; color: var(--lab-text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .pcard-title a::after { content: ""; position: absolute; inset: 0; } /* stretched link: whole card clickable */
  .pcard:hover .pcard-title { text-decoration: underline; text-underline-offset: 3px; }
  .pcard:focus-within { outline: 2px solid var(--lab-accent); outline-offset: 4px; border-radius: var(--lab-radius-md); }
  .pcard-price { font: 500 .9375rem var(--font-lab-mono, "IBM Plex Mono"), monospace; font-variant-numeric: tabular-nums; }
  .pcard-actions { position: relative; z-index: 1; } /* sits above the stretched link */
```
**Card anatomy, top to bottom:**
1. Image tile: photo on `surface-alt`, contained with 12% padding. No tile? Use the vessel line-icon, never a grey block.
2. Cat. No.: `meta`.
3. Title: two lines at most.
4. Key spec: `small`, `ink-3`, e.g. "250 mL · Borosilicate 3.3".
5. Price row: "from ₹1,849 / pack of 12" in `figure`, plus a stock badge only if it's *not* in stock.

Optional quick-add: a `btn-secondary btn-sm` in `.pcard-actions`. The card has no border and no shadow.

### 4.9 Data table (orders, cart, variants, quotes, invoices)
```css
  .table { width: 100%; border-collapse: collapse; font-size: .875rem; }
  .table th { padding: .75rem 1rem; text-align: left; font: 500 .6875rem/1.3 var(--font-lab-mono, "IBM Plex Mono"), monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--lab-text-tertiary); border-bottom: 1px solid var(--lab-border-hover); white-space: nowrap; }
  .table td { padding: 1rem; border-bottom: 1px solid var(--lab-border); vertical-align: middle; color: var(--lab-text-secondary); }
  .table td:first-child, .table th:first-child { padding-left: 0; }
  .table td:last-child, .table th:last-child { padding-right: 0; }
  .table .num { text-align: right; font-family: var(--font-lab-mono, "IBM Plex Mono"), monospace; font-variant-numeric: tabular-nums; color: var(--lab-text); }
  .table tbody tr { transition: background-color var(--lab-dur-fast); }
  .table tbody tr:hover { background: var(--lab-surface-hover); }
  .table tbody tr[aria-selected="true"] { background: var(--lab-accent-soft); }
  .table tfoot td { border-bottom: 0; padding-top: 1.25rem; color: var(--lab-text); font-weight: 600; }
  .table-sticky thead th { position: sticky; top: 68px; /* header height */ background: var(--lab-bg); z-index: var(--lab-z-sticky); }
```
- No zebra stripes and no vertical lines. Row height is 56px or more.
- Clickable rows use a real link in the first cell, made row-wide with the stretched-link pattern. Don't put `onClick` on `<tr>`.
- **Below 768px**, tables become stacked rows. Each row is a block with a label/value grid (`dt` in `eyebrow`, `dd` in `figure`), and the primary cell (product or order number) becomes the block title.

### 4.10 Spec list (PDP specifications, order meta)
```css
  .specs { display: grid; grid-template-columns: minmax(9rem, 30%) 1fr; border-top: 1px solid var(--lab-border); }
  .specs dt, .specs dd { margin: 0; padding: .875rem 0; border-bottom: 1px solid var(--lab-border); }
  .specs dt { font: 400 .8125rem var(--font-lab-display, "Instrument Sans"), sans-serif; color: var(--lab-text-tertiary); }
  .specs dd { font: 500 .875rem var(--font-lab-mono, "IBM Plex Mono"), monospace; color: var(--lab-text); }
```

### 4.11 Containers: card, summary, alert
```css
  .card { background: var(--lab-surface); border: 1px solid var(--lab-border); border-radius: var(--lab-radius-md); padding: 1.5rem; }
  .card-interactive { transition: border-color var(--lab-dur-fast); }
  .card-interactive:hover { border-color: var(--lab-border-hover); }
  .card-interactive:focus-within { outline: 2px solid var(--lab-accent); outline-offset: 3px; }
  .card[aria-checked="true"] { border-color: var(--lab-text); box-shadow: inset 0 0 0 1px var(--lab-text); } /* selected address / delivery option */

  .summary { position: sticky; top: calc(68px + 24px); background: var(--lab-surface); border: 1px solid var(--lab-border); border-radius: var(--lab-radius-md); padding: 1.5rem; }

  .alert { display: grid; grid-template-columns: auto 1fr auto; gap: .75rem; align-items: start; padding: 1rem 1.125rem; border-radius: var(--lab-radius-md); background: var(--lab-surface-alt); color: var(--lab-text); font-size: .875rem; }
  .alert-success { background: var(--lab-success-soft); } .alert-success svg { color: var(--lab-success); }
  .alert-warning { background: var(--lab-warning-soft); } .alert-warning svg { color: var(--lab-warning); }
  .alert-error   { background: var(--lab-error-soft); }   .alert-error svg   { color: var(--lab-error); }
  .alert-info    { background: var(--lab-accent-soft); }  .alert-info svg    { color: var(--lab-accent); }
```
Alert text stays ink. Only the icon carries the status colour. Use `role="alert"` for errors and `role="status"` for everything else.

### 4.12 Overlays: menu, popover, dialog, drawer, tooltip
```css
  .menu, .popover { background: var(--lab-surface); border: 1px solid var(--lab-border); border-radius: var(--lab-radius-lg); box-shadow: var(--lab-shadow-3); padding: .375rem; z-index: var(--lab-z-dropdown);
    transform-origin: top; animation: lab-pop var(--lab-dur-base) var(--lab-ease-out); }
  .menu-item { display: flex; align-items: center; gap: .625rem; width: 100%; min-height: 40px; padding: 0 .75rem; border-radius: var(--lab-radius-sm); color: var(--lab-text); font-size: .875rem; text-align: left; }
  .menu-item:hover, .menu-item[data-highlighted] { background: var(--lab-surface-alt); }
  .menu-item[aria-disabled="true"] { opacity: .4; }
  .menu-item-danger { color: var(--lab-error); }
  .menu-sep { height: 1px; margin: .375rem 0; background: var(--lab-border); }

  .scrim { position: fixed; inset: 0; background: var(--lab-scrim); z-index: var(--lab-z-modal); animation: lab-fade var(--lab-dur-base) ease; } /* no backdrop blur */
  .dialog { position: fixed; z-index: var(--lab-z-modal); inset: 50% auto auto 50%; translate: -50% -50%; width: min(32rem, calc(100vw - 2rem)); max-height: calc(100dvh - 4rem); overflow: auto;
    background: var(--lab-surface); border-radius: var(--lab-radius-lg); box-shadow: var(--lab-shadow-3); padding: 1.75rem; animation: lab-pop var(--lab-dur-slow) var(--lab-ease-out); }
  .drawer { position: fixed; z-index: var(--lab-z-drawer); top: 0; bottom: 0; right: 0; width: min(26rem, 100vw); background: var(--lab-bg); border-left: 1px solid var(--lab-border);
    box-shadow: var(--lab-shadow-3); animation: lab-slide-in var(--lab-dur-slow) var(--lab-ease-out); display: grid; grid-template-rows: auto 1fr auto; }
  .drawer-left { right: auto; left: 0; border-left: 0; border-right: 1px solid var(--lab-border); animation-name: lab-slide-in-left; }
  .tooltip { padding: .375rem .625rem; border-radius: var(--lab-radius-xs); background: var(--lab-text); color: var(--lab-text-inverse); font-size: .75rem; z-index: var(--lab-z-toast); }
```
- Dialogs have a serif `section`-size title, body text, and actions right-aligned (primary last). On mobile the actions stack full width with the primary first.
- Use `<dialog>` or a headless library (Radix/Headless UI) for focus trap, Esc, `aria-modal` and returning focus to the trigger. Never hand-roll this.
- Drawers: the filter drawer on mobile and the cart drawer if you use one. The header row has the title and a close button, the body scrolls, and the footer actions stay fixed.

### 4.13 Toast
```css
  .toast-region { position: fixed; z-index: var(--lab-z-toast); right: 1.5rem; bottom: 1.5rem; display: grid; gap: .5rem; }
  .toast { display: flex; align-items: center; gap: .875rem; min-width: 18rem; max-width: 24rem; padding: .875rem 1rem; border-radius: var(--lab-radius-md);
    background: var(--lab-text); color: var(--lab-text-inverse); font-size: .875rem; box-shadow: var(--lab-shadow-3); animation: lab-rise-in var(--lab-dur-base) var(--lab-ease-out); }
  .toast a, .toast button { color: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; margin-left: auto; }
  @media (max-width: 639px) { .toast-region { left: 1rem; right: 1rem; bottom: 1rem; } .toast { max-width: none; } }
```
- The region is `role="status" aria-live="polite"`. A toast lasts 4s and pauses on hover or focus. Show no more than three at once.
- Content is one line plus at most one action: "Added 5 packs of FP-125 · View cart".
- Errors that block the user are inline alerts, not toasts.

### 4.14 Loading and empty states
```css
  .skeleton { background: var(--lab-surface-alt); border-radius: var(--lab-radius-xs); animation: lab-breathe 1.6s ease-in-out infinite; }
  .empty { display: grid; justify-items: center; gap: .75rem; padding: 4rem 1rem; text-align: center; }
  .empty-title { font: 400 clamp(1.75rem, 1.3rem + 1.4vw, 2.5rem)/1.05 var(--font-lab-serif, "Instrument Serif"), serif; }
  .empty-text { max-width: 28rem; color: var(--lab-text-secondary); }
} /* end @layer components */
```
- Skeletons mirror the real layout: image tile, two text lines and a price line per card. No shimmer sweep.
- **Empty state anatomy:** a line-drawn vessel icon (from the hero still-life family), a serif title (an italic phrase is allowed here), one sentence, and one primary action.
  Examples: "*Nothing measured yet.*" (empty cart), "No matches for *‘burette 25’*" (search, with suggestions).

### 4.15 Keyframes (shared)
```css
@keyframes lab-fade { from { opacity: 0; } }
@keyframes lab-pop { from { opacity: 0; transform: translateY(-4px) scale(.98); } }
@keyframes lab-rise-in { from { opacity: 0; transform: translateY(8px); } }
@keyframes lab-slide-in { from { transform: translateX(100%); } }
@keyframes lab-slide-in-left { from { transform: translateX(-100%); } }
@keyframes lab-breathe { 50% { opacity: .55; } }
```

---

## 5. Layout Principles

### 5.1 Containers
- `max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8`. This is the same container as the header and hero, and every page uses it.
- Narrow (forms, auth, legal): `max-w-[40rem]`. Reading width (prose): `max-w-[68ch]`.

### 5.2 Spacing scale (4px base)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`
- Gap from page header to content: 32 (mobile) / 48 (desktop).
- Between page sections: 64 / 96, separated by a hairline (`border-t border-line`) or by space alone. Never both a hairline and a background change.
- Card padding: 24. Form field gap: 20. Field groups (fieldsets): 40.

### 5.3 Page header (every interior page)
```
[crumbs: Products / Glassware / Beakers]                ← meta, mono
Beakers                                                 ← page-title, serif
A short intro sentence, max 2 lines, ink-2.             ← body-lg, optional
312 products · Updated catalogue 2026         [actions] ← meta row + right-aligned actions
───────────────────────────────────────────────────────  ← hairline
```
- Padding top: 32 (mobile) / 48 (desktop). The hairline closes the header.
- Page actions (e.g. "Download catalogue PDF", "New quote") go at the right of the meta row: secondary buttons, at most one primary.

### 5.4 Grids
| Pattern | Columns |
|---|---|
| Listing with filters | `260px 1fr` at ≥1024px (filter rail sticky, `top: 68+24px`) |
| Product grid | 2 (mobile) · 3 (≥768) · 4 (≥1280); gap 32 × 24 (row × col); on mobile 24 × 12 |
| Detail (PDP) | `7fr 5fr`, gap 64 |
| Transaction (cart, checkout) | `1fr 380px`, gap 48; summary sticky |
| Account | `220px 1fr`, gap 48; side nav becomes a horizontal tab strip below 1024px |
| Form pages | single column, max 40rem |

---

## 6. Depth & Elevation

| Level | Treatment | Used for |
|---|---|---|
| 0 Flat | nothing | page content, product cards, tables, page headers |
| 1 Hairline | `1px var(--lab-border)` | dividers, cards, summary panels, alerts (no border) |
| 2 Raised | `--lab-shadow-2` | sticky mobile buy bar, sticky table header when scrolled |
| 3 Floating | `--lab-shadow-3` + `radius-lg` | menus, popovers, dialogs, drawers, toasts |

- **Shadows are only for things that float above the page.** Nothing sitting in the page flow gets a shadow.
- Scrim is `--lab-scrim`, with no backdrop blur. The header's own 12px blur is the only blur in the app.
- Radius is by size: controls use `sm`, containers `md`, floating layers `lg`, actions `pill`. Never use one-off radius values like `rounded-[18px]`.

---

## 7. Animation & Interaction

**Philosophy**: The app reacts and never performs. Motion confirms what the user did and then stops.
**Tier**: L1 everywhere except the landing hero, which has its own one-time intro.

| Event | Motion | Duration / easing |
|---|---|---|
| Hover colour/border | colour transition | `--lab-dur-fast` |
| Menu / popover open | `lab-pop` (fade + 4px drop) | `--lab-dur-base`, ease-out |
| Dialog open | `lab-pop` + scrim fade | `--lab-dur-slow` |
| Drawer open | slide from its edge | `--lab-dur-slow`, ease-out; close 200ms |
| Toast | `lab-rise-in`, exit fade | 250ms / 150ms |
| Add to cart | label → "Added ✓" (1.6s), header badge pop, toast | — |
| Accordion | open with `grid-template-rows: 0fr → 1fr`; the chevron rotates 180° | 250ms |
| Product image hover | `scale(1.03)` | 500ms editorial |
| Route change | none (no page transitions) | — |
| Skeleton | opacity breathe | 1.6s loop; static under reduced motion |

- No scroll-triggered reveals in the app. Content is there when the page loads.
- No parallax, no cursor effects, no auto-advancing carousels (PDP galleries are user-driven).
- Optimistic UI: cart quantity changes show at once. If the server rejects one, roll it back and show an inline error.

### Reduced motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  .skeleton { animation: none; }
}
```

---

## 8. Do's and Don'ts

### Do
- Use tokens through Tailwind utilities (`bg-paper`, `text-ink-2`, `border-line`) or the component classes in §4.
- Use mono with tabular figures for every price, quantity, SKU, order number and table date.
- Show the pack and the per-unit price together: "₹1,849 / pack of 12 · ₹154.08 per unit".
- Let buyers type quantities and paste catalogue numbers. Speed beats decoration for B2B.
- Keep one filled (ink) button per region and make the rest outline or text.
- Give every list, table and search an empty state, a loading skeleton and an error state.
- Keep the URL as the source of truth for filters, sort, page and search query, so results can be shared and bookmarked.
- Hit targets are at least 44×44px, including chip close buttons, steppers and pagination.

### Don't
- ❌ Hex codes or `slate-*`, `blue-*`, `gray-*` classes in components. They're how the old look leaks back in.
- ❌ Cobalt-filled primary buttons. Primary is ink. Cobalt is for focus, selection and info.
- ❌ Shadows on in-page cards, product tiles or tables.
- ❌ Bold, uppercase or long-paragraph serif. Serif is for H1/H2 only.
- ❌ Grey placeholder blocks for missing product images. Use the line-icon tile.
- ❌ Floating labels, placeholder-as-label, or asterisk-only required markers.
- ❌ Toasts for blocking errors. Use inline alerts linked to the problem.
- ❌ Colour-only status (a red dot alone, say). Always add the word.
- ❌ Gradients, glass, blur blobs or decorative patterns inside app pages.
- ❌ Truncating SKUs or catalogue numbers without a `title`, or truncating prices at all.
- ❌ Tailwind display utilities (`hidden md:flex`) on elements styled by **unlayered** CSS (the hero/header injected styles). Inside `@layer components` it's fine.
- ❌ Unverified marketing numbers ("10,000+ labs trust us") anywhere in the app.

---

## 9. Responsive Behavior

| Name | Width | Key changes |
|---|---|---|
| Mobile | < 640px | single column; product grid 2-up; filters in a left drawer; tables stack; sticky bottom action bar on PDP/cart/checkout |
| Tablet | 640–1023px | product grid 3-up; filters still a drawer; account nav becomes a tab strip; summary drops below content |
| Desktop | 1024–1279px | filter rail visible; PDP 7/5; cart/checkout two columns with sticky summary |
| Wide | ≥ 1280px | product grid 4-up; container capped at 1280px |

**Touch targets:** 44×44px minimum. Inputs are 48px tall with a 16px font (prevents iOS zoom).

**Collapse rules**
- **Filters**: from 1024px down, a "Filters (3)" secondary button opens a left drawer. Its footer has "Clear all" (text) and "Show 128 results" (primary).
- **Sticky action bar** (mobile, PDP/cart/checkout): `position: sticky; bottom: 0`, `bg-paper`, hairline on top and `--lab-shadow-2`. It holds the price on the left and the primary action on the right, and respects `env(safe-area-inset-bottom)`.
- **Summary panels**: below 1024px they sit after the content and are collapsed to "Order total ₹12,787.50 ▾" at the top of checkout.
- **Tables**: below 768px, stacked rows (§4.9).
- **Page title**: the clamp handles the size. Never hide the H1 on mobile.

```css
.action-bar { position: sticky; bottom: 0; z-index: var(--lab-z-sticky); display: flex; align-items: center; gap: 1rem; padding: .75rem 1rem calc(.75rem + env(safe-area-inset-bottom));
  background: var(--lab-bg); border-top: 1px solid var(--lab-border); box-shadow: var(--lab-shadow-2); }
@media (min-width: 1024px) { .action-bar { display: none; } }
```

---

## 10. Page Blueprints

> Each blueprint lists structure top to bottom, the one primary action, and the states you have to build. Where it says *(if supported)*, build it only if the feature exists.

### 10.1 Product listing / category (`/products`, `/products?category=…`)
1. Page header: crumbs, serif category name, one-line intro, meta "312 products".
2. Toolbar row: applied-filter chips + "Clear all" (left); sort `select` (right) — *Relevance · Price ↑ · Price ↓ · Newest · Cat. No.*. Mobile: "Filters (n)" button + sort.
3. Body: filter rail | product grid.
   - Filter groups are accordions (Category, Capacity, Material, Brand, Price, Availability). Each option is a `.choice` with a count in `meta`. "Show 8 more" opens long lists. A price range uses two number inputs, not a slider.
   - Grid of `.pcard`, with pagination below.
4. **Primary action:** none at page level; each card is a link.
5. **States:** loading (8 skeleton cards), empty after filtering ("No products match these filters", with the chips repeated and "Clear all"), error alert.
6. *(Optional, recommended for B2B)* A **list view** toggle: a table with Cat. No. · Product · Spec · Pack · Price · Qty · Add.

### 10.2 Search results (`/products?q=…`)
- Same as 10.1. The title is serif *“{query}”* in italic, and the meta reads "48 results for ‘beaker 250’".
- An exact catalogue-number match is pinned first as a single highlighted row (`card`, `badge-info` "Exact match").
- Zero results: an empty state that echoes the query, with spelling suggestions, top categories and a "Request this product" text button that opens the RFQ prefilled.

### 10.3 Product detail (`/products/[slug]?variant=…`)
1. Crumbs.
2. Two columns, `7fr 5fr`:
   - **Gallery** (left): the main image on a `surface-alt` tile with radius-md and aspect 1, a thumbnail strip below (56px, radius-xs, selected = ink 1px ring). Click for full-screen (dialog); swipe on mobile.
   - **Buy box** (right):
     1. Cat. No. in `meta` with a copy button (copied → tooltip "Copied").
     2. Product name as **serif page-title**.
     3. A one-sentence description.
     4. Variant `.option` group ("Capacity"), then pack `.option` group ("Pack size"). Selecting an option updates the URL `?variant=`.
     5. Price block: `figure-lg` "₹1,849", then `small ink-3` "per pack of 12 · ₹154.08 per unit · excl. GST".
     6. Stock badge + lead time line.
     7. Quantity stepper + **"Add to cart" (btn-primary btn-lg, the primary action)** in one row, then "Request bulk quote" (btn-secondary) under it.
     8. *(if supported)* A tier-price table: "1–9 packs ₹1,849 · 10–49 ₹1,749 · 50+ ₹1,649", with the active tier highlighted (`accent-soft` row).
     9. A delivery line in `small` with an icon: "Pan-India delivery · GST invoice with every order".
3. Below, tabs or stacked sections with hairlines: **Specifications** (`.specs`), **All variants** (a table with every SKU, price and Add), **Documents** (*SDS, COA, catalogue page* as rows: file icon, name, size in `meta`, "Download" text button), **Related products** (4-up `.pcard` row).
4. Mobile: the gallery comes first, then the buy box, plus a sticky action bar with the price and "Add to cart".
5. **States:** variant unavailable (option dashed + strikethrough), out of stock (Add disabled + "Notify me"), loading (skeleton buy box), image missing (line-icon tile).

### 10.4 Cart (`/cart`)
1. Page header: "Cart" (serif), meta "6 packs · 3 lines".
2. `1fr 380px`:
   - **Lines**, as a table on desktop with these columns:
     - Product: 64px thumb, name, Cat. No. and pack in `meta`
     - Unit price (`.num`)
     - Qty stepper
     - Line total (`.num`)
     - Remove (btn-text)
   - Below the lines: "Continue shopping" (link-arrow, left) and "Clear cart" (btn-text, error colour, with a confirm dialog).
   - **Summary** (`.summary`): Subtotal; GST "calculated at checkout" or estimated; Shipping; hairline; **Total** in `figure-lg`; **"Proceed to checkout" (btn-primary btn-block btn-lg)**; "Request quote for this cart" (btn-secondary btn-block); a `small ink-3` note on invoice and GST.
3. *(if supported)* **Quick add by catalogue number**: a collapsible row above the lines with two inputs (`input-mono` Cat. No., qty) and an "Add" button. You can paste multiple lines.
4. Mobile: lines as stacked blocks, then the summary, plus a sticky action bar "₹12,787.50 · Checkout".
5. **States:**
   - Empty: the "*Nothing measured yet.*" empty state with an "Explore products" primary button and the recently viewed products.
   - Item went out of stock: inline `alert-warning` on that line.
   - Price changed: an `alert-info` at the top.

### 10.5 Checkout (`/checkout`)
1. A minimal stepper in mono: `01 Address — 02 Delivery — 03 Payment — 04 Review`. Current = ink and underlined, done = ink with a ✓, upcoming = ink-3. On mobile, show only "Step 2 of 4 · Delivery".
2. `1fr 380px`:
   - Form column (max 40rem):
     - Address: saved addresses as selectable `.card`s (radio semantics) plus "Add new address".
     - Business details *(if supported)*: Company, GSTIN (`input-mono`, with format validation), PO number (optional).
     - Delivery options as selectable cards.
     - Payment: methods as selectable cards.
     - Review: a read-only summary with "Edit" text buttons per section.
   - Summary: collapsed item list ("3 lines · View"), totals, and on the review step **"Place order" (btn-primary btn-lg btn-block)** plus terms in `small`.
3. One primary per step ("Continue to delivery" etc.), with Back as a text button on the left.
4. **States:** field validation (§4.3), payment failure (alert-error at the top, form keeps its data), placing the order (button loading, prevent double submit).

### 10.6 Order confirmation (`/orders/[id]/confirmed`)
- Centred, narrow: a line-drawn check vessel, the serif title "Thank you. *Order received.*", and the order number in `figure-lg` with a copy button.
- Meta: placed date, payment status badge, email confirmation note.
- A summary `.specs` block (delivery address, PO no., total), then an items table.
- Actions: **"View order" (primary)**, "Download invoice" (secondary), "Continue shopping" (link).

### 10.7 Auth (`/login`, `/register`, `/forgot-password`)
- Narrow centred column (max 26rem) on paper, no card container. Top to bottom:
  - small brand mark
  - serif title ("Sign in")
  - one-line subtitle
  - fields
  - **primary btn-block**
  - a secondary link row ("New to Rootra? Create an account")
- Password fields have a show/hide icon button inside. Error alerts sit above the fields. Rate-limit and locked states use `alert-warning`.
- Register *(B2B)*: group into fieldsets: Account, Organisation (company, GSTIN optional), Contact.

### 10.8 Account (`/account/*`)
- Shell: page header "Account" + a greeting in meta, then `220px 1fr` with the `.sidenav`: Overview, Orders, Quotes, Addresses, Profile, Sign out (at the bottom, separated).
- **Overview:** three summary blocks in a 3-column hairline grid (open orders, open quotes, saved addresses: a number in `figure-lg` and a label), then the recent orders table (5 rows) with "View all".
- **Orders list:**
  - Filters: a status chips row and a date range.
  - A table with these columns: Order no. (mono link), Date, Items, Total (`.num`), Status (badge), and an actions menu (View, Reorder, Invoice).
  - Paginated.
- **Order detail:**
  - Page header "Order RT-24-01922" with the status badge.
  - A vertical timeline: a hairline with 8px dots; done = ink, current = accent ring, future = line colour; dates in `meta`.
  - The items table, a totals `tfoot`, addresses in two `.specs` blocks.
  - Actions: **Reorder (primary)**, Download invoice, Request support (text).
- **Quotes:** like Orders, plus the status mapping in §2.3, an expiry date in `meta`, and an "Accept quote → add to cart" primary on quoted rows.
- **Addresses:** a 2-up `.card` grid with "Default" as a `badge-info`. Card actions: Edit, Remove (text), Set as default. "Add address" opens a dialog.
- **Profile:** the form pattern. A separate "Change password" fieldset with its own save button.

### 10.9 Contact / Request a quote (`/contact`)
- `5fr 7fr`:
  - Left: serif title "Request a quote", intro, and a `.specs` contact block (email, phone, hours, GSTIN of seller *(if shown)*).
  - Right: the form, with these fields:
    - Name, Company, Email, Phone
    - **Product lines repeater**: each row is Cat. No. or product (`input-mono`), Qty and Unit, with "Add line" (btn-text with +) and Remove per row
    - Delivery city
    - Notes
    - Attachment *(if supported)*
    - **"Send request" (primary)**
- Success: replace the form with the confirmation pattern (serif "Request sent." plus a response-time sentence) instead of a toast.
- Prefill lines from cart or PDP links (`?sku=…&qty=…`).

### 10.10 Content pages (About, Shipping, Returns, Terms, Privacy)
- Page header, then prose at `max-w-[68ch]`, body 1.0625rem/1.7, H2 serif and H3 sans.
- Long legal pages get a sticky left table of contents at ≥1024px (`meta` links, active = ink).
- Tables inside prose use `.table`. Pull quotes are serif italic at 1.5rem with an ink-3 attribution in `meta`.

### 10.11 Footer (global)
- `bg-paper`, `border-t border-line`, padding 64/48.
- Row 1: the brand mark + a one-line positioning sentence (ink-2), and a newsletter field *(if supported)*: an inline pill input + btn-secondary.
- Row 2: 4 link columns (Catalogue, Account, Company, Support). Headings in `eyebrow`, links `.link-quiet` in `small`, 12px apart.
- Row 3: a hairline, then in `meta`: "© 2026 Rootra · GSTIN …" on the left and Terms · Privacy on the right.
- No social icon clutter. If you need them, use text links.

### 10.12 Errors and system pages
- **404:** centred. A `meta` line "Error 404", a serif title "This page isn't in the *catalogue*.", one sentence, a search field (the hero search pattern at 36rem), and links to Products and Home.
- **500:** a `meta` line "Error 500", the serif title "Something went wrong on our side.", "Try again" (primary, reloads) and a contact link. Show no stack traces.
- **Offline / maintenance:** the same pattern with `alert-warning` above.
- **Route loading (`loading.tsx`):** a page header skeleton plus a skeleton of the page's main pattern. No spinners on full pages.

---

## 11. Data Formatting & Voice

| Data | Format | Example |
|---|---|---|
| Money | `en-IN` INR from paise; drop decimals only for whole rupees | ₹1,849 · ₹1,849.50 · ₹12,787.50 |
| Price context | always state the pack and the tax basis | "₹1,849 / pack of 12 · excl. GST" |
| Per unit | 2 decimals, ink-3 | "₹154.08 per unit" |
| Quantity | number + unit word; packs explicit | "5 packs", "1 pack", "packs of 12" |
| Volume / size | number + non-breaking space + SI unit | 250 mL · 125 mm · 0.45 µm |
| SKU / Cat. No. | mono, as stored, never re-cased; copy button on PDP | FP-125 |
| Order no. | mono | RT-24-01922 |
| Date | `en-IN` day month year | 6 Oct 2026 |
| Date + time | 24h + IST | 6 Oct 2026, 14:30 IST |
| Relative | only under 7 days, with the full date in `title` | "2 days ago" |
| Counts | tabular mono in lists | 312 products |

**Voice:** plain, precise, calm. Sentence case everywhere. No exclamation marks. Name the thing ("Add 5 packs"), not the action type ("Submit"). Errors say what happened and what to do: "GSTIN should be 15 characters, like 07ABCDE1234F1Z5."

---

## 12. Accessibility (release gate)
- [ ] Text contrast ≥ 4.5:1 (all text tokens pass on `bg`, `surface` and `surface-alt`); control edges ≥ 3:1 (`--lab-border-strong`).
- [ ] Every interactive element has a visible `:focus-visible` ring (2px accent), and nothing removes outlines without a replacement.
- [ ] Hit targets ≥ 44×44px.
- [ ] One `h1` per page, and headings don't skip levels.
- [ ] Form fields have `<label>`; errors use `aria-invalid` + `aria-describedby`; the error summary gets focus on submit.
- [ ] Dialogs and drawers trap focus, close on Esc, and return focus to the trigger.
- [ ] Cart changes and toasts are announced through polite live regions (the header already announces cart count changes).
- [ ] Tables use `<th scope>`; stacked mobile rows keep their labels.
- [ ] Status is never conveyed by colour alone.
- [ ] Every image has meaningful `alt` text, or `alt=""` when decorative (card images use the product name only if the title isn't adjacent).
- [ ] Reduced-motion users get no animation (the §7 block).

---

## 13. Implementation & Migration

### 13.1 Files
```
app/
  globals.css        ← @import "tailwindcss"; :root tokens (§2.1); @theme inline (§2.2); @layer components (§4); keyframes; reduced motion
  layout.tsx         ← next/font once (§3.1), <body class="bg-paper text-ink font-sans">
components/ui/       ← Button, Field, Input, Select, Checkbox, Radio, Option, QuantityStepper, Badge, Chip, Tabs, Table,
                        Specs, Alert, Dialog, Drawer, Menu, Toast, Skeleton, EmptyState, Breadcrumbs, Pagination, PageHeader, ProductCard
```
Build the §4 primitives as typed React components first, then rebuild pages from §10 using only those. A page PR that adds a raw colour or a one-off radius should fail review.

### 13.2 Clean up the hero and header (they stay as designed)
1. Delete the `:root { … }` token block from `HERO_CSS` and `HEADER_CSS`. Tokens now live in `globals.css`, and those injected blocks would otherwise override the v2.1 values.
2. Delete their `next/font` calls. The fonts load once in `layout.tsx` with the same variable names, so nothing else changes.
3. Header mini-cart: change the `lh-cta--primary` (cobalt) buttons to ink, to match the §4.1 rule.

### 13.3 Class migration map
| Old | New |
|---|---|
| `bg-white` (page) | `bg-paper` |
| `bg-white` (input / card / menu) | `bg-surface` |
| `bg-slate-50`, `bg-gray-100` | `bg-surface-alt` / `bg-surface-hover` |
| `text-slate-950`, `text-black` | `text-ink` |
| `text-slate-600/700` | `text-ink-2` |
| `text-slate-400/500` | `text-ink-3` |
| `border-slate-100/200` | `border-line` |
| `border-slate-300` (on inputs) | `border-line-strong` |
| `bg-blue-600` (CTA) | `btn btn-primary` (ink) |
| `text-blue-600` (link) | `link` / `hover:text-accent` |
| `focus:ring-2 focus:ring-blue-500` | remove; the global `:focus-visible` handles it |
| `rounded-[18px]`, `rounded-xl`, `rounded-2xl` | `rounded-sm` / `rounded-md` / `rounded-lg` by role (§6) |
| `shadow-[…]`, `shadow-lg` on in-page cards | remove; `shadow` only on floating layers via component classes |
| `ww-*` animation classes | remove (L1) |
| `text-emerald-*`, `bg-emerald-*` | `badge-success` / `text-success` |

### 13.4 Audit commands (run before every UI PR)
```bash
# stray palette classes or hex values in components
rg -n "\b(bg|text|border|ring|from|via|to)-(slate|gray|zinc|neutral|blue|sky|cyan|emerald|indigo|violet)-[0-9]{2,3}\b" app components features
rg -n "#[0-9a-fA-F]{3,8}\b" app components features --glob '!globals.css'
# one-off radii and shadows
rg -n "rounded-\[|shadow-\[" app components features
```

### 13.5 Rollout order
1. globals.css + layout fonts (§2, §3) — visual baseline shifts app-wide, nothing breaks.
2. UI primitives (§4) with a `/design` route showing every component in every state.
3. PDP → Cart → Checkout (revenue path), then Listing/Search, Account, Auth, Contact, Content, Footer, Errors.
4. Audit commands clean, accessibility gate (§12) passed, screenshots at 375 / 820 / 1440.
