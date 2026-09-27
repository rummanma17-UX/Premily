import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { CheckoutInput } from "./orders.schema.js";

const FLAT_SHIPPING_COST = 150;

export class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`Bad luck! ${productName} just went out of stock.`);
    this.name = "OutOfStockError";
  }
}

type OrderLineInput = {
  variantId: string;
  quantity: number;
};

type TxClient = Prisma.TransactionClient;

async function createOrderFromItemsTx(
  tx: TxClient,
  userId: string,
  shipping: CheckoutInput,
  lines: OrderLineInput[],
) {
  let subtotal = new Prisma.Decimal(0);
  const snapshots: Array<{
    variantId: string;
    quantity: number;
    priceAtOrder: Prisma.Decimal;
    productName: string;
    variantLabel: string;
  }> = [];

  for (const line of lines) {
    const variant = await tx.productVariant.findUniqueOrThrow({
      where: { id: line.variantId },
      include: { product: true },
    });

    if (variant.stock < line.quantity) {
      throw new OutOfStockError(variant.product.name);
    }

    subtotal = subtotal.plus(variant.price.times(line.quantity));

    snapshots.push({
      variantId: variant.id,
      quantity: line.quantity,
      priceAtOrder: variant.price,
      productName: variant.product.name,
      variantLabel:
        [variant.size, variant.color].filter(Boolean).join(" / ") || "Standard",
    });
  }

  const total = subtotal.plus(FLAT_SHIPPING_COST);

  const order = await tx.order.create({
    data: {
      userId,
      subtotal,
      shippingCost: FLAT_SHIPPING_COST,
      shippingName: shipping.shippingName,
      shippingPhone: shipping.shippingPhone,
      shippingAddress: shipping.shippingAddress,
      shippingCity: shipping.shippingCity,
      total,
      items: { create: snapshots },
    },
    include: { items: true },
  });

  for (const line of lines) {
    await tx.productVariant.update({
      where: { id: line.variantId },
      data: { stock: { decrement: line.quantity } },
    });
  }
  return order;
}

export async function checkoutFromCart(
  userId: string,
  shipping: CheckoutInput,
) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("CART_EMPTY");
  }

  const lines: OrderLineInput[] = cart.items.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));

  return prisma.$transaction(async (tx) => {
    const order = await createOrderFromItemsTx(tx, userId, shipping, lines);
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });
}

export async function buyNow(
  userId: string,
  shipping: CheckoutInput,
  variantId: string,
  quantity: number,
) {
  return prisma.$transaction(async (tx) => {
    return createOrderFromItemsTx(tx, userId, shipping, [
      { variantId, quantity },
    ]);
  });
}

export async function getMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== order.userId) {
    return null;
  }

  return order;
}
