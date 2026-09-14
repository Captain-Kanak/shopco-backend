/*
  Warnings:

  - A unique constraint covering the columns `[parentId,name]` on the table `category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "category_parentId_name_key" ON "category"("parentId", "name");
