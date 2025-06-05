-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "slug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subcategory" ALTER COLUMN "slug" DROP NOT NULL;
