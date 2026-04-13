import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [items, user] = await Promise.all([
    prisma.rewardCatalogItem.findMany({
      where: { isActive: true },
      orderBy: { xpCost: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { spendableXp: true },
    }),
  ])

  return NextResponse.json({
    items,
    spendableXp: user?.spendableXp ?? 0,
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { itemId?: string }
  const { itemId } = body

  if (!itemId) {
    return NextResponse.json({ error: 'itemId required' }, { status: 400 })
  }

  const item = await prisma.rewardCatalogItem.findUnique({
    where: { id: itemId, isActive: true },
  })

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  // Atomic deduction: only succeeds if user has enough spendableXp
  const result = await prisma.$executeRaw`
    UPDATE "User" SET "spendableXp" = "spendableXp" - ${item.xpCost}
    WHERE id = ${session.userId} AND "spendableXp" >= ${item.xpCost}
  `

  if (result === 0) {
    return NextResponse.json({ error: 'insufficient_balance' }, { status: 400 })
  }

  await prisma.rewardPurchase.create({
    data: {
      userId: session.userId,
      rewardCatalogItemId: item.id,
      spendableXpDeducted: item.xpCost,
    },
  })

  const updatedUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { spendableXp: true },
  })

  return NextResponse.json({
    success: true,
    spendableXp: updatedUser?.spendableXp ?? 0,
  })
}
