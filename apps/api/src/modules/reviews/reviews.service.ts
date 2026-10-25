import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateReviewInput, SellerReplyInput } from "./reviews.schema.js";

export async function createProductReview(
  userId: string,
  productId: string,
  input: CreateReviewInput,
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, storeId: true },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  // Check if customer already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: { userId, productId },
  });

  if (existingReview) {
    throw new Error("ALREADY_REVIEWED");
  }

  // Check verified purchase (did this user buy any variant of this product?)
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      order: {
        userId,
        status: { in: ["DELIVERED", "CONFIRMED", "PROCESSING", "SHIPPED"] },
      },
      variant: {
        productId,
      },
    },
  });

  return prisma.$transaction(async (tx) => {
    const reviewData: any = {
      productId,
      userId,
      rating: input.rating,
      comment: input.comment,
      isVerifiedPurchase: Boolean(hasPurchased),
      status: "APPROVED",
    };
    if (input.title !== undefined) reviewData.title = input.title;

    const review = await tx.review.create({
      data: reviewData,
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // Recalculate average rating and count on Product
    const aggregates = await tx.review.aggregate({
      where: { productId, status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avg = aggregates._avg.rating ?? input.rating;
    const count = aggregates._count.rating ?? 1;

    await tx.product.update({
      where: { id: productId },
      data: {
        avgRating: new Prisma.Decimal(avg.toFixed(2)),
        reviewCount: count,
      },
    });

    return review;
  });
}

export async function getProductReviews(productId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [reviews, total, ratingStats] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: { productId, status: "APPROVED" },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { productId, status: "APPROVED" },
      _count: { rating: true },
    }),
  ]);

  // Build star distribution (1 to 5 stars)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const stat of ratingStats) {
    distribution[stat.rating] = stat._count.rating;
  }

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    distribution,
  };
}

export async function replyToReview(
  sellerId: string,
  reviewId: string,
  input: SellerReplyInput,
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      product: {
        include: { store: true },
      },
    },
  });

  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  if (review.product.store.sellerId !== sellerId) {
    throw new Error("UNAUTHORIZED");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      sellerReply: input.reply,
      sellerRepliedAt: new Date(),
    },
  });
}
