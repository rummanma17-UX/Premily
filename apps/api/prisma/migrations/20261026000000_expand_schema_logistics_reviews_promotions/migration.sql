-- CreateEnum
CREATE TYPE "StoreVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ShippingZone" AS ENUM ('INSIDE_DHAKA', 'DHAKA_SUBURB', 'OUTSIDE_DHAKA');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('FLASH_SALE', 'FESTIVAL', 'SEASONAL', 'CLEARANCE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN "isPremilyMart" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verificationStatus" "StoreVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN "verifiedAt" TIMESTAMP(3),
ADD COLUMN "verifiedBy" TEXT,
ADD COLUMN "tradeLicenseNo" TEXT,
ADD COLUMN "nidNumber" TEXT,
ADD COLUMN "verificationNote" TEXT,
ADD COLUMN "insideDistrictCost" DECIMAL(10,2),
ADD COLUMN "outsideDistrictCost" DECIMAL(10,2),
ADD COLUMN "homeDistrict" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "parentId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "salesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isTrending" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN "compareAtPrice" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "thana" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_shipping_rates" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "districtName" TEXT NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district_shipping" (
    "id" TEXT NOT NULL,
    "districtName" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "zone" "ShippingZone" NOT NULL DEFAULT 'OUTSIDE_DHAKA',
    "baseCost" DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    "estimatedDaysMin" INTEGER NOT NULL DEFAULT 3,
    "estimatedDaysMax" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "district_shipping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bannerUrl" TEXT,
    "badgeText" TEXT,
    "type" "CampaignType" NOT NULL DEFAULT 'FLASH_SALE',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_products" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "salePrice" DECIMAL(10,2) NOT NULL,
    "stockLimit" INTEGER,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
    "sellerReply" TEXT,
    "sellerRepliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_addresses_userId_isDefault_idx" ON "user_addresses"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "store_shipping_rates_storeId_districtName_key" ON "store_shipping_rates"("storeId", "districtName");

-- CreateIndex
CREATE UNIQUE INDEX "district_shipping_districtName_key" ON "district_shipping"("districtName");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_key" ON "campaigns"("slug");

-- CreateIndex
CREATE INDEX "campaigns_isActive_startsAt_endsAt_idx" ON "campaigns"("isActive", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "campaign_products_campaignId_idx" ON "campaign_products"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_products_campaignId_productId_key" ON "campaign_products"("campaignId", "productId");

-- CreateIndex
CREATE INDEX "reviews_productId_status_createdAt_idx" ON "reviews"("productId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "stores_isPremilyMart_idx" ON "stores"("isPremilyMart");

-- CreateIndex
CREATE INDEX "stores_verificationStatus_idx" ON "stores"("verificationStatus");

-- CreateIndex
CREATE INDEX "products_status_isFeatured_idx" ON "products"("status", "isFeatured");

-- CreateIndex
CREATE INDEX "products_status_salesCount_idx" ON "products"("status", "salesCount");

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_shipping_rates" ADD CONSTRAINT "store_shipping_rates_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
