import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { homeCategories } from "./home-data";

export function CategorySidebar() {
  return (
    <aside className="premily-card hidden overflow-hidden p-2 lg:block">
      {homeCategories.map(({ name, slug, icon: Icon }) => (
        <Link
          key={slug}
          href="/products"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-cream"
        >
          <Icon className="size-4 text-deep" aria-hidden="true" />
          {name}
          <ChevronRight
            className="ml-auto size-3.5 text-muted"
            aria-hidden="true"
          />
        </Link>
      ))}
    </aside>
  );
}

export function CategoryGrid() {
  return (
    <section aria-labelledby="category-heading">
      <h2 id="category-heading" className="mb-3 text-lg font-bold">
        Shop by Category
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-8">
        {homeCategories.map(({ name, slug, icon: Icon }) => (
          <Link
            key={slug}
            href="/products"
            className="premily-card premily-card-hover flex cursor-pointer flex-col items-center gap-1.5 p-2 text-center text-[11px] font-medium sm:p-3 sm:text-xs"
          >
            <span className="grid size-10 place-items-center rounded-full bg-cream sm:size-11">
              <Icon className="size-5 text-deep" aria-hidden="true" />
            </span>
            {name}
          </Link>
        ))}
      </div>
    </section>
  );
}
