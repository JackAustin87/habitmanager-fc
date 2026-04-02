import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const checkIns = await prisma.dailyCheckIn.findMany({
    where: { userId: session.userId, date: { gte: sixtyDaysAgo } },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(checkIns)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { weight, weightUnit, mood, tiredness, sleepHours, energyLevel, restingHeartRate, notes } = body

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const data = {
    weight: weight !== undefined && weight !== '' ? parseFloat(weight) : null,
    weightUnit: weightUnit || 'KG',
    mood: mood !== undefined && mood !== '' ? parseInt(mood) : null,
    tiredness: tiredness !== undefined && tiredness !== '' ? parseInt(tiredness) : null,
    sleepHours: sleepHours !== undefined && sleepHours !== '' ? parseFloat(sleepHours) : null,
    energyLevel: energyLevel !== undefined && energyLevel !== '' ? parseInt(energyLevel) : null,
    restingHeartRate: restingHeartRate !== undefined && restingHeartRate !== '' ? parseInt(restingHeartRate) : null,
    notes: notes || null,
  }

  const checkIn = await prisma.dailyCheckIn.upsert({
    where: { userId_date: { userId: session.userId, date: today } },
    create: { userId: session.userId, date: today, ...data },
    update: data,
  })

  return NextResponse.json(checkIn)
}
