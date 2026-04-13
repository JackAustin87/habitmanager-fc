import { Queue } from 'bullmq'

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379'
const match = redisUrl.match(/redis:\/\/([^:]+)(?::(\d+))?/)
const connection = { host: match?.[1] || 'redis', port: parseInt(match?.[2] || '6379') }

export const dailyReminderQueue = new Queue('daily-reminder', { connection })
export const weeklyDigestQueue = new Queue('weekly-digest', { connection })
export const streakWarningQueue = new Queue('streak-warning', { connection })
export const levelUpQueue = new Queue('level-up-notification', { connection })
export const trophyQueue = new Queue('trophy-awarded', { connection })
export const habitReminderQueue = new Queue('habit-reminder', { connection })
export const leagueMatchQueue = new Queue('league-match', { connection })
export const inactivityQueue = new Queue('inactivity-nudge', { connection })
export const welcomeEmailQueue = new Queue('welcome-email', { connection })
export const pushNotificationQueue = new Queue('push-notification', { connection })
