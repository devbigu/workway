import Link from "next/link";
import { categories } from "../data";
import { StaggerGroup } from "../animation/stagger-group";
import { Reveal } from "../animation/reveal";
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";
import type { Category } from "../types";

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br ${category.gradient} p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_65px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/80 bg-white/75 text-blue-700 shadow-sm backdrop-blur transition duration-300 group-hover:scale-[1.04]">
            <Icon name={category.icon} className="h-7 w-7" />
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full border border-white bg-white/70 text-slate-900 transition duration-300 group-hover:translate-x-1 group-hover:bg-slate-950 group-hover:text-white">
            <Icon name="arrow" className="h-4 w-4" />
          </span>
        </div>
        <h3 className="mt-10 text-xl font-semibold tracking-[-0.03em] text-slate-950">{category.title}</h3>
        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{category.description}</p>
        <p className="mt-6 text-sm font-semibold text-slate-800">{category.count}</p>
      </div>
    </Link>
  );
}

export function CategorySection() {
  return (
    <section id="categories" className="scroll-mt-28 py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Explore the catalogue"
            title="Shop by category"
            description="Browse carefully organized product groups built for laboratories, institutions, dealers, and industrial research teams."
            action={<a href="#products" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900">View all categories <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></a>}
          />
        </Reveal>
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={80}>
          {categories.map((category) => <CategoryCard key={category.title} category={category} />)}
        </StaggerGroup>
      </div>
    </section>
  );
}
