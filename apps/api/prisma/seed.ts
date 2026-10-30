import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://premily:premily_dev_password@localhost:15432/premily_db?schema=public";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function safeHash(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

// 64 Bangladesh Districts Categorized into 8 Divisions
const BANGLADESH_64_DISTRICTS = [
  // Dhaka Division (13 districts)
  { name: "Dhaka", division: "Dhaka", zone: "INSIDE_DHAKA" as const, cost: 70, minDays: 1, maxDays: 2 },
  { name: "Gazipur", division: "Dhaka", zone: "DHAKA_SUBURB" as const, cost: 100, minDays: 2, maxDays: 3 },
  { name: "Narayanganj", division: "Dhaka", zone: "DHAKA_SUBURB" as const, cost: 100, minDays: 2, maxDays: 3 },
  { name: "Faridpur", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Gopalganj", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Kishoreganj", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Madaripur", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Manikganj", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Munshiganj", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Narsingdi", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Rajbari", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Shariatpur", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Tangail", division: "Dhaka", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },

  // Chattogram Division (11 districts)
  { name: "Chattogram", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Bandarban", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Brahmanbaria", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Chandpur", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Cox's Bazar", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Cumilla", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Feni", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Khagrachhari", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Lakshmipur", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Noakhali", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Rangamati", division: "Chattogram", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },

  // Sylhet Division (4 districts)
  { name: "Sylhet", division: "Sylhet", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Habiganj", division: "Sylhet", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Moulvibazar", division: "Sylhet", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Sunamganj", division: "Sylhet", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },

  // Rajshahi Division (8 districts)
  { name: "Rajshahi", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Bogura", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Chapainawabganj", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Joypurhat", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Naogaon", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Natore", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Pabna", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Sirajganj", division: "Rajshahi", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },

  // Khulna Division (10 districts)
  { name: "Khulna", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Bagerhat", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Chuadanga", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Jashore", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Jhenaidah", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Kushtia", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Magura", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Meherpur", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Narail", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Satkhira", division: "Khulna", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },

  // Barishal Division (6 districts)
  { name: "Barishal", division: "Barishal", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Barguna", division: "Barishal", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Bhola", division: "Barishal", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Jhalokathi", division: "Barishal", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Patuakhali", division: "Barishal", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Pirojpur", division: "Barishal", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },

  // Rangpur Division (8 districts)
  { name: "Rangpur", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Dinajpur", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Gaibandha", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Kurigram", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Lalmonirhat", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Nilphamari", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Panchagarh", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Thakurgaon", division: "Rangpur", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },

  // Mymensingh Division (4 districts)
  { name: "Mymensingh", division: "Mymensingh", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Jamalpur", division: "Mymensingh", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Netrokona", division: "Mymensingh", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
  { name: "Sherpur", division: "Mymensingh", zone: "OUTSIDE_DHAKA" as const, cost: 150, minDays: 3, maxDays: 5 },
];

async function main() {
  console.log("🌱 Starting complete PREMILY database seeding...");

  // Seeding is additive and non-destructive: never clear or overwrite existing marketplace data.
  console.log("🔒 Non-destructive mode: existing users, orders, payments, products, and settings are preserved.");

  // 2. SEED ALL 64 BANGLADESH DISTRICTS
  console.log("🚚 Seeding all 64 Bangladesh districts with nationwide logistics rates...");
  for (const d of BANGLADESH_64_DISTRICTS) {
    await prisma.districtShipping.upsert({
      where: { districtName: d.name },
      update: {
        division: d.division,
        zone: d.zone,
        baseCost: d.cost,
        estimatedDaysMin: d.minDays,
        estimatedDaysMax: d.maxDays,
        isActive: true,
      },
      create: {
        districtName: d.name,
        division: d.division,
        zone: d.zone,
        baseCost: d.cost,
        estimatedDaysMin: d.minDays,
        estimatedDaysMax: d.maxDays,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${BANGLADESH_64_DISTRICTS.length} Bangladesh districts.`);

  // 3. SEED USERS & AUTHENTICATION (Phone-First, argon2 passwords)
  console.log("👤 Seeding administrators, sellers, and customers...");
  const adminPasswordHash = await safeHash("admin123");
  const sellerPasswordHash = await safeHash("seller123");
  const customerPasswordHash = await safeHash("customer123");

  // Admin User
  const admin = await prisma.user.upsert({
    where: { phone: "01700000001" },
    update: {},
    create: {
      id: "usr-admin-01",
      email: "admin@premily.com",
      phone: "01700000001",
      password: adminPasswordHash,
      name: "PREMILY Superadmin",
      role: "ADMIN",
      isActive: true,
    },
  });

  // Seller 1: Verified Luxury Artisan Store (Aura Home Studio)
  const sellerAura = await prisma.user.upsert({
    where: { phone: "01711111111" },
    update: {},
    create: {
      id: "usr-seller-aura",
      email: "rummanma17@gmail.com",
      phone: "01711111111",
      password: sellerPasswordHash,
      name: "Abdullah Al Rumman",
      role: "SELLER",
      isActive: true,
    },
  });

  // Seller 2: Verified Luxury Lighting Store (Lumina Lighting Co.)
  const sellerLumina = await prisma.user.upsert({
    where: { phone: "01822222222" },
    update: {},
    create: {
      id: "usr-seller-lumina",
      email: "kamrul@lumina.bd",
      phone: "01822222222",
      password: sellerPasswordHash,
      name: "Kamrul Islam",
      role: "SELLER",
      isActive: true,
    },
  });

  // Seller 3: Pending Verification Pottery Artisan (Clay & Craft Pottery)
  const sellerClay = await prisma.user.upsert({
    where: { phone: "01933333333" },
    update: {},
    create: {
      id: "usr-seller-clay",
      email: "nazmul@claycraft.com",
      phone: "01933333333",
      password: sellerPasswordHash,
      name: "Nazmul Huda",
      role: "SELLER",
      isActive: true,
    },
  });

  // Seller 4: Official Brand Partner Store (RFL Corporate Solutions) -> Strictly Mart Verified
  const sellerRFL = await prisma.user.upsert({
    where: { phone: "01744444444" },
    update: {},
    create: {
      id: "usr-seller-rfl",
      email: "partner@rflbd.com",
      phone: "01744444444",
      password: sellerPasswordHash,
      name: "PRAN-RFL Group Partner",
      role: "SELLER",
      isActive: true,
    },
  });

  // Seller 5: Unverified Store (Heritage Jute & Weaves)
  const sellerHeritage = await prisma.user.upsert({
    where: { phone: "01555555555" },
    update: {},
    create: {
      id: "usr-seller-heritage",
      email: "tanvir@heritagejute.bd",
      phone: "01555555555",
      password: sellerPasswordHash,
      name: "Tanvir Ahmed",
      role: "SELLER",
      isActive: true,
    },
  });

  // Seller 6: Rejected Verification Store (Dhaka Luxury Imports)
  const sellerRejected = await prisma.user.upsert({
    where: { phone: "01766666666" },
    update: {},
    create: {
      id: "usr-seller-rejected",
      email: "info@dhakaluxury.xyz",
      phone: "01766666666",
      password: sellerPasswordHash,
      name: "Rezaul Karim",
      role: "SELLER",
      isActive: true,
    },
  });

  // Customer 1 (Dhaka - Verified Buyer)
  const customer1 = await prisma.user.upsert({
    where: { phone: "01723456789" },
    update: {},
    create: {
      id: "usr-cust-tahmid",
      email: "tahmid.rahman@gmail.com",
      phone: "01723456789",
      password: customerPasswordHash,
      name: "Tahmid Rahman",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Customer 2 (Chattogram)
  const customer2 = await prisma.user.upsert({
    where: { phone: "01834567890" },
    update: {},
    create: {
      id: "usr-cust-farzana",
      email: "farzana.ctg@gmail.com",
      phone: "01834567890",
      password: customerPasswordHash,
      name: "Farzana Chowdhury",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Customer 3 (Sylhet)
  const customer3 = await prisma.user.upsert({
    where: { phone: "01945678901" },
    update: {},
    create: {
      id: "usr-cust-mahbub",
      email: "mahbub.syl@gmail.com",
      phone: "01945678901",
      password: customerPasswordHash,
      name: "Mahbub Alam",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Customer 4 (Dhaka - Frequent Shopper)
  const customer4 = await prisma.user.upsert({
    where: { phone: "01756789012" },
    update: {},
    create: {
      id: "usr-cust-shabnam",
      email: "shabnam.kabir@yahoo.com",
      phone: "01756789012",
      password: customerPasswordHash,
      name: "Shabnam Kabir",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // Customer 5 (Phone-first registration without email)
  const customer5 = await prisma.user.upsert({
    where: { phone: "01876543210" },
    update: {},
    create: {
      id: "usr-cust-nusrat",
      email: null,
      phone: "01876543210",
      password: customerPasswordHash,
      name: "Nusrat Jahan",
      role: "CUSTOMER",
      isActive: true,
    },
  });

  // 4. CUSTOMER ADDRESS BOOK
  console.log("📍 Seeding customer delivery addresses across Bangladesh...");
  await prisma.userAddress.createMany({
    data: [
      {
        id: "addr-tahmid-1",
        userId: customer1.id,
        fullName: "Tahmid Rahman",
        phoneNumber: customer1.phone,
        district: "Dhaka",
        thana: "Banani",
        streetAddress: "House 42, Road 11, Block D, Banani",
        isDefault: true,
      },
      {
        id: "addr-farzana-1",
        userId: customer2.id,
        fullName: "Farzana Chowdhury",
        phoneNumber: customer2.phone,
        district: "Chattogram",
        thana: "Panchlaish",
        streetAddress: "Flat 4B, Nasirabad Housing Society",
        isDefault: true,
      },
      {
        id: "addr-mahbub-1",
        userId: customer3.id,
        fullName: "Mahbub Alam",
        phoneNumber: customer3.phone,
        district: "Sylhet",
        thana: "Sylhet Sadar",
        streetAddress: "Holding 18, Shahjalal Uposhohor",
        isDefault: true,
      },
      {
        id: "addr-shabnam-1",
        userId: customer4.id,
        fullName: "Shabnam Kabir",
        phoneNumber: customer4.phone,
        district: "Dhaka",
        thana: "Uttara",
        streetAddress: "Apartment 7A, Sector 3, Uttara",
        isDefault: true,
      },
      {
        id: "addr-nusrat-1",
        userId: customer5.id,
        fullName: "Nusrat Jahan",
        phoneNumber: customer5.phone,
        district: "Dhaka",
        thana: "Dhanmondi",
        streetAddress: "House 15/A, Road 8, Dhanmondi",
        isDefault: true,
      },
    ],
      skipDuplicates: true,
  });

  // 5. STORES & SELLER SUBSCRIPTIONS
  console.log("🏪 Seeding dedicated seller stores & ৳150/month subscriptions...");

  // Store 1: Aura Home Studio (VERIFIED, isPremilyMart: false)
  const storeAura = await prisma.store.upsert({
      where: { id: "store-aura" },
      update: {},
      create: {
      id: "store-aura",
      sellerId: sellerAura.id,
      slug: "aura-home",
      displayName: "Aura Home Studio",
      description:
        "Curated bespoke furniture, textured boucle seating, and architectural brass & travertine home essentials.",
      logoUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#B8924B",
      seoTitle: "Aura Home Studio | Bespoke Luxury Furniture Bangladesh",
      seoDescription:
        "Explore curated textured boucle armchairs, monolithic travertine tables, and artisanal oak furnishings in Dhaka.",
      status: "ACTIVE",
      isPublished: true,
      publishedAt: new Date("2026-01-15T00:00:00Z"),
      isPremilyMart: false, // Strict Rule: Ordinary sellers NEVER get Mart badge!
      verificationStatus: "VERIFIED",
      verifiedAt: new Date("2026-01-16T10:00:00Z"),
      verifiedBy: admin.id,
      tradeLicenseNo: "TRAD/DSCC/019284/2024",
      nidNumber: "19942691234567890",
      verificationNote:
        "Verified with Dhaka South City Corporation trade license & biometric NID.",
      homeDistrict: "Dhaka",
      insideDistrictCost: 70,
      outsideDistrictCost: 150,
      subscription: {
        create: {
          planCode: "seller_monthly",
          amount: 150.0,
          currency: "BDT",
          status: "ACTIVE",
          trialStartsAt: new Date("2026-01-15T00:00:00Z"),
          trialEndsAt: new Date("2026-02-15T00:00:00Z"),
          currentPeriodStart: new Date("2026-10-15T00:00:00Z"),
          currentPeriodEnd: new Date("2026-11-15T00:00:00Z"),
          provider: "bKash",
          providerSubscriptionId: "SUB-AURA-BK-8891",
          payments: {
            create: [
              {
                amount: 150.0,
                currency: "BDT",
                status: "PAID",
                provider: "bKash",
                providerTransactionId: "BK-SUB-99214A",
                periodStart: new Date("2026-10-15T00:00:00Z"),
                periodEnd: new Date("2026-11-15T00:00:00Z"),
                paidAt: new Date("2026-10-15T01:30:00Z"),
              },
            ],
          },
        },
      },
      shippingRates: {
        create: [
          { districtName: "Gazipur", rate: 100 },
          { districtName: "Narayanganj", rate: 90 },
        ],
      },
    },
  });

  // Store 2: Lumina Lighting Co. (VERIFIED, isPremilyMart: false)
  const storeLumina = await prisma.store.upsert({
      where: { id: "store-lumina" },
      update: {},
      create: {
      id: "store-lumina",
      sellerId: sellerLumina.id,
      slug: "lumina-decor",
      displayName: "Lumina Lighting Co.",
      description:
        "Artisan brass sconces, sculpted alabaster chandeliers, and minimalist ambient warm lighting.",
      logoUrl:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#D4B375",
      seoTitle: "Lumina Lighting Co. | Ambient Sculptural Fixtures",
      seoDescription:
        "Hand-finished brass pendants and linear architectural wall lights crafted for high-end Bangladeshi residences.",
      status: "ACTIVE",
      isPublished: true,
      publishedAt: new Date("2026-02-15T00:00:00Z"),
      isPremilyMart: false,
      verificationStatus: "VERIFIED",
      verifiedAt: new Date("2026-02-16T11:00:00Z"),
      verifiedBy: admin.id,
      tradeLicenseNo: "TRAD/DNCC/083921/2025",
      nidNumber: "19882699876543210",
      verificationNote: "Verified with Dhaka North Trade License.",
      homeDistrict: "Dhaka",
      insideDistrictCost: 70,
      outsideDistrictCost: 150,
      subscription: {
        create: {
          planCode: "seller_monthly",
          amount: 150.0,
          currency: "BDT",
          status: "TRIALING",
          trialStartsAt: new Date("2026-10-15T00:00:00Z"),
          trialEndsAt: new Date("2026-11-15T00:00:00Z"),
        },
      },
      shippingRates: {
        create: [{ districtName: "Sylhet", rate: 130 }],
      },
    },
  });

  // Store 3: Clay & Craft Pottery (PENDING review, isPremilyMart: false)
  const storeClay = await prisma.store.upsert({
      where: { id: "store-clay" },
      update: {},
      create: {
      id: "store-clay",
      sellerId: sellerClay.id,
      slug: "clay-craft",
      displayName: "Clay & Craft Pottery",
      description:
        "Handcrafted Bangladeshi stoneware, matte black terracotta planters, and ceramic tableware from Dhamrai artisans.",
      logoUrl:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#8C6239",
      status: "ACTIVE",
      isPublished: true,
      publishedAt: new Date("2026-10-20T00:00:00Z"),
      isPremilyMart: false,
      verificationStatus: "PENDING", // Crucial for testing PREMILY Admin verification workflow!
      tradeLicenseNo: "TRAD/DHAMRAI/004921/2025",
      nidNumber: "19912612341234123",
      verificationNote: "Pending review of Dhamrai cottage industry certificate.",
      homeDistrict: "Dhaka",
      insideDistrictCost: 70,
      outsideDistrictCost: 150,
      subscription: {
        create: {
          planCode: "seller_monthly",
          amount: 150.0,
          currency: "BDT",
          status: "TRIALING",
          trialStartsAt: new Date("2026-10-20T00:00:00Z"),
          trialEndsAt: new Date("2026-11-20T00:00:00Z"),
        },
      },
    },
  });

  // Store 4: Official PREMILY Mart Brand Partner Store (RFL Home Solutions)
  const storeRFL = await prisma.store.upsert({
      where: { id: "store-rfl" },
      update: {},
      create: {
      id: "store-rfl",
      sellerId: sellerRFL.id,
      slug: "rfl-official",
      displayName: "RFL Home Solutions",
      description:
        "Official PRAN-RFL architectural living and modular Italian kitchen hardware partner store.",
      logoUrl:
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#BE123C",
      status: "ACTIVE",
      isPublished: true,
      publishedAt: new Date("2025-11-01T00:00:00Z"),
      isPremilyMart: true, // Strict Rule: Only Official Brand Partners get Mart badge!
      verificationStatus: "VERIFIED",
      verifiedAt: new Date("2025-11-02T12:00:00Z"),
      verifiedBy: admin.id,
      tradeLicenseNo: "CORP/RFL/2024/0991",
      nidNumber: "19752690001112223",
      verificationNote: "Official corporate brand partnership agreement on file.",
      homeDistrict: "Dhaka",
      insideDistrictCost: 70,
      outsideDistrictCost: 150,
      subscription: {
        create: {
          planCode: "seller_monthly",
          amount: 150.0,
          currency: "BDT",
          status: "ACTIVE",
          trialStartsAt: new Date("2025-11-01T00:00:00Z"),
          trialEndsAt: new Date("2025-12-01T00:00:00Z"),
          currentPeriodStart: new Date("2026-10-01T00:00:00Z"),
          currentPeriodEnd: new Date("2027-01-01T00:00:00Z"),
          provider: "Corporate Wire",
          providerSubscriptionId: "SUB-RFL-CORP-01",
          payments: {
            create: [
              {
                amount: 150.0,
                currency: "BDT",
                status: "PAID",
                provider: "Corporate Wire",
                providerTransactionId: "CORP-TXN-2026-99",
                paidAt: new Date("2026-10-01T09:00:00Z"),
              },
            ],
          },
        },
      },
    },
  });

  // Store 5: Heritage Jute & Weaves (UNVERIFIED, DRAFT)
  await prisma.store.upsert({
      where: { id: "store-heritage" },
      update: {},
      create: {
      id: "store-heritage",
      sellerId: sellerHeritage.id,
      slug: "heritage-jute",
      displayName: "Heritage Jute & Weaves",
      description:
        "Traditional Sonali Aash golden jute rugs, woven table runners, and macrame wall art from Narayanganj.",
      logoUrl:
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=200&q=80",
      bannerUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
      primaryColor: "#A16207",
      status: "DRAFT",
      isPublished: false,
      isPremilyMart: false,
      verificationStatus: "UNVERIFIED",
      homeDistrict: "Narayanganj",
      insideDistrictCost: 70,
      outsideDistrictCost: 150,
      subscription: {
        create: {
          planCode: "seller_monthly",
          amount: 150.0,
          currency: "BDT",
          status: "TRIALING",
          trialStartsAt: new Date(),
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Store 6: Dhaka Luxury Imports (REJECTED, SUSPENDED)
  await prisma.store.upsert({
      where: { id: "store-rejected" },
      update: {},
      create: {
      id: "store-rejected",
      sellerId: sellerRejected.id,
      slug: "dhaka-luxury",
      displayName: "Dhaka Luxury Imports",
      description: "Imported counterfeit and grey market goods.",
      primaryColor: "#4B5563",
      status: "SUSPENDED",
      isPublished: false,
      isPremilyMart: false,
      verificationStatus: "REJECTED",
      tradeLicenseNo: "EXPIRED/2019/001",
      verificationNote:
        "Trade license expired and blurry NID scan provided. Rejected by admin governance.",
      homeDistrict: "Dhaka",
      insideDistrictCost: 70,
      outsideDistrictCost: 150,
    },
  });

  // 6. CATEGORIES
  console.log("🗂️ Seeding product categories...");
  const catFurniture = await prisma.category.upsert({
      where: { id: "furniture" },
      update: {},
      create: {
      id: "furniture",
      name: "Furniture",
      slug: "furniture",
      icon: "Sofa",
      imageUrl:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    },
  });

  const catLighting = await prisma.category.upsert({
      where: { id: "lighting" },
      update: {},
      create: {
      id: "lighting",
      name: "Lighting",
      slug: "lighting",
      icon: "Lamp",
      imageUrl:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    },
  });

  const catLiving = await prisma.category.upsert({
      where: { id: "living" },
      update: {},
      create: {
      id: "living",
      name: "Living Room",
      slug: "living",
      icon: "Armchair",
      imageUrl:
        "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=600&q=80",
    },
  });

  const catDecor = await prisma.category.upsert({
      where: { id: "decor" },
      update: {},
      create: {
      id: "decor",
      name: "Decor & Pottery",
      slug: "decor",
      icon: "Flower2",
      imageUrl:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80",
    },
  });

  const catKitchen = await prisma.category.upsert({
      where: { id: "kitchen" },
      update: {},
      create: {
      id: "kitchen",
      name: "Kitchen & Dining",
      slug: "kitchen",
      icon: "Utensils",
      imageUrl:
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
    },
  });

  const catTextiles = await prisma.category.upsert({
      where: { id: "textiles" },
      update: {},
      create: {
      id: "textiles",
      name: "Textiles & Rugs",
      slug: "textiles",
      icon: "LayoutGrid",
      imageUrl:
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80",
    },
  });

  // 7. PRODUCTS, VARIANTS & IMAGES
  console.log("🛋️ Seeding luxury artisan products, color/size variants, and galleries...");

  // Product 1: Aura Curved Lounge Chair (Aura Home Studio)
  const pAuraChair = await prisma.product.upsert({
      where: { id: "p1" },
      update: {},
      create: {
      id: "p1",
      storeId: storeAura.id,
      name: "Aura Curved Lounge Chair",
      slug: "aura-curved-chair",
      description:
        "Solid oak construction upholstered in heavy textured boucle fabric. Designed for ergonomic luxury and minimalist living spaces.",
      categoryId: catFurniture.id,
      status: "ACTIVE",
      avgRating: 4.9,
      reviewCount: 48,
      salesCount: 140,
      isFeatured: true,
      isTrending: true,
      seoTitle: "Aura Curved Lounge Chair | Textured Boucle Seating",
      seoDescription: "Solid oak sculptural lounge chair upholstered in Belgian boucle fabric.",
      variants: {
        create: [
          {
            sku: "AURA-CHR-CRM-STD",
            price: 18500,
            compareAtPrice: 24000,
            stock: 12,
            size: "Standard",
            color: "Cream Boucle",
          },
          {
            sku: "AURA-CHR-GRY-STD",
            price: 18500,
            compareAtPrice: 24000,
            stock: 8,
            size: "Standard",
            color: "Charcoal Grey",
          },
          {
            sku: "AURA-CHR-CRM-LRG",
            price: 21500,
            compareAtPrice: 27000,
            stock: 5,
            size: "Large",
            color: "Cream Boucle",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
            altText: "Aura Curved Lounge Chair in Cream Boucle Front",
            position: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
            altText: "Aura Curved Lounge Chair Side Silhouette",
            position: 1,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 2: Velvet Accent Armchair (Aura Home Studio)
  const pVelvetArmchair = await prisma.product.upsert({
      where: { id: "p2" },
      update: {},
      create: {
      id: "p2",
      storeId: storeAura.id,
      name: "Velvet Accent Armchair",
      slug: "velvet-accent-armchair",
      description:
        "Mid-century modern silhouette with brushed brass legs and high-density memory foam cushioning.",
      categoryId: catFurniture.id,
      status: "ACTIVE",
      avgRating: 4.8,
      reviewCount: 36,
      salesCount: 95,
      isFeatured: true,
      seoTitle: "Velvet Accent Armchair | Brushed Brass Legs",
      variants: {
        create: [
          {
            sku: "VLV-ARM-EMR-STD",
            price: 22000,
            compareAtPrice: 28000,
            stock: 8,
            size: "Standard",
            color: "Emerald Green",
          },
          {
            sku: "VLV-ARM-BLU-STD",
            price: 22000,
            compareAtPrice: 28000,
            stock: 6,
            size: "Standard",
            color: "Midnight Blue",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
            altText: "Emerald Green Velvet Accent Armchair",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 3: Travertine Coffee Table (Aura Home Studio)
  const pTravertineTable = await prisma.product.upsert({
      where: { id: "p3" },
      update: {},
      create: {
      id: "p3",
      storeId: storeAura.id,
      name: "Travertine Coffee Table",
      slug: "travertine-coffee-table",
      description:
        "Sculptural monolith table carved from natural Roman travertine stone with honed matte finish.",
      categoryId: catLiving.id,
      status: "ACTIVE",
      avgRating: 5.0,
      reviewCount: 22,
      salesCount: 42,
      isFeatured: true,
      variants: {
        create: [
          {
            sku: "TRV-TBL-BGE-90",
            price: 24000,
            compareAtPrice: 32000,
            stock: 5,
            size: "90cm Round",
            color: "Warm Beige",
          },
          {
            sku: "TRV-TBL-IVR-110",
            price: 28500,
            compareAtPrice: 36000,
            stock: 3,
            size: "110cm Oval",
            color: "Ivory",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=1200&q=80",
            altText: "Roman Travertine Monolith Coffee Table",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 4: Nordic Minimalist Oak Credenza (Aura Home Studio)
  const pOakCredenza = await prisma.product.upsert({
      where: { id: "p4" },
      update: {},
      create: {
      id: "p4",
      storeId: storeAura.id,
      name: "Nordic Minimalist Oak Credenza",
      slug: "nordic-oak-credenza",
      description:
        "Handcrafted white oak sideboard with sliding slatted tambours and hidden cable routing.",
      categoryId: catFurniture.id,
      status: "ACTIVE",
      avgRating: 4.9,
      reviewCount: 15,
      salesCount: 19,
      isFeatured: false,
      variants: {
        create: [
          {
            sku: "CRD-OAK-NAT-160",
            price: 36500,
            compareAtPrice: 42000,
            stock: 4,
            size: "160cm Wide",
            color: "Natural White Oak",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
            altText: "Nordic Minimalist Oak Credenza",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 5: Aura Alabaster Brass Pendant (Lumina Lighting Co.)
  const pAlabasterPendant = await prisma.product.upsert({
      where: { id: "p5" },
      update: {},
      create: {
      id: "p5",
      storeId: storeLumina.id,
      name: "Aura Alabaster Brass Pendant",
      slug: "alabaster-brass-pendant",
      description:
        "Solid Spanish alabaster stone dome with brushed brass chain and dimmable 2700K warm LED bulb.",
      categoryId: catLighting.id,
      status: "ACTIVE",
      avgRating: 4.8,
      reviewCount: 31,
      salesCount: 52,
      isFeatured: true,
      variants: {
        create: [
          {
            sku: "ALB-PND-BRS-30",
            price: 12500,
            compareAtPrice: 16000,
            stock: 14,
            size: "30cm",
            color: "Brushed Brass",
          },
          {
            sku: "ALB-PND-BRS-45",
            price: 15500,
            compareAtPrice: 19500,
            stock: 9,
            size: "45cm",
            color: "Brushed Brass",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
            altText: "Aura Alabaster Brass Pendant Light",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 6: Sculptural Linear Wall Sconce (Lumina Lighting Co.)
  const pLinearSconce = await prisma.product.upsert({
      where: { id: "p6" },
      update: {},
      create: {
      id: "p6",
      storeId: storeLumina.id,
      name: "Sculptural Linear Wall Sconce",
      slug: "linear-wall-sconce",
      description: "Minimalist indirect wall sconce producing soft architectural halo illumination.",
      categoryId: catLighting.id,
      status: "ACTIVE",
      avgRating: 4.7,
      reviewCount: 19,
      salesCount: 40,
      isFeatured: false,
      variants: {
        create: [
          {
            sku: "LNR-SCN-BLK-60",
            price: 8900,
            compareAtPrice: 11500,
            stock: 20,
            size: "60cm",
            color: "Matte Black",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
            altText: "Sculptural Linear Wall Sconce in Black",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 7: Artisan Terracotta Vase Trio (Clay & Craft Pottery)
  const pTerracottaVase = await prisma.product.upsert({
      where: { id: "p7" },
      update: {},
      create: {
      id: "p7",
      storeId: storeClay.id,
      name: "Artisan Terracotta Vase Trio",
      slug: "terracotta-vase-trio",
      description:
        "Set of three wheel-thrown textured clay vases finished with porous mineral glaze.",
      categoryId: catDecor.id,
      status: "ACTIVE",
      avgRating: 4.9,
      reviewCount: 24,
      salesCount: 68,
      isFeatured: true,
      variants: {
        create: [
          {
            sku: "TER-VAS-RAW-TRI",
            price: 4500,
            compareAtPrice: 6000,
            stock: 18,
            size: "Trio Set",
            color: "Raw Clay",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
            altText: "Handmade Terracotta Clay Vase Trio",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 8: Handmade Ceramic Dining Set (Clay & Craft Pottery)
  const pCeramicDining = await prisma.product.upsert({
      where: { id: "p8" },
      update: {},
      create: {
      id: "p8",
      storeId: storeClay.id,
      name: "Handmade Ceramic Dining Set",
      slug: "ceramic-dining-set",
      description:
        "16-piece artisan stoneware dining service with speckled glaze and organic rim profiles.",
      categoryId: catKitchen.id,
      status: "ACTIVE",
      avgRating: 4.7,
      reviewCount: 14,
      salesCount: 22,
      isFeatured: false,
      variants: {
        create: [
          {
            sku: "CRM-DIN-OTM-16",
            price: 9200,
            compareAtPrice: 12500,
            stock: 9,
            size: "16-piece for 4",
            color: "Oatmeal Speckle",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80",
            altText: "Handmade Ceramic Dining Service",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 9: Moderna Modular Kitchen Island (RFL Home Solutions)
  const pKitchenIsland = await prisma.product.upsert({
      where: { id: "p9" },
      update: {},
      create: {
      id: "p9",
      storeId: storeRFL.id,
      name: "Moderna Modular Kitchen Island",
      slug: "moderna-kitchen-island",
      description:
        "Engineered high-pressure laminate with quartz worktop and soft-close Austrian Blum drawers.",
      categoryId: catKitchen.id,
      status: "ACTIVE",
      avgRating: 5.0,
      reviewCount: 42,
      salesCount: 38,
      isFeatured: true,
      variants: {
        create: [
          {
            sku: "MOD-KTN-MRB-180",
            price: 48000,
            compareAtPrice: 60000,
            stock: 6,
            size: "180cm x 90cm",
            color: "Italian Marble / Walnut",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
            altText: "Moderna Modular Italian Kitchen Island",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Product 10: Sonali Golden Jute Braided Area Rug (Aura Home Studio)
  const pJuteRug = await prisma.product.upsert({
      where: { id: "p10" },
      update: {},
      create: {
      id: "p10",
      storeId: storeAura.id,
      name: "Sonali Golden Jute Braided Area Rug",
      slug: "sonali-golden-jute-rug",
      description:
        "Hand-braided 100% natural Bangladeshi golden fiber jute rug. Durable, eco-friendly, and richly textured underfoot.",
      categoryId: catTextiles.id,
      status: "ACTIVE",
      avgRating: 4.8,
      reviewCount: 18,
      salesCount: 46,
      isFeatured: true,
      variants: {
        create: [
          {
            sku: "JUT-RUG-NAT-5X8",
            price: 7500,
            compareAtPrice: 9500,
            stock: 15,
            size: "5x8 Feet",
            color: "Natural Jute",
          },
          {
            sku: "JUT-RUG-NAT-8X10",
            price: 13500,
            compareAtPrice: 17000,
            stock: 7,
            size: "8x10 Feet",
            color: "Natural Jute",
          },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            altText: "Sonali Golden Jute Braided Area Rug",
            position: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  // 8. VERIFIED CUSTOMER REVIEWS
  console.log("⭐ Seeding verified buyer reviews and seller responses...");
  await prisma.review.createMany({
    data: [
      {
        id: "rev-1",
        productId: pAuraChair.id,
        userId: customer1.id,
        rating: 5,
        title: "Masterpiece Boucle Chair for Dhaka Living Room",
        comment:
          "The boucle upholstery quality is exceptional. Delivery to Banani was prompt and white-glove inside Dhaka. Looks directly out of an architectural digest editorial.",
        isVerifiedPurchase: true,
        status: "APPROVED",
        sellerReply: "Thank you Tahmid! We are honored to furnish your Banani residence with Aura.",
        sellerRepliedAt: new Date("2026-10-26T11:00:00Z"),
      },
      {
        id: "rev-2",
        productId: pTravertineTable.id,
        userId: customer4.id,
        rating: 5,
        title: "Genuine Roman Travertine Stone",
        comment:
          "Solid monolithic stone with exquisite natural veining. Very heavy and grounded piece. The delivery crew carried it carefully up to the 7th floor in Uttara.",
        isVerifiedPurchase: true,
        status: "APPROVED",
        sellerReply:
          "Appreciate the kind words Shabnam. Natural travertine takes 4 weeks of hand-polishing and honing.",
        sellerRepliedAt: new Date("2026-10-25T14:20:00Z"),
      },
      {
        id: "rev-3",
        productId: pAlabasterPendant.id,
        userId: customer3.id,
        rating: 5,
        title: "Soft 2700K Architectural Glow in Sylhet",
        comment:
          "Shipped via RedX to Sylhet Sadar in pristine wooden crating. The alabaster dome diffuses light warmly without any harsh glare.",
        isVerifiedPurchase: true,
        status: "APPROVED",
        sellerReply: "Wonderful to hear Mahbub! Spanish alabaster is our signature collection.",
        sellerRepliedAt: new Date("2026-10-23T18:00:00Z"),
      },
      {
        id: "rev-4",
        productId: pTerracottaVase.id,
        userId: customer2.id,
        rating: 4,
        title: "Beautiful traditional craftsmanship",
        comment:
          "Authentic Dhamrai clay pottery. One vase had slight organic texture variation which actually proves it was hand-thrown on a traditional potter's wheel.",
        isVerifiedPurchase: true,
        status: "APPROVED",
      },
    ],
      skipDuplicates: true,
  });

  // 9. CAMPAIGNS, PROMOTIONS & FLASH SALES
  console.log("🔥 Seeding flash sales, festive campaigns, and promotional items...");
  const flashCampaign = await prisma.campaign.upsert({
      where: { id: "camp-flash-gala" },
      update: {},
      create: {
      id: "camp-flash-gala",
      name: "Architectural Living Flash Gala",
      slug: "flash-gala",
      description:
        "Curated artisan seating, marble tables, and sculptural lighting at privileged discounts.",
      bannerUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
      badgeText: "Flash Sale · 40% Off",
      type: "FLASH_SALE",
      startsAt: new Date("2026-10-20T00:00:00Z"),
      endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Active for next 10 days
      isActive: true,
      items: {
        create: [
          {
            productId: pAuraChair.id,
            salePrice: 16500,
            stockLimit: 10,
            soldCount: 6,
          },
          {
            productId: pAlabasterPendant.id,
            salePrice: 10800,
            stockLimit: 15,
            soldCount: 8,
          },
          {
            productId: pTravertineTable.id,
            salePrice: 21500,
            stockLimit: 4,
            soldCount: 2,
          },
        ],
      },
    },
  });

  await prisma.campaign.upsert({
      where: { id: "camp-artisan-heritage" },
      update: {},
      create: {
      id: "camp-artisan-heritage",
      name: "Dhaka Artisan Heritage Week",
      slug: "artisan-heritage",
      description:
        "Celebrating traditional Bangladeshi terracotta and Dhamrai stoneware pottery masters.",
      bannerUrl:
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1600&q=80",
      badgeText: "Artisan Heritage · Free Delivery",
      type: "FESTIVAL",
      startsAt: new Date("2026-10-25T00:00:00Z"),
      endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isActive: true,
      items: {
        create: [
          {
            productId: pTerracottaVase.id,
            salePrice: 3800,
            stockLimit: 20,
            soldCount: 5,
          },
          {
            productId: pJuteRug.id,
            salePrice: 6500,
            stockLimit: 12,
            soldCount: 4,
          },
        ],
      },
    },
  });

  // 10. ACTIVE CUSTOMER CARTS
  console.log("🛒 Seeding customer shopping carts...");
  await prisma.cart.upsert({
      where: { userId: customer4.id },
      update: {},
      create: {
      userId: customer4.id,
      items: {
        create: [
          {
            variantId: pAuraChair.variants[0].id,
            quantity: 1,
          },
          {
            variantId: pTerracottaVase.variants[0].id,
            quantity: 2,
          },
        ],
      },
    },
  });

  // 11. ORDER GROUPS, MULTI-STORE CHECKOUTS & PAYMENTS
  console.log("📦 Seeding multi-store customer orders across lifecycle states...");

  // Order Group 1: Customer Tahmid Rahman (Banani, Dhaka) -> Aura Home Studio (PROCESSING)
  const group1 = await prisma.orderGroup.upsert({
      where: { id: "grp-98214" },
      update: {},
      create: {
      id: "grp-98214",
      groupNumber: "GRP-2026-98214",
      userId: customer1.id,
      subtotal: 18500,
      shippingCost: 70, // Inside Dhaka base rate
      discount: 0,
      total: 18570,
      currency: "BDT",
    },
  });

  const order1 = await prisma.order.upsert({
      where: { id: "ord-1" },
      update: {},
      create: {
      id: "ord-1",
      orderNumber: "PRM-98214-DHK",
      orderGroupId: group1.id,
      storeId: storeAura.id,
      userId: customer1.id,
      status: "PROCESSING",
      subtotal: 18500,
      shippingCost: 70,
      discount: 0,
      total: 18570,
      currency: "BDT",
      shippingName: "Tahmid Rahman",
      shippingPhone: customer1.phone,
      shippingAddress: "House 42, Road 11, Block D, Banani",
      shippingCity: "Banani, Dhaka",
      shippingDistrict: "Dhaka",
      shippingPostalCode: "1213",
      shippingCountry: "Bangladesh",
      customerNote: "Please call 30 minutes before arrival at Banani gate.",
      items: {
        create: [
          {
            productName: pAuraChair.name,
            productSlugAtOrder: pAuraChair.slug,
            variantLabel: "Cream Boucle / Standard",
            skuAtOrder: pAuraChair.variants[0].sku,
            productImageUrlAtOrder:
              "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80",
            priceAtOrder: 18500,
            quantity: 1,
            variantId: pAuraChair.variants[0].id,
          },
        ],
      },
      payments: {
        create: [
          {
            method: "BKASH",
            status: "VERIFIED",
            amount: 18570,
            currency: "BDT",
            transactionId: "BK99X82LA4",
            senderNumber: customer1.phone,
            verifiedAt: new Date("2026-10-25T14:45:00Z"),
            verifiedBy: admin.id,
          },
        ],
      },
    },
  });

  // Order Group 2: Customer Farzana Chowdhury (Chattogram) -> Aura Home Studio (SHIPPED)
  const group2 = await prisma.orderGroup.upsert({
      where: { id: "grp-98215" },
      update: {},
      create: {
      id: "grp-98215",
      groupNumber: "GRP-2026-98215",
      userId: customer2.id,
      subtotal: 22000,
      shippingCost: 150, // Outside Dhaka rate
      discount: 0,
      total: 22150,
      currency: "BDT",
    },
  });

  await prisma.order.upsert({
      where: { id: "ord-2" },
      update: {},
      create: {
      id: "ord-2",
      orderNumber: "PRM-98215-CTG",
      orderGroupId: group2.id,
      storeId: storeAura.id,
      userId: customer2.id,
      status: "SHIPPED",
      subtotal: 22000,
      shippingCost: 150,
      discount: 0,
      total: 22150,
      currency: "BDT",
      shippingName: "Farzana Chowdhury",
      shippingPhone: customer2.phone,
      shippingAddress: "Flat 4B, Nasirabad Housing Society",
      shippingCity: "Panchlaish, Chattogram",
      shippingDistrict: "Chattogram",
      shippingPostalCode: "4000",
      shippingCountry: "Bangladesh",
      items: {
        create: [
          {
            productName: pVelvetArmchair.name,
            productSlugAtOrder: pVelvetArmchair.slug,
            variantLabel: "Emerald Green / Standard",
            skuAtOrder: pVelvetArmchair.variants[0].sku,
            productImageUrlAtOrder:
              "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=300&q=80",
            priceAtOrder: 22000,
            quantity: 1,
            variantId: pVelvetArmchair.variants[0].id,
          },
        ],
      },
      payments: {
        create: [
          {
            method: "CASH_ON_DELIVERY",
            status: "PENDING",
            amount: 22150,
            currency: "BDT",
          },
        ],
      },
    },
  });

  // Order Group 3: Customer Mahbub Alam (Sylhet) -> Lumina Lighting Co. (DELIVERED)
  const group3 = await prisma.orderGroup.upsert({
      where: { id: "grp-98216" },
      update: {},
      create: {
      id: "grp-98216",
      groupNumber: "GRP-2026-98216",
      userId: customer3.id,
      subtotal: 25000,
      shippingCost: 130, // Lumina Store District Override for Sylhet (৳130 instead of ৳150)
      discount: 0,
      total: 25130,
      currency: "BDT",
    },
  });

  await prisma.order.upsert({
      where: { id: "ord-3" },
      update: {},
      create: {
      id: "ord-3",
      orderNumber: "PRM-98216-SYL",
      orderGroupId: group3.id,
      storeId: storeLumina.id,
      userId: customer3.id,
      status: "DELIVERED",
      subtotal: 25000,
      shippingCost: 130,
      discount: 0,
      total: 25130,
      currency: "BDT",
      shippingName: "Mahbub Alam",
      shippingPhone: customer3.phone,
      shippingAddress: "Holding 18, Shahjalal Uposhohor",
      shippingCity: "Sylhet Sadar",
      shippingDistrict: "Sylhet",
      shippingPostalCode: "3100",
      shippingCountry: "Bangladesh",
      items: {
        create: [
          {
            productName: pAlabasterPendant.name,
            productSlugAtOrder: pAlabasterPendant.slug,
            variantLabel: "Brushed Brass / 30cm",
            skuAtOrder: pAlabasterPendant.variants[0].sku,
            productImageUrlAtOrder:
              "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80",
            priceAtOrder: 12500,
            quantity: 2,
            variantId: pAlabasterPendant.variants[0].id,
          },
        ],
      },
      payments: {
        create: [
          {
            method: "NAGAD",
            status: "VERIFIED",
            amount: 25130,
            currency: "BDT",
            transactionId: "NG8827419A",
            senderNumber: customer3.phone,
            verifiedAt: new Date("2026-10-20T10:00:00Z"),
            verifiedBy: admin.id,
          },
        ],
      },
    },
  });

  // Order Group 4: Customer Shabnam Kabir (Uttara, Dhaka) -> Aura Home Studio (PENDING VERIFICATION)
  const group4 = await prisma.orderGroup.upsert({
      where: { id: "grp-98217" },
      update: {},
      create: {
      id: "grp-98217",
      groupNumber: "GRP-2026-98217",
      userId: customer4.id,
      subtotal: 24000,
      shippingCost: 70,
      discount: 0,
      total: 24070,
      currency: "BDT",
    },
  });

  await prisma.order.upsert({
      where: { id: "ord-4" },
      update: {},
      create: {
      id: "ord-4",
      orderNumber: "PRM-98217-DHK",
      orderGroupId: group4.id,
      storeId: storeAura.id,
      userId: customer4.id,
      status: "PENDING",
      subtotal: 24000,
      shippingCost: 70,
      discount: 0,
      total: 24070,
      currency: "BDT",
      shippingName: "Shabnam Kabir",
      shippingPhone: customer4.phone,
      shippingAddress: "Apartment 7A, Sector 3, Uttara",
      shippingCity: "Uttara, Dhaka",
      shippingDistrict: "Dhaka",
      shippingPostalCode: "1230",
      shippingCountry: "Bangladesh",
      items: {
        create: [
          {
            productName: pTravertineTable.name,
            productSlugAtOrder: pTravertineTable.slug,
            variantLabel: "Warm Beige / 90cm Round",
            skuAtOrder: pTravertineTable.variants[0].sku,
            productImageUrlAtOrder:
              "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=300&q=80",
            priceAtOrder: 24000,
            quantity: 1,
            variantId: pTravertineTable.variants[0].id,
          },
        ],
      },
      payments: {
        create: [
          {
            method: "BKASH",
            status: "PENDING", // Ready for Admin or Seller to verify in panel!
            amount: 24070,
            currency: "BDT",
            transactionId: "BK7739103X",
            senderNumber: customer4.phone,
          },
        ],
      },
    },
  });

  // Order Group 5: Customer Nusrat Jahan (Dhanmondi, Dhaka) -> Clay & Craft Pottery (CONFIRMED)
  const group5 = await prisma.orderGroup.upsert({
      where: { id: "grp-98218" },
      update: {},
      create: {
      id: "grp-98218",
      groupNumber: "GRP-2026-98218",
      userId: customer5.id,
      subtotal: 4500,
      shippingCost: 70,
      discount: 0,
      total: 4570,
      currency: "BDT",
    },
  });

  await prisma.order.upsert({
      where: { id: "ord-5" },
      update: {},
      create: {
      id: "ord-5",
      orderNumber: "PRM-98218-DHK",
      orderGroupId: group5.id,
      storeId: storeClay.id,
      userId: customer5.id,
      status: "CONFIRMED",
      subtotal: 4500,
      shippingCost: 70,
      discount: 0,
      total: 4570,
      currency: "BDT",
      shippingName: "Nusrat Jahan",
      shippingPhone: customer5.phone,
      shippingAddress: "House 15/A, Road 8, Dhanmondi",
      shippingCity: "Dhanmondi, Dhaka",
      shippingDistrict: "Dhaka",
      shippingPostalCode: "1205",
      shippingCountry: "Bangladesh",
      items: {
        create: [
          {
            productName: pTerracottaVase.name,
            productSlugAtOrder: pTerracottaVase.slug,
            variantLabel: "Raw Clay / Trio Set",
            skuAtOrder: pTerracottaVase.variants[0].sku,
            productImageUrlAtOrder:
              "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80",
            priceAtOrder: 4500,
            quantity: 1,
            variantId: pTerracottaVase.variants[0].id,
          },
        ],
      },
      payments: {
        create: [
          {
            method: "BKASH",
            status: "VERIFIED",
            amount: 4570,
            currency: "BDT",
            transactionId: "BK5566778A",
            senderNumber: customer5.phone,
            verifiedAt: new Date(),
            verifiedBy: admin.id,
          },
        ],
      },
    },
  });

  console.log("✨ PREMILY SEEDING COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  console.log("Summary of Seeded Entities:");
  console.log(`- Districts: ${BANGLADESH_64_DISTRICTS.length} across 8 divisions`);
  console.log("- Superadmin: admin@premily.com / 01700000001 (Pass: admin123)");
  console.log("- Sellers:");
  console.log("    1. Aura Home Studio (Verified Luxury): rummanma17@gmail.com / 01711111111");
  console.log("    2. Lumina Lighting Co. (Verified Lighting): kamrul@lumina.bd / 01822222222");
  console.log("    3. Clay & Craft Pottery (Pending Verification): nazmul@claycraft.com / 01933333333");
  console.log("    4. RFL Home Solutions (Official PREMILY Mart Partner): partner@rflbd.com / 01744444444");
  console.log("    5. Heritage Jute & Weaves (Unverified Draft): tanvir@heritagejute.bd / 01555555555");
  console.log("    6. Dhaka Luxury Imports (Rejected Suspended): info@dhakaluxury.xyz / 01766666666");
  console.log("- Customers: 5 phone-first customer accounts (Tahmid, Farzana, Mahbub, Shabnam, Nusrat)");
  console.log("- Categories: 6 luxury categories (Furniture, Lighting, Living, Decor, Kitchen, Textiles)");
  console.log("- Products: 10 handcrafted products with variants and image galleries");
  console.log("- Campaigns: 2 active campaigns (Flash Sale 40% Gala, Dhaka Artisan Heritage)");
  console.log("- Customer Orders: 5 orders spanning PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED");
  console.log("- Payments: bKash, Nagad, and Cash On Delivery records");
  console.log("- Subscriptions: ৳150/mo active and trialing subscriptions with billing records");
  console.log("==================================================");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
