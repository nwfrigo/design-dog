'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { ImageLayout } from '@/types'
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
import {
  getEmailImageSlots,
  getEmailImageSizes,
  getEmailImageContents,
} from '../template-configs/email-image'
import {
  EmailImage,
  type EmailImageBlockId,
} from '../../templates/EmailImage'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-image.
 *
 * Sibling of social-image (universal image model + 3-state layout
 * selector + theme + category pill). Smaller canvas (640×300) and
 * different slot inventory: headline · body · cta (no metadata,
 * no subhead). Body has no per-slot font size in this template.
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  headline: 'Headline',
  body: 'This is your body copy.',
  cta: 'Responsive',
}

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  headline: 'headline',
  body: 'body',
  cta: 'button',
  category: 'category',
}

export function EmailImageStageBench(props: StageBenchEditorProps) {
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

  const verbatimCopy = useStore((s) => s.verbatimCopy)
  const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
  const ctaText = useStore((s) => s.ctaText)
  const setCtaText = useStore((s) => s.setCtaText)

  const showHeadline = useStore((s) => s.showHeadline)
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
  const layout = useStore((s) => s.layout)
  const setLayout = useStore((s) => s.setLayout)
  const grayscale = useStore((s) => s.grayscale)

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const emailImageGaps = useStore((s) => s.templateGaps['email-image'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
  const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
  const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
  const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
  const rawImageSettings = thumbnailImageSettings['email-image']
  const currentSlotSettings: ImageSlotSettings = {
    position: rawImageSettings?.position ?? { x: 0, y: 0 },
    zoom: rawImageSettings?.zoom ?? 1,
    filters: rawImageSettings?.filters ?? NEUTRAL_FILTERS,
  }

  const [showImageEditor, setShowImageEditor] = useState(false)
  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getEmailImageSlots({
    showBody, showCta, showSolutionSet,
    setShowBody, setShowCta, setShowSolutionSet,
  })

  const activeDrag = useActiveDrag<SlotDragData>()
  const previewKey =
    activeDrag &&
    activeDrag.data.region === 'bench' &&
    activeDrag.overTargetId === STAGE_DROPPABLE_ID
      ? activeDrag.data.path.split('.').slice(1).join('.')
      : null
  const showStageScrim = previewKey !== null

  const withPlaceholder = (key: string, real: string | undefined): string =>
    real || PREVIEW_PLACEHOLDERS[key] || ''

  const headlineEff = withPlaceholder('headline', verbatimCopy.headline)
  const bodyEff     = withPlaceholder('body',     verbatimCopy.body)
  const ctaEff      = withPlaceholder('cta',      ctaText)

  const showBodyEff      = showBody         || previewKey === 'body'
  const showCtaEff       = showCta          || previewKey === 'cta'
  const showSolutionEff  = showSolutionSet  || previewKey === 'solutionPill'

  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  const layoutValue: 'image' | 'even' | 'text' =
    layout === 'more-text' ? 'text' :
    layout === 'more-image' ? 'image' : 'even'
  const onLayoutChange = (next: 'image' | 'even' | 'text') => {
    setLayout((next === 'text' ? 'more-text' : next === 'image' ? 'more-image' : 'even') as ImageLayout)
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

  const slotConfig: Record<EmailImageBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' | 'pill' }> = {
    logo:         { storeKey: 'logo', kind: 'image' },
    solutionPill: { storeKey: 'showSolutionSet', kind: 'pill' },
    headline:     { storeKey: 'verbatimCopy.headline', kind: 'text' },
    body:         { storeKey: 'verbatimCopy.body', kind: 'text' },
    cta:          { storeKey: 'ctaText', kind: 'cta' },
    image:        { storeKey: 'thumbnailImageUrl', kind: 'image' },
  }

  const solutionOptions: CategoryOption[] = Object.entries(colorsConfig.solutions)
    .filter(([key]) => key !== 'none')
    .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color }))

  const slotImages: SlotImage[] = [
    {
      path: 'email-image.image',
      onSelect: () => setShowImageEditor(true),
    },
  ]

  const imageFrameWidth =
    layout === 'more-image' ? 320 :
    layout === 'more-text' ? 180 : 250
  const editorImageSrc = thumbnailImageUrl ?? '/assets/images/default_placeholder_image_1.png'

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getEmailImageSizes({ headlineFontSize, setHeadlineFontSize })}
        >
          <ContentRegistryProvider
            contents={getEmailImageContents({
              headlineHtml: verbatimCopy.headline || '',
              bodyHtml: verbatimCopy.body || '',
              ctaText,
              setHeadlineHtml: (v) => setVerbatimCopy({ headline: v }),
              setBodyHtml: (v) => setVerbatimCopy({ body: v }),
              setCtaText,
            })}
          >
            <CategoryRegistryProvider
              categories={[
                {
                  path: 'email-image.solutionPill',
                  options: solutionOptions,
                  value: solution,
                  set: setSolution,
                },
              ]}
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
                <EmailImage
                  headline={headlineEff}
                  body={bodyEff}
                  ctaText={ctaEff}
                  imageUrl={thumbnailImageUrl ?? '/assets/images/default_placeholder_image_1.png'}
                  imagePosition={currentSlotSettings.position}
                  imageZoom={currentSlotSettings.zoom}
                  imageFilters={currentSlotSettings.filters}
                  layout={layout}
                  solution={showSolutionEff ? solution : 'none'}
                  showHeadline={showHeadline}
                  showBody={showBodyEff}
                  showCta={showCtaEff}
                  showSolutionSet={showSolutionEff}
                  grayscale={grayscale}
                  theme={theme}
                  headlineFontSize={headlineFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={emailImageGaps}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="email-image"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('email-image', key, next)}
                        scale={1}
                        direction={stackAlign === 'bottom' ? 'up' : 'down'}
                        min={0}
                        max={64}
                        showUnit
                      />
                    </Editable>
                  )}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `email-image.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId !== 'image' && blockId !== 'logo' && slot
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
                        templateId="email-image"
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
                    const path = `email-image.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId !== 'headline' && blockId !== 'body' && blockId !== 'cta') {
                      return defaultInner
                    }
                    const isPlainText = blockId === 'cta'
                    const value =
                      blockId === 'headline' ? (verbatimCopy.headline || '') :
                      blockId === 'body'     ? (verbatimCopy.body || '') :
                      blockId === 'cta'      ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'headline': setVerbatimCopy({ headline: next }); break
                        case 'body':     setVerbatimCopy({ body: next }); break
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
                  renderOverlay={() => <StageScrim visible={showStageScrim} />}
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
              frameHeight={300}
              initialSettings={currentSlotSettings}
              onSettingsChange={(next) => {
                setThumbnailImageSettings('email-image', {
                  position: next.position,
                  zoom: next.zoom,
                  filters: next.filters,
                })
              }}
              onImageChange={(url) => {
                setThumbnailImageUrl(url)
                setThumbnailImageSettings('email-image', {
                  position: { x: 0, y: 0 },
                  zoom: 1,
                  filters: NEUTRAL_FILTERS,
                })
              }}
            />
            </ImageRegistryProvider>
            </CategoryRegistryProvider>
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
