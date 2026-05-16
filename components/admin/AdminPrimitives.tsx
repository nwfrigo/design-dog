'use client'

/**
 * Shared primitives for the admin surface (`/admin` and `/admin/events`).
 *
 * Kept intentionally minimal — these wrap the rounded-border / mono-label /
 * bar-viz pattern used across both pages so adding a stat panel or count
 * table is a one-import job instead of copy-paste between page files.
 */

export interface AdminStatProps {
  label: string
  value: string | number
  subtitle?: string
}

export function AdminStat({ label, value, subtitle }: AdminStatProps) {
  return (
    <div className="p-4 rounded border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-secondary">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-content-secondary mb-1">
        {label}
      </div>
      <div className="text-2xl font-medium">{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-400 dark:text-content-secondary mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  )
}

export interface AdminCountTableProps {
  title: string
  rows: { label: string; count: number }[]
  emptyText?: string
  /** Optional override of the bar-width denominator. Defaults to the max
   *  count in `rows`. Use this when you want bars across multiple tables
   *  to share the same scale. */
  maxOverride?: number
}

export function AdminCountTable({
  title,
  rows,
  emptyText = 'No data.',
  maxOverride,
}: AdminCountTableProps) {
  const max = maxOverride ?? rows.reduce((m, r) => Math.max(m, r.count), 0)
  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-content-secondary mb-2">
        {title}
      </h2>
      <div className="rounded border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-secondary overflow-hidden">
        {rows.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-content-secondary">
            {emptyText}
          </div>
        )}
        {rows.map((r) => (
          <div
            key={r.label}
            className="px-4 py-2 border-b border-gray-100 dark:border-line-subtle last:border-b-0 flex items-center gap-3"
          >
            <div className="flex-1 text-sm font-mono truncate">{r.label}</div>
            <div className="w-32 h-2 bg-gray-100 dark:bg-surface-tertiary rounded overflow-hidden">
              <div
                className="h-full bg-gray-400 dark:bg-content-secondary"
                style={{ width: `${max > 0 ? (r.count / max) * 100 : 0}%` }}
              />
            </div>
            <div className="w-16 text-right text-sm tabular-nums">
              {r.count.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export interface AdminRangePreset {
  id: string
  label: string
  /** null = no upper bound (all time). */
  days: number | null
}

export const ADMIN_RANGE_PRESETS: AdminRangePreset[] = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'all', label: 'All time', days: null },
]

export function adminRangeToParams(rangeId: string): {
  start: string | null
  end: string | null
} {
  const preset = ADMIN_RANGE_PRESETS.find((r) => r.id === rangeId)
  if (!preset || preset.days === null) return { start: null, end: null }
  const start = new Date()
  start.setDate(start.getDate() - preset.days + 1)
  start.setHours(0, 0, 0, 0)
  return { start: start.toISOString(), end: null }
}

export interface AdminRangeChipsProps {
  value: string
  onChange: (id: string) => void
}

export function AdminRangeChips({ value, onChange }: AdminRangeChipsProps) {
  return (
    <div className="flex gap-2">
      {ADMIN_RANGE_PRESETS.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            value === r.id
              ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 dark:bg-surface-secondary dark:text-content-primary dark:border-line-subtle'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
