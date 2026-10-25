import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { createReviewSchema, sellerReplySchema } from "./reviews.schema.js";
import {
  createProductReview,
  getProductReviews,
  replyToReview,
} from "./reviews.service.js";

export async function addReview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    if (!productId) {
      res.status(400).json({ error: "Product ID is required" });
      return;
    }
    const userId = req.user!.userId;
    const parsed = createReviewSchema.parse(req.body);
    const review = await createProductReview(userId, productId, parsed);
    res.status(201).json(review);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "PRODUCT_NOT_FOUND") {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      if (err.message === "ALREADY_REVIEWED") {
        res.status(409).json({ error: "You have already reviewed this product" });
        return;
      }
    }
    next(err);
  }
}

export async function listProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    if (!productId) {
      res.status(400).json({ error: "Product ID is required" });
      return;
    }
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const result = await getProductReviews(productId, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addSellerReply(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const reviewId = req.params.reviewId as string;
    if (!reviewId) {
      res.status(400).json({ error: "Review ID is required" });
      return;
    }
    const sellerId = req.user!.userId;
    const parsed = sellerReplySchema.parse(req.body);
    const updated = await replyToReview(sellerId, reviewId, parsed);
    res.json(updated);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "REVIEW_NOT_FOUND") {
        res.status(404).json({ error: "Review not found" });
        return;
      }
      if (err.message === "UNAUTHORIZED") {
        res.status(403).json({ error: "You can only reply to reviews of your own products" });
        return;
      }
    }
    next(err);
  }
}
