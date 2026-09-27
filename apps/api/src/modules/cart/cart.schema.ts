import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
