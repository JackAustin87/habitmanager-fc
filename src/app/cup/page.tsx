'use client'

import { useState, useEffect } from 'react'

interface Team {
  id: string
  teamName: string
  isBot: boolean
}

interface CupMatchData {
  id: string
  round: number
  matchNumber: number
  homeTeamId: string | null
  awayTeamId: string | null
  homeXp: number | null
  awayXp: number | null
  winnerId: string | null
  played: boolean
  homeTeam: Team | null
  awayTeam: Team | null
}

const ROUND_NAMES: Record<number, string> = {
  1: 'Round of 16',
  2: 'Quarter-Finals',
  3: 'Semi-Finals',
  4: 'Final',
}

export default function CupPage() {
  const [rounds, setRounds] = useState<CupMatchData[]>([])
  const [season, setSeason] = useState<{ number: number } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cup')
      .then(r => r.json())
      .then(data => {
        setSeason(data.season ?? null)
        setRounds(data.rounds || [])
        setCurrentUserId(data.currentUserId || null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{ padding: '24px', color: '#a0aec0', fontSize: '14px' }}>Loading cup...</div>
  }

  if (!season) {
    return (
      <div style={{ padding: '16px' }}>
        <h1 style={{ color: '#d69e2e', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>CUP</h1>
        <p style={{ color: '#a0aec0', marginTop: '16px', fontSize: '14px' }}>No active season. Start one from the League page.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', maxWidth: '700px' }}>
      <h1 style={{ color: '#d69e2e', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>
        SEASON {season.number} — CUP
      </h1>

      {[1, 2, 3, 4].map(roundNum => {
        const matchesInRound = rounds.filter(m => m.round === roundNum)
        if (matchesInRound.length === 0) return null

        return (
          <div key={roundNum} style={{ marginBottom: '24px' }}>
            <h2 style={{ color: '#718096', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {ROUND_NAMES[roundNum]}
            </h2>
            <div style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '6px', overflow: 'hidden' }}>
              {matchesInRound.map((match, i) => {
                const homeIsMe = match.homeTeamId === currentUserId
                const awayIsMe = match.awayTeamId === currentUserId
                const homeWon = match.played && match.winnerId === match.homeTeamId
                const awayWon = match.played && match.winnerId === match.awayTeamId

                return (
                  <div
                    key={match.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderBottom: i < matchesInRound.length - 1 ? '1px solid #3a4556' : 'none',
                      backgroundColor: (homeIsMe || awayIsMe) ? 'rgba(214,158,46,0.08)' : 'transparent',
                    }}
                  >
                    <div style={{ flex: 1, textAlign: 'right', paddingRight: '8px' }}>
                      <span style={{ fontSize: '13px', color: homeIsMe ? '#d69e2e' : homeWon ? '#68d391' : '#e2e8f0', fontWeight: homeIsMe || homeWon ? '700' : '400' }}>
                        {match.homeTeam?.teamName ?? 'TBD'}
                      </span>
                    </div>
                    <div style={{ width: '72px', textAlign: 'center', fontSize: '13px', flexShrink: 0 }}>
                      {match.played
                        ? <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{match.homeXp} – {match.awayXp}</span>
                        : <span style={{ color: '#4a5568' }}>vs</span>
                      }
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', paddingLeft: '8px' }}>
                      <span style={{ fontSize: '13px', color: awayIsMe ? '#d69e2e' : awayWon ? '#68d391' : '#e2e8f0', fontWeight: awayIsMe || awayWon ? '700' : '400' }}>
                        {match.awayTeam?.teamName ?? 'TBD'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
