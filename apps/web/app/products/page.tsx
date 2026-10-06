import { apiFetch } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";

export default async function ProductsPage() {
  const products = await apiFetch<Product[]>("api/products");

 return (
    <main className="flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold mb-6">All Products</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}