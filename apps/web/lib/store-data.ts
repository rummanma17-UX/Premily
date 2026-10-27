// ============================================================================
// PREMILY Store Data Architecture
// Manages reactive multi-store persistence, orders, products, and admin states
// strictly following AGENT.md guidelines (Dual Homepage, Mart Strictness,
// Seller Verification, Phone-First BD Auth, 64-District Logistics).
// ============================================================================

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "EXPIRED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH" | "NAGAD";
export type PaymentStatus = "PENDING" | "VERIFIED" | "FAILED";

export interface DistrictOverride {
  district: string;
  rate: number;
}

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
  isPremilyMart: boolean; // Strictly controlled by Admin
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
    planAmount: number; // ৳150
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
  courierPartner?: "Steadfast" | "Pathao" | "RedX" | "Paperfly";
  consignmentId?: string;
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

// Default Seed Data
const INITIAL_STORES: StoreRecord[] = [
  {
    id: "store-aura",
    slug: "aura-home",
    displayName: "Aura Home Studio",
    sellerName: "Abdullah Al Rumman",
    phone: "01711111111",
    email: "rummanma17@gmail.com",
    description: "Curated bespoke furniture, textured boucle seating, and architectural brass & travertine home essentials.",
    logoUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "#B8924B",
    isPremilyMart: true,
    verificationStatus: "VERIFIED",
    tradeLicenseNo: "TRAD/DSCC/019284/2024",
    nidNumber: "19942691234567890",
    verificationNote: "Verified with Dhaka South City Corporation trade license & biometric NID.",
    submittedAt: "2026-01-10T10:00:00Z",
    homeDistrict: "Dhaka",
    insideDistrictCost: 70,
    outsideDistrictCost: 150,
    districtOverrides: [
      { district: "Gazipur", rate: 100 },
      { district: "Narayanganj", rate: 90 },
    ],
    subscription: {
      status: "ACTIVE",
      planAmount: 150,
      trialEndsAt: "2026-02-10T00:00:00Z",
      currentPeriodEnd: "2026-11-27T00:00:00Z",
    },
    stats: {
      totalProducts: 4,
      totalOrders: 84,
      avgRating: 4.9,
      totalReviews: 312,
      totalSales: 184,
      revenue: 148500,
    },
  },
  {
    id: "store-lumina",
    slug: "lumina-decor",
    displayName: "Lumina Lighting Co.",
    sellerName: "Kamrul Islam",
    phone: "01822222222",
    email: "kamrul@lumina.bd",
    description: "Artisan brass sconces, sculpted alabaster chandeliers, and minimalist ambient warm lighting.",
    logoUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "#D4B375",
    isPremilyMart: false,
    verificationStatus: "VERIFIED",
    tradeLicenseNo: "TRAD/DNCC/083921/2025",
    nidNumber: "19882699876543210",
    verificationNote: "Verified with Dhaka North Trade License.",
    submittedAt: "2026-02-15T09:30:00Z",
    homeDistrict: "Dhaka",
    insideDistrictCost: 70,
    outsideDistrictCost: 150,
    districtOverrides: [],
    subscription: {
      status: "TRIALING",
      planAmount: 150,
      trialEndsAt: "2026-11-15T00:00:00Z",
      currentPeriodEnd: "2026-11-15T00:00:00Z",
    },
    stats: {
      totalProducts: 2,
      totalOrders: 32,
      avgRating: 4.8,
      totalReviews: 64,
      totalSales: 45,
      revenue: 68400,
    },
  },
  {
    id: "store-clay",
    slug: "clay-craft",
    displayName: "Clay & Craft Pottery",
    sellerName: "Nazmul Huda",
    phone: "01933333333",
    email: "nazmul@claycraft.com",
    description: "Handcrafted Bangladeshi stoneware, matte black terracotta planters, and ceramic tableware from Dhamrai artisans.",
    logoUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "#8C6239",
    isPremilyMart: false,
    verificationStatus: "PENDING",
    tradeLicenseNo: "TRAD/DHAMRAI/004921/2025",
    nidNumber: "19912612341234123",
    verificationNote: "Pending review of Dhamrai cottage industry certificate.",
    submittedAt: "2026-10-20T14:15:00Z",
    homeDistrict: "Dhaka",
    insideDistrictCost: 70,
    outsideDistrictCost: 150,
    districtOverrides: [],
    subscription: {
      status: "TRIALING",
      planAmount: 150,
      trialEndsAt: "2026-11-20T00:00:00Z",
      currentPeriodEnd: "2026-11-20T00:00:00Z",
    },
    stats: {
      totalProducts: 2,
      totalOrders: 14,
      avgRating: 4.7,
      totalReviews: 18,
      totalSales: 28,
      revenue: 29500,
    },
  },
  {
    id: "store-rfl",
    slug: "rfl-official",
    displayName: "RFL Home Solutions",
    sellerName: "PRAN-RFL Group Partner",
    phone: "01744444444",
    email: "premily.partner@rflbd.com",
    description: "Official PRAN-RFL architectural living and modular Italian kitchen hardware partner store.",
    logoUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    primaryColor: "#BE123C",
    isPremilyMart: true, // Official Brand Partner Mart
    verificationStatus: "VERIFIED",
    tradeLicenseNo: "CORP/RFL/2024/0991",
    nidNumber: "19752690001112223",
    verificationNote: "Official corporate brand partnership agreement on file.",
    submittedAt: "2025-11-01T08:00:00Z",
    homeDistrict: "Dhaka",
    insideDistrictCost: 70,
    outsideDistrictCost: 150,
    districtOverrides: [],
    subscription: {
      status: "ACTIVE",
      planAmount: 150,
      trialEndsAt: "2025-12-01T00:00:00Z",
      currentPeriodEnd: "2027-01-01T00:00:00Z",
    },
    stats: {
      totalProducts: 3,
      totalOrders: 310,
      avgRating: 4.95,
      totalReviews: 480,
      totalSales: 620,
      revenue: 495000,
    },
  },
];

