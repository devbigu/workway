import type { ReactNode } from "react";

export type IconName =
  | "alert"
  | "arrow"
  | "cart"
  | "check"
  | "chevron"
  | "copy"
  | "document"
  | "download"
  | "eye"
  | "filter"
  | "flask"
  | "glassware"
  | "grid"
  | "heart"
  | "info"
  | "menu"
  | "microscope"
  | "package"
  | "search"
  | "shield"
  | "sparkles"
  | "star"
  | "support"
  | "truck"
  | "user"
  | "x";

export type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};
