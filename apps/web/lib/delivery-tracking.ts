// ============================================================================
// PREMILY Delivery & Courier Tracking Engine
// Realistic Bangladesh 64-District courier milestone tracking for
// Steadfast, Pathao, RedX, and Paperfly partner logistics.
// ============================================================================

import { type OrderRecord, type OrderStatus } from "./store-data";

export interface TrackingMilestone {
  id: string;
  stepIndex: number;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
  courierRef?: string;
}

export interface CourierTrackingData {
  orderId: string;
  orderNumber: string;
  storeName: string;
  courierPartner: "Steadfast" | "Pathao" | "RedX" | "Paperfly";
  consignmentId: string;
  orderStatus: OrderStatus;
  shippingDistrict: string;
  shippingAddress: string;
  customerName: string;
  customerPhone: string;
  isInsideDhaka: boolean;
  estimatedDeliveryWindow: string;
  progressPercent: number;
  riderName?: string;
  riderPhone?: string;
  milestones: TrackingMilestone[];
  lastCheckedAt: string;
}

export const ORDER_STEP_KEYS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PROCESSING":
      return 2;
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 4;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}

/**
 * Generates realistic Bangladesh courier delivery milestones based on
 * order status, destination district, and assigned courier partner.
 */
export function generateDeliveryTracking(order: OrderRecord): CourierTrackingData {
  const isInsideDhaka = order.shippingDistrict.trim().toLowerCase() === "dhaka";
  const stepIdx = getStepIndex(order.orderStatus);
  const partner = order.courierPartner || "Steadfast";
  const consignmentId = order.consignmentId || `ST-${order.orderNumber.replace(/[^0-9]/g, "").slice(-6) || "98214"}-BD`;

  const orderCreatedDate = new Date(order.createdAt);
  
  // Format milestone timestamps relative to order creation
  const t0 = orderCreatedDate.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const t1Date = new Date(orderCreatedDate.getTime() + 1000 * 60 * 45); // +45m
  const t1 = t1Date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const t2Date = new Date(orderCreatedDate.getTime() + 1000 * 60 * 60 * 4); // +4h
  const t2 = t2Date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const t3Date = new Date(orderCreatedDate.getTime() + 1000 * 60 * 60 * 18); // +18h
  const t3 = t3Date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const t4Date = new Date(orderCreatedDate.getTime() + 1000 * 60 * 60 * (isInsideDhaka ? 28 : 72)); // +28h Dhaka, +72h Outside
  const t4 = t4Date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Hub and rider logistics assignment based on partner and destination
  const regionalHub = isInsideDhaka
    ? "Tejgaon Central Hub, Dhaka"
    : `${order.shippingDistrict} Sadar Logistics Hub`;

  const riderInfo = {
    name: isInsideDhaka ? "Md. Shakil Hasan" : "Nurul Islam",
    phone: isInsideDhaka ? "01788112233" : "01899445566",
  };

  const milestones: TrackingMilestone[] = [
    {
      id: "step-1",
      stepIndex: 0,
      title: "Order Placed & Payment Logged",
      description: `Order received via ${order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : `${order.paymentMethod} (${order.paymentStatus})`}. Seller invoice created.`,
      location: order.storeName,
      timestamp: t0,
      isCompleted: stepIdx >= 0,
      isCurrent: stepIdx === 0,
    },
    {
      id: "step-2",
      stepIndex: 1,
      title: "Confirmed & Prepared by Merchant",
      description: `Boutique seller verified inventory and generated shipping manifest with ${partner}.`,
      location: `${order.storeName} Studio, Dhaka`,
      timestamp: stepIdx >= 1 ? t1 : "Pending Confirmation",
      isCompleted: stepIdx >= 1,
      isCurrent: stepIdx === 1,
    },
    {
      id: "step-3",
      stepIndex: 2,
      title: `Consignment Handed to ${partner} Express`,
      description: `Parcel packed with luxury protective boxing and handed to courier pickup rider. Consignment #${consignmentId}.`,
      location: "Boutique Dispatch Center",
      timestamp: stepIdx >= 2 ? t2 : "Awaiting Dispatch",
      isCompleted: stepIdx >= 2,
      isCurrent: stepIdx === 2,
      courierRef: consignmentId,
    },
    {
      id: "step-4",
      stepIndex: 3,
      title: `In Transit · ${partner} Regional Sorting Hub`,
      description: `Processed at ${regionalHub}. Dispatched to destination delivery hub for doorstep delivery.`,
      location: regionalHub,
      timestamp: stepIdx >= 3 ? t3 : "Scheduled Transit",
      isCompleted: stepIdx >= 3,
      isCurrent: stepIdx === 3,
    },
    {
      id: "step-5",
      stepIndex: 4,
      title: stepIdx === 4 ? "Delivered to Doorstep" : "Out for Final Delivery",
      description:
        stepIdx === 4
          ? `Delivered to ${order.customerName}. Payment settled and signed.`
          : `Assigned to ${partner} Delivery Hero (${riderInfo.name}, ${riderInfo.phone}). Expected delivery today.`,
      location: `${order.shippingAddress}, ${order.shippingDistrict}`,
      timestamp: stepIdx === 4 ? t4 : isInsideDhaka ? "Within 24–48 hours" : "Within 3–5 business days",
      isCompleted: stepIdx >= 4,
      isCurrent: stepIdx === 4,
    },
  ];

  const estimatedDeliveryWindow = isInsideDhaka
    ? "Inside Dhaka: 1–2 business days"
    : `Outside Dhaka (${order.shippingDistrict}): 3–5 business days`;

  const progressPercent =
    order.orderStatus === "CANCELLED"
      ? 0
      : Math.min(100, Math.round(((Math.max(0, stepIdx) + 1) / ORDER_STEP_KEYS.length) * 100));

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    storeName: order.storeName,
    courierPartner: partner,
    consignmentId,
    orderStatus: order.orderStatus,
    shippingDistrict: order.shippingDistrict,
    shippingAddress: order.shippingAddress,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    isInsideDhaka,
    estimatedDeliveryWindow,
    progressPercent,
    riderName: stepIdx >= 3 ? riderInfo.name : undefined,
    riderPhone: stepIdx >= 3 ? riderInfo.phone : undefined,
    milestones,
    lastCheckedAt: new Date().toISOString(),
  };
}
