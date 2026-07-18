import Link from "next/link";
import { products } from "../data";
import { StaggerGroup } from "../animation/stagger-group";
import { Reveal } from "../animation/reveal";
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";
import type { Product } from "../types";

function ProductArtwork({ product }: { product: Product }) {
  return (
    <div className={`relative grid h-56 place-items-center overflow-hidden rounded-[24px] bg-gradient-to-br ${product.gradient}`}>
      <div className="absolute left-5 top-5 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
      <div className="absolute bottom-0 right-3 h-28 w-28 rounded-full bg-blue-300/25 blur-2xl" />
      <div className="relative grid h-32 w-32 place-items-center rounded-[36px] border border-white/80 bg-white/65 text-blue-700 shadow-[0_24px_50px_rgba(37,99,235,0.18)] backdrop-blur-md transition duration-500 group-hover:scale-105 group-hover:-rotate-1">
        <Icon name={product.icon} className="h-16 w-16" />
      </div>
      <span className="absolute bottom-4 right-4 rounded-full border border-white bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 backdrop-blur">{product.catalogueNumber}</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group rounded-[30px] border border-slate-200/80 bg-white p-3 shadow-[0_14px_44px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <div className="relative">
        <ProductArtwork product={product} />
        {product.badge && <span className="absolute left-4 top-4 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">{product.badge}</span>}
        <button type="button" aria-label={`Add ${product.name} to wishlist`} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white bg-white/85 text-slate-700 shadow-sm backdrop-blur transition duration-300 hover:scale-105 hover:bg-white hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Icon name="heart" className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3 pb-4 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{product.category}</p>
        <h3 className="mt-2 min-h-14 text-lg font-semibold leading-7 tracking-[-0.025em] text-slate-950">{product.name}</h3>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">Cat. No. {product.catalogueNumber}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">{product.packSize}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600"><Icon name="star" className="h-4 w-4 fill-amber-400 stroke-amber-400" /><span className="font-semibold text-slate-900">{product.rating}</span><span>({product.reviews})</span></div>
          <span className="text-xs font-semibold text-emerald-700">{product.availability}</span>
        </div>
        <div className="mt-5 flex items-end gap-2">
          <span className="text-2xl font-bold tracking-[-0.04em] text-slate-950">{product.price}</span>
          {product.originalPrice && <span className="pb-0.5 text-sm text-slate-400 line-through">{product.originalPrice}</span>}
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" className="ww-button-pop flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Icon name="cart" className="h-4 w-4" />Add to cart</button>
          <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-800 transition duration-300 hover:border-slate-950 hover:bg-slate-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"><Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></Link>
        </div>
      </div>
    </article>
  );
}

export function FeaturedProducts() {
  return (
    <section id="products" className="scroll-mt-28 border-y border-slate-200 bg-white py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Curated selection" title="Featured scientific products" description="Frequently sourced products selected for consistent quality, reliable availability, and complete technical information." action={<Link href="/products" className="ww-button-pop inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-950 hover:bg-slate-950 hover:text-white">Browse catalogue <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></Link>} />
        </Reveal>
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" stagger={80}>
          {products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </StaggerGroup>
      </div>
    </section>
  );
}
