"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import AddToCartButton from "@/features/cart/components/add-to-cart-button";
import type { Product } from "@/features/products/types";
import {
  findVariant,
  formatProductPrice,
  getCartItemFromVariant,
  getInitialVariant,
  getProductHref,
  getVariantImage,
  getVariantLabel,
} from "@/features/products/utils";

type ProductCardProps = {
  product: Product;
  onRequestPrice?: (productId: string, variantId: string) => void;
};

export function ProductCard({
  product,
  onRequestPrice,
}: ProductCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | null
  >(null);

  const initialVariant = useMemo(
    () => getInitialVariant(product.variants),
    [product.variants],
  );

  const selectedVariant = useMemo(
    () =>
      findVariant(product.variants, selectedVariantId) ??
      initialVariant,
    [initialVariant, product.variants, selectedVariantId],
  );

  const displayedVariants = useMemo(
    () =>
      [...product.variants]
        .sort((first, second) => {
          if (first.inStock === second.inStock) {
            return 0;
          }

          return first.inStock ? -1 : 1;
        })
        .slice(0, 2),
    [product.variants],
  );

  const hasMoreVariants = product.variants.length > 2;

  const imageSource = getVariantImage(product, selectedVariant);

  const description =
    product.features.find((feature) => feature.trim().length > 0) ??
    `Explore specifications and available variants for ${product.name}.`;

  const hasPrice = typeof selectedVariant?.price === "number";
  const isAvailable = selectedVariant?.inStock === true;

  const cartItem = useMemo(
    () =>
      selectedVariant
        ? getCartItemFromVariant(product, selectedVariant)
        : null,
    [product, selectedVariant],
  );

  function handleAction() {
    if (!selectedVariant || !isAvailable) {
      return;
    }

    if (!hasPrice) {
      onRequestPrice?.(product.id, selectedVariant.id);
      return;
    }
  }

  function getActionLabel(): string {
    if (!selectedVariant || !isAvailable) {
      return "Out of stock";
    }

    if (!hasPrice) {
      return "Request price";
    }

    return "Add to cart";
  }

  return (
    <article className="group flex h-full w-full flex-col rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.13)]">
      <Link
        href={getProductHref(product)}
        className="relative block aspect-square overflow-hidden rounded-[18px] bg-[#f1f1ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <Image
          src={imageSource}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {!isAvailable && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={getProductHref(product)}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <h3 className="line-clamp-2 text-lg font-semibold leading-6 tracking-[-0.02em] text-slate-950 transition-colors hover:text-blue-700">
                {product.name}
              </h3>
            </Link>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {product.category}
            </p>
          </div>

          <p className="shrink-0 text-right text-lg font-bold tracking-[-0.02em] text-slate-950">
            {selectedVariant
              ? formatProductPrice(
                  selectedVariant.price,
                  selectedVariant.priceLabel,
                )
              : "Unavailable"}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
          {description}
        </p>

        {selectedVariant && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Cat. No.{" "}
              <strong className="font-semibold text-slate-700">
                {selectedVariant.sku}
              </strong>
            </span>

            <span>
              Pack of{" "}
              <strong className="font-semibold text-slate-700">
                {selectedVariant.pack}
              </strong>
            </span>
          </div>
        )}

        {product.variants.length > 0 && (
          <fieldset className="mt-5">
            <legend className="text-xs font-semibold text-slate-800">
              Select variant
            </legend>

            <div className="mt-2 flex flex-wrap gap-2">
              {displayedVariants.map((variant) => {
                const selected = variant.id === selectedVariant?.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.inStock}
                    aria-pressed={selected}
                    title={variant.specsText || variant.sku}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                      selected
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700",
                      !variant.inStock
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                        : "",
                    ].join(" ")}
                  >
                    {getVariantLabel(variant)}
                  </button>
                );
              })}

              {hasMoreVariants && (
                <Link
                  href={getProductHref(product)}
                  className="rounded-lg border border-dashed border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Click for more info
                </Link>
              )}
            </div>
          </fieldset>
        )}

        {selectedVariant && (
          <p
            className={[
              "mt-3 text-xs font-medium",
              selectedVariant.inStock
                ? "text-emerald-700"
                : "text-red-600",
            ].join(" ")}
          >
            {selectedVariant.inStock
              ? hasPrice
                ? "In stock"
                : "Price available on request"
              : "Currently unavailable"}
          </p>
        )}

        {cartItem && isAvailable ? (
          <AddToCartButton
            item={cartItem}
            ariaLabel={`${getActionLabel()} - ${product.name}`}
            className="mt-5 w-full rounded-[13px] bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {getActionLabel()}
          </AddToCartButton>
        ) : (
          <button
            type="button"
            disabled={!selectedVariant || !isAvailable}
            onClick={handleAction}
            aria-label={`${getActionLabel()} - ${product.name}`}
            className="mt-5 w-full rounded-[13px] bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {getActionLabel()}
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;




