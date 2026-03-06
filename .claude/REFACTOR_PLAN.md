# Design Dog — Refactor Plan

> Comprehensive codebase audit and refactor roadmap.
> Produced 2026-03-06. Analysis only — no code changes made.

---

## Codebase Stats

| Category | Files | Lines |
|----------|-------|-------|
| Components (`components/`) | 33 | 21,324 |
| Templates (`components/templates/`) | 21+ | ~10,267 |
| Render pages (`app/render/`) | 24 | 1,772 |
| API routes (`app/api/`) | 19 | 3,700 |
| Lib utilities (`lib/`) | 7 | 1,879 |
| Types (`types/index.ts`) | 1 | 1,169 |
| Store (`store/index.ts`) | 1 | 2,605 |
| **Total tracked** | | **~42,700** |

**Files over 500 lines:** EditorScreen (5,276), StackerEditorScreen (2,659), FaqEditorScreen (2,487), ExportQueueScreen (1,639), TemplateTile (1,158), SocialCarouselEditorScreen (845), StackerPreviewEditor (838), StackerSetupScreen (566)

---

## P0 — Tech Debt Actively Causing Bugs

### P0-1: `editQueuedAsset()` doesn't restore Solution Overview, Carousel, or Stacker fields

**Files:** `store/index.ts` lines 1224-1317 (editQueuedAsset) vs lines 1404-1444 (saveQueuedAssetEdit)

**Problem:** When a user edits a queued Solution Overview, Carousel, or Stacker asset, `editQueuedAsset()` loads the asset back into the editor — but it only restores basic template fields. It does NOT restore:
- Solution Overview page 1-3 content (solutionName, tagline, keySolutions, benefits, features, quote, stats — ~35 fields)
- Social Carousel slides (carouselSlides, carouselCurrentSlideIndex)
- Stacker modules (stackerContentModules, stackerModuleSpacing, stackerDarkMode)
- `reportVariant` (missing at line 1306)

Meanwhile, `saveQueuedAssetEdit()` (lines 1404-1444) correctly saves ALL of these fields back to the queue. So data is written to the queue but never read back.

**Impact:** Editing a queued SO/Carousel/Stacker asset silently loses all content. User sees default/empty fields.

**Proposed fix:** Add the missing field restorations to `editQueuedAsset()`, matching the field set in `saveQueuedAssetEdit()`.

**Risk:** HIGH — touches the queue editing pipeline. Must test: queue an SO asset → edit it → verify all 3 pages load correctly → save → verify queue reflects edits.

**Effort:** Small (add ~40 lines of field assignments)

---

### P0-2: `showEyebrow` boolean parsing inconsistent across render pages

**Files:** All 24 `app/render/*/page.tsx` files

**Problem:** Some render pages parse booleans as `!== 'false'` (defaults to true), others as `=== 'true'` (defaults to false). This creates silent export discrepancies — a field that shows in the editor may not show in the export, or vice versa.

Examples:
- `email-image/page.tsx`: `showEyebrow = searchParams.showEyebrow !== 'false'` (default: true)
- `email-grid/page.tsx`: `showEyebrow = searchParams.showEyebrow === 'true'` (default: false)

**Impact:** Inconsistent export behavior. Hard to catch because editor preview (React) and export (Puppeteer render page) use different code paths.

**Proposed fix:** Create `lib/render-params.ts` with typed param parsers that enforce consistent boolean parsing per field. See P1-7 for full proposal.

**Risk:** MEDIUM — changing default boolean values in render pages could alter existing exports. Must audit each template's intended default.

**Effort:** Medium

---

## P1 — Significant Efficiency Gains

### P1-1: Extract shared CorityLogo SVG component (24 duplicates)

**Files:** Every template in `components/templates/*.tsx` (24 files, lines 6-28 in each)

**Problem:** Every single template file contains an identical inline `CorityLogo` component with the same SVG path data (~22 lines). Only `height` and `fill` props vary.

**Proposed fix:** Create `components/shared/CorityLogo.tsx` (or `lib/icons/CorityLogo.tsx`) with the SVG, accepting `fill` and `height` props. Replace all 24 inline copies with imports.

**Savings:** ~530 lines removed (22 lines × 24 files)

**Risk:** LOW — pure presentational, no logic change. But must verify Puppeteer export still renders SVG correctly (inline SVG should work fine).

**Effort:** Small

---

### P1-2: Extract shared ArrowIcon SVG component (22 duplicates)

**Files:** Most templates in `components/templates/*.tsx` (~22 files, lines ~31-41 in each)

