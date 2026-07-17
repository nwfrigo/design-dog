'use client'

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import type { TemplateType, StackAlign } from '@/types'
import { NEUTRAL_FILTERS, type ImageFilters, type ImageSlotSettings } from '@/lib/image-filters'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useFlipReflow } from '@/lib/motion'
import { useActiveDrag } from '@/lib/dnd'

import { StageBenchShell } from '../StageBenchShell'
import { CanvasEditorProvider } from '../CanvasEditorProvider'
import { Editable } from '../Editable'
import { ContextualToolbar } from '../ContextualToolbar'
import { SelectionRing } from '../SelectionRing'
import { InlineTextEdit } from '../InlineTextEdit'
import { SpacingHandle } from '../handles/SpacingHandle'
import { BenchChip, type BenchChipKind } from '../bench/BenchChip'
import { SelectorRow } from '../stage-bar/SelectorRow'
import { SelectorPrimitive, type EnumOption, type ColorOption } from '@/components/ui/SelectorPrimitive'
import { VisibilityRegistryProvider, type SlotVisibility } from '../VisibilityRegistry'
import { SizeRegistryProvider, type SlotSize } from '../SizeRegistry'
import { ContentRegistryProvider, type SlotContent } from '../ContentRegistry'
import { CategoryRegistryProvider, type CategoryOption } from '../CategoryRegistry'
import { ImageRegistryProvider, useImageSelectionEffect, type SlotImage } from '../ImageRegistry'
import { ImageEditorModal } from '../../image-editor'
import {
  StageScrim,
  StageBenchHeader,
  StageBenchActionRow,
  StageBenchBench,
  PageSelector,
  useStageBenchDroppables,
  STAGE_DROPPABLE_ID,
  type SlotDragData,
} from '../stage-bench'
import type { StageBenchEditorProps } from '../StageBenchEditor'
import { useTelemetry } from '@/lib/telemetry'

/**
 * Adapter factory. Replaces ~300–450 lines of per-template boilerplate
 * with a declarative descriptor + a `useStoreBindings` hook + a focused
 * `renderTemplate` JSX function. See `STAGE-BENCH-CLEANUP-PLAN.md` Task 1.
 *
 * Variance the factory absorbs:
 *  - registry providers (Visibility, Size, Content, Category, Image)
 *  - droppables, FLIP reflow, drag preview-key, stage scrim
 *  - renderBlock / renderInlineEditor / renderOverlay dispatchers
 *  - renderSpacerBetween (Track 1 only)
 *  - stage-bar selector wiring from a typed item list
 *  - image-editor modal + selection effect
 *
 * Variance the adapter still owns (via `useStoreBindings` + `renderTemplate`):
 *  - which store fields to subscribe to
 *  - the exact template prop names + how store values map to them
 *  - any template-specific scalars (theme, layout vocabulary, custom flags)
 */

export type SlotKind = 'text' | 'cta' | 'image' | 'pill' | 'group'

export type SlotContentSpec = {
  format: 'html' | 'plain'
  /** Default: true for `kind: 'cta'`, false otherwise. */
  singleLine?: boolean
  /** Hard cap on rendered line count while editing (1 = one line, 4 = four).
   *  Input that would overflow is rejected. Omit for no cap. */
  maxLines?: number
  /** Shown via `textOf(blockId)` when the real value is empty. */
  placeholder?: string
}

export type SlotSizeSpec = {
  default: number
  min: number
  max: number
  step: number
}

export type SlotDescriptor<TBlockId extends string> = {
  blockId: TBlockId
  /** Bench chip label, also flows into the VisibilityRegistry. */
  label: string
  /** Free-form key consumed by the bench's iconKey→chipKind resolver. */
  iconKey: string
  /** Explicit chip kind. Defaults derived from `kind`. */
  chipKind?: BenchChipKind
  kind: SlotKind
  /** When set, this slot is a child of the named parent slot. Children
   *  participate in selection / content / size / inline editing, but are
   *  excluded from the bench surface (no chip, no drag region) — the parent
   *  represents the group on the bench. Selection deep-clicks via the
   *  DOM walker in `Editable.tsx`. Defaults `benchable` to false. */
  parent?: TBlockId
  /** Default: true (false when `parent` is set). False = always-on slot
   *  (logo, brand-locked anchor, mandatory headline, nested-group child). */
  benchable?: boolean
  /** For text/cta/group slots whose value is edited via InlineTextEdit. */
  content?: SlotContentSpec
  /** For text slots that should surface font-size controls in the per-block toolbar. */
  size?: SlotSizeSpec
}

