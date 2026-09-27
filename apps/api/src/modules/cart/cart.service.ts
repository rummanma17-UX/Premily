import { prisma } from "../../lib/prisma.js";
import type { AddToCartInput } from "./cart.schema.js";

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({ data: { userId } });
}

export async function addToCart(userId: string, data: AddToCartInput) {
  const cart = await getOrCreateCart(userId);

  return prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: data.variantId,
      },
    },
    update: {
      quantity: { increment: data.quantity },
    },
    create: {
      cartId: cart.id,
      variantId: data.variantId,
      quantity: data.quantity,
    },
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
              product: true,
            },
          },
        },
      },
    },
  });
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
) {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw new Error("CART_NOT_FOUND");
  }

  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

  if (!item || item.cartId !== cart.id) {
    throw new Error("ITEM_NOT_FOUND");
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    throw new Error("CART_NOT_FOUND");
  }

  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });

  if (!item || item.cartId !== cart.id) {
    throw new Error("ITEM_NOT_FOUND");
  }

  return prisma.cartItem.delete({ where: { id: itemId } });
}
