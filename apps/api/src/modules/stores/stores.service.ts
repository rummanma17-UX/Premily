import { prisma } from "../../lib/prisma.js";
import type { UpdateStoreProfileInput } from "./stores.schema.js";

export async function getStoreBySlug(slug: string) {
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      shippingRates: true,
      _count: {
        select: {
          products: { where: { status: "ACTIVE" } },
          orders: true,
        },
      },
    },
  });

  if (!store) {
    return null;
  }

  // Calculate overall store rating across all its products
  const productRatings = await prisma.product.aggregate({
    where: { storeId: store.id, status: "ACTIVE" },
    _avg: { avgRating: true },
    _sum: { reviewCount: true, salesCount: true },
  });

  return {
    ...store,
    stats: {
      totalProducts: store._count.products,
      totalOrders: store._count.orders,
      avgRating: Number(productRatings._avg.avgRating ?? 0),
      totalReviews: productRatings._sum.reviewCount ?? 0,
      totalSales: productRatings._sum.salesCount ?? 0,
    },
  };
}

export async function getStoreProducts(
  storeSlug: string,
  options?: {
    categoryId?: string | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
  },
) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: any = {
    store: { slug: storeSlug },
    status: "ACTIVE",
  };

  if (options?.categoryId) {
    where.categoryId = options.categoryId;
  }

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: true,
        images: { orderBy: { position: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
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

export async function getMyStore(sellerId: string) {
  return prisma.store.findUnique({
    where: { sellerId },
    include: {
      shippingRates: true,
      subscription: true,
    },
  });
}

export async function updateStoreProfile(
  sellerId: string,
  input: UpdateStoreProfileInput,
) {
  const store = await prisma.store.findUnique({
    where: { sellerId },
  });

  if (!store) {
    throw new Error("STORE_NOT_FOUND");
  }

  const data: any = {};
  if (input.displayName !== undefined) data.displayName = input.displayName;
  if (input.description !== undefined) data.description = input.description;
  if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl || null;
  if (input.bannerUrl !== undefined) data.bannerUrl = input.bannerUrl || null;
  if (input.primaryColor !== undefined) data.primaryColor = input.primaryColor;
  if (input.tradeLicenseNo !== undefined) data.tradeLicenseNo = input.tradeLicenseNo;
  if (input.nidNumber !== undefined) data.nidNumber = input.nidNumber;

  return prisma.store.update({
    where: { id: store.id },
    data,
  });
}
