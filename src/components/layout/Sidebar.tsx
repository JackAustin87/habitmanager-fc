'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/habits', label: 'Habits' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/league', label: 'League Table' },
  { href: '/cup', label: 'Cup' },
  { href: '/transfers', label: 'Transfer Market' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/check-in', label: 'Check-In' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/quotes', label: 'Book Quotes' },
  { href: '/trophies', label: 'Trophies' },
  { href: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-48 bg-fm-navy min-h-screen flex-shrink-0 border-r border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="text-fm-gold font-bold text-xs tracking-widest">HABITMANAGER</div>
        <div className="text-gray-500 text-xs">FC</div>
      </div>
      <nav className="flex-1 py-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 text-xs font-medium transition-colors leading-tight border-l-2 ${
              pathname === item.href
                ? 'bg-blue-900 text-white border-fm-gold'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
