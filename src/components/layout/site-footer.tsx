import Link from "next/link";
import { departments } from "@/features/categories/data";
import { Icon } from "@/features/home/components/icon";

const footerColumns: { heading: string; links: readonly (readonly [string, string])[] }[] = [
  {
    heading: "Catalogue",
    links: [
      ["All products", "/products"],
      ...departments.map((department) => [department.title, `/categories/${department.slug}`] as const),
    ],
  },
  { heading: "Account", links: [["Sign in", "/login"], ["Create an account", "/register"], ["Orders", "/account"], ["Addresses", "/account/addresses"]] },
  { heading: "Company", links: [["About", "/about"], ["Request a quote", "/contact"], ["Business purchasing", "/#business"]] },
  { heading: "Support", links: [["Contact support", "/account/support"], ["Documentation", "/#documentation"], ["Shipping and returns", "/terms"]] },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-line bg-paper pb-12 pt-16">
      <div className="page-wrap">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-ink no-underline">
            <Icon name="flask" className="h-5 w-5" strokeWidth={1.5} />
            <span className="text-lg font-semibold tracking-[-0.02em]">Rootra</span>
          </Link>
          <p className="mt-3 text-sm text-ink-2">Laboratory glassware and scientific supplies for labs that order in volume.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-10 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h2 className="eyebrow">{column.heading}</h2>
              <ul className="mt-4 grid gap-3 text-sm">
                {column.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className="link-quiet text-ink-2">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="meta mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Rootra · GST invoice with every order</p>
          <p className="flex gap-4"><Link href="/terms" className="link-quiet">Terms</Link><Link href="/privacy" className="link-quiet">Privacy</Link></p>
        </div>
      </div>
    </footer>
  );
}
