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
  quantityUnit2: string | null
  quantityTarget2: number | null
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
  const [pendingQuantity, setPendingQuantity] = useState<string | null>(null)
  const [quantityInputs, setQuantityInputs] = useState<{ [id: string]: { q1: string; q2: string } }>({})

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

  async function handleComplete(habit: HabitItem, q1?: number, q2?: number) {
    if (habit.completedToday || completing === habit.id) return
    setCompleting(habit.id)
    setPendingQuantity(null)
    setQuantityInputs(prev => {
      const next = { ...prev }
      delete next[habit.id]
      return next
    })
    try {
      const body: Record<string, unknown> = {}
      if (q1 !== undefined) body.quantity = q1
      if (q2 !== undefined) body.quantity2 = q2
      const res = await fetch(`/api/habits/${habit.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
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

  function handleCompleteClick(habit: HabitItem) {
    if (habit.trackingType === 'QUANTITY') {
      setPendingQuantity(habit.id)
      setQuantityInputs(prev => ({ ...prev, [habit.id]: { q1: '', q2: '' } }))
    } else {
      handleComplete(habit)
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
                className={`px-4 py-3 transition-colors ${
                  habit.completedToday ? 'bg-green-900/20' : 'hover:bg-blue-800/20'
                }`}
              >
                <div className="flex items-center justify-between">
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
                      {habit.trackingType === 'QUANTITY' && habit.quantityUnit && (
                        <span className="text-blue-400 text-xs">
                          &middot; {habit.quantityUnit}
                          {habit.quantityTarget ? ` (target: ${habit.quantityTarget})` : ''}
                          {habit.quantityUnit2 ? ` + ${habit.quantityUnit2}` : ''}
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
                      completing === habit.id ? (
                        <span className="text-gray-400 text-xs">Saving...</span>
                      ) : pendingQuantity === habit.id ? null : (
                        <button
                          onClick={() => handleCompleteClick(habit)}
                          className="bg-fm-gold text-fm-navy px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-400 transition-colors"
                        >
                          COMPLETE
                        </button>
                      )
                    ) : (
                      <span className="text-fm-green text-xs font-semibold">DONE</span>
                    )}
                  </div>
                </div>

                {pendingQuantity === habit.id && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder={habit.quantityUnit || 'qty'}
                      value={quantityInputs[habit.id]?.q1 || ''}
                      onChange={e => setQuantityInputs(prev => ({
                        ...prev,
                        [habit.id]: { ...prev[habit.id], q1: e.target.value },
                      }))}
                      className="w-24 bg-blue-950 border border-blue-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-fm-gold"
                      autoFocus
                    />
                    {habit.quantityUnit2 && (
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder={habit.quantityUnit2}
                        value={quantityInputs[habit.id]?.q2 || ''}
                        onChange={e => setQuantityInputs(prev => ({
                          ...prev,
                          [habit.id]: { ...prev[habit.id], q2: e.target.value },
                        }))}
                        className="w-24 bg-blue-950 border border-blue-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-fm-gold"
                      />
                    )}
                    <button
                      onClick={() => handleComplete(
                        habit,
                        quantityInputs[habit.id]?.q1 ? Number(quantityInputs[habit.id].q1) : undefined,
                        quantityInputs[habit.id]?.q2 ? Number(quantityInputs[habit.id].q2) : undefined,
                      )}
                      className="bg-fm-gold text-fm-navy px-3 py-1 rounded text-xs font-bold hover:bg-yellow-400 transition-colors"
                    >
                      DONE
                    </button>
                    <button
                      onClick={() => setPendingQuantity(null)}
                      className="text-gray-400 text-xs hover:text-gray-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
