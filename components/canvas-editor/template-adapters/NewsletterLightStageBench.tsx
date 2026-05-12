'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import { useFlipReflow } from '@/lib/motion'
import { useActiveDrag } from '@/lib/dnd'
import { NEUTRAL_FILTERS, type ImageSlotSettings } from '@/lib/image-filters'

import { StageBenchShell } from '../StageBenchShell'
import { CanvasEditorProvider } from '../CanvasEditorProvider'
import { Editable } from '../Editable'
import { ContextualToolbar } from '../ContextualToolbar'
import { SelectionRing } from '../SelectionRing'
import { InlineTextEdit } from '../InlineTextEdit'
import { SpacingHandle } from '../handles/SpacingHandle'
import { BenchChip, type BenchChipKind } from '../bench/BenchChip'
import { SelectorRow } from '../stage-bar/SelectorRow'
import { SelectorPrimitive } from '../stage-bar/SelectorPrimitive'
import { VisibilityRegistryProvider } from '../VisibilityRegistry'
import { SizeRegistryProvider } from '../SizeRegistry'
import { ContentRegistryProvider } from '../ContentRegistry'
import { ImageRegistryProvider, useImageSelectionEffect, type SlotImage } from '../ImageRegistry'
import { ImageEditorModal } from '../../image-editor'
import {
  StageBenchHeader,
  StageBenchActionRow,
  StageBenchBench,
  useStageBenchDroppables,
  STAGE_DROPPABLE_ID,
  type SlotDragData,
} from '../stage-bench'
import {
  getNewsletterLightSlots,
  getNewsletterLightSizes,
  getNewsletterLightContents,
} from '../template-configs/newsletter-light'
import {
  NewsletterLight,
  type NewsletterLightBlockId,
} from '../../templates/NewsletterLight'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for newsletter-light.
 *
 * Structural twin of NewsletterDarkGradientStageBench — same layout selector,
 * same content stack, same CTA-as-sibling shape. Differs only in the first
 * stage-bar row: a theme selector (light/dark) replaces the color-style
 * swatches, since this template is themed via the shared `theme` field.
 */

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  cta: 'button',
}

