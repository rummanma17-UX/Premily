import { type OrderRecord, type OrderStatus } from "./store-data";

export interface TrackingMilestone {
  id: string; stepIndex: number; title: string; description: string;
  location: string; timestamp: string; isCompleted: boolean; isCurrent: boolean;
}
export interface CourierTrackingData {
  orderId: string; orderNumber: string; storeName: string;
  courierPartner: string; consignmentId: string; orderStatus: OrderStatus;
  shippingDistrict: string; shippingAddress: string; customerName: string;
  customerPhone: string; isInsideDhaka: boolean; estimatedDeliveryWindow: string;
  progressPercent: number; milestones: TrackingMilestone[]; lastCheckedAt: string;
}
export const ORDER_STEP_KEYS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
export function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "PENDING": return 0;
    case "CONFIRMED": return 1;
    case "PROCESSING": return 2;
    case "SHIPPED": return 3;
    case "DELIVERED": return 4;
    case "CANCELLED":
    case "RETURNED": return -1;
    default: return 0;
  }
}

/**
 * Shows only the order lifecycle known to Premily. Courier partner, consignment
 * number, rider identity and scan timestamps must come from a real courier API;
 * they are deliberately not fabricated here.
 */
export function generateDeliveryTracking(order: OrderRecord): CourierTrackingData {
  const insideDhaka = order.shippingDistrict.trim().toLowerCase() === "dhaka";
  const step = getStepIndex(order.orderStatus);
  const labels = ["Order placed", "Seller confirmed", "Preparing order", "Handed to courier", "Delivered"];
  const descriptions = [
    "Your order was received by Premily.",
    "The seller has confirmed the order.",
    "The seller is preparing your order.",
    "Courier handover has been recorded by the seller. Live courier scans are not connected.",
    "The order has been marked as delivered.",
  ];
  const created = new Date(order.createdAt);
  const placedAt = Number.isNaN(created.getTime()) ? "Date unavailable" : created.toLocaleString("en-BD");
  const milestones = labels.map((title, index) => ({
    id: `step-${index + 1}`,
    stepIndex: index,
    title,
    description: descriptions[index],
    location: index === 0 ? order.storeName : index === 4 ? `${order.shippingAddress}, ${order.shippingDistrict}` : "Awaiting a verified courier update",
    timestamp: index === 0 ? placedAt : step >= index ? "Status recorded; courier timestamp unavailable" : "Awaiting update",
    isCompleted: step >= index && step >= 0,
    isCurrent: step === index,
  }));
  return {
    orderId: order.id, orderNumber: order.orderNumber, storeName: order.storeName,
    courierPartner: "Not assigned", consignmentId: "", orderStatus: order.orderStatus,
    shippingDistrict: order.shippingDistrict, shippingAddress: order.shippingAddress,
    customerName: order.customerName, customerPhone: order.customerPhone,
    isInsideDhaka: insideDhaka,
    estimatedDeliveryWindow: insideDhaka ? "Estimated: 1–2 business days" : "Estimated: 3–5 business days",
    progressPercent: step < 0 ? 0 : Math.round(((step + 1) / ORDER_STEP_KEYS.length) * 100),
    milestones, lastCheckedAt: new Date().toISOString(),
  };
}
