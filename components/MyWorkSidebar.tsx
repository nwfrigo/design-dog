'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PanelLeft, Copy, Pencil, Eye, Loader2, ArrowUpRight } from 'lucide-react'
import { useStore } from '@/store'
import { getStoredUser } from '@/components/NamePickerModal'
import { DRAFT_SHAPE_VERSION } from '@/lib/draft-storage'
import { TEMPLATE_LABELS } from '@/lib/template-config'
import type { TemplateType } from '@/types'

/**
 * MyWorkSidebar — the persistent "your previous work" rail on the home screen.
 *
 * Reads the current identity (NamePickerModal's stored name) and lists that
 * person's export history from the export log: thumbnail, template, date, and
 * — where a snapshot was captured at export time — Edit / Clone actions that
 * restore the exact editor state as a fresh draft. Exports made before
 * snapshot capture shipped render with Preview only.
 *
 * Deliberately flat: newest first, a type filter, no folders. Collapse state
 * persists per browser (`design-dog-mywork-collapsed`). Home-screen only —
 * inside the editor the left edge belongs to the Stage & Bench rail.
 */

type ExportRow = {
  id: number
  template_type: string
  exported_by: string | null
  headline: string | null
  format: string
  thumbnail_url: string | null
  created_at: string
  has_snapshot?: boolean
  snapshot_version?: number | null
}

const COLLAPSE_KEY = 'design-dog-mywork-collapsed'

type TypeFilter = 'all' | 'email' | 'social' | 'web' | 'pdf'

const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'email', label: 'Email' },
  { id: 'social', label: 'Social' },
  { id: 'web', label: 'Web' },
  { id: 'pdf', label: 'PDF' },
]

