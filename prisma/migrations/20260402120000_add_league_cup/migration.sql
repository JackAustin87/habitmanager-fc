-- Add new columns to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teamName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBot" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "botStrength" INTEGER NOT NULL DEFAULT 50;

-- Create Season table
CREATE TABLE IF NOT EXISTS "Season" (
  "id" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- Create LeagueMatch table
CREATE TABLE IF NOT EXISTS "LeagueMatch" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "matchday" INTEGER NOT NULL,
  "matchDate" DATE NOT NULL,
  "homeTeamId" TEXT NOT NULL,
  "awayTeamId" TEXT NOT NULL,
  "homeXp" INTEGER,
  "awayXp" INTEGER,
  "played" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeagueMatch_pkey" PRIMARY KEY ("id")
);

-- Create CupMatch table
CREATE TABLE IF NOT EXISTS "CupMatch" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "round" INTEGER NOT NULL,
  "matchNumber" INTEGER NOT NULL,
  "matchWeek" INTEGER NOT NULL,
  "homeTeamId" TEXT,
  "awayTeamId" TEXT,
  "homeXp" INTEGER,
  "awayXp" INTEGER,
  "winnerId" TEXT,
  "played" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CupMatch_pkey" PRIMARY KEY ("id")
);

-- Foreign keys for LeagueMatch
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_homeTeamId_fkey"
  FOREIGN KEY ("homeTeamId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_awayTeamId_fkey"
  FOREIGN KEY ("awayTeamId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys for CupMatch
ALTER TABLE "CupMatch" ADD CONSTRAINT "CupMatch_seasonId_fkey"
  FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CupMatch" ADD CONSTRAINT "CupMatch_homeTeamId_fkey"
  FOREIGN KEY ("homeTeamId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CupMatch" ADD CONSTRAINT "CupMatch_awayTeamId_fkey"
  FOREIGN KEY ("awayTeamId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
