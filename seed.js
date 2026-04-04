const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const BOT_TEAMS = [
  { name: 'Ironvale FC', botStrength: 85 },
  { name: 'Crestwood United', botStrength: 78 },
  { name: 'Northgate Athletic', botStrength: 72 },
  { name: 'Riverside Rovers', botStrength: 68 },
  { name: 'Thornfield City', botStrength: 65 },
  { name: 'Westbrook Wanderers', botStrength: 60 },
  { name: 'Redmill Town', botStrength: 55 },
  { name: 'Hartley Borough', botStrength: 52 },
  { name: 'Elmwood Rangers', botStrength: 48 },
  { name: 'Foxbridge FC', botStrength: 45 },
  { name: 'Graymoor United', botStrength: 40 },
  { name: 'Saltwick City', botStrength: 35 },
  { name: 'Pennfield Athletic', botStrength: 30 },
  { name: 'Dunmore FC', botStrength: 25 },
]

async function main() {
  // Update Jack Austin to Austin's Army (only if teamName not already set)
  const jackAustin = await prisma.user.findFirst({
    where: { email: 'me@jackamaustin.com' }
  })

  if (jackAustin && !jackAustin.teamName) {
    const passwordHash = await bcrypt.hash('HabitFC2026', 10)
    await prisma.user.update({
      where: { id: jackAustin.id },
      data: {
        teamName: "Austin's Army",
        passwordHash,
        isBot: false,
      }
    })
    console.log("Seeded: Austin's Army")
  } else if (jackAustin) {
    console.log("Jack Austin already seeded, skipping")
  }

  // Insert bot teams (skip if teamName already exists)
  for (const bot of BOT_TEAMS) {
    const existing = await prisma.user.findFirst({
      where: { teamName: bot.name }
    })
    if (!existing) {
      await prisma.user.create({
        data: {
          name: bot.name,
          email: `bot.${bot.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@habitmanager.internal`,
          teamName: bot.name,
          isBot: true,
          botStrength: bot.botStrength,
        }
      })
      console.log(`Created bot: ${bot.name}`)
    }
  }

  console.log('Seed complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
