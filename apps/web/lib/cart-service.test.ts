import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CartService } from "./cart-service";

describe("CartService - Multi-Store Grouping & Per-Store Delivery (AGENT.md Rule 5)", () => {
  it("groups items by store and applies distinct district delivery fees", () => {
    // Clear and seed test items across 2 different stores
    CartService.saveCart([
      {
        id: "item-1",
        productId: "prod-aura-1",
        productSlug: "aura-curved-lounge-chair",
        name: "Aura Curved Lounge Chair",
        variantLabel: "Cream Boucle / Standard",
        price: 18500,
        quantity: 1,
        imageUrl: "https://example.com/img1.jpg",
        storeId: "store-aura",
        storeSlug: "aura-home",
        storeName: "Aura Home Studio",
        isPremilyMart: true,
      },
      {
        id: "item-2",
        productId: "prod-lumina-1",
        productSlug: "lumina-brass-sconce",
        name: "Lumina Sconce",
        variantLabel: "Antique Brass / Warm Glow",
        price: 7800,
        quantity: 2,
        imageUrl: "https://example.com/img2.jpg",
        storeId: "store-lumina",
        storeSlug: "lumina-decor",
        storeName: "Lumina Lighting Co.",
        isPremilyMart: false,
      },
    ]);

    // Check Inside Dhaka delivery calculation
    const dhakaGroups = CartService.getStoreGroups("Dhaka");
    assert.strictEqual(dhakaGroups.groups.length, 2);
    assert.strictEqual(dhakaGroups.totalSubtotal, 18500 + 7800 * 2); // 34100
    // Aura home district is Dhaka (৳70), Lumina home district is Dhaka (৳70)
    assert.strictEqual(dhakaGroups.totalShipping, 70 + 70); // 140
    assert.strictEqual(dhakaGroups.grandTotal, 34100 + 140);

    // Check Outside Dhaka delivery calculation (e.g. Chittagong)
    const ctgGroups = CartService.getStoreGroups("Chittagong");
    assert.strictEqual(ctgGroups.groups.length, 2);
    // Both stores outside district rate: ৳150 each
    assert.strictEqual(ctgGroups.totalShipping, 150 + 150); // 300
    assert.strictEqual(ctgGroups.grandTotal, 34100 + 300);
  });

  it("calculates cart item count and subtotal correctly", () => {
    CartService.saveCart([
      {
        id: "item-a",
        productId: "prod-a",
        productSlug: "prod-a",
        name: "Product A",
        variantLabel: "Standard",
        price: 5000,
        quantity: 3,
        imageUrl: "https://example.com/a.jpg",
        storeId: "store-aura",
        storeSlug: "aura-home",
        storeName: "Aura Home Studio",
      },
    ]);

    assert.strictEqual(CartService.getItemCount(), 3);
    assert.strictEqual(CartService.getSubtotal(), 15000);
  });
});
