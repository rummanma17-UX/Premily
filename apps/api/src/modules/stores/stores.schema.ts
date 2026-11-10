import { z } from "zod";

export const updateStoreProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().max(1000).optional(),
  logoUrl: z.union([z.url(), z.literal("")]).optional(),
  bannerUrl: z.union([z.url(), z.literal("")]).optional(),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  tradeLicenseNo: z.string().trim().max(50).optional(),
  nidNumber: z.string().trim().max(30).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one store field must be provided",
});
export type UpdateStoreProfileInput = z.infer<typeof updateStoreProfileSchema>;
