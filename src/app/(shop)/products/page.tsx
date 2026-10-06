"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { Icon } from "@/features/home/components/icon";
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
type FilterGroupId =
  | "categories"
  | "availability"
  | "price"
  | "sizes"
  | "print"
  | "materials"
  | "colours";

type FilterOption = {
  label: string;
  count: number;
};

type PriceRange = {
  id: string;
  label: string;
  min: number;
  max: number;
};

const PRICE_RANGES: PriceRange[] = [
  { id: "0-1000", label: "₹0 – ₹1,000", min: 0, max: 1000 },
  { id: "1000-5000", label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { id: "5000-10000", label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { id: "10000-plus", label: "₹10,000+", min: 10000, max: Number.POSITIVE_INFINITY },
];

const SPEC_FILTER_PATTERNS: Record<
  Extract<FilterGroupId, "sizes" | "print" | "materials" | "colours">,
  RegExp[]
> = {
  sizes: [
    /size/i,
    /capacity/i,
    /volume/i,
    /diameter/i,
    /\bdia\.?\b/i,
    /dimension/i,
    /length/i,
    /height/i,
    /width/i,
  ],
  print: [/print/i, /imprint/i, /graduation/i, /marking/i],
  materials: [/material/i],
  colours: [/colou?r/i, /color/i],
};

const FILTER_OPTION_LIMIT = 14;

const GRID_CLASS = "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4";
const CHOICE_CLASS = "choice min-h-8 gap-2.5 text-[13px] text-ink-2 hover:text-ink";
const CHECK_CLASS = "check size-4 rounded-[4px] checked:border-brand checked:bg-brand";

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

function normalizeFilterValue(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function getProductSpecValues(
  product: Product,
  groupId: Extract<FilterGroupId, "sizes" | "print" | "materials" | "colours">,
): string[] {
  const patterns = SPEC_FILTER_PATTERNS[groupId];
  const values = new Set<string>();

  product.variants.forEach((variant) => {
    Object.entries(variant.specs).forEach(([key, value]) => {
      if (!patterns.some((pattern) => pattern.test(key))) {
        return;
      }

      const nextValue = normalizeFilterValue(value);

      if (nextValue && nextValue.length <= 80) {
        values.add(nextValue);
      }
    });
  });

  return Array.from(values);
}

function hasAnyValue(productValues: string[], selectedValues: string[]): boolean {
  return selectedValues.some((selectedValue) =>
    productValues.includes(selectedValue),
  );
}

function buildFilterOptions(
  products: Product[],
  getValues: (product: Product) => string[],
  limit = FILTER_OPTION_LIMIT,
): FilterOption[] {
  const counts = new Map<string, number>();

  products.forEach((product) => {
    new Set(getValues(product)).forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      return first.label.localeCompare(second.label);
    })
    .slice(0, limit);
}

function getProductPrice(product: Product): number | null {
  return getLowestPricedVariant(product)?.price ?? null;
}

function isInPriceRange(product: Product, rangeId: string): boolean {
  const range = PRICE_RANGES.find((candidate) => candidate.id === rangeId);
  const price = getProductPrice(product);

  return !range || (price !== null && price >= range.min && price < range.max);
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get("q") ?? "";
  const initialSelectedCategories = searchParams
    .getAll("category")
    .filter(Boolean);

  return (
    <ProductsCatalogue
      key={searchParams.toString()}
      initialSearchQuery={initialSearchQuery}
      initialSelectedCategories={initialSelectedCategories}
    />
  );
}

function ProductsCatalogue({
  initialSearchQuery,
  initialSelectedCategories,
}: {
  initialSearchQuery: string;
  initialSelectedCategories: string[];
}) {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadStatus, setLoadStatus] =
    useState<LoadStatus>("loading");

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] =
    useState<SortOption>("default");
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialSelectedCategories);
  const [priceRange, setPriceRange] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrints, setSelectedPrints] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] =
    useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const drawerRef = useRef<HTMLDialogElement>(null);

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

  const categoryOptions = useMemo(
    () => buildFilterOptions(products, getProductCategories, 30),
    [products],
  );

  const sizeOptions = useMemo(
    () =>
      buildFilterOptions(products, (product) =>
        getProductSpecValues(product, "sizes"),
      ),
    [products],
  );

  const printOptions = useMemo(
    () =>
      buildFilterOptions(products, (product) =>
        getProductSpecValues(product, "print"),
      ),
    [products],
  );

  const materialOptions = useMemo(
    () =>
      buildFilterOptions(products, (product) =>
        getProductSpecValues(product, "materials"),
      ),
    [products],
  );

  const colourOptions = useMemo(
    () =>
      buildFilterOptions(products, (product) =>
        getProductSpecValues(product, "colours"),
      ),
    [products],
  );

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

      if (
        selectedCategories.length > 0 &&
        !hasAnyValue(getProductCategories(product), selectedCategories)
      ) {
        return false;
      }

      if (!isInPriceRange(product, priceRange)) {
        return false;
      }

      if (
        selectedSizes.length > 0 &&
        !hasAnyValue(
          getProductSpecValues(product, "sizes"),
          selectedSizes,
        )
      ) {
        return false;
      }

      if (
        selectedPrints.length > 0 &&
        !hasAnyValue(
          getProductSpecValues(product, "print"),
          selectedPrints,
        )
      ) {
        return false;
      }

      if (
        selectedMaterials.length > 0 &&
        !hasAnyValue(
          getProductSpecValues(product, "materials"),
          selectedMaterials,
        )
      ) {
        return false;
      }

      if (
        selectedColours.length > 0 &&
        !hasAnyValue(
          getProductSpecValues(product, "colours"),
          selectedColours,
        )
      ) {
        return false;
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
    priceRange,
    selectedSizes,
    selectedPrints,
    selectedMaterials,
    selectedColours,
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
    selectedCategories.length +
    (priceRange ? 1 : 0) +
    selectedSizes.length +
    selectedPrints.length +
    selectedMaterials.length +
    selectedColours.length +
    (inStockOnly ? 1 : 0);

  function toggleFilterValue(
    value: string,
    setSelectedValues: Dispatch<SetStateAction<string[]>>,
  ) {
    setSelectedValues((currentValues) =>
      currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value],
    );

    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange("");
    setSelectedSizes([]);
    setSelectedPrints([]);
    setSelectedMaterials([]);
    setSelectedColours([]);
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

  function renderFilterOptions(
    options: FilterOption[],
    selectedValues: string[],
    setSelectedValues: Dispatch<SetStateAction<string[]>>,
    emptyLabel: string,
  ) {
    if (options.length === 0) {
      return <p className="pb-4 text-xs text-ink-3">{emptyLabel}</p>;
    }

    return (
      <div className="pb-3">
        {options.map((option) => {
          const value = option.label;

          return (
            <label key={value} className={CHOICE_CLASS}>
              <input
                type="checkbox"
                className={CHECK_CLASS}
                checked={selectedValues.includes(value)}
                onChange={() => toggleFilterValue(value, setSelectedValues)}
              />
              <span className="min-w-0 flex-1 truncate" title={option.label}>{option.label}</span>
              <span className="text-xs tabular-nums text-ink-3">{option.count}</span>
            </label>
          );
        })}
      </div>
    );
  }

  function renderFilterSection(
    groupId: FilterGroupId,
    title: string,
    content: ReactNode,
  ) {
    return (
      <details key={groupId} className="group border-b border-line" open={groupId === "categories" || groupId === "price"}>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          {title}
          <Icon name="chevron" className="h-4 w-4 rotate-90 text-ink-3 transition-transform group-open:-rotate-90" />
        </summary>
        {content}
      </details>
    );
  }

  function renderFilters(scope: string) {
    return (
      <>
        {renderFilterSection("categories", "Categories", renderFilterOptions(categoryOptions, selectedCategories, setSelectedCategories, "No categories found."))}
        {renderFilterSection(
          "price",
          "Price Range",
          <div className="pb-3">
            {[{ id: "", label: "All" }, ...PRICE_RANGES].map((range) => (
              <label key={range.id} className={CHOICE_CLASS}>
                <input
                  type="radio"
                  name={`${scope}-price`}
                  className="radio size-4 checked:border-[5px] checked:border-brand"
                  checked={priceRange === range.id}
                  onChange={() => {
                    setPriceRange(range.id);
                    setCurrentPage(1);
                  }}
                />
                {range.label}
              </label>
            ))}
          </div>,
        )}
        {renderFilterSection("sizes", "Size", renderFilterOptions(sizeOptions, selectedSizes, setSelectedSizes, "No size specifications found."))}
        {renderFilterSection("materials", "Material", renderFilterOptions(materialOptions, selectedMaterials, setSelectedMaterials, "No material specifications found."))}
        {renderFilterSection("colours", "Colour", renderFilterOptions(colourOptions, selectedColours, setSelectedColours, "No colour specifications found."))}
        {renderFilterSection("print", "Print", renderFilterOptions(printOptions, selectedPrints, setSelectedPrints, "No print specifications found."))}
        {renderFilterSection(
          "availability",
          "Availability",
          <div className="pb-3">
            <label className={CHOICE_CLASS}>
              <input
                type="checkbox"
                className={CHECK_CLASS}
                checked={inStockOnly}
                onChange={() => {
                  setInStockOnly((current) => !current);
                  setCurrentPage(1);
                }}
              />
              In stock only
            </label>
          </div>,
        )}
      </>
    );
  }

  const titleCategory = !initialSearchQuery && initialSelectedCategories.length === 1 ? initialSelectedCategories[0] : null;
  const count = filteredProducts.length.toLocaleString("en-IN");

  return (
    <main className="pb-16">
      <section className="bg-linear-to-r from-surface-alt to-surface-alt/30">
        <div className="page-wrap py-12 lg:py-16">
          <h1 className="page-title">{initialSearchQuery ? <em>“{initialSearchQuery}”</em> : titleCategory ?? "All Products"}</h1>
          {!initialSearchQuery && (
            <p className="mt-5 max-w-[34rem] text-ink-2">
              Laboratory glassware, filtration, plasticware, instruments and consumables. Search by name, catalogue number or specification.
            </p>
          )}
        </div>
      </section>

      <div className="page-wrap mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-8">
        <div className="flex flex-col gap-3 sm:flex-row lg:col-start-2">
          <button type="button" onClick={() => drawerRef.current?.showModal()} className="btn btn-secondary lg:hidden">
            <Icon name="filter" className="h-4 w-4" />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search products</span>
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              value={searchQuery}
              placeholder="Search product name, catalogue number or specification…"
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="input rounded-full border-line bg-surface pl-11 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">Sort products</span>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="select rounded-full border-line text-sm font-medium sm:w-48"
            >
              <option value="default">Relevance</option>
              <option value="price_asc">Price, low to high</option>
              <option value="price_desc">Price, high to low</option>
              <option value="name_asc">Name, A to Z</option>
              <option value="name_desc">Name, Z to A</option>
            </select>
          </label>
        </div>

        <aside className="card hidden self-start p-5 lg:sticky lg:top-[92px] lg:block lg:max-h-[calc(100dvh-116px)] lg:overflow-y-auto" aria-label="Filters">
          <p className="flex items-center gap-2.5 border-b border-line pb-4 text-sm font-semibold">
            <Icon name="filter" className="h-4 w-4" />
            Filters
          </p>
          {renderFilters("sidebar")}
          <button type="button" onClick={clearFilters} className="mt-4 text-xs text-ink-3 hover:text-ink">Clear all filters</button>
        </aside>

        <dialog
          ref={drawerRef}
          aria-label="Filters"
          className="drawer drawer-left"
          onClick={(event) => {
            if (event.target === event.currentTarget) drawerRef.current?.close();
          }}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <h2 className="subsection">Filters</h2>
            <button type="button" onClick={() => drawerRef.current?.close()} aria-label="Close filters" className="btn btn-icon"><Icon name="x" /></button>
          </div>
          <div className="overflow-y-auto px-4">{renderFilters("drawer")}</div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <button type="button" onClick={clearFilters} className="btn btn-text text-sm">Clear all</button>
            <button type="button" onClick={() => drawerRef.current?.close()} className="btn btn-brand">Show {count} results</button>
          </div>
        </dialog>

        <section className="min-w-0" aria-label="Products">
          {loadStatus === "loading" && <LoadingGrid />}

          {loadStatus === "error" && (
            <div role="alert" className="alert alert-error">
              <Icon name="alert" />
              <div>
                <p className="font-medium">The catalogue could not be loaded.</p>
                <p className="mt-1 text-ink-2">Check your connection and reload the page.</p>
              </div>
            </div>
          )}

          {loadStatus === "success" && filteredProducts.length === 0 && (
            <EmptyState
              icon="search"
              title={searchQuery.trim() ? <>No matches for <em>‘{searchQuery.trim()}’</em></> : "No products match these filters."}
              text="Check the spelling, try a catalogue number, or remove a filter."
              action={
                <>
                  <button type="button" onClick={clearFilters} className="btn btn-primary">Clear all filters</button>
                  <Link href={`/contact?product=${encodeURIComponent(searchQuery.trim())}`} className="btn btn-text">Request this product</Link>
                </>
              }
            />
          )}

          {loadStatus === "success" && displayedProducts.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-ink-3">
                  Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredProducts.length)} of {count} products
                </p>
                <div role="group" aria-label="Layout" className="flex gap-0.5 rounded-sm border border-line bg-surface p-0.5">
                  {(["grid", "list"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setView(option)}
                      aria-pressed={view === option}
                      aria-label={option === "grid" ? "Grid view" : "List view"}
                      className="grid size-8 place-items-center rounded-xs text-ink-3 hover:text-ink aria-pressed:bg-surface-alt aria-pressed:text-ink"
                    >
                      <Icon name={option === "grid" ? "grid" : "menu"} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className={view === "list" ? "pgrid-list mt-4 grid gap-3" : `mt-4 ${GRID_CLASS}`}>
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onRequestPrice={handleRequestPrice} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav aria-label="Product pagination" className="pager mt-10 justify-center [&_[aria-current=page]]:bg-brand">
                  <button type="button" disabled={safeCurrentPage === 1} onClick={() => goToPage(safeCurrentPage - 1)} aria-label="Previous page">
                    <Icon name="chevron" className="h-4 w-4 rotate-180" />
                  </button>
                  {paginationItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} aria-hidden="true">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => goToPage(item)}
                        aria-current={item === safeCurrentPage ? "page" : undefined}
                        aria-label={`Page ${item}`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button type="button" disabled={safeCurrentPage === totalPages} onClick={() => goToPage(safeCurrentPage + 1)} aria-label="Next page">
                    <Icon name="chevron" className="h-4 w-4" />
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

function LoadingGrid() {
  return (
    <div className={`mt-12 ${GRID_CLASS}`} aria-busy="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="card grid gap-3 p-2 pb-3">
          <div className="skeleton aspect-[1.1] rounded-sm" />
          <div className="skeleton h-3 w-1/3" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-4 w-2/5" />
        </div>
      ))}
    </div>
  );
}
