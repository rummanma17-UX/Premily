import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  badgeText: z.string().max(30).optional(),
  type: z.enum(["FLASH_SALE", "FESTIVAL", "SEASONAL", "CLEARANCE"]).default("FLASH_SALE"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

export const addCampaignProductSchema = z.object({
  productId: z.string().min(1),
  salePrice: z.number().positive(),
  stockLimit: z.number().int().positive().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type AddCampaignProductInput = z.infer<typeof addCampaignProductSchema>;
