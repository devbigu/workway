import type { ReactNode } from "react";

export type IconName =
  | "arrow"
  | "cart"
  | "check"
  | "chevron"
  | "document"
  | "download"
  | "filter"
  | "flask"
  | "glassware"
  | "heart"
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

export type Category = {
  title: string;
  slug: string;
  description: string;
  count: string;
  icon: IconName;
  gradient: string;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  catalogueNumber: string;
  category: string;
  packSize: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  rating: number;
  reviews: number;
  availability: string;
  icon: IconName;
  gradient: string;
};

export type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};
