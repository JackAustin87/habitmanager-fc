-- Phase 6: Transfer Market + Book Quotes
-- Add GlobalQuote table for daily rotating quotes
CREATE TABLE IF NOT EXISTS "GlobalQuote" (
  "id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "bookTitle" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GlobalQuote_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on text to support upsert idempotency
CREATE UNIQUE INDEX IF NOT EXISTS "GlobalQuote_text_key" ON "GlobalQuote"("text");

-- Add RewardCatalogItem table (purchasable rewards shop)
CREATE TABLE IF NOT EXISTS "RewardCatalogItem" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "xpCost" INTEGER NOT NULL,
  "effectType" TEXT NOT NULL,
  "effectDuration" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "RewardCatalogItem_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on name to support upsert idempotency
CREATE UNIQUE INDEX IF NOT EXISTS "RewardCatalogItem_name_key" ON "RewardCatalogItem"("name");

-- Add RewardPurchase table (tracks purchases by users)
CREATE TABLE IF NOT EXISTS "RewardPurchase" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rewardCatalogItemId" TEXT NOT NULL,
  "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "spendableXpDeducted" INTEGER NOT NULL,
  CONSTRAINT "RewardPurchase_pkey" PRIMARY KEY ("id")
);

-- Foreign keys for RewardPurchase
ALTER TABLE "RewardPurchase" ADD CONSTRAINT "RewardPurchase_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RewardPurchase" ADD CONSTRAINT "RewardPurchase_rewardCatalogItemId_fkey"
  FOREIGN KEY ("rewardCatalogItemId") REFERENCES "RewardCatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
