import { z } from "zod";

export const updateStoreProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a valid hex color code (e.g. #B8924B)").optional(),
  tradeLicenseNo: z.string().max(50).optional(),
  nidNumber: z.string().max(30).optional(),
});

export type UpdateStoreProfileInput = z.infer<typeof updateStoreProfileSchema>;
