// @vitest-environment jsdom
import { expect, test } from "vitest";

import {
  isolateGuestCart,
  mergeCartForUser,
  setCartIdentity,
  useCartStore,
} from "./store/cart-store";

const item = {
  productId: "p1",
  productSlug: "p1",
  productName: "Gloves",
  variantId: "v1",
  variantSku: "SKU",
  variantName: "M",
  variantLabel: "M",
  packPricePaise: 1000,
  packSize: 10,
};
const cart = () => useCartStore.getState();

test("carts are isolated per user and disabled for staff", () => {
  isolateGuestCart();
  cart().addItem(item);
  mergeCartForUser("alice");
  expect(cart().items).toHaveLength(1);

  isolateGuestCart(); // alice signs out
  expect(cart().items).toHaveLength(0);
  mergeCartForUser("bob"); // bob signs in on the same browser
  expect(cart().items).toHaveLength(0);

  isolateGuestCart();
  cart().addItem(item); // guest cart before an admin signs in
  mergeCartForUser("root", "ADMIN");
  expect(cart().cartEnabled).toBe(false);
  expect(cart().items).toHaveLength(0);
  cart().addItem(item);
  expect(cart().items).toHaveLength(0);
  expect(Object.keys(localStorage).some((key) => key.includes("ADMIN"))).toBe(false);

  setCartIdentity("alice"); // alice gets only her own cart back
  expect(cart().cartEnabled).toBe(true);
  expect(cart().items).toHaveLength(1);
});
