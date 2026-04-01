import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getSession, rpName, rpID } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
  }

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({ data: { name, email } })
  }

  const existingCredentials = await prisma.credential.findMany({
    where: { userId: user.id },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excludeCredentials: any[] = existingCredentials.map((c) => ({
    id: c.id,
    type: 'public-key' as const,
  }))

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.email,
    userDisplayName: user.name,
    excludeCredentials,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: false,
      userVerification: 'preferred',
    },
  })

  const session = await getSession()
  session.challenge = options.challenge
  session.userId = user.id
  await session.save()

  return NextResponse.json(options)
}
