import { z } from "zod";

export const categoryIconSchema = z.enum([
  "Sofa", "Lamp", "Flower2", "Utensils", "BedDouble",
  "Trees", "LayoutGrid", "Frame", "Shapes", "Armchair",
]);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(80),
  slug: z.string().trim().min(1, "Category slug is required").max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  icon: categoryIconSchema,
  imageUrl: z.url().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
