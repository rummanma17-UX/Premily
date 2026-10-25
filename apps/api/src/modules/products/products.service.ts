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

export async function getProductBySlug(slug: string, storeSlug?: string | undefined) {
  const where: any = { slug };
  if (storeSlug) {
    where.store = { slug: storeSlug };
  }

  return prisma.product.findFirst({
    where,
    include: {
      variants: true,
      images: { orderBy: { position: "asc" } },
      category: true,
      store: {
        include: {
          shippingRates: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export type ProductFilterOptions = {
  q?: string | undefined;
  category?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  mart?: boolean | undefined;
  featured?: boolean | undefined;
  trending?: boolean | undefined;
  storeSlug?: string | undefined;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "popular" | undefined;
  page?: number | undefined;
  limit?: number | undefined;
};

export async function getAllProducts(options?: ProductFilterOptions) {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(50, Math.max(1, options?.limit ?? 24));
  const skip = (page - 1) * limit;

  const where: any = {
    status: "ACTIVE",
  };

  if (options?.q) {
    where.OR = [
      { name: { contains: options.q, mode: "insensitive" } },
      { description: { contains: options.q, mode: "insensitive" } },
    ];
  }

  if (options?.category) {
    where.category = { slug: options.category };
  }

  if (options?.mart) {
    where.store = { ...where.store, isPremilyMart: true };
  }

  if (options?.storeSlug) {
    where.store = { ...where.store, slug: options.storeSlug };
  }

  if (options?.featured) {
    where.isFeatured = true;
  }

  if (options?.trending) {
    where.isTrending = true;
  }

  if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
    where.variants = {
      some: {
        isActive: true,
        price: {
          ...(options.minPrice !== undefined && { gte: options.minPrice }),
          ...(options.maxPrice !== undefined && { lte: options.maxPrice }),
        },
      },
    };
  }

  let orderBy: any = { createdAt: "desc" };
  if (options?.sort === "price_asc") {
    orderBy = { variants: { _count: "asc" } };
  } else if (options?.sort === "rating") {
    orderBy = { avgRating: "desc" };
  } else if (options?.sort === "popular") {
    orderBy = { salesCount: "desc" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: true,
        images: { orderBy: { position: "asc" } },
        category: true,
        store: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            isPremilyMart: true,
            verificationStatus: true,
            homeDistrict: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMyProducts(sellerId: string) {
  return prisma.product.findMany({
    where: {
      store: { sellerId },
    },
    include: {
      variants: true,
      images: { orderBy: { position: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
