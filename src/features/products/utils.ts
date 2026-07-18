import type { AddCartItemInput } from "@/features/cart/types";
import type { Product, ProductVariant } from "./types";

export const PRODUCT_PLACEHOLDER_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEvtrhSWqmZ3V_Amn2sVLiSKikYCGjD1D3kId96Vw1qd-9FmflWdYeAq8&s=10";



export function formatProductPrice(
  price: number | null,
  priceLabel?: string,
): string {
  if (price === null) {
    return priceLabel || "On Request";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getInitialVariant(
  variants: ProductVariant[],
  requestedVariant?: string | null,
): ProductVariant | null {
  const requested = findVariant(variants, requestedVariant);

  return (
    requested ??
    variants.find((variant) => variant.inStock) ??
    variants[0] ??
    null
  );
}

export function getVariantImage(
  product: Product,
  variant?: ProductVariant | null,
): string {
  return (
    variant?.images.find(Boolean) ??
    product.images.find(Boolean) ??
    PRODUCT_PLACEHOLDER_IMAGE
  );
}

function extractUnit(key: string): string {
  const unitMatch = key.match(/\(([^)]+)\)/);

  return unitMatch?.[1] ?? "";
}

export function getVariantLabel(variant: ProductVariant): string {
  const specEntries = Object.entries(variant.specs);

  if (specEntries.length === 0) {
    return variant.specsText || variant.sku;
  }

  return specEntries
    .map(([key, value]) => {
      const unit = extractUnit(key);

      return unit ? `${value} ${unit}` : value;
    })
    .join(" - ");
}

export function findVariant(
  variants: ProductVariant[],
  routeValue?: string | null,
): ProductVariant | null {
  if (!routeValue) {
    return null;
  }

  const normalizedRouteValue = routeValue.toLowerCase();

  return (
    variants.find((variant) => {
      return [variant.id, variant.sku, variant.slug].some(
        (value) => value.toLowerCase() === normalizedRouteValue,
      );
    }) ?? null
  );
}


export function getProductHref(product: Product): string {
  return `/products/${product.slug}`;
}
export function findProductByRouteValue(
  products: Product[],
  routeValue: string,
): Product | null {
  const normalizedRouteValue = routeValue.toLowerCase();

  return (
    products.find(
      (product) =>
        product.slug.toLowerCase() === normalizedRouteValue,
    ) ??
    products.find((product) => {
      if (product.sku.toLowerCase() === normalizedRouteValue) {
        return true;
      }

      return product.variants.some((variant) =>
        [variant.sku, variant.slug].some(
          (value) => value.toLowerCase() === normalizedRouteValue,
        ),
      );
    }) ??
    null
  );
}

export function getLowestPricedVariant(
  product: Product,
): ProductVariant | null {
  const pricedVariants = product.variants.filter(
    (variant) =>
      typeof variant.price === "number" && variant.price >= 0,
  );

  if (pricedVariants.length === 0) {
    return null;
  }

  return pricedVariants.reduce((lowest, current) => {
    return (current.price ?? Infinity) <
      (lowest.price ?? Infinity)
      ? current
      : lowest;
  });
}

export function getProductImages(
  product: Product,
  variant?: ProductVariant | null,
): string[] {
  const images = [
    ...(variant?.images ?? []),
    ...product.images,
  ].filter(Boolean);

  const uniqueImages = Array.from(new Set(images));

  return uniqueImages.length > 0
    ? uniqueImages
    : [PRODUCT_PLACEHOLDER_IMAGE];
}

export function getCartItemFromVariant(
  product: Product,
  variant: ProductVariant,
  quantity = 1,
): AddCartItemInput | null {
  if (!variant.inStock || typeof variant.price !== "number") {
    return null;
  }

  return {
    productId: product.id,
    productSlug: product.slug,
    productName: product.name,
    variantId: variant.id,
    variantSku: variant.sku,
    variantName: variant.name || product.name,
    variantLabel: variant.specsText || getVariantLabel(variant),
    image: getVariantImage(product, variant),
    packPricePaise: Math.round(variant.price * 100),
    packSize: variant.pack,
    initialQuantity: quantity,
  };
}


