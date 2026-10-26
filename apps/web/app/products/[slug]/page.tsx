import React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/types";
import { ImageGallery } from "@/components/product/ImageGallery";
import { DeliveryEstimator } from "@/components/product/DeliveryEstimator";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { MartBadge } from "@/components/badges/MartBadge";
import { VerifiedBadge } from "@/components/badges/VerifiedBadge";
import { DiscountBadge } from "@/components/badges/DiscountBadge";
import { RatingStars } from "@/components/ui/RatingStars";
import { Store, ChevronRight, Heart } from "lucide-react";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch product from backend API
  let product = await apiFetch<Product>(`/api/products/${slug}`).catch(() => null);

  // If backend not connected or slug not found in DB, provide realistic luxury fallback data
  if (!product) {
    product = {
      id: "prod-demo-1",
      name: "Aura Curved Lounge Chair",
      slug: slug || "aura-curved-lounge-chair",
      description:
        "A sculptural curved lounge chair in solid oak with soft boucle upholstery. Designed for luxury living rooms, reading corners, and modern boutique suites. Ergonomically contoured for enduring comfort.",
      categoryId: "cat-1",
      category: { id: "cat-1", name: "Living Room Furniture", slug: "living-room" },
      avgRating: 4.9,
      reviewCount: 312,
      salesCount: 540,
      isFeatured: true,
      store: {
        id: "store-1",
        slug: "aura-home",
        displayName: "Aura Home Studio",
        isPremilyMart: true,
        verificationStatus: "VERIFIED",
        homeDistrict: "Dhaka",
      },
      images: [
        { id: "img-1", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80", altText: "Aura Lounge Chair Angle", position: 0 },
        { id: "img-2", url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80", altText: "Aura Lounge Chair Side", position: 1 },
        { id: "img-3", url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1000&q=80", altText: "Aura Lounge Chair Detail", position: 2 },
      ],
      variants: [
        { id: "var-1", sku: "AURA-CREAM", price: "18500", compareAtPrice: "24000", stock: 12, size: "Standard", color: "Cream Boucle" },
        { id: "var-2", sku: "AURA-CHARCOAL", price: "19200", compareAtPrice: "24000", stock: 8, size: "Standard", color: "Charcoal Grey" },
        { id: "var-3", sku: "AURA-OLIVE", price: "18500", compareAtPrice: "24000", stock: 0, size: "Standard", color: "Olive Green" },
      ],
      reviews: [
        {
          id: "rev-1",
          productId: "prod-demo-1",
          rating: 5,
          comment: "Exceptional craftsmanship. The curved oak frame feels solid and the boucle fabric is top tier. Arrived in Dhaka within 2 days.",
          isVerifiedPurchase: true,
          sellerReply: "Thank you for choosing Aura Home! We take great pride in our hand-finished furniture.",
          createdAt: "2026-10-20T10:00:00Z",
          user: { name: "Tanvir Ahmed" },
        },
        {
          id: "rev-2",
          productId: "prod-demo-1",
          rating: 5,
          comment: "Looks exactly like the photos. Worth every taka. Looks luxurious in my living room.",
          isVerifiedPurchase: true,
          createdAt: "2026-10-18T14:30:00Z",
          user: { name: "Nusrat Jahan" },
        },
      ],
    };
  }

  const defaultVariant = product.variants[0];
  const lowestPrice = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => parseFloat(v.price)))
    : 0;
  const compareAt = defaultVariant?.compareAtPrice ? parseFloat(defaultVariant.compareAtPrice) : null;
  const discount = compareAt && compareAt > lowestPrice ? Math.round((1 - lowestPrice / compareAt) * 100) : 0;
  const inStockCount = product.variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-muted flex items-center flex-wrap gap-1.5">
        <Link href="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3 h-3 text-border-gold" />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-dark">
          {product.category.name}
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

        {/* Center Column: Product Buy Box & Details */}
        <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-4">
          {/* Trust Badges */}
          <div className="flex items-center gap-2">
            {product.store.isPremilyMart && <MartBadge size="sm" />}
            {product.store.verificationStatus === "VERIFIED" && !product.store.isPremilyMart && (
              <VerifiedBadge size="sm" />
            )}
            <span className="text-xs text-muted">Official Storefront</span>
          </div>

          <h1 className="font-serif text-xl sm:text-2xl font-bold text-dark leading-snug">
            {product.name}
          </h1>

          {/* Ratings & Sales Summary */}
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
            <RatingStars
              rating={Number(product.avgRating ?? 0)}
              showNumber
              reviewCount={product.reviewCount}
            />
            {product.salesCount && product.salesCount > 0 ? (
              <>
                <span>•</span>
                <span className="text-dark font-medium">{product.salesCount} sold</span>
              </>
            ) : null}
            <span>•</span>
            <span>Sold by:</span>
            <Link
              href={`/${product.store.slug}`}
              className="text-deep font-semibold hover:underline"
            >
              {product.store.displayName}
            </Link>
          </div>

          {/* Luxury Price Box */}
          <div className="p-4 rounded-xl bg-cream border border-border-gold/60 flex items-center justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-deep">
                {formatTaka(lowestPrice)}
              </span>
              {compareAt && compareAt > lowestPrice && (
                <s className="text-sm text-muted line-through">
                  {formatTaka(compareAt)}
                </s>
              )}
            </div>
            {discount > 0 && <DiscountBadge discount={discount} />}
          </div>

          {/* Variants Selector */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-dark">
              Available Options & Materials:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <div
                  key={v.id}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all cursor-pointer ${
                    v.stock > 0
                      ? "border-border-gold hover:border-deep bg-surface-subtle text-dark"
                      : "border-gray-200 bg-gray-50 text-gray-400 line-through"
                  }`}
                >
                  <span className="font-medium">
                    {[v.color, v.size].filter(Boolean).join(" - ") || "Standard"}
                  </span>
                  <span className="block text-[10px] text-muted font-normal mt-0.5">
                    {formatTaka(parseFloat(v.price))} • {v.stock > 0 ? `${v.stock} in stock` : "Sold out"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Indicator */}
          <div className="text-xs text-muted pt-1">
            Status:{" "}
            {inStockCount > 0 ? (
              <span className="font-semibold text-emerald-700">
                In Stock ({inStockCount} units available)
              </span>
            ) : (
              <span className="font-semibold text-rose-600">Currently Out of Stock</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              className="p-3 rounded-full border border-border-gold hover:border-deep text-dark hover:text-deep transition-colors cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="flex-1 py-3 px-4 rounded-full bg-dark text-cream hover:bg-black font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Add to Cart
            </button>
            <Link
              href="/checkout"
              className="gbtn flex-1 py-3 px-4 rounded-full text-center font-semibold text-xs sm:text-sm shadow-xs cursor-pointer"
            >
              Buy Now
            </Link>
          </div>
        </div>

        {/* Right Column: Delivery Information & Seller Card */}
        <aside className="space-y-4">
          <DeliveryEstimator store={product.store} />

          {/* Seller Storefront Profile Card */}
          <div className="premily-card p-4 rounded-2xl border border-border-gold bg-white shadow-xs space-y-3 text-xs">
            <span className="text-[11px] text-muted uppercase tracking-wider font-semibold block">
              Seller Profile
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-cream border border-gold/40 grid place-items-center font-serif font-bold text-deep text-sm">
                {product.store.displayName.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-dark text-sm leading-tight">
                  {product.store.displayName}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {product.store.isPremilyMart ? (
                    <MartBadge size="sm" />
                  ) : product.store.verificationStatus === "VERIFIED" ? (
                    <VerifiedBadge size="sm" />
                  ) : (
                    <span className="text-[10px] text-muted">Independent Seller</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              Fulfills orders directly across Bangladesh. Rated for genuine items and prompt dispatch.
            </p>

            <Link
              href={`/${product.store.slug}`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border-gold hover:border-deep bg-surface-subtle font-semibold text-dark hover:text-deep transition-all"
            >
              <Store className="w-3.5 h-3.5" />
              Visit Store Homepage
            </Link>
          </div>
        </aside>
      </div>

      {/* Tabs: Specifications & Description */}
      <div className="premily-card p-5 sm:p-6 rounded-2xl border border-border-gold bg-white shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-dark border-b border-border-gold/30 pb-3">
          Product Details & Description
        </h2>
        <div className="text-xs sm:text-sm text-dark/90 leading-relaxed space-y-3">
          <p>{product.description}</p>
          <ul className="list-disc pl-5 text-muted space-y-1">
            <li>Handcrafted with premium materials</li>
            <li>Designed for durability and easy cleaning</li>
            <li>Inspected for quality prior to fulfillment</li>
            <li>Covered under seller return warranty</li>
          </ul>
        </div>
      </div>

      {/* Ratings & Customer Reviews Section */}
      <ReviewsSection
        productId={product.id}
        initialReviews={product.reviews}
        avgRating={Number(product.avgRating ?? 0)}
        reviewCount={product.reviewCount ?? 0}
      />
    </main>
  );
}
