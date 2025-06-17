-- CreateTable
CREATE TABLE "HomepageBanner" (
    "id" SERIAL NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT,
    "subheading2" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "imageUrl" TEXT,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "HomepageBanner_pkey" PRIMARY KEY ("id")
);
