import type { IconName } from "@/features/home/types";

export type Department = {
  title: string;
  slug: string;
  description: string;
  /** Filter value passed to /products?category=. Absent means nothing in the catalogue yet. */
  productCategory?: string;
  status: string;
  icon: IconName;
  /** Tile background in /categories. Absent falls back to the gradient alone. */
  image?: string;
};

export const departments: Department[] = [
  {
    title: "Scientific Lab Glassware",
    slug: "scientific-lab-glassware",
    description: "Precision borosilicate glassware, filtration, and instruments for laboratory workflows.",
    productCategory: "Laboratory Glassware",
    status: "Available now",
    icon: "glassware",
    image: "https://omsonslabs.com/wp-content/uploads/Beaker-Low-Form-with-Spout-product-Image.webp",
  },
  {
    title: "Smart Wellness",
    slug: "smart-wellness",
    description: "Connected wellness devices and everyday health essentials for home and workspace.",
    status: "Launching soon",
    icon: "heart",
    image: "/images/humidifier.jpeg",
  },
  {
    title: "Wall Decor",
    slug: "wall-decor",
    description: "Framed prints, panels, and statement pieces to finish a room or reception wall.",
    status: "Launching soon",
    icon: "sparkles",
    image: "/images/walldecor.png",
  },
  {
    title: "Desktop Decor",
    slug: "desktop-decor",
    description: "Desk organisers, accents, and small objects that make a workspace feel considered.",
    status: "Launching soon",
    icon: "package",
    image: "/images/desktopdecor.png",
  },
];

export function findDepartment(slug: string): Department | undefined {
  return departments.find((department) => department.slug === slug);
}
