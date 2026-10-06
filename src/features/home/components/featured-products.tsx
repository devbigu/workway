import productsData from "../../../../public/data/nested_omsons_products.json" with { type: "json" };
import Link from "next/link";

import ProductCard from "@/features/products/components/product-card";
import type { Product } from "@/features/products/types";
import { SectionHeading } from "./section-heading";

// ponytail: first four orderable products with images; swap for a curated list when merchandising needs one.
const featured = (productsData as Product[])
  .filter((product) => product.images?.length && product.variants?.some((variant) => variant.inStock && typeof variant.price === "number"))
  .slice(0, 4);

export function FeaturedProducts() {
  if (!featured.length) return null;

  return (
    <section id="products" className="scroll-mt-24 border-t border-line py-16 lg:py-24">
      <div className="page-wrap">
        <SectionHeading
          eyebrow="From the catalogue"
          title="Frequently ordered"
          description="Priced, in stock and ready to add by the pack."
          action={<Link href="/products" className="link link-arrow shrink-0 text-sm">Browse the catalogue</Link>}
        />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}
