import { randomBytes } from "node:crypto";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { CheckoutInput, PaymentProofInput } from "./orders.schema.js";

const DEFAULT_INSIDE_DHAKA_FEE = 70;
const DEFAULT_OUTSIDE_DHAKA_FEE = 150;

function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function generateGroupNumber() {
  return `GRP-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

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

type LineWithProduct = {
  variantId: string;
  productId: string;
  quantity: number;
  price: Prisma.Decimal;
  productName: string;
  productSlug: string;
  sku: string;
  variantLabel: string;
  imageUrl: string | null;
  storeId: string;
};

async function createOrderFromItemsTx(
  tx: TxClient,
  userId: string,
  shipping: CheckoutInput,
  lines: OrderLineInput[],
) {
  const storeGroups = new Map<string, LineWithProduct[]>();

  for (const line of lines) {
    const variant = await tx.productVariant.findUniqueOrThrow({
      where: { id: line.variantId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { position: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    if (variant.stock < line.quantity) {
      throw new OutOfStockError(variant.product.name);
    }

    const item: LineWithProduct = {
      variantId: variant.id,
      productId: variant.productId,
      quantity: line.quantity,
      price: variant.price,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      sku: variant.sku,
      variantLabel:
        [variant.size, variant.color].filter(Boolean).join(" / ") || "Standard",
      imageUrl: variant.product.images[0]?.url ?? null,
      storeId: variant.product.storeId,
    };

    const existing = storeGroups.get(item.storeId) ?? [];
    existing.push(item);
    storeGroups.set(item.storeId, existing);
  }

  const destination = (shipping.shippingDistrict || shipping.shippingCity).trim().toLowerCase();

  // Fetch stores involved in this checkout to determine individual shipping rates
  const storeIds = Array.from(storeGroups.keys());
  const stores = await tx.store.findMany({
    where: { id: { in: storeIds } },
    include: { shippingRates: true },
  });

  const storeMap = new Map(stores.map((s) => [s.id, s]));

  // Calculate per-store shipping and subtotal
  const storeOrderData: Array<{
    storeId: string;
    subtotal: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    total: Prisma.Decimal;
    lines: LineWithProduct[];
  }> = [];

  let groupSubtotal = new Prisma.Decimal(0);
  let groupShippingCost = new Prisma.Decimal(0);

  for (const [storeId, storeLines] of storeGroups) {
    let storeSubtotal = new Prisma.Decimal(0);
    for (const item of storeLines) {
      storeSubtotal = storeSubtotal.plus(item.price.times(item.quantity));
    }

    const store = storeMap.get(storeId);
    const homeDistrict = store?.homeDistrict?.trim().toLowerCase() ?? "dhaka";
    const isHome = destination === homeDistrict;

    const districtOverride = store?.shippingRates.find(
      (r) => r.districtName.trim().toLowerCase() === destination,
    );

    let fee = isHome ? DEFAULT_INSIDE_DHAKA_FEE : DEFAULT_OUTSIDE_DHAKA_FEE;
    if (districtOverride) {
      fee = Number(districtOverride.rate);
    } else if (isHome && store?.insideDistrictCost) {
      fee = Number(store.insideDistrictCost);
    } else if (!isHome && store?.outsideDistrictCost) {
      fee = Number(store.outsideDistrictCost);
    }

    const storeShipping = new Prisma.Decimal(fee);
    const storeTotal = storeSubtotal.plus(storeShipping);

    groupSubtotal = groupSubtotal.plus(storeSubtotal);
    groupShippingCost = groupShippingCost.plus(storeShipping);

    storeOrderData.push({
      storeId,
      subtotal: storeSubtotal,
      shippingCost: storeShipping,
      total: storeTotal,
      lines: storeLines,
    });
  }

  const groupTotal = groupSubtotal.plus(groupShippingCost);

  // Create customer checkout OrderGroup
  const orderGroup = await tx.orderGroup.create({
    data: {
      groupNumber: generateGroupNumber(),
      userId,
      subtotal: groupSubtotal,
      shippingCost: groupShippingCost,
      total: groupTotal,
    },
  });

  const createdOrders = [];

  // Create individual store-specific orders
  for (const sData of storeOrderData) {
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        orderGroupId: orderGroup.id,
        storeId: sData.storeId,
        userId,
        status: "PENDING",
        subtotal: sData.subtotal,
        shippingCost: sData.shippingCost,
        total: sData.total,
        shippingName: shipping.shippingName,
        shippingPhone: shipping.shippingPhone,
        shippingAddress: shipping.shippingAddress,
        shippingCity: shipping.shippingCity,
        shippingDistrict: shipping.shippingDistrict,
        items: {
          create: sData.lines.map((line) => {
            const itemData: any = {
              quantity: line.quantity,
              priceAtOrder: line.price,
              productName: line.productName,
              productSlugAtOrder: line.productSlug,
              skuAtOrder: line.sku,
              variantLabel: line.variantLabel,
            };
            if (line.variantId) itemData.variantId = line.variantId;
            if (line.imageUrl) itemData.productImageUrlAtOrder = line.imageUrl;
            return itemData;
          }),
        },
        payments: {
          create: {
            method: shipping.paymentMethod,
            amount: sData.total,
          },
        },
      },
      include: { items: true, payments: true, store: true },
    });

    createdOrders.push(order);
  }

  // Atomic decrement for stock & increment salesCount on products
  for (const line of lines) {
    const updated = await tx.productVariant.updateMany({
      where: {
        id: line.variantId,
        stock: { gte: line.quantity },
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

    const variant = await tx.productVariant.findUnique({
      where: { id: line.variantId },
      select: { productId: true },
    });
    if (variant) {
      await tx.product.update({
        where: { id: variant.productId },
        data: { salesCount: { increment: line.quantity } },
      });
    }
  }

  return createdOrders.length === 1 ? createdOrders[0] : createdOrders;
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
    include: { items: true, payments: true, store: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: true, store: true },
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
    include: { payments: true },
  });

  if (!order || order.userId !== userId) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const payment = order.payments.find(
    (p) => p.method !== "CASH_ON_DELIVERY",
  );

  if (!payment) {
    throw new Error("NOT_MOBILE_PAYMENT");
  }

  if (payment.status === "VERIFIED") {
    throw new Error("ALREADY_VERIFIED");
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      transactionId: proof.transactionId,
      senderNumber: proof.senderNumber,
    },
  });
}

export async function verifyPayment(
  verifier: { userId: string; role: "CUSTOMER" | "SELLER" | "ADMIN" },
  orderId: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true, store: true },
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (verifier.role === "SELLER") {
    if (order.store.sellerId !== verifier.userId) {
      throw new Error("ORDER_NOT_FOUND");
    }
  }

  const payment = order.payments.find(
    (p) => p.method !== "CASH_ON_DELIVERY",
  );

  if (!payment) {
    throw new Error("NOT_MOBILE_PAYMENT");
  }

  if (payment.status === "VERIFIED") {
    throw new Error("ALREADY_VERIFIED");
  }

  if (!payment.transactionId) {
    throw new Error("PROOF_MISSING");
  }

  return prisma.$transaction(async (tx: TxClient) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: verifier.userId,
      },
    });

    return tx.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
      include: { payments: true, items: true },
    });
  });
}
