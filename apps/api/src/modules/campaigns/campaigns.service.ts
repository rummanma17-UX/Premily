import { prisma } from "../../lib/prisma.js";
import type { AddCampaignProductInput, CreateCampaignInput } from "./campaigns.schema.js";

export async function getActiveCampaigns() {
  const now = new Date();
  return prisma.campaign.findMany({
    where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    include: { items: { include: { product: { include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { where: { isActive: true }, take: 1 },
      store: { select: { id: true, slug: true, displayName: true, isPremilyMart: true } },
    } } } },
    orderBy: { startsAt: "asc" },
  });
}
export async function getCampaignBySlug(slug: string) {
  return prisma.campaign.findFirst({
    where: { slug, isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
    include: { items: { include: { product: { include: {
      images: { orderBy: { position: "asc" } }, variants: true,
      store: { select: { id: true, slug: true, displayName: true, isPremilyMart: true } },
    } } } },
  });
}
export async function createCampaign(input: CreateCampaignInput) {
  return prisma.campaign.create({ data: {
    name: input.name, slug: input.slug, type: input.type,
    startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.bannerUrl ? { bannerUrl: input.bannerUrl } : {}),
    ...(input.badgeText !== undefined ? { badgeText: input.badgeText } : {}),
  } });
}
export async function addProductToCampaign(campaignId: string, input: AddCampaignProductInput) {
  return prisma.campaignProduct.upsert({
    where: { campaignId_productId: { campaignId, productId: input.productId } },
    update: { salePrice: input.salePrice, ...(input.stockLimit !== undefined ? { stockLimit: input.stockLimit } : {}) },
    create: { campaignId, productId: input.productId, salePrice: input.salePrice, ...(input.stockLimit !== undefined ? { stockLimit: input.stockLimit } : {}) },
  });
}
export async function setCampaignStatus(id: string, isActive: boolean) {
  return prisma.campaign.update({ where: { id }, data: { isActive } });
}
