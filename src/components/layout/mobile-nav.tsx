"use client";

import Link from "next/link";
import { useEffect } from "react";

const links: readonly (readonly [string, string])[] = [
  ["Products", "/products"],
  ["Categories", "/categories"],
  ["Resources", "/#documentation"],
  ["About", "/about"],
  ["Account", "/account"],
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <nav id="rootra-mobile-menu" aria-label="Mobile navigation" className="border-t border-line bg-paper lg:hidden [animation:lab-pop_var(--lab-dur-base)_var(--lab-ease-out)]">
      <div className="page-wrap py-3">
        <ul>
          {links.map(([label, href]) => (
            <li key={label} className="border-b border-line">
              <Link href={href} onClick={onClose} className="flex min-h-12 items-center text-base font-medium text-ink no-underline hover:text-accent">{label}</Link>
            </li>
          ))}
        </ul>
        <Link href="/contact" onClick={onClose} className="btn btn-primary btn-block mt-4">Request quote</Link>
      </div>
    </nav>
  );
}
