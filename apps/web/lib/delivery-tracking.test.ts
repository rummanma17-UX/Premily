import test from "node:test";
import assert from "node:assert/strict";
import {
  generateDeliveryTracking,
  getStepIndex,
  ORDER_STEP_KEYS,
} from "./delivery-tracking";
import { type OrderRecord } from "./store-data";

const sampleDhakaOrder: OrderRecord = {
  id: "ord-test-dhaka",
  orderNumber: "PRM-TEST-DHK",
  storeId: "store-aura",
  storeSlug: "aura-home",
  storeName: "Aura Home Studio",
  customerName: "Rahim Uddin",
  customerPhone: "01712345678",
  shippingAddress: "House 10, Road 4, Dhanmondi",
  shippingDistrict: "Dhaka",
  shippingCity: "Dhanmondi, Dhaka",
  items: [
    {
      productId: "p1",
      name: "Aura Curved Lounge Chair",
      variantLabel: "Cream Boucle / Standard",
      price: 18500,
      quantity: 1,
      imageUrl: "https://example.com/chair.jpg",
    },
  ],
  subtotal: 18500,
  shippingCost: 70,
  total: 18570,
  paymentMethod: "BKASH",
  paymentStatus: "VERIFIED",
  transactionId: "TRX-123456",
  orderStatus: "PROCESSING",
  courierPartner: "Steadfast",
  consignmentId: "ST-882914-BD",
  createdAt: "2026-10-25T10:00:00Z",
  updatedAt: "2026-10-25T12:00:00Z",
};

const sampleChattogramOrder: OrderRecord = {
  ...sampleDhakaOrder,
  id: "ord-test-ctg",
  orderNumber: "PRM-TEST-CTG",
  shippingDistrict: "Chattogram",
  shippingCity: "Agrabad, Chattogram",
  shippingCost: 150,
  orderStatus: "SHIPPED",
  courierPartner: "Pathao",
  consignmentId: "PTH-99214-CTG",
};

test("getStepIndex returns expected 0-4 indices and -1 for cancelled", () => {
  assert.equal(getStepIndex("PENDING"), 0);
  assert.equal(getStepIndex("CONFIRMED"), 1);
  assert.equal(getStepIndex("PROCESSING"), 2);
  assert.equal(getStepIndex("SHIPPED"), 3);
  assert.equal(getStepIndex("DELIVERED"), 4);
  assert.equal(getStepIndex("CANCELLED"), -1);
});

test("ORDER_STEP_KEYS contains the 5 standard sequential lifecycle stages", () => {
  assert.deepEqual(ORDER_STEP_KEYS, [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ]);
});

test("generateDeliveryTracking generates correct Inside Dhaka logistics data", () => {
  const tracking = generateDeliveryTracking(sampleDhakaOrder);

  assert.equal(tracking.orderId, "ord-test-dhaka");
  assert.equal(tracking.isInsideDhaka, true);
  assert.equal(tracking.courierPartner, "Steadfast");
  assert.equal(tracking.consignmentId, "ST-882914-BD");
  assert.ok(tracking.estimatedDeliveryWindow.includes("Inside Dhaka: 1–2 business days"));
  assert.equal(tracking.milestones.length, 5);

  // Status is PROCESSING (index 2)
  // Step 0 (Placed), Step 1 (Confirmed), Step 2 (Processing) should be completed
  assert.equal(tracking.milestones[0].isCompleted, true);
  assert.equal(tracking.milestones[1].isCompleted, true);
  assert.equal(tracking.milestones[2].isCompleted, true);
  assert.equal(tracking.milestones[2].isCurrent, true);
  assert.equal(tracking.milestones[3].isCompleted, false);
  assert.equal(tracking.milestones[4].isCompleted, false);
  assert.ok(tracking.progressPercent > 0 && tracking.progressPercent <= 100);
});

test("generateDeliveryTracking generates Outside Dhaka regional hub routing", () => {
  const tracking = generateDeliveryTracking(sampleChattogramOrder);

  assert.equal(tracking.orderId, "ord-test-ctg");
  assert.equal(tracking.isInsideDhaka, false);
  assert.equal(tracking.courierPartner, "Pathao");
  assert.ok(tracking.estimatedDeliveryWindow.includes("Outside Dhaka (Chattogram): 3–5 business days"));

  // Status is SHIPPED (index 3)
  assert.equal(tracking.milestones[3].isCompleted, true);
  assert.equal(tracking.milestones[3].isCurrent, true);
  assert.ok(tracking.milestones[3].location.includes("Chattogram Sadar Logistics Hub"));
  assert.ok(tracking.riderName);
  assert.ok(tracking.riderPhone);
});

test("generateDeliveryTracking for DELIVERED status completes all 5 milestones", () => {
  const deliveredOrder: OrderRecord = {
    ...sampleDhakaOrder,
    orderStatus: "DELIVERED",
  };

  const tracking = generateDeliveryTracking(deliveredOrder);
  assert.equal(tracking.progressPercent, 100);
  for (const milestone of tracking.milestones) {
    assert.equal(milestone.isCompleted, true);
  }
  assert.equal(tracking.milestones[4].isCurrent, true);
});
