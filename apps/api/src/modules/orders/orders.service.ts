import { randomBytes } from "node:crypto";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { CheckoutInput, PaymentProofInput } from "./orders.schema.js";

const DEFAULT_INSIDE_DHAKA_FEE = 70;
const DEFAULT_OUTSIDE_DHAKA_FEE = 150;
function generateOrderNumber() { return `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`; }
function generateGroupNumber() { return `GRP-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`; }

export class OutOfStockError extends Error {
  constructor(public productName: string) { super(`Bad luck! ${productName} just went out of stock.`); this.name = "OutOfStockError"; }
}
type OrderLineInput = { variantId: string; quantity: number };
type TxClient = Prisma.TransactionClient;
type LineWithProduct = {
  variantId: string; productId: string; quantity: number; price: Prisma.Decimal;
  productName: string; productSlug: string; sku: string; variantLabel: string;
  imageUrl: string | null; storeId: string;
};

async function createOrderFromItemsTx(tx: TxClient, userId: string, shipping: CheckoutInput, lines: OrderLineInput[]) {
  const storeGroups = new Map<string, LineWithProduct[]>();
  for (const line of lines) {
    const variant = await tx.productVariant.findUnique({
      where: { id: line.variantId },
      include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 }, store: true } } },
    });
    if (!variant || !variant.isActive || variant.product.status !== "ACTIVE" ||
      variant.product.store.status !== "ACTIVE" || !variant.product.store.isPublished) {
      throw new Error("PRODUCT_UNAVAILABLE");
    }
    if (variant.stock < line.quantity) throw new OutOfStockError(variant.product.name);
    const item: LineWithProduct = {
      variantId: variant.id, productId: variant.productId, quantity: line.quantity,
      price: variant.price, productName: variant.product.name, productSlug: variant.product.slug,
      sku: variant.sku, variantLabel: [variant.size, variant.color].filter(Boolean).join(" / ") || "Standard",
      imageUrl: variant.product.images[0]?.url ?? null, storeId: variant.product.storeId,
    };
    const group = storeGroups.get(item.storeId) ?? [];
    group.push(item);
    storeGroups.set(item.storeId, group);
  }

  const destination = shipping.shippingDistrict.trim().toLocaleLowerCase();
  const storeIds = [...storeGroups.keys()];
  const stores = await tx.store.findMany({ where: { id: { in: storeIds } } });
  const storeMap = new Map(stores.map((store) => [store.id, store]));
  const storeOrderData: Array<{ storeId: string; subtotal: Prisma.Decimal; shippingCost: Prisma.Decimal; total: Prisma.Decimal; lines: LineWithProduct[] }> = [];
  let groupSubtotal = new Prisma.Decimal(0);
  let groupShippingCost = new Prisma.Decimal(0);

  for (const [storeId, storeLines] of storeGroups) {
    const subtotal = storeLines.reduce((sum, line) => sum.plus(line.price.times(line.quantity)), new Prisma.Decimal(0));
    const store = storeMap.get(storeId);
    const homeDistrict = store?.homeDistrict?.trim().toLocaleLowerCase() ?? "dhaka";
    const isHome = destination === homeDistrict;
    const configuredRate = isHome ? store?.insideDistrictCost : store?.outsideDistrictCost;
    const fee = configuredRate == null ? (isHome ? DEFAULT_INSIDE_DHAKA_FEE : DEFAULT_OUTSIDE_DHAKA_FEE) : Number(configuredRate);
    const shippingCost = new Prisma.Decimal(fee);
    storeOrderData.push({ storeId, subtotal, shippingCost, total: subtotal.plus(shippingCost), lines: storeLines });
    groupSubtotal = groupSubtotal.plus(subtotal);
    groupShippingCost = groupShippingCost.plus(shippingCost);
  }

  const orderGroup = await tx.orderGroup.create({ data: {
    groupNumber: generateGroupNumber(), userId, subtotal: groupSubtotal,
    shippingCost: groupShippingCost, total: groupSubtotal.plus(groupShippingCost),
  } });
  const createdOrders = [];
  for (const storeData of storeOrderData) {
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(), orderGroupId: orderGroup.id,
        storeId: storeData.storeId, userId, status: "PENDING",
        subtotal: storeData.subtotal, shippingCost: storeData.shippingCost, total: storeData.total,
        shippingName: shipping.shippingName, shippingPhone: shipping.shippingPhone,
        shippingAddress: shipping.shippingAddress, shippingCity: shipping.shippingCity,
        shippingDistrict: shipping.shippingDistrict,
        items: { create: storeData.lines.map((line) => ({
          quantity: line.quantity, priceAtOrder: line.price, productName: line.productName,
          productSlugAtOrder: line.productSlug, skuAtOrder: line.sku, variantLabel: line.variantLabel,
          variantId: line.variantId, ...(line.imageUrl ? { productImageUrlAtOrder: line.imageUrl } : {}),
        })) },
        payments: { create: { method: shipping.paymentMethod, amount: storeData.total } },
      },
      include: { items: true, payments: true, store: true },
    });
    createdOrders.push(order);
  }

  for (const line of lines) {
    const changed = await tx.productVariant.updateMany({
      where: { id: line.variantId, isActive: true, stock: { gte: line.quantity } },
      data: { stock: { decrement: line.quantity } },
    });
    if (changed.count !== 1) throw new OutOfStockError("Product");
    await tx.product.update({ where: { id: line.productId }, data: { salesCount: { increment: line.quantity } } });
  }
  return createdOrders.length === 1 ? createdOrders[0] : createdOrders;
}

