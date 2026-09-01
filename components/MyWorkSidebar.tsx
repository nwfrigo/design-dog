'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PanelLeft, Copy, Pencil, Eye, Trash2, Search, Loader2, ArrowUpRight, FileText } from 'lucide-react'
import { useStore } from '@/store'
import { getStoredUser } from '@/components/NamePickerModal'
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal'
import { DRAFT_SHAPE_VERSION, loadDraftFromStorage, clearDraft, type DraftState } from '@/lib/draft-storage'
import { TEMPLATE_LABELS } from '@/lib/template-config'
import type { TemplateType } from '@/types'

/**
 * MyWorkSidebar — the persistent "your previous work" rail on the home screen.
 *
 * Two GROUPS (not filters): DRAFTS — the identity's in-progress work from
 * per-user draft storage — and EXPORTS — that identity's export history from
 * the log, with thumbnails. Hover actions restore (Edit/Clone), preview, or
 * delete. Delete is soft everywhere the server is involved: an export is
 * hidden from this user's list only (row, thumbnail and Blob file survive for
 * admin); a draft delete clears that user's local draft.
 *
 * The right edge is a drag handle: the rail resizes (persisted), the template
 * grid on the other side re-flows via its own container measure. The rail is
 * sticky with its own scroll, so browsing templates doesn't move it.
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
const WIDTH_KEY = 'design-dog-mywork-width'
const MIN_W = 248
const MAX_W = 480
const DEFAULT_W = 300

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

function matchesSearch(row: ExportRow, q: string): boolean {
  if (!q) return true
  const hay = `${row.headline ?? ''} ${TEMPLATE_LABELS[row.template_type as TemplateType] ?? row.template_type}`.toLowerCase()
  return hay.includes(q.toLowerCase())
}

function relativeDate(iso: string | number): string {
  const then = typeof iso === 'number' ? iso : new Date(iso).getTime()
  const mins = Math.floor((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(then).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Small mono section label — the app's caption vocabulary. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-wider text-gray-400 dark:text-content-secondary">
      {children}
    </div>
  )
}

function ActionIcon({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1 rounded text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
    >
      {children}
    </button>
  )
}

export function MyWorkSidebar() {
  const router = useRouter()
  const loadExportSnapshotIntoEditor = useStore((s) => s.loadExportSnapshotIntoEditor)
  const loadDraft = useStore((s) => s.loadDraft)
  const setCurrentScreen = useStore((s) => s.setCurrentScreen)

  const [collapsed, setCollapsed] = useState(true)
  const [width, setWidth] = useState(DEFAULT_W)
  const [rows, setRows] = useState<ExportRow[] | null>(null)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [filter, setFilter] = useState<TypeFilter>('all')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [previewRow, setPreviewRow] = useState<ExportRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'draft' } | { kind: 'export'; row: ExportRow } | null>(null)
  const [user, setUser] = useState<string | null>(null)
  const dragState = useRef<{ startX: number; startW: number } | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
    setDraft(loadDraftFromStorage())
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'true')
      const w = Number(localStorage.getItem(WIDTH_KEY))
      if (w >= MIN_W && w <= MAX_W) setWidth(w)
    } catch { /* defaults */ }
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

  // ---- drag-to-resize (right edge) ----
  const onDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragState.current = { startX: e.clientX, startW: width }
    const onMove = (ev: PointerEvent) => {
      const d = dragState.current
      if (!d) return
      const next = Math.min(MAX_W, Math.max(MIN_W, d.startW + (ev.clientX - d.startX)))
      setWidth(next)
    }
    const onUp = () => {
      if (dragState.current) {
        try { localStorage.setItem(WIDTH_KEY, String(Math.round(dragState.current.startW))) } catch { /* fine */ }
      }
      // persist the final value (state is freshest via callback)
      setWidth((w) => {
        try { localStorage.setItem(WIDTH_KEY, String(Math.round(w))) } catch { /* fine */ }
        return w
      })
      dragState.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [width])

  const restore = useCallback(async (row: ExportRow) => {
    setBusyId(row.id)
    try {
      const res = await fetch(`/api/my-exports?snapshot=${row.id}`)
      if (!res.ok) throw new Error('snapshot fetch failed')
      const data = await res.json()
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

  const resumeDraft = useCallback(() => {
    // loadDraft restores currentScreen from the draft itself; the banner's
    // extra per-template screen logic stays the nuanced path.
    if (loadDraft()) router.push('/editor')
  }, [loadDraft, router])

  const handleConfirmDelete = useCallback(async () => {
    const target = confirmDelete
    setConfirmDelete(null)
    if (!target) return
    if (target.kind === 'draft') {
      clearDraft()
      setDraft(null)
      return
    }
    // Optimistic: drop from the list, then soft-hide server-side. Nothing is
    // destroyed — admin still sees the row and the file.
    setRows((prev) => (prev ?? []).filter((r) => r.id !== target.row.id))
    fetch(`/api/my-exports?id=${target.row.id}`, { method: 'DELETE' }).catch(() => { /* row returns on next load */ })
  }, [confirmDelete])

  if (!user) return null

  // Collapsed: a single well-padded toggle, sized to sit inline with the
  // "Pick any template..." heading to its right.
  if (collapsed) {
    return (
      <div className="flex-shrink-0 mr-4">
        <button
          onClick={toggleCollapsed}
          title="Show my work"
          className="p-2.5 -mt-1.5 rounded-lg text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-primary hover:bg-gray-100 dark:hover:bg-interactive-hover transition-colors"
        >
          <PanelLeft size={18} strokeWidth={1.5} />
        </button>
      </div>
    )
  }

  const visible = (rows ?? []).filter((r) => matchesFilter(r, filter) && matchesSearch(r, query))
  const draftTemplate = draft?.templateType ? (TEMPLATE_LABELS[draft.templateType as TemplateType] ?? draft.templateType) : 'Draft'
  const draftHeadline = draft?.verbatimCopy?.headline || ''

  return (
    <aside
      style={{ width }}
      className="relative flex-shrink-0 flex flex-col pr-5 mr-6 sticky top-6 self-start h-[calc(100vh-120px)] min-h-0"
    >
      {/* Rail header — same voice as "Pick any template to get started." */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCollapsed}
          title="Hide my work"
          className="p-2 -ml-2 rounded-lg text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-primary hover:bg-gray-100 dark:hover:bg-interactive-hover transition-colors"
        >
          <PanelLeft size={18} strokeWidth={1.5} />
        </button>
        <p className="text-gray-500 dark:text-content-secondary">My work</p>
      </div>

      {/* Search — shell for now; narrows the loaded list until real search lands. */}
      <div className="relative mt-4">
        <Search size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-content-secondary pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your work"
          className="w-full rounded border border-gray-300 dark:border-[#494a4c] bg-white dark:bg-surface-primary pl-8 pr-3 py-1.5 text-sm text-gray-900 dark:text-content-primary placeholder:text-gray-400 dark:placeholder:text-content-secondary focus:outline-none focus:border-gray-400 dark:focus:border-content-secondary"
        />
      </div>

      {/* Type filter (types only — drafts/exports are groups below) */}
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

      {/* Groups — independently scrolled from the template grid */}
      <div className="mt-5 overflow-y-auto min-h-0 flex-1 pb-4 flex flex-col gap-6">

        {/* DRAFTS */}
        <div>
          <GroupLabel>Drafts &middot; {draft ? 1 : 0}</GroupLabel>
          {draft ? (
            <div className="group mt-2 rounded-md border border-gray-200 dark:border-line-subtle transition-[border-color,box-shadow] duration-150 hover:border-gray-300 dark:hover:border-content-secondary/40 hover:shadow-[0_2px_10px_rgba(6,0,21,0.08)]">
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <FileText size={14} strokeWidth={1.5} className="text-gray-400 dark:text-content-secondary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] text-gray-900 dark:text-content-primary truncate">
                    {draftHeadline || draftTemplate}
                  </div>
                  <div className="font-mono text-[8px] uppercase tracking-wide text-gray-400 dark:text-content-secondary mt-0.5">
                    {draftTemplate} &middot; saved {relativeDate(draft.savedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <ActionIcon title="Resume editing" onClick={resumeDraft}><Pencil size={11} strokeWidth={1.5} /></ActionIcon>
                  <ActionIcon title="Delete draft" onClick={() => setConfirmDelete({ kind: 'draft' })}><Trash2 size={11} strokeWidth={1.5} /></ActionIcon>
                </div>
              </div>
            </div>
          ) : (
            <div className="font-mono text-[9px] uppercase tracking-wide text-gray-300 dark:text-content-secondary/60 mt-2">
              No draft in progress
            </div>
          )}
        </div>

        {/* EXPORTS */}
        <div>
          <GroupLabel>Exports &middot; {rows?.length ?? '—'}</GroupLabel>
          {rows === null ? (
            <div className="flex items-center gap-2 text-gray-400 dark:text-content-secondary font-mono text-[10px] uppercase pt-3">
              <Loader2 size={12} className="animate-spin" /> Loading
            </div>
          ) : visible.length === 0 ? (
            <div className="font-mono text-[9px] uppercase leading-relaxed tracking-wide text-gray-300 dark:text-content-secondary/60 mt-2">
              {rows.length === 0 ? 'Nothing yet — your exports will collect here.' : 'No matches.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-2">
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
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {row.has_snapshot && (
                        <>
                          <ActionIcon title="Edit — reopen this asset" onClick={() => restore(row)}>
                            {busyId === row.id ? <Loader2 size={11} className="animate-spin" /> : <Pencil size={11} strokeWidth={1.5} />}
                          </ActionIcon>
                          <ActionIcon title="Clone — start from a copy" onClick={() => restore(row)}><Copy size={11} strokeWidth={1.5} /></ActionIcon>
                        </>
                      )}
                      {row.thumbnail_url && (
                        <ActionIcon title="Preview" onClick={() => setPreviewRow(row)}><Eye size={11} strokeWidth={1.5} /></ActionIcon>
                      )}
                      <ActionIcon title="Remove from my list" onClick={() => setConfirmDelete({ kind: 'export', row })}><Trash2 size={11} strokeWidth={1.5} /></ActionIcon>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag handle — the split line. Templates re-flow via their own measure. */}
      <div
        onPointerDown={onDragStart}
        title="Drag to resize"
        className="absolute top-0 right-0 h-full w-[9px] translate-x-[5px] cursor-col-resize group/handle flex justify-center"
      >
        <div className="h-full w-px bg-gray-200 dark:bg-line-subtle transition-colors group-hover/handle:bg-gray-400 dark:group-hover/handle:bg-content-secondary" />
      </div>

      {/* Preview lightbox */}
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

      <DeleteConfirmModal
        isOpen={confirmDelete !== null}
        itemType={confirmDelete?.kind === 'draft' ? 'Draft' : 'Export'}
        itemLabel={confirmDelete?.kind === 'export' ? (confirmDelete.row.headline ?? undefined) : (draftHeadline || draftTemplate)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </aside>
  )
}
