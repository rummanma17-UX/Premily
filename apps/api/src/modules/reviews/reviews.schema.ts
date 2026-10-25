import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(3, "Review comment must be at least 3 characters").max(1000),
});

export const sellerReplySchema = z.object({
  reply: z.string().min(1, "Reply cannot be empty").max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SellerReplyInput = z.infer<typeof sellerReplySchema>;
