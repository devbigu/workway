import Link from "next/link";
import { StaggerGroup } from "@/features/home/animation/stagger-group";
import { Icon } from "@/features/home/components/icon";

const footerColumns = [
  { heading: "Shop", links: [["All Products", "/products"], ["Equipment", "/categories/laboratory-equipment"], ["Consumables", "/categories/plasticware"], ["Glassware", "/categories/glassware"], ["New Arrivals", "/products"]] },
  { heading: "Business", links: [["Dealer Registration", "/account"], ["Bulk Orders", "/contact"], ["Request Quote", "/contact"], ["Institutional Sales", "/contact"], ["Track Order", "/account/orders"]] },
  { heading: "Support", links: [["Contact", "/contact"], ["FAQs", "/contact"], ["Shipping", "/terms"], ["Returns", "/terms"], ["Documentation", "/#documentation"]] },
] as const;

export function SiteFooter() {
  return (
    <footer id="footer" className="scroll-mt-28 bg-slate-950 pb-8 pt-16 text-white">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <StaggerGroup className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]" stagger={80}>
          <div>
            <Link href="/" className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/60"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600"><Icon name="flask" className="h-5 w-5" /></span><span className="text-xl font-bold tracking-[-0.04em]">Workway</span></Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">Scientific and laboratory products for dealers, institutions, laboratories, hospitals, colleges, and research teams.</p>
            <div className="mt-6 flex gap-2">{["in", "f", "x"].map((item) => <button key={item} type="button" aria-label={`Social ${item}`} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-sm font-semibold text-slate-300 transition hover:border-blue-500 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60">{item}</button>)}</div>
          </div>
          {footerColumns.map((column) => <div key={column.heading}><h3 className="text-sm font-semibold">{column.heading}</h3><ul className="mt-5 space-y-3 text-sm text-slate-400">{column.links.map(([label, href]) => <li key={label}><Link href={href} className="transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60">{label}</Link></li>)}</ul></div>)}
        </StaggerGroup>
        <div className="flex flex-col gap-4 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Workway. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/privacy" className="hover:text-white">Privacy Policy</Link><Link href="/terms" className="hover:text-white">Terms & Conditions</Link><span>GST invoicing · Secure payments</span></div>
        </div>
      </div>
    </footer>
  );
}
