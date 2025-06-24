/*
  Warnings:

  - A unique constraint covering the columns `[sequence_number]` on the table `HomepageBanner` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sequence_number` to the `HomepageBanner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HomepageBanner" ADD COLUMN     "mobile_banner" TEXT,
ADD COLUMN     "sequence_number" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "header" (
    "id" SERIAL NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "header_sequence_number_key" ON "header"("sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageBanner_sequence_number_key" ON "HomepageBanner"("sequence_number");
