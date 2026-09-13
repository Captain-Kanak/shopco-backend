/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `brand` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "brand_deletedAt_idx";

-- AlterTable
ALTER TABLE "brand" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "payment" ALTER COLUMN "transactionId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "brand_name_idx" ON "brand"("name");
