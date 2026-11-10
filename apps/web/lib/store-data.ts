import { apiFetch } from "./api";

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH" | "NAGAD";
export type PaymentStatus = "PENDING" | "VERIFIED" | "FAILED";

export interface DistrictOverride { district: string; rate: number; }

export interface StoreRecord {
  id: string;
  slug: string;
  displayName: string;
  sellerName: string;
  phone: string;
  email: string | null;
  description: string;
  logoUrl: string | null;
  bannerUrl: string;
  primaryColor: string;
  isPremilyMart: boolean;
  verificationStatus: VerificationStatus;
  tradeLicenseNo?: string;
  nidNumber?: string;
  verificationNote?: string;
  submittedAt?: string;
  homeDistrict: string;
  insideDistrictCost: number;
  outsideDistrictCost: number;
  districtOverrides: DistrictOverride[];
  subscription: {
    status: SubscriptionStatus;
    planAmount: number;
    trialEndsAt: string;
    currentPeriodEnd: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    avgRating: number;
    totalReviews: number;
    totalSales: number;
    revenue: number;
  };
}

export interface ProductRecord {
  id: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sizes: string[];
  colors: string[];
  imageUrl: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  avgRating: number;
  reviewCount: number;
  salesCount: number;
  isFeatured?: boolean;
}

