import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const user = await prisma.user.findFirst()
  if (!user) {
    return NextResponse.json({ error: 'No user found' }, { status: 500 })
  }

  const session = await getSession()
  session.userId = user.id
  session.userName = user.name ?? undefined
  session.userLevel = user.level
  await session.save()

  return NextResponse.json({ success: true })
}
