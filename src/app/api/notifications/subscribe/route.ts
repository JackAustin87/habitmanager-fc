import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const { endpoint, keys } = body
  if (!endpoint || !keys?.p256dh || !keys?.auth) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: session.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { p256dh: keys.p256dh, auth: keys.auth }
  })
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session.userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
  await prisma.pushSubscription.deleteMany({ where: { userId: session.userId, endpoint } })
  return NextResponse.json({ ok: true })
}
