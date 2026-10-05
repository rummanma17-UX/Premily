import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/modules/auth/auth.utils";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding...");

  // USERS ========

  const admin = await prisma.user.upsert({
    where: { email: "admin@premily.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@premily.local",
      phone: "01711111111",
      password: await hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@premily.local" },
    update: {},
    create: {
      name: "Seller",
      email: "seller@premily.local",
      phone: "01722222222",
      password: await hashPassword("seller123"),
      role: "SELLER",
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "customer1@premily.local" },
    update: {},
    create: {
      name: "Customer One",
      email: "customer1@premily.local",
      phone: "01611111111",
      password: await hashPassword("customer123"),
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "customer2@premily.local" },
    update: {},
    create: {
      name: "Customer Two",
      email: "customer2@premily.local",
      phone: "01622222222",
      password: await hashPassword("customer123"),
      role: "CUSTOMER",
    },
  });

  // CATEGORIES ========

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: "fashion" },
    update: {},
    create: {
      name: "Fashion",
      slug: "fashion",
    },
  });

  const home = await prisma.category.upsert({
    where: { slug: "home-living" },
    update: {},
    create: {
      name: "Home & Living",
      slug: "home-living",
    },
  });

  // PRODUCT ==========

  const mouse = await prisma.product.upsert({
    where: { slug: "wireless-mouse" },
    update: {},
    create: {
      name: "Wireless mouse",
      slug: "wireless-mouse",
      description: "ONIKUMA CW929 wireless mouse",
      categoryId: electronics.id,
      sellerId: seller.id,

      variants: {
        create: [
          {
            sku: "MOUSE-BLK",
            price: 1200,
            stock: 25,
            color: "Black",
          },
          {
            sku: "MOUSE-WHT",
            price: 1250,
            stock: 15,
            color: "White",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://example.com/mouse.jpg",
            altText: "Wireless mouse",
            position: 0,
          },
        ],
      },
    },

    include: { variants: true },
  });

  const keyboard = await prisma.product.upsert({
    where: { slug: "mechanical-keyboard" },
    update: {},
    create: {
      name: "Mechanical Keyboard",
      slug: "mechanical-keyboard",
      description: "A Tri mode mechancal keyboard",
      categoryId: electronics.id,
      sellerId: seller.id,

      variants: {
        create: [
          {
            sku: "KEYBOARD-BLK",
            price: 3500,
            stock: 10,
            color: "Black",
          },
          {
            sku: "KEYBOARD-WHT",
            price: 3700,
            stock: 8,
            color: "White",
          },
        ],
      },

      images: {
        create: [
          {
            url: "https://example.com/keyboard.jpg",
            altText: "Mechanical Keyboard",
            position: 0,
          },
        ],
      },
    },

    include: { variants: true },
  });

  const tshirt = await prisma.product.upsert({
    where: { slug: "cotton-tshirt" },
    update: {},
    create: {
      name: "Cotton T-Shirt",
      slug: "cotton-tshirt",
      description: "Comfortable cotton t-shirt.",
      categoryId: fashion.id,
      sellerId: seller.id,

      variants: {
        create: [
          {
            sku: "TSHIRT-M-BLK",
            price: 900,
            stock: 30,
            size: "M",
            color: "Black",
          },
          {
            sku: "TSHIRT-L-BLK",
            price: 900,
            stock: 20,
            size: "L",
            color: "Black",
          },
        ],
      },

      images: {
        create: [
          {
            url: "https://example.com/tshirt.jpg",
            altText: "Black cotton t-shirt",
            position: 0,
          },
        ],
      },
    },

    include: {
      variants: true,
    },
  });

  // CARTS =========

  await prisma.cart.upsert({
    where: { userId: customer1.id },
    update: {},
    create: {
      userId: customer1.id,
      items: {
        create: [
          {
            variantId: mouse.variants[0].id,
            quantity: 2,
          },
          {
            variantId: tshirt.variants[0].id,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.cart.upsert({
    where: { userId: customer2.id },
    update: {},
    create: {
      userId: customer2.id,
      items: {
        create: [
          {
            variantId: keyboard.variants[0].id,
            quantity: 1,
          },
        ],
      },
    },
  });

  // ORDERS

  const order1 = await prisma.order.upsert({
    where: { id: "seed-order-1" },
    update: {},
    create: {
      id: "seed-order-1",
      userId: customer1.id,

      status: "PAID",

      subtotal: 2400,
      shippingCost: 150,
      total: 2550,

      shippingName: "Customer one",
      shippingPhone: customer1.phone,
      shippingAddress: "123 main street",
      shippingCity: "Dhaka",

      items: {
        create: [
          {
            variantId: mouse.variants[0].id,
            quantity: 2,
            priceAtOrder: 1200,
            productName: mouse.name,
            variantLabel: "Black",
          },
        ],
      },
      payment: {
        create: {
          method: "BKASH",
          status: "VERIFIED",
          amount: 2500,
          transactionId: "TXN-SEED-001",
          senderNumber: "01700000000",
          verifiedAt: new Date(),
          verifiedBy: admin.id,
        },
      },
    },
  });

  await prisma.order.upsert({
    where: { id: "seed-order-2" },
    update: {},
    create: {
      id: "seed-order-2",
      userId: customer2.id,

      status: "PENDING",

      subtotal: 3500,
      shippingCost: 100,
      total: 3600,

      shippingName: "Customer Two",
      shippingPhone: "01622222222",
      shippingAddress: "456 Second Street",
      shippingCity: "Dhaka",

      items: {
        create: [
          {
            variantId: keyboard.variants[0].id,
            quantity: 1,
            priceAtOrder: 3500,
            productName: keyboard.name,
            variantLabel: "Black",
          },
        ],
      },

      payment: {
        create: {
          method: "NAGAD",
          status: "PENDING",
          amount: 3600,
          senderNumber: "01800000000",
        },
      },
    },
  });

  console.log("SEEDING COMPLETED!");
  console.log({
    admin: admin.email,
    seller: seller.email,
    customers: [customer1.email, customer2.email],
    products: 3,
    orders: 2,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
