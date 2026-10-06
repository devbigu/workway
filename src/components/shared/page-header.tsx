import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** DESIGN.md §5.3: crumbs, serif title, optional intro, meta row with actions, closed by a hairline. */
export function PageHeader({
  crumbs,
  title,
  intro,
  meta,
  actions,
}: {
  crumbs?: Crumb[];
  title: ReactNode;
  intro?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-line pb-6 pt-8 lg:pt-12">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <h1 className="page-title mt-4">{title}</h1>
      {intro && <p className="body-lg mt-4 max-w-[68ch]">{intro}</p>}
      {(meta || actions) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="meta">{meta}</p>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      )}
    </header>
  );
}