export async function checkoutFromCart(userId: string, shipping: CheckoutInput) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!cart || cart.items.length === 0) throw new Error("CART_EMPTY");
    const order = await createOrderFromItemsTx(tx, userId, shipping, cart.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })));
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });
}
export async function buyNow(userId: string, shipping: CheckoutInput, variantId: string, quantity: number) {
  return prisma.$transaction((tx) => createOrderFromItemsTx(tx, userId, shipping, [{ variantId, quantity }]));
}
export async function getMyOrders(userId: string) {
  return prisma.order.findMany({ where: { userId }, include: { items: true, payments: true, store: true }, orderBy: { createdAt: "desc" } });
}
export async function getSellerOrders(sellerId: string) {
  return prisma.order.findMany({
    where: { store: { sellerId } },
    include: { items: true, payments: true, store: true, user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
}
export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payments: true, store: true } });
  return order?.userId === userId ? order : null;
}
export async function submitPaymentProof(userId: string, orderId: string, proof: PaymentProofInput) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id: orderId, userId }, include: { payments: true } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    const payment = order.payments.find((entry) => entry.method !== "CASH_ON_DELIVERY");
    if (!payment) throw new Error("NOT_MOBILE_PAYMENT");
    if (payment.status === "VERIFIED") throw new Error("ALREADY_VERIFIED");
    if (payment.transactionId) throw new Error("PROOF_ALREADY_SUBMITTED");
    return tx.payment.update({ where: { id: payment.id }, data: { transactionId: proof.transactionId, senderNumber: proof.senderNumber } });
  });
}
export async function verifyPayment(verifier: { userId: string; role: "CUSTOMER" | "SELLER" | "ADMIN" }, orderId: string) {
  if (verifier.role !== "ADMIN") throw new Error("FORBIDDEN");
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { payments: true } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    const payment = order.payments.find((entry) => entry.method !== "CASH_ON_DELIVERY");
    if (!payment) throw new Error("NOT_MOBILE_PAYMENT");
    if (payment.status === "VERIFIED") throw new Error("ALREADY_VERIFIED");
    if (!payment.transactionId) throw new Error("PROOF_MISSING");
    await tx.payment.update({ where: { id: payment.id }, data: { status: "VERIFIED", verifiedAt: new Date(), verifiedBy: verifier.userId } });
    return tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" }, include: { payments: true, items: true } });
  });
}

export async function updateSellerOrderStatus(sellerId: string, orderId: string, status: "PROCESSING" | "SHIPPED" | "DELIVERED") {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id: orderId, store: { sellerId } }, include: { payments: true, items: true } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    const transitions: Record<string, string> = { CONFIRMED: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED" };
    if (transitions[order.status] !== status) throw new Error("INVALID_STATUS_TRANSITION");
    const result = await tx.order.updateMany({ where: { id: orderId, status: order.status }, data: { status } });
    if (result.count !== 1) throw new Error("ORDER_STATUS_CONFLICT");
    if (status === "DELIVERED") {
      const codPayment = order.payments.find((payment) => payment.method === "CASH_ON_DELIVERY");
      if (codPayment) await tx.payment.update({ where: { id: codPayment.id }, data: { status: "VERIFIED", verifiedAt: new Date() } });
    }
    return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true, payments: true, store: true } });
  });
}
