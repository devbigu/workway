import type { Product, ProductVariant } from "@/features/products/types";

const safeTags = new Set([
  "p", "br", "strong", "b", "em", "i", "ul", "ol", "li",
  "h2", "h3", "h4", "table", "thead", "tbody", "tr", "th", "td",
]);

export function sanitizeProductDescription(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<([a-z][\w-]*)(?:\s[^>]*)?>/gi, (_match, tag: string) =>
      safeTags.has(tag.toLowerCase()) ? `<${tag.toLowerCase()}>` : "")
    .replace(/<\/([a-z][\w-]*)\s*>/gi, (_match, tag: string) =>
      safeTags.has(tag.toLowerCase()) ? `</${tag.toLowerCase()}>` : "");
}

export default function ProductContent({ product, variant }: { product: Product; variant: ProductVariant | null }) {
  const specs: Array<[string, string | undefined]> = [
    ["Product name", product.name],
    ["Category", product.category],
    ["Product code", product.sku],
    ["Catalogue number", variant?.sku],
    ...Object.entries(variant?.specs ?? {}),
    ["Pack size", variant ? `${variant.pack} pieces` : undefined],
    ["HSN code", product.hsnCode],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()));
  const description = sanitizeProductDescription(product.descriptionHtml);

  if (!description && specs.length === 0) return null;

  return (
    <>
      {description && (
        <section id="description" className="scroll-mt-24 border-t border-line py-16 lg:py-24">
          <div className="page-wrap grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <h2 className="section-title">Description</h2>
            <div className="prose" dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        </section>
      )}
      {specs.length > 0 && (
        <section id="specifications" className="scroll-mt-24 border-t border-line py-16 lg:py-24">
          <div className="page-wrap grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <h2 className="section-title">Specifications</h2>
            <dl className="specs">
              {specs.map(([label, value]) => (
                <div key={`${label}-${value}`} className="contents">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
    </>
  );
}
