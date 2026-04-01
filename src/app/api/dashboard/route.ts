import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const todayIndex = new Date().getDay() // 0 = Sunday, 1 = Monday, ...

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.userId,
      isActive: true,
      OR: [
        { frequency: 'DAILY' },
        { frequency: 'WEEKLY', scheduledDays: { has: todayIndex } },
        { frequency: 'ALTERNATING', scheduledDays: { has: todayIndex } },
      ],
    },
    include: {
      completions: {
        where: { completedAt: { gte: startOfToday } },
        orderBy: { completedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { totalXp: true, level: true },
  })

  const XP_PER_LEVEL = 500
  const totalXp = user?.totalXp ?? 0
  const currentLevelXp = totalXp % XP_PER_LEVEL
  const progressPercent = Math.round((currentLevelXp / XP_PER_LEVEL) * 100)

  const habitsWithStatus = habits.map(h => ({
    id: h.id,
    name: h.name,
    category: h.category,
    xpReward: h.xpReward,
    trackingType: h.trackingType,
    quantityTarget: h.quantityTarget,
    quantityUnit: h.quantityUnit,
    completedToday: h.completions.length > 0,
    completedAt: h.completions[0]?.completedAt ?? null,
  }))

  const completedCount = habitsWithStatus.filter(h => h.completedToday).length

  return NextResponse.json({
    habits: habitsWithStatus,
    user: {
      xp: totalXp,
      level: user?.level ?? 1,
      currentLevelXp,
      xpToNextLevel: XP_PER_LEVEL,
      progressPercent,
    },
    stats: {
      completedToday: completedCount,
      remainingToday: habitsWithStatus.length - completedCount,
      totalToday: habitsWithStatus.length,
    },
  })
}
