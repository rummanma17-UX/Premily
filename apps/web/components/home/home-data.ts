import type { LucideIcon } from "lucide-react";
import {
  Bed,
  Flower2,
  Frame,
  Lamp,
  LayoutGrid,
  Sofa,
  Trees,
  Utensils,
} from "lucide-react";

export type HomeCategory = {
  name: string;
  slug: string;
  icon: LucideIcon;
};

export const homeCategories: HomeCategory[] = [
  { name: "Furniture", slug: "furniture", icon: Sofa },
  { name: "Lighting", slug: "lighting", icon: Lamp },
  { name: "Decor", slug: "decor", icon: Flower2 },
  { name: "Kitchen", slug: "kitchen", icon: Utensils },
  { name: "Bedding", slug: "bedding", icon: Bed },
  { name: "Outdoor", slug: "outdoor", icon: Trees },
  { name: "Rugs", slug: "rugs", icon: LayoutGrid },
  { name: "Wall Art", slug: "wall-art", icon: Frame },
];

export type DemoProduct = {
  id: string;
  slug: string;
  category: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  storeName: string;
  storeSlug: string;
  verified?: boolean;
  isPremilyMart?: boolean;
  rating: string;
  sold: number;
};

// Presentation fixtures matching the supplied homepage demo. Replace with API data
// when promotions, seller verification, ratings, and sales counts are available.
export const demoProducts: DemoProduct[] = [
  {
    id: "chair",
    slug: "aura-curved-lounge-chair",
    category: "Furniture",
    name: "Aura Curved Lounge Chair",
    image: "https://picsum.photos/id/1060/600/400",
    price: 18500,
    oldPrice: 24000,
    storeName: "Aura Home",
    storeSlug: "mart",
    verified: true,
    rating: "4.9",
    sold: 312,
  },
  {
    id: "sconce",
    slug: "brass-wall-sconce",
    category: "Lighting",
    name: "Brass Wall Sconce",
    image: "https://picsum.photos/id/1070/600/400",
    price: 4200,
    oldPrice: 5500,
    storeName: "Lume House",
    storeSlug: "lume-house",
    verified: true,
    rating: "4.8",
    sold: 540,
  },
  {
    id: "vessel",
    slug: "sculptural-gold-vessel",
    category: "Decor",
    name: "Sculptural Gold Vessel",
    image: "https://picsum.photos/id/1080/600/400",
    price: 2900,
    oldPrice: 3800,
    storeName: "Aura Home",
    storeSlug: "mart",
    verified: true,
    rating: "4.7",
    sold: 760,
  },
  {
    id: "table",
    slug: "travertine-minimal-table",
    category: "Furniture",
    name: "Travertine Minimal Table",
    image: "https://picsum.photos/id/1062/600/400",
    price: 24000,
    oldPrice: 30000,
    storeName: "Casa Living",
    storeSlug: "casa-living",
    rating: "5.0",
    sold: 98,
  },
  {
    id: "pendant",
    slug: "fluted-brass-pendant",
    category: "Lighting",
    name: "Fluted Brass Pendant",
    image: "https://picsum.photos/id/1072/600/400",
    price: 6800,
    oldPrice: 8900,
    storeName: "Lume House",
    storeSlug: "lume-house",
    verified: true,
    rating: "4.9",
    sold: 221,
  },
  {
    id: "sideboard",
    slug: "walnut-sideboard",
    category: "Furniture",
    name: "Walnut Sideboard",
    image: "https://picsum.photos/id/1069/600/400",
    price: 32000,
    oldPrice: 41000,
    storeName: "Casa Living",
    storeSlug: "casa-living",
    verified: true,
    rating: "4.9",
    sold: 64,
  },
  {
    id: "linen",
    slug: "linen-bedding-set",
    category: "Bedding",
    name: "Linen Bedding Set",
    image: "https://picsum.photos/id/1025/600/400",
    price: 5600,
    oldPrice: 7200,
    storeName: "Soft Space",
    storeSlug: "soft-space",
    rating: "4.6",
    sold: 430,
  },
  {
    id: "rug",
    slug: "handwoven-jute-rug",
    category: "Rugs",
    name: "Handwoven Jute Rug",
    image: "https://picsum.photos/id/1040/600/400",
    price: 7800,
    oldPrice: 9500,
    storeName: "Aura Home",
    storeSlug: "mart",
    verified: true,
    rating: "4.8",
    sold: 187,
  },
  {
    id: "chair-outdoor",
    slug: "teak-outdoor-chair",
    category: "Outdoor",
    name: "Teak Outdoor Chair",
    image: "https://picsum.photos/id/1050/600/400",
    price: 9900,
    oldPrice: 12500,
    storeName: "Green Nest",
    storeSlug: "green-nest",
    verified: true,
    rating: "4.7",
    sold: 143,
  },
  {
    id: "dinnerware",
    slug: "ceramic-dinner-set",
    category: "Kitchen",
    name: "Ceramic Dinner Set",
    image: "https://picsum.photos/id/1060/600/400",
    price: 3400,
    oldPrice: 4600,
    storeName: "Table Stories",
    storeSlug: "table-stories",
    rating: "4.8",
    sold: 610,
  },
];


