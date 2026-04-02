'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await res.json()
      if (result.success) {
        window.location.href = '/dashboard'
      } else {
        setError('Wrong password')
      }
    } catch {
      setError('Sign in failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#1a2236' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#d69e2e', letterSpacing: '1px' }}>
            HABITMANAGER FC
          </h1>
          <p style={{ color: '#a0aec0', fontSize: '13px', marginTop: '4px' }}>
            Season 2025/26
          </p>
        </div>
        <form onSubmit={handleSignIn} style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '8px', padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Manager Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#1a2236', border: '1px solid #4a5568', borderRadius: '4px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' as const }}
              placeholder="Enter password"
              required
            />
          </div>
          {error && (
            <p style={{ color: '#fc8181', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#744210' : '#d69e2e', color: '#1a2236', fontWeight: '700', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase' as const }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
