import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const season = await prisma.season.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  const realCount = await prisma.user.count({
    where: { isBot: false, teamName: { not: null } }
  })

  return NextResponse.json({ season: season ?? null, realUserCount: realCount })
}

export async function POST() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const teams = await prisma.user.findMany({
    where: { teamName: { not: null } },
    orderBy: { createdAt: 'asc' }
  })

  if (teams.length !== 16) {
    const realCount = teams.filter(t => !t.isBot).length
    return NextResponse.json({
      error: `Need 16 teams to start. Currently have ${teams.length} (${realCount} real, ${teams.length - realCount} bots).`
    }, { status: 400 })
  }

  // Deactivate existing seasons
  await prisma.season.updateMany({ where: { isActive: true }, data: { isActive: false } })

  const lastSeason = await prisma.season.findFirst({ orderBy: { number: 'desc' } })
  const seasonNumber = (lastSeason?.number ?? 0) + 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 29)

  const season = await prisma.season.create({
    data: { number: seasonNumber, startDate: today, endDate, isActive: true }
  })

  // Generate 30-round league schedule using circle algorithm
  const schedule = generateRoundRobin(teams)
  const leagueMatches = []
  for (let round = 0; round < 30; round++) {
    const matchDate = new Date(today)
    matchDate.setDate(matchDate.getDate() + round)
    for (const match of schedule[round]) {
      leagueMatches.push({
        seasonId: season.id,
        matchday: round + 1,
        matchDate,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
      })
    }
  }
  await prisma.leagueMatch.createMany({ data: leagueMatches })

  // Generate Cup Round 1 - random draw of all 16 teams
  const shuffled = shuffle([...teams])
  const cupMatches = []
  for (let i = 0; i < 8; i++) {
    cupMatches.push({
      seasonId: season.id,
      round: 1,
      matchNumber: i + 1,
      matchWeek: 1,
      homeTeamId: shuffled[i * 2].id,
      awayTeamId: shuffled[i * 2 + 1].id,
    })
  }
  await prisma.cupMatch.createMany({ data: cupMatches })

  return NextResponse.json({ success: true, season })
}

function generateRoundRobin(teams: { id: string }[]): { homeTeamId: string; awayTeamId: string }[][] {
  const n = teams.length // 16
  const rounds: { homeTeamId: string; awayTeamId: string }[][] = []
  const fixed = teams[0]
  const rotating = [...teams.slice(1)]

  for (let round = 0; round < n - 1; round++) {
    const matches: { homeTeamId: string; awayTeamId: string }[] = []
    if (round % 2 === 0) {
      matches.push({ homeTeamId: fixed.id, awayTeamId: rotating[0].id })
    } else {
      matches.push({ homeTeamId: rotating[0].id, awayTeamId: fixed.id })
    }
    for (let i = 0; i < n / 2 - 1; i++) {
      matches.push({
        homeTeamId: rotating[i + 1].id,
        awayTeamId: rotating[n - 2 - i].id,
      })
    }
    rounds.push(matches)
    rotating.unshift(rotating.pop()!)
  }

  // Second leg: swap home/away
  const firstLeg = [...rounds]
  for (const round of firstLeg) {
    rounds.push(round.map(m => ({ homeTeamId: m.awayTeamId, awayTeamId: m.homeTeamId })))
  }

  return rounds
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
