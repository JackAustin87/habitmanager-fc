import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getISOWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayOfWeek = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.userId

  const now = new Date()

  // --- xpOverTime: last 90 days ---
  const day90ago = new Date(now)
  day90ago.setDate(day90ago.getDate() - 90)

  const completions90 = await prisma.habitCompletion.findMany({
    where: { userId, completedAt: { gte: day90ago } },
    select: { completedAt: true, xpEarned: true },
  })
  const xpByDate = new Map<string, number>()
  for (const c of completions90) {
    const key = toISODate(c.completedAt)
    xpByDate.set(key, (xpByDate.get(key) ?? 0) + c.xpEarned)
  }
  const xpOverTime = Array.from(xpByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, xp]) => ({ date, xp }))

  // --- completionByCategory: all time ---
  const allCompletions = await prisma.habitCompletion.findMany({
    where: { userId },
    select: { habit: { select: { category: true } } },
  })
  const catMap = new Map<string, number>()
  for (const c of allCompletions) {
    const cat = c.habit.category
    catMap.set(cat, (catMap.get(cat) ?? 0) + 1)
  }
  const completionByCategory = Array.from(catMap.entries()).map(([category, count]) => ({ category, count }))

  // --- streakHistory: last 365 days ---
  const day365ago = new Date(now)
  day365ago.setDate(day365ago.getDate() - 365)
  const completions365 = await prisma.habitCompletion.findMany({
    where: { userId, completedAt: { gte: day365ago } },
    select: { completedAt: true },
  })
  const streakMap = new Map<string, number>()
  for (const c of completions365) {
    const key = toISODate(c.completedAt)
    streakMap.set(key, (streakMap.get(key) ?? 0) + 1)
  }
  const streakHistory = Array.from(streakMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  // --- xpByHabit: top 10 ---
  const habitCompletions = await prisma.habitCompletion.findMany({
    where: { userId },
    select: { xpEarned: true, habit: { select: { name: true } } },
  })
  const habitXpMap = new Map<string, number>()
  for (const c of habitCompletions) {
    const name = c.habit.name
    habitXpMap.set(name, (habitXpMap.get(name) ?? 0) + c.xpEarned)
  }
  const xpByHabit = Array.from(habitXpMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([habitName, totalXp]) => ({ habitName, totalXp }))

  // --- leagueWDL ---
  const matches = await prisma.leagueMatch.findMany({
    where: {
      played: true,
      OR: [{ homeTeamId: userId }, { awayTeamId: userId }],
    },
    select: { homeTeamId: true, awayTeamId: true, homeXp: true, awayXp: true },
  })
  let wins = 0, draws = 0, losses = 0
  for (const m of matches) {
    const homeXp = m.homeXp ?? 0
    const awayXp = m.awayXp ?? 0
    const isHome = m.homeTeamId === userId
    const myXp = isHome ? homeXp : awayXp
    const oppXp = isHome ? awayXp : homeXp
    if (myXp > oppXp) wins++
    else if (myXp === oppXp) draws++
    else losses++
  }
  const leagueWDL = { wins, draws, losses }

  // --- weeklyXp: last 12 weeks ---
  const week12ago = new Date(now)
  week12ago.setDate(week12ago.getDate() - 84)

  const userWeeklyCompletions = await prisma.habitCompletion.findMany({
    where: { userId, completedAt: { gte: week12ago } },
    select: { completedAt: true, xpEarned: true },
  })
  const userWeekMap = new Map<string, number>()
  for (const c of userWeeklyCompletions) {
    const week = getISOWeek(c.completedAt)
    userWeekMap.set(week, (userWeekMap.get(week) ?? 0) + c.xpEarned)
  }

  // Average XP across all users for the same weeks
  const allWeeklyCompletions = await prisma.habitCompletion.findMany({
    where: { completedAt: { gte: week12ago } },
    select: { completedAt: true, xpEarned: true, userId: true },
  })
  // Group by week + userId to get per-user totals, then average
  const allWeekUserMap = new Map<string, Map<string, number>>()
  for (const c of allWeeklyCompletions) {
    const week = getISOWeek(c.completedAt)
    if (!allWeekUserMap.has(week)) allWeekUserMap.set(week, new Map())
    const uMap = allWeekUserMap.get(week)!
    uMap.set(c.userId, (uMap.get(c.userId) ?? 0) + c.xpEarned)
  }

  // Build the ordered list of last 12 weeks
  const weeks: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    weeks.push(getISOWeek(d))
  }
  const uniqueWeeks = [...new Set(weeks)]

  const weeklyXp = uniqueWeeks.map(week => {
    const userXp = userWeekMap.get(week) ?? 0
    const weekUsers = allWeekUserMap.get(week)
    let avgXp = 0
    if (weekUsers && weekUsers.size > 0) {
      const total = Array.from(weekUsers.values()).reduce((a, b) => a + b, 0)
      avgXp = Math.round(total / weekUsers.size)
    }
    return { week, userXp, avgXp }
  })

  // --- completionByHour ---
  const allUserCompletions = await prisma.habitCompletion.findMany({
    where: { userId },
    select: { completedAt: true },
  })
  const hourMap = new Map<number, number>()
  for (const c of allUserCompletions) {
    const hour = c.completedAt.getUTCHours()
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1)
  }
  const completionByHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourMap.get(hour) ?? 0,
  }))

  // --- totalStats ---
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true, level: true, teamName: true },
  })

  const totalStats = {
    totalXp: user?.totalXp ?? 0,
    totalCompletions: allUserCompletions.length,
    currentLevel: user?.level ?? 1,
    teamName: user?.teamName ?? '',
  }

  return NextResponse.json({
    xpOverTime,
    completionByCategory,
    streakHistory,
    xpByHabit,
    leagueWDL,
    weeklyXp,
    completionByHour,
    totalStats,
  })
}
