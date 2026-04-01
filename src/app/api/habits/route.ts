import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') as 'WORK' | 'PERSONAL' | null
  const frequency = searchParams.get('frequency') as 'DAILY' | 'WEEKLY' | 'ALTERNATING' | null

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.userId,
      isActive: true,
      ...(category && { category }),
      ...(frequency && { frequency }),
    },
    orderBy: { createdAt: 'asc' },
    include: {
      completions: {
        orderBy: { completedAt: 'desc' },
        take: 30,
      },
    },
  })

  return NextResponse.json(habits)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, description, category, frequency, scheduledDays, scheduledTime, trackingType, quantityUnit, quantityTarget, xpReward } = body

  if (!name || !category || !frequency) {
    return NextResponse.json({ error: 'Name, category, and frequency are required' }, { status: 400 })
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.userId,
      name,
      description: description || null,
      category,
      frequency,
      scheduledDays: scheduledDays || [],
      scheduledTime: scheduledTime || null,
      trackingType: trackingType || 'BOOLEAN',
      quantityUnit: quantityUnit || null,
      quantityTarget: quantityTarget ? Number(quantityTarget) : null,
      xpReward: xpReward ? Number(xpReward) : 10,
    },
  })

  return NextResponse.json(habit, { status: 201 })
}
