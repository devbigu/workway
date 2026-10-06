import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "About | Rootra" };

export default function AboutPage() {
  return (
    <main className="page-wrap pb-16">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "About" }]} title="About Rootra" />
      <div className="prose mt-8 lg:mt-12">
        <p>Rootra supplies glassware, filtration, plasticware, instruments and certified reagents for labs that order in volume.</p>
        <p>Every listing carries its catalogue number, pack size and specifications, so you can search by the number on your bench sheet and order by the pack. Every order comes with a GST invoice, and we ship anywhere in India.</p>
        <p><Link href="/products" className="link">Browse the catalogue</Link> or <Link href="/contact" className="link">request a bulk quote</Link>.</p>
      </div>
    </main>
  );
}
