'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Completion {
  id: string
  completedAt: string
  quantity: number | null
  quantity2: number | null
  xpEarned: number
  bonusType: string | null
}

interface HabitData {
  name: string
  trackingType: string
  quantityUnit: string | null
  quantityUnit2: string | null
  quantityTarget: number | null
  quantityTarget2: number | null
  description: string | null
}

interface StatsData {
  totalCompletions: number
  personalBest: number | null
  avg30: number | null
  personalBest2: number | null
  avg30_2: number | null
  currentStreak: number
  longestStreak: number
}

interface HabitStats {
  habit: HabitData
  completions: Completion[]
  stats: StatsData
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-blue-900/40 border border-blue-700/50 rounded p-3 text-center">
      <div className="text-fm-gold font-bold text-lg">{value}</div>
      <div className="text-blue-300 text-xs mt-1">{label}</div>
    </div>
  )
}

export default function HabitStatsPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<HabitStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/habits/${id}/stats`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-fm-gold animate-pulse">Loading stats...</div>
      </div>
    )
  }

  if (!data) return null

  const { habit, completions, stats } = data
  const isQuantity = habit.trackingType === 'QUANTITY'
  const hasDual = !!habit.quantityUnit2

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function fmt(val: number | null, unit: string | null) {
    if (val === null) return '–'
    return `${val}${unit ? ' ' + unit : ''}`
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/habits" className="inline-block text-blue-400 hover:text-fm-gold text-sm transition-colors">
        ← Squad
      </Link>

      <div className="bg-blue-900/40 border border-blue-700/50 rounded p-4">
        <h1 className="text-fm-gold font-bold text-xl uppercase tracking-wide">{habit.name}</h1>
        {habit.description && (
          <p className="text-gray-400 text-xs mt-1">{habit.description}</p>
        )}
        <div className="text-blue-300 text-xs mt-1">
          {isQuantity
            ? `${habit.quantityUnit || 'quantity'}${hasDual ? ` + ${habit.quantityUnit2}` : ''}`
            : 'Check-off habit'}
          {habit.quantityTarget ? ` · Target: ${habit.quantityTarget}${habit.quantityUnit ? ' ' + habit.quantityUnit : ''}` : ''}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard value={String(stats.totalCompletions)} label="Total Sessions" />
        <StatCard value={String(stats.currentStreak)} label="Current Streak" />
        {isQuantity && stats.personalBest !== null && (
          <StatCard value={fmt(stats.personalBest, habit.quantityUnit)} label="Personal Best" />
        )}
        {isQuantity && stats.avg30 !== null && (
          <StatCard value={fmt(stats.avg30, habit.quantityUnit)} label="30-Day Avg" />
        )}
        {hasDual && stats.personalBest2 !== null && (
          <StatCard value={fmt(stats.personalBest2, habit.quantityUnit2)} label={`Best ${habit.quantityUnit2}`} />
        )}
        {hasDual && stats.avg30_2 !== null && (
          <StatCard value={fmt(stats.avg30_2, habit.quantityUnit2)} label={`Avg ${habit.quantityUnit2}`} />
        )}
      </div>

      <div className="bg-blue-900/20 border border-blue-700/30 rounded">
        <div className="bg-blue-900/60 px-4 py-2 border-b border-blue-700/50">
          <h2 className="text-fm-gold font-bold text-sm uppercase tracking-wide">Session History</h2>
        </div>
        {completions.length === 0 ? (
          <p className="px-4 py-6 text-center text-gray-500 text-sm">No sessions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-800/30">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 uppercase tracking-wide">Date</th>
                  {isQuantity && (
                    <th className="text-left px-4 py-2 text-xs text-gray-400 uppercase tracking-wide">
                      {habit.quantityUnit || 'Amount'}
                    </th>
                  )}
                  {hasDual && (
                    <th className="text-left px-4 py-2 text-xs text-gray-400 uppercase tracking-wide">
                      {habit.quantityUnit2}
                    </th>
                  )}
                  <th className="text-left px-4 py-2 text-xs text-gray-400 uppercase tracking-wide">XP</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {completions.map(c => (
                  <tr key={c.id} className="border-b border-blue-900/30 hover:bg-blue-900/20">
                    <td className="px-4 py-2 text-gray-300">{formatDate(c.completedAt)}</td>
                    {isQuantity && (
                      <td className="px-4 py-2 text-white">
                        {c.quantity !== null ? c.quantity : '–'}
                      </td>
                    )}
                    {hasDual && (
                      <td className="px-4 py-2 text-white">
                        {c.quantity2 !== null ? c.quantity2 : '–'}
                      </td>
                    )}
                    <td className="px-4 py-2 text-fm-gold font-medium">+{c.xpEarned}</td>
                    <td className="px-4 py-2">
                      {c.bonusType === 'PERSONAL_BEST' && (
                        <span className="text-xs bg-yellow-900/50 text-yellow-300 px-1.5 py-0.5 rounded">PB!</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
