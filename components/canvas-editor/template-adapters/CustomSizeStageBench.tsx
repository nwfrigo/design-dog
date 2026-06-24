'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/store'
import type { TemplateTheme, StackAlign } from '@/types'
import { NEUTRAL_FILTERS, NEUTRAL_SLOT_SETTINGS } from '@/lib/image-filters'

import {
  defineStageBenchAdapter,
  type SlotDescriptor,
  type StageBarItemDescriptor,
} from '../factory/defineStageBenchAdapter'
import { CustomSizeCanvas } from '@/components/custom-size/CustomSizeCanvas'
import { CustomSizeRow, type CustomSizeRowProps } from '@/components/custom-size/CustomSizeRow'
import {
  CustomSizeBackgroundLayer,
  type CustomSizeBackgroundLayerProps,
} from '@/components/custom-size/CustomSizeBackgroundLayer'
import { CustomSizeStage } from '@/components/custom-size/CustomSizeStage'
import {
  resolveLayout,
  type CustomBlockId,
  type CustomSizeSlotId,
  type CustomContent,
  type LayoutOverrides,
} from '@/lib/custom-size/resolve'
import {
  customSizeToProps,
  defaultCustomSizeDocument,
  type CustomSizeDocument,
  type ReusedContent,
} from '@/lib/custom-size/document'
import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

/**
 * Stage & Bench adapter for custom-size (factory-driven, COMPUTED slots).
 *
 * The slot set is resolved each render from the engine: it returns the brand
 * blocks the current dimensions actually support (band-excluded blocks drop
 * out), plus the image + solution pill. The template renders via the shared
 * CustomSizeCanvas with the factory render-props threaded through.
 *
 * The dimension control strip (W×H fields, ratio presets, undo, show-presets)
 * mounts via the factory's `belowStage` slot and drives live canvas resize. The
 * stage bar exposes BACKGROUND (color|image) + THEME (theme hidden in image-led
 * mode); alignment is engine-owned. Homepage entry is the remaining gap (PRD §13).
 */

const TEXT_IDS: CustomBlockId[] = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
const HTML_FORMAT = new Set<CustomBlockId>(['headline', 'subhead', 'body'])

// BACKGROUND selector: solid colour vs. full-bleed image (image-led mode).
const BACKGROUND_OPTIONS = [
  { value: 'color', label: 'COLOR', ariaLabel: 'Solid colour background' },
  { value: 'image', label: 'IMAGE', ariaLabel: 'Image background' },
]

function textSlot(id: CustomBlockId): SlotDescriptor<CustomSizeSlotId> {
  const slot: SlotDescriptor<CustomSizeSlotId> = {
    blockId: id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    iconKey: id,
    kind: id === 'cta' ? 'cta' : 'text',
    // Headline is always-on (locked); everything else is hideable to the bench.
    benchable: id !== 'headline',
    content: {
      format: HTML_FORMAT.has(id) ? 'html' : 'plain',
      placeholder: SLOT_PLACEHOLDERS[id],
    },
  }
  // Font-size control is a RELATIVE multiplier (default 1×), not absolute px:
  // the engine computes each block's size from the canvas, and this nudge rides
  // on top — so the choice persists proportionally across resizes. Value/min/max
  // live in multiplier space; the editbar only shows A↑/A↓ (no numeric readout).
  // step = 5% per click (matches main templates' ~1–4px ≈ 5%-of-default feel),
  // giving 24 fine stops across the range instead of a coarse jump.
  slot.size = { default: 1, min: 0.6, max: 1.8, step: 0.05 }
  return slot
}

