import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const settings = await prisma.notificationSettings.findUnique({ where: { userId: session.userId } })
  return NextResponse.json(settings ?? { emailEnabled: false, pushEnabled: false, dailyReminderTime: null, weeklyDigestDay: null })
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  let body: { emailEnabled?: boolean; pushEnabled?: boolean; dailyReminderTime?: string | null; weeklyDigestDay?: number | null }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const settings = await prisma.notificationSettings.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, ...body },
    update: body
  })
  return NextResponse.json(settings)
}
