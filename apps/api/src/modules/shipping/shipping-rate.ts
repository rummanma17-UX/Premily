export type ShippingRateInput = {
  destinationDistrict: string;
  homeDistrict?: string | null | undefined;
  insideDistrictCost?: number | string | { toString(): string } | null | undefined;
  outsideDistrictCost?: number | string | { toString(): string } | null | undefined;
  platformBaseCost?: number | string | { toString(): string } | null | undefined;
  estimatedDaysMin?: number | null | undefined;
  estimatedDaysMax?: number | null | undefined;
};
export type ShippingRateResult = {
  shippingCost: number;
  isHomeDistrict: boolean;
  estimatedDays: string;
  rateSource: "PLATFORM_DEFAULT" | "STORE_CUSTOM";
};
const DEFAULT_INSIDE_DISTRICT_RATE = 70;
const DEFAULT_OUTSIDE_DISTRICT_RATE = 150;
function normalizeDistrict(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase();
}
/** Seller rates take precedence, then destination district platform rate, then fallback. */
export function calculateShippingRate(input: ShippingRateInput): ShippingRateResult {
  const isHomeDistrict = normalizeDistrict(input.destinationDistrict) === normalizeDistrict(input.homeDistrict ?? "Dhaka");
  const customRate = isHomeDistrict ? input.insideDistrictCost : input.outsideDistrictCost;
  const platformRate = input.platformBaseCost ?? (isHomeDistrict ? DEFAULT_INSIDE_DISTRICT_RATE : DEFAULT_OUTSIDE_DISTRICT_RATE);
  const minDays = isHomeDistrict ? 1 : (input.estimatedDaysMin ?? 3);
  const maxDays = isHomeDistrict ? 2 : (input.estimatedDaysMax ?? 5);
  return {
    shippingCost: Number(customRate ?? platformRate),
    isHomeDistrict,
    estimatedDays: `${minDays}-${maxDays} Business Days`,
    rateSource: customRate == null ? "PLATFORM_DEFAULT" : "STORE_CUSTOM",
  };
}
