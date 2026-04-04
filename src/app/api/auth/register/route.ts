import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { teamName, password } = await req.json()

  if (!teamName || !password) {
    return NextResponse.json({ error: 'Club name and password required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  // Max 2 real managers
  const realCount = await prisma.user.count({
    where: { isBot: false, teamName: { not: null } }
  })
  if (realCount >= 2) {
    return NextResponse.json({ error: 'The league is full. Only 2 managers allowed.' }, { status: 400 })
  }

  // Club name must be unique
  const existing = await prisma.user.findFirst({ where: { teamName } })
  if (existing) {
    return NextResponse.json({ error: 'That club name is already taken' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: teamName,
      email: `manager.${Date.now()}@habitmanager.internal`,
      teamName,
      passwordHash,
      isBot: false,
    }
  })

  const session = await getSession()
  session.userId = user.id
  session.userName = user.name ?? undefined
  session.userLevel = user.level
  await session.save()

  return NextResponse.json({ success: true })
}
