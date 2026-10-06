export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: string;
  stock: number;
  size: string | null;
  color: string | null;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  sellerId: string;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
};
