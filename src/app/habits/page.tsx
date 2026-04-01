'use client'

import { useState, useEffect, useCallback } from 'react'
import StatPanel from '@/components/ui/StatPanel'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import HabitForm, { HabitFormData } from '@/components/habits/HabitForm'

interface Habit {
  id: string
  name: string
  description: string | null
  category: 'WORK' | 'PERSONAL'
  frequency: 'DAILY' | 'WEEKLY' | 'ALTERNATING'
  trackingType: 'BOOLEAN' | 'QUANTITY'
  quantityUnit: string | null
  quantityTarget: number | null
  xpReward: number
  scheduledDays: number[]
  scheduledTime: string | null
  completions: { id: string }[]
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const fetchHabits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/habits')
      if (res.ok) {
        setHabits(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  async function handleCreate(formData: HabitFormData) {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create')
    }
    setShowAddModal(false)
    fetchHabits()
  }

  async function handleEdit(formData: HabitFormData) {
    if (!editingHabit) return
    const res = await fetch(`/api/habits/${editingHabit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update')
    }
    setEditingHabit(null)
    fetchHabits()
  }

  async function handleArchive(id: string) {
    if (!confirm('Archive this habit? Your completion history will be preserved.')) return
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    fetchHabits()
  }

  const columns = [
    { key: 'name', label: 'Habit' },
    {
      key: 'category',
      label: 'Category',
      render: (h: Habit) => (
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${h.category === 'WORK' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>
          {h.category}
        </span>
      ),
    },
    {
      key: 'frequency',
      label: 'Schedule',
      render: (h: Habit) => h.frequency.charAt(0) + h.frequency.slice(1).toLowerCase(),
    },
    {
      key: 'trackingType',
      label: 'Type',
      render: (h: Habit) =>
        h.trackingType === 'BOOLEAN' ? '✓ Check-off' : `# ${h.quantityUnit || 'qty'}`,
    },
    {
      key: 'xpReward',
      label: 'XP',
      render: (h: Habit) => <span className="text-fm-gold font-bold">{h.xpReward} XP</span>,
    },
    {
      key: 'completions',
      label: 'This Month',
      render: (h: Habit) => <span className="text-gray-400">{h.completions.length} ✓</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (h: Habit) => (
        <div className="flex gap-3">
          <button onClick={() => setEditingHabit(h)} className="text-xs text-blue-400 hover:text-blue-200 transition-colors">
            Edit
          </button>
          <button onClick={() => handleArchive(h.id)} className="text-xs text-red-400 hover:text-red-200 transition-colors">
            Archive
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 max-w-5xl">
      <StatPanel title="Squad — Habit Management" variant="blue">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-xs">
            {habits.length} active habit{habits.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-fm-gold hover:bg-yellow-500 text-gray-900 font-bold text-xs px-3 py-1.5 rounded transition-colors"
          >
            + Sign New Contract
          </button>
        </div>
        {loading ? (
          <p className="text-gray-500 text-xs py-6 text-center">Loading squad...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={habits}
            keyField="id"
            emptyMessage="No habits signed yet. Click 'Sign New Contract' to add your first habit."
          />
        )}
      </StatPanel>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Sign New Contract">
        <HabitForm onSubmit={handleCreate} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal isOpen={!!editingHabit} onClose={() => setEditingHabit(null)} title="Renegotiate Contract">
        {editingHabit && (
          <HabitForm
            onSubmit={handleEdit}
            onCancel={() => setEditingHabit(null)}
            initialData={{
              name: editingHabit.name,
              description: editingHabit.description || '',
              category: editingHabit.category,
              frequency: editingHabit.frequency,
              scheduledDays: editingHabit.scheduledDays,
              scheduledTime: editingHabit.scheduledTime || '',
              trackingType: editingHabit.trackingType,
              quantityUnit: editingHabit.quantityUnit || '',
              quantityTarget: editingHabit.quantityTarget?.toString() || '',
              xpReward: editingHabit.xpReward.toString(),
            }}
            isEditing
          />
        )}
      </Modal>
    </div>
  )
}
