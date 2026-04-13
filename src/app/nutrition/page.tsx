'use client'

import { useState, useEffect } from 'react'

interface MealLog {
  id: string
  mealType: string
  description: string
  estimatedCalories: number
  estimatedProtein: number | null
  estimatedCarbs: number | null
  estimatedFat: number | null
  loggedAt: string
}

interface NutritionData {
  todayMeals: MealLog[]
  targets: { calories: number; protein: number; carbs: number; fat: number }
  todayTotals: { calories: number; protein: number; carbs: number; fat: number }
}

function ProgressBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0)
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: '#a0aec0' }}>{label}</span>
        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{Math.round(current)}<span style={{ color: '#718096', fontWeight: 400 }}>/{target}</span></span>
      </div>
      <div style={{ height: 8, background: '#2d3748', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 11, color: '#718096', marginTop: 2, textAlign: 'right' }}>{pct}%</div>
    </div>
  )
}

export default function NutritionPage() {
  const [data, setData] = useState<NutritionData | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('')
  const [mealType, setMealType] = useState('SNACK')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    try {
      const res = await fetch('/api/nutrition')
      if (res.ok) {
        setData(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim(), mealType })
      })

      const result = await res.json()

      if (res.status === 503) {
        setApiKeyMissing(true)
        setError(result.message)
      } else if (!res.ok) {
        setError(result.message || 'Failed to log meal')
      } else {
        setDescription('')
        await fetchData()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#1a2236',
    color: '#e2e8f0',
    padding: '24px 16px',
    maxWidth: 800,
    margin: '0 auto'
  }

  const cardStyle: React.CSSProperties = {
    background: '#2d3748',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={{ color: '#d69e2e', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Nutrition</h1>
        <p style={{ color: '#718096' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <h1 style={{ color: '#d69e2e', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Nutrition</h1>

      {apiKeyMissing && (
        <div style={{ background: '#744210', border: '1px solid #d69e2e', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#fefcbf' }}>
          AI meal tracking requires a Claude API key. Set <code>CLAUDE_API_KEY</code> in your server environment to enable this feature.
        </div>
      )}

      {/* Daily Progress */}
      <div style={cardStyle}>
        <h2 style={{ color: '#d69e2e', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Today&apos;s Progress</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <ProgressBar label="Calories" current={data?.todayTotals.calories ?? 0} target={data?.targets.calories ?? 2200} color="#d69e2e" />
          <ProgressBar label="Protein (g)" current={data?.todayTotals.protein ?? 0} target={data?.targets.protein ?? 150} color="#63b3ed" />
          <ProgressBar label="Carbs (g)" current={data?.todayTotals.carbs ?? 0} target={data?.targets.carbs ?? 250} color="#68d391" />
          <ProgressBar label="Fat (g)" current={data?.todayTotals.fat ?? 0} target={data?.targets.fat ?? 65} color="#fc8181" />
        </div>
        <p style={{ color: '#718096', fontSize: 12, marginTop: 12 }}>Targets can be updated in Settings.</p>
      </div>

      {/* Log a Meal */}
      <div style={cardStyle}>
        <h2 style={{ color: '#d69e2e', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Log a Meal</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <select
              value={mealType}
              onChange={e => setMealType(e.target.value)}
              style={{ background: '#1a2236', color: '#e2e8f0', border: '1px solid #4a5568', borderRadius: 4, padding: '6px 10px', marginRight: 8, fontSize: 14 }}
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. I had a chicken sandwich, a banana, and a black coffee"
            maxLength={500}
            rows={3}
            style={{
              width: '100%',
              background: '#1a2236',
              color: '#e2e8f0',
              border: '1px solid #4a5568',
              borderRadius: 4,
              padding: '8px 12px',
              fontSize: 14,
              resize: 'vertical',
              boxSizing: 'border-box',
              marginBottom: 12
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="submit"
              disabled={submitting || !description.trim()}
              style={{
                background: submitting || !description.trim() ? '#4a5568' : '#d69e2e',
                color: submitting || !description.trim() ? '#718096' : '#1a2236',
                border: 'none',
                borderRadius: 4,
                padding: '8px 20px',
                fontWeight: 700,
                cursor: submitting || !description.trim() ? 'not-allowed' : 'pointer',
                fontSize: 14
              }}
            >
              {submitting ? 'Analysing...' : 'Log Meal'}
            </button>
            <span style={{ fontSize: 12, color: '#718096' }}>{description.length}/500</span>
          </div>
          {error && <p style={{ color: '#fc8181', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </form>
      </div>

      {/* Today's Meals */}
      <div style={cardStyle}>
        <h2 style={{ color: '#d69e2e', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Today&apos;s Meals</h2>
        {!data?.todayMeals.length ? (
          <p style={{ color: '#718096', fontSize: 14 }}>No meals logged today.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.todayMeals.map(meal => (
              <div key={meal.id} style={{ background: '#1a2236', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#d69e2e', fontWeight: 600, textTransform: 'capitalize' }}>
                    {meal.mealType.toLowerCase()}
                  </span>
                  <span style={{ fontSize: 11, color: '#718096' }}>
                    {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 8 }}>{meal.description}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                  <span style={{ color: '#d69e2e' }}>{meal.estimatedCalories} kcal</span>
                  <span style={{ color: '#63b3ed' }}>P: {meal.estimatedProtein?.toFixed(0) ?? '—'}g</span>
                  <span style={{ color: '#68d391' }}>C: {meal.estimatedCarbs?.toFixed(0) ?? '—'}g</span>
                  <span style={{ color: '#fc8181' }}>F: {meal.estimatedFat?.toFixed(0) ?? '—'}g</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
