import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const year = parseInt(searchParams.get('year') ?? String(now.getUTCFullYear()), 10)
  const month = parseInt(searchParams.get('month') ?? String(now.getUTCMonth() + 1), 10)

  // Validate ranges
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 })
  }

  const start = new Date(Date.UTC(year, month - 1, 1))      // first day of month UTC midnight
  const end = new Date(Date.UTC(year, month, 1))             // first day of next month UTC midnight

  const completions = await prisma.habitCompletion.findMany({
    where: {
      userId: session.userId,
      completedAt: { gte: start, lt: end },
    },
    include: {
      habit: {
        select: { name: true, category: true },
      },
    },
    orderBy: { completedAt: 'asc' },
  })

  // Group by UTC day-of-month
  const days: Record<string, Array<{ habitId: string; habitName: string; category: string }>> = {}
  for (const c of completions) {
    const dayKey = String(c.completedAt.getUTCDate())
    if (!days[dayKey]) days[dayKey] = []
    days[dayKey].push({
      habitId: c.habitId,
      habitName: c.habit.name,
      category: c.habit.category,
    })
  }

  return NextResponse.json({ year, month, days })
}
