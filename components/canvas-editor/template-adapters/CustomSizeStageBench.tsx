'use client'

import { useStore } from '@/store'
import type { TemplateTheme } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter, type SlotDescriptor } from '../factory/defineStageBenchAdapter'
import { CustomSizeCanvas } from '@/components/custom-size/CustomSizeCanvas'
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
 * FIRST CUT — the editor mounts + renders + selects. Iteration items (size-entry
 * UI, spacer-drag persistence, dynamic crop-frame aspect, the homepage entry)
 * are deferred for the Figma editor direction (PRD §13).
 */

const TEXT_IDS: CustomBlockId[] = ['eyebrow', 'headline', 'subhead', 'body', 'cta']
const HTML_FORMAT = new Set<CustomBlockId>(['headline', 'subhead', 'body'])

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
  if (id === 'headline') slot.size = { default: 48, min: 20, max: 200, step: 2 }
  if (id === 'subhead') slot.size = { default: 24, min: 12, max: 80, step: 1 }
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
    const layout = resolveLayout(content, doc.width, doc.height, overrides)
    const bandExcluded = new Set(
      layout.triagedOut.filter((t) => t.reason === 'band-excluded').map((t) => t.id),
    )
    const slots: SlotDescriptor<CustomSizeSlotId>[] = [
      { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
    ]
    if (layout.showImage || doc.imageMode !== 'none') {
      slots.push({ blockId: 'image', label: 'Image', iconKey: 'image', kind: 'image', benchable: false })
    }
    for (const id of TEXT_IDS) {
      if (!bandExcluded.has(id)) slots.push(textSlot(id))
    }
    return slots
  },
  stageBar: [{ id: 'theme', kind: 'theme', label: 'theme' }],
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

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
    const subheadFontSize = useStore((s) => s.subheadFontSize)
    const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

    const docState = useStore((s) => s.customSizeDocument)
    const setCustomSizeDocument = useStore((s) => s.setCustomSizeDocument)
    const doc = docState ?? defaultCustomSizeDocument()

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
      theme,
      grayscale,
      imagePosition: position,
      imageZoom: zoom,
    }
    const mapped = customSizeToProps(doc, reused)
    const overrides: LayoutOverrides = {
      ...mapped.overrides,
      shownBlocks: { eyebrow: showEyebrow, headline: true, subhead: showSubhead, body: showBody, cta: showCta },
    }

    return {
      slotState: {
        eyebrow: { value: eyebrow, visible: showEyebrow, setValue: setEyebrow, setVisible: setShowEyebrow },
        headline: { value: reused.headline, visible: true, fontSize: headlineFontSize ?? undefined, setValue: (v) => setVerbatimCopy({ headline: v }), setFontSize: setHeadlineFontSize },
        subhead: { value: reused.subhead, visible: showSubhead, fontSize: subheadFontSize ?? undefined, setValue: (v) => setVerbatimCopy({ subhead: v }), setVisible: setShowSubhead, setFontSize: setSubheadFontSize },
        body: { value: reused.body, visible: showBody, setValue: (v) => setVerbatimCopy({ body: v }), setVisible: setShowBody },
        cta: { value: ctaText, visible: showCta, setValue: setCtaText, setVisible: setShowCta },
        image: {},
        solutionPill: { visible: showSolutionSet, setVisible: setShowSolutionSet },
        logo: {},
      },
      stageBar: {
        theme: { value: theme, set: (v) => setTheme(v as TemplateTheme) },
      },
      image: {
        url: doc.imageMode !== 'none' ? doc.imageUrl ?? undefined : undefined,
        position,
        zoom,
        filters,
        // Uploading/choosing an image defaults to background mode (first cut).
        setUrl: (next) => setCustomSizeDocument({ ...doc, imageUrl: next, imageMode: doc.imageMode === 'none' ? 'background' : doc.imageMode }),
        setSettings: (next) => setThumbnailImageSettings('custom-size', next),
        // Approximate crop frame to the canvas aspect; true zone-aspect sync is debt.
        frameWidth: doc.width,
        frameHeight: doc.height,
      },
      category: { value: solution, set: setSolution },
      extras: { content: mapped.content, overrides, doc, theme },
    }
  },
  renderTemplate: (ctx) => {
    const content = ctx.extras.content as CustomContent
    const overrides = ctx.extras.overrides as LayoutOverrides
    const doc = ctx.extras.doc as CustomSizeDocument
    const theme = ctx.extras.theme as TemplateTheme
    return (
      <CustomSizeCanvas
        content={content}
        width={doc.width}
        height={doc.height}
        theme={theme}
        overrides={overrides}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderSpacerBetween={ctx.renderSpacerBetween}
        renderOverlay={ctx.renderOverlay}
      />
    )
  },
})
