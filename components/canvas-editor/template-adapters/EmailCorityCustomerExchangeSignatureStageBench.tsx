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
  getEmailCorityCustomerExchangeSignatureSlots,
  getEmailCorityCustomerExchangeSignatureContents,
} from '../template-configs/email-cority-customer-exchange-signature'
import {
  EmailCorityCustomerExchangeSignature,
  type EmailCorityCustomerExchangeSignatureBlockId,
} from '../../templates/EmailCorityCustomerExchangeSignature'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-cority-customer-exchange-signature.
 *
 * Track 2 signature row (400×100). Left side: brand-locked CCE
 * horizontal logo lockup. Right side: translucent panel with event-
 * detail rows (date / location + time) and a CTA pinned to the
 * bottom. Empty stage bar — no variant or theme controls.
 *
 * Store-field mapping: eventDate / eventLocation are SHARED across
 * EHS Accelerate + CCE templates; eventTime maps to the CCE-specific
 * `cceEventTime` store field. Visibility flags are CCE-specific
 * (showCceEventDate / showCceEventLocation / showCceEventTime).
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  eventDate: 'Thursday, May 7th',
  eventLocation: 'Brussels, Belgium',
  eventTime: '10:00–16:00',
  cta: 'Join Us',
}

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  'small-caption': 'body',
  cta: 'button',
}

export function EmailCorityCustomerExchangeSignatureStageBench(props: StageBenchEditorProps) {
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

  const eventDate = useStore((s) => s.eventDate)
  const setEventDate = useStore((s) => s.setEventDate)
  const eventLocation = useStore((s) => s.eventLocation)
  const setEventLocation = useStore((s) => s.setEventLocation)
  const cceEventTime = useStore((s) => s.cceEventTime)
  const setCceEventTime = useStore((s) => s.setCceEventTime)
  const ctaText = useStore((s) => s.ctaText)
  const setCtaText = useStore((s) => s.setCtaText)

  const showCceEventDate = useStore((s) => s.showCceEventDate)
  const setShowCceEventDate = useStore((s) => s.setShowCceEventDate)
  const showCceEventLocation = useStore((s) => s.showCceEventLocation)
  const setShowCceEventLocation = useStore((s) => s.setShowCceEventLocation)
  const showCceEventTime = useStore((s) => s.showCceEventTime)
  const setShowCceEventTime = useStore((s) => s.setShowCceEventTime)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getEmailCorityCustomerExchangeSignatureSlots({
    showEventDate: showCceEventDate,
    showEventLocation: showCceEventLocation,
    showEventTime: showCceEventTime,
    showCta,
    setShowEventDate: setShowCceEventDate,
    setShowEventLocation: setShowCceEventLocation,
    setShowEventTime: setShowCceEventTime,
    setShowCta,
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

  const eventDateEff     = withPlaceholder('eventDate',     eventDate)
  const eventLocationEff = withPlaceholder('eventLocation', eventLocation)
  const eventTimeEff     = withPlaceholder('eventTime',     cceEventTime)
  const ctaEff           = withPlaceholder('cta',           ctaText)

  const showEventDateEff     = showCceEventDate     || previewKey === 'eventDate'
  const showEventLocationEff = showCceEventLocation || previewKey === 'eventLocation'
  const showEventTimeEff     = showCceEventTime     || previewKey === 'eventTime'
  const showCtaEff           = showCta              || previewKey === 'cta'

  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  const slotConfig: Record<EmailCorityCustomerExchangeSignatureBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' }> = {
    logo:          { storeKey: 'logo', kind: 'image' },
    eventDate:     { storeKey: 'eventDate', kind: 'text' },
    eventLocation: { storeKey: 'eventLocation', kind: 'text' },
    eventTime:     { storeKey: 'cceEventTime', kind: 'text' },
    cta:           { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider sizes={[]}>
          <ContentRegistryProvider
            contents={getEmailCorityCustomerExchangeSignatureContents({
              eventDate,
              eventLocation,
              eventTime: cceEventTime,
              ctaText,
              setEventDate,
              setEventLocation,
              setEventTime: setCceEventTime,
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
                <EmailCorityCustomerExchangeSignature
                  eventDate={eventDateEff}
                  eventLocation={eventLocationEff}
                  eventTime={eventTimeEff}
                  ctaText={ctaEff}
                  showEventDate={showEventDateEff}
                  showEventLocation={showEventLocationEff}
                  showEventTime={showEventTimeEff}
                  showCta={showCtaEff}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `email-cority-customer-exchange-signature.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId !== 'logo' && slot
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
                        templateId="email-cority-customer-exchange-signature"
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
                    const path = `email-cority-customer-exchange-signature.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId === 'logo') return defaultInner
                    const value =
                      blockId === 'eventDate'     ? eventDate :
                      blockId === 'eventLocation' ? eventLocation :
                      blockId === 'eventTime'     ? cceEventTime :
                      blockId === 'cta'           ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eventDate':     setEventDate(next); break
                        case 'eventLocation': setEventLocation(next); break
                        case 'eventTime':     setCceEventTime(next); break
                        case 'cta':           setCtaText(next); break
                      }
                    }
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={handleChange}
                        format="plain"
                        singleLine
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
