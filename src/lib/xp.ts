export function calculateHabitXp(
  baseXp: number,
  trackingType: 'BOOLEAN' | 'QUANTITY',
  quantity?: number,
  quantityTarget?: number,
  personalBest?: number
): { xpEarned: number; bonusType?: string } {
  let xpEarned = baseXp
  let bonusType: string | undefined

  if (trackingType === 'QUANTITY' && quantity !== undefined && quantity !== null) {
    if (quantityTarget !== undefined && quantityTarget !== null && quantityTarget > 0) {
      if (quantity >= quantityTarget) {
        xpEarned += 5
        if (quantity >= quantityTarget * 1.1) {
          xpEarned += 10
        }
      }
    }
    if (personalBest !== undefined && personalBest !== null && quantity > personalBest) {
      xpEarned += 25
      bonusType = 'PB_BONUS'
    }
  }

  return { xpEarned, bonusType }
}
