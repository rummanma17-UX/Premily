import { prisma } from "../../lib/prisma.js";
import type { AddCampaignProductInput, CreateCampaignInput } from "./campaigns.schema.js";

const campaignInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" as const } },
          variants: true,
          store: { select: { id: true, slug: true, displayName: true, isPremilyMart: true } },
        },
      },
    },
  },
};

export async function getActiveCampaigns() {
  const now = new Date();
  return prisma.campaign.findMany({
    where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
              variants: { where: { isActive: true }, take: 1 },
              store: { select: { id: true, slug: true, displayName: true, isPremilyMart: true } },
            },
          },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getCampaignBySlug(slug: string) {
  return prisma.campaign.findFirst({
    where: { slug, isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
    include: campaignInclude,
  });
}

export async function createCampaign(input: CreateCampaignInput) {
  if (new Date(input.endsAt) <= new Date(input.startsAt)) {
    throw new Error("INVALID_CAMPAIGN_DATES");
  }
  return prisma.campaign.create({
    data: {
      name: input.name, slug: input.slug, type: input.type,
      startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.bannerUrl ? { bannerUrl: input.bannerUrl } : {}),
      ...(input.badgeText !== undefined ? { badgeText: input.badgeText } : {}),
    },
  });
}

export async function addProductToCampaign(campaignId: string, input: AddCampaignProductInput) {
  const [campaign, product] = await Promise.all([
    prisma.campaign.findUnique({ where: { id: campaignId }, select: { id: true } }),
    prisma.product.findUnique({ where: { id: input.productId }, select: { id: true, status: true } }),
  ]);
  if (!campaign || !product || product.status !== "ACTIVE") throw new Error("CAMPAIGN_OR_PRODUCT_NOT_FOUND");
  return prisma.campaignProduct.upsert({
    where: { campaignId_productId: { campaignId, productId: input.productId } },
    update: { salePrice: input.salePrice, ...(input.stockLimit !== undefined ? { stockLimit: input.stockLimit } : {}) },
    create: { campaignId, productId: input.productId, salePrice: input.salePrice, ...(input.stockLimit !== undefined ? { stockLimit: input.stockLimit } : {}) },
  });
}

export async function setCampaignStatus(id: string, isActive: boolean) {
  return prisma.campaign.update({ where: { id }, data: { isActive } });
}
