import { ReactNode } from 'react'

type PanelVariant = 'blue' | 'green' | 'red' | 'gold'

const headerColors: Record<PanelVariant, string> = {
  blue: 'bg-blue-800 text-white',
  green: 'bg-fm-green text-white',
  red: 'bg-red-700 text-white',
  gold: 'bg-fm-gold text-gray-900',
}

interface StatPanelProps {
  title: string
  variant?: PanelVariant
  children: ReactNode
  className?: string
}

export default function StatPanel({
  title,
  variant = 'blue',
  children,
  className = '',
}: StatPanelProps) {
  return (
    <div className={`rounded border border-gray-600 shadow-md overflow-hidden ${className}`}>
      <div
        className={`px-3 py-1.5 text-xs font-bold tracking-wide uppercase ${headerColors[variant]}`}
      >
        {title}
      </div>
      <div className="bg-[#2d3748] p-3">{children}</div>
    </div>
  )
}
