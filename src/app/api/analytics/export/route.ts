import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.userId

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'json'

  const completions = await prisma.habitCompletion.findMany({
    where: { userId },
    orderBy: { completedAt: 'asc' },
    select: {
      completedAt: true,
      xpEarned: true,
      habit: { select: { name: true, category: true } },
    },
  })

  const rows = completions.map(c => ({
    date: c.completedAt.toISOString().split('T')[0],
    habitName: c.habit.name,
    category: c.habit.category,
    xpEarned: c.xpEarned,
  }))

  if (format === 'csv') {
    const header = 'date,habitName,category,xpEarned'
    const csvRows = rows.map(r =>
      `${r.date},"${r.habitName.replace(/"/g, '""')}",${r.category},${r.xpEarned}`
    )
    const csv = [header, ...csvRows].join('\n')
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="habits-export.csv"',
      },
    })
  }

  // JSON format
  return new NextResponse(JSON.stringify(rows, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="habits-export.json"',
    },
  })
}
