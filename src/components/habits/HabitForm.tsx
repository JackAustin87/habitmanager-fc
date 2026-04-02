'use client'

import { useState } from 'react'

type Frequency = 'DAILY' | 'WEEKLY' | 'ALTERNATING'
type Category = 'WORK' | 'PERSONAL'
type TrackingType = 'BOOLEAN' | 'QUANTITY'

export interface HabitFormData {
  name: string
  description: string
  category: Category
  frequency: Frequency
  scheduledDays: number[]
  scheduledTime: string
  trackingType: TrackingType
  quantityUnit: string
  quantityTarget: string
  quantityUnit2: string
  quantityTarget2: string
  xpReward: string
}

interface HabitFormProps {
  onSubmit: (data: HabitFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<HabitFormData>
  isEditing?: boolean
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function HabitForm({ onSubmit, onCancel, initialData, isEditing = false }: HabitFormProps) {
  const [form, setForm] = useState<HabitFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'PERSONAL',
    frequency: initialData?.frequency || 'DAILY',
    scheduledDays: initialData?.scheduledDays || [],
    scheduledTime: initialData?.scheduledTime || '',
    trackingType: initialData?.trackingType || 'BOOLEAN',
    quantityUnit: initialData?.quantityUnit || '',
    quantityTarget: initialData?.quantityTarget || '',
    quantityUnit2: initialData?.quantityUnit2 || '',
    quantityTarget2: initialData?.quantityTarget2 || '',
    xpReward: initialData?.xpReward || '10',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleDay(day: number) {
    setForm(f => ({
      ...f,
      scheduledDays: f.scheduledDays.includes(day)
        ? f.scheduledDays.filter(d => d !== day)
        : [...f.scheduledDays, day],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-[#1a2236] border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-fm-gold'
  const labelClass = 'block text-xs text-gray-400 mb-1 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Habit Name *</label>
        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputClass} placeholder="Morning Run" />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inputClass} resize-none`} rows={2} placeholder="Optional details..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category *</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))} className={inputClass}>
            <option value="PERSONAL">Personal</option>
            <option value="WORK">Work</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Frequency *</label>
          <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Frequency }))} className={inputClass}>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="ALTERNATING">Alternating</option>
          </select>
        </div>
      </div>
      {form.frequency === 'WEEKLY' && (
        <div>
          <label className={labelClass}>Scheduled Days</label>
          <div className="flex gap-1 flex-wrap">
            {DAYS.map((day, i) => (
              <button type="button" key={day} onClick={() => toggleDay(i)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${form.scheduledDays.includes(i) ? 'bg-fm-gold text-gray-900 border-fm-gold' : 'bg-[#1a2236] text-gray-400 border-gray-600 hover:border-gray-400'}`}>
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tracking Type</label>
          <select value={form.trackingType} onChange={e => setForm(f => ({ ...f, trackingType: e.target.value as TrackingType }))} className={inputClass}>
            <option value="BOOLEAN">Check-off (done / not done)</option>
            <option value="QUANTITY">Quantity (count or measure)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Scheduled Time</label>
          <input type="time" value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} className={inputClass} />
        </div>
      </div>
      {form.trackingType === 'QUANTITY' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Unit (e.g. reps, km, mins)</label>
              <input type="text" value={form.quantityUnit} onChange={e => setForm(f => ({ ...f, quantityUnit: e.target.value }))} className={inputClass} placeholder="reps" />
            </div>
            <div>
              <label className={labelClass}>Target (optional)</label>
              <input type="number" min="1" value={form.quantityTarget} onChange={e => setForm(f => ({ ...f, quantityTarget: e.target.value }))} className={inputClass} placeholder="50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Second metric (optional, e.g. minutes)</label>
              <input type="text" value={form.quantityUnit2} onChange={e => setForm(f => ({ ...f, quantityUnit2: e.target.value }))} className={inputClass} placeholder="e.g. minutes" />
            </div>
            <div>
              <label className={labelClass}>Second metric target (optional)</label>
              <input type="number" min="1" value={form.quantityTarget2} onChange={e => setForm(f => ({ ...f, quantityTarget2: e.target.value }))} className={inputClass} placeholder="30" />
            </div>
          </div>
        </>
      )}
      <div>
        <label className={labelClass}>XP Reward per completion</label>
        <input type="number" min="1" max="100" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: e.target.value }))} className={inputClass} />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading || !form.name}
          className="flex-1 bg-fm-gold hover:bg-yellow-500 disabled:opacity-40 text-gray-900 font-bold text-sm py-2 rounded transition-colors">
          {loading ? 'Saving...' : isEditing ? 'Update Habit' : 'Sign Contract'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
