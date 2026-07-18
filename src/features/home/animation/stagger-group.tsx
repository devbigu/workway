"use client";

import { Children, type ReactNode } from "react";
import { Reveal } from "./reveal";

type StaggerGroupProps = { children: ReactNode; stagger?: number; className?: string; itemClassName?: string };

export function StaggerGroup({ children, stagger = 80, className = "", itemClassName = "" }: StaggerGroupProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => (
        <Reveal delay={Math.min(index * stagger, 560)} className={itemClassName}>{child}</Reveal>
      ))}
    </div>
  );
}
