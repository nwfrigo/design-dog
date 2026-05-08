'use client'

import { useRef, useState } from 'react'
import { useStore } from '@/store'
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
import { SelectorPrimitive } from '../stage-bar/SelectorPrimitive'
import { VisibilityRegistryProvider } from '../VisibilityRegistry'
import { SizeRegistryProvider } from '../SizeRegistry'
import { ContentRegistryProvider } from '../ContentRegistry'
import { CategoryRegistryProvider, type CategoryOption } from '../CategoryRegistry'
import { ImageRegistryProvider, type SlotImage } from '../ImageRegistry'
import { ImageLibraryModal } from '../../ImageLibraryModal'
import { ImageCropModal } from '../../ImageCropModal'
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
  getWebsitePressReleaseSlots,
  getWebsitePressReleaseSizes,
  getWebsitePressReleaseContents,
} from '../template-configs/website-press-release'
import {
  WebsitePressRelease,
  type WebsitePressReleaseBlockId,
} from '../../templates/WebsitePressRelease'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for website-press-release.
 *
 * Notable shapes:
 *  - Featured image is *always* on stage (not bench-able). Selecting it
 *    surfaces the EditbarImage toolbar (kind: 'image') for change /
 *    generate / edit actions.
 *  - Larger canvas (800×450) — handled entirely by the template.
 *  - Plain-text format throughout (no rich text bold/italic on this
 *    template's blocks).
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  eyebrow: 'Eyebrow',
  headline: 'Lightweight header.',
  subhead: 'Subheadline',
  body: 'Body copy goes here.',
  cta: 'Read more',
}

const BLOCK_TO_CHIP_KIND: Record<WebsitePressReleaseBlockId, BenchChipKind> = {
  image: 'headline', // unused — image isn't bench-able, but type needs all keys
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  body: 'body',
  cta: 'button',
  solutionPill: 'category',
}

const BLOCK_TO_LABEL: Record<WebsitePressReleaseBlockId, string> = {
  image: 'Image',
  eyebrow: 'Eyebrow',
  headline: 'Headline',
  subhead: 'Subhead',
  body: 'Body',
  cta: 'CTA',
  solutionPill: 'Category',
}

