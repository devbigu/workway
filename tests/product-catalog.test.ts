import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { loadProducts } from "../src/features/products/data";
import type { Product } from "../src/features/products/types";
import {
  findProductByRouteValue,
  getInitialVariant,
  getProductHref,
} from "../src/features/products/utils";

const pricedVariant = {
  id: "variant-priced",
  sku: "OM-100",
  slug: "om-100-priced",
  name: "Priced variant",
  specs: { "Capacity (ml)": "100" },
  specsText: "100 ml",
  pack: 100,
  price: 5200,
  priceLabel: "",
  inStock: true,
  images: ["https://omsonslabs.com/product.jpg"],
};

const requestVariant = {
  id: "variant-request",
  sku: "OM-200",
  slug: "om-200-request",
  name: "Request variant",
  specs: { "Capacity (ml)": "200" },
  specsText: "200 ml",
  pack: 50,
  price: null,
  priceLabel: "On Request",
  inStock: false,
  images: [],
};

const product: Product = {
  id: "product-1",
  sku: "OM-PARENT",
  slug: "sample-product",
  name: "Sample Product",
  category: "Glassware",
  categories: ["Lab > Glassware"],
  page: 1,
  features: ["Stable catalogue data"],
  descriptionHtml: "<p>Sample</p>",
  images: [],
  variants: [requestVariant, pricedVariant],
  hsnCode: "9018",
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("product catalogue data", () => {
  test("loadProducts fetches the public JSON and returns only valid products", async () => {
    let requestedUrl = "";

    globalThis.fetch = ((input: RequestInfo | URL) => {
      requestedUrl = String(input);

      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            product,
            { id: "invalid-without-required-fields" },
          ]),
      } as Response);
    }) as typeof fetch;

    const products = await loadProducts();

    assert.equal(
      requestedUrl,
      "/data/omsons_products_from_excel_with_images.json",
    );
    assert.deepEqual(products, [product]);
  });

  test("findProductByRouteValue prefers slug and supports sku and variant fallbacks", () => {
    assert.equal(
      findProductByRouteValue([product], "sample-product"),
      product,
    );
    assert.equal(
      findProductByRouteValue([product], "OM-PARENT"),
      product,
    );
    assert.equal(findProductByRouteValue([product], "OM-100"), product);
    assert.equal(
      findProductByRouteValue([product], "om-200-request"),
      product,
    );
  });

  test("getInitialVariant uses requested variant, then first in-stock variant, then first variant", () => {
    assert.equal(
      getInitialVariant(product.variants, "variant-request"),
      requestVariant,
    );
    assert.equal(getInitialVariant(product.variants), pricedVariant);
    assert.equal(getInitialVariant([requestVariant]), requestVariant);
  });

  test("getProductHref generates lowercase slug product links", () => {
    assert.equal(getProductHref(product), "/products/sample-product");
  });
});
