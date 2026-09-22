/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `cart` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "cart_deletedAt_idx";

-- AlterTable
ALTER TABLE "cart" DROP COLUMN "deletedAt";
