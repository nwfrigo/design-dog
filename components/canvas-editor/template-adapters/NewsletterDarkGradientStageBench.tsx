'use client'

import { useRef } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { ColorStyle } from '@/types'
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
import { SelectorPrimitive, type ColorOption } from '../stage-bar/SelectorPrimitive'
import { VisibilityRegistryProvider } from '../VisibilityRegistry'
import { SizeRegistryProvider } from '../SizeRegistry'
import { ContentRegistryProvider } from '../ContentRegistry'
import {
  StageBenchHeader,
  StageBenchActionRow,
  StageBenchBench,
  useStageBenchDroppables,
  STAGE_DROPPABLE_ID,
  type SlotDragData,
} from '../stage-bench'
import {
  getNewsletterDarkGradientSlots,
  getNewsletterDarkGradientSizes,
  getNewsletterDarkGradientContents,
} from '../template-configs/newsletter-dark-gradient'
import {
  NewsletterDarkGradient,
  type NewsletterDarkGradientBlockId,
} from '../../templates/NewsletterDarkGradient'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for newsletter-dark-gradient.
 *
 * Smallest canvas yet (640×179) and the first template with an
 * internal horizontal layout (text column + image column). ContentStack
 * handles the text-block stack (eyebrow / headline / subhead) inside
 * the text column; CTA renders as a sibling at the bottom (anchored
 * by the outer space-between, preserving the legacy layout shape).
 *
 * Stage bar: color (color-4) + content stack (top/center/bottom). The
 * stack control distributes the text block within the text column;
 * CTA stays at the bottom regardless.
 *
 * Known deferred work (to be addressed in a follow-up):
 * - imageSize selector (none/small/large). Legacy sidebar handles
 *   this; substrate lacks a 3-state preset selector primitive yet.
 * - Image editing for newsletterImageUrl. The image editor lightbox
 *   is currently wired to thumbnailImageUrl; newsletter has its own
 *   image store fields. Threading newsletter through the modal is
 *   its own piece of work.
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  eyebrow: 'Eyebrow',
  headline: 'Headline',
  subhead: 'Subheadline',
  cta: 'Call to action',
}

const COLOR_STYLE_OPTIONS: ColorOption[] = [
  { value: '1', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-dark-gradient-1.png)' }, ariaLabel: 'Color 1' },
  { value: '2', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-dark-gradient-2.png)' }, ariaLabel: 'Color 2' },
  { value: '3', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-dark-gradient-3.png)' }, ariaLabel: 'Color 3' },
  { value: '4', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-dark-gradient-4.png)' }, ariaLabel: 'Color 4' },
]

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  cta: 'button',
}