export function WebsitePressReleaseStageBench(props: StageBenchEditorProps) {
  const {
    selectedAssets,
    currentAssetIndex,
    isExporting,
    isEditingFromQueue,
    colorsConfig,
    typographyConfig,
    onExport,
    onAddToQueue,
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
  const logoColor = useStore((s) => s.logoColor) as 'black' | 'orange'
  const grayscale = useStore((s) => s.grayscale)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const subheadFontSize = useStore((s) => s.subheadFontSize)
  const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)
  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const websitePressReleaseGaps = useStore((s) => s.websitePressReleaseGaps)
  const setWebsitePressReleaseGap = useStore((s) => s.setWebsitePressReleaseGap)

  // Featured image — store fields (thumbnailImageUrl + per-template
  // thumbnailImageSettings); EditbarImage actions write through these.
  const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
  const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
  const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
  const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
  const currentImageSettings = thumbnailImageSettings['website-press-release'] ?? {
    position: { x: 0, y: 0 },
    zoom: 1,
  }

  // Modal state for the featured image editor flow.
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  // ---- slot config ----
  const slots = getWebsitePressReleaseSlots({
    showEyebrow, showSubhead, showBody, showCta, showSolutionSet,
    setShowEyebrow, setShowSubhead, setShowBody, setShowCta, setShowSolutionSet,
  })

  // ---- preview state ----
  const activeDrag = useActiveDrag<SlotDragData>()
  const previewKey =
    activeDrag &&
    activeDrag.data.region === 'bench' &&
    activeDrag.overTargetId === STAGE_DROPPABLE_ID
      ? activeDrag.data.path.split('.').slice(1).join('.')
      : null
  const showStageScrim = previewKey !== null

  // ---- effective content ----
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

  // ---- FLIP + drop targets ----
  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  // ---- stage bar (theme + content-stack alignment for left column) ----
  const stageBar = (
    <>
      <SelectorRow label="theme">
        <SelectorPrimitive kind="theme" value={theme} onChange={setTheme} />
      </SelectorRow>
      <SelectorRow label="content stack">
        <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
      </SelectorRow>
    </>
  )

  // ---- block kind mapping ----
  const blockKind: Record<WebsitePressReleaseBlockId, 'text' | 'cta' | 'image' | 'pill' | 'group'> = {
    image: 'image',
    eyebrow: 'text',
    headline: 'text',
    subhead: 'text',
    body: 'text',
    cta: 'cta',
    solutionPill: 'pill',
  }
  const blockStoreKey: Record<WebsitePressReleaseBlockId, string> = {
    image: 'thumbnailImageUrl',
    eyebrow: 'eyebrow',
    headline: 'verbatimCopy.headline',
    subhead: 'verbatimCopy.subhead',
    body: 'verbatimCopy.body',
    cta: 'ctaText',
    solutionPill: 'showSolutionSet',
  }

  // Solution category options — drives the EditbarCategory dropdown.
  const solutionOptions: CategoryOption[] = Object.entries(colorsConfig.solutions)
    .filter(([key]) => key !== 'none')
    .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color }))

  // Featured image actions — drives EditbarImage. `onEdit` only resolves
  // when an image is set (otherwise crop has nothing to crop).
  const slotImages: SlotImage[] = [
    {
      path: 'website-press-release.image',
      onChange: () => setShowImageLibrary(true),
      onEdit: thumbnailImageUrl ? () => setShowCropModal(true) : undefined,
    },
  ]

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getWebsitePressReleaseSizes({
            headlineFontSize, subheadFontSize,
            setHeadlineFontSize, setSubheadFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getWebsitePressReleaseContents({
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
                  path: 'website-press-release.solutionPill',
                  options: solutionOptions,
                  value: solution,
                  set: setSolution,
                },
              ]}
            >
            <ImageRegistryProvider images={slotImages}>
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
                <WebsitePressRelease
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  subhead={subheadEff}
                  body={bodyEff}
                  cta={ctaEff}
                  solution={showSolutionEff ? solution : 'none'}
                  imageUrl={thumbnailImageUrl ?? undefined}
                  imagePosition={currentImageSettings.position}
                  imageZoom={currentImageSettings.zoom}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadline}
                  showSubhead={showSubheadEff}
                  showBody={showBodyEff}
                  showCta={showCtaEff}
                  grayscale={grayscale}
                  theme={theme}
                  logoColor={logoColor === 'orange' ? 'orange' : 'black'}
                  headlineFontSize={headlineFontSize ?? undefined}
                  subheadFontSize={subheadFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={websitePressReleaseGaps}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="website-press-release"
                      slotKey={key}
                      storeKey="websitePressReleaseGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setWebsitePressReleaseGap(key, next)}
                        scale={1}
                        direction={stackAlign === 'bottom' ? 'up' : 'down'}
                        min={0}
                        max={96}
                        showUnit
                      />
                    </Editable>
                  )}
                  renderBlock={(blockId, content) => {
                    const isPreviewSlot = previewKey === blockId
                    const slotPath = `website-press-release.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    // Image slot doesn't drag (always on stage). Other
                    // slots get drag config to bench.
                    const dragConfig = blockId !== 'image' && slot
                      ? {
                          data: { region: 'stage' as const, path: slotPath },
                          preview: (
                            <BenchChip
                              kind={BLOCK_TO_CHIP_KIND[blockId]}
                              label={BLOCK_TO_LABEL[blockId]}
                              isFloating
                              draggable={false}
                            />
                          ),
                        }
                      : undefined
                    return (
                      <Editable
                        templateId="website-press-release"
                        slotKey={blockId}
                        storeKey={blockStoreKey[blockId]}
                        kind={blockKind[blockId]}
                        drag={dragConfig}
                      >
                        <div
                          style={
                            isPreviewSlot
                              ? { position: 'relative', zIndex: 2 }
                              : undefined
                          }
                        >
                          {content}
                        </div>
                      </Editable>
                    )
                  }}
                  renderInlineEditor={(blockId, defaultInner) => {
                    const path = `website-press-release.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId !== 'eyebrow' && blockId !== 'headline' &&
                        blockId !== 'subhead' && blockId !== 'body' &&
                        blockId !== 'cta') {
                      return defaultInner
                    }
                    const value =
                      blockId === 'eyebrow' ? eyebrow :
                      blockId === 'headline' ? (verbatimCopy.headline || '') :
                      blockId === 'subhead' ? (verbatimCopy.subhead || '') :
                      blockId === 'body' ? (verbatimCopy.body || '') :
                      blockId === 'cta' ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow': setEyebrow(next); break
                        case 'headline': setVerbatimCopy({ headline: next }); break
                        case 'subhead': setVerbatimCopy({ subhead: next }); break
                        case 'body': setVerbatimCopy({ body: next }); break
                        case 'cta': setCtaText(next); break
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
            {showImageLibrary && (
              <ImageLibraryModal
                onSelect={(url) => {
                  setThumbnailImageUrl(url)
                  // Reset crop on image swap so the new image isn't stuck
                  // at the previous image's offsets.
                  setThumbnailImageSettings('website-press-release', {
                    position: { x: 0, y: 0 },
                    zoom: 1,
                  })
                  setShowImageLibrary(false)
                }}
                onClose={() => setShowImageLibrary(false)}
              />
            )}
            {showCropModal && thumbnailImageUrl && (
              <ImageCropModal
                isOpen
                onClose={() => setShowCropModal(false)}
                imageSrc={thumbnailImageUrl}
                /* Press release featured image frame — matches legacy
                 * EditorScreen for parity. */
                frameWidth={338}
                frameHeight={450}
                initialPosition={currentImageSettings.position}
                initialZoom={currentImageSettings.zoom}
                onSave={(position, zoom) => {
                  setThumbnailImageSettings('website-press-release', { position, zoom })
                }}
              />
            )}
            </ImageRegistryProvider>
            </CategoryRegistryProvider>
          </ContentRegistryProvider>
        </SizeRegistryProvider>
      </VisibilityRegistryProvider>
    </CanvasEditorProvider>
  )
}
