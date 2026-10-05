import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/modules/auth/auth.utils.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("SEEDING......");

  const category = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "elctronics" },
  });

  const sellerPassword = await hashPassword("password123");

  const seller = await prisma.user.upsert({
    where: { email: "seller@test.com" },
    update: {},
    create: {
      name: "Test Seller",
      email: "seller@test.com",
      phone: "01712345678",
      password: sellerPassword,
      role: "SELLER",
    },
  });

  await prisma.product.upsert({
    where: { slug: "wireless-mouse" },
    update: {},
    create: {
      name: "Wireless Mouse",
      slug: "wireless-mouse",
      description: "1000hz polling rate wireless mouse",
      categoryId: category.id,
      sellerId: seller.id,
      variants: {
        create: [{ sku: "MOUSE_BLK", price: 1200, stock: 25, color: "Black" }],
      },
      images: {
        create: [
          {
            url: "https://example.com/mouse.jpg",
            altText: "Black wireless mouse",
            position: 0,
          },
        ],
      },
    },
  });

  console.log("SEED COMPLETED");
}

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect);