export function NewsletterDarkGradientStageBench(props: StageBenchEditorProps) {
  const {
    selectedAssets,
    currentAssetIndex,
    isExporting,
    isEditingFromQueue,
    colorsConfig,
    typographyConfig,
    onExport,
    onAddToQueue,
    onSaveToQueue,
    onPreview,
    onAddAsset,
    onGoToAsset,
    onDeleteAsset,
    getAssetLabel,
  } = props

  // ---- store subscriptions ----
  const eyebrow = useStore((s) => s.eyebrow)
  const setEyebrow = useStore((s) => s.setEyebrow)
  const verbatimCopy = useStore((s) => s.verbatimCopy)
  const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
  const ctaText = useStore((s) => s.ctaText)
  const setCtaText = useStore((s) => s.setCtaText)

  const showEyebrow = useStore((s) => s.showEyebrow)
  const setShowEyebrow = useStore((s) => s.setShowEyebrow)
  const showHeadline = useStore((s) => s.showHeadline)
  const setShowHeadline = useStore((s) => s.setShowHeadline)
  const showSubhead = useStore((s) => s.showSubhead)
  const setShowSubhead = useStore((s) => s.setShowSubhead)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)

  const colorStyle = useStore((s) => s.colorStyle)
  const setColorStyle = useStore((s) => s.setColorStyle)
  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const subheadFontSize = useStore((s) => s.subheadFontSize)
  const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

  // Newsletter-specific image fields — used for rendering only.
  // Editing image still goes through legacy sidebar (deferred).
  const newsletterImageSize = useStore((s) => s.newsletterImageSize)
  const newsletterImageUrl = useStore((s) => s.newsletterImageUrl)
  const newsletterImagePosition = useStore((s) => s.newsletterImagePosition)
  const newsletterImageZoom = useStore((s) => s.newsletterImageZoom)
  const grayscale = useStore((s) => s.grayscale)

  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const newsletterDarkGradientGaps = useStore((s) => s.templateGaps['newsletter-dark-gradient'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  // ---- slot config ----
  const slots = getNewsletterDarkGradientSlots({
    showEyebrow, showHeadline, showSubhead, showCta,
    setShowEyebrow, setShowHeadline, setShowSubhead, setShowCta,
  })

  // ---- preview state from active drag ----
  const activeDrag = useActiveDrag<SlotDragData>()
  const previewKey =
    activeDrag &&
    activeDrag.data.region === 'bench' &&
    activeDrag.overTargetId === STAGE_DROPPABLE_ID
      ? activeDrag.data.path.split('.').slice(1).join('.')
      : null

  // ---- effective content (real value, with placeholder fallback) ----
  const withPlaceholder = (key: string, real: string | undefined): string =>
    real || PREVIEW_PLACEHOLDERS[key] || ''

  const eyebrowEff  = withPlaceholder('eyebrow',  eyebrow)
  const headlineEff = withPlaceholder('headline', verbatimCopy.headline)
  const subheadEff  = withPlaceholder('subhead',  verbatimCopy.subhead)
  const ctaEff      = withPlaceholder('cta',      ctaText)

  const showEyebrowEff  = showEyebrow  || previewKey === 'eyebrow'
  const showHeadlineEff = showHeadline || previewKey === 'headline'
  const showSubheadEff  = showSubhead  || previewKey === 'subhead'
  const showCtaEff      = showCta      || previewKey === 'cta'

  // ---- FLIP + drop targets ----
  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  // ---- stage bar ----
  const stageBar = (
    <>
      <SelectorRow label="color">
        <SelectorPrimitive
          kind="color-4"
          value={colorStyle}
          onChange={(v) => setColorStyle(v as ColorStyle)}
          options={COLOR_STYLE_OPTIONS}
        />
      </SelectorRow>
      <SelectorRow label="content stack">
        <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
      </SelectorRow>
    </>
  )

  // ---- per-block Editable wrapping ----
  const slotConfig: Record<NewsletterDarkGradientBlockId, { storeKey: string; kind: 'text' | 'cta' }> = {
    eyebrow:  { storeKey: 'eyebrow', kind: 'text' },
    headline: { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead:  { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    cta:      { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getNewsletterDarkGradientSizes({
            headlineFontSize, subheadFontSize,
            setHeadlineFontSize, setSubheadFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getNewsletterDarkGradientContents({
              eyebrow,
              headlineHtml: verbatimCopy.headline || '',
              subheadHtml: verbatimCopy.subhead || '',
              ctaText,
              setEyebrow,
              setHeadlineHtml: (v) => setVerbatimCopy({ headline: v }),
              setSubheadHtml: (v) => setVerbatimCopy({ subhead: v }),
              setCtaText,
            })}
          >
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
                <NewsletterDarkGradient
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  subhead={subheadEff}
                  ctaText={ctaEff}
                  colorStyle={colorStyle}
                  imageSize={newsletterImageSize}
                  imageUrl={newsletterImageUrl}
                  imagePosition={newsletterImagePosition}
                  imageZoom={newsletterImageZoom}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadlineEff}
                  showSubhead={showSubheadEff}
                  showCta={showCtaEff}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
                  subheadFontSize={subheadFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={newsletterDarkGradientGaps}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="newsletter-dark-gradient"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('newsletter-dark-gradient', key, next)}
                        scale={1}
                        direction={stackAlign === 'bottom' ? 'up' : 'down'}
                        min={0}
                        max={48}
                        showUnit
                      />
                    </Editable>
                  )}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `newsletter-dark-gradient.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = slot
                      ? {
                          data: { region: 'stage' as const, path: slotPath },
                          preview: (
                            <BenchChip
                              kind={ICON_KIND_TO_CHIP_KIND[slot.iconKey ?? ''] ?? 'headline'}
                              label={slot.label}
                              isFloating
                              draggable={false}
                            />
                          ),
                        }
                      : undefined
                    return (
                      <Editable
                        templateId="newsletter-dark-gradient"
                        slotKey={blockId}
                        storeKey={cfg.storeKey}
                        kind={cfg.kind}
                        drag={dragConfig}
                        previewActive={previewKey === blockId}
                      >
                        {content}
                      </Editable>
                    )
                  }}
                  renderInlineEditor={(blockId, defaultInner) => {
                    const path = `newsletter-dark-gradient.${blockId}`
                    if (editingPath !== path) return defaultInner
                    const isPlainText = blockId === 'eyebrow' || blockId === 'cta'
                    const value =
                      blockId === 'eyebrow'  ? eyebrow :
                      blockId === 'headline' ? (verbatimCopy.headline || '') :
                      blockId === 'subhead'  ? (verbatimCopy.subhead || '') :
                      blockId === 'cta'      ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow':  setEyebrow(next); break
                        case 'headline': setVerbatimCopy({ headline: next }); break
                        case 'subhead':  setVerbatimCopy({ subhead: next }); break
                        case 'cta':      setCtaText(next); break
                      }
                    }
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={handleChange}
                        format={isPlainText ? 'plain' : 'html'}
                        singleLine={isPlainText}
                      />
                    )
                  }}
                />
              </div>
            </StageBenchShell>
            <ContextualToolbar />
            <SelectionRing />
          </ContentRegistryProvider>
        </SizeRegistryProvider>
      </VisibilityRegistryProvider>
    </CanvasEditorProvider>
  )
}

