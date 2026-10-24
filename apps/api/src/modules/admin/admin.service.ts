import { prisma } from "../../lib/prisma.js";
import type {
  AdminOrderQuery,
  AdminOrderStatusInput,
  AdminProductQuery,
} from "./admin.schema.js";

export async function getAdminDashboard() {
  const [
    totalUsers,
    customers,
    sellers,
    admins,
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    revenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "SELLER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.aggregate({
      where: {
        payments: {
          some: { status: "VERIFIED" },
        },
      },
      _sum: { total: true },
    }),
  ]);

  return {
    users: { total: totalUsers, customers, sellers, admins },
    products: { total: totalProducts },
    categories: { total: totalCategories },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    revenue: revenue._sum.total?.toString() ?? "0",
  };
}

export async function getAdminProducts({ page, limit, q }: AdminProductQuery) {
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
          {
            category: {
              is: {
                name: { contains: q, mode: "insensitive" as const },
              },
            },
          },
          {
            store: {
              is: {
                displayName: { contains: q, mode: "insensitive" as const },
              },
            },
          },
          {
            store: {
              is: {
                seller: {
                  is: {
                    name: { contains: q, mode: "insensitive" as const },
                  },
                },
              },
            },
          },
          {
            store: {
              is: {
                seller: {
                  is: {
                    email: { contains: q, mode: "insensitive" as const },
                  },
                },
              },
            },
          },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        category: true,
        store: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        images: {
          orderBy: { position: "asc" },
        },
        variants: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        price: variant.price.toString(),
      })),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminOrders({ page, limit, status }: AdminOrderQuery) {
  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        store: {
          select: {
            id: true,
            slug: true,
            displayName: true,
          },
        },
        payments: true,
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateAdminOrderStatus(
  orderId: string,
  adminId: string,
  input: AdminOrderStatusInput,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        items: true,
      },
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const target = input.status;
    const isCOD = order.payments.some(
      (payment) => payment.method === "CASH_ON_DELIVERY",
    );
    const hasVerifiedPayment = order.payments.some(
      (payment) => payment.status === "VERIFIED",
    );

    const allowed =
      (order.status === "PENDING" &&
        target === "CANCELLED") ||
      (order.status === "PENDING" &&
        target === "CONFIRMED" &&
        (isCOD || hasVerifiedPayment)) ||
      (order.status === "CONFIRMED" &&
        target === "PROCESSING") ||
      (order.status === "PROCESSING" &&
        target === "SHIPPED") ||
      (order.status === "SHIPPED" &&
        target === "DELIVERED") ||
      (order.status === "DELIVERED" &&
        target === "RETURNED");

    if (!allowed) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const changed = await tx.order.updateMany({
      where: {
        id: orderId,
        status: order.status,
      },
      data: { status: target },
    });

    if (changed.count !== 1) {
      throw new Error("ORDER_STATUS_CONFLICT");
    }

    if (target === "CANCELLED") {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    if (target === "DELIVERED" && isCOD) {
      const codPayment = order.payments.find(
        (payment) => payment.method === "CASH_ON_DELIVERY",
      );

      if (!codPayment) {
        throw new Error("PAYMENT_NOT_FOUND");
      }

      await tx.payment.update({
        where: { id: codPayment.id },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: adminId,
        },
      });
    }

    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        store: {
          select: {
            id: true,
            slug: true,
            displayName: true,
          },
        },
        payments: true,
        items: true,
      },
    });
  });
}
