import Link from "next/link";
import {
  Armchair, BedDouble, ChevronRight, Flower2, Frame, Lamp,
  LayoutGrid, Shapes, Sofa, Trees, Utensils,
} from "lucide-react";
import type { Category } from "@/types";

const categoryIcons = {
  Sofa, Lamp, Flower2, Utensils, BedDouble, Trees, LayoutGrid, Frame, Shapes, Armchair,
} as const;

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = categoryIcons[name as keyof typeof categoryIcons] ?? Shapes;
  return <Icon className={className} aria-hidden="true" />;
}

export function CategorySidebar({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return <aside className="premily-card hidden p-4 text-xs text-muted lg:block">Categories are not available yet.</aside>;
  }

  return (
    <aside className="premily-card hidden overflow-hidden p-2 lg:block">
      {categories.map((category) => (
        <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-cream">
          <CategoryIcon name={category.icon} className="size-4 text-deep" />
          {category.name}
          <ChevronRight className="ml-auto size-3.5 text-muted" aria-hidden="true" />
        </Link>
      ))}
    </aside>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section aria-labelledby="category-heading">
      <h2 id="category-heading" className="mb-3 text-lg font-bold">Shop by Category</h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-8">
        {categories.map((category) => (
          <Link key={category.id} href={`/products?category=${encodeURIComponent(category.slug)}`}
            className="premily-card premily-card-hover flex cursor-pointer flex-col items-center gap-1.5 p-2 text-center text-[11px] font-medium sm:p-3 sm:text-xs">
            <span className="grid size-10 place-items-center rounded-full bg-cream sm:size-11">
              <CategoryIcon name={category.icon} className="size-5 text-deep" />
            </span>
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
