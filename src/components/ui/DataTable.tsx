import { ReactNode } from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyField: keyof T
  emptyMessage?: string
}

export default function DataTable<T>({
  columns,
  rows,
  keyField,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#1a2236] border-b border-gray-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2 text-left text-gray-400 font-semibold uppercase tracking-wide ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={String(row[keyField])}
                className={`border-b border-gray-700 hover:bg-[#2d3748] transition-colors ${
                  i % 2 === 0 ? 'bg-[#252f3f]' : 'bg-[#1e2a3a]'
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2 text-gray-300 ${col.className || ''}`}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
