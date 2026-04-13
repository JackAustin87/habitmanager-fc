'use client'

import { useState, useEffect, useCallback } from 'react'

interface RewardItem {
  id: string
  name: string
  description: string
  xpCost: number
  effectType: string
  effectDuration: number
}

export default function TransfersPage() {
  const [items, setItems] = useState<RewardItem[]>([])
  const [spendableXp, setSpendableXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchCatalog = useCallback(async () => {
    const res = await fetch('/api/transfer')
    if (res.ok) {
      const data = await res.json()
      setItems(data.items)
      setSpendableXp(data.spendableXp)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  async function handleBuy(item: RewardItem) {
    if (purchasing) return
    setPurchasing(item.id)
    setMessage(null)

    const res = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id }),
    })

    const data = await res.json()

    if (res.ok) {
      setSpendableXp(data.spendableXp)
      setMessage({ type: 'success', text: `Signed ${item.name}! Your squad is stronger.` })
    } else if (data.error === 'insufficient_balance') {
      setMessage({ type: 'error', text: 'Not enough XP to sign this player. Keep completing habits!' })
    } else {
      setMessage({ type: 'error', text: 'Transfer failed. Try again.' })
    }

    setPurchasing(null)
    setTimeout(() => setMessage(null), 4000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-fm-gold animate-pulse">Loading transfer market...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-blue-900/40 border border-blue-700/50 rounded p-4 flex items-center justify-between">
        <div>
          <h1 className="text-fm-gold font-bold text-xl uppercase tracking-wide">Transfer Market</h1>
          <p className="text-blue-400 text-sm mt-0.5">Spend your XP on squad boosts</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-blue-400 uppercase tracking-wide">Transfer Budget</div>
          <div className="text-fm-gold font-bold text-2xl">{spendableXp.toLocaleString()} XP</div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`rounded p-3 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-900/40 border border-green-700/50 text-green-300'
            : 'bg-red-900/40 border border-red-700/50 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Catalog grid */}
      {items.length === 0 ? (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded p-8 text-center text-blue-400 text-sm">
          No transfers available at the moment.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const canAfford = spendableXp >= item.xpCost
            const isBuying = purchasing === item.id

            return (
              <div
                key={item.id}
                className={`bg-blue-900/20 border rounded p-4 flex flex-col gap-3 transition-colors ${
                  canAfford
                    ? 'border-blue-700/50 hover:border-fm-gold/40'
                    : 'border-blue-800/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-bold text-sm">{item.name}</h3>
                  <span className="text-fm-gold font-bold text-sm whitespace-nowrap">
                    {item.xpCost.toLocaleString()} XP
                  </span>
                </div>
                <p className="text-blue-300 text-xs flex-1">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-500 text-xs">
                    {item.effectDuration === 1 ? '1 day' : `${item.effectDuration} days`}
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || !!purchasing}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                      canAfford
                        ? 'bg-fm-gold text-fm-navy hover:bg-yellow-400'
                        : 'bg-blue-800/50 text-blue-500 cursor-not-allowed'
                    }`}
                  >
                    {isBuying ? 'Signing...' : canAfford ? 'SIGN' : 'INSUFFICIENT XP'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