export interface OrderItemRecord {
  productId: string;
  name: string;
  variantLabel: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  shippingDistrict: string;
  shippingCity: string;
  items: OrderItemRecord[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
  badgeText: string;
  discountPercent: number;
  isActive: boolean;
  endsAt: string;
}

type ApiStore = Record<string, any>;
type ApiOrder = Record<string, any>;
type ApiProduct = Record<string, any>;
type ApiCampaign = Record<string, any>;

const cache = {
  stores: [] as StoreRecord[],
  products: [] as ProductRecord[],
  orders: [] as OrderRecord[],
  campaigns: [] as CampaignRecord[],
};

function number(value: unknown): number {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function dateString(value: unknown): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function mapStore(raw: ApiStore): StoreRecord {
  const seller = raw.seller ?? {};
  const subscription = raw.subscription ?? {};
  const stats = raw.stats ?? {};
  return {
    id: raw.id,
    slug: raw.slug,
    displayName: raw.displayName,
    sellerName: seller.name ?? raw.sellerName ?? "",
    phone: seller.phone ?? raw.phone ?? "",
    email: seller.email ?? raw.email ?? null,
    description: raw.description ?? "",
    logoUrl: raw.logoUrl ?? null,
    bannerUrl: raw.bannerUrl ?? "",
    primaryColor: raw.primaryColor ?? "#B8924B",
    isPremilyMart: Boolean(raw.isPremilyMart),
    verificationStatus: raw.verificationStatus ?? "UNVERIFIED",
    tradeLicenseNo: raw.tradeLicenseNo ?? "",
    nidNumber: raw.nidNumber ?? "",
    verificationNote: raw.verificationNote ?? "",
    submittedAt: dateString(raw.submittedAt),
    homeDistrict: raw.homeDistrict ?? "",
    insideDistrictCost: number(raw.insideDistrictCost),
    outsideDistrictCost: number(raw.outsideDistrictCost),
    districtOverrides: [],
    subscription: {
      status: subscription.status ?? "EXPIRED",
      planAmount: number(subscription.amount),
      trialEndsAt: dateString(subscription.trialEndsAt),
      currentPeriodEnd: dateString(subscription.currentPeriodEnd),
    },
    stats: {
      totalProducts: number(stats.totalProducts ?? raw._count?.products),
      totalOrders: number(stats.totalOrders ?? raw._count?.orders),
      avgRating: number(stats.avgRating),
      totalReviews: number(stats.totalReviews),
      totalSales: number(stats.totalSales),
      revenue: number(stats.revenue),
    },
  };
}

function mapProduct(raw: ApiProduct): ProductRecord {
  const variants = Array.isArray(raw.variants) ? raw.variants : [];
  const activeVariants = variants.filter((variant: ApiProduct) => variant.isActive !== false);
  const firstVariant = activeVariants[0] ?? variants[0] ?? {};
  const images = Array.isArray(raw.images) ? raw.images : [];
  const store = raw.store ?? {};
  const category = raw.category ?? {};
  return {
    id: raw.id,
    storeId: raw.storeId ?? store.id ?? "",
    storeSlug: store.slug ?? "",
    storeName: store.displayName ?? "",
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? "",
    categoryId: raw.categoryId ?? category.id ?? "",
    categoryName: category.name ?? "",
    price: number(firstVariant.price),
    compareAtPrice: firstVariant.compareAtPrice == null ? null : number(firstVariant.compareAtPrice),
    stock: variants.reduce((sum: number, variant: ApiProduct) => sum + number(variant.stock), 0),
    sizes: [...new Set(variants.map((variant: ApiProduct) => variant.size).filter(Boolean))] as string[],
    colors: [...new Set(variants.map((variant: ApiProduct) => variant.color).filter(Boolean))] as string[],
    imageUrl: images[0]?.url ?? "",
    status: raw.status ?? "DRAFT",
    avgRating: number(raw.avgRating),
    reviewCount: number(raw.reviewCount),
    salesCount: number(raw.salesCount),
    isFeatured: Boolean(raw.isFeatured),
  };
}

function mapOrder(raw: ApiOrder): OrderRecord {
  const payment = (raw.payments ?? [])[0] ?? {};
  const store = raw.store ?? {};
  const user = raw.user ?? {};
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    storeId: raw.storeId ?? store.id ?? "",
    storeSlug: store.slug ?? "",
    storeName: store.displayName ?? "",
    customerName: raw.shippingName ?? user.name ?? "",
    customerPhone: raw.shippingPhone ?? user.phone ?? "",
    shippingAddress: raw.shippingAddress ?? "",
    shippingDistrict: raw.shippingDistrict ?? "",
    shippingCity: raw.shippingCity ?? "",
    items: (raw.items ?? []).map((item: ApiOrder) => ({
      productId: item.variant?.productId ?? item.productId ?? "",
      name: item.productName ?? "",
      variantLabel: item.variantLabel ?? "",
      price: number(item.priceAtOrder),
      quantity: number(item.quantity),
      imageUrl: item.productImageUrlAtOrder ?? "",
    })),
    subtotal: number(raw.subtotal),
    shippingCost: number(raw.shippingCost),
    total: number(raw.total),
    paymentMethod: payment.method ?? "CASH_ON_DELIVERY",
    paymentStatus: payment.status ?? "PENDING",
    transactionId: payment.transactionId ?? null,
    orderStatus: raw.status ?? "PENDING",
    createdAt: dateString(raw.createdAt),
    updatedAt: dateString(raw.updatedAt),
  };
}

function mapCampaign(raw: ApiCampaign): CampaignRecord {
  const firstItem = (raw.items ?? [])[0];
  const originalPrice = number(firstItem?.product?.variants?.[0]?.price);
  const salePrice = number(firstItem?.salePrice);
  const discountPercent = originalPrice > salePrice && originalPrice > 0
    ? Math.round((1 - salePrice / originalPrice) * 100)
    : 0;
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? "",
    bannerUrl: raw.bannerUrl ?? "",
    badgeText: raw.badgeText ?? "",
    discountPercent,
    isActive: Boolean(raw.isActive),
    endsAt: dateString(raw.endsAt),
  };
}

function notifyDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("premily_data_change"));
  }
}

async function fetchCampaigns(admin = false): Promise<CampaignRecord[]> {
  const endpoint = "/api/campaigns";
  const records = await apiFetch<ApiCampaign[]>(endpoint);
  return records.map(mapCampaign);
}

