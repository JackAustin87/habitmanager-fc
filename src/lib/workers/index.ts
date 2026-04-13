import { Worker } from 'bullmq'

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379'
const match = redisUrl.match(/redis:\/\/([^:]+)(?::(\d+))?/)
const connection = { host: match?.[1] || 'redis', port: parseInt(match?.[2] || '6379') }

export async function startWorkers() {
  const hasVapid = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
  const hasResend = !!process.env.RESEND_API_KEY

  if (!hasVapid && !hasResend) {
    console.log('[workers] No notification credentials configured. Workers not started.')
    return
  }

  async function sendPush(userId: string, title: string, body: string, url: string) {
    const { prisma } = await import('../prisma')
    const { pushNotificationQueue } = await import('../jobs/queue')
    const subs = await prisma.pushSubscription.findMany({ where: { userId } })
    await Promise.all(subs.map(sub => pushNotificationQueue.add('send', {
      endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, title, body, url
    })))
  }

  if (hasVapid) {
    const pushWorker = new Worker('push-notification', async (job) => {
      const webpush = await import('web-push')
      const { endpoint, p256dh, auth, title, body: msgBody, url } = job.data
      webpush.default.setVapidDetails(
        'mailto:admin@fmhabittracker.cloud',
        process.env.VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      )
      await webpush.default.sendNotification(
        { endpoint, keys: { p256dh, auth } },
        JSON.stringify({ title, body: msgBody, url })
      )
    }, { connection, autorun: true })
    pushWorker.on('error', (e) => console.error('[push-worker]', e.message))
  }

  const dailyWorker = new Worker('daily-reminder', async (job) => {
    if (hasVapid) await sendPush(job.data.userId, 'HabitManager FC', "Time to log your habits!", '/dashboard')
  }, { connection, autorun: true })
  dailyWorker.on('error', (e) => console.error('[daily-reminder-worker]', e.message))

  const weeklyWorker = new Worker('weekly-digest', async (job) => {
    if (!hasResend) return
    const { Resend } = await import('resend')
    const { prisma } = await import('../prisma')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const user = await prisma.user.findUnique({ where: { id: job.data.userId }, select: { totalXp: true, level: true, currentStreak: true } })
    await resend.emails.send({
      from: 'HabitManager FC <noreply@fmhabittracker.cloud>',
      to: job.data.email,
      subject: 'Your Weekly HabitManager FC Digest',
      html: `<h2>Weekly Summary</h2><p>XP: ${user?.totalXp ?? 0} | Level: ${user?.level ?? 1} | Streak: ${user?.currentStreak ?? 0} days</p>`
    })
  }, { connection, autorun: true })
  weeklyWorker.on('error', (e) => console.error('[weekly-digest-worker]', e.message))

  const streakWorker = new Worker('streak-warning', async (job) => {
    if (hasVapid) await sendPush(job.data.userId, 'Streak at Risk!', "Log a habit today to keep your streak alive.", '/dashboard')
  }, { connection, autorun: true })
  streakWorker.on('error', (e) => console.error('[streak-warning-worker]', e.message))

  const levelUpWorker = new Worker('level-up-notification', async (job) => {
    if (hasVapid) await sendPush(job.data.userId, `Level Up! You reached Level ${job.data.newLevel}`, "Keep building your habits!", '/dashboard')
  }, { connection, autorun: true })
  levelUpWorker.on('error', (e) => console.error('[level-up-worker]', e.message))

  const trophyWorker = new Worker('trophy-awarded', async (job) => {
    if (hasVapid) await sendPush(job.data.userId, 'Trophy Unlocked!', job.data.trophyName, '/trophies')
  }, { connection, autorun: true })
  trophyWorker.on('error', (e) => console.error('[trophy-worker]', e.message))

  const habitReminderWorker = new Worker('habit-reminder', async (job) => {
    if (hasVapid) await sendPush(job.data.userId, 'Habit Reminder', `Don't forget: ${job.data.habitName}`, '/dashboard')
  }, { connection, autorun: true })
  habitReminderWorker.on('error', (e) => console.error('[habit-reminder-worker]', e.message))

  const leagueWorker = new Worker('league-match', async (job) => {
    if (hasVapid) await sendPush(job.data.userId, 'League Match Result', job.data.result, '/league')
  }, { connection, autorun: true })
  leagueWorker.on('error', (e) => console.error('[league-match-worker]', e.message))

  const inactivityWorker = new Worker('inactivity-nudge', async (job) => {
    if (hasVapid) await sendPush(job.data.userId, "We miss you!", "You haven't logged a habit in a while.", '/dashboard')
  }, { connection, autorun: true })
  inactivityWorker.on('error', (e) => console.error('[inactivity-worker]', e.message))

  const welcomeWorker = new Worker('welcome-email', async (job) => {
    if (!hasResend) return
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'HabitManager FC <noreply@fmhabittracker.cloud>',
      to: job.data.email,
      subject: 'Welcome to HabitManager FC!',
      html: `<h2>Welcome${job.data.name ? ', ' + job.data.name : ''}!</h2><p>Start building winning habits today.</p>`
    })
  }, { connection, autorun: true })
  welcomeWorker.on('error', (e) => console.error('[welcome-email-worker]', e.message))

  console.log('[workers] Notification workers started successfully.')
}
