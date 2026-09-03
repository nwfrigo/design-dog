# My Designs — Persistent User Work (Memory Feature)

> Truth-source for the password-free personalized experience shipped on `feature-memory-1`:
> the My Designs rail on the homepage, multi-draft persistence, snapshot-at-export,
> clone/edit/preview/delete/rename, and the design lifecycle rules.
>
> **Companion docs.**
> - `ARCHITECTURE.md` — global state, export pipeline, DB schema, API endpoints.
> - `TEMPLATES.md` — per-template gotchas (e.g. executive-overview's document blob).

---

## Identity (no auth)

Identity is the name picker, nothing more: `localStorage['design-dog-user']`, set by
`NamePickerModal` (which also POSTs new names to `/api/team-members`).

- Every identity-scoped surface keys off that name: drafts (`design-dog-drafts::<name>`)
  and the export history query (`/api/my-exports?by=<name>`).
- **Changing identity broadcasts `window` event `dd-user-changed`** (dispatched in the
  modal's `saveAndSelect`). `MyWorkSidebar` listens for it (plus the cross-tab `storage`
  event) and re-reads user + drafts immediately — first pick renders the rail without a
  refresh; switching users swaps lists without a refresh. Any new identity-scoped UI
  must listen for the same event.
- Test identity: **"Claude Test"** (team_members id 43) exists in the shared DB for
  two-user isolation testing. Never use a real teammate's name for testing.

---

## Draft storage (`lib/draft-storage.ts`)

Multi-draft, per-identity: `localStorage['design-dog-drafts::<name>']` holds
`{ entries: DraftEntry[] }`, newest-first, capped at `MAX_DRAFTS = 20` (oldest falls off).

```ts
type DraftEntry = { id: string; draft: DraftState; name?: string }
```

- **`id`** — `newDraftId()`; the store's `activeDraftId` binds auto-save to ONE entry.
- **`draft`** — full `DraftState`, per-entry version-gated by `CURRENT_VERSION` (2).
  `DRAFT_SHAPE_VERSION` (= `CURRENT_VERSION`) is exported so export snapshots can be
  stamped and version-checked on restore. Bump on incompatible shape changes.
- **`name`** — card metadata, deliberately DECOUPLED from the design. Unset → the card
  titles itself live from the design's headline (executive-overview: the document's
  `introHeadline`; fallback: template label). Set (via rename or clone) → pinned; later
  headline edits don't change it, and renaming never touches design copy or `savedAt`
  (`renameDraft(id, name)` — no reorder, survives auto-saves because the save upsert
  spreads the existing entry).

Legacy migration (`migrateLegacyDraft`) adopts the old single-draft keys
(`design-dog-active-draft`, bare + per-user) into the list once, guarded by list-key
existence.

### activeDraftId contract (store/index.ts)

- `proceedToEditor` / `goToEditorWithTemplate` / `loadExportSnapshotIntoEditor` assign a
  **fresh** id — leaving the picker or editing an export = a NEW project entry.
- `loadDraft(draftId?)` binds to the resumed entry (newest when unspecified) and
  **normalizes** corrupted drafts: a stored `currentScreen: 'select'` or empty
  `selectedAssets` (teardown corruption from older builds) is rewritten to
  `'editor'` + `[templateType]`.
- `/editor`'s mount effect yields to an existing `activeDraftId` — the storage restore
  path (`loadDraft()` → newest) is only for cold arrivals (hard refresh / deep link).
- `reset()` clears it.

### Auto-save (EditorLayout.tsx)

500ms-debounced `saveDraft()` with a **hand-maintained deps array** — see the checklist
below. Two guards:
- **Teardown guard:** the debounce body skips saving when `currentScreen === 'select'`
  (leaving via the logo resets selection/screen before navigation lands; a save firing in
  that window used to corrupt the entry).
- `saveDraft` lazily binds an id if none is active, then upserts THAT entry.

### ⚠️ Checklist: adding a store field that must persist

The field lists are hand-maintained in SIX places. Miss one and the field silently
drops from drafts or snapshots (this exact bug shipped once — 18 newer email-template
fields were in snapshots but not drafts):

1. `lib/asset-snapshot.ts` → `SNAPSHOT_FIELDS`
2. `lib/draft-storage.ts` → `DraftState` interface
3. `lib/draft-storage.ts` → `saveDraftToStorage` payload
4. `store/index.ts` → `saveDraft` payload
5. `store/index.ts` → `loadDraft` `set()` (with a default for old drafts)
6. `components/EditorLayout.tsx` → auto-save deps (destructure + array)

---

## The design lifecycle (one card per design)

The homepage rail shows ONE group — **My Designs** — merging local draft entries and
the identity's export rows, sorted by recency. The invariant: **a new card appears only
via (a) the template gallery or (b) Clone.** Everything else swaps a card's backing:

