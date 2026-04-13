'use client'

import { useState, useEffect } from 'react'

interface GlobalQuote {
  id: string
  text: string
  author: string
  bookTitle: string
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<GlobalQuote[]>([])
  const [todayIndex, setTodayIndex] = useState(-1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quotes?all=true')
      .then(r => r.json())
      .then(data => {
        setQuotes(data.quotes ?? [])
        setTodayIndex(data.todayIndex ?? -1)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-fm-gold animate-pulse">Loading quotes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-900/40 border border-blue-700/50 rounded p-4">
        <h1 className="text-fm-gold font-bold text-xl uppercase tracking-wide">Book Quotes</h1>
        <p className="text-blue-400 text-sm mt-0.5">Daily wisdom for managers who lead from the front</p>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded p-8 text-center text-blue-400 text-sm">
          No quotes available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote, i) => (
            <div
              key={quote.id}
              className={`bg-blue-900/20 rounded p-4 ${
                i === todayIndex
                  ? 'border-2 border-fm-gold/60'
                  : 'border border-blue-700/30'
              }`}
            >
              {i === todayIndex && (
                <div className="text-fm-gold text-xs font-bold uppercase tracking-wide mb-2">
                  Today&apos;s Quote
                </div>
              )}
              <p className="text-white text-sm italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-blue-400 text-xs mt-2">
                &mdash; {quote.author}, <span className="text-blue-300">{quote.bookTitle}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
