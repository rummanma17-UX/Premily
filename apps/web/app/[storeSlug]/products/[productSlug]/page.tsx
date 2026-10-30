import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { StoreService } from "@/lib/store-data";
import type { Product } from "@/types";
import { ImageGallery } from "@/components/product/ImageGallery";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { DeliveryEstimator } from "@/components/product/DeliveryEstimator";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ChevronRight } from "lucide-react";

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) {
  const { storeSlug, productSlug } = await params;

  // First attempt backend fetch
  let product = await apiFetch<Product>(
    `/api/products/${storeSlug}/products/${productSlug}`
  ).catch(() => null);

  // If not found from remote API, look in StoreService
  if (!product) {
    const localStore = StoreService.getStoreBySlug(storeSlug);
    const allProducts = StoreService.getProducts();
    const localProduct = allProducts.find(
      (p) =>
        (p.storeSlug === storeSlug || p.storeId === localStore?.id) &&
        (p.slug === productSlug || p.id === productSlug)
    ) || allProducts.find((p) => p.slug === productSlug);

    if (localProduct && localStore) {
      product = {
        id: localProduct.id,
        name: localProduct.name,
        slug: localProduct.slug,
        description: localProduct.description,
        categoryId: localProduct.categoryId,
        category: {
          id: localProduct.categoryId,
          name: localProduct.categoryName,
          slug: localProduct.categoryId,
        },
        avgRating: localProduct.avgRating,
        reviewCount: localProduct.reviewCount,
        salesCount: localProduct.salesCount,
        isFeatured: localProduct.isFeatured,
        store: {
          id: localStore.id,
          slug: localStore.slug,
          displayName: localStore.displayName,
          isPremilyMart: localStore.isPremilyMart,
          verificationStatus: localStore.verificationStatus,
          homeDistrict: localStore.homeDistrict,
          logoUrl: localStore.logoUrl,
          bannerUrl: localStore.bannerUrl,
          primaryColor: localStore.primaryColor,
        },
        images: [
          {
            id: `img-${localProduct.id}-1`,
            url: localProduct.imageUrl,
            altText: localProduct.name,
            position: 0,
          },
        ],
        variants: [
          {
            id: `var-${localProduct.id}-1`,
            sku: `${localProduct.slug.toUpperCase()}-STD`,
            price: localProduct.price.toString(),
            compareAtPrice: localProduct.compareAtPrice?.toString() || null,
            stock: localProduct.stock,
            size: localProduct.sizes?.[0] || "Standard",
            color: localProduct.colors?.[0] || "Default",
          },
        ],
        reviews: [
          {
            id: `rev-${localProduct.id}-1`,
            productId: localProduct.id,
            rating: 5,
            comment: "Exceptional design and authentic craftsmanship. Highly recommended store!",
            isVerifiedPurchase: true,
            createdAt: "2026-10-22T10:00:00Z",
            user: { name: "Sadia Rahman" },
          },
        ],
      };
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Store Breadcrumb Navigation */}
      <nav className="text-xs text-muted flex items-center flex-wrap gap-1.5">
        <Link href="/" className="hover:text-dark">Marketplace</Link>
        <ChevronRight className="w-3 h-3 text-border-gold" />
        <Link href={`/${product.store.slug}`} className="hover:text-dark font-medium text-deep">
          {product.store.displayName}
        </Link>
        <ChevronRight className="w-3 h-3 text-border-gold" />
        <span className="text-dark font-medium truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main 3-Column Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr_300px] gap-6 items-start">
        {/* Left Column: Multi-Image Gallery */}
        <div>
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* Center Column: Interactive Product Buy Box */}
        <ProductBuyBox product={product} />

        {/* Right Column: Delivery Estimator & Dedicated Storefront Profile */}
        <aside className="space-y-4">
          <DeliveryEstimator store={product.store} />

          <div className="premily-card p-4 rounded-2xl border border-border-gold bg-white shadow-xs space-y-3 text-xs">
            <span className="text-[11px] text-muted uppercase tracking-wider font-semibold block">
              Store Owner
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-cream border border-border-gold grid place-items-center font-serif font-bold text-deep text-sm">
                {product.store.displayName.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-dark text-sm leading-tight">
                  {product.store.displayName}
                </h4>
                <Link
                  href={`/${product.store.slug}`}
                  className="text-[11px] text-deep font-semibold hover:underline block mt-0.5"
                >
                  Visit Dedicated Storefront →
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Verified Reviews Section */}
      <div className="pt-4">
        <ReviewsSection
          productId={product.id}
          initialReviews={product.reviews}
          avgRating={Number(product.avgRating ?? 0)}
          reviewCount={product.reviewCount ?? 0}
        />
      </div>
    </main>
  );
}
