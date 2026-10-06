import { HeroSection } from "./components/hero-section";
import { CategorySection } from "./components/category-section";
import { FeaturedProducts } from "./components/featured-products";
import { BusinessSection } from "./components/business-section";
import { DocumentationSection } from "./components/documentation-section";
import { BenefitsSection } from "./components/benefits-section";

export function HomePage() {
  return (
    <main className="overflow-x-clip bg-paper text-ink">
      <HeroSection />
      <FeaturedProducts />
      <CategorySection />
      <BusinessSection />
      <DocumentationSection />
      <BenefitsSection />
    </main>
  );
}
