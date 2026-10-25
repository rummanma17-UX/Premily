"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap } from "lucide-react";
import { demoProducts, homeCategories } from "./home-data";
import { HomeProductCard } from "./HomeProductCard";

const flashSaleIds = ["chair", "sconce", "vessel", "table"];

export function FlashSaleSection() {
  const products = demoProducts.filter((product) => flashSaleIds.includes(product.id));

  return (
    <section className="premily-card p-3 sm:p-4" aria-labelledby="flash-sale-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 id="flash-sale-heading" className="flex items-center gap-1 text-lg font-bold">
            <Zap className="size-5 text-deep" aria-hidden="true" />
            Flash Sale
          </h2>
          <span className="text-xs text-muted">Demo promotion</span>
          <span className="rounded-lg bg-dark px-3 py-1 font-mono text-sm text-gold">
            05:59:59
          </span>
        </div>
        <Link href="/products" className="text-sm font-semibold text-deep hover:text-dark">
          View all
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 sm:gap-3">
        {products.map((product) => (
          <HomeProductCard key={product.id} product={product} rail />
        ))}
      </div>
    </section>
  );
}

export function RecommendedProductsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filters = ["All", ...homeCategories.map((category) => category.name)];
  const products =
    activeCategory === "All"
      ? demoProducts
      : demoProducts.filter((product) => product.category === activeCategory);

  return (
    <section aria-labelledby="recommended-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="recommended-heading" className="text-lg font-bold">
          Just For You
        </h2>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const active = activeCategory === filter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCategory(filter)}
                className={
                  "shrink-0 rounded-full border border-gold/40 px-4 py-1.5 text-xs transition " +
                  (active
                    ? "bg-dark text-cream"
                    : "bg-surface text-dark hover:bg-cream")
                }
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        {products.map((product) => (
          <HomeProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
