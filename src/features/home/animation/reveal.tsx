"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "./use-reduced-motion";

type RevealProps = { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" };

export function Reveal({ children, delay = 0, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  const Component = as;

  useEffect(() => {
    if (reduced) {
      const timeout = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timeout);
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry], currentObserver) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          currentObserver.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <Component
      ref={ref as never}
      className={`ww-reveal ${visible ? "ww-reveal-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${Math.min(delay, 640)}ms` } as CSSProperties}
    >
      {children}
    </Component>
  );
}
