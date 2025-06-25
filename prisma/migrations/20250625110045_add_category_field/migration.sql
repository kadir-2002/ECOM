/*
  Warnings:

  - You are about to drop the column `categryName` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `minimum_order_quantity` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `parent_catgory` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `seo_description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `seo_keyword` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `seo_title` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `seodescription` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `sequence_number` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Category_slug_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "categryName",
DROP COLUMN "description",
DROP COLUMN "heading",
DROP COLUMN "image",
DROP COLUMN "isActive",
DROP COLUMN "minimum_order_quantity",
DROP COLUMN "parent_catgory",
DROP COLUMN "seo_description",
DROP COLUMN "seo_keyword",
DROP COLUMN "seo_title",
DROP COLUMN "seodescription",
DROP COLUMN "sequence_number",
DROP COLUMN "slug",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "subcategoryId" INTEGER;

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "banner" TEXT,
    "imageUrl" TEXT,
    "publicId" TEXT,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_name_categoryId_key" ON "Subcategory"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
