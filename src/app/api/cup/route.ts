import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function seededRand(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822519)
  h = Math.imul(h ^ (h >>> 13), 3266489917)
  h = (h ^ (h >>> 16)) >>> 0
  return h / 4294967295
}

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const season = await prisma.season.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  if (!season) {
    return NextResponse.json({ season: null, rounds: [], currentUserId: session.userId })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const seasonStart = new Date(season.startDate)
  seasonStart.setHours(0, 0, 0, 0)
  const daysSinceStart = Math.floor((today.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24))

  // Process cup rounds that are due (each round = 1 week = 7 days)
  for (let round = 1; round <= 4; round++) {
    const weekEnd = round * 7
    if (daysSinceStart < weekEnd) break

    const roundMatches = await prisma.cupMatch.findMany({
      where: { seasonId: season.id, round, played: false },
      include: { homeTeam: true, awayTeam: true }
    })

    for (const match of roundMatches) {
      if (!match.homeTeamId || !match.awayTeamId) continue

      const weekStartMs = seasonStart.getTime() + (round - 1) * 7 * 24 * 60 * 60 * 1000
      const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000
      const weekStartDate = new Date(weekStartMs)
      const weekEndDate = new Date(weekEndMs)

      let homeXp: number
      let awayXp: number

      if (match.homeTeam && match.homeTeam.isBot) {
        homeXp = Math.round(match.homeTeam.botStrength * 7 * (0.7 + seededRand(match.id + 'h') * 0.6))
      } else {
        const agg = await prisma.habitCompletion.aggregate({
          where: { userId: match.homeTeamId, completedAt: { gte: weekStartDate, lt: weekEndDate } },
          _sum: { xpEarned: true }
        })
        homeXp = agg._sum.xpEarned ?? 0
      }

      if (match.awayTeam && match.awayTeam.isBot) {
        awayXp = Math.round(match.awayTeam.botStrength * 7 * (0.7 + seededRand(match.id + 'a') * 0.6))
      } else {
        const agg = await prisma.habitCompletion.aggregate({
          where: { userId: match.awayTeamId, completedAt: { gte: weekStartDate, lt: weekEndDate } },
          _sum: { xpEarned: true }
        })
        awayXp = agg._sum.xpEarned ?? 0
      }

      const winnerId = homeXp >= awayXp ? match.homeTeamId : match.awayTeamId

      await prisma.cupMatch.update({
        where: { id: match.id },
        data: { homeXp, awayXp, winnerId, played: true }
      })

      // Advance winner to next round
      if (round < 4) {
        const nextRound = round + 1
        const nextMatchNumber = Math.ceil(match.matchNumber / 2)
        const isHomeSlot = match.matchNumber % 2 !== 0

        const nextMatch = await prisma.cupMatch.findFirst({
          where: { seasonId: season.id, round: nextRound, matchNumber: nextMatchNumber }
        })

        if (nextMatch) {
          await prisma.cupMatch.update({
            where: { id: nextMatch.id },
            data: isHomeSlot ? { homeTeamId: winnerId } : { awayTeamId: winnerId }
          })
        } else {
          await prisma.cupMatch.create({
            data: {
              seasonId: season.id,
              round: nextRound,
              matchNumber: nextMatchNumber,
              matchWeek: nextRound,
              homeTeamId: isHomeSlot ? winnerId : null,
              awayTeamId: isHomeSlot ? null : winnerId,
            }
          })
        }
      }
    }
  }

  const allCupMatches = await prisma.cupMatch.findMany({
    where: { seasonId: season.id },
    include: { homeTeam: true, awayTeam: true },
    orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }]
  })

  return NextResponse.json({ season, rounds: allCupMatches, currentUserId: session.userId })
}
