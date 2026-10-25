import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  addReview,
  addSellerReply,
  listProductReviews,
} from "./reviews.controller.js";

export const reviewsRouter: RouterType = Router();

reviewsRouter.get("/product/:productId", listProductReviews);
reviewsRouter.post("/product/:productId", requireAuth, addReview);
reviewsRouter.post("/:reviewId/reply", requireAuth, requireRole("SELLER"), addSellerReply);
