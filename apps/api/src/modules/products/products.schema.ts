import { z } from "zod";

const variantSchema = z.object({
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
});

const imageSchema = z.object({
  url: z.url(),
  altText: z.string().optional(),
  position: z.number().int().min(0).default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  variants: z.array(variantSchema).min(1),
  images: z.array(imageSchema).min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
