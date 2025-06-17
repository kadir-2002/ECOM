-- CreateTable
CREATE TABLE "WhyChooseUsItem" (
    "id" SERIAL NOT NULL,
    "mainTitle" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhyChooseUsItem_pkey" PRIMARY KEY ("id")
);
