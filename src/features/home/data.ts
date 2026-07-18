import type { Category, IconName, Product } from "./types";

export const categories: Category[] = [
  { title: "Laboratory Equipment", slug: "laboratory-equipment", description: "Reliable instruments for preparation, processing, and analysis.", count: "850+ products", icon: "microscope", gradient: "from-blue-50 to-cyan-100/80" },
  { title: "Filtration Products", slug: "filtration-products", description: "Syringe filters, membranes, holders, and filtration assemblies.", count: "420+ products", icon: "filter", gradient: "from-violet-50 to-blue-100/80" },
  { title: "Glassware", slug: "glassware", description: "Precision borosilicate glassware for routine laboratory workflows.", count: "690+ products", icon: "glassware", gradient: "from-emerald-50 to-cyan-100/80" },
  { title: "Plasticware", slug: "plasticware", description: "Durable disposable and reusable plastic laboratory essentials.", count: "730+ products", icon: "flask", gradient: "from-amber-50 to-orange-100/80" },
  { title: "Chemicals & Reagents", slug: "chemicals-reagents", description: "Research-grade chemicals, buffers, stains, and analytical reagents.", count: "1,100+ products", icon: "sparkles", gradient: "from-rose-50 to-fuchsia-100/80" },
  { title: "Safety & Protection", slug: "safety-protection", description: "PPE and laboratory safety products for protected daily operations.", count: "360+ products", icon: "shield", gradient: "from-slate-50 to-blue-100/80" },
];

export const products: Product[] = [
  { id: 1, slug: "nylon-syringe-filters-sterile", name: "Nylon Syringe Filters, Sterile", catalogueNumber: "OM262-020", category: "Filtration", packSize: "100 pieces", price: "₹2,480", originalPrice: "₹2,850", badge: "Best Seller", rating: 4.9, reviews: 128, availability: "In stock", icon: "filter", gradient: "from-cyan-50 to-blue-100" },
  { id: 2, slug: "digital-laboratory-hot-plate", name: "Digital Laboratory Hot Plate", catalogueNumber: "HPS-450D", category: "Equipment", packSize: "1 unit", price: "₹18,900", badge: "New", rating: 4.8, reviews: 74, availability: "In stock", icon: "sparkles", gradient: "from-orange-50 to-rose-100" },
  { id: 3, slug: "borosilicate-conical-flask", name: "Borosilicate Conical Flask", catalogueNumber: "BG-500-12", category: "Glassware", packSize: "12 pieces", price: "₹1,320", originalPrice: "₹1,500", badge: "Popular", rating: 4.7, reviews: 96, availability: "In stock", icon: "glassware", gradient: "from-emerald-50 to-cyan-100" },
  { id: 4, slug: "digital-magnetic-stirrer", name: "Digital Magnetic Stirrer", catalogueNumber: "MS-2L-PRO", category: "Equipment", packSize: "1 unit", price: "₹12,750", rating: 4.8, reviews: 53, availability: "Limited stock", icon: "microscope", gradient: "from-violet-50 to-blue-100" },
  { id: 5, slug: "disposable-sterile-petri-dishes", name: "Disposable Sterile Petri Dishes", catalogueNumber: "PD-90S-500", category: "Plasticware", packSize: "500 pieces", price: "₹4,650", originalPrice: "₹5,100", badge: "Value Pack", rating: 4.6, reviews: 82, availability: "In stock", icon: "package", gradient: "from-amber-50 to-yellow-100" },
  { id: 6, slug: "adjustable-micropipette-set", name: "Adjustable Micropipette Set", catalogueNumber: "MP-SET-03", category: "Instruments", packSize: "3 pipettes", price: "₹21,900", badge: "Professional", rating: 4.9, reviews: 41, availability: "In stock", icon: "flask", gradient: "from-blue-50 to-indigo-100" },
  { id: 7, slug: "nitrile-examination-gloves", name: "Nitrile Examination Gloves", catalogueNumber: "NG-L-100", category: "Safety", packSize: "100 pieces", price: "₹690", originalPrice: "₹790", rating: 4.7, reviews: 164, availability: "In stock", icon: "shield", gradient: "from-sky-50 to-cyan-100" },
  { id: 8, slug: "laboratory-centrifuge-tubes", name: "Laboratory Centrifuge Tubes", catalogueNumber: "CT-50-500", category: "Plasticware", packSize: "500 pieces", price: "₹3,850", badge: "Bulk Pack", rating: 4.8, reviews: 67, availability: "In stock", icon: "flask", gradient: "from-fuchsia-50 to-violet-100" },
];

export const trustItems: { label: string; icon: IconName }[] = [
  { label: "Trusted Scientific Brands", icon: "sparkles" },
  { label: "Quality Verified", icon: "shield" },
  { label: "GST Invoicing", icon: "sparkles" },
  { label: "Secure Payments", icon: "check" },
  { label: "Technical Support", icon: "support" },
];

export const businessFeatures = ["Dealer-specific pricing", "Custom quotation requests", "GST-compliant invoicing", "Bulk-order support", "Order tracking", "Dedicated assistance"];
export const documentationLinks = ["Product Datasheets", "Certificates", "Specifications", "Catalogue Downloads"];
export const benefits: { icon: IconName; title: string; description: string }[] = [
  { icon: "shield", title: "Verified Scientific Products", description: "Clear product identity, catalogue numbers, pack sizes, and technical documentation." },
  { icon: "truck", title: "Fast, Reliable Fulfilment", description: "Order processing and shipment visibility designed for professional buyers." },
  { icon: "check", title: "Secure Payment Processing", description: "Protected payments, GST-compatible records, and transparent order totals." },
  { icon: "support", title: "Expert Product Assistance", description: "Practical support for product selection, quotations, and institutional orders." },
];
export const statistics = [["5,000+", "Scientific products"], ["250+", "Product categories"], ["1,200+", "Business buyers"], ["98%", "Fulfilment rate"]] as const;
