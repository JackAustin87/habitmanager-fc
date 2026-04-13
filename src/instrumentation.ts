export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { startWorkers } = await import('./lib/workers/index')
      await startWorkers()
    } catch (e) {
      console.error('[instrumentation] Failed to start workers:', e)
    }
  }
}
