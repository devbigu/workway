"use client";

import Image from "next/image";
import { useRef, type KeyboardEvent } from "react";

import { Icon } from "@/features/home/components/icon";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/features/products/utils";

type Props = {
  images: string[];
  activeImage: string;
  productName: string;
  onChange: (image: string) => void;
};

export default function ProductGalleryPremium({ images, activeImage, productName, onChange }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const index = Math.max(0, images.indexOf(activeImage));
  const multiple = images.length > 1;
  const missing = activeImage === PRODUCT_PLACEHOLDER_IMAGE;
  const show = (next: number) => {
    const image = images[(next + images.length) % images.length];
    if (image) onChange(image);
  };
  const onArrowKeys = (event: KeyboardEvent) => {
    if (!multiple) return;
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  };

  return (
    <div className="lg:sticky lg:top-[92px] lg:self-start">
      <div
        tabIndex={multiple ? 0 : -1}
        aria-label={`${productName} image gallery`}
        onKeyDown={onArrowKeys}
        onTouchStart={(event) => {
          event.currentTarget.dataset.x = String(event.touches[0]?.clientX ?? 0);
        }}
        onTouchEnd={(event) => {
          const delta = (event.changedTouches[0]?.clientX ?? 0) - Number(event.currentTarget.dataset.x ?? 0);
          if (multiple && Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1));
        }}
        className="relative aspect-square touch-pan-y overflow-hidden rounded-md bg-surface-alt"
      >
        {missing ? (
          <div className="grid h-full place-items-center text-ink-3">
            <Icon name="glassware" className="h-1/3 w-1/3" strokeWidth={1} />
          </div>
        ) : (
          <button type="button" onClick={() => dialogRef.current?.showModal()} aria-label="View image full screen" className="absolute inset-0 cursor-zoom-in">
            <Image
              key={activeImage}
              src={activeImage}
              alt={`${productName}, image ${index + 1} of ${images.length}`}
              fill
              unoptimized
              preload
              sizes="(min-width: 1024px) 55vw, 100vw"
              onError={() => onChange(PRODUCT_PLACEHOLDER_IMAGE)}
              className="object-contain p-[8%] mix-blend-multiply"
            />
          </button>
        )}
        {multiple && (
          <>
            <button type="button" onClick={() => show(index - 1)} aria-label="Previous product image" className="btn btn-icon absolute left-3 top-1/2 -translate-y-1/2 bg-surface/80">
              <Icon name="chevron" className="h-5 w-5 rotate-180" />
            </button>
            <button type="button" onClick={() => show(index + 1)} aria-label="Next product image" className="btn btn-icon absolute right-3 top-1/2 -translate-y-1/2 bg-surface/80">
              <Icon name="chevron" className="h-5 w-5" />
            </button>
            <span className="meta absolute bottom-3 right-4">{index + 1} / {images.length}</span>
          </>
        )}
      </div>

      {multiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => show(imageIndex)}
              aria-label={`View product image ${imageIndex + 1}`}
              aria-current={image === activeImage ? "true" : undefined}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xs bg-surface-alt ${image === activeImage ? "ring-1 ring-ink" : "hover:ring-1 hover:ring-line-hover"}`}
            >
              <Image src={image} alt="" fill unoptimized sizes="56px" className="object-contain p-1.5 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${productName}, enlarged image`}
        onKeyDown={onArrowKeys}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="dialog w-[min(72rem,calc(100vw-2rem))] p-4"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="meta pl-2">{multiple ? `${index + 1} / ${images.length}` : productName}</p>
          <button type="button" autoFocus onClick={() => dialogRef.current?.close()} aria-label="Close full-screen image" className="btn btn-icon">
            <Icon name="x" />
          </button>
        </div>
        <div className="relative h-[75dvh]">
          <Image src={activeImage} alt={`${productName}, enlarged`} fill unoptimized sizes="100vw" className="object-contain" />
        </div>
      </dialog>
    </div>
  );
}
