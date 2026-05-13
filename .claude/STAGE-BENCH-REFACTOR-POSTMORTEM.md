# Stage & Bench Refactor — Postmortem

> Historical record of the 1.5 renovation. What we changed, why it worked, what bit us, and what got left for later. **This is a journal, not a plan** — for the *current* substrate state see `STAGE-AND-BENCH.md`; for *open* substrate work see `SUBSTRATE-DEBT.md`.

---

## Context

Pre-1.5, Design Dog had ~28 single-image templates editable only through a 5000+ line `EditorScreen.tsx` sidebar form. Spacing was hardcoded per template; visibility toggles were sidebar checkboxes; per-template wiring was duplicated across `template-config.ts`, `template-registry.tsx`, `export-params.ts`, and the EditorScreen itself.

The 1.5 mandate: every single-image template gets direct-manipulation editing (drag-to-bench, deep-click to edit, contextual toolbars), one canonical adapter pattern, and a unified spacing model — without converging the templates' visual designs.

---

## The load-bearing insight: two paradigms

A pre-migration audit of all 28 templates revealed they split cleanly into two structural shapes that need *different* renovation tracks. This insight is what kept the substrate honest:

**Track 1 — Stack-based** (~17 templates). Vertical content stacks (logo / content / cta) with hardcoded gaps. Natural fit for a shared `ContentStack` primitive with adjustable per-gap spacing + `stackAlign`.

**Track 2 — Fixed-composition** (~9 templates). Designed at exact pixel coordinates (logo at `left: 27, top: 18`, dividers at calculated positions). The layout *is* the design. **The renovation premise didn't apply** — these got S&B's editable wrapping at existing positions, no layout change.

Why this mattered: every prior "let's unify the layout" attempt would have collapsed the templates into looking the same. The two-track model lets the substrate share editing semantics (selection, bench, toolbars, registries) while preserving each template's visual identity.

---

## Per-template scorecard

### Group A — Proving ground (3 templates)
| Template | Notes |
|---|---|
| EmailDarkGradient | Pilot. Bespoke stack column refactored onto ContentStack. |
| WebsitePressRelease | Pilot. `PressReleaseLeftColumn` → ContentStack. End-to-end filter wiring. |
| EmailSpeakers | Pilot. Originally hand-rolled; back-filled to factory in 1.5 close-out. |

### Group B — Track 1 single-column (10 templates)
SocialDarkGradient, SocialBlueGradient, SocialEhsAccelerate, SocialImage, SocialImageMeddbase, EmailImage, NewsletterDarkGradient, NewsletterBlueGradient, NewsletterLight, NewsletterTopBanner — all ✅ Done.

### Group C — Track 1 two-column press-release-shaped (3 templates)
| Template | Notes |
|---|---|
| WebsiteWebinar | 3-variant text/image/speakers; per-speaker name+role+avatar editable via factory nested slots + childImages. |
| WebsiteReport | image-left variant + text-only. |
| WebsiteThumbnail | image-right variant + text-only. |

### Group D — Track 1 nested stacks (4 templates)
| Template | Notes |
|---|---|
| EmailGrid | Left column ContentStack + right grid panel with equal-flex distribution. |
| SocialGridDetail | 4 rows, rows 3+4 toggleable. |
| WebsiteEventListing | 3-variant enum + nested grid panel; logo as left-column footer. |
| WebsiteEhsAccelerateListing | Nested grid; no variant, baked background. |

### Group E — Track 2 absolute-positioned (7 templates)
EmailProductRelease, EmailCorityConnect2026 (16-background enum — validates new substrate primitive), EmailCorityCustomerExchangeSignature, EmailCorityCustomerExchangeBanner (4-color enum + flex-end CTA anchor), EmailEhsAccelerateSignature (date/location share visibility flag but stay independently editable), EmailEhsAccelerateBanner, EmailEhsAccelerateInvitation (8 abs-pos slots; rich-text body via factory `format: 'html'` + EditbarText toolbar; template hidden from selection surfaces) — all ✅ Done.

### Group F — Track 2 horizontal banner strips (2 templates)
WebsiteFloatingBanner, WebsiteFloatingBannerMobile — both ✅ Done with 7-variant enum.

### Hidden / out-of-scope
- **social-carousel** — hidden via `hidden: true` flag; structurally a multi-slide paradigm that doesn't fit single-stage editing. Code retained.
- **email-ehs-accelerate-invitation** — migrated to S&B then hidden; user-driven decision.
- **solution-overview-pdf, faq-pdf, stacker-pdf** — multi-page document paradigm. Stay on the legacy sidebar-form editor for 1.5; would need a different shell (page selector inside the stage column) to migrate.

### Totals
- Track 1: 17 of 17 done.
- Track 2: 9 of 9 done.
- Hidden: 2 (kept in registry for existing drafts).
- Legacy editor: 3 (PDFs).

---

## Substrate primitives shipped

What landed in `components/canvas-editor/` and `lib/` during the renovation. Each is the foundation for one editing concern; current detail lives in `STAGE-AND-BENCH.md`.

