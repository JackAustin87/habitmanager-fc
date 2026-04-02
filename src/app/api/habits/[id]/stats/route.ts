import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.userId },
  })
  if (!habit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const completions = await prisma.habitCompletion.findMany({
    where: { habitId: id },
    orderBy: { completedAt: 'desc' },
  })

  const streak = await prisma.streak.findUnique({ where: { habitId: id } })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const qCompletions = completions.filter(c => c.quantity !== null)
  const recentQ = qCompletions.filter(c => new Date(c.completedAt) >= thirtyDaysAgo)

  const personalBest = qCompletions.length > 0
    ? Math.max(...qCompletions.map(c => c.quantity as number))
    : null

  const avg30 = recentQ.length > 0
    ? Math.round((recentQ.reduce((s, c) => s + (c.quantity as number), 0) / recentQ.length) * 10) / 10
    : null

  const q2Completions = completions.filter(c => c.quantity2 !== null)
  const recentQ2 = q2Completions.filter(c => new Date(c.completedAt) >= thirtyDaysAgo)

  const personalBest2 = q2Completions.length > 0
    ? Math.max(...q2Completions.map(c => c.quantity2 as number))
    : null

  const avg30_2 = recentQ2.length > 0
    ? Math.round((recentQ2.reduce((s, c) => s + (c.quantity2 as number), 0) / recentQ2.length) * 10) / 10
    : null

  return NextResponse.json({
    habit,
    completions,
    stats: {
      totalCompletions: completions.length,
      personalBest,
      avg30,
      personalBest2,
      avg30_2,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    },
  })
}
