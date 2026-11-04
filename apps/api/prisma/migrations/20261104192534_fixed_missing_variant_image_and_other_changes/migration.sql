/*
  Warnings:

  - You are about to drop the `store_shipping_rates` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TrialExtensionDuration" AS ENUM ('ONE_MONTH', 'TWO_MONTHS');

-- CreateEnum
CREATE TYPE "TrialExtensionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "CampaignType" ADD VALUE 'FREE_DELIVERY';

-- DropForeignKey
ALTER TABLE "store_shipping_rates" DROP CONSTRAINT "store_shipping_rates_storeId_fkey";

-- AlterTable
ALTER TABLE "seller_subscriptions" ADD COLUMN     "gracePeriodEndsAt" TIMESTAMP(3),
ALTER COLUMN "trialStartsAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "brandId" TEXT;

-- DropTable
DROP TABLE "store_shipping_rates";

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_extension_requests" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedDuration" "TrialExtensionDuration" NOT NULL,
    "reason" TEXT,
    "status" "TrialExtensionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_extension_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "product_variant_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "trial_extension_requests_subscriptionId_status_createdAt_idx" ON "trial_extension_requests"("subscriptionId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "trial_extension_requests_requestedById_createdAt_idx" ON "trial_extension_requests"("requestedById", "createdAt");

-- CreateIndex
CREATE INDEX "trial_extension_requests_status_createdAt_idx" ON "trial_extension_requests"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_images_variantId_position_key" ON "product_variant_images"("variantId", "position");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_extension_requests" ADD CONSTRAINT "trial_extension_requests_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "seller_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_extension_requests" ADD CONSTRAINT "trial_extension_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_extension_requests" ADD CONSTRAINT "trial_extension_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_images" ADD CONSTRAINT "product_variant_images_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
