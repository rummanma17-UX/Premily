import React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Store, ProductListResponse } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { MartBadge } from "@/components/badges/MartBadge";
import { VerifiedBadge } from "@/components/badges/VerifiedBadge";
import { MapPin, Package, Star, Search, ArrowLeft } from "lucide-react";

export default async function SellerStorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { storeSlug } = await params;
  const { q, category } = await searchParams;

  // Fetch store details from API
  let store = await apiFetch<Store>(`/api/stores/${storeSlug}`).catch(() => null);

  // Fallback demo store for previewing if backend not yet seeded with this store
  if (!store) {
    store = {
      id: "store-demo",
      slug: storeSlug,
      displayName: storeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) + " Official",
      description:
        "Welcome to our official PREMILY flagship store. We curate high-end, artisan-crafted furniture and home living essentials across Bangladesh.",
      logoUrl: null,
      bannerUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#B8924B",
      isPremilyMart: true,
      verificationStatus: "VERIFIED",
      homeDistrict: "Dhaka",
      stats: {
        totalProducts: 24,
        totalOrders: 540,
        avgRating: 4.9,
        totalReviews: 312,
        totalSales: 890,
      },
    };
  }

  // Fetch products belonging to this seller
  const queryParams = new URLSearchParams();
  queryParams.set("storeSlug", storeSlug);
  if (q) queryParams.set("q", q);
  if (category) queryParams.set("category", category);

  const productData = await apiFetch<ProductListResponse>(
    `/api/products?${queryParams.toString()}`
  ).catch(() => ({
    products: [
      {
        id: "prod-1",
        name: "Aura Curved Lounge Chair",
        slug: "aura-curved-chair",
        description: "Oak wood frame with textured boucle finish.",
        categoryId: "cat-1",
        category: { id: "cat-1", name: "Chairs", slug: "chairs" },
        variants: [{ id: "v1", sku: "AURA-1", price: "18500", compareAtPrice: "24000", stock: 12, size: "Standard", color: "Cream" }],
        images: [{ id: "i1", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80", altText: "Chair", position: 0 }],
        store: { id: store.id, slug: store.slug, displayName: store.displayName, isPremilyMart: store.isPremilyMart, verificationStatus: store.verificationStatus },
        avgRating: 4.9,
        reviewCount: 48,
        salesCount: 140,
      },
      {
        id: "prod-2",
        name: "Velvet Accent Armchair",
        slug: "velvet-accent-armchair",
        description: "Mid-century modern velvet chair with brass legs.",
        categoryId: "cat-1",
        category: { id: "cat-1", name: "Chairs", slug: "chairs" },
        variants: [{ id: "v2", sku: "VELVET-1", price: "22000", compareAtPrice: "28000", stock: 8, size: "Standard", color: "Emerald" }],
        images: [{ id: "i2", url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80", altText: "Velvet Chair", position: 0 }],
        store: { id: store.id, slug: store.slug, displayName: store.displayName, isPremilyMart: store.isPremilyMart, verificationStatus: store.verificationStatus },
        avgRating: 4.8,
        reviewCount: 36,
        salesCount: 95,
      },
    ],
    pagination: { total: 2 },
  }));

  const brandAccent = store.primaryColor || "#B8924B";

  return (
    <main className="min-h-screen bg-cream pb-16">
      {/* Top Marketplace Return Bar */}
      <div className="bg-dark text-cream text-xs py-2 px-4 border-b border-gold/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:text-gold flex items-center gap-1.5 font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to PREMILY Marketplace
          </Link>
          <span className="text-light-gold text-[11px] hidden sm:inline">
            Official Storefront hosted on PREMILY
          </span>
        </div>
      </div>

      {/* Seller Hero Banner */}
      <div className="relative w-full h-48 sm:h-64 bg-dark overflow-hidden">
        {store.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.bannerUrl}
            alt={store.displayName}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div
            className="w-full h-full opacity-70"
            style={{
              background: `linear-gradient(135deg, #1E1916 0%, ${brandAccent} 100%)`,
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
      </div>

      {/* Store Identity Card Overlay */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
        <div className="premily-card p-6 rounded-3xl border border-border-gold bg-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Store Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cream border-2 border-border-gold overflow-hidden grid place-items-center shadow-xs shrink-0">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logoUrl}
                  alt={store.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif text-3xl font-bold text-deep">
                  {store.displayName.charAt(0)}
                </span>
              )}
            </div>

            {/* Store Title & Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-dark">
                  {store.displayName}
                </h1>
                {store.isPremilyMart && <MartBadge size="sm" />}
                {store.verificationStatus === "VERIFIED" && !store.isPremilyMart && (
                  <VerifiedBadge size="sm" />
                )}
              </div>

              <p className="text-xs text-muted max-w-xl line-clamp-2 leading-relaxed">
                {store.description || "Authentic collection delivered nationwide."}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-deep" />
                  <span>Base: {store.homeDistrict || "Dhaka"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-deep" />
                  <span>{store.stats?.totalProducts ?? 0} Products</span>
                </div>
                <div className="flex items-center gap-1 text-dark font-medium">
                  <Star className="w-3.5 h-3.5 fill-current text-deep" />
                  <span>{store.stats?.avgRating ? store.stats.avgRating.toFixed(1) : "5.0"} Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Store Highlights */}
          <div className="grid grid-cols-2 gap-2 text-center w-full md:w-auto shrink-0">
            <div className="p-3 rounded-xl bg-cream border border-border-gold/50">
              <span className="block text-base font-bold text-deep">৳70</span>
              <span className="text-[10px] text-muted">Local Delivery</span>
            </div>
            <div className="p-3 rounded-xl bg-cream border border-border-gold/50">
              <span className="block text-base font-bold text-dark">৳150</span>
              <span className="text-[10px] text-muted">Nationwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-gold/60 pb-4">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-dark">
              Store Catalog
            </h2>
            <p className="text-xs text-muted">
              Showing {productData.products.length} products available for direct purchase
            </p>
          </div>

          {/* Search inside this store */}
          <form className="relative max-w-xs w-full">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={`Search in ${store.displayName}...`}
              className="w-full px-4 py-2 pl-9 rounded-full border border-border-gold bg-white text-xs text-dark outline-none focus:border-deep shadow-xs"
            />
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Product Grid */}
        {productData.products.length === 0 ? (
          <div className="premily-card p-12 text-center rounded-2xl border border-border-gold bg-white">
            <p className="text-sm text-muted">
              No products found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {productData.products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
