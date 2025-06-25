-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "currency_symbol" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "facebook_icon" TEXT,
    "facebook_link" TEXT,
    "instagram_icon" TEXT,
    "instagram_link" TEXT,
    "twitter_icon" TEXT,
    "twitter_link" TEXT,
    "linkedin_icon" TEXT,
    "linkedin_link" TEXT,
    "product_low_stock_threshold" INTEGER NOT NULL,
    "minimum_order_quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);
