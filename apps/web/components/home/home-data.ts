import type { LucideIcon } from "lucide-react";
import { Bed, Flower2, Frame, Lamp, LayoutGrid, Sofa, Trees, Utensils } from "lucide-react";
export type HomeCategory = { name: string; slug: string; icon: LucideIcon };
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