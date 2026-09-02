'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { PanelLeft, Copy, Pencil, Eye, Trash2, Search, Loader2, ArrowUpRight, Mail, Newspaper, MessageSquareHeart, Globe, FileText, type LucideIcon } from 'lucide-react'
import { useStore } from '@/store'
import { getStoredUser } from '@/components/NamePickerModal'
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal'
import { TemplateRenderer } from '@/components/shared/TemplateRenderer'
import { DRAFT_SHAPE_VERSION, listDrafts, deleteDraftById, saveDraftToStorage, renameDraft, newDraftId, type DraftEntry, type DraftState } from '@/lib/draft-storage'
import { TEMPLATE_LABELS, TEMPLATE_DIMENSIONS } from '@/lib/template-config'
import { TEMPLATE_REGISTRY } from '@/lib/template-registry'
import { fetchColorsConfig, fetchTypographyConfig, type ColorsConfig, type TypographyConfig } from '@/lib/brand-config'
import { restoreEditorSnapshot } from '@/lib/asset-snapshot'
import { NEUTRAL_FILTERS, type ImageFilters } from '@/lib/image-filters'
import type { QueuedAsset, TemplateType } from '@/types'

// The display name of a piece of work. Most templates title themselves by
// verbatim headline; executive overview's name is the cover's big intro
// headline, which lives in its document, not in verbatimCopy.
function draftDisplayTitle(d: DraftState): string {
  if (d.templateType === 'executive-overview') {
    const t = d.executiveOverviewDocument?.introHeadline?.trim()
    if (t) return t
  }
  return d.verbatimCopy?.headline || (TEMPLATE_LABELS[d.templateType as TemplateType] ?? 'Draft')
}

// A card's display name: the pinned per-entry name when the user has set
// one (rename/clone), else derived live from the design's headline.
function entryDisplayTitle(entry: DraftEntry): string {
  return entry.name || draftDisplayTitle(entry.draft)
}

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

function draftMatchesFilter(d: DraftState, filter: TypeFilter): boolean {
  if (filter === 'all') return true
  const t = d.templateType
  if (filter === 'pdf') return t.endsWith('-pdf') || t === 'executive-overview'
  if (filter === 'email') return t.startsWith('email') || t.startsWith('newsletter')
  if (filter === 'social') return t.startsWith('social')
  return t.startsWith('website')
}

function entryMatchesSearch(entry: DraftEntry, q: string): boolean {
  if (!q) return true
  const d = entry.draft
  const hay = `${entryDisplayTitle(entry)} ${TEMPLATE_LABELS[d.templateType as TemplateType] ?? d.templateType}`.toLowerCase()
  return hay.includes(q.toLowerCase())
}

/** Channel icon per template family — mirrors the home filter chips. */
function channelIcon(templateType: string): LucideIcon {
  if (templateType.startsWith('email')) return Mail
  if (templateType.startsWith('newsletter')) return Newspaper
  if (templateType.startsWith('social')) return MessageSquareHeart
  if (templateType.startsWith('website')) return Globe
  return FileText
}

/**
 * A draft is store-shaped (verbatimCopy nested, per-template image settings
 * map); TemplateRenderer wants a QueuedAsset (flattened). Bridge the deltas
 * and spread the rest — DraftState persists the same field names renderProps
 * reads for everything else.
 */
function draftToRenderableAsset(draft: DraftState): QueuedAsset {
  const t = draft.templateType
  const img = draft.thumbnailImageSettings?.[t]
  return {
    ...(draft as unknown as Record<string, unknown>),
    id: 'draft-preview',
    templateType: t,
    headline: draft.verbatimCopy?.headline ?? '',
    subhead: draft.verbatimCopy?.subhead ?? '',
    body: draft.verbatimCopy?.body ?? '',
    thumbnailImageUrl: draft.thumbnailImageUrl ?? null,
    thumbnailImagePosition: img?.position ?? { x: 0, y: 0 },
    thumbnailImageZoom: img?.zoom ?? 1,
    thumbnailImageFilters: img?.filters,
  } as unknown as QueuedAsset
}

/** Live render of a draft's current design, scaled to fill a measured box —
 *  the queue-thumbnail pattern. Falls back to the channel icon for templates
 *  outside the registry (legacy PDFs). Fills whatever box it's placed in. */
