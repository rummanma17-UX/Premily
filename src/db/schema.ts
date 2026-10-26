import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ==========================================
// 1. Users Table (Customer, Seller, Admin)
// ==========================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  phone: text("phone"),
  email: text("email"),
  name: text("name").notNull(),
  role: text("role").notNull().default("CUSTOMER"), // CUSTOMER, SELLER, ADMIN
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  store: one(stores, {
    fields: [users.id],
    references: [stores.userId],
  }),
  orders: many(orders),
}));

// ==========================================
// 2. Stores Table (Independent Boutiques & Mart Partners)
// ==========================================
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  primaryColor: text("primary_color").default("#B8924B"),
  isPremilyMart: boolean("is_premily_mart").default(false).notNull(), // Admin only
  verificationStatus: text("verification_status").default("UNVERIFIED").notNull(), // UNVERIFIED, PENDING, VERIFIED, REJECTED
  homeDistrict: text("home_district").default("Dhaka").notNull(),
  insideDistrictCost: integer("inside_district_cost").default(70).notNull(),
  outsideDistrictCost: integer("outside_district_cost").default(150).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.userId],
    references: [users.id],
  }),
  products: many(products),
}));

// ==========================================
// 3. Categories Table
// ==========================================
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ==========================================
// 4. Products Table
// ==========================================
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id")
    .references(() => stores.id)
    .notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
}));

// ==========================================
// 5. Product Variants Table
// ==========================================
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  sku: text("sku").notNull(),
  price: integer("price").notNull(), // in Bangladeshi Taka
  compareAtPrice: integer("compare_at_price"),
  stock: integer("stock").notNull().default(0),
  size: text("size"),
  color: text("color"),
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

// ==========================================
// 6. Product Images Table
// ==========================================
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  position: integer("position").default(0).notNull(),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// ==========================================
// 7. Orders Table
// ==========================================
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  shippingName: text("shipping_name").notNull(),
  shippingPhone: text("shipping_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingDistrict: text("shipping_district").notNull(),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull(),
  total: integer("total").notNull(),
  status: text("status").default("PENDING").notNull(),
  paymentMethod: text("payment_method").notNull(), // CASH_ON_DELIVERY, BKASH, NAGAD
  paymentStatus: text("payment_status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// ==========================================
// 8. Order Items Table
// ==========================================
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  storeId: integer("store_id")
    .references(() => stores.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  variantId: integer("variant_id")
    .references(() => productVariants.id)
    .notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  store: one(stores, {
    fields: [orderItems.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));
