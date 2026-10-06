import type { IconName } from "./types";

export const businessFeatures = ["Dealer-specific pricing", "Custom quotation requests", "GST-compliant invoicing", "Bulk-order support", "Order tracking", "Dedicated assistance"];
export const documentationLinks = ["Product datasheets", "Certificates", "Specifications", "Catalogue downloads"];
export const benefits: { icon: IconName; title: string; description: string }[] = [
  { icon: "shield", title: "Verified scientific products", description: "Clear product identity, catalogue numbers, pack sizes, and technical documentation." },
  { icon: "truck", title: "Fast, reliable fulfilment", description: "Order processing and shipment visibility designed for professional buyers." },
  { icon: "check", title: "Secure payment processing", description: "Protected payments, GST-compatible records, and transparent order totals." },
  { icon: "support", title: "Expert product assistance", description: "Practical support for product selection, quotations, and institutional orders." },
];