| Primitive | Purpose |
|---|---|
| `defineStageBenchAdapter` factory | One canonical adapter pattern. Replaced 27 hand-rolled adapters + the EmailSpeakers hand-roll back-fill. Per-template wiring collapses to one Registration file. |
| `lib/stage-bench-registry.ts` | Single source of truth — feeds `template-registry`, `export-params`, and adapter dispatch from one place. |
| `ContentStack` | Track 1's spacing primitive. Owns visibility-aware gap collapsing + spacer injection. Templates provide typography + ordering + `defaultGap`. |
| `SelectorPrimitive kind="enum"` | N-state stage-bar selector with icons / swatches / labels. Wrap-at-4 corner-radius logic for >4 cells. |
| Nested slots (`SlotDescriptor.parent`) | Bench-suppressed child slots. Deep-click cascades via DOM ancestor walker in `Editable.tsx`. Established for per-speaker name+role pattern. |
| Nested image slots (`AdapterDescriptor.childImages` + `bindings.childImages`) | Per-blockId image bindings + per-blockId modal state. Lit up per-speaker avatars. |
| `EditbarText` bold/italic + font-size | Selection-aware contextual formatting. Gated by `content.format === 'html'`. |
| Registration validator (`scripts/validate-registrations.ts`) | Static check that every toggleable slot's visibility flag is wired through `renderProps` + `exportBuilder`. Catches the class of bug where editor toggles get silently dropped at export. `npm run validate:registrations`. |
| Telemetry shell (`useTelemetry`, `/api/track`, `/admin/events`) | 6 chokepoints (slot_edited, block_dragged_to_bench, block_restored_from_bench, variant_changed, asset_queued, asset_exported) into Postgres `events` table + admin dashboard. |

---

## Lessons learned

### 1. Forward migrations are obvious. Back-fill migrations get deferred indefinitely.

When a substrate primitive lands specifically to unblock a hand-rolled outlier, **the same pass should back-fill the outlier**. Otherwise it becomes substrate debt by another name.

Concrete instance: EmailSpeakers shipped hand-rolled as one of the first S&B pilots before the factory had the nested-slot + childImages primitives. Both primitives landed in 1.5 close-out — and at each landing the obvious next move ("migrate EmailSpeakers") got deferred because "it's already working." Result: it stayed hand-rolled for weeks longer than necessary, and a user-visible bug (avatar selection broken after a refactor) was the forcing function for finally doing it.

The fix going forward: when paying substrate debt that unblocks a known consumer, migrate that consumer in the same commit, not as a follow-up.

### 2. Don't substrate-ize small wrinkles.

When a small UX wrinkle has a clean implementation but the underlying problem deserves a first-principles design later, **skip the small fix.** Don't ship a half-shaped primitive that the bigger design will then need to retrofit around.

Concrete instance: per-row data/cta toggle on grid templates (~3 hrs of clean work). Skipped because real block-type swapping (image ↔ grid, paragraph ↔ quote) needs a fresh design when it actually lands, and the row-toggle primitive would have constrained that future design's vocabulary.

### 3. The export pipeline can silently lie about user toggles.

User toggles a visibility flag → store updates → editor honors it. But if the registration's `exportBuilder` doesn't emit that flag and the `renderSchema` defaults to `true`, the exported output ignores the toggle.

This bug hid in 18 templates across two flavors:
- Standard show-flag drift (flag missing from `renderProps`/`exportBuilder`/`renderSchema.fields`).
- Sentinel-gated drift (Group C templates gate the solution pill via `solution !== 'none'` instead of a `showSolutionSet` prop; registrations passed `solution` unconditionally).

Fix and prevention: every gap closed, plus a static validator (`npm run validate:registrations`) that compares adapter `setVisible` wirings against the registration's export pipeline. CI/precommit-friendly. Future template additions get caught.

### 4. Sunsetting beats half-fixing.

Auto-Create was the editor's biggest divergence — manual-mode users got S&B; auto-create users got the legacy sidebar for migrated templates. We were *one* hand-rolled shell adaptation away from forcing a "new editor brand everywhere" pass. Sunsetting Auto-Create entirely was bigger upfront (4862 deletions) but eliminated the divergence permanently and let the docs/playbook describe a single canonical experience without exception-carving.

When two paths through a feature force you to maintain duplicate state systems / duplicate UX patterns, killing the unused path beats unifying both.

---

## What stayed open (transferred to SUBSTRATE-DEBT.md)

The renovation closed every substrate-debt entry that originated from the migration except one:

- **Image-source-key for shared image slots** — newsletter dark/light variants ideally share image identity (edit once, both variants update). Currently each template gets its own settings bundle. Theoretical UX wrinkle; waiting for real-world feedback or the newsletter→universal-image migration as a trigger.

---

## Renovation timeline

Approximately 6 weeks from substrate consolidation (Phase A, `ContentStack` extraction) through final back-fill (EmailSpeakers → factory). The branch `feature-drag-editor` carried the whole renovation; merge to main was gated on the docs cleanup pass this postmortem closes out.

---

## Pointers

- **Current substrate architecture** → `STAGE-AND-BENCH.md`
- **Open substrate debt** → `SUBSTRATE-DEBT.md`
- **Adding a new template** → (forthcoming contribution playbook in the next docs pass)
- **What templates exist + how to read the catalog** → `TEMPLATES.md`
- **System design (state, export, drafts)** → `ARCHITECTURE.md`
