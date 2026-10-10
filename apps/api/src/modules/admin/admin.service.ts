import { prisma } from "../../lib/prisma.js";
import type { adminProductQuery } from "./admin.schema.js";

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
    paidOrders,
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
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
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
      paid: paidOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    revenue: revenue._sum.total?.toString() ?? "0",
  };
}

export async function getAdminProducts({ page, limit, q }: adminProductQuery) {
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
          {
            category: {
              is: {
                name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
          },
          {
            seller: {
              is: {
                name: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
          },
          {
            seller: {
              is: {
                email: {
                  contains: q,
                  mode: "insensitive" as const,
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
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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
      totalpPges: Math.ceil(total / limit),
    },
  };
}
