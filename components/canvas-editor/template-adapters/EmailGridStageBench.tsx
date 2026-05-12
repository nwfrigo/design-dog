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
import { CategoryRegistryProvider, type CategoryOption } from '../CategoryRegistry'
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
  getEmailGridSlots,
  getEmailGridSizes,
  getEmailGridContents,
} from '../template-configs/email-grid'
import {
  EmailGrid,
  type EmailGridBlockId,
} from '../../templates/EmailGrid'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-grid.
 *
 * Track 1 with nested-stack right panel:
 *  - Left column: ContentStack (logo+pill topAnchor, blocks eyebrow/
 *    headline/subheading/body) with adjustable per-gap spacing.
 *  - Right grid panel: each row independently editable, equal-flex
 *    layout preserved (design identity stays — no per-row spacing
 *    controls). Row 2 toggleable via the bench chip.
 *
 * Per-row data/cta type toggle is deferred (preserve store values;
 * v1 ships without interactive type-switching).
 */

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  subhead: 'subheadline',
  body: 'body',
  category: 'category',
}

export function EmailGridStageBench(props: StageBenchEditorProps) {
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
  const subheading = useStore((s) => s.subheading)
  const setSubheading = useStore((s) => s.setSubheading)

  const showEyebrow = useStore((s) => s.showEyebrow)
  const setShowEyebrow = useStore((s) => s.setShowEyebrow)
  const showHeadline = useStore((s) => s.showHeadline)
  const showLightHeader = useStore((s) => s.showLightHeader)
  const showSubheading = useStore((s) => s.showSubheading)
  const setShowSubheading = useStore((s) => s.setShowSubheading)
  const showBody = useStore((s) => s.showBody)
  const setShowBody = useStore((s) => s.setShowBody)
  const showSolutionSet = useStore((s) => s.showSolutionSet)
  const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)
  const showGridDetail2 = useStore((s) => s.showGridDetail2)
  const setShowGridDetail2 = useStore((s) => s.setShowGridDetail2)

  const solution = useStore((s) => s.solution)
  const setSolution = useStore((s) => s.setSolution)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const gridDetail1Text = useStore((s) => s.gridDetail1Text)
  const setGridDetail1Text = useStore((s) => s.setGridDetail1Text)
  const gridDetail2Text = useStore((s) => s.gridDetail2Text)
  const setGridDetail2Text = useStore((s) => s.setGridDetail2Text)
  const gridDetail3Text = useStore((s) => s.gridDetail3Text)
  const setGridDetail3Text = useStore((s) => s.setGridDetail3Text)
  const gridDetail3Type = useStore((s) => s.gridDetail3Type)
  // Detail rows 1 + 2 are always 'data' type in the email-grid design.
  // Only row 3's type is configurable (typically 'cta'). Matches the
  // export-params + template-registry treatment.

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const emailGridGaps = useStore((s) => s.templateGaps['email-grid'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getEmailGridSlots({
    showEyebrow, showSubheading, showBody, showSolutionSet, showGridDetail2,
    setShowEyebrow, setShowSubheading, setShowBody, setShowSolutionSet, setShowGridDetail2,
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
  const eyebrowEff      = eyebrow ?? ''
  const headlineEff     = verbatimCopy.headline ?? ''
  const subheadingEff   = subheading ?? ''
  const bodyEff         = verbatimCopy.body ?? ''
  const gridDetail1Eff  = gridDetail1Text ?? ''
  const gridDetail2Eff  = gridDetail2Text ?? ''
  const gridDetail3Eff  = gridDetail3Text ?? ''

  const showEyebrowEff      = showEyebrow      || previewKey === 'eyebrow'
  const showSubheadingEff   = showSubheading   || previewKey === 'subheading'
  const showBodyEff         = showBody         || previewKey === 'body'
  const showSolutionEff     = showSolutionSet  || previewKey === 'solutionPill'
  const showGridDetail2Eff  = showGridDetail2  || previewKey === 'gridDetail2'

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
      <SelectorRow label="content stack">
        <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
      </SelectorRow>
    </>
  )

  const slotConfig: Record<EmailGridBlockId, { storeKey: string; kind: 'text' | 'image' | 'pill' }> = {
    logo:         { storeKey: 'logo', kind: 'image' },
    solutionPill: { storeKey: 'showSolutionSet', kind: 'pill' },
    eyebrow:      { storeKey: 'eyebrow', kind: 'text' },
    headline:     { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subheading:   { storeKey: 'subheading', kind: 'text' },
    body:         { storeKey: 'verbatimCopy.body', kind: 'text' },
    gridDetail1:  { storeKey: 'gridDetail1Text', kind: 'text' },
    gridDetail2:  { storeKey: 'gridDetail2Text', kind: 'text' },
    gridDetail3:  { storeKey: 'gridDetail3Text', kind: 'text' },
  }

  const solutionOptions: CategoryOption[] = Object.entries(colorsConfig.solutions)
    .filter(([key]) => key !== 'none')
    .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color }))

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getEmailGridSizes({ headlineFontSize, setHeadlineFontSize })}
        >
          <ContentRegistryProvider
            contents={getEmailGridContents({
              eyebrow,
              headline: verbatimCopy.headline || '',
              subheading,
              body: verbatimCopy.body || '',
              gridDetail1Text,
              gridDetail2Text,
              gridDetail3Text,
              setEyebrow,
              setHeadline: (v) => setVerbatimCopy({ headline: v }),
              setSubheading,
              setBody: (v) => setVerbatimCopy({ body: v }),
              setGridDetail1Text,
              setGridDetail2Text,
              setGridDetail3Text,
            })}
          >
            <CategoryRegistryProvider
              categories={[
                {
                  path: 'email-grid.solutionPill',
                  options: solutionOptions,
                  value: solution,
                  set: setSolution,
                },
              ]}
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
                <EmailGrid
                  headline={headlineEff}
                  body={bodyEff}
                  showEyebrow={showEyebrowEff}
                  eyebrow={eyebrowEff}
                  showHeadline={showHeadline}
                  showLightHeader={showLightHeader}
                  showHeavyHeader={false}
                  showSubheading={showSubheadingEff}
                  subheading={subheadingEff}
                  showBody={showBodyEff}
                  showSolutionSet={showSolutionEff}
                  solution={solution}
                  showGridDetail2={showGridDetail2Eff}
                  gridDetail1={{ type: 'data', text: gridDetail1Eff }}
                  gridDetail2={{ type: 'data', text: gridDetail2Eff }}
                  gridDetail3={{ type: gridDetail3Type, text: gridDetail3Eff }}
                  headlineFontSize={headlineFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={emailGridGaps}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  theme={theme}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="email-grid"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('email-grid', key, next)}
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
                    const slotPath = `email-grid.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId !== 'logo' && blockId !== 'gridDetail1' && blockId !== 'gridDetail3' && slot
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
                        templateId="email-grid"
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
                    const path = `email-grid.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId === 'logo' || blockId === 'solutionPill') return defaultInner
                    const value =
                      blockId === 'eyebrow'      ? eyebrow :
                      blockId === 'headline'     ? (verbatimCopy.headline || '') :
                      blockId === 'subheading'   ? subheading :
                      blockId === 'body'         ? (verbatimCopy.body || '') :
                      blockId === 'gridDetail1'  ? gridDetail1Text :
                      blockId === 'gridDetail2'  ? gridDetail2Text :
                      blockId === 'gridDetail3'  ? gridDetail3Text : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow':      setEyebrow(next); break
                        case 'headline':     setVerbatimCopy({ headline: next }); break
                        case 'subheading':   setSubheading(next); break
                        case 'body':         setVerbatimCopy({ body: next }); break
                        case 'gridDetail1':  setGridDetail1Text(next); break
                        case 'gridDetail2':  setGridDetail2Text(next); break
                        case 'gridDetail3':  setGridDetail3Text(next); break
                      }
                    }
                    const singleLine =
                      blockId === 'eyebrow' ||
                      blockId === 'gridDetail1' ||
                      blockId === 'gridDetail2' ||
                      blockId === 'gridDetail3'
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={handleChange}
                        format="plain"
                        singleLine={singleLine}
                      />
                    )
                  }}
                  renderOverlay={() => <StageScrim visible={showStageScrim} />}
                />
              </div>
            </StageBenchShell>
            <ContextualToolbar />
            <SelectionRing />
            </CategoryRegistryProvider>
          </ContentRegistryProvider>
        </SizeRegistryProvider>
      </VisibilityRegistryProvider>
    </CanvasEditorProvider>
  )
}
