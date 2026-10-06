import { apiFetch } from "@/lib/api";
import type { Product } from "@/types";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await apiFetch<Product>(`/api/products/${slug}`).catch(
    () => null
  );

  if (!product) {
    notFound();
  }

  const lowestPrice = Math.min(
    ...product.variants.map((v) => parseFloat(v.price))
  );
  const image = product.images[0];

  return (
    <main className="flex-1 px-6 py-12 max-w-4xl mx-auto">
      <div className="grid sm:grid-cols-2 gap-8">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element -- placeholder image URLs for now; switch to next/image once real upload (S3/R2) exists
          <img
            src={image.url}
            alt={image.altText ?? product.name}
            className="w-full aspect-square object-cover rounded"
          />
        )}

        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-gray-600 mt-1">{product.category.name}</p>
          <p className="text-xl mt-4">৳{lowestPrice.toLocaleString("en-BD")}</p>
          <p className="mt-6 text-gray-700">{product.description}</p>

          <div className="mt-6 flex flex-col gap-2">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="border rounded px-3 py-2 flex justify-between text-sm"
              >
                <span>
                  {[variant.size, variant.color].filter(Boolean).join(" / ") ||
                    "Standard"}
                </span>
                <span>
                  {variant.stock > 0
                    ? `${variant.stock} in stock`
                    : "Out of stock"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}