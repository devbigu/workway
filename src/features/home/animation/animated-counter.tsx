"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

function parseValue(value: string) {
  const match = value.match(/^(.*?)([\d,]+)(.*)$/);
  if (!match) return { prefix: "", number: 0, suffix: "" };
  return { prefix: match[1], number: Number(match[2].replace(/,/g, "")), suffix: match[3] };
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("en-IN");
}

export function AnimatedCounter({ value, duration = 1350 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [active, setActive] = useState(false);
  const [display, setDisplay] = useState(value);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry], currentObserver) => {
      if (entry?.isIntersecting) {
        setActive(true);
        currentObserver.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, value]);

  useEffect(() => {
    if (!active || reduced) return;
    const { prefix, number, suffix } = parseValue(value);
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(progress === 1 ? value : `${prefix}${formatNumber(number * eased)}${suffix}`);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [active, duration, reduced, value]);

  return <span ref={ref}>{display}</span>;
}

