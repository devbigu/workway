import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Terms | Rootra" };

export default function TermsPage() {
  return (
    <main className="page-wrap pb-16">
      <PageHeader crumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]} title="Terms and conditions" meta="Shipping, returns and conditions of sale" />
      <div className="prose mt-8 lg:mt-12">
        <p>We are preparing the full terms, including shipping and returns. Until they are published, <Link href="/contact" className="link">contact us</Link> with any question about an order.</p>
      </div>
    </main>
  );
}
