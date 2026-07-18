import "@testing-library/jest-dom/vitest";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes, type PropsWithChildren } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { GlobalHeader } from "../src/components/layout/global-header";
import AddToCartButton from "../src/features/cart/components/add-to-cart-button";
import ProductCard from "../src/features/products/components/product-card";
import type { AddCartItemInput } from "../src/features/cart/types";
import type { Product } from "../src/features/products/types";
import {
  createCartKey,
  getSubtotalPaise,
  useCartStore,
} from "../src/features/cart/store/cart-store";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  useParams: () => ({ slug: "membrane-filter" }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => createElement("img", { src: String(src), alt: alt ?? "", ...props }),
}));

vi.mock("../src/components/layout/desktop-nav", () => ({
  DesktopNav: () => <nav aria-label="Desktop navigation" />,
}));

vi.mock("../src/components/layout/mobile-nav", () => ({
  MobileNav: () => null,
}));

vi.mock("../src/components/layout/account-menu", () => ({
  AccountMenu: () => <button type="button">Account</button>,
}));

const product: Product = {
  id: "product-om285",
  sku: "OM285",
  slug: "membrane-filter",
  name: "Membrane Filter",
  category: "Filtration",
  categories: ["Filtration"],
  page: 1,
  features: ["Sterile membrane filters"],
  descriptionHtml: "",
  images: ["https://example.com/filter.jpg"],
  hsnCode: "8421",
  variants: [
    {
      id: "variant-020",
      sku: "OM285-020",
      slug: "om285-020",
      name: "0.20 micron",
      specs: { Pore: "0.20 micron" },
      specsText: "0.20 micron",
      pack: 100,
      price: 5200,
      priceLabel: "",
      inStock: true,
      images: [],
    },
    {
      id: "variant-045",
      sku: "OM285-045",
      slug: "om285-045",
      name: "0.45 micron",
      specs: { Pore: "0.45 micron" },
      specsText: "0.45 micron",
      pack: 100,
      price: 6100,
      priceLabel: "",
      inStock: true,
      images: [],
    },
  ],
};

const baseCartItem: AddCartItemInput = {
  productId: product.id,
  productSlug: product.slug,
  productName: product.name,
  variantId: "variant-020",
  variantSku: "OM285-020",
  variantName: "0.20 micron",
  variantLabel: "0.20 micron",
  image: "https://example.com/filter.jpg",
  packPricePaise: 520000,
  packSize: 100,
  initialQuantity: 1,
};

function resetCart() {
  useCartStore.setState({
    items: [],
    hasHydrated: true,
  });
}

function addCartItem(item: AddCartItemInput, quantity = 1) {
  useCartStore.getState().addItem({
    ...item,
    initialQuantity: quantity,
  });
}

beforeEach(() => {
  routerPush.mockClear();
  resetCart();
});

describe("header cart badge", () => {
  test("shows total pack quantity and updates after cart actions", async () => {
    render(<GlobalHeader />);

    expect(screen.queryByText("3")).not.toBeInTheDocument();

    addCartItem(baseCartItem, 2);
    useCartStore.getState().incrementItem(
      createCartKey(baseCartItem.productId, baseCartItem.variantId),
    );

    expect(await screen.findAllByText("3")).not.toHaveLength(0);

    useCartStore.getState().decrementItem(
      createCartKey(baseCartItem.productId, baseCartItem.variantId),
    );

    await waitFor(() => {
      expect(screen.getAllByText("2")).not.toHaveLength(0);
    });

    useCartStore.getState().removeItem(
      createCartKey(baseCartItem.productId, baseCartItem.variantId),
    );

    await waitFor(() => {
      expect(screen.queryByText("2")).not.toBeInTheDocument();
    });
  });

  test("displays 99+ when total pack quantity exceeds 99", async () => {
    addCartItem(baseCartItem, 101);

    render(<GlobalHeader />);

    expect(await screen.findAllByText("99+")).not.toHaveLength(0);
  });
});

describe("product card variant cart controls", () => {
  test("clicking Add to cart changes the selected variant into a counter", async () => {
    render(<ProductCard product={product} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(await screen.findByText("1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /increase membrane filter om285-020/i }))
      .toBeInTheDocument();
  });

  test("increment and decrement update only the selected variant", async () => {
    render(<ProductCard product={product} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    fireEvent.click(screen.getByRole("button", { name: /increase membrane filter om285-020/i }));

    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /0.45 micron/i }));

    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    fireEvent.click(screen.getByRole("button", { name: /increase membrane filter om285-045/i }));
    fireEvent.click(screen.getByRole("button", { name: /increase membrane filter om285-045/i }));

    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /0.20 micron/i }));
    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /decrease membrane filter om285-020/i }));
    fireEvent.click(screen.getByRole("button", { name: /decrease membrane filter om285-020/i }));

    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();

    const storedItems = useCartStore.getState().items;
    expect(storedItems.find((item) => item.variantSku === "OM285-020"))
      .toBeUndefined();
    expect(storedItems.find((item) => item.variantSku === "OM285-045")?.quantity)
      .toBe(3);
  });
});

describe("header mini-cart", () => {
  test("desktop hover opens mini-cart with variant details and subtotal", async () => {
    addCartItem(baseCartItem, 2);

    render(<GlobalHeader />);

    fireEvent.mouseEnter(screen.getAllByLabelText("Cart")[1]);

    expect(await screen.findByText("Membrane Filter")).toBeInTheDocument();
    expect(screen.getByText(/OM285-020/)).toBeInTheDocument();
    expect(screen.getByText("2 packs")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Cart" })).toHaveAttribute(
      "href",
      "/cart",
    );
    expect(getSubtotalPaise(useCartStore.getState().items)).toBe(1040000);
  });

  test("empty mini-cart links to products and mobile cart icon links directly to cart", async () => {
    render(<GlobalHeader />);

    const cartLinks = screen.getAllByLabelText("Cart");
    expect(cartLinks[0]).toHaveAttribute("href", "/cart");

    fireEvent.mouseEnter(cartLinks[1]);

    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Products" }))
      .toHaveAttribute("href", "/products");
  });
});



describe("shared selected-variant cart controls", () => {
  test("details-style add button displays the selected variant quantity from the cart store", () => {
    addCartItem(baseCartItem, 4);

    render(
      <AddToCartButton item={baseCartItem}>
        Add to cart
      </AddToCartButton>,
    );

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /increase membrane filter om285-020/i }))
      .toBeInTheDocument();
  });
});
