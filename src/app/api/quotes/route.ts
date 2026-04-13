import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  const quotes = await prisma.globalQuote.findMany({
    orderBy: { createdAt: 'asc' },
  })

  if (all) {
    const todayIndex = quotes.length > 0
      ? Math.floor(Date.now() / 86400000) % quotes.length
      : -1
    return NextResponse.json({ quotes, todayIndex })
  }

  if (quotes.length === 0) {
    return NextResponse.json({ text: '', author: '', bookTitle: '' })
  }

  const index = Math.floor(Date.now() / 86400000) % quotes.length
  return NextResponse.json(quotes[index])
}
