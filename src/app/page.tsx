import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: '#d69e2e' }}
          >
            HabitManager FC
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#a0aec0' }}>
            Season 2024/25 — Pre-Season
          </p>
        </div>
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }}
        >
          <p className="text-sm mb-6" style={{ color: '#e2e8f0' }}>
            Welcome to your personal football management simulation.
            Track your habits. Earn XP. Win the league.
          </p>
          <Link
            href="/auth/login"
            className="block w-full py-3 px-4 rounded text-sm font-semibold text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#d69e2e', color: '#1a2236' }}
          >
            Sign In with Face ID
          </Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: '#718096' }}>
          First time? You will be prompted to register.
        </p>
      </div>
    </main>
  )
}