export type StageBarItemDescriptor =
  | { id: string; kind: 'stack'; label?: string }
  | { id: string; kind: 'theme'; label?: string }
  | { id: string; kind: 'alignment'; label?: string }
  | { id: string; kind: 'layout'; label?: string }
  | { id: string; kind: 'layout-2'; label?: string }
  | { id: string; kind: 'enum'; label?: string; options: EnumOption[] }
  | { id: string; kind: 'color-2' | 'color-3' | 'color-4'; label?: string; options: ColorOption[] }
  | { id: string; kind: 'custom'; label?: string; render: () => ReactNode }

export type ImageSlotConfig<TBlockId extends string> = {
  blockId: TBlockId
  placeholderSrc: string
}

/** Per-blockId image slot for nested image children (e.g. per-speaker
 *  avatars). Each child gets its own modal binding via
 *  `AdapterStoreBindings.childImages[blockId]`. Use alongside a
 *  SlotDescriptor for the same blockId declared with `kind: 'image'`
 *  and `parent: 'parentBlockId'`. */
export type ChildImageSlotConfig<TBlockId extends string> = {
  blockId: TBlockId
  placeholderSrc: string
  frameWidth: number
  frameHeight: number
}

/** Per-image binding bundle. Used for both top-level and child image
 *  slots — the factory resolves the right bundle by blockId. */
export type ImageBinding = {
  url: string | undefined
  position: { x: number; y: number }
  zoom: number
  filters: ImageFilters
  setUrl: (next: string) => void
  setSettings: (next: ImageSlotSettings) => void
}

export type CategorySlotConfig<TBlockId extends string> = {
  blockId: TBlockId
  /** Derive the option list from the editor's colorsConfig. */
  options: (colors: ColorsConfig) => CategoryOption[]
}

export type ContentStackConfig = {
  templateKey: TemplateType
  /** Default: 120. */
  maxGap?: number
}

/** Multi-page config. When set, the factory renders a PageSelector above the
 *  stage, threads the active page into the `slots` resolver + render context,
 *  and resets to page 1 when the asset changes. One page is "on stage" at a
 *  time — single-canvas substrate assumptions (one bench, single selection)
 *  still hold. Omit for single-page templates. See STAGE-AND-BENCH.md §11. */
export type PagesConfig = {
  count: number
  /** Per-page labels shown in the pager (length should === count). */
  labels: string[]
}

export type AdapterStoreBindings<TBlockId extends string> = {
  /** Per-slot store state + setters. Factory builds visibility/size/content registries from this. */
  slotState: Record<TBlockId, {
    value?: string
    visible?: boolean
    fontSize?: number | undefined
    setValue?: (next: string) => void
    setVisible?: (next: boolean) => void
    setFontSize?: (next: number) => void
    /** Reason this slot is benched and can't be restored at the current state
     *  (engine-driven templates only). Surfaces as a dimmed, non-draggable
     *  bench chip with this note. Omit for normal user-hidden slots. */
    benchNote?: string
  }>
  /** Image slot bundle — required iff `descriptor.image` is set. */
  image?: ImageBinding & {
    /** Image-editor modal frame width. May depend on layout state. */
    frameWidth: number
    frameHeight: number
  }
  /** Per-blockId image bindings for child image slots — required iff
   *  `descriptor.childImages` has entries. Keyed by blockId so the
   *  factory can resolve the right bundle when a child avatar is
   *  selected. */
  childImages?: Partial<Record<TBlockId, ImageBinding>>
  /** Category bound state — required iff `descriptor.category` is set. */
  category?: {
    value: string
    set: (next: string) => void
  }
  /** Stack bound state — required iff `descriptor.contentStack` is set. */
  contentStack?: {
    stackAlign: StackAlign
    setStackAlign: (next: StackAlign) => void
    gaps: Record<string, number>
    setGap: (key: string, value: number) => void
    /** Optional dynamic max gap (px) — overrides `descriptor.contentStack.maxGap`.
     *  Lets size-varying templates (custom-size) scale the ceiling with the
     *  canvas instead of the fixed template-era 120. */
    maxGap?: number
  }
  /** Stage-bar selector values keyed by item id. Required iff `descriptor.stageBar` has non-custom items. */
  stageBar?: Record<string, { value: unknown; set: (next: unknown) => void }>
  /** Escape hatch — surfaces anything else needed inside renderTemplate (theme, grayscale, layout, etc.). */
  extras?: Record<string, unknown>
}