**Problem:** Nearly every template defines an inline `ArrowIcon` component for CTA arrows. Identical structure, only color/size vary.

**Proposed fix:** Create `components/shared/ArrowIcon.tsx` accepting `color` and `size` props. Replace all inline copies.

**Savings:** ~220 lines removed

**Risk:** LOW

**Effort:** Small

---

### P1-3: Extract `useGrayscaleImage` hook (19 duplicates)

**Files:** All image-bearing templates (~19 files): EmailImage, SocialImage, EmailSpeakers, all Newsletter templates, all Website templates, PDF templates

**Problem:** Every template with image support contains an identical `useEffect` block (~25 lines) that creates a canvas, draws the image, applies grayscale via `globalCompositeOperation: 'saturation'`, and produces a data URL. This is the single most-duplicated logic block in the codebase.

**Proposed fix:** Create `hooks/useGrayscaleImage.ts`:
```ts
export function useGrayscaleImage(imageUrl: string | null, grayscale: boolean): string | null
```
Returns the grayscale data URL (or null). Replace all 19 inline implementations.

**Savings:** ~475 lines removed (25 lines × 19 files)

**Risk:** LOW — pure utility, no state management impact. Test: upload image → toggle grayscale → verify preview + export both show grayscale.

**Effort:** Small

---

### P1-4: Extract `SolutionPill` component (11 duplicates)

**Files:** EmailImage, EmailGrid, EmailSpeakers, SocialImage, SocialDarkGradient, SocialBlueGradient, SocialGridDetail, NewsletterLight, WebsiteThumbnail, WebsiteReport, WebsitePressRelease

**Problem:** 11 templates contain near-identical solution pill JSX (~20 lines each): a styled div with color dot + uppercase label, using `colors.solutions[solution]` for dynamic values. Only padding/sizing varies by template size category.

**Proposed fix:** Create `components/shared/SolutionPill.tsx` accepting `size: 'sm' | 'md' | 'lg'`, `solution`, `colors`, and `textColor` props. Predefined sizing presets for email (sm), social (md), website (lg).

**Savings:** ~200 lines removed

**Risk:** LOW — pure presentational. Must verify pixel-perfect rendering matches Figma specs.

**Effort:** Small

---

### P1-5: Extract shared editor UI components (80+ instances)

**Files:** EditorScreen.tsx, SocialCarouselEditorScreen.tsx, StackerEditorScreen.tsx, FaqEditorScreen.tsx

**Problem:** The same UI patterns are copy-pasted across all editor screens:

| Component | Instances | Lines each | Total waste |
|-----------|-----------|------------|-------------|
| `<ToggleSwitch />` (show/hide toggles) | 80+ | 8-10 | ~700 lines |
| `<ImageUploadBox />` (dashed upload + library buttons) | 15+ | 40-50 | ~650 lines |
| `<ImagePreviewWithCrop />` (preview thumbnail + Adjust + Remove) | 8+ | 30-40 | ~280 lines |
| `<TextFieldWithLabel />` (labeled input) | 100+ | 8-10 | ~900 lines |
| `<TextareaWithLabel />` (labeled textarea) | 40+ | 10-12 | ~440 lines |

**Proposed fix:** Create `components/shared/` directory with these 5 components:

1. **`ToggleSwitch.tsx`** — `{ label, value, onChange }` — the `w-9 h-5 rounded-full` toggle used everywhere
2. **`ImageUploadBox.tsx`** — `{ onUpload, onLibrary }` — two dashed boxes side by side
3. **`ImagePreviewWithCrop.tsx`** — `{ imageUrl, onAdjust, onRemove, grayscale, onToggleGrayscale }` — preview with Adjust/X buttons
4. **`TextFieldWithLabel.tsx`** — `{ label, value, onChange, placeholder }` — standard dark-mode-aware input
5. **`TextareaWithLabel.tsx`** — `{ label, value, onChange, placeholder, rows }` — standard textarea

**Savings:** ~2,900 lines across all editors (conservative estimate)

**Risk:** LOW for components 1-3 (simple UI). MEDIUM for 4-5 (StackerEditorScreen has subtle variations in input styling).

**Effort:** Medium (create 5 components, update ~150 call sites)

---

### P1-6: Decompose EditorScreen.tsx (5,276 lines)

**File:** `components/EditorScreen.tsx`

**Problem:** The largest file handles 17 template types in a single component with 68+ useState hooks, an 18-branch handleExport function (299 lines), and template-specific UI sections spanning thousands of lines.

