import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getSession, rpID } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email } = body as { email?: string }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allowCredentials: any[] = []

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const creds = await prisma.credential.findMany({ where: { userId: user.id } })
      allowCredentials = creds.map((c) => ({
        id: c.id,
        type: 'public-key' as const,
      }))
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: 'preferred',
  })

  const session = await getSession()
  session.challenge = options.challenge
  await session.save()

  return NextResponse.json(options)
}
