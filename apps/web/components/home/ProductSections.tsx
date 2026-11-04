import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ProductListResponse, Campaign } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { Zap } from "lucide-react";

export async function FlashSaleSection() {
  const campaigns = await apiFetch<Campaign[]>("/api/campaigns").catch(() => []);
  const active = campaigns.filter((campaign) => campaign.isActive && new Date(campaign.startsAt) <= new Date() && new Date(campaign.endsAt) > new Date());
  if (!active.length) return null;
  const products = active.flatMap((campaign) => campaign.items.map((item) => ({...item.product, campaignSalePrice: item.salePrice})));
  return (
    <section className="premily-card p-3 sm:p-4" aria-labelledby="flash-sale-heading">
      <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Zap className="size-5 text-deep" /><h2 id="flash-sale-heading" className="text-lg font-bold">Flash Sale</h2></div><Link href="/products" className="text-sm font-semibold text-deep">View all</Link></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}

export async function RecommendedProductsSection() {
  const data = await apiFetch<ProductListResponse>("/api/products?limit=20&sort=popular").catch(() => ({products:[],pagination:{total:0}}));
  if (!data.products.length) return null;
  return (
    <section aria-labelledby="recommended-heading">
      <div className="mb-3 flex items-center justify-between gap-2"><h2 id="recommended-heading" className="text-lg font-bold">Discover Products</h2><Link href="/products" className="text-sm font-semibold text-deep">Browse all</Link></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">{data.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}
