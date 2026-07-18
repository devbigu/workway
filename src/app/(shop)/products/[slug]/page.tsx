"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  useParams,
  useSearchParams,
} from "next/navigation";

import AddToCartButton from "@/features/cart/components/add-to-cart-button";
import ProductCard from "@/features/products/components/product-card";
import {
  createCartKey,
  useCartStore,
} from "@/features/cart/store/cart-store";
import { loadProducts } from "@/features/products/data";
import type {
  Product,
  ProductVariant,
} from "@/features/products/types";
import {
  findProductByRouteValue,
  findVariant,
  formatProductPrice,
  getCartItemFromVariant,
  getInitialVariant,
  getProductImages,
  getVariantImage,
  getVariantLabel,
  PRODUCT_PLACEHOLDER_IMAGE,
} from "@/features/products/utils";


type LoadStatus =
  | "loading"
  | "success"
  | "error"
  | "not-found";

function getRelatedProducts(
  products: Product[],
  product: Product,
): Product[] {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        candidate.category === product.category,
    )
    .slice(0, 4);
}

function QuantitySelector({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() =>
          onChange(Math.max(1, quantity - 1))
        }
        aria-label="Decrease quantity"
        className="grid h-11 w-11 place-items-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
      >
        âˆ’
      </button>

      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => {
          const nextQuantity = Number.parseInt(
            event.target.value,
            10,
          );

          onChange(
            Number.isFinite(nextQuantity)
              ? Math.max(1, nextQuantity)
              : 1,
          );
        }}
        aria-label="Quantity"
        className="h-11 w-14 border-x border-slate-200 bg-white text-center text-sm font-semibold text-slate-950 outline-none"
      />

      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
        className="grid h-11 w-11 place-items-center text-lg text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
      >
        +
      </button>
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams<{
    slug?: string | string[];
  }>();

  const searchParams = useSearchParams();

  const rawSlug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const slug = decodeURIComponent(
    String(rawSlug ?? ""),
  );

  const requestedVariant =
    searchParams.get("variant");

  const [products, setProducts] = useState<
    Product[]
  >([]);

  const [product, setProduct] =
    useState<Product | null>(null);

  const [selectedVariantId, setSelectedVariantId] =
    useState<string | null>(null);

  const [selectedImageOverride, setSelectedImageOverride] =
    useState<{ productId: string; src: string } | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [loadStatus, setLoadStatus] =
    useState<LoadStatus>("loading");

  const setItemQuantity = useCartStore(
    (state) => state.setItemQuantity,
  );

  const cartItems = useCartStore(
    (state) => state.items,
  );

  useEffect(() => {
    const controller = new AbortController();

    loadProducts(controller.signal)
      .then((validProducts) => {
        const foundProduct = findProductByRouteValue(
          validProducts,
          slug,
        );

        setProducts(validProducts);

        if (!foundProduct) {
          setProduct(null);
          setLoadStatus("not-found");
          return;
        }

        setProduct(foundProduct);
        setLoadStatus("success");
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setLoadStatus("error");
      });

    return () => {
      controller.abort();
    };
  }, [slug]);


  const selectedVariant = useMemo(() => {
    if (!product) {
      return null;
    }

    return (
      findVariant(product.variants, selectedVariantId) ??
      getInitialVariant(product.variants, requestedVariant)
    );
  }, [
    product,
    requestedVariant,
    selectedVariantId,
  ]);

  const selectedImage =
    product && selectedImageOverride?.productId === product.id
      ? selectedImageOverride.src
      : product
        ? getVariantImage(product, selectedVariant)
        : PRODUCT_PLACEHOLDER_IMAGE;

  const productImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return getProductImages(
      product,
      selectedVariant,
    );
  }, [product, selectedVariant]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return getRelatedProducts(
      products,
      product,
    );
  }, [product, products]);

  const packPrice =
    selectedVariant?.price ?? null;

  const packSize =
    selectedVariant?.pack ?? 1;

  const perUnitPrice =
    packPrice !== null && packSize > 0
      ? packPrice / packSize
      : null;

  const selectedCartKey =
    product && selectedVariant
      ? createCartKey(product.id, selectedVariant.id)
      : null;

  const selectedCartItem = selectedCartKey
    ? cartItems.find(
        (item) =>
          createCartKey(item.productId, item.variantId) === selectedCartKey,
      )
    : undefined;

  const selectedCartQuantity = selectedCartItem?.quantity ?? 0;
  const displayedQuantity = selectedCartQuantity > 0
    ? selectedCartQuantity
    : quantity;

  const selectedCartInput =
    product && selectedVariant
      ? getCartItemFromVariant(
          product,
          selectedVariant,
          displayedQuantity,
        )
      : null;

  const lineTotal =
    packPrice !== null
      ? packPrice * displayedQuantity
      : null;

  const canAddToCart = Boolean(
    selectedVariant &&
      selectedVariant.inStock &&
      selectedVariant.price !== null,
  );

  function selectVariant(
    variant: ProductVariant,
  ) {
    if (!product) {
      return;
    }

    const nextCartKey = createCartKey(product.id, variant.id);
    const nextCartQuantity =
      cartItems.find(
        (item) =>
          createCartKey(item.productId, item.variantId) === nextCartKey,
      )?.quantity ?? 0;

    setSelectedVariantId(variant.id);
    setQuantity(nextCartQuantity > 0 ? nextCartQuantity : 1);

    setSelectedImageOverride({
      productId: product.id,
      src: getVariantImage(product, variant),
    });
  }

  function handleQuantityChange(nextQuantity: number) {
    if (selectedCartKey && selectedCartQuantity > 0) {
      setItemQuantity(selectedCartKey, nextQuantity);
      return;
    }

    setQuantity(nextQuantity);
  }

  function handleRequestPrice(
    productId: string,
    variantId: string,
  ) {
    const targetProduct = products.find(
      (item) => item.id === productId,
    );

    if (!targetProduct) {
      return;
    }

    const query = new URLSearchParams({
      product: targetProduct.name,
      variant: variantId,
    });

    window.location.href =
      `/contact?${query.toString()}`;
  }

  if (loadStatus === "loading") {
    return (
      <main className="min-h-screen bg-[#f8fbff] px-4 py-16">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
            <div className="aspect-square animate-pulse rounded-[28px] bg-slate-200" />
            <div className="space-y-4">
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-96 animate-pulse rounded-[24px] bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f8fbff] px-4">
        <div className="max-w-md rounded-[24px] border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-950">
            Product could not be loaded
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Confirm that the product JSON exists
            inside{" "}
            <code className="rounded bg-slate-100 px-1.5 py-1">
              public/data
            </code>
            .
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  if (
    loadStatus === "not-found" ||
    !product
  ) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-[#f8fbff] px-4">
        <div className="max-w-md rounded-[24px] border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-950">
            Product not found
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            No product matched{" "}
            <strong>{slug}</strong>.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse all products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-2 px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            className="transition hover:text-blue-700"
          >
            Home
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href="/products"
            className="transition hover:text-blue-700"
          >
            Products
          </Link>

          <span aria-hidden="true">/</span>

          <span className="font-medium text-slate-900">
            {product.name}
          </span>
        </nav>
      </div>

      <section className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_340px] lg:items-start">
          <div>
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
              <div className="relative aspect-square overflow-hidden rounded-[20px] bg-slate-50">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 430px"
                  className="object-contain p-6"
                  onError={() => {
                    setSelectedImageOverride({
                      productId: product.id,
                      src: PRODUCT_PLACEHOLDER_IMAGE,
                    });
                  }}
                />
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {productImages.map((image) => {
                  const selected =
                    image === selectedImage;

                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() =>
                        setSelectedImageOverride({
                          productId: product.id,
                          src: image,
                        })
                      }
                      aria-label={`View image of ${product.name}`}
                      className={[
                        "h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border bg-white p-2 transition",
                        selected
                          ? "border-blue-600 ring-2 ring-blue-100"
                          : "border-slate-200 hover:border-blue-300",
                      ].join(" ")}
                    >
                      <Image
                        src={image}
                        alt=""
                        width={64}
                        height={64}
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {product.category}
              </span>

              {selectedVariant?.inStock ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  In stock
                </span>
              ) : (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Out of stock
                </span>
              )}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Product code {product.sku}
            </p>

            <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              {product.name}
            </h1>

            {product.features.length > 0 && (
              <div className="mt-7">
                <h2 className="text-sm font-semibold text-slate-950">
                  Product features
                </h2>

                <ul className="mt-4 space-y-3">
                  {product.features.map(
                    (feature, index) => (
                      <li
                        key={`${feature}-${index}`}
                        className="flex gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                        <span>{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {product.variants.length > 0 && (
              <fieldset className="mt-8">
                <legend className="text-sm font-semibold text-slate-950">
                  Select variant
                </legend>

                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map(
                    (variant) => {
                      const selected =
                        variant.id ===
                        selectedVariant?.id;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={
                            !variant.inStock
                          }
                          aria-pressed={selected}
                          onClick={() =>
                            selectVariant(variant)
                          }
                          title={
                            variant.specsText ||
                            variant.sku
                          }
                          className={[
                            "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
                            !variant.inStock
                              ? "cursor-not-allowed bg-slate-100 text-slate-400 opacity-50"
                              : "",
                          ].join(" ")}
                        >
                          {getVariantLabel(
                            variant,
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </fieldset>
            )}

            {selectedVariant && (
              <div className="mt-8 overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-950">
                    Selected specification
                  </h2>
                </div>

                <dl className="divide-y divide-slate-100 px-5">
                  <div className="flex justify-between gap-5 py-3 text-sm">
                    <dt className="text-slate-500">
                      Catalogue number
                    </dt>

                    <dd className="font-semibold text-slate-900">
                      {selectedVariant.sku}
                    </dd>
                  </div>

                  {Object.entries(
                    selectedVariant.specs,
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-5 py-3 text-sm"
                    >
                      <dt className="text-slate-500">
                        {key}
                      </dt>

                      <dd className="text-right font-semibold text-slate-900">
                        {value}
                      </dd>
                    </div>
                  ))}

                  <div className="flex justify-between gap-5 py-3 text-sm">
                    <dt className="text-slate-500">
                      Pack quantity
                    </dt>

                    <dd className="font-semibold text-slate-900">
                      {packSize} pieces
                    </dd>
                  </div>

                  <div className="flex justify-between gap-5 py-3 text-sm">
                    <dt className="text-slate-500">
                      HSN code
                    </dt>

                    <dd className="font-semibold text-slate-900">
                      {product.hsnCode ||
                        "â€”"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <aside className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Selected variant
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {selectedVariant?.sku ??
                "No variant"}
            </p>

            <div className="mt-6">
              {packPrice !== null ? (
                <>
                  <p className="text-3xl font-bold tracking-[-0.04em] text-slate-950">
                    {formatProductPrice(packPrice)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Pack of {packSize}
                    </span>

                    {perUnitPrice !== null && (
                      <span className="text-xs text-slate-400">
                        {formatProductPrice(
                          perUnitPrice,
                        )}
                        /piece
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xl font-semibold text-slate-950">
                  {selectedVariant
                    ? formatProductPrice(
                        selectedVariant.price,
                        selectedVariant.priceLabel,
                      )
                    : "On Request"}
                </p>
              )}
            </div>

            <div className="mt-6 rounded-[16px] bg-slate-50 p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Availability
                </span>

                <span
                  className={
                    selectedVariant?.inStock
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-red-700"
                  }
                >
                  {selectedVariant?.inStock
                    ? "In stock"
                    : "Out of stock"}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-slate-500">
                  Pack size
                </span>

                <span className="font-semibold text-slate-900">
                  {packSize} pieces
                </span>
              </div>
            </div>

            {packPrice !== null && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold text-slate-900">
                  Number of packs
                </p>

                <QuantitySelector
                  quantity={displayedQuantity}
                  onChange={handleQuantityChange}
                />
              </div>
            )}

            {lineTotal !== null && (
              <div className="mt-6 flex justify-between gap-4 border-t border-slate-100 pt-5">
                <span className="text-sm text-slate-500">
                  Total
                </span>

                <span className="text-lg font-bold text-slate-950">
                  {formatProductPrice(lineTotal)}
                </span>
              </div>
            )}

            {packPrice !== null ? (
              <AddToCartButton
                item={selectedCartInput}
                disabled={!canAddToCart}
                ariaLabel={`Add ${product.name} ${selectedVariant?.sku ?? "selected variant"} to cart`}
                className={[
                  "mt-6 w-full rounded-[14px] px-5 py-3.5 text-sm font-semibold transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                  canAddToCart
                    ? "bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.24)] hover:-translate-y-0.5 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-400",
                ].join(" ")}
                counterClassName="mt-6 grid w-full grid-cols-[44px_minmax(0,1fr)_44px] overflow-hidden rounded-[14px] border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700"
              >
                Add to cart
              </AddToCartButton>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleRequestPrice(
                    product.id,
                    selectedVariant?.id ?? "",
                  )
                }
                className="mt-6 w-full rounded-[14px] bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Request price
              </button>
            )}

            {selectedVariant &&
              product.variants.length > 1 && (
                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Prices and pack quantities may
                  vary by selected specification.
                </p>
              )}
          </aside>
        </div>
      </section>

      {product.variants.length > 0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1360px] px-4 py-12 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Catalogue data
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                Variants and specifications
              </h2>
            </div>

            <div className="mt-7 overflow-x-auto rounded-[20px] border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Catalogue number
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Specification
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Pack
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Price
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-700">
                      Availability
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {product.variants.map(
                    (variant) => {
                      const selected =
                        selectedVariant?.id ===
                        variant.id;

                      return (
                        <tr
                          key={variant.id}
                          className={
                            selected
                              ? "bg-blue-50/60"
                              : "transition hover:bg-slate-50"
                          }
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700">
                            {variant.sku}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {variant.specsText ||
                              getVariantLabel(
                                variant,
                              )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {variant.pack} pieces
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            {formatProductPrice(
                              variant.price,
                              variant.priceLabel,
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={
                                variant.inStock
                                  ? "font-semibold text-emerald-700"
                                  : "font-semibold text-red-700"
                              }
                            >
                              {variant.inStock
                                ? "In stock"
                                : "Out of stock"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={
                                !variant.inStock
                              }
                              onClick={() => {
                                selectVariant(
                                  variant,
                                );

                                window.scrollTo({
                                  top: 0,
                                  behavior:
                                    "smooth",
                                });
                              }}
                              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {selected
                                ? "Selected"
                                : "Select"}
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="bg-[#f8fbff]">
          <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  More products
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Related products
                </h2>
              </div>

              <Link
                href="/products"
                className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                View all
              </Link>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map(
                (relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    onRequestPrice={
                      handleRequestPrice
                    }
                  />
                ),
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

















