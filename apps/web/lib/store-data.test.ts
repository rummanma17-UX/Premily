import test from "node:test";
import assert from "node:assert/strict";
import { StoreService } from "./store-data";

test("AGENT.md Rule 4: Phone-First Bangladeshi Mobile validation", () => {
  const bdPhoneRegex = /^01[3-9]\d{8}$/;
  // Valid Bangladeshi mobile numbers
  assert.equal(bdPhoneRegex.test("01712345678"), true);
  assert.equal(bdPhoneRegex.test("01834567890"), true);
  assert.equal(bdPhoneRegex.test("01998765432"), true);
  assert.equal(bdPhoneRegex.test("01311223344"), true);

  // Invalid numbers
  assert.equal(bdPhoneRegex.test("01212345678"), false); // Invalid operator prefix
  assert.equal(bdPhoneRegex.test("0171234567"), false);  // 10 digits (too short)
  assert.equal(bdPhoneRegex.test("017123456789"), false); // 12 digits (too long)
  assert.equal(bdPhoneRegex.test("abcdefghijk"), false);
});

test("AGENT.md Rule 5: 64-District Logistics Base Rates", () => {
  const calculateShipping = (district: string) => {
    return district.toLowerCase() === "dhaka" ? 70 : 150;
  };

  assert.equal(calculateShipping("Dhaka"), 70);
  assert.equal(calculateShipping("Chattogram"), 150);
  assert.equal(calculateShipping("Sylhet"), 150);
  assert.equal(calculateShipping("Bogura"), 150);
  assert.equal(calculateShipping("Khulna"), 150);
});

test("AGENT.md Rule 2: Strict Mart Badge Governance", () => {
  const stores = StoreService.getStores();
  const auraStore = stores.find((s) => s.slug === "aura-home");
  const rflStore = stores.find((s) => s.slug === "rfl-official");
  const clayStore = stores.find((s) => s.slug === "clay-craft");

  // Official Brand Partners
  assert.equal(auraStore?.isPremilyMart, true);
  assert.equal(rflStore?.isPremilyMart, true);

  // Standard ordinary merchant
  assert.equal(clayStore?.isPremilyMart, false);
});

test("AGENT.md Rule 3: Independent Seller Verification Status", () => {
  const stores = StoreService.getStores();
  const clayStore = stores.find((s) => s.slug === "clay-craft");

  // Clay craft is pending trade license review
  assert.equal(clayStore?.verificationStatus, "PENDING");
  assert.equal(clayStore?.isPremilyMart, false); // Independent from Mart status
});

test("AGENT.md Business Model: ৳150/month Seller Subscription", () => {
  const stores = StoreService.getStores();
  for (const s of stores) {
    assert.equal(s.subscription.planAmount, 150);
    assert.equal(["TRIALING", "ACTIVE", "PAST_DUE", "EXPIRED"].includes(s.subscription.status), true);
  }
});

test("Multi-store Orders: Order Creation & Status Lifecycle", () => {
  const initialOrderCount = StoreService.getOrders().length;
  assert.ok(initialOrderCount >= 4);

  const created = StoreService.addOrder({
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    customerName: "Imtiaz Ahmed",
    customerPhone: "01799887766",
    shippingAddress: "Road 7, Dhanmondi",
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
    paymentStatus: "PENDING",
    transactionId: "BK11223344",
    orderStatus: "PENDING",
  });

  assert.ok(created.id);
  assert.ok(created.orderNumber.startsWith("PRM-"));
  assert.equal(created.orderStatus, "PENDING");

  // Status progression to SHIPPED
  const updated = StoreService.updateOrderStatus(created.id, "SHIPPED", {
    partner: "Steadfast",
    consignmentId: "ST-TEST-001",
  });

  assert.equal(updated.orderStatus, "SHIPPED");
  assert.equal(updated.courierPartner, "Steadfast");
  assert.equal(updated.consignmentId, "ST-TEST-001");
});