const INITIAL_PRODUCTS: ProductRecord[] = [
  {
    id: "p1",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    name: "Aura Curved Lounge Chair",
    slug: "aura-curved-chair",
    description: "Solid oak construction upholstered in heavy textured boucle fabric. Designed for ergonomic luxury and minimalist living spaces.",
    categoryId: "furniture",
    categoryName: "Furniture",
    price: 18500,
    compareAtPrice: 24000,
    stock: 12,
    sizes: ["Standard", "Large"],
    colors: ["Cream Boucle", "Charcoal Grey", "Olive Green"],
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 4.9,
    reviewCount: 48,
    salesCount: 140,
    isFeatured: true,
  },
  {
    id: "p2",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    name: "Velvet Accent Armchair",
    slug: "velvet-accent-armchair",
    description: "Mid-century modern silhouette with brushed brass legs and high-density memory foam cushioning.",
    categoryId: "furniture",
    categoryName: "Furniture",
    price: 22000,
    compareAtPrice: 28000,
    stock: 8,
    sizes: ["Standard"],
    colors: ["Emerald Green", "Midnight Blue", "Mustard Gold"],
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 4.8,
    reviewCount: 36,
    salesCount: 95,
    isFeatured: true,
  },
  {
    id: "p3",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    name: "Travertine Coffee Table",
    slug: "travertine-coffee-table",
    description: "Sculptural monolith table carved from natural Roman travertine stone with honed matte finish.",
    categoryId: "living",
    categoryName: "Living Room",
    price: 24000,
    compareAtPrice: 32000,
    stock: 5,
    sizes: ["90cm Round", "110cm Oval"],
    colors: ["Warm Beige", "Ivory"],
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 5.0,
    reviewCount: 22,
    salesCount: 42,
    isFeatured: true,
  },
  {
    id: "p4",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    name: "Nordic Minimalist Oak Credenza",
    slug: "nordic-oak-credenza",
    description: "Handcrafted white oak sideboard with sliding slatted tambours and hidden cable routing.",
    categoryId: "furniture",
    categoryName: "Furniture",
    price: 36500,
    compareAtPrice: 42000,
    stock: 4,
    sizes: ["160cm Wide", "190cm Wide"],
    colors: ["Natural White Oak", "Smoked Oak"],
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 4.9,
    reviewCount: 15,
    salesCount: 19,
    isFeatured: false,
  },
  {
    id: "p5",
    storeId: "store-lumina",
    storeSlug: "lumina-decor",
    storeName: "Lumina Lighting Co.",
    name: "Aura Alabaster Brass Pendant",
    slug: "alabaster-brass-pendant",
    description: "Solid Spanish alabaster stone dome with brushed brass chain and dimmable 2700K warm LED bulb.",
    categoryId: "lighting",
    categoryName: "Lighting",
    price: 12500,
    compareAtPrice: 16000,
    stock: 14,
    sizes: ["30cm", "45cm"],
    colors: ["Brushed Brass", "Antique Bronze"],
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 4.8,
    reviewCount: 31,
    salesCount: 52,
    isFeatured: true,
  },
  {
    id: "p6",
    storeId: "store-lumina",
    storeSlug: "lumina-decor",
    storeName: "Lumina Lighting Co.",
    name: "Sculptural Linear Wall Sconce",
    slug: "linear-wall-sconce",
    description: "Minimalist indirect wall sconce producing soft architectural halo illumination.",
    categoryId: "lighting",
    categoryName: "Lighting",
    price: 8900,
    compareAtPrice: 11500,
    stock: 20,
    sizes: ["60cm", "100cm"],
    colors: ["Matte Black", "Muted Gold"],
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 4.7,
    reviewCount: 19,
    salesCount: 40,
    isFeatured: false,
  },
  {
    id: "p7",
    storeId: "store-clay",
    storeSlug: "clay-craft",
    storeName: "Clay & Craft Pottery",
    name: "Artisan Terracotta Vase Trio",
    slug: "terracotta-vase-trio",
    description: "Set of three wheel-thrown textured clay vases finished with porous mineral glaze.",
    categoryId: "decor",
    categoryName: "Decor",
    price: 4500,
    compareAtPrice: 6000,
    stock: 18,
    sizes: ["Trio Set"],
    colors: ["Raw Clay", "Charcoal Terracotta"],
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 4.9,
    reviewCount: 24,
    salesCount: 68,
    isFeatured: true,
  },
  {
    id: "p8",
    storeId: "store-clay",
    storeSlug: "clay-craft",
    storeName: "Clay & Craft Pottery",
    name: "Handmade Ceramic Dining Set",
    slug: "ceramic-dining-set",
    description: "16-piece artisan stoneware dining service with speckled glaze and organic rim profiles.",
    categoryId: "decor",
    categoryName: "Decor",
    price: 9200,
    compareAtPrice: 12500,
    stock: 9,
    sizes: ["16-piece for 4"],
    colors: ["Oatmeal Speckle", "Slate Grey"],
    imageUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 4.7,
    reviewCount: 14,
    salesCount: 22,
    isFeatured: false,
  },
  {
    id: "p9",
    storeId: "store-rfl",
    storeSlug: "rfl-official",
    storeName: "RFL Home Solutions",
    name: "Moderna Modular Kitchen Island",
    slug: "moderna-kitchen-island",
    description: "Engineered high-pressure laminate with quartz worktop and soft-close Austrian Blum drawers.",
    categoryId: "furniture",
    categoryName: "Furniture",
    price: 48000,
    compareAtPrice: 60000,
    stock: 6,
    sizes: ["180cm x 90cm"],
    colors: ["Italian Marble / Walnut", "Pure White / Oak"],
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    status: "ACTIVE",
    avgRating: 5.0,
    reviewCount: 42,
    salesCount: 38,
    isFeatured: true,
  },
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "ord-1",
    orderNumber: "PRM-98214-DHK",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    customerName: "Tahmid Rahman",
    customerPhone: "01723456789",
    shippingAddress: "House 42, Road 11, Block D, Banani",
    shippingDistrict: "Dhaka",
    shippingCity: "Banani, Dhaka",
    items: [
      {
        productId: "p1",
        name: "Aura Curved Lounge Chair",
        variantLabel: "Cream Boucle / Standard",
        price: 18500,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80",
      },
    ],
    subtotal: 18500,
    shippingCost: 70, // Inside Dhaka
    total: 18570,
    paymentMethod: "BKASH",
    paymentStatus: "VERIFIED",
    transactionId: "BK99X82LA4",
    orderStatus: "PROCESSING",
    courierPartner: "Steadfast",
    consignmentId: "ST-882914-BD",
    createdAt: "2026-10-25T14:30:00Z",
    updatedAt: "2026-10-26T10:15:00Z",
  },
  {
    id: "ord-2",
    orderNumber: "PRM-98215-CTG",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    customerName: "Farzana Chowdhury",
    customerPhone: "01834567890",
    shippingAddress: "Flat 4B, Nasirabad Housing Society",
    shippingDistrict: "Chattogram",
    shippingCity: "Panchlaish, Chattogram",
    items: [
      {
        productId: "p2",
        name: "Velvet Accent Armchair",
        variantLabel: "Emerald Green / Standard",
        price: 22000,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=300&q=80",
      },
    ],
    subtotal: 22000,
    shippingCost: 150, // Outside Dhaka
    total: 22150,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "PENDING",
    transactionId: null,
    orderStatus: "SHIPPED",
    courierPartner: "Pathao",
    consignmentId: "PTH-772910-CTG",
    createdAt: "2026-10-24T18:45:00Z",
    updatedAt: "2026-10-26T12:00:00Z",
  },
  {
    id: "ord-3",
    orderNumber: "PRM-98216-SYL",
    storeId: "store-lumina",
    storeSlug: "lumina-decor",
    storeName: "Lumina Lighting Co.",
    customerName: "Mahbub Alam",
    customerPhone: "01945678901",
    shippingAddress: "Holding 18, Shahjalal Uposhohor",
    shippingDistrict: "Sylhet",
    shippingCity: "Sylhet Sadar",
    items: [
      {
        productId: "p5",
        name: "Aura Alabaster Brass Pendant",
        variantLabel: "Brushed Brass / 45cm",
        price: 12500,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80",
      },
    ],
    subtotal: 25000,
    shippingCost: 150,
    total: 25150,
    paymentMethod: "NAGAD",
    paymentStatus: "VERIFIED",
    transactionId: "NG8827419A",
    orderStatus: "DELIVERED",
    courierPartner: "RedX",
    consignmentId: "RDX-339182-SYL",
    createdAt: "2026-10-20T09:15:00Z",
    updatedAt: "2026-10-23T16:00:00Z",
  },
  {
    id: "ord-4",
    orderNumber: "PRM-98217-DHK",
    storeId: "store-aura",
    storeSlug: "aura-home",
    storeName: "Aura Home Studio",
    customerName: "Shabnam Kabir",
    customerPhone: "01756789012",
    shippingAddress: "Apartment 7A, Sector 3, Uttara",
    shippingDistrict: "Dhaka",
    shippingCity: "Uttara, Dhaka",
    items: [
      {
        productId: "p3",
        name: "Travertine Coffee Table",
        variantLabel: "Warm Beige / 90cm Round",
        price: 24000,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=300&q=80",
      },
    ],
    subtotal: 24000,
    shippingCost: 70,
    total: 24070,
    paymentMethod: "BKASH",
    paymentStatus: "PENDING",
    transactionId: "BK7739103X",
    orderStatus: "PENDING",
    createdAt: "2026-10-27T08:20:00Z",
    updatedAt: "2026-10-27T08:20:00Z",
  },
];

