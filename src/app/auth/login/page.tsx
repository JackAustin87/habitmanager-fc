'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName.trim(), password }),
      })
      const result = await res.json()
      if (result.success) {
        window.location.href = '/'
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#1a2236' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚽</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#d69e2e', letterSpacing: '1px' }}>
            HABITMANAGER FC
          </h1>
          <p style={{ color: '#a0aec0', fontSize: '13px', marginTop: '6px' }}>
            {isRegistering ? 'Register your club' : 'Sign in to your club'}
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '8px', padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Club Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#1a2236', border: '1px solid #4a5568', borderRadius: '4px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' as const }}
              placeholder={isRegistering ? 'e.g. Red Devils FC' : 'Your club name'}
              required
            />
          </div>
          <div style={{ marginBottom: isRegistering ? '16px' : '0' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#1a2236', border: '1px solid #4a5568', borderRadius: '4px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' as const }}
              placeholder="Password"
              required
            />
          </div>
          {isRegistering && (
            <div style={{ marginBottom: '0' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#1a2236', border: '1px solid #4a5568', borderRadius: '4px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' as const }}
                placeholder="Confirm password"
                required
              />
            </div>
          )}
          {error && (
            <p style={{ color: '#fc8181', fontSize: '13px', marginTop: '12px', marginBottom: '0' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#744210' : '#d69e2e', color: '#1a2236', fontWeight: '700', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase' as const, marginTop: '20px', marginBottom: '16px' }}
          >
            {loading ? '...' : isRegistering ? 'Register Club' : 'Sign In'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setConfirmPassword('') }}
              style={{ background: 'none', border: 'none', color: '#718096', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegistering ? 'Already have a club? Sign in' : 'New manager? Register your club'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
