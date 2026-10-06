import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";

export const metadata = { title: "Request a quote | Rootra" };

const list = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const quantities = list(query.qty);
  const lines = list(query.sku).map((sku, index) => ({ sku, qty: quantities[index] }));
  const product = list(query.product)[0];

  return (
    <main className="page-wrap pb-16">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Request a quote" }]}
        title="Request a quote"
        intro="Send catalogue numbers, quantities and your delivery city, and we will come back with pricing for bulk and institutional orders."
      />
      <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div>
          <h2 className="subsection">How to send a request</h2>
          <p className="mt-3 max-w-[60ch] text-ink-2">Signed-in customers can send a request from their account. We reply there, so the thread stays with your orders.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account/support" className="btn btn-primary">Send a request</Link>
            <Link href="/products" className="btn btn-secondary">Browse the catalogue</Link>
          </div>
        </div>

        {lines.length > 0 || product ? (
          <section aria-labelledby="quote-lines">
            <h2 id="quote-lines" className="subsection">Lines for your request</h2>
            {product && <p className="mt-3 text-ink-2">{product}</p>}
            {lines.length > 0 && (
              <table className="table mt-4">
                <thead><tr><th scope="col">Cat. No.</th><th scope="col" className="num">Packs</th></tr></thead>
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={`${line.sku}-${index}`}><td className="font-mono text-ink">{line.sku}</td><td className="num">{line.qty ?? "—"}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="meta mt-3">Copy these into your request.</p>
          </section>
        ) : (
          <dl className="specs self-start">
            <dt>Include</dt><dd className="specs-text">Catalogue numbers or product names</dd>
            <dt>Quantities</dt><dd className="specs-text">Packs per line</dd>
            <dt>Delivery</dt><dd className="specs-text">City and PIN code</dd>
            <dt>Billing</dt><dd className="specs-text">Company name and GSTIN, if you have one</dd>
          </dl>
        )}
      </div>
    </main>
  );
}
