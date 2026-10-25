import React from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { MartBadge } from "./badges/MartBadge";
import { VerifiedBadge } from "./badges/VerifiedBadge";
import { DiscountBadge } from "./badges/DiscountBadge";
import { RatingStars } from "./ui/RatingStars";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export function ProductCard({
  product,
  rail = false,
}: {
  product: Product;
  rail?: boolean;
}) {
  const defaultVariant = product.variants[0];
  const lowestPrice = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => parseFloat(v.price)))
    : 0;

  const compareAt = defaultVariant?.compareAtPrice
    ? parseFloat(defaultVariant.compareAtPrice)
    : null;

  const discount =
    compareAt && compareAt > lowestPrice
      ? Math.round((1 - lowestPrice / compareAt) * 100)
      : 0;

  const image = product.images[0]?.url ?? "/placeholder-product.jpg";
  const rating = Number(product.avgRating ?? 0);
  const widthClass = rail ? "w-40 shrink-0 sm:w-48" : "w-full min-w-0";

  return (
    <article
      className={`premily-card premily-card-hover flex flex-col overflow-hidden group bg-white border border-[#EADFCD] rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${widthClass}`}
    >
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden aspect-[4/3] bg-surface-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element -- external product images */}
        <img
          src={image}
          alt={product.images[0]?.altText ?? product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <DiscountBadge discount={discount} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-xs sm:text-sm font-medium text-dark leading-snug group-hover:text-deep transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm sm:text-base font-bold text-deep">
            {formatTaka(lowestPrice)}
          </span>
          {compareAt && compareAt > lowestPrice && (
            <s className="text-[11px] text-muted line-through">
              {formatTaka(compareAt)}
            </s>
          )}
        </div>

        {/* Rating and Sales Count */}
        <div className="flex items-center justify-between text-[11px] text-muted">
          {rating > 0 ? (
            <RatingStars rating={rating} size="xs" showNumber reviewCount={product.reviewCount} />
          ) : (
            <span className="text-[10px] text-muted">New arrival</span>
          )}
          {product.salesCount && product.salesCount > 0 ? (
            <span className="text-[10px] text-muted">{product.salesCount} sold</span>
          ) : null}
        </div>

        {/* Store & Trust Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-auto border-t border-border-gold/30">
          <Link
            href={`/${product.store.slug}`}
            className="text-[11px] text-muted hover:text-dark truncate max-w-[110px]"
            title={product.store.displayName}
          >
            {product.store.displayName}
          </Link>

          {product.store.isPremilyMart && <MartBadge size="sm" />}
          {product.store.verificationStatus === "VERIFIED" && !product.store.isPremilyMart && (
            <VerifiedBadge size="sm" />
          )}
        </div>
      </div>
    </article>
  );
}
