import { z } from "zod";

const variantSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  size: z.string().trim().max(80).optional(),
  color: z.string().trim().max(80).optional(),
});

const imageSchema = z.object({
  url: z.url(),
  altText: z.string().trim().max(200).optional(),
  position: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1).max(10000),
  categoryId: z.string().min(1),
  status: z.enum(["ACTIVE", "DRAFT"]).default("ACTIVE"),
  variants: z.array(variantSchema).min(1),
  images: z.array(imageSchema).min(1),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().min(1).max(10000).optional(),
  categoryId: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  size: z.string().trim().max(80).nullable().optional(),
  color: z.string().trim().max(80).nullable().optional(),
  imageUrl: z.url().optional(),
  status: z.enum(["ACTIVE", "DRAFT"]).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one product field must be provided",
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
