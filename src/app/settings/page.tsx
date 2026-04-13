'use client'

import { useEffect, useState } from 'react'

interface SettingsData {
  teamName: string | null
  email: string
  calorieTarget: number
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
}

const SECTION_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
}

const SECTION_TITLE_STYLE: React.CSSProperties = {
  color: '#d69e2e',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  marginBottom: '16px',
}

const LABEL_STYLE: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '12px',
  marginBottom: '4px',
  display: 'block',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '6px',
  padding: '8px 12px',
  color: '#e2e8f0',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const BUTTON_STYLE: React.CSSProperties = {
  backgroundColor: '#d69e2e',
  color: '#1a2236',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 20px',
  fontWeight: 700,
  fontSize: '13px',
  cursor: 'pointer',
  letterSpacing: '0.5px',
}

const DISABLED_BUTTON_STYLE: React.CSSProperties = {
  ...BUTTON_STYLE,
  backgroundColor: '#4a5568',
  color: '#718096',
  cursor: 'not-allowed',
}

const ROW_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '12px',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile section state
  const [teamName, setTeamName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Nutrition section state
  const [calorieTarget, setCalorieTarget] = useState('2200')
  const [proteinTarget, setProteinTarget] = useState('150')
  const [carbsTarget, setCarbsTarget] = useState('250')
  const [fatTarget, setFatTarget] = useState('65')

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: SettingsData) => {
        setSettings(data)
        setTeamName(data.teamName ?? '')
        setCalorieTarget(String(data.calorieTarget ?? 2200))
        setProteinTarget(String(data.proteinTarget ?? 150))
        setCarbsTarget(String(data.carbsTarget ?? 250))
        setFatTarget(String(data.fatTarget ?? 65))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function saveProfile() {
    const payload: Record<string, string> = {}
    if (teamName.trim()) payload.teamName = teamName.trim()
    if (currentPassword && newPassword) {
      if (newPassword !== confirmPassword) {
        window.alert('New passwords do not match.')
        return
      }
      payload.currentPassword = currentPassword
      payload.newPassword = newPassword
    }

    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      window.alert(data.error ?? 'Failed to save profile.')
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    window.alert('Profile saved.')
  }

  async function saveNutrition() {
    const payload = {
      calorieTarget: parseInt(calorieTarget),
      proteinTarget: parseInt(proteinTarget),
      carbsTarget: parseInt(carbsTarget),
      fatTarget: parseInt(fatTarget),
    }
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      window.alert(data.error ?? 'Failed to save nutrition targets.')
      return
    }
    window.alert('Nutrition targets saved.')
  }

  async function deleteAccount() {
    const res = await fetch('/api/settings', { method: 'DELETE' })
    if (res.ok) {
      window.location.href = '/login'
    } else {
      window.alert('Failed to delete account. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '16px' }}>
        <p style={{ color: '#718096' }}>Loading settings...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', maxWidth: '720px' }}>
      <h1
        style={{
          color: '#d69e2e',
          fontSize: '20px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          marginBottom: '24px',
          textTransform: 'uppercase',
        }}
      >
        Settings
      </h1>

      {/* Profile Section */}
      <div style={SECTION_STYLE}>
        <h2 style={SECTION_TITLE_STYLE}>Profile</h2>
        <div style={{ marginBottom: '12px' }}>
          <label style={LABEL_STYLE}>Team Name</label>
          <input
            style={INPUT_STYLE}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Your team name"
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={LABEL_STYLE}>Email (read only)</label>
          <input
            style={{ ...INPUT_STYLE, opacity: 0.6, cursor: 'not-allowed' }}
            value={settings?.email ?? ''}
            readOnly
          />
        </div>
        <div style={{ marginBottom: '4px' }}>
          <h3 style={{ color: '#a0aec0', fontSize: '12px', fontWeight: 600, marginBottom: '10px', marginTop: '16px' }}>
            CHANGE PASSWORD
          </h3>
        </div>
        <div style={ROW_STYLE}>
          <div>
            <label style={LABEL_STYLE}>Current Password</label>
            <input
              type="password"
              style={INPUT_STYLE}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>New Password</label>
            <input
              type="password"
              style={INPUT_STYLE}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
            />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL_STYLE}>Confirm New Password</label>
          <input
            type="password"
            style={INPUT_STYLE}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        <button style={BUTTON_STYLE} onClick={saveProfile}>
          Save Profile
        </button>
      </div>

      {/* Nutrition Targets Section */}
      <div style={SECTION_STYLE}>
        <h2 style={SECTION_TITLE_STYLE}>Nutrition Targets</h2>
        <div style={ROW_STYLE}>
          <div>
            <label style={LABEL_STYLE}>Daily Calories</label>
            <input
              type="number"
              style={INPUT_STYLE}
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(e.target.value)}
              min="1"
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Protein (g)</label>
            <input
              type="number"
              style={INPUT_STYLE}
              value={proteinTarget}
              onChange={(e) => setProteinTarget(e.target.value)}
              min="1"
            />
          </div>
        </div>
        <div style={ROW_STYLE}>
          <div>
            <label style={LABEL_STYLE}>Carbs (g)</label>
            <input
              type="number"
              style={INPUT_STYLE}
              value={carbsTarget}
              onChange={(e) => setCarbsTarget(e.target.value)}
              min="1"
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>Fat (g)</label>
            <input
              type="number"
              style={INPUT_STYLE}
              value={fatTarget}
              onChange={(e) => setFatTarget(e.target.value)}
              min="1"
            />
          </div>
        </div>
        <button style={BUTTON_STYLE} onClick={saveNutrition}>
          Save Nutrition Targets
        </button>
      </div>

      {/* Notifications Section */}
      <div style={SECTION_STYLE}>
        <h2 style={SECTION_TITLE_STYLE}>Notifications</h2>
        <p style={{ color: '#718096', fontSize: '13px', marginBottom: '16px' }}>
          Push notifications and email digests are coming in Phase 5.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {['Daily reminder', 'Weekly digest'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ color: '#a0aec0', fontSize: '14px' }}>{label}</span>
              <div
                style={{
                  width: '40px',
                  height: '22px',
                  backgroundColor: '#2d3748',
                  borderRadius: '11px',
                  position: 'relative',
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '3px',
                    top: '3px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#718096',
                    borderRadius: '50%',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: '#4a5568', fontSize: '11px', marginTop: '12px' }}>
          Coming in Phase 5
        </p>
      </div>

      {/* Apple Calendar (CalDAV) Section */}
      <div style={SECTION_STYLE}>
        <h2 style={SECTION_TITLE_STYLE}>Apple Calendar (CalDAV)</h2>
        <p style={{ color: '#718096', fontSize: '13px', marginBottom: '16px' }}>
          Connect your Apple Calendar to sync habit completions as events.
        </p>
        <div style={{ marginBottom: '12px' }}>
          <label style={LABEL_STYLE}>Apple ID</label>
          <input
            type="email"
            style={{ ...INPUT_STYLE, opacity: 0.6, cursor: 'not-allowed' }}
            placeholder="your@icloud.com"
            disabled
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={LABEL_STYLE}>App Password</label>
          <input
            type="password"
            style={{ ...INPUT_STYLE, opacity: 0.6, cursor: 'not-allowed' }}
            placeholder="App-specific password"
            disabled
          />
        </div>
        <button style={DISABLED_BUTTON_STYLE} disabled>
          Connect — Coming Soon
        </button>
      </div>

      {/* Data Export Section */}
      <div style={SECTION_STYLE}>
        <h2 style={SECTION_TITLE_STYLE}>Data Export</h2>
        <p style={{ color: '#718096', fontSize: '13px', marginBottom: '16px' }}>
          Export all your data in your preferred format.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={DISABLED_BUTTON_STYLE}
            disabled
            title="Available after Analytics phase"
          >
            Export CSV
          </button>
          <button
            style={DISABLED_BUTTON_STYLE}
            disabled
            title="Available after Analytics phase"
          >
            Export JSON
          </button>
        </div>
        <p style={{ color: '#4a5568', fontSize: '11px', marginTop: '10px' }}>
          Available after Analytics phase
        </p>
      </div>

      {/* Danger Zone Section */}
      <div
        style={{
          ...SECTION_STYLE,
          border: '1px solid rgba(245, 101, 101, 0.3)',
          backgroundColor: 'rgba(245, 101, 101, 0.04)',
        }}
      >
        <h2 style={{ ...SECTION_TITLE_STYLE, color: '#fc8181' }}>Danger Zone</h2>
        <p style={{ color: '#718096', fontSize: '13px', marginBottom: '16px' }}>
          Permanently delete your account and all associated data. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            style={{
              ...BUTTON_STYLE,
              backgroundColor: '#e53e3e',
              color: '#fff',
            }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <div
            style={{
              backgroundColor: 'rgba(245, 101, 101, 0.08)',
              border: '1px solid rgba(245, 101, 101, 0.3)',
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <p style={{ color: '#fc8181', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              Are you sure? This will permanently delete your account and ALL your data.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{
                  ...BUTTON_STYLE,
                  backgroundColor: '#e53e3e',
                  color: '#fff',
                }}
                onClick={deleteAccount}
              >
                Yes, Delete Everything
              </button>
              <button
                style={{
                  ...BUTTON_STYLE,
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#a0aec0',
                }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
