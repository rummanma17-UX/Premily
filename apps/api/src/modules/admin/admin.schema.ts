import { z } from "zod";

export const adminProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).default(""),
});

export const adminOrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ])
    .optional(),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
  ]),
});

export const updateStoreMartSchema = z.object({
  isPremilyMart: z.boolean(),
});

export const updateStoreVerificationSchema = z.object({
  verificationStatus: z.enum(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"]),
  verificationNote: z.string().max(500).optional(),
});

export type AdminProductQuery = z.infer<typeof adminProductQuerySchema>;
export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;
export type AdminOrderStatusInput = z.infer<typeof adminOrderStatusSchema>;
export type UpdateStoreMartInput = z.infer<typeof updateStoreMartSchema>;
export type UpdateStoreVerificationInput = z.infer<typeof updateStoreVerificationSchema>;
