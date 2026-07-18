import type { Product, ProductVariant } from "./types";

const PRODUCTS_DATA_URL =
  "/data/omsons_products_from_excel_with_images.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

function isSpecs(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) => typeof item === "string",
    )
  );
}

function isProductVariant(value: unknown): value is ProductVariant {
  if (!isRecord(value)) {
    return false;
  }

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
  if (!isRecord(value)) {
    return false;
  }

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
    (typeof value.hsnCode === "string" ||
      value.hsnCode === undefined)
  );
}

export async function loadProducts(
  signal?: AbortSignal,
): Promise<Product[]> {
  const response = await fetch(PRODUCTS_DATA_URL, { signal });

  if (!response.ok) {
    throw new Error(
      `Unable to load products: ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Product data must be an array.");
  }

  return data.filter(isProduct);
}
