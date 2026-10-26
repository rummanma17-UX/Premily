import React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Product, Category, ProductListResponse } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { SlidersHorizontal, ChevronRight, X } from "lucide-react";

export default async function ProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    mart?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q;
  const categorySlug = params.category;
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;
  const isMart = params.mart === "true";
  const sort = params.sort || "newest";

  // Build query string for API
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (categorySlug) query.set("category", categorySlug);
  if (minPrice) query.set("minPrice", minPrice);
  if (maxPrice) query.set("maxPrice", maxPrice);
  if (isMart) query.set("mart", "true");
  if (sort) query.set("sort", sort);

  const [productsData, categories] = await Promise.all([
    apiFetch<ProductListResponse>(`/api/products?${query.toString()}`).catch(() => null),
    apiFetch<Category[]>("/api/categories").catch(() => []),
  ]);

  // Demo fallback products if backend is cold/empty
  const products: Product[] = productsData?.products?.length
    ? productsData.products
    : [
        {
          id: "cat-prod-1",
          name: "Aura Curved Lounge Chair",
          slug: "aura-curved-chair",
          description: "Solid oak with textured boucle upholstery.",
          categoryId: "cat-1",
          category: { id: "cat-1", name: "Furniture", slug: "furniture" },
          variants: [{ id: "v1", sku: "AURA-1", price: "18500", compareAtPrice: "24000", stock: 12, size: "Standard", color: "Beige" }],
          images: [{ id: "i1", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80", altText: "Chair", position: 0 }],
          store: { id: "s1", slug: "aura-home", displayName: "Aura Home", isPremilyMart: true, verificationStatus: "VERIFIED" },
          avgRating: 4.9,
          reviewCount: 312,
          salesCount: 540,
        },
        {
          id: "cat-prod-2",
          name: "Brass Wall Sconce Lamp",
          slug: "brass-wall-sconce",
          description: "Hand-brushed solid brass with warm ambient lighting.",
          categoryId: "cat-2",
          category: { id: "cat-2", name: "Lighting", slug: "lighting" },
          variants: [{ id: "v2", sku: "BRASS-1", price: "4200", compareAtPrice: "5500", stock: 20, size: "Standard", color: "Antique Gold" }],
          images: [{ id: "i2", url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80", altText: "Lamp", position: 0 }],
          store: { id: "s2", slug: "lumina", displayName: "Lumina Studio", isPremilyMart: false, verificationStatus: "VERIFIED" },
          avgRating: 4.8,
          reviewCount: 94,
          salesCount: 320,
        },
        {
          id: "cat-prod-3",
          name: "Travertine Minimalist Coffee Table",
          slug: "travertine-table",
          description: "Honed raw travertine stone table with monolithic base.",
          categoryId: "cat-1",
          category: { id: "cat-1", name: "Furniture", slug: "furniture" },
          variants: [{ id: "v3", sku: "TRAV-1", price: "24000", compareAtPrice: "30000", stock: 5, size: "Large", color: "Natural Sand" }],
          images: [{ id: "i3", url: "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=600&q=80", altText: "Table", position: 0 }],
          store: { id: "s1", slug: "aura-home", displayName: "Aura Home", isPremilyMart: true, verificationStatus: "VERIFIED" },
          avgRating: 5.0,
          reviewCount: 42,
          salesCount: 98,
        },
        {
          id: "cat-prod-4",
          name: "Sculptural Ceramic Vase",
          slug: "sculptural-ceramic-vase",
          description: "Artisan matte ceramic vessel for minimalist interiors.",
          categoryId: "cat-3",
          category: { id: "cat-3", name: "Decor", slug: "decor" },
          variants: [{ id: "v4", sku: "VASE-1", price: "2900", compareAtPrice: "3800", stock: 25, size: "Standard", color: "Terracotta" }],
          images: [{ id: "i4", url: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80", altText: "Vase", position: 0 }],
          store: { id: "s3", slug: "clay-co", displayName: "Clay & Craft", isPremilyMart: false, verificationStatus: "VERIFIED" },
          avgRating: 4.7,
          reviewCount: 65,
          salesCount: 210,
        },
      ];

  const totalCount = productsData?.pagination?.total ?? products.length;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-muted flex items-center gap-1.5">
        <Link href="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3 h-3 text-border-gold" />
        <span className="text-dark font-medium">All Catalog</span>
        {categorySlug && (
          <>
            <ChevronRight className="w-3 h-3 text-border-gold" />
            <span className="text-deep font-semibold capitalize">{categorySlug}</span>
          </>
        )}
      </nav>

      {/* Main Grid: Sidebar Filters + Products Column */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Sidebar Filters */}
        <aside className="premily-card p-5 rounded-2xl border border-border-gold bg-white shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border-gold/40 pb-3">
            <span className="font-semibold text-sm text-dark flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-deep" />
              Filter Catalog
            </span>
            {(q || categorySlug || minPrice || maxPrice || isMart) && (
              <Link href="/products" className="text-xs text-deep font-semibold hover:underline flex items-center gap-1">
                <X className="w-3 h-3" />
                Reset
              </Link>
            )}
          </div>

          {/* PREMILY Mart Filter */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-dark">Trust & Badges</span>
            <Link
              href={isMart ? "/products" : "/products?mart=true"}
              className={`flex items-center justify-between p-2 rounded-xl text-xs border transition-all ${
                isMart
                  ? "bg-dark text-light-gold border-gold"
                  : "bg-surface-subtle text-dark border-border-gold/60 hover:border-deep"
              }`}
            >
              <span className="font-medium">Official PREMILY Mart</span>
              <span className="text-[10px] font-bold">MART</span>
            </Link>
          </div>

          {/* Categories */}
          <div className="space-y-2 border-t border-border-gold/30 pt-4">
            <span className="block text-xs font-semibold text-dark">Categories</span>
            <div className="space-y-1 text-xs">
              <Link
                href="/products"
                className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                  !categorySlug ? "bg-cream text-deep font-semibold" : "text-muted hover:text-dark"
                }`}
              >
                All Departments
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`block px-2.5 py-1.5 rounded-lg transition-colors ${
                    categorySlug === cat.slug
                      ? "bg-cream text-deep font-semibold"
                      : "text-muted hover:text-dark"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Range Filter Form */}
          <div className="space-y-2 border-t border-border-gold/30 pt-4">
            <span className="block text-xs font-semibold text-dark">Price Range (৳)</span>
            <form action="/products" method="GET" className="space-y-2 text-xs">
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {isMart && <input type="hidden" name="mart" value="true" />}
              {q && <input type="hidden" name="q" value={q} />}

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={minPrice}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-gold bg-cream text-dark outline-none focus:border-deep"
                />
                <span className="text-muted">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={maxPrice}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-border-gold bg-cream text-dark outline-none focus:border-deep"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-dark text-cream hover:bg-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        {/* Products Column */}
        <div className="space-y-4">
          {/* Top Sort & Results Counter Bar */}
          <div className="premily-card p-3.5 sm:p-4 rounded-2xl border border-border-gold bg-white shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-muted">
              Showing <b className="text-dark">{totalCount}</b> products
              {q && <> for &quot;<b className="text-deep">{q}</b>&quot;</>}
            </span>

            {/* Sort Options */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-muted hidden sm:inline">Sort:</span>
              <div className="flex items-center gap-1.5 bg-cream p-1 rounded-xl border border-border-gold/40 text-xs">
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "newest" }).toString()}`}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sort === "newest" ? "bg-white font-semibold text-deep shadow-xs" : "text-muted hover:text-dark"
                  }`}
                >
                  Newest
                </Link>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "popular" }).toString()}`}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sort === "popular" ? "bg-white font-semibold text-deep shadow-xs" : "text-muted hover:text-dark"
                  }`}
                >
                  Popular
                </Link>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "rating" }).toString()}`}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sort === "rating" ? "bg-white font-semibold text-deep shadow-xs" : "text-muted hover:text-dark"
                  }`}
                >
                  Rating
                </Link>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="premily-card p-12 text-center rounded-2xl border border-border-gold bg-white space-y-3">
              <p className="text-sm text-muted">
                No products found matching your current filter criteria.
              </p>
              <Link href="/products" className="gbtn inline-block px-5 py-2 rounded-full text-xs font-semibold">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
