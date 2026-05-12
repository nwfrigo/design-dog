'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { ImageVariant } from '@/types'
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
import { Toggle } from '../editbar/Toggle'
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
  getWebsiteReportSlots,
  getWebsiteReportSizes,
  getWebsiteReportContents,
} from '../template-configs/website-report'
import {
  WebsiteReport,
  type WebsiteReportBlockId,
} from '../../templates/WebsiteReport'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for website-report.
 *
 * Mirror of website-thumbnail except the image renders on the LEFT
 * (not the right). Same slot inventory, same 2-state variant
 * (image/none) Toggle, same theme + content-stack stage-bar shape,
 * same universal image model.
 */

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  cta: 'button',
  category: 'category',
}

export function WebsiteReportStageBench(props: StageBenchEditorProps) {
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
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)
  const showSolutionSet = useStore((s) => s.showSolutionSet)
  const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)

  const solution = useStore((s) => s.solution)
  const setSolution = useStore((s) => s.setSolution)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const reportVariant = useStore((s) => s.reportVariant)
  const setReportVariant = useStore((s) => s.setReportVariant)
  const grayscale = useStore((s) => s.grayscale)

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const subheadFontSize = useStore((s) => s.subheadFontSize)
  const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const websiteReportGaps = useStore((s) => s.templateGaps['website-report'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
  const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
  const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
  const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
  const rawImageSettings = thumbnailImageSettings['website-report']
  const currentSlotSettings: ImageSlotSettings = {
    position: rawImageSettings?.position ?? { x: 0, y: 0 },
    zoom: rawImageSettings?.zoom ?? 1,
    filters: rawImageSettings?.filters ?? NEUTRAL_FILTERS,
  }

  const [showImageEditor, setShowImageEditor] = useState(false)
  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getWebsiteReportSlots({
    showEyebrow, showSubhead, showCta, showSolutionSet,
    setShowEyebrow, setShowSubhead, setShowCta, setShowSolutionSet,
  })

  const activeDrag = useActiveDrag<SlotDragData>()
  const previewKey =
    activeDrag &&
    activeDrag.data.region === 'bench' &&
    activeDrag.overTargetId === STAGE_DROPPABLE_ID
      ? activeDrag.data.path.split('.').slice(1).join('.')
      : null
  const showStageScrim = previewKey !== null

  // ---- Effective content — raw value, empty when unset. The template
  // file owns the canonical placeholder fallback so editor / thumbnail / export all render the same string. ----
  const eyebrowEff  = eyebrow ?? ''
  const headlineEff = verbatimCopy.headline ?? ''
  const subheadEff  = verbatimCopy.subhead ?? ''
  const ctaEff      = ctaText ?? ''

  const showEyebrowEff   = showEyebrow      || previewKey === 'eyebrow'
  const showSubheadEff   = showSubhead      || previewKey === 'subhead'
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
      <SelectorRow label="layout">
        <SelectorPrimitive
          kind="layout-2"
          value={reportVariant === 'image' ? 'image' : 'text'}
          onChange={(v) => setReportVariant((v === 'image' ? 'image' : 'none') as ImageVariant)}
        />
      </SelectorRow>
      <SelectorRow label="content stack">
        <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
      </SelectorRow>
    </>
  )

  const slotConfig: Record<WebsiteReportBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' | 'pill' }> = {
    logo:         { storeKey: 'logo', kind: 'image' },
    solutionPill: { storeKey: 'showSolutionSet', kind: 'pill' },
    eyebrow:      { storeKey: 'eyebrow', kind: 'text' },
    headline:     { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead:      { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    cta:          { storeKey: 'ctaText', kind: 'cta' },
    image:        { storeKey: 'thumbnailImageUrl', kind: 'image' },
  }

  const solutionOptions: CategoryOption[] = Object.entries(colorsConfig.solutions)
    .filter(([key]) => key !== 'none')
    .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color }))

  const slotImages: SlotImage[] = [
    {
      path: 'website-report.image',
      onSelect: () => setShowImageEditor(true),
    },
  ]
  const editorImageSrc = thumbnailImageUrl ?? '/assets/images/default_placeholder_image_report.png'

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getWebsiteReportSizes({
            headlineFontSize, subheadFontSize,
            setHeadlineFontSize, setSubheadFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getWebsiteReportContents({
              eyebrow,
              headline: verbatimCopy.headline || '',
              subhead: verbatimCopy.subhead || '',
              ctaText,
              setEyebrow,
              setHeadline: (v) => setVerbatimCopy({ headline: v }),
              setSubhead: (v) => setVerbatimCopy({ subhead: v }),
              setCtaText,
            })}
          >
            <CategoryRegistryProvider
              categories={[
                {
                  path: 'website-report.solutionPill',
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
                <WebsiteReport
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  subhead={subheadEff}
                  cta={ctaEff}
                  solution={showSolutionEff ? solution : 'none'}
                  variant={reportVariant}
                  imageUrl={thumbnailImageUrl ?? undefined}
                  imagePosition={currentSlotSettings.position}
                  imageZoom={currentSlotSettings.zoom}
                  imageFilters={currentSlotSettings.filters}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadline}
                  showSubhead={showSubheadEff}
                  showCta={showCtaEff}
                  grayscale={grayscale}
                  theme={theme}
                  headlineFontSize={headlineFontSize ?? undefined}
                  subheadFontSize={subheadFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={websiteReportGaps}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="website-report"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('website-report', key, next)}
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
                    const slotPath = `website-report.${blockId}`
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
                        templateId="website-report"
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
                    const path = `website-report.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId !== 'eyebrow' && blockId !== 'headline' &&
                        blockId !== 'subhead' && blockId !== 'cta') {
                      return defaultInner
                    }
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
              frameWidth={320}
              frameHeight={386}
              initialSettings={currentSlotSettings}
              onSettingsChange={(next) => {
                setThumbnailImageSettings('website-report', {
                  position: next.position,
                  zoom: next.zoom,
                  filters: next.filters,
                })
              }}
              onImageChange={(url) => {
                setThumbnailImageUrl(url)
                setThumbnailImageSettings('website-report', {
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
