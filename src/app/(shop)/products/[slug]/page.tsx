"use client";

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

import { CopyButton } from "@/components/shared/copy-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/page-header";
import AddToCartButton from "@/features/cart/components/add-to-cart-button";
import { Icon } from "@/features/home/components/icon";
import ProductCard from "@/features/products/components/product-card";
import ProductGalleryPremium from "@/features/products/components/product-gallery-premium";
import ProductContent from "@/features/products/components/product-content";
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

function formatPerUnit(price: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}

function QuantitySelector({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="qty" role="group" aria-label="Number of packs">
      <button type="button" onClick={() => onChange(Math.max(1, quantity - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
        &minus;
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={quantity}
        onChange={(event) => {
          const nextQuantity = Number.parseInt(event.target.value, 10);
          onChange(Number.isFinite(nextQuantity) ? Math.max(1, nextQuantity) : 1);
        }}
        aria-label="Quantity"
      />
      <button type="button" onClick={() => onChange(quantity + 1)} aria-label="Increase quantity">+</button>
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

    // Keep the selected variant shareable without a navigation.
    window.history.replaceState(null, "", `?variant=${encodeURIComponent(variant.id)}`);
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
    const variant = targetProduct?.variants.find((item) => item.id === variantId);

    if (!targetProduct) {
      return;
    }

    window.location.href = `/contact?${new URLSearchParams({ sku: variant?.sku ?? targetProduct.sku, product: targetProduct.name })}`;
  }

  if (loadStatus === "loading") {
    return (
      <main className="page-wrap pb-16" aria-busy="true">
        <div className="skeleton mt-8 h-3 w-48" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <div className="skeleton aspect-square rounded-md" />
          <div className="grid content-start gap-4">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-12 w-4/5" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton mt-6 h-11 w-2/3" />
            <div className="skeleton mt-6 h-8 w-40" />
            <div className="skeleton mt-6 h-13 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className="page-wrap">
        <EmptyState
          icon="alert"
          title="This product could not be loaded."
          text="The catalogue data did not load. Check your connection and try again."
          action={<Link href="/products" className="btn btn-primary">Back to products</Link>}
        />
      </main>
    );
  }

  if (
    loadStatus === "not-found" ||
    !product
  ) {
    return (
      <main className="page-wrap">
        <EmptyState
          title={<>No product matches <em>‘{slug}’</em></>}
          text="It may have been renamed or removed from the catalogue."
          action={<Link href="/products" className="btn btn-primary">Browse all products</Link>}
        />
      </main>
    );
  }

  const lead = product.features.find((feature) => feature.trim());
  const sku = selectedVariant?.sku ?? product.sku;
  const quoteHref = `/contact?${new URLSearchParams({ sku, qty: String(displayedQuantity) })}`;
  const priceText = packPrice !== null
    ? formatProductPrice(packPrice)
    : formatProductPrice(null, selectedVariant?.priceLabel);
  const buyButton = selectedCartQuantity > 0 ? (
    <Link href="/cart" className="btn btn-secondary btn-lg flex-1">In cart · View cart</Link>
  ) : (
    <AddToCartButton
      item={selectedCartInput}
      disabled={!canAddToCart}
      ariaLabel={`Add ${product.name} ${selectedVariant?.sku ?? "selected variant"} to cart`}
      className="btn btn-primary btn-lg flex-1"
    >
      Add to cart
    </AddToCartButton>
  );

  return (
    <main>
      <div className="page-wrap pb-16">
        <div className="pt-6 lg:pt-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.category, href: `/products?category=${encodeURIComponent(product.category)}` }, { label: product.name }]} />
        </div>

        <section className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <ProductGalleryPremium
            images={productImages}
            activeImage={selectedImage}
            productName={product.name}
            onChange={(src) =>
              setSelectedImageOverride({
                productId: product.id,
                src,
              })
            }
          />

          <div>
            <div className="flex items-center gap-1">
              <span className="meta">Cat. No. <span className="text-ink-2">{sku}</span></span>
              <CopyButton value={sku} label={`Copy catalogue number ${sku}`} />
            </div>

            <h1 className="page-title mt-2">{product.name}</h1>

            {lead && <p className="mt-4 max-w-[60ch] text-ink-2">{lead}</p>}

            {product.variants.length > 1 && (
              <fieldset className="mt-8">
                <legend className="field-label">Variant</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!variant.inStock}
                      aria-pressed={variant.id === selectedVariant?.id}
                      onClick={() => selectVariant(variant)}
                      title={variant.specsText || variant.sku}
                      className="option"
                    >
                      {getVariantLabel(variant)}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mt-8">
              <p className="figure-lg">{priceText}</p>
              {packPrice !== null && (
                <p className="mt-2 text-sm text-ink-3">
                  per pack of {packSize}
                  {perUnitPrice !== null && <> · {formatPerUnit(perUnitPrice)} per unit</>}
                  {" "}· excl. GST
                </p>
              )}
            </div>

            <p className="mt-4">
              {selectedVariant?.inStock ? <span className="badge badge-success">In stock</span> : <span className="badge">Out of stock</span>}
            </p>

            <div className="mt-6 grid gap-3">
              {packPrice !== null ? (
                <>
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="grid gap-1">
                      <QuantitySelector quantity={displayedQuantity} onChange={handleQuantityChange} />
                      <span className="meta pl-4">packs of {packSize}</span>
                    </div>
                    {buyButton}
                  </div>
                  {lineTotal !== null && (
                    <p className="text-sm text-ink-3">Line total <span className="figure ml-1">{formatProductPrice(lineTotal)}</span></p>
                  )}
                </>
              ) : (
                <button type="button" onClick={() => handleRequestPrice(product.id, selectedVariant?.id ?? "")} className="btn btn-primary btn-lg btn-block">
                  Request price
                </button>
              )}
              <Link href={quoteHref} className="btn btn-secondary btn-block">Request bulk quote</Link>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-ink-2">
              <Icon name="truck" className="h-4 w-4 text-ink-3" />
              Pan-India delivery · GST invoice with every order
            </p>
          </div>
        </section>
      </div>

      <ProductContent product={product} variant={selectedVariant} />

      {product.variants.length > 1 && (
        <section className="border-t border-line py-16 lg:py-24" aria-labelledby="variants-title">
          <div className="page-wrap">
            <h2 id="variants-title" className="section-title">All variants</h2>
            <p className="meta mt-3">{product.variants.length} catalogue numbers</p>
            <div className="mt-8 overflow-x-auto">
              <table className="table table-stack">
                <thead>
                  <tr>
                    <th scope="col">Cat. No.</th>
                    <th scope="col">Specification</th>
                    <th scope="col" className="num">Pack</th>
                    <th scope="col" className="num">Price</th>
                    <th scope="col">Availability</th>
                    <th scope="col"><span className="sr-only">Select</span></th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => {
                    const selected = selectedVariant?.id === variant.id;

                    return (
                      <tr key={variant.id} aria-selected={selected}>
                        <td className="font-mono font-medium text-ink">{variant.sku}</td>
                        <td data-label="Specification"><span>{variant.specsText || getVariantLabel(variant)}</span></td>
                        <td className="num" data-label="Pack"><span>{variant.pack}</span></td>
                        <td className="num" data-label="Price"><span>{formatProductPrice(variant.price, variant.priceLabel)}</span></td>
                        <td data-label="Availability">
                          <span>{variant.inStock ? <span className="badge badge-success">In stock</span> : <span className="badge">Out of stock</span>}</span>
                        </td>
                        <td data-label="">
                          <button
                            type="button"
                            disabled={!variant.inStock || selected}
                            onClick={() => {
                              selectVariant(variant);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            {selected ? "Selected" : "Select"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="border-t border-line py-16 lg:py-24" aria-labelledby="related-title">
          <div className="page-wrap">
            <div className="mb-10 flex items-end justify-between gap-5">
              <h2 id="related-title" className="section-title">Related products</h2>
              <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="link link-arrow shrink-0 text-sm">View all</Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-8 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} onRequestPrice={handleRequestPrice} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="action-bar">
        <div className="min-w-0">
          <p className="figure">{priceText}</p>
          {packPrice !== null && <p className="meta">per pack of {packSize}</p>}
        </div>
        <div className="ml-auto flex">{packPrice !== null ? buyButton : null}</div>
      </div>
    </main>
  );
}
