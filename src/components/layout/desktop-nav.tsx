"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/features/home/components/icon";

type NavGroup = {
  label: string;
  href: string;
  items?: { label: string; href: string; description: string }[];
};

const navGroups: NavGroup[] = [
  {
    label: "Products",
    href: "/products",
    items: [
      { label: "All products", href: "/products", description: "Browse the full catalogue" },
      { label: "Featured products", href: "/#products", description: "Frequently ordered essentials" },
      { label: "Search the catalogue", href: "/products", description: "Find by name or catalogue number" },
    ],
  },
  { label: "Categories", href: "/categories" },
  {
    label: "Resources",
    href: "/#documentation",
    items: [
      { label: "Documentation", href: "/#documentation", description: "Datasheets and certificates" },
      { label: "Business purchasing", href: "/#business", description: "Bulk buyer support" },
      { label: "Contact support", href: "/contact", description: "Talk to the Rootra team" },
    ],
  },
  { label: "About", href: "/about" },
];

const OPEN_DELAY_MS = 90;
const CLOSE_DELAY_MS = 400;
const linkClassName = "inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink-2 no-underline transition-colors hover:text-accent";

export function DesktopNav() {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  function clearHoverTimer() {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }

  function openSoon(label: string) {
    clearHoverTimer();
    // Skip the delay when a panel is already open so moving across the bar feels instant.
    hoverTimerRef.current = window.setTimeout(() => setOpen(label), open === null ? OPEN_DELAY_MS : 0);
  }

  function closeSoon() {
    clearHoverTimer();
    hoverTimerRef.current = window.setTimeout(() => setOpen(null), CLOSE_DELAY_MS);
  }

  function closeNow() {
    clearHoverTimer();
    setOpen(null);
  }

  useEffect(() => clearHoverTimer, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) closeNow();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeNow();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav ref={navRef} className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
      {navGroups.map((group) => {
        const expanded = open === group.label;

        if (!group.items) {
          return <Link key={group.label} href={group.href} className={linkClassName}>{group.label}</Link>;
        }

        return (
          <div
            key={group.label}
            className="relative"
            onMouseEnter={() => openSoon(group.label)}
            onMouseLeave={closeSoon}
            onFocus={() => openSoon(group.label)}
          >
            <Link href={group.href} aria-expanded={expanded} onClick={closeNow} className={linkClassName}>
              {group.label}
              <Icon name="chevron" className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </Link>
            {expanded && (
              <div className="absolute left-0 top-full w-72 pt-2">
                <div className="menu">
                  {group.items.map((item) => (
                    <Link key={item.label} href={item.href} onClick={closeNow} className="menu-item min-h-0 flex-col items-start gap-0.5 py-2.5">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-ink-3">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
