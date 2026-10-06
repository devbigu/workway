import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { sanitizeProductDescription } from "../src/features/products/components/product-content";
import { getCartItemFromVariant, getProductImages } from "../src/features/products/utils";
import type { Product } from "../src/features/products/types";

const product: Product = {
  id: "p1", sku: "P-1", slug: "sample", name: "Sample", category: "Glassware",
  categories: ["Glassware"], page: 1, features: ["Borosilicate construction"],
  descriptionHtml: "<p>Safe description</p>", images: ["/product.jpg"], hsnCode: "7017",
  variants: [{
    id: "v1", sku: "V-1", slug: "sample-v1", name: "Sample 100 ml",
    specs: { Capacity: "100 ml" }, specsText: "100 ml", pack: 6,
    price: 1200, priceLabel: "", inStock: true, images: ["/variant.jpg"],
  }],
};

describe("product detail redesign helpers", () => {
  test("variant images lead while product images remain available", () => {
    assert.deepEqual(getProductImages(product, product.variants[0]), ["/variant.jpg", "/product.jpg"]);
  });

  test("cart payload preserves product and variant identity and converts rupees to paise", () => {
    const item = getCartItemFromVariant(product, product.variants[0], 2);
    assert.equal(item?.productId, "p1");
    assert.equal(item?.variantId, "v1");
    assert.equal(item?.packPricePaise, 120000);
    assert.equal(item?.initialQuantity, 2);
  });

  test("description sanitizer removes executable and attributed markup", () => {
    const result = sanitizeProductDescription('<p onclick="bad()">Hello <strong>lab</strong></p><script>alert(1)</script><a href="javascript:bad()">bad</a>');
    assert.equal(result, "<p>Hello <strong>lab</strong></p>bad");
  });
});
