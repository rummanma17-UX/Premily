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
    .enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["SHIPPED", "DELIVERED", "CANCELLED", "PAID"]),
});

export type AdminProductQuery = z.infer<typeof adminProductQuerySchema>;
export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;
export type AdminOrderStatusInput = z.infer<typeof adminOrderStatusSchema>;