const INITIAL_CAMPAIGNS: CampaignRecord[] = [
  {
    id: "camp-1",
    name: "Architectural Living Flash Gala",
    slug: "flash-gala",
    description: "Curated artisan seating, marble tables, and sculptural lighting at up to 40% privilege discount.",
    bannerUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    badgeText: "Flash Sale · 40% Off",
    discountPercent: 40,
    isActive: true,
    endsAt: "2026-11-05T23:59:59Z",
  },
  {
    id: "camp-2",
    name: "Dhaka Artisan Heritage Week",
    slug: "artisan-heritage",
    description: "Celebrating traditional Bangladeshi terracotta and Dhamrai stoneware pottery masters.",
    bannerUrl: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
    badgeText: "Artisan Heritage · Free Delivery",
    discountPercent: 20,
    isActive: true,
    endsAt: "2026-11-15T23:59:59Z",
  },
];

// Helper to access LocalStorage safely
const STORAGE_KEYS = {
  STORES: "premily_stores_data",
  PRODUCTS: "premily_products_data",
  ORDERS: "premily_orders_data",
  CAMPAIGNS: "premily_campaigns_data",
};

export const StoreService = {
  getStores(): StoreRecord[] {
    if (typeof window === "undefined") return INITIAL_STORES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STORES);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES));
      return INITIAL_STORES;
    } catch {
      return INITIAL_STORES;
    }
  },

  getStoreBySlug(slug: string): StoreRecord | undefined {
    const stores = this.getStores();
    return stores.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
  },

  updateStore(updated: Partial<StoreRecord> & { id: string }): StoreRecord {
    const stores = this.getStores();
    const index = stores.findIndex((s) => s.id === updated.id);
    if (index === -1) throw new Error("Store not found");
    const merged = { ...stores[index], ...updated };
    stores[index] = merged;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
      window.dispatchEvent(new Event("premily_data_change"));
    }
    return merged;
  },

  getProducts(): ProductRecord[] {
    if (typeof window === "undefined") return INITIAL_PRODUCTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  getProductsByStore(storeSlug: string): ProductRecord[] {
    const products = this.getProducts();
    return products.filter((p) => p.storeSlug.toLowerCase() === storeSlug.toLowerCase());
  },

  addProduct(newProduct: Omit<ProductRecord, "id" | "salesCount" | "avgRating" | "reviewCount">): ProductRecord {
    const products = this.getProducts();
    const created: ProductRecord = {
      ...newProduct,
      id: `prod_${Date.now().toString(36)}`,
      salesCount: 0,
      avgRating: 5.0,
      reviewCount: 1,
    };
    products.unshift(created);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new Event("premily_data_change"));
    }
    return created;
  },

  updateProduct(productId: string, updates: Partial<ProductRecord>): ProductRecord {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) throw new Error("Product not found");
    const merged = { ...products[index], ...updates };
    products[index] = merged;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new Event("premily_data_change"));
    }
    return merged;
  },

  deleteProduct(productId: string): boolean {
    let products = this.getProducts();
    products = products.filter((p) => p.id !== productId);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new Event("premily_data_change"));
    }
    return true;
  },

  getOrders(): OrderRecord[] {
    if (typeof window === "undefined") return INITIAL_ORDERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  },

  getOrdersByStore(storeSlug: string): OrderRecord[] {
    const orders = this.getOrders();
    return orders.filter((o) => o.storeSlug.toLowerCase() === storeSlug.toLowerCase());
  },

  addOrder(order: Omit<OrderRecord, "id" | "orderNumber" | "createdAt" | "updatedAt">): OrderRecord {
    const orders = this.getOrders();
    const timestamp = Date.now().toString(36).toUpperCase();
    const districtCode = order.shippingDistrict.substring(0, 3).toUpperCase();
    const orderNumber = `PRM-${timestamp}-${districtCode}`;
    const newOrder: OrderRecord = {
      ...order,
      id: `ord_${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new Event("premily_data_change"));
      window.dispatchEvent(new Event("premily_order_created"));
    }
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, courierInfo?: { partner: "Steadfast" | "Pathao" | "RedX" | "Paperfly"; consignmentId: string }): OrderRecord {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error("Order not found");
    orders[index] = {
      ...orders[index],
      orderStatus: status,
      courierPartner: courierInfo ? courierInfo.partner : orders[index].courierPartner,
      consignmentId: courierInfo ? courierInfo.consignmentId : orders[index].consignmentId,
      updatedAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new Event("premily_data_change"));
    }
    return orders[index];
  },

  verifyOrderPayment(orderId: string, status: PaymentStatus = "VERIFIED"): OrderRecord {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error("Order not found");
    orders[index] = {
      ...orders[index],
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new Event("premily_data_change"));
    }
    return orders[index];
  },

  getCampaigns(): CampaignRecord[] {
    if (typeof window === "undefined") return INITIAL_CAMPAIGNS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
      return INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  },

  toggleCampaign(id: string): boolean {
    const campaigns = this.getCampaigns();
    const item = campaigns.find((c) => c.id === id);
    if (item) {
      item.isActive = !item.isActive;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
        window.dispatchEvent(new Event("premily_data_change"));
      }
      return item.isActive;
    }
    return false;
  },

  resetToDefaults(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_CAMPAIGNS));
      window.dispatchEvent(new Event("premily_data_change"));
    }
  },
};
