import { apiFetch } from "./api";

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  variantId: string;
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
  storeId: string; storeSlug: string; storeName: string; isPremilyMart: boolean;
  items: CartItem[]; subtotal: number; shippingCost: number;
}
type ApiCart = { items?: Array<Record<string, any>> } | null;
let items: CartItem[] = [];
let loaded = false;
let loading: Promise<CartItem[]> | null = null;
const emit = () => { if (typeof window !== "undefined") window.dispatchEvent(new Event("premily_cart_change")); };
function mapItems(cart: ApiCart): CartItem[] {
  return (cart?.items ?? []).map((item) => {
    const variant = item.variant ?? {};
    const product = variant.product ?? {};
    const store = product.store ?? {};
    return {
      id: item.id, productId: product.id ?? "", productSlug: product.slug ?? "",
      name: product.name ?? "", variantId: variant.id ?? item.variantId,
      variantLabel: [variant.color, variant.size].filter(Boolean).join(" / ") || "Standard",
      price: Number(variant.price ?? 0), compareAtPrice: variant.compareAtPrice == null ? null : Number(variant.compareAtPrice),
      quantity: Number(item.quantity ?? 0), imageUrl: product.images?.[0]?.url ?? "",
      storeId: store.id ?? product.storeId ?? "", storeSlug: store.slug ?? "",
      storeName: store.displayName ?? "", isPremilyMart: Boolean(store.isPremilyMart),
    };
  });
}
async function refresh(): Promise<CartItem[]> {
  if (loading) return loading;
  loading = apiFetch<ApiCart>("/api/cart").then((cart) => {
    items = mapItems(cart); loaded = true; emit(); return items;
  }).finally(() => { loading = null; });
  return loading;
}
export const CartService = {
  getCart: () => items,
  isLoaded: () => loaded,
  async loadCart() { return refresh(); },
  async addToCart(item: Omit<CartItem, "id"> & { id?: string }) {
    if (!item.variantId) throw new Error("Select a valid product option before adding it to your cart.");
    await apiFetch("/api/cart/items", { method: "POST", body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity || 1 }) });
    return refresh();
  },
  async updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) return this.removeFromCart(itemId);
    await apiFetch(`/api/cart/items/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
    return refresh();
  },
  async removeFromCart(itemId: string) {
    await apiFetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
    return refresh();
  },
  async clearCart() { await refresh(); },
  getItemCount: () => items.reduce((sum, item) => sum + item.quantity, 0),
  getSubtotal: () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  getStoreGroups(selectedDistrict = "Dhaka") {
    const stores = new Map<string, StoreCartGroup>();
    for (const item of items) {
      if (!stores.has(item.storeId)) stores.set(item.storeId, {
        storeId: item.storeId, storeSlug: item.storeSlug, storeName: item.storeName,
        isPremilyMart: Boolean(item.isPremilyMart), items: [], subtotal: 0, shippingCost: 0,
      });
      const group = stores.get(item.storeId)!;
      group.items.push(item); group.subtotal += item.price * item.quantity;
    }
    const groups = Array.from(stores.values());
    const totalSubtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
    return { groups, totalSubtotal, totalShipping: 0, grandTotal: totalSubtotal };
  },
};