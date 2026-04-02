import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { calculateHabitXp } from '@/lib/xp'
import { BonusType } from '@prisma/client'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const habit = await prisma.habit.findFirst({
    where: { id, userId: session.userId, isActive: true },
  })
  if (!habit) {
    return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const { quantity, quantity2, notes } = body as { quantity?: number; quantity2?: number; notes?: string }

  let personalBest: number | undefined
  if (habit.trackingType === 'QUANTITY') {
    const pbResult = await prisma.habitCompletion.aggregate({
      where: { habitId: habit.id },
      _max: { quantity: true },
    })
    personalBest = pbResult._max.quantity ?? undefined
  }

  const { xpEarned, bonusType: rawBonusType } = calculateHabitXp(
    habit.xpReward,
    habit.trackingType as 'BOOLEAN' | 'QUANTITY',
    quantity,
    habit.quantityTarget ?? undefined,
    personalBest
  )

  let bonusType: BonusType | null = null
  if (rawBonusType === 'PB_BONUS' || rawBonusType === 'PERSONAL_BEST') {
    bonusType = BonusType.PERSONAL_BEST
  } else if (rawBonusType && Object.values(BonusType).includes(rawBonusType as BonusType)) {
    bonusType = rawBonusType as BonusType
  }

  const completion = await prisma.habitCompletion.create({
    data: {
      habitId: habit.id,
      userId: session.userId,
      quantity: quantity ?? null,
      quantity2: quantity2 ?? null,
      xpEarned,
      bonusType: bonusType,
      notes: notes ?? null,
    },
  })

  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: {
      totalXp: { increment: xpEarned },
      currentSeasonXp: { increment: xpEarned },
    },
  })

  return NextResponse.json({
    success: true,
    xpEarned,
    bonusType,
    totalXp: updatedUser.totalXp,
    completion,
  })
}
