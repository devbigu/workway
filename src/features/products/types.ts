export type ProductVariant = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  specs: Record<string, string>;
  specsText: string;
  pack: number;
  price: number | null;
  priceLabel: string;
  inStock: boolean;
  images: string[];
};

export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  categories: string[];
  page: number;
  features: string[];
  descriptionHtml: string;
  images: string[];
  variants: ProductVariant[];
  hsnCode?: string;
};
