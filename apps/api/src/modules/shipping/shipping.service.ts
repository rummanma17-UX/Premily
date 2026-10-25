import { prisma } from "../../lib/prisma.js";
import type { CalculateShippingInput, UpdateStoreShippingInput } from "./shipping.schema.js";

// Standard Bangladesh Districts
export const BANGLADESH_DISTRICTS = [
  "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh",
  "Gazipur", "Narayanganj", "Cumilla", "Bogura", "Brahmanbaria", "Cox's Bazar", "Dinajpur",
  "Faridpur", "Feni", "Jamalpur", "Jashore", "Kushtia", "Narsingdi", "Noakhali", "Pabna", "Tangail",
  "Bagerhat", "Bandarban", "Barguna", "Bhola", "Chandpur", "Chapainawabganj", "Chuadanga",
  "Habiganj", "Joypurhat", "Jhalokathi", "Jhenaidah", "Khagrachhari", "Kishoreganj", "Kurigram",
  "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar",
  "Munshiganj", "Naogaon", "Narail", "Natore", "Netrokona", "Nilphamari", "Panchagarh",
  "Patuakhali", "Pirojpur", "Rajbari", "Rangamati", "Satkhira", "Shariatpur", "Sherpur",
  "Sirajganj", "Sunamganj", "Thakurgaon",
];

const DEFAULT_INSIDE_DHAKA_FEE = 70;
const DEFAULT_OUTSIDE_DHAKA_FEE = 150;

export async function getDistrictsList() {
  const customDistricts = await prisma.districtShipping.findMany({
    where: { isActive: true },
    orderBy: { districtName: "asc" },
  });

  if (customDistricts.length > 0) {
    return customDistricts;
  }

  // Fallback to built-in 64 district definitions
  return BANGLADESH_DISTRICTS.map((district) => {
    const isDhaka = district.toLowerCase() === "dhaka";
    return {
      districtName: district,
      division: isDhaka ? "Dhaka" : "Bangladesh",
      zone: isDhaka ? "INSIDE_DHAKA" : "OUTSIDE_DHAKA",
      baseCost: isDhaka ? DEFAULT_INSIDE_DHAKA_FEE : DEFAULT_OUTSIDE_DHAKA_FEE,
      estimatedDaysMin: isDhaka ? 1 : 3,
      estimatedDaysMax: isDhaka ? 2 : 5,
    };
  });
}

export async function calculateShippingRates(input: CalculateShippingInput) {
  const destination = input.destinationDistrict.trim().toLowerCase();
  const stores = await prisma.store.findMany({
    where: { id: { in: input.storeIds } },
    include: {
      shippingRates: true,
    },
  });

  const breakdown: Array<{
    storeId: string;
    storeName: string;
    shippingCost: number;
    estimatedDays: string;
    rateSource: "STORE_CUSTOM" | "PLATFORM_DEFAULT";
  }> = [];

  let totalShipping = 0;

  for (const store of stores) {
    const homeDistrict = store.homeDistrict?.trim().toLowerCase() ?? "dhaka";
    const isHome = destination === homeDistrict;

    // 1. Check for explicit district override by store
    const storeDistrictOverride = store.shippingRates.find(
      (r) => r.districtName.trim().toLowerCase() === destination,
    );

    let cost: number;
    let rateSource: "STORE_CUSTOM" | "PLATFORM_DEFAULT" = "PLATFORM_DEFAULT";

    if (storeDistrictOverride) {
      cost = Number(storeDistrictOverride.rate);
      rateSource = "STORE_CUSTOM";
    } else if (isHome) {
      cost = store.insideDistrictCost ? Number(store.insideDistrictCost) : DEFAULT_INSIDE_DHAKA_FEE;
      if (store.insideDistrictCost) rateSource = "STORE_CUSTOM";
    } else {
      cost = store.outsideDistrictCost ? Number(store.outsideDistrictCost) : DEFAULT_OUTSIDE_DHAKA_FEE;
      if (store.outsideDistrictCost) rateSource = "STORE_CUSTOM";
    }

    const estimatedDays = isHome ? "1-2 Business Days" : "3-5 Business Days";

    breakdown.push({
      storeId: store.id,
      storeName: store.displayName,
      shippingCost: cost,
      estimatedDays,
      rateSource,
    });

    totalShipping += cost;
  }

  return {
    destinationDistrict: input.destinationDistrict,
    totalShippingCost: totalShipping,
    stores: breakdown,
  };
}

export async function updateStoreShipping(sellerId: string, input: UpdateStoreShippingInput) {
  const store = await prisma.store.findUnique({
    where: { sellerId },
  });

  if (!store) {
    throw new Error("STORE_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const storeUpdateData: any = {};
    if (input.homeDistrict !== undefined) storeUpdateData.homeDistrict = input.homeDistrict;
    if (input.insideDistrictCost !== undefined) storeUpdateData.insideDistrictCost = input.insideDistrictCost;
    if (input.outsideDistrictCost !== undefined) storeUpdateData.outsideDistrictCost = input.outsideDistrictCost;

    const updatedStore = await tx.store.update({
      where: { id: store.id },
      data: storeUpdateData,
    });

    if (input.districtOverrides) {
      await tx.storeShippingRate.deleteMany({
        where: { storeId: store.id },
      });

      if (input.districtOverrides.length > 0) {
        await tx.storeShippingRate.createMany({
          data: input.districtOverrides.map((o) => ({
            storeId: store.id,
            districtName: o.districtName,
            rate: o.rate,
          })),
        });
      }
    }

    return updatedStore;
  });
}
