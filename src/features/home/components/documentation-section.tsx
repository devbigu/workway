import Link from "next/link";
import { documentationLinks } from "../data";
import { Icon } from "./icon";

export function DocumentationSection() {
  return (
    <section id="documentation" className="scroll-mt-24 border-t border-line py-16 lg:py-24">
      <div className="page-wrap grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div>
          <p className="eyebrow">Documentation and compliance</p>
          <h2 className="section-title mt-3">Technical information, ready when you need it.</h2>
          <p className="mt-4 max-w-[60ch] text-ink-2">Specifications and compliance documents sit on the product record they belong to.</p>
          <Link href="/products" className="link link-arrow mt-6 inline-block text-sm">Find a product</Link>
        </div>
        <ul className="border-t border-line">
          {documentationLinks.map((item, index) => (
            <li key={item} className="flex min-h-14 items-center gap-4 border-b border-line">
              <span className="meta w-6">{String(index + 1).padStart(2, "0")}</span>
              <Icon name="document" className="h-4 w-4 text-ink-3" />
              <span className="text-[0.9375rem] font-medium text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