export const StoreService = {
  getStores: () => cache.stores,
  getStoreBySlug: (slug: string) => cache.stores.find((store) => store.slug.toLowerCase() === slug.toLowerCase()),
  getProducts: () => cache.products,
  getProductsByStore: (storeSlug: string) => cache.products.filter((product) => product.storeSlug.toLowerCase() === storeSlug.toLowerCase()),
  getOrders: () => cache.orders,
  getOrdersByStore: (storeSlug: string) => cache.orders.filter((order) => order.storeSlug.toLowerCase() === storeSlug.toLowerCase()),
  getCampaigns: () => cache.campaigns,

  async loadAdminData() {
    const [storeResult, orderResult, campaignResult] = await Promise.all([
      apiFetch<{ stores: ApiStore[] }>("/api/admin/stores?limit=100"),
      apiFetch<{ orders: ApiOrder[] }>("/api/admin/orders?limit=100"),
      fetchCampaigns(),
    ]);
    cache.stores = storeResult.stores.map(mapStore);
    cache.orders = orderResult.orders.map(mapOrder);
    cache.campaigns = campaignResult;
    notifyDataChanged();
    return { stores: cache.stores, orders: cache.orders, campaigns: cache.campaigns };
  },

  async loadSellerData() {
    const [rawStore, rawProducts, rawOrders] = await Promise.all([
      apiFetch<ApiStore>("/api/stores/mine"),
      apiFetch<ApiProduct[]>("/api/products/mine"),
      apiFetch<{ orders: ApiOrder[] }>("/api/orders/seller"),
    ]);
    const store = mapStore(rawStore);
    cache.stores = [store];
    cache.products = rawProducts.map((product) => mapProduct({ ...product, store: { ...product.store, ...rawStore } }));
    cache.orders = rawOrders.orders.map((order) => mapOrder({ ...order, store: order.store ?? rawStore }));
    notifyDataChanged();
    return { store, products: cache.products, orders: cache.orders };
  },

  async loadCustomerOrders() {
    const rawOrders = await apiFetch<ApiOrder[]>("/api/orders");
    cache.orders = rawOrders.map(mapOrder);
    notifyDataChanged();
    return cache.orders;
  },

  async refreshAdminData() {
    return this.loadAdminData();
  },

  async refreshSellerData() {
    return this.loadSellerData();
  },

  async updateStore(updated: Partial<StoreRecord> & { id: string }): Promise<StoreRecord> {
    const current = cache.stores.find((store) => store.id === updated.id);
    if (!current) throw new Error("Store data is not loaded. Refresh and try again.");
    let raw: ApiStore | undefined;

    if (updated.isPremilyMart !== undefined) {
      raw = await apiFetch<ApiStore>(`/api/admin/stores/${updated.id}/mart`, {
        method: "PATCH",
        body: JSON.stringify({ isPremilyMart: updated.isPremilyMart }),
      });
    }
    if (updated.verificationStatus !== undefined && current) {
      raw = await apiFetch<ApiStore>(`/api/admin/stores/${updated.id}/verification`, {
        method: "PATCH",
        body: JSON.stringify({
          verificationStatus: updated.verificationStatus,
          verificationNote: updated.verificationNote,
        }),
      });
    }

    const profileKeys = ["displayName", "slug", "description", "logoUrl", "bannerUrl", "primaryColor", "tradeLicenseNo", "nidNumber", "verificationNote"];
    const profileUpdate: Record<string, unknown> = {};
    for (const key of profileKeys) {
      if (updated[key as keyof StoreRecord] !== undefined) profileUpdate[key] = updated[key as keyof StoreRecord];
    }
    if (Object.keys(profileUpdate).length) {
      raw = await apiFetch<ApiStore>("/api/stores/mine", {
        method: "PUT",
        body: JSON.stringify(profileUpdate),
      });
    }

    if (
      updated.homeDistrict !== undefined ||
      updated.insideDistrictCost !== undefined ||
      updated.outsideDistrictCost !== undefined
    ) {
      raw = await apiFetch<ApiStore>("/api/shipping/store", {
        method: "PUT",
        body: JSON.stringify({
          ...(updated.homeDistrict !== undefined && { homeDistrict: updated.homeDistrict }),
          ...(updated.insideDistrictCost !== undefined && { insideDistrictCost: updated.insideDistrictCost }),
          ...(updated.outsideDistrictCost !== undefined && { outsideDistrictCost: updated.outsideDistrictCost }),
        }),
      });
    }

    const merged = { ...current, ...updated, ...(raw ? mapStore({ ...current, ...raw, seller: raw.seller ?? { name: current.sellerName, phone: current.phone, email: current.email }, subscription: raw.subscription ?? undefined, stats: current.stats }) : {}) };
    cache.stores = cache.stores.map((store) => store.id === updated.id ? merged : store);
    notifyDataChanged();
    return merged;
  },

  async verifyOrderPayment(orderId: string): Promise<void> {
    await apiFetch(`/api/orders/${orderId}/verify-payment`, { method: "POST", body: JSON.stringify({}) });
    await this.loadAdminData();
  },

  async toggleCampaign(id: string): Promise<void> {
    await apiFetch(`/api/campaigns/${id}/status`, { method: "PATCH", body: JSON.stringify({}) });
    await this.loadAdminData();
  },

  async addProduct(newProduct: Omit<ProductRecord, "id" | "salesCount" | "avgRating" | "reviewCount">): Promise<ProductRecord> {
    const categories = await apiFetch<Array<{id:string;name:string;slug:string}>>("/api/categories");
    const category = categories.find((item) =>
      item.id === newProduct.categoryId ||
      item.slug.toLowerCase() === newProduct.categoryId.toLowerCase() ||
      item.name.toLowerCase() === newProduct.categoryName.toLowerCase()
    );
    if (!category) throw new Error("Choose a category that exists in the catalogue.");
    if (!newProduct.imageUrl.trim()) throw new Error("A product image URL is required.");
    if (newProduct.stock < 1) throw new Error("At least one item must be in stock.");
    const created = await apiFetch<ApiProduct>("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        categoryId: category.id,
        variants: [{
          sku: `${newProduct.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${Date.now().toString(36).toUpperCase()}`,
          price: newProduct.price,
          stock: newProduct.stock,
          size: newProduct.sizes[0] || undefined,
          color: newProduct.colors[0] || undefined,
        }],
        images: [{ url: newProduct.imageUrl, altText: newProduct.name, position: 0 }],
      }),
    });
    const result = mapProduct({ ...created, store: { id: currentStoreId(), slug: currentStoreSlug(), displayName: currentStoreName() } });
    cache.products = [result, ...cache.products.filter((product) => product.id !== result.id)];
    notifyDataChanged();
    return result;
  },

  async updateProduct(productId: string, updates: Partial<ProductRecord>): Promise<ProductRecord> {
    const updated = await apiFetch<ApiProduct>(`/api/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.slug !== undefined && { slug: updates.slug }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.categoryId !== undefined && { categoryId: updates.categoryId }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.compareAtPrice !== undefined && { compareAtPrice: updates.compareAtPrice }),
        ...(updates.stock !== undefined && { stock: updates.stock }),
        ...(updates.sizes !== undefined && { size: updates.sizes[0] ?? null }),
        ...(updates.colors !== undefined && { color: updates.colors[0] ?? null }),
        ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
      }),
    });
    const result = mapProduct(updated);
    cache.products = cache.products.map((product) => product.id === productId ? result : product);
    notifyDataChanged();
    return result;
  },

  async deleteProduct(productId: string): Promise<void> {
    await apiFetch(`/api/products/${productId}`, { method: "DELETE" });
    cache.products = cache.products.filter((product) => product.id !== productId);
    notifyDataChanged();
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await apiFetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await this.loadSellerData();
  },
};

function currentStoreId() { return cache.stores[0]?.id ?? ""; }
function currentStoreSlug() { return cache.stores[0]?.slug ?? ""; }
function currentStoreName() { return cache.stores[0]?.displayName ?? ""; }
