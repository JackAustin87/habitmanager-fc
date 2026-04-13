'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  xpOverTime: { date: string; xp: number }[]
  completionByCategory: { category: string; count: number }[]
  streakHistory: { date: string; count: number }[]
  xpByHabit: { habitName: string; totalXp: number }[]
  leagueWDL: { wins: number; draws: number; losses: number }
  weeklyXp: { week: string; userXp: number; avgXp: number }[]
  completionByHour: { hour: number; count: number }[]
  totalStats: {
    totalXp: number
    totalCompletions: number
    currentLevel: number
    teamName: string
  }
}

const NAVY = '#1a2236'
const GOLD = '#d69e2e'
const SKY = '#63b3ed'
const GREEN = '#48bb78'
const GRAY = '#718096'
const RED = '#fc8181'

// GitHub-style heatmap
function StreakHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const countMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of data) m.set(d.date, d.count)
    return m
  }, [data])

  // Build 52 weeks × 7 days grid ending today
  const cells = useMemo(() => {
    const today = new Date()
    const result: { date: string; count: number }[] = []
    // Start from 364 days ago (Monday-aligned = 52 full weeks)
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      result.push({ date: key, count: countMap.get(key) ?? 0 })
    }
    return result
  }, [countMap])

  function cellColor(count: number) {
    if (count === 0) return '#2d3748'
    if (count === 1) return '#b7791f'
    return GOLD
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(53, 1fr)',
      gridTemplateRows: 'repeat(7, 12px)',
      gap: '2px',
      width: '100%',
      gridAutoFlow: 'column',
    }}>
      {cells.map((cell) => (
        <div
          key={cell.date}
          title={`${cell.date}: ${cell.count} completion${cell.count !== 1 ? 's' : ''}`}
          style={{
            width: '100%',
            height: '12px',
            borderRadius: '2px',
            backgroundColor: cellColor(cell.count),
            cursor: 'default',
          }}
        />
      ))}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      backgroundColor: NAVY,
      border: `1px solid ${GOLD}33`,
      borderRadius: '8px',
      padding: '16px',
      flex: 1,
      minWidth: '140px',
    }}>
      <div style={{ color: GRAY, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ color: GOLD, fontSize: '24px', fontWeight: 'bold' }}>
        {value}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ color: GOLD, fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', marginTop: '0' }}>
      {children}
    </h2>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}22`, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load analytics'); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '32px', color: GOLD, textAlign: 'center' }}>
        Loading analytics...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ padding: '32px', color: RED, textAlign: 'center' }}>
        {error ?? 'Something went wrong'}
      </div>
    )
  }

  if (data.totalStats.totalCompletions === 0) {
    return (
      <div style={{ padding: '32px', maxWidth: '720px', textAlign: 'center' }}>
        <h1 style={{ color: GOLD, fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>
          ANALYTICS
        </h1>
        <p style={{ color: GRAY, fontSize: '14px' }}>
          No habit data yet. Start completing habits to see your analytics.
        </p>
      </div>
    )
  }

  const { wins, draws, losses } = data.leagueWDL
  const wdlData = [
    { name: `Wins (${wins})`, value: wins || 0.001 },
    { name: `Draws (${draws})`, value: draws || 0.001 },
    { name: `Losses (${losses})`, value: losses || 0.001 },
  ]
  const wdlColors = [GREEN, GRAY, RED]

  const catColors: Record<string, string> = { WORK: GOLD, PERSONAL: SKY }

  return (
    <div style={{ padding: '16px', maxWidth: '960px', backgroundColor: '#0f1623', minHeight: '100vh' }}>
      <h1 style={{ color: GOLD, fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>
        ANALYTICS
      </h1>

      {/* Overview stat cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <StatCard label="Total XP" value={data.totalStats.totalXp.toLocaleString()} />
        <StatCard label="Habits Completed" value={data.totalStats.totalCompletions.toLocaleString()} />
        <StatCard label="Current Level" value={data.totalStats.currentLevel} />
        <StatCard label="League W / D / L" value={`${wins} / ${draws} / ${losses}`} />
      </div>

      {/* Chart 1: Daily XP */}
      <ChartCard title="Daily XP (Last 90 Days)">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.xpOverTime} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="date" tick={{ fill: GRAY, fontSize: 10 }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fill: GRAY, fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a2236', border: `1px solid ${GOLD}`, color: '#fff' }} />
            <Line type="monotone" dataKey="xp" stroke={GOLD} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 2: Completion by Category */}
      <ChartCard title="Completions by Category">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.completionByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="category" tick={{ fill: GRAY, fontSize: 11 }} />
            <YAxis tick={{ fill: GRAY, fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: NAVY, border: `1px solid ${GOLD}`, color: '#fff' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.completionByCategory.map((entry) => (
                <Cell key={entry.category} fill={catColors[entry.category] ?? GOLD} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 3: Streak Heatmap */}
      <ChartCard title="Completion Heatmap (Last 365 Days)">
        <div style={{ marginBottom: '8px' }}>
          <StreakHeatmap data={data.streakHistory} />
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: GRAY, marginTop: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#2d3748' }} /> None
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#b7791f' }} /> 1
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: GOLD }} /> 2+
          </span>
        </div>
      </ChartCard>

      {/* Chart 4: XP by Habit */}
      <ChartCard title="XP by Habit (Top 10)">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            layout="vertical"
            data={data.xpByHabit}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis type="number" tick={{ fill: GRAY, fontSize: 10 }} />
            <YAxis type="category" dataKey="habitName" width={120} tick={{ fill: GRAY, fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: NAVY, border: `1px solid ${GOLD}`, color: '#fff' }} />
            <Bar dataKey="totalXp" fill={GOLD} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 5: Win/Draw/Loss */}
      <ChartCard title="League Win / Draw / Loss">
        {wins + draws + losses === 0 ? (
          <p style={{ color: GRAY, fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>No league matches played yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={wdlData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={false}
              >
                {wdlData.map((entry, index) => (
                  <Cell key={entry.name} fill={wdlColors[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: NAVY, border: `1px solid ${GOLD}`, color: '#fff' }} />
              <Legend formatter={(value) => <span style={{ color: GRAY, fontSize: '12px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Chart 6: Weekly XP Trend */}
      <ChartCard title="Weekly XP Trend (Last 12 Weeks)">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.weeklyXp} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="week" tick={{ fill: GRAY, fontSize: 9 }} />
            <YAxis tick={{ fill: GRAY, fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: NAVY, border: `1px solid ${GOLD}`, color: '#fff' }} />
            <Legend formatter={(value) => <span style={{ color: GRAY, fontSize: '12px' }}>{value}</span>} />
            <Line type="monotone" dataKey="userXp" name="Your XP" stroke={GOLD} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="avgXp" name="League Avg" stroke={GRAY} dot={false} strokeWidth={2} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 7: Habit Time of Day */}
      <ChartCard title="Habit Completion by Hour of Day">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.completionByHour} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="hour" tick={{ fill: GRAY, fontSize: 10 }} label={{ value: 'Hour (UTC)', position: 'insideBottom', offset: -2, fill: GRAY, fontSize: 10 }} />
            <YAxis tick={{ fill: GRAY, fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: NAVY, border: `1px solid ${GOLD}`, color: '#fff' }} />
            <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Export section */}
      <div style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}22`, borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <SectionTitle>Export Your Data</SectionTitle>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="/api/analytics/export?format=csv"
            style={{
              backgroundColor: GOLD,
              color: NAVY,
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Export CSV
          </a>
          <a
            href="/api/analytics/export?format=json"
            style={{
              backgroundColor: 'transparent',
              color: GOLD,
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '13px',
              textDecoration: 'none',
              border: `1px solid ${GOLD}`,
              display: 'inline-block',
            }}
          >
            Export JSON
          </a>
          <a
            href="/api/analytics/pdf"
            style={{
              backgroundColor: 'transparent',
              color: GRAY,
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '13px',
              textDecoration: 'none',
              border: `1px solid ${GRAY}`,
              display: 'inline-block',
            }}
          >
            Download PDF Report
          </a>
        </div>
      </div>
    </div>
  )
}
