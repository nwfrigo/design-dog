'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

interface EventCounts {
  total: number
  byName: { event_name: string; count: number }[]
  byTemplate: { template_id: string; count: number }[]
  byUser: { user_id: string; count: number }[]
}

const PRESET_RANGES: { id: string; label: string; days: number | null }[] = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: 'all', label: 'All time', days: null },
]

function rangeToParams(rangeId: string): { start: string | null; end: string | null } {
  const preset = PRESET_RANGES.find((r) => r.id === rangeId)
  if (!preset || preset.days === null) return { start: null, end: null }
  const start = new Date()
  start.setDate(start.getDate() - preset.days + 1)
  start.setHours(0, 0, 0, 0)
  return { start: start.toISOString(), end: null }
}

export default function EventsPage() {
  const [counts, setCounts] = useState<EventCounts | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<string>('7d')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { start, end } = rangeToParams(range)
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    try {
      const res = await fetch(`/api/admin/events?${params.toString()}`)
      if (res.status === 401) {
        setError('Not authenticated. Visit /admin first.')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as EventCounts
      setCounts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }, [range])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="min-h-screen bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary">
      <header className="border-b border-gray-200 dark:border-line-subtle">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-gray-500 dark:text-content-secondary hover:text-gray-700 dark:hover:text-content-primary"
            >
              ← Admin
            </Link>
            <h1 className="text-lg font-medium">Telemetry events</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Range filter */}
        <div className="flex gap-2">
          {PRESET_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                range === r.id
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 dark:bg-surface-secondary dark:text-content-primary dark:border-line-subtle'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-sm text-gray-500 dark:text-content-secondary">Loading…</div>
        )}

        {counts && !isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Stat label="Total events" value={counts.total.toLocaleString()} />
              <Stat label="Distinct events" value={counts.byName.length.toString()} />
              <Stat label="Distinct templates" value={counts.byTemplate.length.toString()} />
            </div>

            <CountTable title="By event" rows={counts.byName.map((r) => ({ label: r.event_name, count: r.count }))} />
            <CountTable title="By template" rows={counts.byTemplate.map((r) => ({ label: r.template_id, count: r.count }))} />
            <CountTable title="By user (top 20)" rows={counts.byUser.map((r) => ({ label: r.user_id, count: r.count }))} />
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-secondary">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-content-secondary mb-1">{label}</div>
      <div className="text-2xl font-medium">{value}</div>
    </div>
  )
}

function CountTable({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0)
  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-content-secondary mb-2">{title}</h2>
      <div className="rounded border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-secondary overflow-hidden">
        {rows.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-content-secondary">No events.</div>
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
            <div className="w-16 text-right text-sm tabular-nums">{r.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
