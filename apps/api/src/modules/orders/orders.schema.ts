import { z } from "zod";

export const checkoutSchema = z.object({
  shippingName: z.string().min(1),
  shippingPhone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  shippingAddress: z.string().min(1),
  shippingCity: z.string().min(1),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BKASH", "NAGAD"]),
});

export const buyNowSchema = checkoutSchema.extend({
  variantId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export const paymentProofSchema = z.object({
  transactionId: z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.toUpperCase()),
  senderNumber: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type BuyNowInput = z.infer<typeof buyNowSchema>;
export type PaymentProofInput = z.infer<typeof paymentProofSchema>;
