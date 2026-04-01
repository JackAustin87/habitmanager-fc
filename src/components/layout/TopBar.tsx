export default function TopBar() {
  const managerName = 'Manager'
  const season = 'Q2 2026'
  const level = 1
  const xp = 0
  const xpToNext = 100
  const xpPercent = Math.round((xp / xpToNext) * 100)

  return (
    <div className="bg-[#2d3748] border-b border-gray-600 px-4 py-2 flex items-center gap-4 text-xs flex-shrink-0">
      <span className="text-fm-gold font-bold tracking-wide">MGR: {managerName}</span>
      <span className="text-gray-600">|</span>
      <span className="text-gray-400">SEASON {season}</span>
      <span className="text-gray-600">|</span>
      <span className="text-gray-300">
        LVL <span className="text-white font-bold">{level}</span>
      </span>
      <span className="text-gray-600">|</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">XP</span>
        <div className="w-24 bg-gray-700 rounded h-1.5">
          <div
            className="bg-fm-gold h-1.5 rounded transition-all duration-300"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <span className="text-gray-400">
          {xp}/{xpToNext}
        </span>
      </div>
    </div>
  )
}
