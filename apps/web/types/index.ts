export type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  size: string | null;
  color: string | null;
  isActive?: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  position: number;
};

export type StoreSummary = {
  id: string;
  slug: string;
  displayName: string;
  isPremilyMart: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  homeDistrict?: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  store: StoreSummary;
  avgRating?: string | number;
  reviewCount?: number;
  salesCount?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  reviews?: Review[];
};

export type Store = {
  id: string;
  slug: string;
  displayName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  isPremilyMart: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt?: string | null;
  homeDistrict?: string | null;
  insideDistrictCost?: string | number | null;
  outsideDistrictCost?: string | number | null;
  stats?: {
    totalProducts: number;
    totalOrders: number;
    avgRating: number;
    totalReviews: number;
    totalSales: number;
  };
};

export type Review = {
  id: string;
  productId: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  sellerReply?: string | null;
  sellerRepliedAt?: string | null;
  createdAt: string;
  user: {
    name: string;
  };
};

export type Campaign = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  bannerUrl?: string | null;
  badgeText?: string | null;
  type: "FLASH_SALE" | "FESTIVAL" | "SEASONAL" | "CLEARANCE";
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  items: Array<{
    id: string;
    salePrice: string | number;
    stockLimit?: number | null;
    soldCount: number;
    product: Product;
  }>;
};

export type DistrictShippingInfo = {
  districtName: string;
  division: string;
  zone: "INSIDE_DHAKA" | "DHAKA_SUBURB" | "OUTSIDE_DHAKA";
  baseCost: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};
