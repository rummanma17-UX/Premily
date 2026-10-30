"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Check, CheckCircle2, ArrowRight } from "lucide-react";
import type { Product, ProductVariant } from "@/types";
import { CartService } from "@/lib/cart-service";
import { MartBadge } from "../badges/MartBadge";
import { VerifiedBadge } from "../badges/VerifiedBadge";
import { DiscountBadge } from "../badges/DiscountBadge";
import { RatingStars } from "../ui/RatingStars";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: "var-default",
      sku: "DEFAULT",
      price: "0",
      stock: 1,
      size: "Standard",
      color: "Default",
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const price = parseFloat(selectedVariant.price) || 0;
  const compareAt = selectedVariant.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice) : null;
  const discount = compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;
  const inStockCount = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = selectedVariant.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    CartService.addToCart({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      variantId: selectedVariant.id,
      variantLabel: [selectedVariant.color, selectedVariant.size].filter(Boolean).join(" - ") || "Standard",
      price,
      compareAtPrice: compareAt,
      quantity,
      imageUrl: product.images[0]?.url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
      storeId: product.store.id,
      storeSlug: product.store.slug,
      storeName: product.store.displayName,
      isPremilyMart: product.store.isPremilyMart,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    CartService.addToCart({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      variantId: selectedVariant.id,
      variantLabel: [selectedVariant.color, selectedVariant.size].filter(Boolean).join(" - ") || "Standard",
      price,
      compareAtPrice: compareAt,
      quantity,
      imageUrl: product.images[0]?.url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
      storeId: product.store.id,
      storeSlug: product.store.slug,
      storeName: product.store.displayName,
      isPremilyMart: product.store.isPremilyMart,
    });
    router.push("/checkout");
  };

  return (
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
            {formatTaka(price)}
          </span>
          {compareAt && compareAt > price && (
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
          {product.variants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            const isAvailable = v.stock > 0;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`px-3 py-2 rounded-xl text-xs border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-deep bg-cream font-semibold ring-1 ring-deep text-dark"
                    : isAvailable
                    ? "border-border-gold hover:border-deep bg-surface-subtle text-dark"
                    : "border-gray-200 bg-gray-50 text-gray-400 line-through"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{[v.color, v.size].filter(Boolean).join(" - ") || "Standard"}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-deep" />}
                </div>
                <span className="block text-[10px] text-muted font-normal mt-0.5">
                  {formatTaka(parseFloat(v.price))} • {v.stock > 0 ? `${v.stock} in stock` : "Sold out"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Indicator */}
      <div className="text-xs text-muted pt-1 flex items-center justify-between">
        <div>
          Status:{" "}
          {inStockCount > 0 ? (
            <span className="font-semibold text-emerald-700">
              In Stock ({selectedVariant.stock} units of selected option)
            </span>
          ) : (
            <span className="font-semibold text-rose-600">Currently Out of Stock</span>
          )}
        </div>

        {/* Quantity selector */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Quantity:</span>
            <div className="flex items-center border border-border-gold rounded-lg overflow-hidden bg-white text-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-1 text-muted hover:text-dark hover:bg-cream"
              >
                -
              </button>
              <span className="px-2 py-1 font-semibold text-dark min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                className="px-2 py-1 text-muted hover:text-dark hover:bg-cream"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3">
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`p-3 rounded-full border transition-colors cursor-pointer ${
            isWishlisted
              ? "border-rose-300 bg-rose-50 text-rose-600"
              : "border-border-gold hover:border-deep text-dark hover:text-deep"
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className={`flex-1 py-3 px-4 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isAdded
              ? "bg-emerald-700 text-white"
              : isOutOfStock
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-dark text-cream hover:bg-black"
          }`}
        >
          {isAdded ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="gbtn flex-1 py-3 px-4 rounded-full text-center font-semibold text-xs sm:text-sm shadow-xs cursor-pointer flex items-center justify-center gap-1 hover:brightness-105 disabled:opacity-50"
        >
          <span>Buy Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