export function NewsletterLightStageBench(props: StageBenchEditorProps) {
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

  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const subheadFontSize = useStore((s) => s.subheadFontSize)
  const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

  const newsletterImageSize = useStore((s) => s.newsletterImageSize)
  const setNewsletterImageSize = useStore((s) => s.setNewsletterImageSize)
  const newsletterImageUrl = useStore((s) => s.newsletterImageUrl)
  const setNewsletterImageUrl = useStore((s) => s.setNewsletterImageUrl)
  const newsletterImagePosition = useStore((s) => s.newsletterImagePosition)
  const setNewsletterImagePosition = useStore((s) => s.setNewsletterImagePosition)
  const newsletterImageZoom = useStore((s) => s.newsletterImageZoom)
  const setNewsletterImageZoom = useStore((s) => s.setNewsletterImageZoom)
  const newsletterImageFilters = useStore((s) => s.newsletterImageFilters) ?? NEUTRAL_FILTERS
  const setNewsletterImageFilters = useStore((s) => s.setNewsletterImageFilters)
  const grayscale = useStore((s) => s.grayscale)

  const [showImageEditor, setShowImageEditor] = useState(false)
  const currentSlotSettings: ImageSlotSettings = {
    position: newsletterImagePosition,
    zoom: newsletterImageZoom,
    filters: newsletterImageFilters,
  }

  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const newsletterLightGaps = useStore((s) => s.templateGaps['newsletter-light'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getNewsletterLightSlots({
    showEyebrow, showHeadline, showSubhead, showCta,
    setShowEyebrow, setShowHeadline, setShowSubhead, setShowCta,
  })

  const activeDrag = useActiveDrag<SlotDragData>()
  const previewKey =
    activeDrag &&
    activeDrag.data.region === 'bench' &&
    activeDrag.overTargetId === STAGE_DROPPABLE_ID
      ? activeDrag.data.path.split('.').slice(1).join('.')
      : null

  // ---- Effective content — raw value, empty when unset. The template
  // file owns the canonical placeholder fallback so editor / thumbnail / export all render the same string. ----
  const eyebrowEff  = eyebrow ?? ''
  const headlineEff = verbatimCopy.headline ?? ''
  const subheadEff  = verbatimCopy.subhead ?? ''
  const ctaEff      = ctaText ?? ''

  const showEyebrowEff  = showEyebrow  || previewKey === 'eyebrow'
  const showHeadlineEff = showHeadline || previewKey === 'headline'
  const showSubheadEff  = showSubhead  || previewKey === 'subhead'
  const showCtaEff      = showCta      || previewKey === 'cta'

  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  const layoutValue: 'image' | 'even' | 'text' =
    newsletterImageSize === 'none' ? 'text' :
    newsletterImageSize === 'small' ? 'even' : 'image'
  const onLayoutChange = (next: 'image' | 'even' | 'text') => {
    setNewsletterImageSize(
      next === 'text' ? 'none' : next === 'even' ? 'small' : 'large',
    )
  }

  const stageBar = (
    <>
      <SelectorRow label="theme">
        <SelectorPrimitive kind="theme" value={theme} onChange={setTheme} />
      </SelectorRow>
      <SelectorRow label="layout">
        <SelectorPrimitive kind="layout" value={layoutValue} onChange={onLayoutChange} />
      </SelectorRow>
      <SelectorRow label="content stack">
        <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
      </SelectorRow>
    </>
  )

  const slotConfig: Record<NewsletterLightBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' }> = {
    eyebrow:  { storeKey: 'eyebrow', kind: 'text' },
    headline: { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead:  { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    cta:      { storeKey: 'ctaText', kind: 'cta' },
    image:    { storeKey: 'newsletterImageUrl', kind: 'image' },
  }

  const slotImages: SlotImage[] = [
    {
      path: 'newsletter-light.image',
      onSelect: () => setShowImageEditor(true),
    },
  ]

  const imageFrameWidth = newsletterImageSize === 'large' ? 317 : 234
  const imageFrameHeight = newsletterImageSize === 'large' ? 179 : 132
  const editorImageSrc = newsletterImageUrl ?? '/placeholder-mountain.jpg'

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getNewsletterLightSizes({
            headlineFontSize, subheadFontSize,
            setHeadlineFontSize, setSubheadFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getNewsletterLightContents({
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
            <ImageRegistryProvider images={slotImages}>
            <ImageSelectionEffect />
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
                <NewsletterLight
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  subhead={subheadEff}
                  ctaText={ctaEff}
                  imageSize={newsletterImageSize}
                  imageUrl={newsletterImageUrl}
                  imagePosition={newsletterImagePosition}
                  imageZoom={newsletterImageZoom}
                  imageFilters={newsletterImageFilters}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadlineEff}
                  showSubhead={showSubheadEff}
                  showCta={showCtaEff}
                  grayscale={grayscale}
                  headlineFontSize={headlineFontSize ?? undefined}
                  subheadFontSize={subheadFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={newsletterLightGaps}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="newsletter-light"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('newsletter-light', key, next)}
                        scale={1}
                        direction={stackAlign === 'bottom' ? 'up' : 'down'}
                        min={0}
                        max={48}
                        showUnit
                      />
                    </Editable>
                  )}
                  theme={theme}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `newsletter-light.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId !== 'image' && slot
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
                        templateId="newsletter-light"
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
                    const path = `newsletter-light.${blockId}`
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
            <ImageEditorModal
              isOpen={showImageEditor}
              onClose={() => setShowImageEditor(false)}
              imageSrc={editorImageSrc}
              frameWidth={imageFrameWidth}
              frameHeight={imageFrameHeight}
              initialSettings={currentSlotSettings}
              onSettingsChange={(next) => {
                setNewsletterImagePosition(next.position)
                setNewsletterImageZoom(next.zoom)
                setNewsletterImageFilters(next.filters)
              }}
              onImageChange={(url) => {
                setNewsletterImageUrl(url)
                setNewsletterImagePosition({ x: 0, y: 0 })
                setNewsletterImageZoom(1)
                setNewsletterImageFilters(NEUTRAL_FILTERS)
              }}
            />
            </ImageRegistryProvider>
          </ContentRegistryProvider>
        </SizeRegistryProvider>
      </VisibilityRegistryProvider>
    </CanvasEditorProvider>
  )
}

function ImageSelectionEffect() {
  useImageSelectionEffect()
  return null
}
