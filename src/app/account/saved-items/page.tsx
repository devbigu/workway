import productsData from "../../../../public/data/nested_omsons_products.json" with { type: "json" };

import { AccountEmptyState } from "@/features/account/components/empty-state";
import { SavedItemsGrid, type SavedProduct } from "@/features/account/components/saved-items-grid";
import { listSavedItemIds, requireCustomerPage } from "@/features/account/server/account.service";
import type { Product } from "@/features/products/types";

export default async function SavedItemsPage() {
  const customer = await requireCustomerPage();
  const saved = await listSavedItemIds(customer.id);
  const byId = new Map((productsData as Product[]).map((product) => [product.id, product]));
  const products = saved.flatMap(({ productId }): SavedProduct[] => {
    const product = byId.get(productId);
    if (!product) return [];
    const variant = product.variants.find((item) => item.inStock && item.price !== null) ?? null;
    const image = variant?.images[0] ?? product.images[0] ?? null;
    return [{ id: product.id, slug: product.slug, name: product.name, image, available: Boolean(variant), pricePaise: variant?.price === null || variant?.price === undefined ? null : Math.round(variant.price * 100), cart: variant && variant.price !== null ? { productId: product.id, productSlug: product.slug, productName: product.name, variantId: variant.id, variantSku: variant.sku, variantName: variant.name, variantLabel: variant.specsText || variant.name, image: image ?? undefined, packPricePaise: Math.round(variant.price * 100), packSize: variant.pack, initialQuantity: 1 } : null }];
  });
  return <section><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Your shortlist</p><h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Saved Items</h2><p className="mt-2 text-sm text-slate-500">Products saved for later.</p><div className="mt-5">{products.length?<SavedItemsGrid products={products}/>:<AccountEmptyState title="No saved items" description="Products you save will appear here."/>}</div></section>;
}
