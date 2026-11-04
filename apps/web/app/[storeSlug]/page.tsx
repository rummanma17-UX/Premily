import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Store, Product, ProductListResponse } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { MapPin, Package, Star, Search, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SellerStorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { storeSlug } = await params;
  const { q, category } = await searchParams;
  const store = await apiFetch<Store>(`/api/stores/${encodeURIComponent(storeSlug)}`).catch(() => null);
  if (!store || !store.isPublished || store.status !== "ACTIVE") notFound();

  const query = new URLSearchParams({ storeSlug, limit: "50" });
  if (q) query.set("q", q);
  if (category) query.set("category", category);
  const productData = await apiFetch<ProductListResponse>(`/api/products?${query.toString()}`).catch(() => ({ products: [], pagination: { total: 0 } }));
  const brandAccent = store.primaryColor || "#B8924B";

  return (
    <main className="min-h-screen bg-cream pb-16">
      <div className="bg-dark text-cream text-xs py-2 px-4 border-b border-gold/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:text-gold flex items-center gap-1.5 font-medium"><ArrowLeft className="w-3.5 h-3.5" />Back to PREMILY Marketplace</Link>
          <span className="text-light-gold text-[11px] hidden sm:inline">Official Storefront hosted on PREMILY</span>
        </div>
      </div>
      <div className="relative w-full h-48 sm:h-64 bg-dark overflow-hidden">
        {store.bannerUrl ? <img src={store.bannerUrl} alt={store.displayName} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full" style={{background:`linear-gradient(135deg,#1E1916 0%,${brandAccent} 100%)`}} />}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
        <div className="premily-card p-6 rounded-3xl border border-border-gold bg-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cream border-2 border-border-gold overflow-hidden grid place-items-center shadow-xs shrink-0">
              {store.logoUrl ? <img src={store.logoUrl} alt={store.displayName} className="w-full h-full object-cover" /> : <span className="font-serif text-3xl font-bold text-deep">{store.displayName.charAt(0)}</span>}
            </div>
            <div className="space-y-1.5">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-dark">{store.displayName}</h1>
              <p className="text-xs text-muted max-w-xl line-clamp-2">{store.description || "Storefront on PREMILY."}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-deep" />{store.homeDistrict || "Bangladesh"}</span>
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-deep" />{store.stats?.totalProducts ?? productData.pagination.total} Products</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-deep" />{Number(store.stats?.avgRating ?? 0).toFixed(1)} Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-gold/60 pb-4">
          <div><h2 className="font-serif text-lg sm:text-xl font-bold text-dark">Store Catalog</h2><p className="text-xs text-muted">Showing {productData.products.length} database products</p></div>
          <form className="relative max-w-xs w-full"><input type="text" name="q" defaultValue={q} placeholder={`Search in ${store.displayName}...`} className="w-full px-4 py-2 pl-9 rounded-full border border-border-gold bg-white text-xs text-dark outline-none focus:border-deep" /><Search className="w-4 h-4 text-muted absolute left-3 top-2.5" /></form>
        </div>
        {productData.products.length === 0 ? <div className="premily-card p-12 text-center rounded-2xl border border-border-gold bg-white"><p className="text-sm text-muted">No published products found in this store.</p></div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{productData.products.map((product: Product) => <ProductCard key={product.id} product={product} />)}</div>}
      </div>
    </main>
  );
}
