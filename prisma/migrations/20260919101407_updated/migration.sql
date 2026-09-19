/*
  Warnings:

  - You are about to drop the column `shippingAddress` on the `order` table. All the data in the column will be lost.
  - Added the required column `shippingAddressLine` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCity` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingDistrict` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_userId_fkey";

-- DropForeignKey
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_variantId_fkey";

-- AlterTable
ALTER TABLE "order" DROP COLUMN "shippingAddress",
ADD COLUMN     "shippingAddressLine" TEXT NOT NULL,
ADD COLUMN     "shippingCity" VARCHAR(100) NOT NULL,
ADD COLUMN     "shippingDistrict" VARCHAR(100) NOT NULL,
ADD COLUMN     "shippingPostalCode" VARCHAR(20),
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "discountPercentage" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "variantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
