import { CategoryGrid } from "./CategorySections";
import { HeroSection } from "./HeroSection";
import { FlashSaleSection, RecommendedProductsSection } from "./ProductSections";

export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-4">
      <HeroSection />
      <CategoryGrid />
      <FlashSaleSection />
      <RecommendedProductsSection />
    </main>
  );
}
