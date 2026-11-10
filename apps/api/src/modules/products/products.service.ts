import { prisma } from "../../lib/prisma.js";
import type { CreateProductInput, UpdateProductInput } from "./products.schema.js";

const productInclude = {
  variants: true,
  images: { orderBy: { position: "asc" as const } },
  category: true,
};

const publicStoreSelect = {
  id: true,
  slug: true,
  displayName: true,
  description: true,
  logoUrl: true,
  bannerUrl: true,
  primaryColor: true,
  isPremilyMart: true,
  verificationStatus: true,
  homeDistrict: true,
};

export async function createProduct(sellerId: string, data: CreateProductInput) {
  const store = await prisma.store.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!store) throw new Error("STORE_NOT_FOUND");

  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      storeId: store.id,
      status: data.status,
      variants: {
        create: data.variants.map((variant) => ({
          ...variant,
          size: variant.size ?? null,
          color: variant.color ?? null,
        })),
      },
      images: {
        create: data.images.map((image) => ({
          ...image,
          altText: image.altText ?? null,
        })),
      },
    },
    include: productInclude,
  });
}

export async function updateProduct(
  sellerId: string,
  productId: string,
  input: UpdateProductInput,
) {
  const current = await prisma.product.findFirst({
    where: { id: productId, store: { sellerId } },
    include: { variants: { orderBy: { createdAt: "asc" } }, images: { orderBy: { position: "asc" } } },
  });

  if (!current) throw new Error("PRODUCT_NOT_FOUND");

  const productData: Record<string, unknown> = {};
  for (const key of ["name", "slug", "description", "categoryId", "status"] as const) {
    if (input[key] !== undefined) productData[key] = input[key];
  }

  const firstVariant = current.variants[0];
  const variantData: Record<string, unknown> = {};
  if (input.price !== undefined) variantData.price = input.price;
  if (input.compareAtPrice !== undefined) variantData.compareAtPrice = input.compareAtPrice;
  if (input.stock !== undefined) variantData.stock = input.stock;
  if (input.size !== undefined) variantData.size = input.size;
  if (input.color !== undefined) variantData.color = input.color;

  return prisma.$transaction(async (tx) => {
    if (Object.keys(productData).length > 0) {
      await tx.product.update({ where: { id: current.id }, data: productData });
    }

    if (Object.keys(variantData).length > 0) {
      if (!firstVariant) throw new Error("PRODUCT_VARIANT_NOT_FOUND");
      await tx.productVariant.update({ where: { id: firstVariant.id }, data: variantData });
    }

    if (input.imageUrl !== undefined) {
      const firstImage = current.images[0];
      if (firstImage) {
        await tx.productImage.update({
          where: { id: firstImage.id },
          data: { url: input.imageUrl, altText: input.name ?? current.name },
        });
      } else {
        await tx.productImage.create({
          data: { productId: current.id, url: input.imageUrl, altText: input.name ?? current.name, position: 0 },
        });
      }
    }

    return tx.product.findUniqueOrThrow({
      where: { id: current.id },
      include: productInclude,
    });
  });
}

export async function archiveProduct(sellerId: string, productId: string) {
  const result = await prisma.product.updateMany({
    where: { id: productId, store: { sellerId }, status: { not: "ARCHIVED" } },
    data: { status: "ARCHIVED" },
  });
  if (result.count !== 1) throw new Error("PRODUCT_NOT_FOUND");
}

export async function getProductBySlug(slug: string, storeSlug?: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      store: {
        status: "ACTIVE",
        isPublished: true,
        ...(storeSlug ? { slug: storeSlug } : {}),
      },
    },
    include: {
      variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
      images: { orderBy: { position: "asc" } },
      category: true,
      store: { select: publicStoreSelect },
      reviews: {
        where: { status: "APPROVED" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export type ProductFilterOptions = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  mart?: boolean;
  featured?: boolean;
  trending?: boolean;
  storeSlug?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "popular";
  page?: number;
  limit?: number;
};

export async function getAllProducts(options: ProductFilterOptions = {}) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 24));
  const skip = (page - 1) * limit;

  const where: Record<string, any> = {
    status: "ACTIVE",
    store: {
      status: "ACTIVE",
      isPublished: true,
      ...(options.mart ? { isPremilyMart: true } : {}),
      ...(options.storeSlug ? { slug: options.storeSlug } : {}),
    },
    variants: {
      some: {
        isActive: true,
        stock: { gt: 0 },
        price: {
          ...(options.minPrice !== undefined ? { gte: options.minPrice } : {}),
          ...(options.maxPrice !== undefined ? { lte: options.maxPrice } : {}),
        },
      },
    },
  };

  if (options.q) {
    where.OR = [
      { name: { contains: options.q, mode: "insensitive" } },
      { description: { contains: options.q, mode: "insensitive" } },
    ];
  }
  if (options.category) where.category = { slug: options.category };
  if (options.featured) where.isFeatured = true;
  if (options.trending) where.isTrending = true;

  const include = {
    variants: { where: { isActive: true, stock: { gt: 0 } } },
    images: { orderBy: { position: "asc" as const } },
    category: true,
    store: { select: publicStoreSelect },
  };
  const sortByPrice = options.sort === "price_asc" || options.sort === "price_desc";
  const orderBy =
    options.sort === "rating" ? { avgRating: "desc" as const } :
    options.sort === "popular" ? { salesCount: "desc" as const } :
    { createdAt: "desc" as const };

  const [matchingProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include,
      orderBy,
      ...(sortByPrice ? {} : { skip, take: limit }),
    }),
    prisma.product.count({ where }),
  ]);

  let products = matchingProducts;
  if (sortByPrice) {
    const minimumPrice = (product: (typeof matchingProducts)[number]) => {
      const prices = product.variants.map((variant) => Number(variant.price));
      return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
    };
    products = [...matchingProducts].sort((a, b) =>
      options.sort === "price_asc"
        ? minimumPrice(a) - minimumPrice(b)
        : minimumPrice(b) - minimumPrice(a),
    ).slice(skip, skip + limit);
  }

  return {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMyProducts(sellerId: string) {
  return prisma.product.findMany({
    where: { store: { sellerId } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}
