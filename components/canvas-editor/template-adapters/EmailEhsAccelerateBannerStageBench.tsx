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
  getEmailEhsAccelerateBannerSlots,
  getEmailEhsAccelerateBannerSizes,
  getEmailEhsAccelerateBannerContents,
} from '../template-configs/email-ehs-accelerate-banner'
import {
  EmailEhsAccelerateBanner,
  type EmailEhsAccelerateBannerBlockId,
} from '../../templates/EmailEhsAccelerateBanner'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-ehs-accelerate-banner.
 *
 * Track 2 banner (600×373). Logo (top-left, brand-locked) + headline
 * (left) + body (right, optional) + bottom info bar (date, location,
 * cta in flex space-between). Body is the only visibility-toggleable
 * slot; everything else is fixed-presence.
 *
 * Stage bar: empty (no variant / theme / color).
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  headline: 'In-Person. Exclusive.',
  body: 'Join senior EHS+ leaders to modernize how you stay ahead of operating risks.',
  eventDate: 'Thursday, 13th November',
  eventLocation: 'London, UK',
  cta: 'Join Us',
}

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  body: 'body',
}

export function EmailEhsAccelerateBannerStageBench(props: StageBenchEditorProps) {
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

  const showBody = useStore((s) => s.showBody)
  const setShowBody = useStore((s) => s.setShowBody)

  const eventDate = useStore((s) => s.eventDate)
  const setEventDate = useStore((s) => s.setEventDate)
  const eventLocation = useStore((s) => s.eventLocation)
  const setEventLocation = useStore((s) => s.setEventLocation)

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getEmailEhsAccelerateBannerSlots({ showBody, setShowBody })

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

  const headlineEff      = withPlaceholder('headline',      verbatimCopy.headline)
  const bodyEff          = withPlaceholder('body',          verbatimCopy.body)
  const eventDateEff     = withPlaceholder('eventDate',     eventDate)
  const eventLocationEff = withPlaceholder('eventLocation', eventLocation)
  const ctaEff           = withPlaceholder('cta',           ctaText)

  const showBodyEff = showBody || previewKey === 'body'

  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  const slotConfig: Record<EmailEhsAccelerateBannerBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' }> = {
    logo:          { storeKey: 'logo', kind: 'image' },
    headline:      { storeKey: 'verbatimCopy.headline', kind: 'text' },
    body:          { storeKey: 'verbatimCopy.body', kind: 'text' },
    eventDate:     { storeKey: 'eventDate', kind: 'text' },
    eventLocation: { storeKey: 'eventLocation', kind: 'text' },
    cta:           { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getEmailEhsAccelerateBannerSizes({ headlineFontSize, setHeadlineFontSize })}
        >
          <ContentRegistryProvider
            contents={getEmailEhsAccelerateBannerContents({
              headline: verbatimCopy.headline || '',
              body: verbatimCopy.body || '',
              eventDate,
              eventLocation,
              ctaText,
              setHeadline: (v) => setVerbatimCopy({ headline: v }),
              setBody: (v) => setVerbatimCopy({ body: v }),
              setEventDate,
              setEventLocation,
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
              stageBar={null}
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
                <EmailEhsAccelerateBanner
                  headline={headlineEff}
                  body={bodyEff}
                  showBody={showBodyEff}
                  ctaText={ctaEff}
                  headlineFontSize={headlineFontSize ?? undefined}
                  eventDate={eventDateEff}
                  eventLocation={eventLocationEff}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `email-ehs-accelerate-banner.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId === 'body' && slot
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
                        templateId="email-ehs-accelerate-banner"
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
                    const path = `email-ehs-accelerate-banner.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId === 'logo') return defaultInner
                    const value =
                      blockId === 'headline'      ? (verbatimCopy.headline || '') :
                      blockId === 'body'          ? (verbatimCopy.body || '') :
                      blockId === 'eventDate'     ? eventDate :
                      blockId === 'eventLocation' ? eventLocation :
                      blockId === 'cta'           ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'headline':      setVerbatimCopy({ headline: next }); break
                        case 'body':          setVerbatimCopy({ body: next }); break
                        case 'eventDate':     setEventDate(next); break
                        case 'eventLocation': setEventLocation(next); break
                        case 'cta':           setCtaText(next); break
                      }
                    }
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={handleChange}
                        format="plain"
                        singleLine={blockId !== 'headline' && blockId !== 'body'}
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