function matchesFilter(row: ExportRow, filter: TypeFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'pdf') return row.format === 'pdf'
  if (filter === 'email') return row.template_type.startsWith('email') || row.template_type.startsWith('newsletter')
  if (filter === 'social') return row.template_type.startsWith('social')
  return row.template_type.startsWith('website')
}

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime()
  const hours = Math.floor((Date.now() - then) / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function MyWorkSidebar() {
  const router = useRouter()
  const loadExportSnapshotIntoEditor = useStore((s) => s.loadExportSnapshotIntoEditor)
  const setCurrentScreen = useStore((s) => s.setCurrentScreen)

  const [collapsed, setCollapsed] = useState(true)
  const [rows, setRows] = useState<ExportRow[] | null>(null)
  const [filter, setFilter] = useState<TypeFilter>('all')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [previewRow, setPreviewRow] = useState<ExportRow | null>(null)
  const [user, setUser] = useState<string | null>(null)

  // Collapse state + identity are browser-local; read after mount to stay
  // SSR-safe.
  useEffect(() => {
    setUser(getStoredUser())
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'true')
    } catch { /* default expanded */ }
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      try { localStorage.setItem(COLLAPSE_KEY, String(!prev)) } catch { /* fine */ }
      return !prev
    })
  }

  useEffect(() => {
    if (!user || collapsed) return
    let cancelled = false
    fetch(`/api/my-exports?by=${encodeURIComponent(user)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fetch failed'))))
      .then((data) => { if (!cancelled) setRows(data.logs ?? []) })
      .catch(() => { if (!cancelled) setRows([]) })
    return () => { cancelled = true }
  }, [user, collapsed])

  const restore = useCallback(async (row: ExportRow) => {
    setBusyId(row.id)
    try {
      const res = await fetch(`/api/my-exports?snapshot=${row.id}`)
      if (!res.ok) throw new Error('snapshot fetch failed')
      const data = await res.json()
      // Version gate: refuse an incompatible shape instead of restoring
      // garbage into the editor.
      if (!data.snapshot || (data.snapshot_version ?? DRAFT_SHAPE_VERSION) !== DRAFT_SHAPE_VERSION) {
        throw new Error('incompatible snapshot')
      }
      loadExportSnapshotIntoEditor(data.snapshot as Record<string, unknown>)
      setCurrentScreen('editor')
      router.push('/editor')
    } catch (error) {
      console.error('Clone failed:', error)
      setBusyId(null)
    }
  }, [loadExportSnapshotIntoEditor, setCurrentScreen, router])

  // No identity picked yet → nothing personal to show.
  if (!user) return null

  if (collapsed) {
    return (
      <div className="flex-shrink-0 pt-1">
        <button
          onClick={toggleCollapsed}
          title="Show my work"
          className="p-1.5 rounded-md text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-primary hover:bg-gray-100 dark:hover:bg-interactive-hover transition-colors"
        >
          <PanelLeft size={16} strokeWidth={1.5} />
        </button>
      </div>
    )
  }

  const visible = (rows ?? []).filter((r) => matchesFilter(r, filter))

  return (
    <aside className="w-[300px] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-line-subtle pr-5 mr-6 min-h-0">
      {/* Rail header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-[5px] h-[5px] bg-[#D35F0B] rounded-[1px]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-900 dark:text-content-primary">My work</span>
          {rows !== null && (
            <span className="font-mono text-[10px] uppercase text-gray-400 dark:text-content-secondary">{rows.length}</span>
          )}
        </div>
        <button
          onClick={toggleCollapsed}
          title="Hide my work"
          className="p-1.5 rounded-md text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-primary hover:bg-gray-100 dark:hover:bg-interactive-hover transition-colors"
        >
          <PanelLeft size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 mt-3">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`font-mono text-[9px] uppercase tracking-wide px-2 py-1 rounded border transition-colors ${
              filter === f.id
                ? 'border-gray-900 dark:border-content-primary bg-gray-100 dark:bg-surface-tertiary text-gray-900 dark:text-content-primary'
                : 'border-gray-300 dark:border-line-subtle text-gray-500 dark:text-content-secondary hover:border-gray-400 dark:hover:border-content-secondary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Thumb grid */}
      <div className="mt-4 overflow-y-auto min-h-0 flex-1 pb-4">
        {rows === null ? (
          <div className="flex items-center gap-2 text-gray-400 dark:text-content-secondary font-mono text-[10px] uppercase pt-4">
            <Loader2 size={12} className="animate-spin" /> Loading
          </div>
        ) : visible.length === 0 ? (
          <div className="font-mono text-[10px] uppercase leading-relaxed text-gray-400 dark:text-content-secondary pt-4">
            {rows.length === 0 ? 'Nothing yet — your exports will collect here.' : 'No exports of this type yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((row) => (
              <div key={row.id} className="group">
                <div className="relative h-[74px] rounded-md overflow-hidden border border-gray-200 dark:border-line-subtle bg-gray-50 dark:bg-surface-secondary transition-[border-color,box-shadow] duration-150 group-hover:border-gray-300 dark:group-hover:border-content-secondary/40 group-hover:shadow-[0_2px_10px_rgba(6,0,21,0.08)]">
                  {row.thumbnail_url && row.format !== 'pdf' ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={row.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] uppercase tracking-wide text-gray-400 dark:text-content-secondary">
                      {row.format === 'pdf' ? 'PDF' : 'No preview'}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="font-mono text-[7.5px] uppercase tracking-wide text-gray-400 dark:text-content-secondary truncate pr-1">
                    {(TEMPLATE_LABELS[row.template_type as TemplateType] ?? row.template_type)} &middot; {relativeDate(row.created_at)}
                  </div>
                  {/* Subtle hover actions: hidden until the cell is hovered,
                      then quiet icon buttons — no chunky chrome. */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {row.has_snapshot && (
                      <>
                        <button
                          title="Edit — reopen this asset"
                          onClick={() => restore(row)}
                          className="p-1 rounded text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
                        >
                          {busyId === row.id ? <Loader2 size={11} className="animate-spin" /> : <Pencil size={11} strokeWidth={1.5} />}
                        </button>
                        <button
                          title="Clone — start from a copy"
                          onClick={() => restore(row)}
                          className="p-1 rounded text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
                        >
                          <Copy size={11} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                    {row.thumbnail_url && (
                      <button
                        title="Preview"
                        onClick={() => setPreviewRow(row)}
                        className="p-1 rounded text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
                      >
                        <Eye size={11} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview lightbox — same dark-overlay pattern as the admin thumbnails. */}
      {previewRow && (
        <div
          className="fixed inset-0 z-[1100] bg-black/80 flex items-center justify-center p-10 cursor-zoom-out"
          onClick={() => setPreviewRow(null)}
        >
          {previewRow.format === 'pdf' ? (
            <embed src={previewRow.thumbnail_url ?? ''} type="application/pdf" className="w-full h-full max-w-4xl rounded" />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={previewRow.thumbnail_url ?? ''} alt="" className="max-w-full max-h-full rounded shadow-2xl" />
          )}
          <a
            href={previewRow.thumbnail_url ?? '#'}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 right-6 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-white/80 hover:text-white"
          >
            Open file <ArrowUpRight size={12} />
          </a>
        </div>
      )}
    </aside>
  )
}
