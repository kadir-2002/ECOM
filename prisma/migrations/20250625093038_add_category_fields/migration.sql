/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Subcategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Subcategory" DROP CONSTRAINT "Subcategory_categoryId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "imageUrl",
DROP COLUMN "name",
DROP COLUMN "publicId",
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "categryName" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "heading" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minimum_order_quantity" INTEGER,
ADD COLUMN     "parent_catgory" INTEGER,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_keyword" TEXT,
ADD COLUMN     "seo_title" TEXT,
ADD COLUMN     "seodescription" TEXT,
ADD COLUMN     "sequence_number" INTEGER,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId",
DROP COLUMN "subcategoryId";

-- DropTable
DROP TABLE "Subcategory";
