interface StatPanelProps {
  label: string
  value: string
}

export default function StatPanel({ label, value }: StatPanelProps) {
  return (
    <div className="bg-blue-900/40 border border-blue-700/50 rounded p-3 text-center">
      <div className="text-fm-gold font-bold text-xl">{value}</div>
      <div className="text-blue-300 text-xs mt-1">{label}</div>
    </div>
  )
}
