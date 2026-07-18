"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/features/home/components/icon";

type NavGroup = { label: string; href: string; items?: { label: string; href: string; description: string }[] };

const navGroups: NavGroup[] = [
  { label: "Products", href: "/products", items: [{ label: "All Products", href: "/products", description: "Browse the full catalogue" }, { label: "Featured Products", href: "/#products", description: "Curated scientific essentials" }, { label: "Search Catalogue", href: "/search", description: "Find by name or catalogue number" }] },
  { label: "Categories", href: "/#categories", items: [{ label: "Equipment", href: "/categories/laboratory-equipment", description: "Instruments and devices" }, { label: "Filtration", href: "/categories/filtration-products", description: "Filters and assemblies" }, { label: "Glassware", href: "/categories/glassware", description: "Borosilicate labware" }] },
  { label: "Brands", href: "/products" },
  { label: "Resources", href: "/#documentation", items: [{ label: "Documentation", href: "/#documentation", description: "Datasheets and certificates" }, { label: "Business Purchasing", href: "/#business", description: "Bulk buyer support" }, { label: "Contact Support", href: "/contact", description: "Talk to the WorkWay team" }] },
  { label: "About", href: "/about" },
];

export function DesktopNav({ compact }: { compact: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpen(null);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleTriggerKey(event: KeyboardEvent<HTMLButtonElement>, label: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((value) => value === label ? null : label);
    }
  }

  return (
    <nav ref={navRef} className={`hidden items-center transition-all duration-300 lg:flex ${compact ? "gap-4" : "gap-7"}`} aria-label="Primary navigation">
      {navGroups.map((group) => {
        const expanded = open === group.label;
        if (!group.items) return <Link key={group.label} href={group.href} className="ww-nav-link text-sm font-semibold text-slate-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">{group.label}</Link>;
        return (
          <div key={group.label} className="relative" onMouseEnter={() => setOpen(group.label)} onMouseLeave={() => setOpen(null)} onFocus={() => setOpen(group.label)}>
            <button type="button" aria-expanded={expanded} onClick={() => setOpen((value) => value === group.label ? null : group.label)} onKeyDown={(event) => handleTriggerKey(event, group.label)} className="ww-nav-link inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">{group.label}<Icon name="chevron" className={`h-3.5 w-3.5 transition ${expanded ? "rotate-90" : ""}`} /></button>
            <div className={`absolute left-0 top-full w-72 origin-top rounded-3xl border border-white/80 bg-white/90 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl transition duration-250 ${expanded ? "pointer-events-auto translate-y-3 scale-100 opacity-100" : "pointer-events-none translate-y-1 scale-[.96] opacity-0"}`}>
              {group.items.map((item, index) => <Link key={item.label} href={item.href} onClick={() => setOpen(null)} className="block rounded-2xl p-3 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ transitionDelay: expanded ? `${index * 45}ms` : "0ms" }}><span className="text-sm font-semibold text-slate-950">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span></Link>)}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
