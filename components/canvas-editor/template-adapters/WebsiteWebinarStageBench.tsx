'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { WebinarVariant } from '@/types'
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
  getWebsiteWebinarSlots,
  getWebsiteWebinarSizes,
  getWebsiteWebinarContents,
} from '../template-configs/website-webinar'
import {
  WebsiteWebinar,
  type WebsiteWebinarBlockId,
} from '../../templates/WebsiteWebinar'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for website-webinar.
 *
 * Press-release-shaped but with 3-state variant: none / image / speakers.
 * The speakers variant renders the side panel as a single wrapped block
 * — per-speaker inline editing is deferred (mirrors EmailSpeakers'
 * initial-shipped state).
 *
 * Variant selector uses `SelectorPrimitive kind="enum"` (text-label cells).
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  eyebrow: 'WEBINAR',
  headline: 'Lightweight header.',
  subhead: 'Subheadline',
  body: 'Body copy goes here.',
  cta: 'Register now',
}

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  body: 'body',
  cta: 'button',
  category: 'category',
}

export function WebsiteWebinarStageBench(props: StageBenchEditorProps) {
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
  const webinarVariant = useStore((s) => s.webinarVariant)
  const setWebinarVariant = useStore((s) => s.setWebinarVariant)
  const grayscale = useStore((s) => s.grayscale)

  const speaker1Name = useStore((s) => s.speaker1Name)
  const speaker1Role = useStore((s) => s.speaker1Role)
  const speaker1ImageUrl = useStore((s) => s.speaker1ImageUrl)
  const speaker1ImagePosition = useStore((s) => s.speaker1ImagePosition)
  const speaker1ImageZoom = useStore((s) => s.speaker1ImageZoom)
  const speaker2Name = useStore((s) => s.speaker2Name)
  const speaker2Role = useStore((s) => s.speaker2Role)
  const speaker2ImageUrl = useStore((s) => s.speaker2ImageUrl)
  const speaker2ImagePosition = useStore((s) => s.speaker2ImagePosition)
  const speaker2ImageZoom = useStore((s) => s.speaker2ImageZoom)
  const speaker3Name = useStore((s) => s.speaker3Name)
  const speaker3Role = useStore((s) => s.speaker3Role)
  const speaker3ImageUrl = useStore((s) => s.speaker3ImageUrl)
  const speaker3ImagePosition = useStore((s) => s.speaker3ImagePosition)
  const speaker3ImageZoom = useStore((s) => s.speaker3ImageZoom)
  const showSpeaker1 = useStore((s) => s.showSpeaker1)
  const showSpeaker2 = useStore((s) => s.showSpeaker2)
  const showSpeaker3 = useStore((s) => s.showSpeaker3)

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const subheadFontSize = useStore((s) => s.subheadFontSize)
  const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const websiteWebinarGaps = useStore((s) => s.templateGaps['website-webinar'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
  const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
  const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
  const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
  const rawImageSettings = thumbnailImageSettings['website-webinar']
  const currentSlotSettings: ImageSlotSettings = {
    position: rawImageSettings?.position ?? { x: 0, y: 0 },
    zoom: rawImageSettings?.zoom ?? 1,
    filters: rawImageSettings?.filters ?? NEUTRAL_FILTERS,
  }

  const [showImageEditor, setShowImageEditor] = useState(false)
  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getWebsiteWebinarSlots({
    showEyebrow, showSubhead, showBody, showCta, showSolutionSet,
    setShowEyebrow, setShowSubhead, setShowBody, setShowCta, setShowSolutionSet,
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

  const eyebrowEff  = withPlaceholder('eyebrow',  eyebrow)
  const headlineEff = withPlaceholder('headline', verbatimCopy.headline)
  const subheadEff  = withPlaceholder('subhead',  verbatimCopy.subhead)
  const bodyEff     = withPlaceholder('body',     verbatimCopy.body)
  const ctaEff      = withPlaceholder('cta',      ctaText)

  const showEyebrowEff   = showEyebrow      || previewKey === 'eyebrow'
  const showSubheadEff   = showSubhead      || previewKey === 'subhead'
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

  const stageBar = (
    <>
      <SelectorRow label="theme">
        <SelectorPrimitive kind="theme" value={theme} onChange={setTheme} />
      </SelectorRow>
      <SelectorRow label="variant">
        <SelectorPrimitive
          kind="enum"
          value={webinarVariant}
          onChange={(v) => setWebinarVariant(v as WebinarVariant)}
          options={[
            { value: 'none', ariaLabel: 'Text-only variant', label: 'Text' },
            { value: 'image', ariaLabel: 'Image variant', label: 'Image' },
            { value: 'speakers', ariaLabel: 'Speakers variant', label: 'Speakers' },
          ]}
        />
      </SelectorRow>
      <SelectorRow label="content stack">
        <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
      </SelectorRow>
    </>
  )

  const slotConfig: Record<WebsiteWebinarBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' | 'pill' | 'group' }> = {
    logo:         { storeKey: 'logo', kind: 'image' },
    solutionPill: { storeKey: 'showSolutionSet', kind: 'pill' },
    eyebrow:      { storeKey: 'eyebrow', kind: 'text' },
    headline:     { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead:      { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    body:         { storeKey: 'verbatimCopy.body', kind: 'text' },
    cta:          { storeKey: 'ctaText', kind: 'cta' },
    image:        { storeKey: 'thumbnailImageUrl', kind: 'image' },
    speakers:     { storeKey: 'speakers', kind: 'group' },
  }

  const solutionOptions: CategoryOption[] = Object.entries(colorsConfig.solutions)
    .filter(([key]) => key !== 'none')
    .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color }))

  const slotImages: SlotImage[] = [
    {
      path: 'website-webinar.image',
      onSelect: () => setShowImageEditor(true),
    },
  ]
  const editorImageSrc = thumbnailImageUrl ?? '/placeholder-mountain.jpg'

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getWebsiteWebinarSizes({
            headlineFontSize, subheadFontSize,
            setHeadlineFontSize, setSubheadFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getWebsiteWebinarContents({
              eyebrow,
              headline: verbatimCopy.headline || '',
              subhead: verbatimCopy.subhead || '',
              body: verbatimCopy.body || '',
              ctaText,
              setEyebrow,
              setHeadline: (v) => setVerbatimCopy({ headline: v }),
              setSubhead: (v) => setVerbatimCopy({ subhead: v }),
              setBody: (v) => setVerbatimCopy({ body: v }),
              setCtaText,
            })}
          >
            <CategoryRegistryProvider
              categories={[
                {
                  path: 'website-webinar.solutionPill',
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
                <WebsiteWebinar
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  subhead={subheadEff}
                  body={bodyEff}
                  cta={ctaEff}
                  solution={showSolutionEff ? solution : 'none'}
                  variant={webinarVariant}
                  imageUrl={thumbnailImageUrl ?? '/placeholder-mountain.jpg'}
                  imagePosition={currentSlotSettings.position}
                  imageZoom={currentSlotSettings.zoom}
                  imageFilters={currentSlotSettings.filters}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadline}
                  showSubhead={showSubheadEff}
                  showBody={showBodyEff}
                  showCta={showCtaEff}
                  grayscale={grayscale}
                  theme={theme}
                  speaker1={{ name: speaker1Name, role: speaker1Role, imageUrl: speaker1ImageUrl, imagePosition: speaker1ImagePosition, imageZoom: speaker1ImageZoom }}
                  speaker2={{ name: speaker2Name, role: speaker2Role, imageUrl: speaker2ImageUrl, imagePosition: speaker2ImagePosition, imageZoom: speaker2ImageZoom }}
                  speaker3={{ name: speaker3Name, role: speaker3Role, imageUrl: speaker3ImageUrl, imagePosition: speaker3ImagePosition, imageZoom: speaker3ImageZoom }}
                  showSpeaker1={showSpeaker1}
                  showSpeaker2={showSpeaker2}
                  showSpeaker3={showSpeaker3}
                  headlineFontSize={headlineFontSize ?? undefined}
                  subheadFontSize={subheadFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={websiteWebinarGaps}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="website-webinar"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('website-webinar', key, next)}
                        scale={1}
                        direction={stackAlign === 'bottom' ? 'up' : 'down'}
                        min={0}
                        max={96}
                        showUnit
                      />
                    </Editable>
                  )}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `website-webinar.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    // Image, logo, and speakers panel are fixed-presence
                    // (not draggable to bench).
                    const dragConfig = blockId !== 'image' && blockId !== 'logo' &&
                                       blockId !== 'speakers' && slot
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
                        templateId="website-webinar"
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
                    const path = `website-webinar.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId !== 'eyebrow' && blockId !== 'headline' &&
                        blockId !== 'subhead' && blockId !== 'body' &&
                        blockId !== 'cta') {
                      return defaultInner
                    }
                    const value =
                      blockId === 'eyebrow'  ? eyebrow :
                      blockId === 'headline' ? (verbatimCopy.headline || '') :
                      blockId === 'subhead'  ? (verbatimCopy.subhead || '') :
                      blockId === 'body'     ? (verbatimCopy.body || '') :
                      blockId === 'cta'      ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow':  setEyebrow(next); break
                        case 'headline': setVerbatimCopy({ headline: next }); break
                        case 'subhead':  setVerbatimCopy({ subhead: next }); break
                        case 'body':     setVerbatimCopy({ body: next }); break
                        case 'cta':      setCtaText(next); break
                      }
                    }
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={handleChange}
                        format="plain"
                        singleLine={blockId === 'eyebrow' || blockId === 'cta'}
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
              frameWidth={333}
              frameHeight={450}
              initialSettings={currentSlotSettings}
              onSettingsChange={(next) => {
                setThumbnailImageSettings('website-webinar', {
                  position: next.position,
                  zoom: next.zoom,
                  filters: next.filters,
                })
              }}
              onImageChange={(url) => {
                setThumbnailImageUrl(url)
                setThumbnailImageSettings('website-webinar', {
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
