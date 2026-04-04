import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('hmfc-session')

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/habits/:path*',
    '/league/:path*',
    '/cup/:path*',
    '/check-in/:path*',
    '/calendar/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/trophies/:path*',
    '/quotes/:path*',
    '/transfers/:path*',
    '/nutrition/:path*',
  ],
}
