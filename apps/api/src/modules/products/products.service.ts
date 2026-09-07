import { prisma } from "../../lib/prisma.js";
import type { CreateProductInput } from "./products.schema.js";

export async function createProduct(
  sellerId: string,
  data: CreateProductInput,
) {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      sellerId,
      variants: {
        create: data.variants.map((v) => ({
          ...v,
          size: v.size ?? null,
          color: v.color ?? null,
        })),
      },
      images: {
        create: data.images.map((img) => ({
          ...img,
          altText: img.altText ?? null,
        })),
      },
    },
    include: {
      variants: true,
      images: true,
    },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      variants: true,
      images: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
