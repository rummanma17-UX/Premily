import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { CheckoutInput, PaymentProofInput } from "./orders.schema.js";

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
      total,
      shippingName: shipping.shippingName,
      shippingPhone: shipping.shippingPhone,
      shippingAddress: shipping.shippingAddress,
      shippingCity: shipping.shippingCity,
      items: { create: snapshots },
      payment: {
        create: {
          method: shipping.paymentMethod,
          amount: total,
        },
      },
    },
    include: { items: true, payment: true },
  });

  for (const line of lines) {
    // Atomic decrement with safety check to prevent race condition oversells
    const updated = await tx.productVariant.updateMany({
      where: { 
        id: line.variantId,
        stock: { gte: line.quantity } 
      },
      data: { stock: { decrement: line.quantity } },
    });

    if (updated.count === 0) {
      const variant = await tx.productVariant.findUnique({
        where: { id: line.variantId },
        include: { product: true },
      });
      throw new OutOfStockError(variant?.product.name ?? "Product");
    }
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

  return prisma.$transaction(async (tx: TxClient) => {
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
  return prisma.$transaction(async (tx: TxClient) => {
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

  if (!order || order.userId !== userId) {
    return null;
  }

  return order;
}

export async function submitPaymentProof(
  userId: string,
  orderId: string,
  proof: PaymentProofInput,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || order.userId !== userId) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (!order.payment || order.payment.method === "CASH_ON_DELIVERY") {
    throw new Error("NOT_MOBILE_PAYMENT");
  }

  if (order.payment.status === "VERIFIED") {
    throw new Error("ALREADY_VERIFIED");
  }

  return prisma.payment.update({
    where: { orderId },
    data: {
      transactionId: proof.transactionId,
      senderNumber: proof.senderNumber,
    },
  });
}

export async function verifyPayment(verifierId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order || !order.payment) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return prisma.$transaction(async (tx: TxClient) => {
    await tx.payment.update({
      where: { orderId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: verifierId,
      },
    });

    return tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include: { payment: true, items: true },
    });
  });
}