'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface ExportLog {
  id: number
  template_type: string
  exported_by: string | null
  headline: string | null
  solution: string | null
  format: string
  scale: number
  thumbnail_url: string | null
  created_at: string
}

interface ExportStats {
  total: number
  today: number
  thisWeek: number
  byTemplate: Record<string, number>
  byPerson: Record<string, number>
  dailyCounts: { date: string; count: number }[]
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Dashboard state
  const [logs, setLogs] = useState<ExportLog[]>([])
  const [stats, setStats] = useState<ExportStats | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [filterPerson, setFilterPerson] = useState('')
  const [filterTemplate, setFilterTemplate] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxIsPdf, setLightboxIsPdf] = useState(false)
  const [totalRange, setTotalRange] = useState<'today' | 'thisWeek' | 'allTime'>('allTime')

  const limit = 25

  // Check if already authenticated
  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => {
        if (res.ok) setIsAuthenticated(true)
      })
      .catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setAuthError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        setAuthError('Invalid password')
      }
    } catch {
      setAuthError('Login failed')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    if (filterPerson) params.set('exportedBy', filterPerson)
    if (filterTemplate) params.set('templateType', filterTemplate)
    if (filterSearch) params.set('search', filterSearch)

    try {
      const res = await fetch(`/api/admin/exports?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setTotal(data.total)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }, [page, filterPerson, filterTemplate, filterSearch])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs()
      fetchStats()
    }
  }, [isAuthenticated, fetchLogs, fetchStats])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filterPerson, filterTemplate, filterSearch])

  const totalPages = Math.ceil(total / limit)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatTemplateName = (name: string) => {
    return name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-surface-primary flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white dark:bg-surface-secondary rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-content-primary mb-1">Design Dog Admin</h1>
          <p className="text-sm text-gray-500 dark:text-content-secondary mb-6">Enter the admin password to continue.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          {authError && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{authError}</p>}
          <button
            type="submit"
            disabled={isLoggingIn || !password}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoggingIn ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-primary">
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => { setLightboxUrl(null); setLightboxIsPdf(false) }}
        >
          {lightboxIsPdf ? (
            <div
              className="w-[90vw] h-[90vh] rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <embed
                src={lightboxUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
          ) : (
            <img
              src={lightboxUrl}
              alt="Export preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-surface-secondary border-b border-gray-200 dark:border-line-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-content-primary">Design Dog Admin</h1>
            <p className="text-sm text-gray-500 dark:text-content-secondary">Export monitoring dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/admin/events" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Events →
            </a>
            <a href="/" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Back to app
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats cards */}
        {stats && (
          <div className="flex flex-wrap gap-4 mb-8">
            {/* Total exports with range dropdown */}
            <div className="bg-white dark:bg-surface-secondary rounded-xl border border-gray-200 dark:border-line-subtle p-4 min-w-[160px] w-fit">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wider">Exports</p>
                <select
                  value={totalRange}
                  onChange={(e) => setTotalRange(e.target.value as 'today' | 'thisWeek' | 'allTime')}
                  className="text-xs text-gray-500 dark:text-content-secondary border-none bg-transparent dark:bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="allTime">All Time</option>
                </select>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-content-primary">
                {totalRange === 'today' ? stats.today : totalRange === 'thisWeek' ? stats.thisWeek : stats.total}
              </p>
            </div>
            <StatCard
              label="Most Active"
              value={
                Object.keys(stats.byPerson).length > 0
                  ? Object.entries(stats.byPerson).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A'
              }
              subtitle={
                Object.keys(stats.byPerson).length > 0
                  ? `${Object.entries(stats.byPerson).sort((a, b) => b[1] - a[1])[0][1]} exports`
                  : undefined
              }
            />
          </div>
        )}

        {/* Chart — exports by template */}
        {stats && Object.keys(stats.byTemplate).length > 0 && (
          <div className="bg-white dark:bg-surface-secondary rounded-xl border border-gray-200 dark:border-line-subtle p-6 mb-8">
            <h2 className="text-sm font-medium text-gray-700 dark:text-content-primary mb-6">Exports by template</h2>
            <div className="space-y-3">
              {Object.entries(stats.byTemplate)
                .sort((a, b) => b[1] - a[1])
                .map(([template, count]) => {
                  const max = Math.max(...Object.values(stats.byTemplate))
                  const pct = max > 0 ? (count / max) * 100 : 0
                  return (
                    <div key={template} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 dark:text-content-secondary w-44 shrink-0 truncate">{formatTemplateName(template)}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-surface-primary rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-content-primary w-6 text-right shrink-0">{count}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-surface-secondary rounded-xl border border-gray-200 dark:border-line-subtle p-4 mb-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search headlines..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary text-sm text-gray-900 dark:text-content-primary placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            {stats && Object.keys(stats.byPerson).length > 0 && (
              <select
                value={filterPerson}
                onChange={(e) => setFilterPerson(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary text-sm text-gray-900 dark:text-content-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All people</option>
                {Object.keys(stats.byPerson)
                  .sort()
                  .map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            )}
            {stats && Object.keys(stats.byTemplate).length > 0 && (
              <select
                value={filterTemplate}
                onChange={(e) => setFilterTemplate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary text-sm text-gray-900 dark:text-content-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All templates</option>
                {Object.keys(stats.byTemplate)
                  .sort()
                  .map((t) => (
                    <option key={t} value={t}>
                      {formatTemplateName(t)}
                    </option>
                  ))}
              </select>
            )}
            {(filterPerson || filterTemplate || filterSearch) && (
              <button
                onClick={() => {
                  setFilterPerson('')
                  setFilterTemplate('')
                  setFilterSearch('')
                }}
                className="px-3 py-2 text-sm text-gray-500 dark:text-content-secondary hover:text-gray-700 dark:hover:text-content-primary"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Export logs table */}
        <div className="bg-white dark:bg-surface-secondary rounded-xl border border-gray-200 dark:border-line-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-line-subtle text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wider">Preview</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wider">Template</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wider">Exported By</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wider">Headline</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-line-subtle">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-content-secondary">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-content-secondary text-sm">
                    No exports found{filterPerson || filterTemplate || filterSearch ? ' matching filters' : ' yet'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-interactive-hover transition-colors">
                    <td className="px-4 py-3">
                      {log.thumbnail_url && log.format !== 'pdf' ? (
                        <button onClick={() => { setLightboxUrl(log.thumbnail_url); setLightboxIsPdf(false) }}>
                          <img
                            src={log.thumbnail_url}
                            alt={log.template_type}
                            className="w-20 h-auto rounded border border-gray-100 dark:border-line-subtle hover:opacity-80 transition-opacity"
                          />
                        </button>
                      ) : log.thumbnail_url && log.format === 'pdf' ? (
                        <button
                          onClick={() => { setLightboxUrl(log.thumbnail_url); setLightboxIsPdf(true) }}
                          className="w-20 h-12 rounded border border-gray-100 dark:border-line-subtle bg-gray-50 dark:bg-surface-primary flex items-center justify-center hover:bg-gray-100 dark:hover:bg-interactive-hover transition-colors group"
                        >
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">PDF</span>
                        </button>
                      ) : (
                        <div className="w-20 h-12 rounded border border-gray-100 dark:border-line-subtle bg-gray-50 dark:bg-surface-primary flex items-center justify-center text-gray-300 dark:text-content-secondary text-xs">
                          {log.format === 'pdf' ? 'PDF' : '—'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {formatTemplateName(log.template_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-content-primary">
                      {log.exported_by || <span className="text-gray-400 dark:text-content-secondary">Unknown</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-content-secondary max-w-xs truncate">
                      {log.headline || <span className="text-gray-300 dark:text-content-secondary opacity-50">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-content-secondary whitespace-nowrap">{formatDate(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 dark:border-line-subtle px-4 py-3 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-content-secondary">
                {total} total export{total !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-line-subtle text-gray-600 dark:text-content-secondary hover:bg-gray-50 dark:hover:bg-interactive-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-500 dark:text-content-secondary">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-line-subtle text-gray-600 dark:text-content-secondary hover:bg-gray-50 dark:hover:bg-interactive-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="bg-white dark:bg-surface-secondary rounded-xl border border-gray-200 dark:border-line-subtle p-4 min-w-[160px] w-fit">
      <p className="text-xs font-medium text-gray-500 dark:text-content-secondary uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-content-primary">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-content-secondary mt-0.5">{subtitle}</p>}
    </div>
  )
}
