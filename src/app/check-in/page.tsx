'use client'

import { useState, useEffect, useCallback } from 'react'

interface CheckIn {
  id: string
  date: string
  weight: number | null
  weightUnit: string
  mood: number | null
  tiredness: number | null
  sleepHours: number | null
  energyLevel: number | null
  restingHeartRate: number | null
  notes: string | null
}

interface FormState {
  weight: string
  weightUnit: 'KG' | 'LBS'
  mood: string
  tiredness: string
  sleepHours: string
  energyLevel: string
  restingHeartRate: string
  notes: string
}

function MiniChart({ data, color, label, unit }: {
  data: { date: string; value: number }[]
  color: string
  label: string
  unit: string
}) {
  if (data.length < 2) return null
  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 300
  const H = 60
  const pad = 4
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((d.value - min) / range) * (H - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3">
      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '60px' }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + (i / (data.length - 1)) * (W - pad * 2)
          const y = H - pad - ((d.value - min) / range) * (H - pad * 2)
          return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        })}
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{data[0]?.date}</span>
        <span className="text-gray-300">{values[values.length - 1]} {unit}</span>
      </div>
    </div>
  )
}

export default function CheckInPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<FormState>({
    weight: '',
    weightUnit: 'KG',
    mood: '',
    tiredness: '',
    sleepHours: '',
    energyLevel: '',
    restingHeartRate: '',
    notes: '',
  })

  const fetchCheckIns = useCallback(async () => {
    const res = await fetch('/api/check-in')
    if (!res.ok) return
    const data: CheckIn[] = await res.json()
    setCheckIns(data)
    const today = new Date().toISOString().split('T')[0]
    const todayEntry = data.find(c => c.date.startsWith(today))
    if (todayEntry) {
      setForm({
        weight: todayEntry.weight !== null ? String(todayEntry.weight) : '',
        weightUnit: todayEntry.weightUnit as 'KG' | 'LBS',
        mood: todayEntry.mood !== null ? String(todayEntry.mood) : '',
        tiredness: todayEntry.tiredness !== null ? String(todayEntry.tiredness) : '',
        sleepHours: todayEntry.sleepHours !== null ? String(todayEntry.sleepHours) : '',
        energyLevel: todayEntry.energyLevel !== null ? String(todayEntry.energyLevel) : '',
        restingHeartRate: todayEntry.restingHeartRate !== null ? String(todayEntry.restingHeartRate) : '',
        notes: todayEntry.notes || '',
      })
    }
  }, [])

  useEffect(() => { fetchCheckIns() }, [fetchCheckIns])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchCheckIns()
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full bg-[#1a2236] border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-fm-gold'
  const labelClass = 'block text-xs text-gray-400 mb-1 uppercase tracking-wide'

  const weightData = checkIns
    .filter(c => c.weight !== null)
    .map(c => ({
      date: new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: c.weight!,
    }))

  const hrData = checkIns
    .filter(c => c.restingHeartRate !== null)
    .map(c => ({
      date: new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      value: c.restingHeartRate!,
    }))

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-blue-900/20 border border-blue-700/30 rounded">
        <div className="bg-blue-900/60 px-4 py-2 border-b border-blue-700/50">
          <h2 className="text-fm-gold font-bold text-sm uppercase tracking-wide">
            Daily Check-In
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Weight</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="75.5"
                  value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                  className={inputClass}
                />
                <select
                  value={form.weightUnit}
                  onChange={e => setForm(f => ({ ...f, weightUnit: e.target.value as 'KG' | 'LBS' }))}
                  className="bg-[#1a2236] border border-gray-600 rounded px-2 text-sm text-gray-200 focus:outline-none focus:border-fm-gold"
                >
                  <option value="KG">kg</option>
                  <option value="LBS">lbs</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Resting Heart Rate (bpm)</label>
              <input
                type="number"
                min="0"
                max="220"
                placeholder="62"
                value={form.restingHeartRate}
                onChange={e => setForm(f => ({ ...f, restingHeartRate: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Sleep (hours)</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="7.5"
                value={form.sleepHours}
                onChange={e => setForm(f => ({ ...f, sleepHours: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Mood (1–10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.mood}
                onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Energy (1–10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.energyLevel}
                onChange={e => setForm(f => ({ ...f, energyLevel: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tiredness (1–10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={form.tiredness}
                onChange={e => setForm(f => ({ ...f, tiredness: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder="How are you feeling today?"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-fm-gold hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold py-2 rounded text-sm transition-colors"
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Check-In'}
          </button>
        </div>
      </div>

      {(weightData.length >= 2 || hrData.length >= 2) && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded">
          <div className="bg-blue-900/60 px-4 py-2 border-b border-blue-700/50">
            <h2 className="text-fm-gold font-bold text-sm uppercase tracking-wide">Trends</h2>
          </div>
          <div className="p-4 space-y-3">
            {weightData.length >= 2 && (
              <MiniChart
                data={weightData}
                color="#d69e2e"
                label="Weight"
                unit={form.weightUnit.toLowerCase()}
              />
            )}
            {hrData.length >= 2 && (
              <MiniChart
                data={hrData}
                color="#63b3ed"
                label="Resting Heart Rate"
                unit="bpm"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
