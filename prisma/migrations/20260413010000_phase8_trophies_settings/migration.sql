-- Phase 8: Trophy Cabinet + Settings
-- Create TrophyType enum
CREATE TYPE "TrophyType" AS ENUM (
  'STREAK_7',
  'STREAK_30',
  'STREAK_90',
  'STREAK_365',
  'XP_1000',
  'XP_10000',
  'CUP_WINNER',
  'LEAGUE_CHAMPION',
  'HABIT_MASTER',
  'FIRST_HABIT'
);

-- Create Trophy table
CREATE TABLE IF NOT EXISTS "Trophy" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "TrophyType" NOT NULL,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "Trophy_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one trophy per type per user (idempotent awards)
CREATE UNIQUE INDEX IF NOT EXISTS "Trophy_userId_type_key" ON "Trophy"("userId", "type");

-- Foreign key: Trophy -> User
ALTER TABLE "Trophy" ADD CONSTRAINT "Trophy_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add nutrition target fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "calorieTarget" INTEGER NOT NULL DEFAULT 2200;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "proteinTarget" INTEGER NOT NULL DEFAULT 150;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "carbsTarget" INTEGER NOT NULL DEFAULT 250;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fatTarget" INTEGER NOT NULL DEFAULT 65;
