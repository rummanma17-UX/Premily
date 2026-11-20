export type PaymentFact = { method: string; status: string };
const SELLER_NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED", CONFIRMED: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED",
};
export function canSellerTransitionOrder(currentStatus: string, targetStatus: string, payments: PaymentFact[]): boolean {
  if (SELLER_NEXT_STATUS[currentStatus] !== targetStatus) return false;
  if (targetStatus === "CONFIRMED") {
    return payments.some(p => p.method === "CASH_ON_DELIVERY" || p.status === "VERIFIED");
  }
  return true;
}
export function canAdminTransitionOrder(currentStatus: string, targetStatus: string, payments: PaymentFact[]): boolean {
  if (currentStatus === "PENDING" && targetStatus === "CANCELLED") return true;
  if (currentStatus === "PENDING" && targetStatus === "CONFIRMED") {
    return payments.some(p => p.method === "CASH_ON_DELIVERY" || p.status === "VERIFIED");
  }
  if (currentStatus === "CONFIRMED" && targetStatus === "PROCESSING") return true;
  if (currentStatus === "PROCESSING" && targetStatus === "SHIPPED") return true;
  if (currentStatus === "SHIPPED" && targetStatus === "DELIVERED") return true;
  if (currentStatus === "DELIVERED" && targetStatus === "RETURNED") return true;
  return false;
}
