'use client'

import { useState, useEffect, useCallback } from 'react'
import StatPanel from '@/components/layout/StatPanel'

interface HabitItem {
  id: string
  name: string
  category: string
  xpReward: number
  trackingType: string
  quantityTarget: number | null
  quantityUnit: string | null
  completedToday: boolean
  completedAt: string | null
}

interface UserStats {
  xp: number
  level: number
  currentLevelXp: number
  xpToNextLevel: number
  progressPercent: number
}

interface DashboardStats {
  completedToday: number
  remainingToday: number
  totalToday: number
}

interface DashboardData {
  habits: HabitItem[]
  user: UserStats
  stats: DashboardStats
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [completing, setCompleting] = useState<string | null>(null)
  const [xpFlash, setXpFlash] = useState<{ id: string; xp: number } | null>(null)

  const fetchDashboard = useCallback(async () => {
    const res = await fetch('/api/dashboard')
    if (res.ok) {
      const json = await res.json()
      setData(json)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  async function handleComplete(habit: HabitItem) {
    if (habit.completedToday || completing === habit.id) return
    setCompleting(habit.id)
    try {
      const res = await fetch(`/api/habits/${habit.id}/complete`, { method: 'POST' })
      if (res.ok) {
        const result = await res.json()
        setXpFlash({ id: habit.id, xp: result.xpEarned })
        setTimeout(() => setXpFlash(null), 2000)
        await fetchDashboard()
      }
    } finally {
      setCompleting(null)
    }
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-fm-gold animate-pulse">Loading match day...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-900/40 border border-blue-700/50 rounded p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-fm-gold font-bold text-lg">
            LEVEL {data.user.level}
          </span>
          <span className="text-blue-300 text-sm">
            {data.user.currentLevelXp} / {data.user.xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-blue-950 rounded-full h-3">
          <div
            className="bg-fm-gold h-3 rounded-full transition-all duration-500"
            style={{ width: `${data.user.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatPanel label="Done Today" value={String(data.stats.completedToday)} />
        <StatPanel label="Remaining" value={String(data.stats.remainingToday)} />
        <StatPanel label="Total XP" value={String(data.user.xp)} />
      </div>

      <div className="bg-blue-900/20 border border-blue-700/30 rounded">
        <div className="bg-blue-900/60 px-4 py-2 border-b border-blue-700/50">
          <h2 className="text-fm-gold font-bold text-sm uppercase tracking-wide">
            Match Day
          </h2>
        </div>

        {data.habits.length === 0 ? (
          <div className="px-4 py-8 text-center text-blue-400 text-sm">
            No habits scheduled for today. Add some from the Squad screen.
          </div>
        ) : (
          <div className="divide-y divide-blue-800/30">
            {data.habits.map((habit) => (
              <div
                key={habit.id}
                className={`flex items-center justify-between px-4 py-3 transition-colors ${
                  habit.completedToday ? 'bg-green-900/20' : 'hover:bg-blue-800/20'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {habit.completedToday && (
                      <span className="text-fm-green text-lg">&#10003;</span>
                    )}
                    <span className={`font-medium text-sm ${habit.completedToday ? 'text-fm-green' : 'text-white'}`}>
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-blue-400 text-xs">{habit.category}</span>
                    {habit.trackingType === 'QUANTITY' && habit.quantityTarget && (
                      <span className="text-blue-400 text-xs">
                        &middot; {habit.quantityTarget} {habit.quantityUnit}
                      </span>
                    )}
                    <span className="text-fm-gold text-xs">+{habit.xpReward} XP</span>
                  </div>
                </div>
                <div className="ml-3 relative">
                  {xpFlash?.id === habit.id && (
                    <span className="absolute -top-6 right-0 text-fm-gold text-xs font-bold animate-bounce">
                      +{xpFlash.xp} XP!
                    </span>
                  )}
                  {!habit.completedToday ? (
                    <button
                      onClick={() => handleComplete(habit)}
                      disabled={completing === habit.id}
                      className="bg-fm-gold text-fm-navy px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                    >
                      {completing === habit.id ? '...' : 'COMPLETE'}
                    </button>
                  ) : (
                    <span className="text-fm-green text-xs font-semibold">DONE</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