| Action | Effect |
|---|---|
| Pick a template | New draft entry (fresh `activeDraftId`), auto-save creates the card |
| Clone (draft or export) | New draft entry named `"<name> 2"` (pinned `entry.name`); design copy untouched; does NOT open the editor — the copy appears at the top of the list |
| Export (single-asset, empty queue) | Draft entry deleted; the export row (with snapshot) becomes the card. Multi-asset projects keep their draft — unexported tabs must survive |
| Edit an export-backed card | Snapshot loads into the editor under a fresh draft id; the export row is **soft-hidden** (the reborn draft is the card now) |
| Click a card | Preview lightbox only — looking never creates or opens anything |
| Double-click title (drafts) | Inline rename (Enter/blur commits, Escape cancels) |
| Delete | Draft: entry removed. Export: row soft-hidden (`hidden_at`) |

Keep editing after an export → the next auto-save recreates the draft entry (correct:
it's in-progress again).

---

## Snapshot-at-export

Every export logs an `assetSnapshot` JSONB + `snapshot_version` on its `export_logs`
row, enabling Clone/Edit from history:

- **Direct exports** (`EditorScreen.handleExport`): `captureEditorSnapshot(state)`
  **enriched** with `templateType`, flat `headline/subhead/body`, and the current
  template's `thumbnailImagePosition/Zoom/Filters` — snapshots must be self-contained.
- **Queue exports** (`ExportQueueScreen`): the `QueuedAsset` itself (already flat).
- **Restore** (`MyWorkSidebar.restore` / `cloneExportToDraft`): version-gated against
  `DRAFT_SHAPE_VERSION`; merges the export ROW's `template_type`/`headline` UNDER the
  snapshot as fallback — legacy rows predate the enrichment, and without the fallback
  the editor opened whatever template the store last held (a real shipped bug).
- Executive-overview exports log the cover's `introHeadline` as the row headline
  (`exportParams.headline` override in `EditorScreen`).

`getExportSnapshot(id)` fetches the blob per-row; list queries only select
`(snapshot IS NOT NULL) AS has_snapshot`.

---

## Soft delete — deleted means deleted everywhere

`export_logs.hidden_at TIMESTAMPTZ`: set by `hideExport(id)` (user delete, or the
edit-an-export handoff). `getExportLogs` and ALL admin stats aggregates filter
`hidden_at IS NULL` unconditionally — **admin does not see hidden rows** (deliberate:
the viewable-vs-admin distinction was collapsed). The row + Blob file survive;
recovery is SQL-only (`SET hidden_at = NULL`).

---

## API: `/api/my-exports`

| Call | Behavior |
|---|---|
| `GET ?by=<name>` | That identity's visible export rows, newest first, limit 60 |
| `GET ?snapshot=<id>` | One row's snapshot + version (for clone/edit) |
| `DELETE ?id=<id>` | Soft-hide (`hideExport`) |

---

## MyWorkSidebar internals (`components/MyWorkSidebar.tsx`)

- **Rail chrome:** collapsible (`design-dog-mywork-collapsed`), drag-to-resize right
  edge 248–480px (`design-dog-mywork-width`); the template grid re-flows via its own
  container measure (3-col ≥1080px, else 2-col, in `AssetSelectionScreen`). Sticky with
  its own slim scrollbar, independent of the grid scroll.
- **Search + type chips** (`all/email/social/web/pdf`) filter the merged list
  client-side (pinned name + headline + template label).
- **Draft thumbnails:** `DraftLiveRender` — a measured-box, scaled `TemplateRenderer`
  fed by `draftToRenderableAsset` (flattens `verbatimCopy` + per-template image
  settings into the `QueuedAsset` shape renderProps expect).
- **Multi-page previews** reuse the editor lightbox pattern: registry `renderPreview`
  (all pages stacked at native size) inside a scrollable frame.
- **Portals:** the aside is sticky (own stacking context), so lightboxes and the
  delete-confirm modal `createPortal` to `document.body` — a fixed overlay rendered
  inside the aside paints UNDER the main column. Escape closes previews.

---

## Related surfaces

- **Info modal** (`components/InfoModal/`): the "Introducing 'My Work'" announcement,
  storage key `dd-my-work-info-seen` (keyed per campaign so new announcements re-fire).
  Ephemeral by design — see its own header comment for the delete surface.
- The old `DraftBanner` ("Continue your project") is deleted; the rail is the only
  draft surface.

---

## Deferred / roadmap (not built)

- **Server-side search** — the search box filters client-side over the loaded 60 rows.
  Wire a real query param when someone's history outgrows that.
- **Recommendations** ("your favorites", "try next") — original ask #3; nothing built.
- **`export_logs.label` column** — migrated but dormant; reserved for Gmail-style
  labels/projects grouping.
- **Multi-asset export lifecycle** — queue exports and multi-asset projects never
  retire drafts (deliberately conservative). Revisit if users complain about exported
  work lingering in drafts.
