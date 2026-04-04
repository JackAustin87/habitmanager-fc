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
    const realCount = await prisma.user.count({
      where: { isBot: false, teamName: { not: null } }
    })
    return NextResponse.json({ season: null, table: [], realUserCount: realCount })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Lazy: process unplayed matches where matchDate <= today
  const unplayed = await prisma.leagueMatch.findMany({
    where: { seasonId: season.id, played: false, matchDate: { lte: today } },
    include: { homeTeam: true, awayTeam: true }
  })

  for (const match of unplayed) {
    let homeXp: number
    let awayXp: number

    if (match.homeTeam.isBot) {
      homeXp = Math.round(match.homeTeam.botStrength * (0.5 + seededRand(match.id + 'home')))
    } else {
      const dayStart = new Date(match.matchDate)
      const dayEnd = new Date(match.matchDate)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const agg = await prisma.habitCompletion.aggregate({
        where: { userId: match.homeTeamId, completedAt: { gte: dayStart, lt: dayEnd } },
        _sum: { xpEarned: true }
      })
      homeXp = agg._sum.xpEarned ?? 0
    }

    if (match.awayTeam.isBot) {
      awayXp = Math.round(match.awayTeam.botStrength * (0.5 + seededRand(match.id + 'away')))
    } else {
      const dayStart = new Date(match.matchDate)
      const dayEnd = new Date(match.matchDate)
      dayEnd.setDate(dayEnd.getDate() + 1)
      const agg = await prisma.habitCompletion.aggregate({
        where: { userId: match.awayTeamId, completedAt: { gte: dayStart, lt: dayEnd } },
        _sum: { xpEarned: true }
      })
      awayXp = agg._sum.xpEarned ?? 0
    }

    await prisma.leagueMatch.update({
      where: { id: match.id },
      data: { homeXp, awayXp, played: true }
    })
  }

  // Compute league table
  const allMatches = await prisma.leagueMatch.findMany({
    where: { seasonId: season.id, played: true }
  })

  const teams = await prisma.user.findMany({
    where: { teamName: { not: null } }
  })

  const table = teams.map(team => {
    const homeMatches = allMatches.filter(m => m.homeTeamId === team.id)
    const awayMatches = allMatches.filter(m => m.awayTeamId === team.id)
    let played = 0, won = 0, drawn = 0, lost = 0, xpFor = 0, xpAgainst = 0

    for (const m of homeMatches) {
      played++
      xpFor += m.homeXp ?? 0
      xpAgainst += m.awayXp ?? 0
      if ((m.homeXp ?? 0) > (m.awayXp ?? 0)) won++
      else if ((m.homeXp ?? 0) === (m.awayXp ?? 0)) drawn++
      else lost++
    }
    for (const m of awayMatches) {
      played++
      xpFor += m.awayXp ?? 0
      xpAgainst += m.homeXp ?? 0
      if ((m.awayXp ?? 0) > (m.homeXp ?? 0)) won++
      else if ((m.awayXp ?? 0) === (m.homeXp ?? 0)) drawn++
      else lost++
    }

    return {
      teamId: team.id,
      teamName: team.teamName!,
      isBot: team.isBot,
      played,
      won,
      drawn,
      lost,
      xpFor,
      xpAgainst,
      xpDiff: xpFor - xpAgainst,
      points: won * 3 + drawn,
    }
  })

  table.sort((a, b) => b.points - a.points || b.xpDiff - a.xpDiff || b.xpFor - a.xpFor)

  return NextResponse.json({ season, table, currentUserId: session.userId })
}