function DraftLiveRender({ draft, colors, typography }: {
  draft: DraftState
  colors: ColorsConfig | null
  typography: TypographyConfig | null
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const compute = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const t = draft.templateType
  const dims = TEMPLATE_DIMENSIONS[t]
  const Icon = channelIcon(t)
  const renderable = TEMPLATE_REGISTRY[t] && dims && colors && typography
  const scale = renderable && box ? Math.min(box.w / dims.width, box.h / dims.height) : 0
  return (
    <div ref={boxRef} className="absolute inset-0 pointer-events-none">
      {renderable && box ? (
        <div style={{
          position: 'absolute',
          left: (box.w - dims.width * scale) / 2,
          top: (box.h - dims.height * scale) / 2,
          width: dims.width,
          height: dims.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          <TemplateRenderer asset={draftToRenderableAsset(draft)} colorsConfig={colors} typographyConfig={typography} />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={16} strokeWidth={1.5} className="text-gray-400 dark:text-content-secondary" />
        </div>
      )}
    </div>
  )
}

/**
 * The shared My Work card (Figma 660:3043): big thumbnail with a vertical
 * action rail beside it, then title (ellipsis-truncated) and the micro
 * caption below. One shape for drafts AND exports — uniform height per group
 * (the thumb keeps a fixed aspect, so every card in the rail matches).
 */
function WorkCard({ thumb, title, CaptionIcon, caption, actions, onOpen, onRename }: {
  thumb: React.ReactNode
  title: string
  CaptionIcon: LucideIcon
  caption: string
  actions: { title: string; icon: React.ReactNode; onClick: () => void }[]
  onOpen?: () => void
  /** When set, double-clicking the title edits it in place (Enter/blur
   *  commits, Escape cancels) — the Claude-desktop rename UX. */
  onRename?: (title: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const commit = () => {
    setEditing(false)
    const next = draftTitle.trim()
    if (onRename && next && next !== title) onRename(next)
  }
  return (
    <div className="flex gap-2 items-start">
      <div className="min-w-0 flex-1">
        <div
          onClick={onOpen}
          className={`relative aspect-[9/5] rounded-md overflow-hidden border border-gray-200 dark:border-line-subtle bg-gray-50 dark:bg-surface-secondary transition-[border-color,box-shadow] duration-150 ${onOpen ? 'cursor-pointer hover:border-gray-300 dark:hover:border-content-secondary/40 hover:shadow-[0_2px_10px_rgba(6,0,21,0.08)]' : ''}`}
        >
          {thumb}
        </div>
        {editing ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setDraftTitle(title); setEditing(false) }
            }}
            className="w-full text-[12.5px] text-gray-900 dark:text-content-primary mt-1.5 bg-transparent border-b border-gray-300 dark:border-content-secondary/50 focus:outline-none focus:border-gray-500 dark:focus:border-content-secondary p-0"
          />
        ) : (
          <div
            onDoubleClick={onRename ? () => { setDraftTitle(title); setEditing(true) } : undefined}
            title={onRename ? 'Double-click to rename' : undefined}
            className={`text-[12.5px] text-gray-900 dark:text-content-primary truncate mt-1.5 ${onRename ? 'cursor-text' : ''}`}
          >
            {title}
          </div>
        )}
        <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-wide text-gray-400 dark:text-content-secondary mt-1 min-w-0">
          <CaptionIcon size={9} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="truncate">{caption}</span>
        </div>
      </div>
      {/* Action rail — clone / edit / preview / delete, always present, quiet. */}
      <div className="flex flex-col gap-1.5 flex-shrink-0 pt-0.5">
        {actions.map((a) => (
          <ActionIcon key={a.title} title={a.title} onClick={a.onClick}>{a.icon}</ActionIcon>
        ))}
      </div>
    </div>
  )
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
      onClick={(e) => { e.stopPropagation(); onClick() }}
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
  const [drafts, setDrafts] = useState<DraftEntry[]>([])
  const [brand, setBrand] = useState<{ colors: ColorsConfig; typography: TypographyConfig } | null>(null)
  const [filter, setFilter] = useState<TypeFilter>('all')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [previewRow, setPreviewRow] = useState<ExportRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'draft'; entry: DraftEntry } | { kind: 'export'; row: ExportRow } | null>(null)
  const [user, setUser] = useState<string | null>(null)
  const dragState = useRef<{ startX: number; startW: number } | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
    setDrafts(listDrafts())
    // Identity can change after mount (first name pick, or switching users) —
    // re-read the user and their per-user drafts when it does. The exports
    // fetch keys off `user`, so it refetches on its own. `storage` covers a
    // switch made in another tab.
    const onUserChanged = () => {
      setUser(getStoredUser())
      setDrafts(listDrafts())
    }
    window.addEventListener('dd-user-changed', onUserChanged)
    window.addEventListener('storage', onUserChanged)
    Promise.all([fetchColorsConfig(), fetchTypographyConfig()])
      .then(([colors, typography]) => setBrand({ colors, typography }))
      .catch(() => { /* thumbs fall back to channel icons */ })
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'true')
      const w = Number(localStorage.getItem(WIDTH_KEY))
      if (w >= MIN_W && w <= MAX_W) setWidth(w)
    } catch { /* defaults */ }
    return () => {
      window.removeEventListener('dd-user-changed', onUserChanged)
      window.removeEventListener('storage', onUserChanged)
    }
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
      // Row columns UNDER the snapshot: older direct-export snapshots don't
      // carry templateType/headline, and without the row fallback the editor
      // fell back to whatever template the store last held — opening the
      // wrong template entirely.
      loadExportSnapshotIntoEditor({
        templateType: row.template_type,
        headline: row.headline ?? '',
        ...(data.snapshot as Record<string, unknown>),
      })
      // The design is back in draft state — its card becomes the (new) draft
      // the editor is about to auto-save, so the export row leaves this
      // user's list (soft-hide; admin + file untouched). One card per
      // design: editing never ADDS an item.
      setRows((prev) => (prev ?? []).filter((r) => r.id !== row.id))
      fetch(`/api/my-exports?id=${row.id}`, { method: 'DELETE' }).catch(() => { /* row returns on next load */ })
      setCurrentScreen('editor')
      router.push('/editor')
    } catch (error) {
      console.error('Clone failed:', error)
      setBusyId(null)
    }
  }, [loadExportSnapshotIntoEditor, setCurrentScreen, router])

  const [previewDraft, setPreviewDraft] = useState<DraftState | null>(null)

  // Escape dismisses whichever preview lightbox is open.
  useEffect(() => {
    if (!previewDraft && !previewRow) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewDraft(null)
        setPreviewRow(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewDraft, previewRow])

  // Clone a draft: duplicate its entry in place as "<name> 2". The copy lands
  // at the top of DRAFTS (it's the newest save) so the user SEES the clone —
  // it does not open in the editor; they pick it up via the card's actions.
  const cloneDraft = useCallback((entry: DraftEntry) => {
    const id = newDraftId()
    saveDraftToStorage(entry.draft, id)
    renameDraft(id, `${entryDisplayTitle(entry)} 2`)
    setDrafts(listDrafts())
  }, [])

  // Clone an export: its snapshot becomes a NEW DRAFT named "<name> 2" —
  // it has not been exported yet, so it belongs in DRAFTS, not EXPORTS.
  // (Edit still opens the snapshot straight into the editor via `restore`.)
  const cloneExportToDraft = useCallback(async (row: ExportRow) => {
    setBusyId(row.id)
    try {
      const res = await fetch(`/api/my-exports?snapshot=${row.id}`)
      if (!res.ok) throw new Error('snapshot fetch failed')
      const data = await res.json()
      if (!data.snapshot || (data.snapshot_version ?? DRAFT_SHAPE_VERSION) !== DRAFT_SHAPE_VERSION) {
        throw new Error('incompatible snapshot')
      }
      const snapshot = data.snapshot as Record<string, unknown>
      const templateType = (snapshot.templateType as TemplateType) ?? (row.template_type as TemplateType)
      const baseName = row.headline || (snapshot.headline as string) || (TEMPLATE_LABELS[templateType] ?? 'Draft')
      const restored = restoreEditorSnapshot(snapshot) as Partial<DraftState>
      const cloneId = newDraftId()
      saveDraftToStorage({
        ...restored,
        currentScreen: 'editor',
        templateType,
        selectedAssets: [templateType],
        currentAssetIndex: 0,
        verbatimCopy: {
          headline: (snapshot.headline as string) ?? '',
          subhead: (snapshot.subhead as string) ?? '',
          body: (snapshot.body as string) ?? '',
          cta: '',
        },
        thumbnailImageSettings: {
          [templateType]: {
            position: (snapshot.thumbnailImagePosition as { x: number; y: number } | undefined) ?? { x: 0, y: 0 },
            zoom: (snapshot.thumbnailImageZoom as number | undefined) ?? 1,
            filters: (snapshot.thumbnailImageFilters as ImageFilters | undefined) ?? NEUTRAL_FILTERS,
          },
        },
        exportQueue: [],
      }, cloneId)
      renameDraft(cloneId, `${baseName} 2`)
      setDrafts(listDrafts())
    } catch (error) {
      console.error('Clone failed:', error)
    } finally {
      setBusyId(null)
    }
  }, [])

  const resumeDraft = useCallback((id: string) => {
    // loadDraft restores currentScreen from the draft itself; the banner's
    // extra per-template screen logic stays the nuanced path.
    if (loadDraft(id)) router.push('/editor')
  }, [loadDraft, router])

  const handleConfirmDelete = useCallback(async () => {
    const target = confirmDelete
    setConfirmDelete(null)
    if (!target) return
    if (target.kind === 'draft') {
      deleteDraftById(target.entry.id)
      setDrafts(listDrafts())
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

  // ---- ONE list: "My Designs". A design is draft-backed (live render,
  // editable in place) or export-backed (thumbnail from the log). New items
  // appear ONLY via the template gallery or Clone; exporting swaps a card's
  // backing (draft -> export row), editing an export swaps it back — the
  // count never changes except by create/clone/delete.
  type WorkItem =
    | { kind: 'draft'; ts: number; entry: DraftEntry }
    | { kind: 'export'; ts: number; row: ExportRow }
  const items: WorkItem[] = [
    ...drafts
      .filter((e) => draftMatchesFilter(e.draft, filter) && entryMatchesSearch(e, query))
      .map((entry): WorkItem => ({ kind: 'draft', ts: entry.draft.savedAt ?? 0, entry })),
    ...(rows ?? [])
      .filter((r) => matchesFilter(r, filter) && matchesSearch(r, query))
      .map((row): WorkItem => ({ kind: 'export', ts: Date.parse(row.created_at) || 0, row })),
  ].sort((a, b) => b.ts - a.ts)
  const totalCount = drafts.length + (rows?.length ?? 0)

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

      {/* The list — independently scrolled from the template grid */}
      <div className="mt-5 overflow-y-auto min-h-0 flex-1 pb-4 pr-2 flex flex-col [scrollbar-width:thin] [scrollbar-color:rgb(209_213_219)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/15">
        <div>
          <GroupLabel>My Designs &middot; {rows === null ? drafts.length : totalCount}</GroupLabel>
          {rows === null && (
            <div className="flex items-center gap-2 text-gray-400 dark:text-content-secondary font-mono text-[10px] uppercase pt-3">
              <Loader2 size={12} className="animate-spin" /> Loading
            </div>
          )}
          {rows !== null && items.length === 0 ? (
            <div className="font-mono text-[9px] uppercase leading-relaxed tracking-wide text-gray-300 dark:text-content-secondary/60 mt-2">
              {totalCount === 0 ? 'Nothing yet — pick a template to start your first design.' : 'No matches.'}
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-2">
              {items.map((item) => {
                if (item.kind === 'draft') {
                  const { entry } = item
                  const d = entry.draft
                  const label = TEMPLATE_LABELS[d.templateType as TemplateType] ?? d.templateType
                  return (
                    <WorkCard
                      key={entry.id}
                      thumb={<DraftLiveRender draft={d} colors={brand?.colors ?? null} typography={brand?.typography ?? null} />}
                      title={entryDisplayTitle(entry)}
                      CaptionIcon={channelIcon(d.templateType)}
                      caption={`${label} · saved ${relativeDate(d.savedAt)}`}
                      onOpen={() => setPreviewDraft(d)}
                      onRename={(t) => {
                        renameDraft(entry.id, t)
                        setDrafts(listDrafts())
                      }}
                      actions={[
                        { title: 'Clone — duplicate this design', icon: <Copy size={12} strokeWidth={1.5} />, onClick: () => cloneDraft(entry) },
                        { title: 'Edit', icon: <Pencil size={12} strokeWidth={1.5} />, onClick: () => resumeDraft(entry.id) },
                        { title: 'Preview', icon: <Eye size={12} strokeWidth={1.5} />, onClick: () => setPreviewDraft(d) },
                        { title: 'Delete', icon: <Trash2 size={12} strokeWidth={1.5} />, onClick: () => setConfirmDelete({ kind: 'draft', entry }) },
                      ]}
                    />
                  )
                }
                const { row } = item
                return (
                  <WorkCard
                    key={`x${row.id}`}
                    thumb={
                      row.thumbnail_url && row.format !== 'pdf' ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={row.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] uppercase tracking-wide text-gray-400 dark:text-content-secondary">
                          {row.format === 'pdf' ? 'PDF' : 'No preview'}
                        </div>
                      )
                    }
                    title={row.headline || (TEMPLATE_LABELS[row.template_type as TemplateType] ?? row.template_type)}
                    CaptionIcon={channelIcon(row.template_type)}
                    caption={`${TEMPLATE_LABELS[row.template_type as TemplateType] ?? row.template_type} · ${relativeDate(row.created_at)}`}
                    onOpen={row.thumbnail_url ? () => setPreviewRow(row) : undefined}
                    actions={[
                      ...(row.has_snapshot ? [
                        { title: 'Clone — duplicate this design', icon: (busyId === row.id ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} strokeWidth={1.5} />), onClick: () => cloneExportToDraft(row) },
                        { title: 'Edit', icon: <Pencil size={12} strokeWidth={1.5} />, onClick: () => restore(row) },
                      ] : []),
                      ...(row.thumbnail_url ? [
                        { title: 'Preview', icon: <Eye size={12} strokeWidth={1.5} />, onClick: () => setPreviewRow(row) },
                      ] : []),
                      { title: 'Delete', icon: <Trash2 size={12} strokeWidth={1.5} />, onClick: () => setConfirmDelete({ kind: 'export', row }) },
                    ]}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drag handle      {/* Drag handle — the split line. Templates re-flow via their own measure. */}
      <div
        onPointerDown={onDragStart}
        title="Drag to resize"
        className="absolute top-0 right-0 h-full w-[9px] translate-x-[5px] cursor-col-resize group/handle flex justify-center"
      >
        <div className="h-full w-px bg-gray-200 dark:bg-line-subtle transition-colors group-hover/handle:bg-gray-400 dark:group-hover/handle:bg-content-secondary" />
      </div>

      {/* Draft preview lightbox — large live render of the current design.
          Multi-page templates (registry `renderPreview`) reuse the editor
          lightbox's pattern: all pages stacked at native size in a
          scrollable frame. Single-page drafts scale-to-fit as before. */}
      {previewDraft && createPortal(
        <div
          className="fixed inset-0 z-[1100] bg-black/80 flex items-center justify-center p-10 cursor-zoom-out"
          onClick={() => setPreviewDraft(null)}
        >
          {(() => {
            const entry = TEMPLATE_REGISTRY[previewDraft.templateType as TemplateType]
            if (entry?.renderPreview && brand?.colors && brand?.typography) {
              return (
                <div className="relative max-h-full max-w-full overflow-auto cursor-default" onClick={(e) => e.stopPropagation()}>
                  {entry.renderPreview(draftToRenderableAsset(previewDraft) as never, brand.colors, brand.typography)}
                </div>
              )
            }
            return (
              <div className="relative w-full h-full max-w-5xl">
                <DraftLiveRender draft={previewDraft} colors={brand?.colors ?? null} typography={brand?.typography ?? null} />
              </div>
            )
          })()}
        </div>,
        document.body,
      )}

      {/* Preview lightbox — portaled for the same stacking-context reason. */}
      {previewRow && createPortal(
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
        </div>,
        document.body,
      )}

      {/* Modals PORTAL to body: the aside is sticky (its own stacking
       *  context), so a fixed overlay rendered inside it paints UNDER the
       *  main column's content. */}
      {confirmDelete !== null && createPortal(
        <DeleteConfirmModal
          isOpen
          itemType={confirmDelete.kind === 'draft' ? 'Draft' : 'Export'}
          itemLabel={confirmDelete.kind === 'export'
            ? (confirmDelete.row.headline ?? undefined)
            : entryDisplayTitle(confirmDelete.entry)}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />,
        document.body,
      )}
    </aside>
  )
}
