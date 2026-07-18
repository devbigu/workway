"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProductCard from "@/features/products/components/product-card";
import { loadProducts } from "@/features/products/data";
import type { Product } from "@/features/products/types";
import {
  getLowestPricedVariant,
} from "@/features/products/utils";

const PAGE_SIZE = 24;

type LoadStatus = "loading" | "success" | "error";

type SortOption =
  | "default"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc";

type PaginationItem = number | "ellipsis";

function getProductCategories(product: Product): string[] {
  const values = new Set<string>();

  if (product.category.trim()) {
    values.add(product.category.trim());
  }

  product.categories.forEach((categoryPath) => {
    const parts = categoryPath
      .split(">")
      .map((part) => part.trim())
      .filter(Boolean);

    parts.forEach((part) => values.add(part));
  });

  return Array.from(values);
}

function matchesSearch(product: Product, searchQuery: string): boolean {
  const query = searchQuery.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const searchableValues = [
    product.id,
    product.sku,
    product.slug,
    product.name,
    product.category,
    ...product.categories,
    ...product.features,
    ...product.variants.flatMap((variant) => [
      variant.id,
      variant.sku,
      variant.slug,
      variant.name,
      variant.specsText,
      ...Object.keys(variant.specs),
      ...Object.values(variant.specs),
    ]),
  ];

  return searchableValues.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(query),
  );
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const items: PaginationItem[] = [1];

  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  if (rangeStart > 2) {
    items.push("ellipsis");
  }

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    items.push(page);
  }

  if (rangeEnd < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3"
        >
          <div className="aspect-square animate-pulse rounded-[18px] bg-slate-100" />

          <div className="space-y-3 px-1 pb-2 pt-5">
            <div className="h-5 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadStatus, setLoadStatus] =
    useState<LoadStatus>("loading");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] =
    useState<SortOption>("default");
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    loadProducts(controller.signal)
      .then((validProducts) => {
        setProducts(validProducts);
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
  }, []);

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();

    products.forEach((product) => {
      const productCategories = new Set(
        getProductCategories(product),
      );

      productCategories.forEach((category) => {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([label, count]) => ({
        label,
        count,
      }))
      .sort((first, second) =>
        first.label.localeCompare(second.label),
      );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      if (!matchesSearch(product, searchQuery)) {
        return false;
      }

      if (inStockOnly) {
        const hasInStockVariant = product.variants.some(
          (variant) => variant.inStock,
        );

        if (!hasInStockVariant) {
          return false;
        }
      }

      if (selectedCategories.length > 0) {
        const productCategories =
          getProductCategories(product);

        const matchesSelectedCategory =
          selectedCategories.some((selectedCategory) =>
            productCategories.includes(selectedCategory),
          );

        if (!matchesSelectedCategory) {
          return false;
        }
      }

      return true;
    });

    if (sortBy === "name_asc") {
      nextProducts.sort((first, second) =>
        first.name.localeCompare(second.name),
      );
    }

    if (sortBy === "name_desc") {
      nextProducts.sort((first, second) =>
        second.name.localeCompare(first.name),
      );
    }

    if (sortBy === "price_asc") {
      nextProducts.sort((first, second) => {
        const firstPrice =
          getLowestPricedVariant(first)?.price ?? Number.POSITIVE_INFINITY;
        const secondPrice =
          getLowestPricedVariant(second)?.price ?? Number.POSITIVE_INFINITY;

        return firstPrice - secondPrice;
      });
    }

    if (sortBy === "price_desc") {
      nextProducts.sort((first, second) => {
        const firstPrice = getLowestPricedVariant(first)?.price ?? -1;
        const secondPrice = getLowestPricedVariant(second)?.price ?? -1;

        return secondPrice - firstPrice;
      });
    }

    return nextProducts;
  }, [
    products,
    searchQuery,
    inStockOnly,
    selectedCategories,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const pageStart =
    (safeCurrentPage - 1) * PAGE_SIZE;

  const displayedProducts = filteredProducts.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  const paginationItems = getPaginationItems(
    safeCurrentPage,
    totalPages,
  );

  const activeFilterCount =
    selectedCategories.length + (inStockOnly ? 1 : 0);

  function toggleCategory(category: string) {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter(
            (currentCategory) =>
              currentCategory !== category,
          )
        : [...currentCategories, category],
    );

    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategories([]);
    setInStockOnly(false);
    setSortBy("default");
    setCurrentPage(1);
  }

  function goToPage(page: number) {
    const nextPage = Math.min(
      Math.max(page, 1),
      totalPages,
    );

    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleRequestPrice(
    productId: string,
    variantId: string,
  ) {
    const product = products.find(
      (currentProduct) =>
        currentProduct.id === productId,
    );

    if (!product) {
      return;
    }

    router.push(
      `/products/${product.slug}?variant=${encodeURIComponent(
        variantId,
      )}`,
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
          >
            <Link
              href="/"
              className="transition hover:text-blue-700"
            >
              Home
            </Link>

            <span aria-hidden="true">/</span>

            <span className="font-medium text-slate-900">
              Products
            </span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Scientific catalogue
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                All products
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Browse laboratory equipment, consumables,
                filters, glassware and scientific products.
              </p>
            </div>

            {loadStatus === "success" && (
              <p className="text-sm text-slate-500">
                <strong className="font-semibold text-slate-900">
                  {filteredProducts.length.toLocaleString(
                    "en-IN",
                  )}
                </strong>{" "}
                products found
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside className="self-start lg:sticky lg:top-28">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-950">
                  Filters
                </h2>

                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <label className="mt-5 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => {
                    setInStockOnly((current) => !current);
                    setCurrentPage(1);
                  }}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />

                <span className="text-sm text-slate-700">
                  In-stock products only
                </span>
              </label>
            </div>

            <div className="pt-5">
              <button
                type="button"
                onClick={() =>
                  setCategoriesOpen((current) => !current)
                }
                aria-expanded={categoriesOpen}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-semibold text-slate-950">
                  Categories
                </span>

                <span
                  aria-hidden="true"
                  className="text-lg text-slate-400"
                >
                  {categoriesOpen ? "−" : "+"}
                </span>
              </button>

              {categoriesOpen && (
                <div className="mt-4 max-h-[420px] space-y-1 overflow-y-auto pr-1">
                  {categoryOptions.map(
                    ({ label, count }) => {
                      const checked =
                        selectedCategories.includes(label);

                      return (
                        <label
                          key={label}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleCategory(label)
                            }
                            className="h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600"
                          />

                          <span
                            className={[
                              "min-w-0 flex-1 text-sm",
                              checked
                                ? "font-semibold text-blue-700"
                                : "text-slate-600",
                            ].join(" ")}
                          >
                            {label}
                          </span>

                          <span className="text-xs text-slate-400">
                            {count}
                          </span>
                        </label>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">
                Search products
              </span>

              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                type="search"
                value={searchQuery}
                placeholder="Search by name, catalogue number or specification"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-12 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label>
              <span className="sr-only">
                Sort products
              </span>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(
                    event.target.value as SortOption,
                  );
                  setCurrentPage(1);
                }}
                className="h-12 w-full rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-56"
              >
                <option value="default">
                  Default sorting
                </option>
                <option value="name_asc">
                  Name: A to Z
                </option>
                <option value="name_desc">
                  Name: Z to A
                </option>
                <option value="price_asc">
                  Price: Low to High
                </option>
                <option value="price_desc">
                  Price: High to Low
                </option>
              </select>
            </label>
          </div>

          {loadStatus === "loading" && <LoadingGrid />}

          {loadStatus === "error" && (
            <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-red-900">
                Products could not be loaded
              </h2>

              <p className="mt-2 text-sm text-red-700">
                Confirm that the JSON file exists at
                public/data/omsons_products_from_excel_with_images.json.
              </p>
            </div>
          )}

          {loadStatus === "success" &&
            filteredProducts.length === 0 && (
              <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>

                <h2 className="mt-5 text-lg font-semibold text-slate-950">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Change the search term or remove some
                  filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}

          {loadStatus === "success" &&
            displayedProducts.length > 0 && (
              <>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <strong className="font-semibold text-slate-900">
                      {pageStart + 1}–
                      {Math.min(
                        pageStart + PAGE_SIZE,
                        filteredProducts.length,
                      )}
                    </strong>{" "}
                    of{" "}
                    <strong className="font-semibold text-slate-900">
                      {filteredProducts.length}
                    </strong>
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onRequestPrice={handleRequestPrice}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label="Product pagination"
                    className="mt-12 flex flex-wrap items-center justify-center gap-2"
                  >
                    <button
                      type="button"
                      disabled={safeCurrentPage === 1}
                      onClick={() =>
                        goToPage(safeCurrentPage - 1)
                      }
                      className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {paginationItems.map((item, index) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="grid h-10 w-10 place-items-center text-slate-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => goToPage(item)}
                          aria-current={
                            item === safeCurrentPage
                              ? "page"
                              : undefined
                          }
                          className={[
                            "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold transition",
                            item === safeCurrentPage
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700",
                          ].join(" ")}
                        >
                          {item}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      disabled={
                        safeCurrentPage === totalPages
                      }
                      onClick={() =>
                        goToPage(safeCurrentPage + 1)
                      }
                      className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
        </section>
      </div>
    </main>
  );
}




