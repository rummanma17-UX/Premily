import { prisma } from "../../lib/prisma.js";
import type { CreateProductInput } from "./products.schema.js";

export async function createProduct(
  sellerId: string,
  data: CreateProductInput,
) {
  const store = await prisma.store.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!store) {
    throw new Error("STORE_NOT_FOUND");
  }

  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      storeId: store.id,
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

export async function getProductBySlug(storeSlug: string, productSlug: string) {
  return prisma.product.findFirst({
    where: {
      slug: productSlug,
      store: { slug: storeSlug },
    },
    include: {
      variants: true,
      images: true,
      category: true,
      store: true,
    },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      variants: true,
      images: true,
      category: true,
      store: {
        select: { slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyProducts(sellerId: string) {
  return prisma.product.findMany({
    where: {
      store: { sellerId },
    },
    include: {
      variants: true,
      images: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
