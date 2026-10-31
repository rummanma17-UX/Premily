import { apiFetch } from "@/lib/api";
import type { Category } from "@/types";
import { CategoryGrid } from "./CategorySections";
import { HeroSection } from "./HeroSection";
import { FlashSaleSection, RecommendedProductsSection } from "./ProductSections";

export const dynamic = "force-dynamic";

export async function HomePage() {
  let categories: Category[] = [];
  try {
    categories = await apiFetch<Category[]>("/api/categories");
  } catch (error) {
    console.error("Unable to load marketplace categories:", error);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-4">
      <HeroSection categories={categories} />
      <CategoryGrid categories={categories} />
      <FlashSaleSection />
      <RecommendedProductsSection />
    </main>
  );
}
