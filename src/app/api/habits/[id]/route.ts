import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const habit = await prisma.habit.findFirst({ where: { id, userId: session.userId } })
  if (!habit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const updated = await prisma.habit.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.category && { category: body.category }),
      ...(body.frequency && { frequency: body.frequency }),
      ...(body.scheduledDays && { scheduledDays: body.scheduledDays }),
      ...(body.scheduledTime !== undefined && { scheduledTime: body.scheduledTime }),
      ...(body.trackingType && { trackingType: body.trackingType }),
      ...(body.quantityUnit !== undefined && { quantityUnit: body.quantityUnit || null }),
      ...(body.quantityTarget !== undefined && { quantityTarget: body.quantityTarget ? Number(body.quantityTarget) : null }),
      ...(body.quantityUnit2 !== undefined && { quantityUnit2: body.quantityUnit2 || null }),
      ...(body.quantityTarget2 !== undefined && { quantityTarget2: body.quantityTarget2 ? Number(body.quantityTarget2) : null }),
      ...(body.xpReward !== undefined && { xpReward: Number(body.xpReward) }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const habit = await prisma.habit.findFirst({ where: { id, userId: session.userId } })
  if (!habit) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.habit.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
