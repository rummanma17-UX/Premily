import { prisma } from "../../lib/prisma.js";
import type { AddToCartInput } from "./cart.schema.js";

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

async function assertPurchasableVariant(variantId: string, quantity: number) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: {
        include: {
          store: { select: { status: true, isPublished: true } },
        },
      },
    },
  });

  if (
    !variant ||
    !variant.isActive ||
    variant.product.status !== "ACTIVE" ||
    variant.product.store.status !== "ACTIVE" ||
    !variant.product.store.isPublished
  ) {
    throw new Error("PRODUCT_UNAVAILABLE");
  }
  if (variant.stock < quantity) throw new Error("INSUFFICIENT_STOCK");
  return variant;
}

export async function addToCart(userId: string, data: AddToCartInput) {
  const variant = await assertPurchasableVariant(data.variantId, data.quantity);
  const cart = await getOrCreateCart(userId);
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: data.variantId } },
  });
  const nextQuantity = (existing?.quantity ?? 0) + data.quantity;
  if (nextQuantity > variant.stock) throw new Error("INSUFFICIENT_STOCK");

  return prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: data.variantId } },
    update: { quantity: nextQuantity },
    create: { cartId: cart.id, variantId: data.variantId, quantity: data.quantity },
  });
}

export async function getCart(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { orderBy: { position: "asc" }, take: 1 },
                  store: {
                    select: {
                      id: true,
                      slug: true,
                      displayName: true,
                      isPremilyMart: true,
                      status: true,
                      isPublished: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) throw new Error("CART_NOT_FOUND");

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { variant: { include: { product: { include: { store: true } } } } },
  });
  if (!item || item.cartId !== cart.id) throw new Error("ITEM_NOT_FOUND");
  await assertPurchasableVariant(item.variantId, quantity);

  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) throw new Error("CART_NOT_FOUND");

  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, select: { cartId: true } });
  if (!item || item.cartId !== cart.id) throw new Error("ITEM_NOT_FOUND");
  return prisma.cartItem.delete({ where: { id: itemId } });
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
