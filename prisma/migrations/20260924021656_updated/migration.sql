/*
  Warnings:

  - You are about to alter the column `orderNumber` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.
  - You are about to drop the column `deletedAt` on the `order_item` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "order_item_deletedAt_idx";

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "cancelReason" TEXT,
ALTER COLUMN "orderNumber" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "order_item" DROP COLUMN "deletedAt";

-- CreateIndex
CREATE INDEX "order_orderStatus_idx" ON "order"("orderStatus");

-- CreateIndex
CREATE INDEX "order_paymentStatus_idx" ON "order"("paymentStatus");
