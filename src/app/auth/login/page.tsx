'use client'

import { useState } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignIn() {
    setLoading(true)
    setError('')
    try {
      const optRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const options = await optRes.json()
      if (options.error) throw new Error(options.error)

      const authResponse = await startAuthentication(options)

      const verifyRes = await fetch('/api/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: authResponse }),
      })
      const result = await verifyRes.json()

      if (result.verified) {
        router.push('/')
        router.refresh()
      } else {
        setError(result.error || 'Sign in failed')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a2236] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#2d3748] border border-gray-600 rounded shadow-xl overflow-hidden">
          <div className="bg-blue-800 px-4 py-2.5">
            <h1 className="text-white font-bold text-sm tracking-wide uppercase">
              HabitManager FC
            </h1>
            <p className="text-blue-300 text-xs">Manager Login</p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-400 text-xs">
              Enter your email and use Face ID to sign in to your club.
            </p>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && handleSignIn()}
                placeholder="manager@example.com"
                className="w-full bg-[#1a2236] border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-fm-gold"
              />
            </div>
            {error && (
              <div className="bg-red-900 border border-red-700 rounded px-3 py-2">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}
            <button
              onClick={handleSignIn}
              disabled={loading || !email}
              className="w-full bg-fm-gold hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold text-sm py-2.5 px-4 rounded transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In with Face ID'}
            </button>
            <p className="text-center text-xs text-gray-500">
              No account?{' '}
              <a href="/auth/register" className="text-fm-gold hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
