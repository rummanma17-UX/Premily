import { z } from "zod";

export const checkoutSchema = z.object({
  shippingName: z.string().min(1),
  shippingPhone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
});

export const buyNowSchema = checkoutSchema.extend({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type BuyNowInput = z.infer<typeof buyNowSchema>;
