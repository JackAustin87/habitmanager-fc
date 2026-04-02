-- Migration: add_stats_and_health
-- Adds dual-metric support, stats fields, and resting heart rate tracking

-- HabitCompletion: upgrade quantity from integer to decimal, add second metric
ALTER TABLE "HabitCompletion" ALTER COLUMN "quantity" TYPE DOUBLE PRECISION;
ALTER TABLE "HabitCompletion" ADD COLUMN "quantity2" DOUBLE PRECISION;

-- Habit: add second metric unit and target
ALTER TABLE "Habit" ADD COLUMN "quantityUnit2" TEXT;
ALTER TABLE "Habit" ADD COLUMN "quantityTarget2" DOUBLE PRECISION;

-- DailyCheckIn: add resting heart rate
ALTER TABLE "DailyCheckIn" ADD COLUMN "restingHeartRate" INTEGER;
