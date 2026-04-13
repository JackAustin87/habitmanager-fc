import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      teamName: true,
      email: true,
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const {
    teamName,
    currentPassword,
    newPassword,
    calorieTarget,
    proteinTarget,
    carbsTarget,
    fatTarget,
  } = body as {
    teamName?: string
    currentPassword?: string
    newPassword?: string
    calorieTarget?: number
    proteinTarget?: number
    carbsTarget?: number
    fatTarget?: number
  }

  const updateData: Record<string, unknown> = {}

  // Validate and set teamName
  if (teamName !== undefined) {
    if (typeof teamName !== 'string' || teamName.trim().length === 0) {
      return NextResponse.json({ error: 'Team name cannot be empty' }, { status: 400 })
    }
    const existing = await prisma.user.findFirst({
      where: { teamName: teamName.trim(), id: { not: session.userId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Team name already taken' }, { status: 409 })
    }
    updateData.teamName = teamName.trim()
  }

  // Validate nutrition targets
  const nutritionFields = { calorieTarget, proteinTarget, carbsTarget, fatTarget }
  for (const [field, value] of Object.entries(nutritionFields)) {
    if (value !== undefined) {
      const num = Number(value)
      if (!Number.isInteger(num) || num <= 0) {
        return NextResponse.json({ error: `${field} must be a positive integer` }, { status: 400 })
      }
      updateData[field] = num
    }
  }

  // Handle password change
  if (currentPassword !== undefined || newPassword !== undefined) {
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both currentPassword and newPassword are required for a password change' },
        { status: 400 }
      )
    }
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true },
    })
    if (!user?.passwordHash) {
      return NextResponse.json({ error: 'No password set for this account' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    updateData.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: updateData,
    select: {
      teamName: true,
      email: true,
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete user — cascade deletes all related data (habits, completions, streaks, etc.)
  await prisma.user.delete({ where: { id: session.userId } })

  // Destroy session
  session.destroy()

  return NextResponse.json({ success: true })
}
