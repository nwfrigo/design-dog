'use client'

import { useRef } from 'react'
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
  getWebsiteEhsAccelerateListingSlots,
  getWebsiteEhsAccelerateListingSizes,
  getWebsiteEhsAccelerateListingContents,
} from '../template-configs/website-ehs-accelerate-listing'
import {
  WebsiteEhsAccelerateListing,
  type WebsiteEhsAccelerateListingBlockId,
} from '../../templates/WebsiteEhsAccelerateListing'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for website-ehs-accelerate-listing.
 *
 * Twin of WebsiteEventListingStageBench without a variant selector
 * (background image is baked). Same nested-grid pattern: 4 rows where
 * Row 1 + Row 4 (CTA) are always-visible and Rows 2 + 3 toggle via
 * showRow3 / showRow4 bench chips.
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  eyebrow: 'EVENT',
  headline: 'Headline',
  subhead: 'Subheadline',
  gridDetail1: 'Date: TBD',
  gridDetail2: 'Location: TBD',
  gridDetail3: 'Time: TBD',
  gridDetail4: 'Register Now',
}

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  subhead: 'subheadline',
  body: 'body',
}

export function WebsiteEhsAccelerateListingStageBench(props: StageBenchEditorProps) {
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

  const showEyebrow = useStore((s) => s.showEyebrow)
  const setShowEyebrow = useStore((s) => s.setShowEyebrow)
  const showHeadline = useStore((s) => s.showHeadline)
  const showSubhead = useStore((s) => s.showSubhead)
  const setShowSubhead = useStore((s) => s.setShowSubhead)
  const showRow3 = useStore((s) => s.showRow3)
  const setShowRow3 = useStore((s) => s.setShowRow3)
  const showRow4 = useStore((s) => s.showRow4)
  const setShowRow4 = useStore((s) => s.setShowRow4)

  const gridDetail1Text = useStore((s) => s.gridDetail1Text)
  const setGridDetail1Text = useStore((s) => s.setGridDetail1Text)
  const gridDetail2Text = useStore((s) => s.gridDetail2Text)
  const setGridDetail2Text = useStore((s) => s.setGridDetail2Text)
  const gridDetail3Text = useStore((s) => s.gridDetail3Text)
  const setGridDetail3Text = useStore((s) => s.setGridDetail3Text)
  const gridDetail4Text = useStore((s) => s.gridDetail4Text)
  const setGridDetail4Text = useStore((s) => s.setGridDetail4Text)

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const websiteEhsAccelerateListingGaps = useStore((s) => s.templateGaps['website-ehs-accelerate-listing'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getWebsiteEhsAccelerateListingSlots({
    showEyebrow, showSubhead, showRow3, showRow4,
    setShowEyebrow, setShowSubhead, setShowRow3, setShowRow4,
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

  const eyebrowEff     = withPlaceholder('eyebrow',     eyebrow)
  const headlineEff    = withPlaceholder('headline',    verbatimCopy.headline)
  const subheadEff     = withPlaceholder('subhead',     verbatimCopy.subhead)
  const gridDetail1Eff = withPlaceholder('gridDetail1', gridDetail1Text)
  const gridDetail2Eff = withPlaceholder('gridDetail2', gridDetail2Text)
  const gridDetail3Eff = withPlaceholder('gridDetail3', gridDetail3Text)
  const gridDetail4Eff = withPlaceholder('gridDetail4', gridDetail4Text)

  const showEyebrowEff = showEyebrow || previewKey === 'eyebrow'
  const showSubheadEff = showSubhead || previewKey === 'subhead'
  const showRow3Eff    = showRow3    || previewKey === 'gridDetail2'
  const showRow4Eff    = showRow4    || previewKey === 'gridDetail3'

  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  const stageBar = (
    <SelectorRow label="content stack">
      <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
    </SelectorRow>
  )

  const slotConfig: Record<WebsiteEhsAccelerateListingBlockId, { storeKey: string; kind: 'text' | 'image' | 'cta' }> = {
    logo:         { storeKey: 'logo', kind: 'image' },
    eyebrow:      { storeKey: 'eyebrow', kind: 'text' },
    headline:     { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead:      { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    gridDetail1:  { storeKey: 'gridDetail1Text', kind: 'text' },
    gridDetail2:  { storeKey: 'gridDetail2Text', kind: 'text' },
    gridDetail3:  { storeKey: 'gridDetail3Text', kind: 'text' },
    gridDetail4:  { storeKey: 'gridDetail4Text', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getWebsiteEhsAccelerateListingSizes({ headlineFontSize, setHeadlineFontSize })}
        >
          <ContentRegistryProvider
            contents={getWebsiteEhsAccelerateListingContents({
              eyebrow,
              headline: verbatimCopy.headline || '',
              subhead: verbatimCopy.subhead || '',
              gridDetail1Text,
              gridDetail2Text,
              gridDetail3Text,
              gridDetail4Text,
              setEyebrow,
              setHeadline: (v) => setVerbatimCopy({ headline: v }),
              setSubhead: (v) => setVerbatimCopy({ subhead: v }),
              setGridDetail1Text,
              setGridDetail2Text,
              setGridDetail3Text,
              setGridDetail4Text,
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
                <WebsiteEhsAccelerateListing
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  subhead={subheadEff}
                  gridDetail1Text={gridDetail1Eff}
                  gridDetail2Text={gridDetail2Eff}
                  gridDetail3Text={gridDetail3Eff}
                  gridDetail4Text={gridDetail4Eff}
                  showRow3={showRow3Eff}
                  showRow4={showRow4Eff}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadline}
                  showSubhead={showSubheadEff}
                  headlineFontSize={headlineFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={websiteEhsAccelerateListingGaps}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="website-ehs-accelerate-listing"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('website-ehs-accelerate-listing', key, next)}
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
                    const slotPath = `website-ehs-accelerate-listing.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId !== 'logo' && blockId !== 'gridDetail1' && blockId !== 'gridDetail4' && slot
                      ? {
                          data: { region: 'stage' as const, path: slotPath },
                          preview: (
                            <BenchChip
                              kind={ICON_KIND_TO_CHIP_KIND[slot.iconKey ?? ''] ?? 'body'}
                              label={slot.label}
                              isFloating
                              draggable={false}
                            />
                          ),
                        }
                      : undefined
                    return (
                      <Editable
                        templateId="website-ehs-accelerate-listing"
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
                    const path = `website-ehs-accelerate-listing.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId === 'logo') return defaultInner
                    const value =
                      blockId === 'eyebrow'      ? eyebrow :
                      blockId === 'headline'     ? (verbatimCopy.headline || '') :
                      blockId === 'subhead'      ? (verbatimCopy.subhead || '') :
                      blockId === 'gridDetail1'  ? gridDetail1Text :
                      blockId === 'gridDetail2'  ? gridDetail2Text :
                      blockId === 'gridDetail3'  ? gridDetail3Text :
                      blockId === 'gridDetail4'  ? gridDetail4Text : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow':      setEyebrow(next); break
                        case 'headline':     setVerbatimCopy({ headline: next }); break
                        case 'subhead':      setVerbatimCopy({ subhead: next }); break
                        case 'gridDetail1':  setGridDetail1Text(next); break
                        case 'gridDetail2':  setGridDetail2Text(next); break
                        case 'gridDetail3':  setGridDetail3Text(next); break
                        case 'gridDetail4':  setGridDetail4Text(next); break
                      }
                    }
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={handleChange}
                        format="plain"
                        singleLine={blockId !== 'headline' && blockId !== 'subhead'}
                      />
                    )
                  }}
                  renderOverlay={() => <StageScrim visible={showStageScrim} />}
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
