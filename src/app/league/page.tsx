'use client'

import { useState, useEffect } from 'react'

interface TableRow {
  teamId: string
  teamName: string
  isBot: boolean
  played: number
  won: number
  drawn: number
  lost: number
  xpFor: number
  xpAgainst: number
  xpDiff: number
  points: number
}

interface Season {
  id: string
  number: number
  startDate: string
  endDate: string
  isActive: boolean
}

export default function LeaguePage() {
  const [table, setTable] = useState<TableRow[]>([])
  const [season, setSeason] = useState<Season | null>(null)
  const [realUserCount, setRealUserCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadTable() }, [])

  async function loadTable() {
    setLoading(true)
    try {
      const res = await fetch('/api/league')
      const data = await res.json()
      setSeason(data.season ?? null)
      setTable(data.table || [])
      setCurrentUserId(data.currentUserId || null)
      if (data.realUserCount !== undefined) setRealUserCount(data.realUserCount)
    } catch {
      setError('Failed to load league')
    } finally {
      setLoading(false)
    }
  }

  async function startSeason() {
    setStarting(true)
    setError('')
    try {
      const res = await fetch('/api/season', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        await loadTable()
      }
    } catch {
      setError('Failed to start season')
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', color: '#a0aec0', fontSize: '14px' }}>Loading league table...</div>
  }

  if (!season) {
    return (
      <div style={{ padding: '16px', maxWidth: '600px' }}>
        <h1 style={{ color: '#d69e2e', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px' }}>
          LEAGUE TABLE
        </h1>
        <div style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '14px' }}>
            {realUserCount < 2
              ? `Waiting for managers to register... (${realUserCount}/2)`
              : 'Both managers registered. Ready to kick off!'}
          </p>
          {realUserCount >= 2 && (
            <button
              onClick={startSeason}
              disabled={starting}
              style={{ padding: '12px 28px', backgroundColor: starting ? '#744210' : '#d69e2e', color: '#1a2236', fontWeight: '700', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: starting ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase' as const }}
            >
              {starting ? 'Starting...' : 'Kick Off Season'}
            </button>
          )}
          {error && <p style={{ color: '#fc8181', marginTop: '12px', fontSize: '13px' }}>{error}</p>}
        </div>
      </div>
    )
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div style={{ padding: '16px', maxWidth: '720px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ color: '#d69e2e', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>
          SEASON {season.number} — LEAGUE TABLE
        </h1>
        <p style={{ color: '#718096', fontSize: '12px', marginTop: '4px' }}>
          {fmt(season.startDate)} – {fmt(season.endDate)}
        </p>
      </div>

      <div style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 32px 32px 32px 32px 42px 36px', padding: '8px 12px', backgroundColor: '#1a2236', borderBottom: '1px solid #4a5568' }}>
          {['#', 'Club', 'P', 'W', 'D', 'L', 'XP', 'Pts'].map((h, i) => (
            <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', textAlign: i < 2 ? 'left' : 'center' }}>{h}</div>
          ))}
        </div>

        {table.map((row, i) => {
          const isMe = row.teamId === currentUserId
          return (
            <div
              key={row.teamId}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 32px 32px 32px 32px 42px 36px',
                padding: '9px 12px',
                backgroundColor: isMe ? 'rgba(214,158,46,0.12)' : i % 2 === 0 ? '#2d3748' : '#283243',
                borderBottom: i < table.length - 1 ? '1px solid #3a4556' : 'none',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: '#718096' }}>{i + 1}</div>
              <div style={{ fontSize: '13px', fontWeight: isMe ? '700' : '400', color: isMe ? '#d69e2e' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.teamName}
                {row.isBot && <span style={{ fontSize: '9px', color: '#4a5568', marginLeft: '4px', verticalAlign: 'middle' }}>BOT</span>}
              </div>
              {[row.played, row.won, row.drawn, row.lost, row.xpFor, row.points].map((val, j) => (
                <div key={j} style={{ fontSize: '12px', color: j === 5 ? (isMe ? '#d69e2e' : '#e2e8f0') : '#a0aec0', textAlign: 'center', fontWeight: j === 5 ? '700' : '400' }}>{val}</div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