**Proposed decomposition:**

| Extract | Current location | Description | Effort |
|---------|-----------------|-------------|--------|
| `useEditorState()` hook | Lines 93-430 | All 68 useState hooks + initialization effects | Medium |
| `buildExportParams()` | Lines 676-974 | Per-template export param builder → use template registry pattern | Medium |
| `SolutionOverviewEditor` | Lines ~3500-5276 | All SO page 1-3 form sections (huge — ~1,700 lines) | Large |
| `NewsletterEditor` | Lines ~1616-1920 | Newsletter dark/blue/light controls (~300 lines) | Small |
| `SpeakerEditor` | Lines ~2100-2400 | Speaker form (3 speakers, image upload) (~300 lines) | Small |
| Image library routing | Lines 1262-1410 | 3 library modals + 4 crop modals → simplify with context | Medium |

**Target:** EditorScreen.tsx reduced from 5,276 → ~2,000 lines (core scaffold + template dispatch).

**Risk:** HIGH — EditorScreen is the central hub. Must preserve: (a) export param completeness, (b) draft persistence, (c) queue editing flow, (d) auto-create mode compatibility.

**Effort:** Large

---

### P1-7: Unify render page param parsing (24 files)

**Files:** All `app/render/*/page.tsx` (24 files, 1,772 lines total)

**Problem:** Each render page independently parses query params with zero shared code. Boolean parsing is inconsistent (see P0-2). Default values vary. The same field names (`eyebrow`, `headline`, `showEyebrow`, etc.) are parsed 20+ times.

**Proposed fix:** Create `lib/render-params.ts` with:
```ts
// Shared parsers
export function parseString(params, key, fallback): string
export function parseBoolean(params, key, defaultTrue): boolean
export function parseNumber(params, key, fallback): number
export function parseImageParams(params): { url, posX, posY, zoom, grayscale }

// Per-template param set (typed)
export function parseCommonParams(params): CommonRenderParams
export function parseEmailImageParams(params): EmailImageRenderParams
// etc.
```

**Savings:** ~800 lines across render pages (most files shrink from 60-100 lines to 15-30)

**Risk:** MEDIUM — must preserve exact default values per template. Regression test: export every template type and compare output before/after.

**Effort:** Medium

---

### P1-8: Consolidate 5 state reconstruction blocks in store

**File:** `store/index.ts` — lines 1093-1211, 1235-1313, 1332-1445, 1782-1854, 2081-2194

**Problem:** Five functions each reconstruct a full asset object by copying 130+ fields from store state. When a new prop is added, all 5 must be updated (this is the "thread through 8+ locations" pain documented in LESSONS.md).

The five functions:
1. `addToQueue()` — store state → QueuedAsset
2. `editQueuedAsset()` — QueuedAsset → store state
3. `saveQueuedAssetEdit()` — store state → QueuedAsset (update)
4. `loadGeneratedAssetIntoEditor()` — GeneratedAsset → store state
5. `addAllGeneratedToQueue()` — GeneratedAsset → QueuedAsset

**Proposed fix:** Create two utility functions:
```ts
// Snapshot current editor state into a flat asset object
function snapshotEditorState(state: AppState): AssetSnapshot { ... }

// Load an asset snapshot back into editor state
function loadSnapshotIntoEditor(snapshot: AssetSnapshot): Partial<AppState> { ... }
```

Both `QueuedAsset` and `GeneratedAsset` would extend or embed `AssetSnapshot`. Adding a new prop means adding it to ONE interface + ONE snapshot function + ONE load function.

**Savings:** ~600 lines of duplication eliminated. More importantly, new prop threading drops from 5 locations to 1.

**Risk:** HIGH — this is the core state management pipeline. Must test: (a) manual mode add-to-queue, (b) auto-create generation → queue, (c) queue editing round-trip, (d) draft save/load. Must not break the two-system separation.

**Effort:** Large

---

### P1-9: Unify three image library modals

**Files:** `ImageLibraryModal.tsx` (210 lines), `FaqCoverImageLibraryModal.tsx` (191 lines), `SolutionOverviewImageLibraryModal.tsx` (192 lines)

**Problem:** Three nearly identical modals (~95% shared structure) with minor differences:
- Image source (library.json vs solution-specific configs)
- Aspect ratio (varies by use case)
- Category labels

**Proposed fix:** Extend `ImageLibraryModal` to accept:
```ts
interface ImageLibraryModalProps {
  images: LibraryImage[]           // From any source
  categories?: string[]             // Custom category list
  categoryLabels?: Record<string, string>
  aspectRatio?: string              // e.g., "16/9", "204/792"
  onSelect: (url: string) => void
  onClose: () => void
}
```

