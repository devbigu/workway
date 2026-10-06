"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AddCartItemInput } from "@/features/cart/types";
import { useCartStore } from "@/features/cart/store/cart-store";
import { formatCurrency } from "@/features/account/presentation";

export type SavedProduct = { id: string; slug: string; name: string; image: string | null; available: boolean; pricePaise: number | null; cart: AddCartItemInput | null };

export function SavedItemsGrid({ products }: { products: SavedProduct[] }) {
  const router = useRouter(); const addItem = useCartStore((state) => state.addItem); const [message,setMessage]=useState("");
  async function remove(productId:string){if(!window.confirm("Remove this saved product?"))return;const response=await fetch("/api/account/saved-items",{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({productId})});setMessage(response.ok?"Removed from saved items":"Unable to remove item");if(response.ok)router.refresh();}
  return <><p aria-live="polite" className="min-h-5 text-sm text-slate-600">{message}</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{products.map(product=><article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><Link href={`/products/${product.slug}`} className="grid h-44 place-items-center bg-slate-50">{product.image?<Image src={product.image} alt="" width={220} height={160} unoptimized className="h-full w-full object-contain p-4"/>:<span className="text-sm text-slate-400">No image</span>}</Link><div className="p-5"><h3 className="font-black">{product.name}</h3><p className={`mt-2 text-sm font-bold ${product.available?"text-emerald-700":"text-red-700"}`}>{product.available?"In stock":"Unavailable"}</p><p className="mt-2 text-lg font-black">{product.pricePaise===null?"Price unavailable":formatCurrency(product.pricePaise)}</p><div className="mt-4 flex gap-2"><button disabled={!product.cart} onClick={()=>{if(product.cart){addItem(product.cart);setMessage(product.name+" added to cart");}}} className="min-h-11 flex-1 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white disabled:bg-slate-300">Add to Cart</button><button onClick={()=>remove(product.id)} aria-label={`Remove ${product.name} from saved items`} className="min-h-11 rounded-xl border px-4 text-sm font-bold text-red-700">Remove</button></div></div></article>)}</div></>;
}
