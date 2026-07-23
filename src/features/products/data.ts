import type { Product, ProductVariant } from "./types";

const PRIMARY_PRODUCTS_DATA_URL =
  "/data/omsons_products_from_excel_with_images.json";
const SECONDARY_PRODUCTS_DATA_URL = "/data/nested_omsons_products.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSpecs(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((item) => typeof item === "string");
}

function isProductVariant(value: unknown): value is ProductVariant {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.sku === "string" &&
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    isSpecs(value.specs) &&
    typeof value.specsText === "string" &&
    typeof value.pack === "number" &&
    (typeof value.price === "number" || value.price === null) &&
    typeof value.priceLabel === "string" &&
    typeof value.inStock === "boolean" &&
    isStringArray(value.images)
  );
}

function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.sku === "string" &&
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    typeof value.category === "string" &&
    isStringArray(value.categories) &&
    typeof value.page === "number" &&
    isStringArray(value.features) &&
    typeof value.descriptionHtml === "string" &&
    isStringArray(value.images) &&
    Array.isArray(value.variants) &&
    value.variants.every(isProductVariant) &&
    (typeof value.hsnCode === "string" || value.hsnCode === undefined)
  );
}

function uniqueStrings(...values: string[][]): string[] {
  return [...new Set(values.flat())];
}

function normalizeSku(sku: string): string {
  return sku.trim().toLowerCase();
}

function normalizeProduct(value: unknown): unknown {
  if (!isRecord(value)) return value;

  return {
    ...value,
    categories: Array.isArray(value.categories) ? value.categories : [],
    features: Array.isArray(value.features) ? value.features : [],
    descriptionHtml:
      typeof value.descriptionHtml === "string" ? value.descriptionHtml : "",
    images: Array.isArray(value.images) ? value.images : [],
    variants: Array.isArray(value.variants)
      ? value.variants.map((variant) =>
          isRecord(variant)
            ? {
                ...variant,
                images: Array.isArray(variant.images) ? variant.images : [],
              }
            : variant,
        )
      : [],
  };
}

function parseProducts(data: unknown): Product[] {
  if (!Array.isArray(data)) throw new Error("Product data must be an array.");
  return data.map(normalizeProduct).filter(isProduct);
}

function mergeVariant(primary: ProductVariant, secondary: ProductVariant): ProductVariant {
  return {
    ...primary,
    ...secondary,
    specs: { ...primary.specs, ...secondary.specs },
    images: uniqueStrings(primary.images, secondary.images),
  };
}

function mergeProduct(primary: Product, secondary: Product): Product {
  const secondaryVariants = new Map(
    secondary.variants.map((variant) => [normalizeSku(variant.sku), variant]),
  );
  const mergedVariants = primary.variants.map((variant) => {
    const key = normalizeSku(variant.sku);
    const richerVariant = secondaryVariants.get(key);
    if (!richerVariant) return variant;

    secondaryVariants.delete(key);
    return mergeVariant(variant, richerVariant);
  });

  return {
    ...primary,
    ...secondary,
    categories: uniqueStrings(primary.categories, secondary.categories),
    features: uniqueStrings(primary.features, secondary.features),
    images: uniqueStrings(primary.images, secondary.images),
    variants: [...mergedVariants, ...secondaryVariants.values()],
    hsnCode: secondary.hsnCode ?? primary.hsnCode,
  };
}

function consolidateProducts(products: Product[]): Product[] {
  const consolidated = new Map<string, Product>();

  for (const product of products) {
    const key = normalizeSku(product.sku);
    const existing = consolidated.get(key);
    consolidated.set(key, existing ? mergeProduct(existing, product) : product);
  }

  return [...consolidated.values()];
}

export function mergeProducts(
  primaryProducts: Product[],
  secondaryProducts: Product[],
): Product[] {
  const secondaryBySku = new Map(
    consolidateProducts(secondaryProducts).map((product) => [
      normalizeSku(product.sku),
      product,
    ]),
  );
  const merged = consolidateProducts(primaryProducts).map((product) => {
    const key = normalizeSku(product.sku);
    const richerProduct = secondaryBySku.get(key);
    if (!richerProduct) return product;

    secondaryBySku.delete(key);
    return mergeProduct(product, richerProduct);
  });

  return [...merged, ...secondaryBySku.values()];
}

export async function loadProducts(signal?: AbortSignal): Promise<Product[]> {
  const [primaryResponse, secondaryResponse] = await Promise.all([
    fetch(PRIMARY_PRODUCTS_DATA_URL, { signal }),
    fetch(SECONDARY_PRODUCTS_DATA_URL, { signal }),
  ]);

  if (!primaryResponse.ok || !secondaryResponse.ok) {
    throw new Error(
      `Unable to load products: ${primaryResponse.status}/${secondaryResponse.status}`,
    );
  }

  const [primaryData, secondaryData]: unknown[] = await Promise.all([
    primaryResponse.json(),
    secondaryResponse.json(),
  ]);

  return mergeProducts(parseProducts(primaryData), parseProducts(secondaryData));
}