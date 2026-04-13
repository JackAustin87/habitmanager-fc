'use client'

import { useState, useEffect, useCallback } from 'react'

interface CompletionEntry {
  habitId: string
  habitName: string
  category: 'WORK' | 'PERSONAL'
}

interface CalendarData {
  year: number
  month: number
  days: Record<string, CompletionEntry[]>
}

const CATEGORY_COLORS: Record<string, string> = {
  WORK: '#d69e2e',
  PERSONAL: '#63b3ed',
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// Returns 0=Monday ... 6=Sunday for the first day of the given month
function getFirstDayOffset(year: number, month: number): number {
  const jsDay = new Date(year, month - 1, 1).getDay()
  return jsDay === 0 ? 6 : jsDay - 1
}

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const fetchData = useCallback(async (y: number, m: number) => {
    setLoading(true)
    setSelectedDay(null)
    try {
      const res = await fetch(`/api/calendar?year=${y}&month=${m}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json: CalendarData = await res.json()
      setData(json)
    } catch {
      setData({ year: y, month: m, days: {} })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(year, month)
  }, [year, month, fetchData])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const offset = getFirstDayOffset(year, month)
  const totalCells = offset + daysInMonth
  const rows = Math.ceil(totalCells / 7)

  function completionsForDay(day: number): CompletionEntry[] {
    return data?.days[String(day)] ?? []
  }

  const hasAnyCompletions = data && Object.keys(data.days).length > 0

  return (
    <div style={{ padding: '16px', maxWidth: '720px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ color: '#d69e2e', fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px', margin: 0 }}>
          CALENDAR
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={prevMonth}
            style={{
              background: 'none', border: '1px solid #2d3748', borderRadius: '4px',
              color: '#a0aec0', cursor: 'pointer', padding: '4px 10px', fontSize: '16px',
            }}
            aria-label="Previous month"
          >
            {'<'}
          </button>
          <span style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 600, minWidth: '120px', textAlign: 'center' }}>
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            style={{
              background: 'none', border: '1px solid #2d3748', borderRadius: '4px',
              color: '#a0aec0', cursor: 'pointer', padding: '4px 10px', fontSize: '16px',
            }}
            aria-label="Next month"
          >
            {'>'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
            <span style={{ color: '#a0aec0', fontSize: '12px' }}>
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
        {DAY_HEADERS.map(d => (
          <div key={d} style={{ textAlign: 'center', color: '#718096', fontSize: '12px', fontWeight: 600, padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#718096', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>
          Loading...
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: rows * 7 }).map((_, idx) => {
              const day = idx - offset + 1
              const isValid = day >= 1 && day <= daysInMonth
              const isTodayCell =
                isValid &&
                day === today.getDate() &&
                month === today.getMonth() + 1 &&
                year === today.getFullYear()
              const completions = isValid ? completionsForDay(day) : []
              const isSelected = selectedDay === day && isValid

              return (
                <div
                  key={idx}
                  onClick={() => isValid && setSelectedDay(isSelected ? null : day)}
                  style={{
                    minHeight: '64px',
                    background: isSelected ? '#2a3a5c' : isTodayCell ? '#1e2d47' : '#1a2236',
                    border: isTodayCell ? '1px solid #d69e2e' : '1px solid #2d3748',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: isValid ? 'pointer' : 'default',
                    opacity: isValid ? 1 : 0,
                    transition: 'background 0.15s',
                    boxSizing: 'border-box' as const,
                  }}
                >
                  {isValid && (
                    <div>
                      <div style={{
                        color: isTodayCell ? '#d69e2e' : '#a0aec0',
                        fontSize: '12px',
                        fontWeight: isTodayCell ? 700 : 400,
                        marginBottom: '4px',
                      }}>
                        {day}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {completions.map((c, i) => (
                          <div
                            key={c.habitId + '-' + i}
                            title={c.habitName}
                            style={{
                              width: '8px', height: '8px',
                              borderRadius: '50%',
                              background: CATEGORY_COLORS[c.category] ?? '#718096',
                              flexShrink: 0,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {!hasAnyCompletions && (
            <div style={{ color: '#4a5568', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>
              No habits logged this month
            </div>
          )}

          {selectedDay !== null && (
            <div style={{
              marginTop: '16px',
              background: '#1e2736',
              border: '1px solid #2d3748',
              borderRadius: '8px',
              padding: '14px',
            }}>
              <div style={{ color: '#d69e2e', fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                {MONTH_NAMES[month - 1]} {selectedDay}, {year}
              </div>
              {completionsForDay(selectedDay).length === 0 ? (
                <div style={{ color: '#4a5568', fontSize: '13px' }}>No habits logged on this day.</div>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {completionsForDay(selectedDay).map((c, i) => (
                    <li key={c.habitId + '-' + i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: CATEGORY_COLORS[c.category] ?? '#718096',
                        flexShrink: 0,
                      }} />
                      <span style={{ color: '#e2e8f0', fontSize: '13px' }}>{c.habitName}</span>
                      <span style={{
                        color: '#718096', fontSize: '11px', marginLeft: 'auto',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        {c.category}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
