'use client'

import { useEffect, useState } from 'react'

type TrophyType =
  | 'FIRST_HABIT'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'STREAK_90'
  | 'STREAK_365'
  | 'XP_1000'
  | 'XP_10000'
  | 'CUP_WINNER'
  | 'LEAGUE_CHAMPION'
  | 'HABIT_MASTER'

interface EarnedTrophy {
  type: TrophyType
  awardedAt: string
  metadata: unknown
}

const TROPHY_META: Record<TrophyType, { name: string; description: string }> = {
  FIRST_HABIT: { name: 'First Step', description: 'Completed your first habit' },
  STREAK_7: { name: 'One Week Wonder', description: '7-day streak' },
  STREAK_30: { name: 'Monthly Grinder', description: '30-day streak' },
  STREAK_90: { name: 'Consistent Pro', description: '90-day streak' },
  STREAK_365: { name: 'Year of Mastery', description: '365-day streak' },
  XP_1000: { name: 'Rising Star', description: 'Earned 1,000 XP' },
  XP_10000: { name: 'Elite Performer', description: 'Earned 10,000 XP' },
  CUP_WINNER: { name: 'Cup Champion', description: 'Won the cup competition' },
  LEAGUE_CHAMPION: { name: 'League Title', description: 'Finished top of the league' },
  HABIT_MASTER: { name: 'Habit Master', description: 'Completed 500 habits total' },
}

const ALL_TROPHY_TYPES = Object.keys(TROPHY_META) as TrophyType[]

export default function TrophiesPage() {
  const [earnedTrophies, setEarnedTrophies] = useState<EarnedTrophy[]>([])
  const [loading, setLoading] = useState(true)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null)

  useEffect(() => {
    // Check for level-up flag stored by the complete route response handler
    const levelUpData = localStorage.getItem('hmfc_levelup')
    if (levelUpData) {
      try {
        const { newLevel } = JSON.parse(levelUpData)
        setLevelUpTo(newLevel)
        setShowLevelUp(true)
        localStorage.removeItem('hmfc_levelup')
      } catch {
        localStorage.removeItem('hmfc_levelup')
      }
    }

    fetch('/api/trophies')
      .then((r) => r.json())
      .then((data) => {
        setEarnedTrophies(data.trophies ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const earnedSet = new Set(earnedTrophies.map((t) => t.type))

  const getAwardedDate = (type: TrophyType): string | null => {
    const t = earnedTrophies.find((e) => e.type === type)
    if (!t) return null
    return new Date(t.awardedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div style={{ padding: '16px', maxWidth: '900px' }}>
      {/* Level-up overlay */}
      {showLevelUp && (
        <div
          onClick={() => setShowLevelUp(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            backgroundColor: 'rgba(26, 34, 54, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '8px' }}>🏆</div>
            <div
              style={{
                color: '#d69e2e',
                fontSize: '48px',
                fontWeight: 900,
                letterSpacing: '4px',
                textShadow: '0 0 30px rgba(214, 158, 46, 0.8)',
                marginBottom: '12px',
              }}
            >
              LEVEL UP!
            </div>
            {levelUpTo && (
              <div style={{ color: '#e2e8f0', fontSize: '24px', fontWeight: 600 }}>
                You reached Level {levelUpTo}
              </div>
            )}
            <div style={{ color: '#718096', fontSize: '14px', marginTop: '24px' }}>
              Click anywhere to dismiss
            </div>
          </div>
        </div>
      )}

      <h1
        style={{
          color: '#d69e2e',
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          marginBottom: '4px',
          textTransform: 'uppercase',
        }}
      >
        Trophy Cabinet
      </h1>
      <p style={{ color: '#718096', fontSize: '13px', marginBottom: '24px' }}>
        {loading
          ? 'Loading...'
          : `${earnedTrophies.length} of ${ALL_TROPHY_TYPES.length} trophies earned`}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {ALL_TROPHY_TYPES.map((type) => {
          const earned = earnedSet.has(type)
          const meta = TROPHY_META[type]
          const dateStr = getAwardedDate(type)

          return (
            <div
              key={type}
              style={{
                backgroundColor: earned ? 'rgba(214, 158, 46, 0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${earned ? 'rgba(214, 158, 46, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                opacity: earned ? 1 : 0.5,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ fontSize: '32px', flexShrink: 0 }}>
                {earned ? '🏆' : '🔒'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: earned ? '#d69e2e' : '#718096',
                    fontWeight: 700,
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  {meta.name}
                </div>
                <div style={{ color: '#a0aec0', fontSize: '12px', marginBottom: '6px' }}>
                  {meta.description}
                </div>
                {earned && dateStr && (
                  <div style={{ color: '#68d391', fontSize: '11px' }}>
                    Awarded {dateStr}
                  </div>
                )}
                {!earned && (
                  <div style={{ color: '#4a5568', fontSize: '11px' }}>
                    Not yet earned
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
