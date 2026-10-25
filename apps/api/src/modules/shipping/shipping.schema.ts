import { z } from "zod";

export const calculateShippingSchema = z.object({
  destinationDistrict: z.string().min(1, "District is required"),
  storeIds: z.array(z.string().min(1)).min(1, "At least one store ID is required"),
});

export const updateStoreShippingSchema = z.object({
  homeDistrict: z.string().min(1).optional(),
  insideDistrictCost: z.number().nonnegative().optional(),
  outsideDistrictCost: z.number().nonnegative().optional(),
  districtOverrides: z
    .array(
      z.object({
        districtName: z.string().min(1),
        rate: z.number().nonnegative(),
      }),
    )
    .optional(),
});

export type CalculateShippingInput = z.infer<typeof calculateShippingSchema>;
export type UpdateStoreShippingInput = z.infer<typeof updateStoreShippingSchema>;
