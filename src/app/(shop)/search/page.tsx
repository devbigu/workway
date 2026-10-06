import { redirect } from "next/navigation";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  redirect(typeof q === "string" && q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
}