export const CustomSizeStageBench = defineStageBenchAdapter<CustomSizeSlotId>({
  templateId: 'custom-size',
  // Computed slots: the engine decides which blocks this shape supports.
  slots: (bindings) => {
    const ex = bindings.extras ?? {}
    const content = ex.content as CustomContent
    const overrides = ex.overrides as LayoutOverrides
    const doc = ex.doc as CustomSizeDocument
    // Reuse the layout resolved in useStoreBindings (stashed in extras).
    const layout = (ex.layout as ReturnType<typeof resolveLayout>) ?? resolveLayout(content, doc.width, doc.height, overrides)
    const slots: SlotDescriptor<CustomSizeSlotId>[] = [
      { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
    ]
    // Zone image is a benchable block in solid-colour mode: off-canvas it shows
    // as an Image bench chip; dragging it on switches the doc to zone mode and
    // the engine places it (row / hero-top). In full-bleed (background) mode the
    // image IS the background, so there's no separate zone-image slot.
    if (doc.imageMode !== 'background') {
      slots.push({ blockId: 'image', label: 'Image', iconKey: 'image', kind: 'image', benchable: true })
    }
    // ALL text blocks are slots — even ones the engine drops at this size/shape
    // (band-excluded). They surface on the bench as non-restorable "no room"
    // chips (see noteFor), so nothing silently vanishes.
    for (const id of TEXT_IDS) slots.push(textSlot(id))
    return slots
  },
  // BACKGROUND always; THEME only for solid-colour mode (in image-led mode the
  // image is the background, so theme has nothing to tint). Alignment is dropped
  // — the engine owns text alignment per band.
  stageBar: (bindings) => {
    const doc = (bindings.extras?.doc as CustomSizeDocument | undefined) ?? defaultCustomSizeDocument()
    const items: StageBarItemDescriptor[] = [
      { id: 'background', kind: 'enum', label: 'background', options: BACKGROUND_OPTIONS },
    ]
    if (doc.imageMode !== 'background') {
      items.push({ id: 'theme', kind: 'theme', label: 'theme' })
    }
    // Content-stack alignment (top/middle/bottom) — available in ALL modes incl.
    // full-bleed image. Engine default per band/coverage; user overrides.
    items.push({ id: 'stackAlign', kind: 'stack', label: 'content stack' })
    return items
  },
  belowStage: (ctx) => <CustomSizeRow {...(ctx.extras.csRow as CustomSizeRowProps)} />,
  // Preview zoom, sat left of PREVIEW. Just the number — and 100% at actual size
  // (the canvas never upscales past 1, so it holds at 100 until it drops below).
  actionRowLead: (ctx) => (
    <span className="font-mono text-[12px] text-content-secondary whitespace-nowrap">
      {Math.round((ctx.extras.previewScale as number) * 100)}%
    </span>
  ),
  // Toolbar + action row sit ABOVE the design (Figma 537:3679).
  controlsPlacement: 'top',
  contentStack: { templateKey: 'custom-size', maxGap: 120 },
  image: { blockId: 'image', placeholderSrc: '' },
  category: {
    blockId: 'solutionPill',
    options: (colors) =>
      Object.entries(colors.solutions)
        .filter(([key]) => key !== 'none')
        .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color })),
  },
  useStoreBindings: () => {
    const eyebrow = useStore((s) => s.eyebrow)
    const setEyebrow = useStore((s) => s.setEyebrow)
    const verbatimCopy = useStore((s) => s.verbatimCopy)
    const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
    const ctaText = useStore((s) => s.ctaText)
    const setCtaText = useStore((s) => s.setCtaText)
    const ctaStyle = useStore((s) => s.ctaStyle)

    const showEyebrow = useStore((s) => s.showEyebrow)
    const setShowEyebrow = useStore((s) => s.setShowEyebrow)
    const showSubhead = useStore((s) => s.showSubhead)
    const setShowSubhead = useStore((s) => s.setShowSubhead)
    const showBody = useStore((s) => s.showBody)
    const setShowBody = useStore((s) => s.setShowBody)
    const showCta = useStore((s) => s.showCta)
    const setShowCta = useStore((s) => s.setShowCta)
    const showSolutionSet = useStore((s) => s.showSolutionSet)
    const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)

    const solution = useStore((s) => s.solution)
    const setSolution = useStore((s) => s.setSolution)
    const theme = useStore((s) => s.theme)
    const setTheme = useStore((s) => s.setTheme)
    const grayscale = useStore((s) => s.grayscale)

    const docState = useStore((s) => s.customSizeDocument)
    const setCustomSizeDocument = useStore((s) => s.setCustomSizeDocument)
    const doc = docState ?? defaultCustomSizeDocument()

    // Per-block font-size control → a relative multiplier in the doc's fontScale.
    // `value` (multiplier) feeds the editbar's A↑/A↓; the engine applies it on
    // top of the canvas-scaled base, so the choice survives resizes proportionally.
    const sizeBinding = (id: CustomBlockId) => ({
      fontSize: doc.fontScale[id] ?? 1,
      setFontSize: (next: number) =>
        setCustomSizeDocument({
          ...doc,
          fontScale: { ...doc.fontScale, [id]: Math.round(next * 100) / 100 },
        }),
    })

    // Dimension undo: a small stack of prior {width,height}. Recorded before a
    // commit, popped on undo. `bumpHistory` re-renders so `canUndo` stays live.
    const dimHistory = useRef<{ width: number; height: number }[]>([])
    const [, bumpHistory] = useState(0)
    // Magnetic snap-to-preset-ratios while edge-dragging the canvas (default on
    // per PRD). Edge-drag itself is a later add; this flag is wired ahead of it.
    const [snapToPresets, setSnapToPresets] = useState(true)
    // Aspect-lock for W/H edits + canvas drags (default off = free transform).
    const [constrainProportions, setConstrainProportions] = useState(false)
    // Live canvas fit-scale, published by CustomSizeStage → shown in the dim row.
    const [previewScale, setPreviewScale] = useState(1)
    const commitDims = (width: number, height: number) => {
      if (width === doc.width && height === doc.height) return
      dimHistory.current.push({ width: doc.width, height: doc.height })
      setCustomSizeDocument({ ...doc, width, height })
      bumpHistory((n) => n + 1)
    }
    const undoDims = () => {
      const prev = dimHistory.current.pop()
      if (!prev) return
      setCustomSizeDocument({ ...doc, width: prev.width, height: prev.height })
      bumpHistory((n) => n + 1)
    }

    const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
    const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
    const rawImg = thumbnailImageSettings['custom-size']
    const position = rawImg?.position ?? { x: 0, y: 0 }
    const zoom = rawImg?.zoom ?? 1
    const filters = rawImg?.filters ?? NEUTRAL_FILTERS

    const reused: ReusedContent = {
      eyebrow,
      headline: verbatimCopy.headline || '',
      subhead: verbatimCopy.subhead || '',
      body: verbatimCopy.body || '',
      cta: ctaText,
      solution,
      showSolutionSet,
      showEyebrow,
      showSubhead,
      showBody,
      showCta,
      theme,
      grayscale,
      imagePosition: position,
      imageZoom: zoom,
      imageFilters: filters,
    }
    const mapped = customSizeToProps(doc, reused)
    // shownBlocks now comes from customSizeToProps (single source — editor==export).
    const overrides = mapped.overrides

    // The bench shows everything that COULD be on the design but currently isn't —
    // whether the user hid it OR the engine triaged it off at this size. So a
    // slot's on-canvas (`visible`) state mirrors the engine's resolved survivors,
    // not the raw show-flag; `setVisible` still writes the user's show-flag.
    // (Band-excluded blocks aren't slots at all, so they never reach the bench.)
    const layout = resolveLayout(mapped.content, doc.width, doc.height, overrides)
    const onCanvas = new Set<string>(layout.blocks.map((b) => b.id))

    // Spacer drags persist as RELATIVE factors (× the engine's computed gap),
    // so spacing survives resize. Bindings expose absolute px (factor × gap);
    // setGap converts the dragged absolute back to a factor.
    const gapAbs: Record<string, number> = {}
    for (const [k, factor] of Object.entries(doc.gapScale)) {
      gapAbs[k] = factor * layout.gap
    }

    // Crop frame matches the IMAGE ZONE's aspect, not the whole canvas — in zone
    // modes the image only occupies a fraction of the canvas, and that fraction's
    // aspect is what the user is actually cropping into. Background/overlay mode
    // is full-bleed, so it uses the canvas aspect. Re-resolved each render, so a
    // resize drag re-syncs the frame live (engine debt paid down).
    const imgFrame =
      layout.kind === 'row'
        ? { w: Math.round(doc.width * layout.imageFraction), h: doc.height }
        : layout.kind === 'hero-top'
          ? { w: doc.width, h: Math.round(doc.height * layout.imageFraction) }
          : { w: doc.width, h: doc.height }

    // Honest-fail restore: a block the ENGINE dropped for space/legibility (not
    // one the USER hid) shows a non-restorable "no room" hint on the bench. The
    // user frees space (enlarge canvas / hide another block) and — because the
    // show flag is still true — it reappears on its own. Reasons: 'no-space' /
    // 'too-small' = engine; 'hidden' = user choice (normal restorable chip).
    // Engine-dropped (space, legibility, OR shape/band) → non-restorable "no
    // room" chip. Only user-hidden ('hidden') blocks get a plain restorable chip.
    const noRoom = new Set<string>(
      layout.triagedOut
        .filter((t) => t.reason === 'no-space' || t.reason === 'too-small' || t.reason === 'band-excluded')
        .map((t) => t.id),
    )
    const noteFor = (id: string): string | undefined =>
      noRoom.has(id) ? 'no room at this size' : undefined

    return {
      slotState: {
        eyebrow: { value: eyebrow, visible: onCanvas.has('eyebrow'), benchNote: noteFor('eyebrow'), setValue: setEyebrow, setVisible: setShowEyebrow, ...sizeBinding('eyebrow') },
        headline: { value: reused.headline, visible: onCanvas.has('headline'), setValue: (v) => setVerbatimCopy({ headline: v }), ...sizeBinding('headline') },
        subhead: { value: reused.subhead, visible: onCanvas.has('subhead'), benchNote: noteFor('subhead'), setValue: (v) => setVerbatimCopy({ subhead: v }), setVisible: setShowSubhead, ...sizeBinding('subhead') },
        body: { value: reused.body, visible: onCanvas.has('body'), benchNote: noteFor('body'), setValue: (v) => setVerbatimCopy({ body: v }), setVisible: setShowBody, ...sizeBinding('body') },
        cta: { value: ctaText, visible: onCanvas.has('cta'), benchNote: noteFor('cta'), setValue: setCtaText, setVisible: setShowCta, ...sizeBinding('cta') },
        // Zone image: on-canvas when the engine places it; restoring from the
        // bench switches the doc to zone mode. Benched with "no room" if the
        // current shape (strip/tower) can't host a zone image.
        image: {
          visible: layout.showImage,
          setVisible: (next) => setCustomSizeDocument({ ...doc, imageMode: next ? 'zone' : 'none' }),
          benchNote: doc.imageMode === 'zone' && !layout.showImage ? 'no room at this size' : undefined,
        },
        solutionPill: { visible: showSolutionSet, setVisible: setShowSolutionSet },
        logo: {},
      },
      stageBar: {
        theme: { value: theme, set: (v) => setTheme(v as TemplateTheme) },
        background: {
          value: doc.imageMode === 'background' ? 'image' : 'color',
          // image → full-bleed image-led (overlay) mode; color → solid background.
          set: (v) => setCustomSizeDocument({ ...doc, imageMode: v === 'image' ? 'background' : 'none' }),
        },
        stackAlign: {
          value: layout.textStackAlign,
          set: (v) => setCustomSizeDocument({ ...doc, stackAlign: v as StackAlign }),
        },
      },
      image: {
        // The factory image slot = the ZONE image (full-bleed bg uses bgLayer).
        url: doc.imageMode === 'zone' ? doc.imageUrl ?? undefined : undefined,
        position,
        zoom,
        filters,
        // Picking an image for the zone slot keeps zone mode.
        setUrl: (next) => setCustomSizeDocument({ ...doc, imageUrl: next, imageMode: 'zone' }),
        setSettings: (next) => setThumbnailImageSettings('custom-size', next),
        // Crop frame tracks the live image-zone aspect (see imgFrame above).
        frameWidth: imgFrame.w,
        frameHeight: imgFrame.h,
      },
      category: { value: solution, set: setSolution },
      contentStack: {
        stackAlign: layout.textStackAlign,
        // User alignment persists to the doc (engine applies it as an override).
        setStackAlign: (next) => setCustomSizeDocument({ ...doc, stackAlign: next }),
        gaps: gapAbs,
        // Gap ceiling scales with the canvas (the static 120 was a template-era
        // default that can't stretch on large canvases). Up to the full height.
        maxGap: Math.round(doc.height),
        setGap: (key, abs) =>
          setCustomSizeDocument({
            ...doc,
            gapScale: { ...doc.gapScale, [key]: layout.gap ? abs / layout.gap : 1 },
          }),
      },
      extras: {
        content: mapped.content,
        overrides,
        doc,
        theme,
        ctaStyle,
        layout,
        // Props for the dimension control strip (rendered via `belowStage`).
        csRow: {
          width: doc.width,
          height: doc.height,
          // With aspect locked, editing one field scales the other to hold ratio.
          onCommitWidth: (n: number) =>
            commitDims(n, constrainProportions ? Math.max(1, Math.round((n * doc.height) / doc.width)) : doc.height),
          onCommitHeight: (n: number) =>
            commitDims(constrainProportions ? Math.max(1, Math.round((n * doc.width) / doc.height)) : doc.width, n),
          onApplyPreset: (rw: number, rh: number) =>
            commitDims(doc.width, Math.max(1, Math.round((doc.width * rh) / rw))),
          onUndo: undoDims,
          canUndo: dimHistory.current.length > 0,
          snapToPresets,
          onToggleSnap: setSnapToPresets,
          constrainProportions,
          onToggleConstrain: setConstrainProportions,
        } satisfies CustomSizeRowProps,
        // Image-led entry point (canvas editbar + background modal), rendered
        // only when imageMode === 'background'.
        bgLayer: {
          imageSrc: doc.imageUrl ?? '',
          frameWidth: doc.width,
          frameHeight: doc.height,
          settings: { position, zoom, filters },
          onSettingsChange: (s) => setThumbnailImageSettings('custom-size', s),
          onImageChange: (url) => {
            setCustomSizeDocument({ ...doc, imageUrl: url })
            setThumbnailImageSettings('custom-size', NEUTRAL_SLOT_SETTINGS)
          },
          overlay: doc.overlay,
          onOverlayChange: (next) => setCustomSizeDocument({ ...doc, overlay: next }),
        } satisfies CustomSizeBackgroundLayerProps,
        // Drag-to-resize the canvas edges (live re-resolve). One undo checkpoint
        // per drag (start); moves stream live without polluting the stack.
        resize: {
          snapToPresets,
          lockAspect: constrainProportions,
          onResizeStart: () => {
            dimHistory.current.push({ width: doc.width, height: doc.height })
            bumpHistory((n) => n + 1)
          },
          onResize: (w: number, h: number) => setCustomSizeDocument({ ...doc, width: w, height: h }),
          onScaleChange: setPreviewScale,
        },
        // Zone-image gestures: flip on its axis (row = L/R, hero-top = T/B) or
        // drag off-canvas to hide back to the bench.
        imageAxis:
          layout.kind === 'row' ? 'horizontal' : layout.kind === 'hero-top' ? 'vertical' : undefined,
        onFlipImage: (pos: 'left' | 'right' | 'top' | 'bottom') =>
          pos === 'left' || pos === 'right'
            ? setCustomSizeDocument({ ...doc, imageSide: pos })
            : setCustomSizeDocument({ ...doc, imageVPos: pos }),
        onHideImage: () => setCustomSizeDocument({ ...doc, imageMode: 'none' }),
        // Drag the zone image's inner edge → resize its share of the canvas
        // (row = width fraction, hero-top = height fraction). Engine clamps.
        onResizeImageFraction: (next: number) => setCustomSizeDocument({ ...doc, imageFraction: next }),
        // Live preview zoom (canvas fit-scale) for the action-row readout.
        previewScale,
      },
    }
  },
  // custom-size owns its stage: a centre-anchored, freeze-during-drag canvas
  // (ports the /resize lab feel) instead of the shared top-anchored ScaledStage.
  customStage: ({ ctx, setStageNodeRef, openImageEditor }) => {
    const content = ctx.extras.content as CustomContent
    const overrides = ctx.extras.overrides as LayoutOverrides
    const doc = ctx.extras.doc as CustomSizeDocument
    const theme = ctx.extras.theme as TemplateTheme
    const ctaStyle = ctx.extras.ctaStyle as 'link' | 'button'
    const resize = ctx.extras.resize as {
      snapToPresets: boolean
      lockAspect: boolean
      onResizeStart: () => void
      onResize: (w: number, h: number) => void
      onScaleChange: (s: number) => void
    }
    return (
      <CustomSizeStage
        width={doc.width}
        height={doc.height}
        snapToPresets={resize.snapToPresets}
        lockAspect={resize.lockAspect}
        onResizeStart={resize.onResizeStart}
        onResize={resize.onResize}
        onScaleChange={resize.onScaleChange}
        setStageNodeRef={setStageNodeRef}
        imageAxis={ctx.extras.imageAxis as 'horizontal' | 'vertical' | undefined}
        onFlipImage={ctx.extras.onFlipImage as ((pos: 'left' | 'right' | 'top' | 'bottom') => void) | undefined}
        onHideImage={ctx.extras.onHideImage as (() => void) | undefined}
        onImageClick={openImageEditor}
        renderCanvas={(scale) => (
          <>
            <CustomSizeCanvas
              content={content}
              width={doc.width}
              height={doc.height}
              theme={theme}
              ctaStyle={ctaStyle}
              overrides={overrides}
              colors={ctx.colors}
              typography={ctx.typography}
              scale={scale}
              renderBlock={ctx.renderBlock}
              renderInlineEditor={ctx.renderInlineEditor}
              renderSpacerBetween={ctx.renderSpacerBetween}
              renderOverlay={ctx.renderOverlay}
              gaps={ctx.gaps}
              onResizeImageFraction={ctx.extras.onResizeImageFraction as (n: number) => void}
            />
            {doc.imageMode === 'background' && (
              <CustomSizeBackgroundLayer {...(ctx.extras.bgLayer as CustomSizeBackgroundLayerProps)} />
            )}
          </>
        )}
      />
    )
  },
})