export type AdapterRenderContext<TBlockId extends string> = {
  textOf: (blockId: TBlockId) => string
  rawTextOf: (blockId: TBlockId) => string
  visibilityOf: (blockId: TBlockId) => boolean
  rawVisibilityOf: (blockId: TBlockId) => boolean
  fontSizeOf: (blockId: TBlockId) => number | undefined

  image: {
    url: string
    position: { x: number; y: number }
    zoom: number
    filters: ImageFilters
  } | null

  renderBlock: (blockId: TBlockId, content: ReactNode) => ReactNode
  renderInlineEditor: (blockId: TBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay: () => ReactNode
  renderSpacerBetween: ((key: string, value: number) => ReactNode) | undefined

  stackAlign: StackAlign | undefined
  gaps: Record<string, number> | undefined

  /** Active page (1-based) for multi-page templates. Always 1 for
   *  single-page templates. `renderTemplate` branches on this to render the
   *  current page. */
  currentPage: number

  colors: ColorsConfig
  typography: TypographyConfig
  scale: number

  /** Same object as `bindings.extras`. Cast at use-site. */
  extras: Record<string, unknown>
}

export type StageBenchAdapterDescriptor<TBlockId extends string> = {
  templateId: TemplateType
  /** Multi-page config. Omit for single-page templates (the default). */
  pages?: PagesConfig
  /** Static slot list, OR a resolver computed from live bindings each render
   *  (custom-size: the engine decides which slots exist for the current size;
   *  multi-page: the resolver returns the current page's slots). Existing
   *  adapters pass an array and are unaffected. The second arg is the active
   *  page (1 for single-page templates). */
  slots:
    | SlotDescriptor<TBlockId>[]
    | ((bindings: AdapterStoreBindings<TBlockId>, currentPage: number) => SlotDescriptor<TBlockId>[])
  /** Static stage-bar item list, OR a resolver computed from live bindings each
   *  render (custom-size: hides THEME when the background is an image). Existing
   *  adapters pass an array and are unaffected. */
  stageBar?:
    | StageBarItemDescriptor[]
    | ((bindings: AdapterStoreBindings<TBlockId>) => StageBarItemDescriptor[])
  /** Optional control strip rendered between the Stage and the ActionRow
   *  (custom-size's dimension row). Receives the same render context as
   *  `renderTemplate`. */
  belowStage?: (ctx: AdapterRenderContext<TBlockId>) => ReactNode
  /** Optional node rendered immediately LEFT of the action row (PREVIEW / ADD TO
   *  QUEUE), in the top bar's right group — e.g. custom-size's zoom readout. */
  actionRowLead?: (ctx: AdapterRenderContext<TBlockId>) => ReactNode
  /** `bottom` (default): action row below the stage, belowStage strip under it.
   *  `top`: both move into a full-width top bar above the body — the belowStage
   *  strip on the left, the action row on the right (custom-size, Figma 537:3679). */
  controlsPlacement?: 'top' | 'bottom'
  image?: ImageSlotConfig<TBlockId>
  /** Nested image slots — e.g. per-speaker avatars. Each entry needs a
   *  matching SlotDescriptor (kind: 'image', parent: 'parentBlockId')
   *  and a binding entry in `AdapterStoreBindings.childImages`. */
  childImages?: ChildImageSlotConfig<TBlockId>[]
  category?: CategorySlotConfig<TBlockId>
  contentStack?: ContentStackConfig
  useStoreBindings: () => AdapterStoreBindings<TBlockId>
  /** Standard path: renders the template inside the shared ScaledStage. Required
   *  unless `customStage` is provided. */
  renderTemplate?: (ctx: AdapterRenderContext<TBlockId>) => ReactNode
  /** Escape hatch: own the entire stage area (bypasses ScaledStage). Receives the
   *  render context + the stage drop/FLIP ref to wire onto its canvas box. Used
   *  by custom-size for its centre-anchored, freeze-during-drag resize stage. */
  customStage?: (args: {
    ctx: AdapterRenderContext<TBlockId>
    setStageNodeRef: (el: HTMLDivElement | null) => void
    /** Opens the image editor for the descriptor's image slot (if any). */
    openImageEditor?: () => void
  }) => ReactNode
}

const DEFAULT_CHIP_KIND: Record<SlotKind, BenchChipKind> = {
  text: 'headline',
  cta: 'button',
  image: 'category',
  pill: 'category',
  group: 'headline',
}

export function defineStageBenchAdapter<TBlockId extends string>(
  descriptor: StageBenchAdapterDescriptor<TBlockId>,
): ComponentType<StageBenchEditorProps> {
  function StageBenchAdapter(props: StageBenchEditorProps) {
    const {
      selectedAssets, currentAssetIndex, isExporting, isEditingFromQueue,
      exportScale, onSetExportScale,
      colorsConfig, typographyConfig,
      onExport, onAddToQueue, onSaveToQueue, onPreview,
      onAddAsset, onGoToAsset, onDeleteAsset, getAssetLabel,
    } = props

    const bindings = descriptor.useStoreBindings()

    // Multi-page: read the active page from the editor UI store, clamped to
    // the declared page count. Single-page templates pin to 1. `descriptor`
    // is constant, so hook order is stable across renders.
    const pageCount = descriptor.pages?.count ?? 1
    const rawStagePage = useCanvasEditorStore((s) => s.currentStagePage)
    const setCurrentStagePage = useCanvasEditorStore((s) => s.setCurrentStagePage)
    const currentPage = descriptor.pages
      ? Math.min(Math.max(1, rawStagePage), pageCount)
      : 1
    // Reset to page 1 when switching assets so a new asset doesn't inherit the
    // previous asset's page. No-op for single-page templates.
    useEffect(() => {
      if (descriptor.pages) setCurrentStagePage(1)
    }, [currentAssetIndex, setCurrentStagePage])

    // Slots are either a static array or computed from live bindings each render
    // (custom-size / multi-page). `descriptor` is constant, so this is deterministic.
    const slots = typeof descriptor.slots === 'function'
      ? descriptor.slots(bindings, currentPage)
      : descriptor.slots
    const editingPath = useCanvasEditorStore((s) => s.editingPath)
    // Tracks which image slot's modal is open. null = closed. Used by
    // both the top-level descriptor.image and any descriptor.childImages.
    const [editorForBlockId, setEditorForBlockId] = useState<TBlockId | null>(null)

    const track = useTelemetry()
    // Telemetry: fire `slot_edited` when editing ends (editingPath
    // transitions from a path inside this template back to null). One
    // event per edit session rather than per keystroke.
    const lastEditingPathRef = useRef<string | null>(editingPath)
    useEffect(() => {
      const prev = lastEditingPathRef.current
      lastEditingPathRef.current = editingPath
      if (prev && !editingPath) {
        const [tplId, ...rest] = prev.split('.')
        if (tplId === descriptor.templateId) {
          track({
            event_name: 'slot_edited',
            template_id: tplId,
            slot_id: rest.join('.'),
          })
        }
      }
    }, [editingPath, track])

    const slotByBlockId = new Map<TBlockId, SlotDescriptor<TBlockId>>()
    for (const s of slots) slotByBlockId.set(s.blockId, s)

    // Effective benchable: explicit value wins; otherwise children
    // (`parent` set) default to false, top-level slots default to true.
    const isBenchable = (s: SlotDescriptor<TBlockId>): boolean =>
      s.benchable ?? !s.parent

    const visibilitySlots: SlotVisibility[] = slots
      .filter(isBenchable)
      .map((s) => {
        const state = bindings.slotState[s.blockId]
        const visible = state?.visible ?? true
        const setVisible = state?.setVisible ?? (() => {})
        const slotIdStr = s.blockId as string
        return {
          path: `${descriptor.templateId}.${s.blockId}`,
          label: s.label,
          iconKey: s.iconKey,
          isHidden: !visible,
          note: state?.benchNote,
          hide: () => {
            setVisible(false)
            track({
              event_name: 'block_dragged_to_bench',
              template_id: descriptor.templateId,
              slot_id: slotIdStr,
            })
          },
          show: () => {
            setVisible(true)
            track({
              event_name: 'block_restored_from_bench',
              template_id: descriptor.templateId,
              slot_id: slotIdStr,
            })
          },
        }
      })

    const sizeSlots: SlotSize[] = slots
      .filter((s) => s.size !== undefined)
      .map((s) => {
        const cfg = s.size!
        const state = bindings.slotState[s.blockId]
        return {
          path: `${descriptor.templateId}.${s.blockId}`,
          value: state?.fontSize ?? cfg.default,
          min: cfg.min,
          max: cfg.max,
          step: cfg.step,
          set: state?.setFontSize ?? (() => {}),
        }
      })

    const contentSlots: SlotContent[] = slots
      .filter((s) => s.content !== undefined)
      .map((s) => {
        const cfg = s.content!
        const state = bindings.slotState[s.blockId]
        return {
          path: `${descriptor.templateId}.${s.blockId}`,
          format: cfg.format,
          value: state?.value ?? '',
          set: state?.setValue ?? (() => {}),
        }
      })

    const activeDrag = useActiveDrag<SlotDragData>()
    const previewKey =
      activeDrag &&
      activeDrag.data.region === 'bench' &&
      activeDrag.overTargetId === STAGE_DROPPABLE_ID
        ? activeDrag.data.path.split('.').slice(1).join('.')
        : null
    const showStageScrim = previewKey !== null

    const stageRef = useRef<HTMLDivElement | null>(null)
    useFlipReflow(stageRef)
    const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
      useStageBenchDroppables(visibilitySlots)
    const setStageNodeRef = (el: HTMLDivElement | null) => {
      stageRef.current = el
      setStageDropRef(el)
    }

    const textOf = (blockId: TBlockId): string => {
      const real = bindings.slotState[blockId]?.value
      if (real) return real
      return slotByBlockId.get(blockId)?.content?.placeholder ?? ''
    }
    const rawTextOf = (blockId: TBlockId): string =>
      bindings.slotState[blockId]?.value ?? ''
    const visibilityOf = (blockId: TBlockId): boolean => {
      const raw = bindings.slotState[blockId]?.visible ?? true
      return raw || previewKey === blockId
    }
    const rawVisibilityOf = (blockId: TBlockId): boolean =>
      bindings.slotState[blockId]?.visible ?? true
    const fontSizeOf = (blockId: TBlockId): number | undefined =>
      bindings.slotState[blockId]?.fontSize ?? undefined

    const renderBlock = (blockId: TBlockId, content: ReactNode): ReactNode => {
      const slot = slotByBlockId.get(blockId)
      if (!slot) return content
      const slotPath = `${descriptor.templateId}.${blockId}`
      const slotIsBenchable = isBenchable(slot)
      const isImage = slot.kind === 'image'
      const visSlot = visibilitySlots.find((v) => v.path === slotPath)
      const chipKind = slot.chipKind ?? DEFAULT_CHIP_KIND[slot.kind]
      const dragConfig = slotIsBenchable && !isImage && visSlot
        ? {
            data: { region: 'stage' as const, path: slotPath },
            preview: (
              <BenchChip
                kind={chipKind}
                label={visSlot.label}
                isFloating
                draggable={false}
              />
            ),
          }
        : undefined
      return (
        <Editable
          templateId={descriptor.templateId}
          slotKey={blockId as string}
          storeKey={blockId as string}
          kind={slot.kind}
          drag={dragConfig}
          previewActive={previewKey === blockId}
        >
          {content}
        </Editable>
      )
    }

    const renderInlineEditor = (blockId: TBlockId, defaultInner: ReactNode): ReactNode => {
      const slot = slotByBlockId.get(blockId)
      const slotPath = `${descriptor.templateId}.${blockId}`
      if (editingPath !== slotPath) return defaultInner
      if (!slot || !slot.content) return defaultInner
      const state = bindings.slotState[blockId]
      const value = state?.value ?? ''
      const setValue = state?.setValue ?? (() => {})
      const singleLine = slot.content.singleLine ?? (slot.kind === 'cta')
      return (
        <InlineTextEdit
          value={value}
          onChange={setValue}
          format={slot.content.format}
          singleLine={singleLine}
          maxLines={slot.content.maxLines}
        />
      )
    }

    const renderOverlay = (): ReactNode => <StageScrim visible={showStageScrim} />

    const renderSpacerBetween = descriptor.contentStack && bindings.contentStack
      ? (key: string, value: number) => {
          const cs = bindings.contentStack!
          return (
            <Editable
              templateId={descriptor.templateId}
              slotKey={key}
              storeKey="templateGaps"
              kind="spacer"
            >
              <SpacingHandle
                spacing={value}
                onChange={(next) => cs.setGap(key, next)}
                scale={1}
                direction={cs.stackAlign === 'bottom' ? 'up' : 'down'}
                min={0}
                max={bindings.contentStack!.maxGap ?? descriptor.contentStack!.maxGap ?? 120}
                showUnit
              />
            </Editable>
          )
        }
      : undefined

    const ctxImage = descriptor.image && bindings.image
      ? {
          url: bindings.image.url ?? descriptor.image.placeholderSrc,
          position: bindings.image.position,
          zoom: bindings.image.zoom,
          filters: bindings.image.filters,
        }
      : null

    const stageBarItems = typeof descriptor.stageBar === 'function'
      ? descriptor.stageBar(bindings)
      : descriptor.stageBar
    const stageBar = stageBarItems && stageBarItems.length > 0 ? (
      <>
        {stageBarItems.map((item) => {
          const label = item.label ?? item.id
          if (item.kind === 'custom') {
            return <SelectorRow key={item.id} label={label}>{item.render()}</SelectorRow>
          }
          const sbRaw = bindings.stageBar?.[item.id]
          if (!sbRaw) return null
          // Wrap the setter so every stage-bar change fires telemetry.
          const sb = {
            value: sbRaw.value,
            set: (next: unknown) => {
              if (next !== sbRaw.value) {
                track({
                  event_name: 'variant_changed',
                  template_id: descriptor.templateId,
                  slot_id: item.id,
                  props: { kind: item.kind, value: next as string | number | boolean },
                })
              }
              sbRaw.set(next)
            },
          }
          switch (item.kind) {
            case 'theme':
              return (
                <SelectorRow key={item.id} label={label}>
                  <SelectorPrimitive
                    kind="theme"
                    value={sb.value as 'light' | 'dark'}
                    onChange={sb.set as (v: 'light' | 'dark') => void}
                  />
                </SelectorRow>
              )
            case 'alignment':
              return (
                <SelectorRow key={item.id} label={label}>
                  <SelectorPrimitive
                    kind="alignment"
                    value={sb.value as 'left' | 'center'}
                    onChange={sb.set as (v: 'left' | 'center') => void}
                  />
                </SelectorRow>
              )
            case 'stack':
              return (
                <SelectorRow key={item.id} label={label}>
                  <SelectorPrimitive
                    kind="stack"
                    value={sb.value as StackAlign}
                    onChange={sb.set as (v: StackAlign) => void}
                  />
                </SelectorRow>
              )
            case 'layout':
              return (
                <SelectorRow key={item.id} label={label}>
                  <SelectorPrimitive
                    kind="layout"
                    value={sb.value as 'image' | 'even' | 'text'}
                    onChange={sb.set as (v: 'image' | 'even' | 'text') => void}
                  />
                </SelectorRow>
              )
            case 'layout-2':
              return (
                <SelectorRow key={item.id} label={label}>
                  <SelectorPrimitive
                    kind="layout-2"
                    value={sb.value as 'image' | 'text'}
                    onChange={sb.set as (v: 'image' | 'text') => void}
                  />
                </SelectorRow>
              )
            case 'enum':
              return (
                <SelectorRow key={item.id} label={label}>
                  <SelectorPrimitive
                    kind="enum"
                    value={sb.value as string}
                    onChange={sb.set as (v: string) => void}
                    options={item.options}
                  />
                </SelectorRow>
              )
            case 'color-2':
            case 'color-3':
            case 'color-4':
              return (
                <SelectorRow key={item.id} label={label}>
                  <SelectorPrimitive
                    kind={item.kind}
                    value={sb.value as string}
                    onChange={sb.set as (v: string) => void}
                    options={item.options}
                  />
                </SelectorRow>
              )
          }
        })}
      </>
    ) : null

    const slotImages: SlotImage[] = [
      ...(descriptor.image
        ? [{
            path: `${descriptor.templateId}.${descriptor.image.blockId}`,
            onSelect: () => setEditorForBlockId(descriptor.image!.blockId),
          }]
        : []),
      ...(descriptor.childImages ?? []).map((cfg) => ({
        path: `${descriptor.templateId}.${cfg.blockId}`,
        onSelect: () => setEditorForBlockId(cfg.blockId),
      })),
    ]

    const ctx: AdapterRenderContext<TBlockId> = {
      textOf, rawTextOf, visibilityOf, rawVisibilityOf, fontSizeOf,
      image: ctxImage,
      renderBlock, renderInlineEditor, renderOverlay, renderSpacerBetween,
      stackAlign: bindings.contentStack?.stackAlign,
      gaps: bindings.contentStack?.gaps,
      currentPage,
      colors: colorsConfig,
      typography: typographyConfig,
      scale: 1,
      extras: bindings.extras ?? {},
    }

    const belowStageNode = descriptor.belowStage?.(ctx)
    const aboveStageNode = descriptor.pages ? (
      <PageSelector
        value={currentPage}
        count={descriptor.pages.count}
        labels={descriptor.pages.labels}
        onChange={setCurrentStagePage}
      />
    ) : undefined
    const actionRowLeadNode = descriptor.actionRowLead?.(ctx)
    const actionRowNode = (
      <StageBenchActionRow
        isExporting={isExporting}
        isEditingFromQueue={isEditingFromQueue}
        exportScale={exportScale}
        onSetExportScale={onSetExportScale}
        onPreview={onPreview}
        onAddToQueue={onAddToQueue}
        onSaveToQueue={onSaveToQueue}
        onExport={onExport}
      />
    )
    const controlsOnTop = descriptor.controlsPlacement === 'top'

    const inner = (
      <StageBenchShell
        header={
          <StageBenchHeader
            selectedAssets={selectedAssets}
            currentAssetIndex={currentAssetIndex}
            isEditingFromQueue={isEditingFromQueue}
            onGoToAsset={onGoToAsset}
            onAddAsset={onAddAsset}
            onDeleteAsset={onDeleteAsset}
            getAssetLabel={getAssetLabel}
          />
        }
        bench={<StageBenchBench />}
        stageBar={stageBar}
        // controlsPlacement='top' → toolbar (left) + action row (right) in the
        // top bar; otherwise the standard below-stage placement.
        topBar={controlsOnTop ? (
          <div className="flex items-center justify-between gap-8">
            <div>{belowStageNode}</div>
            <div className="flex items-center gap-5">
              {actionRowLeadNode}
              {actionRowNode}
            </div>
          </div>
        ) : undefined}
        belowStage={controlsOnTop ? undefined : belowStageNode}
        aboveStage={aboveStageNode}
        actionRow={controlsOnTop ? null : actionRowNode}
        benchRef={setBenchNodeRef}
        rawStage={!!descriptor.customStage}
      >
        {descriptor.customStage ? (
          descriptor.customStage({
            ctx,
            setStageNodeRef,
            openImageEditor: descriptor.image ? () => setEditorForBlockId(descriptor.image!.blockId) : undefined,
          })
        ) : (
          <div
            ref={setStageNodeRef}
            data-canvas-stage
            data-canvas-preview-pad
            // `max-content` so this hugs the template's TRUE intrinsic size even
            // when it changes at runtime. Without it the element stays pinned to
            // the parent's previous width, so ScaledStage measures a stale value.
            style={{ position: 'relative', width: 'max-content', height: 'max-content' }}
          >
            {descriptor.renderTemplate?.(ctx)}
          </div>
        )}
      </StageBenchShell>
    )

    // ContextualToolbar + SelectionRing must live INSIDE the Category and
    // Image registry providers so EditbarCategory / EditbarImage can
    // resolve the active slot's bindings via context.
    const innerWithToolbar = (
      <>
        {inner}
        <ContextualToolbar />
        <SelectionRing />
      </>
    )

    // Resolve the modal's binding + frame from whichever slot is open.
    // editorForBlockId can be either descriptor.image.blockId or one of
    // the descriptor.childImages[].blockId values.
    const resolveModalConfig = (): {
      binding: ImageBinding
      placeholderSrc: string
      frameWidth: number
      frameHeight: number
    } | null => {
      if (!editorForBlockId) return null
      if (descriptor.image && bindings.image && editorForBlockId === descriptor.image.blockId) {
        return {
          binding: bindings.image,
          placeholderSrc: descriptor.image.placeholderSrc,
          frameWidth: bindings.image.frameWidth,
          frameHeight: bindings.image.frameHeight,
        }
      }
      const childCfg = descriptor.childImages?.find((c) => c.blockId === editorForBlockId)
      const childBinding = bindings.childImages?.[editorForBlockId]
      if (childCfg && childBinding) {
        return {
          binding: childBinding,
          placeholderSrc: childCfg.placeholderSrc,
          frameWidth: childCfg.frameWidth,
          frameHeight: childCfg.frameHeight,
        }
      }
      return null
    }
    const modalCfg = resolveModalConfig()

    const hasAnyImage = !!descriptor.image || (descriptor.childImages?.length ?? 0) > 0
    const imageWrapped = hasAnyImage ? (
      <ImageRegistryProvider images={slotImages}>
        <ImageSelectionEffect />
        {innerWithToolbar}
        {modalCfg && (
          <ImageEditorModal
            isOpen={true}
            onClose={() => setEditorForBlockId(null)}
            imageSrc={modalCfg.binding.url ?? modalCfg.placeholderSrc}
            frameWidth={modalCfg.frameWidth}
            frameHeight={modalCfg.frameHeight}
            initialSettings={{
              position: modalCfg.binding.position,
              zoom: modalCfg.binding.zoom,
              filters: modalCfg.binding.filters,
            }}
            onSettingsChange={(next) => {
              modalCfg.binding.setSettings({
                position: next.position,
                zoom: next.zoom,
                filters: next.filters,
              })
            }}
            onImageChange={(url) => {
              modalCfg.binding.setUrl(url)
              modalCfg.binding.setSettings({
                position: { x: 0, y: 0 },
                zoom: 1,
                filters: NEUTRAL_FILTERS,
              })
            }}
          />
        )}
      </ImageRegistryProvider>
    ) : innerWithToolbar

    const categoryWrapped = descriptor.category && bindings.category ? (
      <CategoryRegistryProvider
        categories={[
          {
            path: `${descriptor.templateId}.${descriptor.category.blockId}`,
            options: descriptor.category.options(colorsConfig),
            value: bindings.category.value,
            set: bindings.category.set,
          },
        ]}
      >
        {imageWrapped}
      </CategoryRegistryProvider>
    ) : imageWrapped

    return (
      <CanvasEditorProvider mode="edit">
        <VisibilityRegistryProvider slots={visibilitySlots}>
          <SizeRegistryProvider sizes={sizeSlots}>
            <ContentRegistryProvider contents={contentSlots}>
              {categoryWrapped}
            </ContentRegistryProvider>
          </SizeRegistryProvider>
        </VisibilityRegistryProvider>
      </CanvasEditorProvider>
    )
  }
  StageBenchAdapter.displayName = `StageBenchAdapter(${descriptor.templateId})`
  return StageBenchAdapter
}

function ImageSelectionEffect() {
  useImageSelectionEffect()
  return null
}
