'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  AdminStat,
  AdminCountTable,
  AdminRangeChips,
  adminRangeToParams,
} from '@/components/admin/AdminPrimitives'

interface EventCounts {
  total: number
  byName: { event_name: string; count: number }[]
  byTemplate: { template_id: string; count: number }[]
  byUser: { user_id: string; count: number }[]
  byUserTemplateEvent: {
    user_id: string
    template_id: string
    event_name: string
    count: number
  }[]
}

type UserCard = {
  user_id: string
  total: number
  templates: {
    template_id: string
    total: number
    events: { event_name: string; count: number }[]
  }[]
}

/** Group the flat per-user × per-template × per-event rows into nested
 *  user cards for display. Sort: users by total desc, then templates by
 *  total desc within each user, then events by count desc within each
 *  template. */
function buildUserCards(
  rows: EventCounts['byUserTemplateEvent'],
): UserCard[] {
  const byUser = new Map<string, Map<string, Map<string, number>>>()
  for (const row of rows) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, new Map())
    const userMap = byUser.get(row.user_id)!
    if (!userMap.has(row.template_id)) userMap.set(row.template_id, new Map())
    const tplMap = userMap.get(row.template_id)!
    tplMap.set(row.event_name, (tplMap.get(row.event_name) ?? 0) + row.count)
  }

  const cards: UserCard[] = []
  Array.from(byUser.entries()).forEach(([user_id, userMap]) => {
    const templates: UserCard['templates'] = []
    let userTotal = 0
    Array.from(userMap.entries()).forEach(([template_id, tplMap]) => {
      const events = Array.from(tplMap.entries())
        .map(([event_name, count]) => ({ event_name, count }))
        .sort((a, b) => b.count - a.count)
      const tplTotal = events.reduce((s, e) => s + e.count, 0)
      userTotal += tplTotal
      templates.push({ template_id, total: tplTotal, events })
    })
    templates.sort((a, b) => b.total - a.total)
    cards.push({ user_id, total: userTotal, templates })
  })
  cards.sort((a, b) => b.total - a.total)
  return cards
}

export default function EventsPage() {
  const [counts, setCounts] = useState<EventCounts | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<string>('7d')

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { start, end } = adminRangeToParams(range)
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

  const userCards = useMemo(
    () => (counts ? buildUserCards(counts.byUserTemplateEvent) : []),
    [counts],
  )

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
        <AdminRangeChips value={range} onChange={setRange} />

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
              <AdminStat label="Total events" value={counts.total.toLocaleString()} />
              <AdminStat
                label="Interaction Types"
                value={counts.byName.length.toString()}
                subtitle="of 6 possible"
              />
              <AdminStat
                label="Distinct templates"
                value={counts.byTemplate.length.toString()}
              />
            </div>

            <AdminCountTable
              title="By event"
              rows={counts.byName.map((r) => ({ label: r.event_name, count: r.count }))}
              emptyText="No events."
            />
            <AdminCountTable
              title="By template"
              rows={counts.byTemplate.map((r) => ({ label: r.template_id, count: r.count }))}
              emptyText="No events."
            />

            <section>
              <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-content-secondary mb-2">
                By user
              </h2>
              {userCards.length === 0 ? (
                <div className="rounded border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-secondary px-4 py-3 text-sm text-gray-500 dark:text-content-secondary">
                  No events.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userCards.map((card) => (
                    <UserCardView key={card.user_id} card={card} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function UserCardView({ card }: { card: UserCard }) {
  // Bar denominator: largest single (template × event) count inside this
  // card. Keeps bars meaningful within one user without flattening tiny
  // users against an outsized top user.
  const max = Math.max(
    1,
    ...card.templates.flatMap((t) => t.events.map((e) => e.count)),
  )
  return (
    <div className="rounded border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-secondary overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-line-subtle">
        <div className="font-medium">{card.user_id}</div>
        <div className="text-sm text-gray-500 dark:text-content-secondary tabular-nums">
          {card.total.toLocaleString()} event{card.total === 1 ? '' : 's'} ·{' '}
          {card.templates.length} template{card.templates.length === 1 ? '' : 's'}
        </div>
      </div>
      <div>
        {card.templates.map((tpl) => (
          <div
            key={tpl.template_id}
            className="px-4 py-3 border-b border-gray-100 dark:border-line-subtle last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-mono">{tpl.template_id}</div>
              <div className="text-xs text-gray-400 dark:text-content-secondary tabular-nums">
                {tpl.total.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              {tpl.events.map((evt) => (
                <div key={evt.event_name} className="flex items-center gap-3">
                  <div className="flex-1 text-xs font-mono text-gray-500 dark:text-content-secondary truncate">
                    {evt.event_name}
                  </div>
                  <div className="w-32 h-1.5 bg-gray-100 dark:bg-surface-tertiary rounded overflow-hidden">
                    <div
                      className="h-full bg-gray-400 dark:bg-content-secondary"
                      style={{ width: `${(evt.count / max) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-xs tabular-nums text-gray-500 dark:text-content-secondary">
                    {evt.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
