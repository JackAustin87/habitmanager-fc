import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getSession, rpID, origin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { response } = await req.json()
  const session = await getSession()

  if (!session.challenge) {
    return NextResponse.json({ error: 'No active challenge' }, { status: 400 })
  }

  const credential = await prisma.credential.findUnique({ where: { id: response.id } })
  if (!credential) {
    return NextResponse.json({ error: 'Credential not found' }, { status: 400 })
  }

  let verification
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: any = {
      response,
      expectedChallenge: session.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: credential.id,
        credentialPublicKey: new Uint8Array(credential.publicKey),
        counter: Number(credential.counter),
      },
    }
    verification = await verifyAuthenticationResponse(opts)
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  if (!verification.verified) {
    return NextResponse.json({ error: 'Not verified' }, { status: 400 })
  }

  await prisma.credential.update({
    where: { id: credential.id },
    data: { counter: BigInt(verification.authenticationInfo.newCounter) },
  })

  const user = await prisma.user.findUnique({ where: { id: credential.userId } })
  session.userId = user?.id
  session.userName = user?.name
  session.userLevel = user?.level
  session.challenge = undefined
  await session.save()

  return NextResponse.json({ verified: true })
}
