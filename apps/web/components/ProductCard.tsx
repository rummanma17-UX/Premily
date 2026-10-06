import type { Product } from "@/types";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const lowestPrice = Math.min(
    ...product.variants.map((v) => parseFloat(v.price)),
  );

  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block rounded border overflow-hidden hover:shadow-md transition-shadow"
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- placeholder image URLs for now; switch to next/image once real upload (S3/R2) exists
        <img
          src={image.url}
          alt={image.altText ?? product.name}
          className="text-sm text-gray-600 mt-1"
        />
      )}

      <div className="p-3">
        <h3 className="font-medium truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1">
          ৳{lowestPrice.toLocaleString("en-BD")}
        </p>
      </div>
    </Link>
  );
}
