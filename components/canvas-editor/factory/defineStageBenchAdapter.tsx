'use client'

import { useRef, useState, type ComponentType, type ReactNode } from 'react'
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
import { SelectorPrimitive, type EnumOption } from '../stage-bar/SelectorPrimitive'
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
  useStageBenchDroppables,
  STAGE_DROPPABLE_ID,
  type SlotDragData,
} from '../stage-bench'
import type { StageBenchEditorProps } from '../StageBenchEditor'

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
  /** Default: true. False = always-on slot (logo, brand-locked anchor, mandatory headline). */
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
  | { id: string; kind: 'enum'; label?: string; options: EnumOption[] }
  | { id: string; kind: 'custom'; label?: string; render: () => ReactNode }

export type ImageSlotConfig<TBlockId extends string> = {
  blockId: TBlockId
  placeholderSrc: string
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

export type AdapterStoreBindings<TBlockId extends string> = {
  /** Per-slot store state + setters. Factory builds visibility/size/content registries from this. */
  slotState: Record<TBlockId, {
    value?: string
    visible?: boolean
    fontSize?: number | undefined
    setValue?: (next: string) => void
    setVisible?: (next: boolean) => void
    setFontSize?: (next: number) => void
  }>
  /** Image slot bundle — required iff `descriptor.image` is set. */
  image?: {
    url: string | undefined
    position: { x: number; y: number }
    zoom: number
    filters: ImageFilters
    setUrl: (next: string) => void
    setSettings: (next: ImageSlotSettings) => void
    /** Image-editor modal frame width. May depend on layout state. */
    frameWidth: number
    frameHeight: number
  }
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

  colors: ColorsConfig
  typography: TypographyConfig
  scale: number

  /** Same object as `bindings.extras`. Cast at use-site. */
  extras: Record<string, unknown>
}

export type StageBenchAdapterDescriptor<TBlockId extends string> = {
  templateId: TemplateType
  slots: SlotDescriptor<TBlockId>[]
  stageBar?: StageBarItemDescriptor[]
  image?: ImageSlotConfig<TBlockId>
  category?: CategorySlotConfig<TBlockId>
  contentStack?: ContentStackConfig
  useStoreBindings: () => AdapterStoreBindings<TBlockId>
  renderTemplate: (ctx: AdapterRenderContext<TBlockId>) => ReactNode
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
      colorsConfig, typographyConfig,
      onExport, onAddToQueue, onSaveToQueue, onPreview,
      onAddAsset, onGoToAsset, onDeleteAsset, getAssetLabel,
    } = props

    const bindings = descriptor.useStoreBindings()
    const editingPath = useCanvasEditorStore((s) => s.editingPath)
    const [showImageEditor, setShowImageEditor] = useState(false)

    const slotByBlockId = new Map<TBlockId, SlotDescriptor<TBlockId>>()
    for (const s of descriptor.slots) slotByBlockId.set(s.blockId, s)

    const visibilitySlots: SlotVisibility[] = descriptor.slots
      .filter((s) => s.benchable !== false)
      .map((s) => {
        const state = bindings.slotState[s.blockId]
        const visible = state?.visible ?? true
        const setVisible = state?.setVisible ?? (() => {})
        return {
          path: `${descriptor.templateId}.${s.blockId}`,
          label: s.label,
          iconKey: s.iconKey,
          isHidden: !visible,
          hide: () => setVisible(false),
          show: () => setVisible(true),
        }
      })

    const sizeSlots: SlotSize[] = descriptor.slots
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

    const contentSlots: SlotContent[] = descriptor.slots
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
      const isBenchable = slot.benchable !== false
      const isImage = slot.kind === 'image'
      const visSlot = visibilitySlots.find((v) => v.path === slotPath)
      const chipKind = slot.chipKind ?? DEFAULT_CHIP_KIND[slot.kind]
      const dragConfig = isBenchable && !isImage && visSlot
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
                max={descriptor.contentStack!.maxGap ?? 120}
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

    const stageBar = descriptor.stageBar && descriptor.stageBar.length > 0 ? (
      <>
        {descriptor.stageBar.map((item) => {
          const label = item.label ?? item.id
          if (item.kind === 'custom') {
            return <SelectorRow key={item.id} label={label}>{item.render()}</SelectorRow>
          }
          const sb = bindings.stageBar?.[item.id]
          if (!sb) return null
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
          }
        })}
      </>
    ) : null

    const slotImages: SlotImage[] = descriptor.image
      ? [
          {
            path: `${descriptor.templateId}.${descriptor.image.blockId}`,
            onSelect: () => setShowImageEditor(true),
          },
        ]
      : []

    const ctx: AdapterRenderContext<TBlockId> = {
      textOf, rawTextOf, visibilityOf, rawVisibilityOf, fontSizeOf,
      image: ctxImage,
      renderBlock, renderInlineEditor, renderOverlay, renderSpacerBetween,
      stackAlign: bindings.contentStack?.stackAlign,
      gaps: bindings.contentStack?.gaps,
      colors: colorsConfig,
      typography: typographyConfig,
      scale: 1,
      extras: bindings.extras ?? {},
    }

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
        actionRow={
          <StageBenchActionRow
            isExporting={isExporting}
            isEditingFromQueue={isEditingFromQueue}
            onPreview={onPreview}
            onAddToQueue={onAddToQueue}
            onSaveToQueue={onSaveToQueue}
            onExport={onExport}
          />
        }
        benchRef={setBenchNodeRef}
      >
        <div
          ref={setStageNodeRef}
          data-canvas-stage
          data-canvas-preview-pad
          style={{ position: 'relative' }}
        >
          {descriptor.renderTemplate(ctx)}
        </div>
      </StageBenchShell>
    )

    const imageWrapped = descriptor.image && bindings.image ? (
      <ImageRegistryProvider images={slotImages}>
        <ImageSelectionEffect />
        {inner}
        <ImageEditorModal
          isOpen={showImageEditor}
          onClose={() => setShowImageEditor(false)}
          imageSrc={bindings.image.url ?? descriptor.image.placeholderSrc}
          frameWidth={bindings.image.frameWidth}
          frameHeight={bindings.image.frameHeight}
          initialSettings={{
            position: bindings.image.position,
            zoom: bindings.image.zoom,
            filters: bindings.image.filters,
          }}
          onSettingsChange={(next) => {
            bindings.image!.setSettings({
              position: next.position,
              zoom: next.zoom,
              filters: next.filters,
            })
          }}
          onImageChange={(url) => {
            bindings.image!.setUrl(url)
            bindings.image!.setSettings({
              position: { x: 0, y: 0 },
              zoom: 1,
              filters: NEUTRAL_FILTERS,
            })
          }}
        />
      </ImageRegistryProvider>
    ) : inner

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
              <ContextualToolbar />
              <SelectionRing />
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
