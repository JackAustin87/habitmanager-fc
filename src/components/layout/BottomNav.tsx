'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/habits', label: 'Habits' },
  { href: '/checkin', label: 'Check-In' },
  { href: '/league', label: 'League' },
  { href: '/settings', label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-fm-navy border-t border-gray-700 flex z-50">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
            pathname === item.href
              ? 'text-fm-gold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
