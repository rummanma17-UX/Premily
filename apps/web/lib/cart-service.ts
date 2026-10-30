// ============================================================================
// PREMILY Reactive Cart Service
// Manages multi-store cart persistence, per-store shipping calculations
// (AGENT.md Rule 5), and cross-component reactive updates.
// ============================================================================

import { BANGLADESH_DISTRICTS } from "./bangladesh-districts";
import { StoreService } from "./store-data";

export interface CartItem {
  id: string; // product-id + variant
  productId: string;
  productSlug: string;
  name: string;
  variantId?: string;
  variantLabel: string;
  price: number;
  compareAtPrice?: number | null;
  quantity: number;
  imageUrl: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  isPremilyMart?: boolean;
}

export interface StoreCartGroup {
  storeId: string;
  storeSlug: string;
  storeName: string;
  isPremilyMart: boolean;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
}

const CART_STORAGE_KEY = "premily_cart";

const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: "cart-aura-lounge-cream",
    productId: "prod-aura-1",
    productSlug: "aura-curved-lounge-chair",
    name: "Aura Curved Lounge Chair",
    variantId: "var-cream",
    variantLabel: "Cream Boucle / Standard",
    price: 18500,
    compareAtPrice: 24000,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    isPremilyMart: true,
  },
];

let inMemoryCart: CartItem[] = [...INITIAL_CART_ITEMS];

export const CartService = {
  getCart(): CartItem[] {
    if (typeof window === "undefined") return inMemoryCart;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(INITIAL_CART_ITEMS));
      return INITIAL_CART_ITEMS;
    } catch {
      return inMemoryCart;
    }
  },

  saveCart(items: CartItem[]): void {
    inMemoryCart = items;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(new Event("premily_cart_change"));
      } catch {
        // storage quota fallback
      }
    }
  },

  addToCart(newItem: Omit<CartItem, "id"> & { id?: string }): CartItem[] {
    const items = this.getCart();
    const itemId = newItem.id || `${newItem.productId}-${newItem.variantLabel.replace(/\s+/g, "_")}`;
    const existingIndex = items.findIndex((i) => i.id === itemId);

    if (existingIndex > -1) {
      items[existingIndex].quantity += newItem.quantity || 1;
    } else {
      items.push({
        ...newItem,
        id: itemId,
        quantity: newItem.quantity || 1,
      });
    }

    this.saveCart(items);
    return items;
  },

  updateQuantity(itemId: string, quantity: number): CartItem[] {
    let items = this.getCart();
    if (quantity <= 0) {
      items = items.filter((i) => i.id !== itemId);
    } else {
      const target = items.find((i) => i.id === itemId);
      if (target) {
        target.quantity = quantity;
      }
    }
    this.saveCart(items);
    return items;
  },

  removeFromCart(itemId: string): CartItem[] {
    const items = this.getCart().filter((i) => i.id !== itemId);
    this.saveCart(items);
    return items;
  },

  clearCart(): void {
    this.saveCart([]);
  },

  getItemCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  /**
   * Group cart items by store and calculate shipping per store
   * strictly adhering to AGENT.md Rule 5 (Independent store fulfillment).
   */
  getStoreGroups(selectedDistrict: string = "Dhaka"): {
    groups: StoreCartGroup[];
    totalSubtotal: number;
    totalShipping: number;
    grandTotal: number;
  } {
    const items = this.getCart();
    const storesMap = new Map<string, StoreCartGroup>();
    const allStores = StoreService.getStores();

    for (const item of items) {
      if (!storesMap.has(item.storeId)) {
        const storeRec = allStores.find((s) => s.id === item.storeId);
        const homeDistrict = storeRec?.homeDistrict || "Dhaka";
        const insideCost = storeRec?.insideDistrictCost ?? 70;
        const outsideCost = storeRec?.outsideDistrictCost ?? 150;

        // Check for specific district override
        const override = storeRec?.districtOverrides?.find(
          (o) => o.district.toLowerCase() === selectedDistrict.toLowerCase()
        );

        let shippingCost = outsideCost;
        if (override) {
          shippingCost = override.rate;
        } else if (selectedDistrict.toLowerCase() === homeDistrict.toLowerCase()) {
          shippingCost = insideCost;
        }

        storesMap.set(item.storeId, {
          storeId: item.storeId,
          storeSlug: item.storeSlug,
          storeName: item.storeName,
          isPremilyMart: !!storeRec?.isPremilyMart,
          items: [],
          subtotal: 0,
          shippingCost,
        });
      }

      const group = storesMap.get(item.storeId)!;
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
    }

    const groups = Array.from(storesMap.values());
    const totalSubtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
    const totalShipping = groups.reduce((sum, g) => sum + g.shippingCost, 0);
    const grandTotal = totalSubtotal + totalShipping;

    return {
      groups,
      totalSubtotal,
      totalShipping,
      grandTotal,
    };
  },
};
