import { prisma } from "../../lib/prisma.js";
import type { CalculateShippingInput, UpdateStoreShippingInput } from "./shipping.schema.js";

const DEFAULT_INSIDE_DHAKA_FEE = 70;
const DEFAULT_OUTSIDE_DHAKA_FEE = 150;

export async function getDistrictsList() {
  return prisma.districtShipping.findMany({ where: { isActive: true }, orderBy: { districtName: "asc" } });
}

export async function calculateShippingRates(input: CalculateShippingInput) {
  const destination = input.destinationDistrict.trim().toLocaleLowerCase();
  const stores = await prisma.store.findMany({
    where: { id: { in: input.storeIds } },
    select: { id: true, displayName: true, homeDistrict: true, insideDistrictCost: true, outsideDistrictCost: true },
  });
  const breakdown = stores.map((store) => {
    const isHome = destination === (store.homeDistrict ?? "dhaka").trim().toLocaleLowerCase();
    const configured = isHome ? store.insideDistrictCost : store.outsideDistrictCost;
    const shippingCost = configured == null
      ? (isHome ? DEFAULT_INSIDE_DHAKA_FEE : DEFAULT_OUTSIDE_DHAKA_FEE)
      : Number(configured);
    return {
      storeId: store.id,
      storeName: store.displayName,
      shippingCost,
      estimatedDays: isHome ? "1-2 Business Days" : "3-5 Business Days",
      rateSource: configured == null ? "PLATFORM_DEFAULT" as const : "STORE_CUSTOM" as const,
    };
  });
  return {
    destinationDistrict: input.destinationDistrict,
    totalShippingCost: breakdown.reduce((total, item) => total + item.shippingCost, 0),
    stores: breakdown,
  };
}

export async function updateStoreShipping(sellerId: string, input: UpdateStoreShippingInput) {
  const store = await prisma.store.findUnique({ where: { sellerId }, select: { id: true } });
  if (!store) throw new Error("STORE_NOT_FOUND");
  return prisma.store.update({
    where: { id: store.id },
    data: {
      ...(input.homeDistrict !== undefined && { homeDistrict: input.homeDistrict }),
      ...(input.insideDistrictCost !== undefined && { insideDistrictCost: input.insideDistrictCost }),
      ...(input.outsideDistrictCost !== undefined && { outsideDistrictCost: input.outsideDistrictCost }),
    },
  });
}
