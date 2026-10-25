import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import type { DemoProduct } from "./home-data";

function formatTaka(amount: number) {
  return "৳" + amount.toLocaleString("en-BD");
}

export function HomeProductCard({
  product,
  rail = false,
}: {
  product: DemoProduct;
  rail?: boolean;
}) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null;
  const widthClass = rail ? "w-36 shrink-0 sm:w-44" : "w-full min-w-0";

  return (
    <article
      className={
        "premily-card premily-card-hover flex flex-col overflow-hidden group " +
        widthClass
      }
    >
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote demo product images */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="aspect-3/2 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount !== null && (
          <span className="gbtn absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] shadow-xs">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-[11px] font-medium leading-snug text-dark group-hover:text-deep transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-deep">
            {formatTaka(product.price)}
          </span>
          {product.oldPrice && (
            <s className="text-[10px] text-muted">
              {formatTaka(product.oldPrice)}
            </s>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
          <Link
            href={`/${product.storeSlug}`}
            className="text-muted hover:text-dark truncate max-w-[90px]"
            title={product.storeName}
          >
            {product.storeName}
          </Link>
          {product.isPremilyMart && (
            <span className="rounded bg-dark px-1.5 py-0.5 font-semibold text-light-gold">
              Mart
            </span>
          )}
          {product.verified && !product.isPremilyMart && (
            <span className="rounded border border-success-border bg-success-bg px-1.5 py-0.5 font-semibold text-success">
              ✓ Verified
            </span>
          )}
        </div>

        <p className="mt-auto flex items-center gap-1 text-[10px] text-muted pt-0.5">
          <Star className="size-3 fill-light-gold text-deep" aria-hidden="true" />
          {product.rating} · {product.sold} sold
        </p>
      </div>
    </article>
  );
}
