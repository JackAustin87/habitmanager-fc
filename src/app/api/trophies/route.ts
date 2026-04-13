import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { TrophyType } from '@prisma/client'

// Determine which trophies a user has earned based on their current stats
async function getEarnedTrophyTypes(userId: string): Promise<TrophyType[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true },
  })

  // Count habit completions to check FIRST_HABIT and HABIT_MASTER
  const completionCount = await prisma.habitCompletion.count({
    where: { userId },
  })

  // Read longest streak from Streak records
  const streaks = await prisma.streak.findMany({
    where: { userId },
    select: { longestStreak: true },
  })
  const maxLongestStreak = streaks.reduce((max, s) => Math.max(max, s.longestStreak), 0)

  const totalXp = user?.totalXp ?? 0
  const earned: TrophyType[] = []

  if (completionCount >= 1) earned.push(TrophyType.FIRST_HABIT)
  if (maxLongestStreak >= 7) earned.push(TrophyType.STREAK_7)
  if (maxLongestStreak >= 30) earned.push(TrophyType.STREAK_30)
  if (maxLongestStreak >= 90) earned.push(TrophyType.STREAK_90)
  if (maxLongestStreak >= 365) earned.push(TrophyType.STREAK_365)
  if (totalXp >= 1000) earned.push(TrophyType.XP_1000)
  if (totalXp >= 10000) earned.push(TrophyType.XP_10000)
  if (completionCount >= 500) earned.push(TrophyType.HABIT_MASTER)

  return earned
}

// Award any not-yet-awarded trophies the user has earned
async function autoAward(userId: string): Promise<void> {
  const earnedTypes = await getEarnedTrophyTypes(userId)
  if (earnedTypes.length === 0) return

  const existing = await prisma.trophy.findMany({
    where: { userId },
    select: { type: true },
  })
  const existingTypes = new Set(existing.map((t) => t.type))

  for (const type of earnedTypes) {
    if (!existingTypes.has(type)) {
      await prisma.trophy.upsert({
        where: { userId_type: { userId, type } },
        create: { userId, type },
        update: {},
      })
    }
  }
}

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Auto-award any newly earned trophies before returning
  await autoAward(session.userId)

  const trophies = await prisma.trophy.findMany({
    where: { userId: session.userId },
    select: { type: true, awardedAt: true, metadata: true },
    orderBy: { awardedAt: 'asc' },
  })

  return NextResponse.json({ trophies })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { type } = body as { type?: string }

  if (!type || !Object.values(TrophyType).includes(type as TrophyType)) {
    return NextResponse.json({ error: 'Invalid trophy type' }, { status: 400 })
  }

  const trophy = await prisma.trophy.upsert({
    where: { userId_type: { userId: session.userId, type: type as TrophyType } },
    create: { userId: session.userId, type: type as TrophyType },
    update: {},
  })

  return NextResponse.json({ trophy })
}
