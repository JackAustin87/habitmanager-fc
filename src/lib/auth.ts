import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  userName?: string
  userLevel?: number
  challenge?: string
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'hmfc-session',
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export const rpName = process.env.WEBAUTHN_RP_NAME || 'HabitManager FC'
export const rpID = process.env.WEBAUTHN_RP_ID || 'localhost'
export const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000'