FAQ and SO modals become thin wrappers that fetch their image configs and pass to the generic modal.

**Savings:** ~350 lines

**Risk:** LOW — modals are self-contained UI.

**Effort:** Small-Medium

---

### P1-10: Consolidate `DeleteConfirmModal` (3 implementations)

**Files:** `StackerEditorScreen.tsx` lines 30-72, `SocialCarouselEditorScreen.tsx` lines 78-91, `FaqEditorScreen.tsx` (inline)

**Problem:** Three separate delete confirmation modal implementations. Stacker's version is the most complete (parameterized `itemType` and `itemLabel`). Carousel has a simpler copy. FAQ uses inline logic.

**Proposed fix:** Extract Stacker's version to `components/shared/DeleteConfirmModal.tsx`. Replace all three usages.

**Savings:** ~80 lines

**Risk:** LOW

**Effort:** Small

---

## P2 — Nice-to-Have Cleanup

### P2-1: Naming inconsistency — `cta` vs `ctaText`

**Files:** `types/index.ts`, all template props, render pages, export params

**Problem:** CTA text is stored as `ctaText` in ManualAssetSettings (line 306) and most export params, but as `cta` in CopyContent (line 300) and some template props. Render pages check both: `(searchParams.ctaText as string) || (searchParams.cta as string)`.

