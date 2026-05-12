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
import { BenchChip, type BenchChipKind } from '../bench/BenchChip'
import { SelectorRow } from '../stage-bar/SelectorRow'
import { SelectorPrimitive, type EnumOption } from '../stage-bar/SelectorPrimitive'
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
  getEmailCorityConnect2026Slots,
  getEmailCorityConnect2026Sizes,
  getEmailCorityConnect2026Contents,
} from '../template-configs/email-cority-connect-2026'
import {
  EmailCorityConnect2026,
  backgroundUrl,
  type EmailCorityConnect2026BlockId,
  type CCBackgroundVariant,
} from '../../templates/EmailCorityConnect2026'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-cority-connect-2026.
 *
 * First Track 2 template — fixed-composition. No ContentStack, no
 * stackAlign, no per-gap spacing. Each editable slot is wrapped in
 * <Editable> at its existing flex position; the template's layout
 * (logo top / headline+body middle / cta bottom, distributed by
 * `space-between` inside an absolute content layer) is preserved
 * exactly.
 *
 * Stage bar: 16-background variant selector via the new
 * `SelectorPrimitive kind="enum"` with swatches. Cells will overflow
 * the bar until the carousel-overflow design pass lands — functional
 * today, prettier tomorrow.
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  headline: 'Lightweight header.',
  body: '',
  cta: 'Register',
}

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  headline: 'headline',
  body: 'body',
  cta: 'button',
}

const BACKGROUND_VARIANTS: CCBackgroundVariant[] = [
  'dark-blue-1', 'dark-blue-2', 'dark-blue-3', 'dark-blue-4',
  'dark-orange-1', 'dark-orange-2', 'dark-orange-3', 'dark-orange-4',
  'light-blue-1', 'light-blue-2', 'light-blue-3', 'light-blue-4',
  'light-orange-1', 'light-orange-2', 'light-orange-3', 'light-orange-4',
]

const BACKGROUND_OPTIONS: EnumOption[] = BACKGROUND_VARIANTS.map((v) => ({
  value: v,
  ariaLabel: v.replace(/-/g, ' '),
  swatch: { backgroundImage: `url(${backgroundUrl(v)})` },
}))

export function EmailCorityConnect2026StageBench(props: StageBenchEditorProps) {
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
  const setShowHeadline = useStore((s) => s.setShowHeadline)
  const showBody = useStore((s) => s.showBody)
  const setShowBody = useStore((s) => s.setShowBody)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)

  const ccBackgroundVariant = useStore((s) => s.ccBackgroundVariant)
  const setCcBackgroundVariant = useStore((s) => s.setCcBackgroundVariant)

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getEmailCorityConnect2026Slots({
    showHeadline, showBody, showCta,
    setShowHeadline, setShowBody, setShowCta,
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
  const bodyEff     = verbatimCopy.body || ''
  const ctaEff      = withPlaceholder('cta',      ctaText)

  const showHeadlineEff = showHeadline || previewKey === 'headline'
  const showBodyEff     = showBody     || previewKey === 'body'
  const showCtaEff      = showCta      || previewKey === 'cta'

  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  const stageBar = (
    <SelectorRow label="background">
      <SelectorPrimitive
        kind="enum"
        value={ccBackgroundVariant}
        onChange={(v) => setCcBackgroundVariant(v as CCBackgroundVariant)}
        options={BACKGROUND_OPTIONS}
      />
    </SelectorRow>
  )

  const slotConfig: Record<EmailCorityConnect2026BlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' }> = {
    logo:     { storeKey: 'logo', kind: 'image' },
    headline: { storeKey: 'verbatimCopy.headline', kind: 'text' },
    body:     { storeKey: 'verbatimCopy.body', kind: 'text' },
    cta:      { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getEmailCorityConnect2026Sizes({
            headlineFontSize, setHeadlineFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getEmailCorityConnect2026Contents({
              headlineHtml: verbatimCopy.headline || '',
              bodyHtml: verbatimCopy.body || '',
              ctaText,
              setHeadlineHtml: (v) => setVerbatimCopy({ headline: v }),
              setBodyHtml: (v) => setVerbatimCopy({ body: v }),
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
                <EmailCorityConnect2026
                  headline={headlineEff}
                  body={bodyEff}
                  ctaText={ctaEff}
                  backgroundVariant={ccBackgroundVariant}
                  showHeadline={showHeadlineEff}
                  showBody={showBodyEff}
                  showCta={showCtaEff}
                  headlineFontSize={headlineFontSize ?? undefined}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `email-cority-connect-2026.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId !== 'logo' && slot
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
                        templateId="email-cority-connect-2026"
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
                    const path = `email-cority-connect-2026.${blockId}`
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
          </ContentRegistryProvider>
        </SizeRegistryProvider>
      </VisibilityRegistryProvider>
    </CanvasEditorProvider>
  )
}
