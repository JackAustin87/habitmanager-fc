import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getSession, rpID, origin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { response } = await req.json()
  const session = await getSession()

  if (!session.challenge || !session.userId) {
    return NextResponse.json({ error: 'No active challenge' }, { status: 400 })
  }

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: session.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Not verified' }, { status: 400 })
  }

  // In @simplewebauthn/server v9, registrationInfo contains credentialID, credentialPublicKey, counter directly
  const { credentialID, credentialPublicKey, counter } = verification.registrationInfo as {
    credentialID: Uint8Array
    credentialPublicKey: Uint8Array
    counter: number
  }

  await prisma.credential.create({
    data: {
      id: Buffer.from(credentialID).toString('base64url'),
      userId: session.userId,
      publicKey: Buffer.from(credentialPublicKey),
      counter: BigInt(counter),
      transports: (response.response?.transports as string[]) ?? [],
    },
  })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  session.userName = user?.name
  session.userLevel = user?.level
  session.challenge = undefined
  await session.save()

  return NextResponse.json({ verified: true })
}
