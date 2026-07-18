"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  ["Products", "/products"],
  ["Categories", "/#categories"],
  ["Brands", "/products"],
  ["Resources", "/#documentation"],
  ["About", "/about"],
] as const;

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rendered, setRendered] = useState(open);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      const showTimeout = window.setTimeout(() => setRendered(true), 0);
      return () => window.clearTimeout(showTimeout);
    }
    const hideTimeout = window.setTimeout(() => setRendered(false), 320);
    return () => window.clearTimeout(hideTimeout);
  }, [open]);

  const visible = open || rendered;

  return (
    <nav id="workway-mobile-menu" className={`origin-top border-t border-slate-200 bg-white px-4 lg:hidden ${visible ? "block" : "hidden"} ${open ? "pointer-events-auto animate-[ww-mobile-menu-open_360ms_cubic-bezier(.2,1.35,.35,1)_both]" : "pointer-events-none opacity-0 transition duration-300 -translate-y-2 scale-y-[.96]"}`} aria-label="Mobile navigation" aria-hidden={!open}>
      <div className="mx-auto grid max-w-[1380px] gap-2 py-5">
        {links.map(([label, href], index) => <Link key={label} tabIndex={open ? 0 : -1} onClick={onClose} href={href} className={`rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`} style={{ transitionDelay: open ? `${index * 70}ms` : `${(links.length - index) * 35}ms` }}>{label}</Link>)}
        <Link tabIndex={open ? 0 : -1} href="/contact" onClick={onClose} className={`mt-2 rounded-full bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`} style={{ transitionDelay: open ? `${links.length * 75}ms` : "0ms" }}>Request Quote</Link>
      </div>
    </nav>
  );
}
