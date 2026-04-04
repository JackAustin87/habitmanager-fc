import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { teamName, password } = await req.json()

  if (!teamName || !password) {
    return NextResponse.json({ error: 'Club name and password required' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { teamName, isBot: false }
  })

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'Invalid club name or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid club name or password' }, { status: 401 })
  }

  const session = await getSession()
  session.userId = user.id
  session.userName = user.name ?? undefined
  session.userLevel = user.level
  await session.save()

  return NextResponse.json({ success: true })
}