**Proposed fix:** Standardize on `ctaText` everywhere (it's more descriptive). Update CopyContent interface, template props, and render pages.

**Risk:** MEDIUM — touches many files, could break export params if not all locations updated.

**Effort:** Medium

---

### P2-2: Extract `useThemeDetection` hook (3+ duplicates)

**Files:** `SolutionOverviewSetupScreen.tsx` lines 46-53, `FaqSetupScreen.tsx` lines 36-43, `StackerSetupScreen.tsx` lines 150-157

**Problem:** Identical MutationObserver pattern for detecting dark mode, repeated in every setup screen.

**Proposed fix:** Create `hooks/useThemeDetection.ts` returning `isDark: boolean`.

**Savings:** ~30 lines

**Risk:** LOW

**Effort:** Small

---

### P2-3: Extract shared rich text CSS constants

**Files:** ~18 template files

**Problem:** `RICH_TEXT_STYLES` constant (`.rich-text-dark` / `.rich-text-white` CSS) is defined inline in most templates.

**Proposed fix:** Move to `lib/rich-text-styles.ts` as exported constants.

**Savings:** ~90 lines

**Risk:** LOW

**Effort:** Small

---

### P2-4: Extract download/filename utilities from export screens

**Files:** `ExportQueueScreen.tsx`, `FaqExportScreen.tsx`, `StackerExportScreen.tsx`, `SolutionOverviewExportScreen.tsx`

**Problem:** `sanitizeFilename()` function and blob download pattern (`URL.createObjectURL` → `a.click()` → `URL.revokeObjectURL`) duplicated in all 4 export screens.

**Proposed fix:** Create `lib/download-utils.ts` with `sanitizeFilename()` and `downloadBlob(blob, filename)`.

**Savings:** ~80 lines

**Risk:** LOW

**Effort:** Small

---

### P2-5: Remove dead code — `saveCurrentAssetState()` stub

**File:** `store/index.ts` line 1857

**Problem:** Stub function with comment "This would be called..." — never called, never implemented.

**Proposed fix:** Delete it.

**Risk:** NONE

**Effort:** Trivial

---

### P2-6: Deprecate `ZoomableImage` in favor of `ImageCropModal`

**Files:** `components/ZoomableImage.tsx` (333 lines), used in `EditorScreen.tsx` and `FaqEditorScreen.tsx`

**Problem:** LESSONS.md documents that the app-wide pattern should be `ImageCropModal` (thumbnail + "Adjust" button), not `ZoomableImage` (inline drag-to-pan). But ZoomableImage is still used in EditorScreen for some templates and in FAQ editor.

**Proposed fix:** Migrate remaining ZoomableImage usages to ImageCropModal pattern, then delete the file.

**Savings:** 333 lines removed + consistency improvement

**Risk:** MEDIUM — must verify crop modal works for all image aspect ratios currently using ZoomableImage.

**Effort:** Medium

---

### P2-7: `speaker*ImageUrl` type inconsistency

**File:** `types/index.ts` line 321

**Problem:** Speaker image URLs are typed as `string` and initialized to `''` (empty string), while other image URLs use `string | null` with `null` for "no image." This makes null-checking inconsistent — some code checks `!imageUrl`, others check `imageUrl !== null`.

**Proposed fix:** Change to `string | null`, initialize to `null`, update checks.

**Risk:** LOW — but must update all speaker image checks across EditorScreen, template components, and export params.

**Effort:** Small

---

### P2-8: `EyeIcon` component duplicated

**Files:** `EditorScreen.tsx` lines 69-91, `SocialCarouselEditorScreen.tsx` lines 53-75

**Problem:** Identical `EyeIcon` component defined in two files.

**Proposed fix:** Move to `components/shared/EyeIcon.tsx`.

**Savings:** ~22 lines

**Risk:** NONE

**Effort:** Trivial

---

## Systemic Issues from LESSONS.md

### Issue: New prop threading is unsustainably expensive

**Root cause:** The export pipeline requires every new prop to appear in 8+ locations (AppState → ManualAssetSettings → QueuedAsset → GeneratedAsset → addToQueue → saveQueuedAssetEdit → editQueuedAsset → exportParams → export API route → render page). This is documented as the #1 pain point.

**Systemic fix:** P1-8 (AssetSnapshot pattern) reduces the store/queue threading from 5 locations to 1. P1-7 (render param parsing) reduces the render side. Together, adding a new prop would touch: (1) AssetSnapshot interface, (2) snapshot/load functions, (3) export API route template case, (4) render page param parser. That's 4 locations instead of 12+.

### Issue: Stacker dark mode pattern should generalize

**Evidence:** LESSONS.md documents the `lib/stacker-theme.ts` shared theme constants pattern. This pattern would benefit other templates if dark mode expanded beyond Stacker.

**No action needed now** — file this for when dark mode extends to other template types.

### Issue: ImageCropModal frame dimensions must match container

**Evidence:** LESSONS.md documents this as a recurring bug — crop modal frame doesn't match template container when sizes change dynamically.

**Systemic fix:** Include container dimensions as part of the image settings interface (or derive from template type + variant). This way the crop modal always knows the correct frame.

---

## Recommended Execution Order

### Phase 1: Quick wins, low risk (1-2 sessions)
1. P0-1 — Fix editQueuedAsset missing fields (prevents data loss)
2. P1-1 — Extract CorityLogo (24 files, mechanical)
3. P1-2 — Extract ArrowIcon (22 files, mechanical)
4. P1-3 — Extract useGrayscaleImage hook (19 files, mechanical)
5. P1-4 — Extract SolutionPill (11 files, mechanical)
6. P2-5 — Remove dead stub function
7. P2-8 — Extract EyeIcon

### Phase 2: Editor cleanup (2-3 sessions)
1. P1-5 — Extract shared editor UI components (ToggleSwitch, ImageUploadBox, etc.)
2. P1-10 — Consolidate DeleteConfirmModal
3. P1-9 — Unify image library modals
4. P2-2 — Extract useThemeDetection hook
5. P2-3 — Extract rich text CSS constants
6. P2-4 — Extract download/filename utilities

### Phase 3: Architecture (3-4 sessions, high risk)
1. P1-8 — Consolidate state reconstruction (AssetSnapshot pattern) ← highest impact
2. P0-2 + P1-7 — Unify render page param parsing
3. P1-6 — Decompose EditorScreen.tsx
4. P2-6 — Deprecate ZoomableImage

### Phase 4: Polish (1 session)
1. P2-1 — Standardize cta/ctaText naming
2. P2-7 — Fix speaker image URL types

---

## What NOT to refactor

- **The two state systems (manual vs auto-create):** Documented as legacy but deeply integrated. Unifying them would touch every editor flow, every queue function, and all of auto-create. The risk/reward ratio is too high. Better to keep them separated and use the AssetSnapshot pattern to reduce their surface area.

- **Store as single file:** At 2,605 lines, `store/index.ts` is large but cohesive. Splitting into multiple Zustand slices would add complexity without clear benefit — the store IS the app's state machine. The AssetSnapshot extraction (P1-8) is the right scalpel here.

- **Template components themselves:** Each template is ~250-400 lines of presentational JSX with inline styles. They're specific to their Figma designs. After extracting shared sub-components (logo, pill, arrow, grayscale hook), the remaining code IS the template. Don't abstract further.

- **Export API route structure:** At 763 lines, the export route is large but handles genuinely different template types. Breaking it into per-template handlers would just scatter the same code. The real fix is on the input side (consistent param parsing in P1-7).
