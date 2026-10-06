"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import AddToCartButton from "@/features/cart/components/add-to-cart-button";
import { Icon } from "@/features/home/components/icon";
import type { Product } from "@/features/products/types";
import {
  formatProductPrice,
  getCartItemFromVariant,
  getInitialVariant,
  getProductHref,
  getVariantImage,
  PRODUCT_PLACEHOLDER_IMAGE,
} from "@/features/products/utils";

type ProductCardProps = {
  product: Product;
  onRequestPrice?: (productId: string, variantId: string) => void;
};

export function ProductCard({
  product,
  onRequestPrice,
}: ProductCardProps) {
  const selectedVariant = useMemo(
    () => getInitialVariant(product.variants),
    [product.variants],
  );

  const href = getProductHref(product);
  const imageSource = getVariantImage(product, selectedVariant);
  const hasImage = imageSource !== PRODUCT_PLACEHOLDER_IMAGE;
  const hasPrice = typeof selectedVariant?.price === "number";
  const isAvailable = selectedVariant?.inStock === true;
  const optionCount = product.variants.length;

  const cartItem = useMemo(
    () =>
      selectedVariant
        ? getCartItemFromVariant(product, selectedVariant)
        : null,
    [product, selectedVariant],
  );

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
    <article className="pcard pcard-boxed">
      <div className="pcard-media">
        {hasImage ? (
          <Image
            src={imageSource}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <Icon name="glassware" />
        )}
      </div>

      <div className="pcard-body">
        <h3 className="pcard-title">
          <Link href={href}>{product.name}</Link>
        </h3>

        <p className="truncate text-xs text-ink-3">
          {product.category}
          {optionCount > 1 && ` · ${optionCount} options`}
        </p>

        <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
          <span className="pcard-price">
            {selectedVariant
              ? formatProductPrice(selectedVariant.price, selectedVariant.priceLabel)
              : "Unavailable"}
          </span>
          {hasPrice && <span className="text-xs text-ink-3">/ pack of {selectedVariant?.pack}</span>}
        </p>
      </div>

      <div className="pcard-actions">
        {cartItem && isAvailable ? (
          <AddToCartButton
            item={cartItem}
            ariaLabel={`${getActionLabel()} - ${product.name}`}
            className="btn btn-brand btn-sm btn-block"
            counterClassName="qty qty-block h-9"
          >
            <Icon name="cart" className="h-4 w-4" />
            {getActionLabel()}
          </AddToCartButton>
        ) : (
          <button
            type="button"
            disabled={!selectedVariant || !isAvailable}
            onClick={() => selectedVariant && onRequestPrice?.(product.id, selectedVariant.id)}
            aria-label={`${getActionLabel()} - ${product.name}`}
            className="btn btn-brand btn-sm btn-block"
          >
            {getActionLabel()}
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
