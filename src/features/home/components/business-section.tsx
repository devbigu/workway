import Link from "next/link";
import { businessFeatures } from "../data";
import { Icon } from "./icon";

const sampleLines = [
  ["OM262-020", "Syringe filters, sterile", 10, "₹2,480"],
  ["BG-500-12", "Conical flasks, 500 mL", 8, "₹1,320"],
  ["MS-2L-PRO", "Magnetic stirrer", 2, "₹12,750"],
] as const;

export function BusinessSection() {
  return (
    <section id="business" className="scroll-mt-24 border-t border-line py-16 lg:py-24">
      <div className="page-wrap grid items-start gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
        <div>
          <p className="eyebrow">Business purchasing</p>
          <h2 className="section-title mt-3">Built for laboratories and <em>bulk buyers.</em></h2>
          <p className="mt-4 max-w-[60ch] text-ink-2">Create a business account for structured quotations, dealer pricing, compliant invoicing and dedicated order support.</p>
          <ul className="mt-8 grid border-t border-line sm:grid-cols-2 sm:gap-x-8">
            {businessFeatures.map((item) => (
              <li key={item} className="flex min-h-12 items-center gap-3 border-b border-line text-sm text-ink">
                <Icon name="check" className="h-4 w-4 shrink-0 text-ink-3" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="btn btn-primary">Request a quote</Link>
            <Link href="/register" className="btn btn-secondary">Create a business account</Link>
          </div>
        </div>

        <figure className="m-0">
          <div className="card" aria-label="Sample quotation">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="meta">Quotation · RT-Q-0412</p>
                <p className="subsection mt-1">Institutional order</p>
              </div>
              <span className="badge">Requested</span>
            </div>
            <table className="table mt-5">
              <thead>
                <tr><th scope="col">Item</th><th scope="col" className="num">Qty</th><th scope="col" className="num">Unit</th></tr>
              </thead>
              <tbody>
                {sampleLines.map(([sku, name, qty, price]) => (
                  <tr key={sku}>
                    <td><span className="block text-ink">{name}</span><span className="meta">{sku}</span></td>
                    <td className="num">{qty}</td>
                    <td className="num">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-sm text-ink-3">Estimated total</span>
              <span className="figure-lg">₹60,860</span>
            </div>
          </div>
          <figcaption className="meta mt-3">Fig. 2 — A sample quotation</figcaption>
        </figure>
      </div>
    </section>
  );
}
