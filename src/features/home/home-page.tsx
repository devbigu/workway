import { AnnouncementBar } from "./components/announcement-bar";
import { HeroSection } from "./components/hero-section";
import { TrustStrip } from "./components/trust-strip";
import { CategorySection } from "./components/category-section";
import { FeaturedProducts } from "./components/featured-products";
import { BusinessSection } from "./components/business-section";
import { DocumentationSection } from "./components/documentation-section";
import { BenefitsSection } from "./components/benefits-section";
import { StatisticsSection } from "./components/statistics-section";
import { NewsletterSection } from "./components/newsletter-section";

export function HomePage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#f8fbff] text-slate-900">
      <AnnouncementBar />
      <HeroSection />
      <TrustStrip />
      <CategorySection />
      <FeaturedProducts />
      <BusinessSection />
      <DocumentationSection />
      <BenefitsSection />
      <StatisticsSection />
      <NewsletterSection />
    </main>
  );
}
