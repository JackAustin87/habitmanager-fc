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


  // Phase 6: GlobalQuote seeds (50 quotes, idempotent upsert by text)
  const globalQuotes = [
    { text: "It is not the mountain we conquer, but ourselves.", author: "Edmund Hillary", bookTitle: "View from the Summit" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", bookTitle: "The Autobiography of Mark Twain" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", bookTitle: "The Second World War" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun", bookTitle: "In the Presence of My Enemies" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", bookTitle: "Nicomachean Ethics" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", bookTitle: "Atomic Habits" },
    { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear", bookTitle: "Atomic Habits" },
    { text: "The most powerful thing you can do is show up. Every single day.", author: "James Clear", bookTitle: "Atomic Habits" },
    { text: "Goals are good for setting a direction, but systems are best for making progress.", author: "James Clear", bookTitle: "Atomic Habits" },
    { text: "Habits are the compound interest of self-improvement.", author: "James Clear", bookTitle: "Atomic Habits" },
    { text: "The quality of your life depends on the quality of your habits.", author: "James Clear", bookTitle: "Atomic Habits" },
    { text: "The first step is to establish that something is possible; then probability will occur.", author: "Elon Musk", bookTitle: "Elon Musk" },
    { text: "Hard choices, easy life. Easy choices, hard life.", author: "Jerzy Gregorek", bookTitle: "The Happy Body" },
    { text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", author: "John Maxwell", bookTitle: "The 15 Invaluable Laws of Growth" },
    { text: "A man who masters himself can conquer any opponent.", author: "Alexis Carrel", bookTitle: "Man, The Unknown" },
    { text: "The chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson", bookTitle: "The Rambler" },
    { text: "Confidence is the result of hours and days and weeks and years of constant work and dedication.", author: "Roger Staubach", bookTitle: "First Down, Lifetime to Go" },
    { text: "All big things come from small beginnings.", author: "James Clear", bookTitle: "Atomic Habits" },
    { text: "The obstacle is the way.", author: "Ryan Holiday", bookTitle: "The Obstacle Is the Way" },
    { text: "Stillness is the key to unlocking the insights, energy, and clarity that makes great work possible.", author: "Ryan Holiday", bookTitle: "Stillness Is the Key" },
    { text: "A man who wants to lead the orchestra must turn his back on the crowd.", author: "Max Lucado", bookTitle: "In the Eye of the Storm" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela", bookTitle: "Long Walk to Freedom" },
    { text: "The secret of success is learning how to use pain and pleasure instead of having pain and pleasure use you.", author: "Tony Robbins", bookTitle: "Awaken the Giant Within" },
    { text: "You can't build a reputation on what you are going to do.", author: "Henry Ford", bookTitle: "My Life and Work" },
    { text: "Do not wait; the time will never be just right. Start where you stand.", author: "Napoleon Hill", bookTitle: "Think and Grow Rich" },
    { text: "Whatever the mind can conceive and believe, it can achieve.", author: "Napoleon Hill", bookTitle: "Think and Grow Rich" },
    { text: "Success is nothing more than a few simple disciplines, practiced every day.", author: "Jim Rohn", bookTitle: "The Five Major Pieces to the Life Puzzle" },
    { text: "Either you run the day, or the day runs you.", author: "Jim Rohn", bookTitle: "The Five Major Pieces to the Life Puzzle" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", bookTitle: "The Five Major Pieces to the Life Puzzle" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", bookTitle: "The Seasons of Life" },
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", bookTitle: "Striking Thoughts" },
    { text: "If you spend too much time thinking about a thing, you'll never get it done.", author: "Bruce Lee", bookTitle: "The Art of Expressing the Human Body" },
    { text: "Long-term consistency trumps short-term intensity.", author: "Bruce Lee", bookTitle: "Bruce Lee: Artist of Life" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", bookTitle: "Long Walk to Freedom" },
    { text: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb", bookTitle: "A Treasury of Jewish Wisdom" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin", bookTitle: "The Way to Wealth" },
    { text: "The mind is everything. What you think you become.", author: "James Allen", bookTitle: "As a Man Thinketh" },
    { text: "As a man thinketh in his heart, so is he.", author: "James Allen", bookTitle: "As a Man Thinketh" },
    { text: "Cherish your visions and your dreams, as they are the children of your soul.", author: "Napoleon Hill", bookTitle: "Think and Grow Rich" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", bookTitle: "The World As I See It" },
    { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles Swindoll", bookTitle: "Strengthening Your Grip" },
    { text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.", author: "Zig Ziglar", bookTitle: "See You at the Top" },
    { text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn", bookTitle: "7 Strategies for Wealth and Happiness" },
    { text: "The more you sweat in training, the less you bleed in battle.", author: "Richard Marcinko", bookTitle: "Rogue Warrior" },
    { text: "Champions keep playing until they get it right.", author: "Billie Jean King", bookTitle: "Pressure is a Privilege" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", bookTitle: "You Don't Have to Be in Who's Who to Know What's What" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", bookTitle: "Days of Grace" },
    { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin", bookTitle: "Poor Richard's Almanack" },
    { text: "The secret to getting ahead is getting started.", author: "Agatha Christie", bookTitle: "An Autobiography" },
    { text: "A year from now you may wish you had started today.", author: "Karen Lamb", bookTitle: "A Perfect Distance" },
  ]

  for (const quote of globalQuotes) {
    await prisma.globalQuote.upsert({
      where: { text: quote.text },
      update: {},
      create: quote,
    })
  }
  console.log(`Seeded ${globalQuotes.length} GlobalQuotes`)

  // Phase 6: RewardCatalogItem seeds (3 items, idempotent upsert by name)
  const rewardItems = [
    {
      name: "Strength Boost",
      description: "Your team plays at +10 strength for 7 days",
      xpCost: 500,
      effectType: "strength_boost",
      effectDuration: 7,
      isActive: true,
    },
    {
      name: "Double XP Day",
      description: "Earn 2x XP from habits for 24 hours",
      xpCost: 300,
      effectType: "double_xp",
      effectDuration: 1,
      isActive: true,
    },
    {
      name: "Rest Day Forgiveness",
      description: "Protects your streak if you miss one day",
      xpCost: 200,
      effectType: "streak_shield",
      effectDuration: 1,
      isActive: true,
    },
  ]

  for (const item of rewardItems) {
    await prisma.rewardCatalogItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    })
  }
  console.log('Seeded 3 RewardCatalogItems')

  console.log('Seed complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
