import { prisma } from "../../lib/prisma.js";
import type { AddCampaignProductInput, CreateCampaignInput } from "./campaigns.schema.js";

export async function getActiveCampaigns() {
  const now = new Date();
  return prisma.campaign.findMany({
    where: {
      isActive: true,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
              variants: { where: { isActive: true }, take: 1 },
              store: { select: { slug: true, displayName: true, isPremilyMart: true } },
            },
          },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getCampaignBySlug(slug: string) {
  return prisma.campaign.findUnique({
    where: { slug },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" } },
              variants: true,
              store: { select: { slug: true, displayName: true, isPremilyMart: true } },
            },
          },
        },
      },
    },
  });
}

export async function createCampaign(input: CreateCampaignInput) {
  const data: any = {
    name: input.name,
    slug: input.slug,
    type: input.type,
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
  };
  if (input.description !== undefined) data.description = input.description;
  if (input.bannerUrl) data.bannerUrl = input.bannerUrl;
  if (input.badgeText !== undefined) data.badgeText = input.badgeText;

  return prisma.campaign.create({ data });
}

export async function addProductToCampaign(campaignId: string, input: AddCampaignProductInput) {
  const updateData: any = { salePrice: input.salePrice };
  if (input.stockLimit !== undefined) updateData.stockLimit = input.stockLimit;

  const createData: any = {
    campaignId,
    productId: input.productId,
    salePrice: input.salePrice,
  };
  if (input.stockLimit !== undefined) createData.stockLimit = input.stockLimit;

  return prisma.campaignProduct.upsert({
    where: {
      campaignId_productId: {
        campaignId,
        productId: input.productId,
      },
    },
    update: updateData,
    create: createData,
  });
}
