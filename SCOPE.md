# HabitManager FC — Full Project Scope

## Overview

HabitManager FC is a habit-tracking app with Football Manager aesthetics. Up to 2 real managers compete against 14 AI-controlled bot teams in a league and cup competition. XP earned from completing daily habits drives in-game performance.

**URL:** https://fmhabittracker.cloud  
**VPS:** 217.196.49.233  
**Stack:** Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL 16, Redis, Caddy, Docker Compose

---

## Phase 1: Foundation ✅ DONE

- Next.js 14.2.5 app with FM-theme (navy `#1a2236`, gold `#d69e2e`)
- Habit tracking with categories (Health, Mind, Work, Body)
- XP system (base 10 XP per habit, multipliers for streaks)
- Authentication (iron-session v8, cookie: `hmfc-session`)
- Dashboard with streak tracking
- Sidebar navigation + bottom mobile nav
- PostgreSQL via Prisma ORM, Redis for session state
- Docker Compose deployment on VPS with Caddy HTTPS

---

## Phase 2: Multi-User League & Cup ✅ DONE

- Up to 2 real managers + 14 AI bot teams
- Registration with unique club name + password (bcryptjs)
- League table: 30 matchdays via circle algorithm (round-robin), 1 matchday per day
  - Real users: XP sum from habits = match score
  - Bots: deterministic seeded random based on `botStrength` (25–85)
  - Points: Win 3, Draw 1, Loss 0
- 4-round cup competition (Round of 16 → QF → SF → Final)
  - Weekly rounds (each round advances after 7 days)
- FM-style league table UI with gold highlighting for current user
- Cup bracket UI with TBD slots and winner progression
- Sidebar + bottom nav updated with Cup link
- Season kickoff requires 2 real managers

**Teams seeded:**
- Austin's Army (me@jackamaustin.com) — real manager
- 14 bot teams: Ironvale FC (strength 85) down to Dunmore FC (strength 25)

---

## Phase 3: Calendar 🔲 TODO

- Monthly calendar view showing habit completion dots per day
- Color-coded by category (Health / Mind / Work / Body)
- Click a day to see which habits were completed
- CalDAV sync with Apple Calendar
  - User provides Apple ID + app-specific password in Settings
  - Habit completions push as calendar events

**External dependency:** Apple CalDAV credentials (user provides in Settings UI after Settings page is built in Phase 8)

---

## Phase 4: Nutrition 🔲 TODO

- Natural language meal logging: "I had a chicken sandwich and a coffee"
- Claude API parses input → estimates calories + macros (protein, carbs, fat)
- Daily nutrition view with progress bars vs. configurable targets
- Macro targets set in Settings page (Phase 8)
- XP bonus for hitting daily calorie target
- Graceful degradation: shows "Add Claude API key in Settings" if key absent

**External dependency:** `CLAUDE_API_KEY` environment variable

---

## Phase 5: Notifications 🔲 TODO

- Web Push notifications (browser push, works on mobile PWA)
  - Daily habit reminder (configurable time)
  - League match result alerts
  - Cup round advancement alerts
- Email digests
  - Daily summary (optional): habits done, XP earned, league position
  - Weekly summary: week recap, cup result, league table snapshot
- BullMQ background jobs (10 jobs) running in Docker using existing Redis
  - Workers: match processor, cup advancer, push sender, email sender, daily reminder, weekly digest, etc.
- Graceful degradation: shows "Configure in Settings" if credentials absent

**External dependencies:**
- VAPID keys (can auto-generate via `web-push` library)
- Email service: Resend API key (or SendGrid / SMTP)

---

## Phase 6: Transfer Market + Book Quotes 🔲 TODO

### Transfer Market
- XP rewards shop: spend `spendableXp` on boosts (separate from match-score XP)
- Reward types: strength boost (7 days), double XP day, rest day forgiveness
- Reward catalog seeded in DB; transaction history tracked
- `spendableXp` field on User — earned alongside `totalXp`, but only decrements here

### Book Quotes
- 50+ hand-picked motivational book quotes seeded in database
- Daily quote shown on dashboard
- Quotes rotate daily (deterministic by date)

**No external dependencies.**

---

## Phase 7: Analytics 🔲 TODO

- 8 chart types:
  1. Daily XP over time (line chart, 30/90/365 day range)
  2. Habit completion rate by category (bar chart)
  3. Streak history (calendar heatmap)
  4. XP distribution by habit (donut chart)
  5. League position over time (line chart)
  6. Win/draw/loss breakdown (bar chart)
  7. Weekly XP trend vs. league average
  8. Habit completion time-of-day (histogram)
- Weekly PDF report (downloadable)
- CSV + JSON data export for all habit/XP data

**No external dependencies.** (PDF via jsPDF or similar)

---

## Phase 8: Trophies + Settings 🔲 TODO

### Trophies & Achievements
- Trophy cabinet: earned achievements displayed FM-style
- Achievement types: streak milestones (7/30/90/365 days), XP milestones, cup wins, league wins, category completions
- Level-up celebration: animated overlay when XP threshold crossed
- Trophy data in PostgreSQL

### Settings Page
- Profile: change club name, change password
- Nutrition targets: daily calorie + macro goals (used by Phase 4)
- Notification preferences: toggle push/email, set reminder time (used by Phase 5)
- CalDAV connection: enter Apple ID + app password (used by Phase 3)
- Data export: trigger CSV/JSON download
- Danger zone: delete account

---

## Recommended Build Order

| # | Phase | Reason |
|---|-------|--------|
| 1 | **Phase 6** — Transfer Market + Book Quotes | No external deps, self-contained |
| 2 | **Phase 8** — Trophies + Settings | Settings UI needed before Phase 3/4/5 can be configured |
| 3 | **Phase 3** — Calendar | Requires Settings for CalDAV credentials |
| 4 | **Phase 7** — Analytics | Pure data viz, no dependencies |
| 5 | **Phase 4** — Nutrition | Requires Claude API key |
| 6 | **Phase 5** — Notifications | Most complex infra, save for last |

---

## Credentials Needed

| Phase | Credential | Where to Set | Status |
|-------|-----------|-------------|--------|
| Phase 4 | `CLAUDE_API_KEY` | `.env` on VPS | Not yet provided |
| Phase 5 | `RESEND_API_KEY` (or SMTP) | `.env` on VPS | Not yet provided |
| Phase 5 | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | `.env` on VPS | Can auto-generate |
| Phase 3 | Apple CalDAV credentials | Settings UI in-app | Entered by user per account |

---

## Tech Stack Reference

```
Next.js 14.2.5 (App Router)
TypeScript
Prisma ORM → PostgreSQL 16
Redis (BullMQ queues + session)
iron-session v8 (cookie: hmfc-session)
bcryptjs (password hashing)
Caddy (HTTPS reverse proxy)
Docker Compose (multi-stage Dockerfile)
FM colors: navy #1a2236, gold #d69e2e
```

---

## Known Issues / Tech Debt

- `package-lock.json` on VPS may be ahead of git (bcryptjs added during live Docker build)
- Seed script re-runs on every container start (idempotent, but adds ~1s startup)
- No test suite yet
- No error boundary components
