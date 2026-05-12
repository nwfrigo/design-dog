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
  getEmailEhsAccelerateSignatureSlots,
  getEmailEhsAccelerateSignatureContents,
} from '../template-configs/email-ehs-accelerate-signature'
import {
  EmailEhsAccelerateSignature,
  type EmailEhsAccelerateSignatureBlockId,
} from '../../templates/EmailEhsAccelerateSignature'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-ehs-accelerate-signature.
 *
 * Track 2 signature row (400×100). Brand-locked EhsAccelerate logo
 * top-left. Top-right: event date + location (2 lines, share one
 * visibility flag). Bottom-left: workshop name. Bottom-right: CTA.
 * Empty stage bar — no variant/theme controls.
 *
 * eventDate + eventLocation are wrapped as independent <Editable>
 * blocks so each text field can be selected on its own, even though
 * the bench chip "Event Details" toggles their visibility together.
 */

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  'small-caption': 'body',
  subhead: 'subheadline',
  cta: 'button',
}

export function EmailEhsAccelerateSignatureStageBench(props: StageBenchEditorProps) {
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
  const workshopName = useStore((s) => s.signatureWorkshopName)
  const setWorkshopName = useStore((s) => s.setSignatureWorkshopName)
  const ctaText = useStore((s) => s.ctaText)
  const setCtaText = useStore((s) => s.setCtaText)

  const showWorkshopName = useStore((s) => s.showSignatureWorkshopName)
  const setShowWorkshopName = useStore((s) => s.setShowSignatureWorkshopName)
  const showEventDetails = useStore((s) => s.showSignatureEventDetails)
  const setShowEventDetails = useStore((s) => s.setShowSignatureEventDetails)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getEmailEhsAccelerateSignatureSlots({
    showEventDetails, showWorkshopName, showCta,
    setShowEventDetails, setShowWorkshopName, setShowCta,
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
  const eventDateEff     = eventDate ?? ''
  const eventLocationEff = eventLocation ?? ''
  const workshopNameEff  = workshopName ?? ''
  const ctaEff           = ctaText ?? ''

  // Event details preview-key 'eventDetails' surfaces the whole block.
  // Workshop / CTA preview as their own chips.
  const showEventDetailsEff = showEventDetails || previewKey === 'eventDetails'
  const showWorkshopNameEff = showWorkshopName || previewKey === 'workshopName'
  const showCtaEff          = showCta          || previewKey === 'cta'

  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  const slotConfig: Record<EmailEhsAccelerateSignatureBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' }> = {
    logo:          { storeKey: 'logo', kind: 'image' },
    eventDate:     { storeKey: 'eventDate', kind: 'text' },
    eventLocation: { storeKey: 'eventLocation', kind: 'text' },
    workshopName:  { storeKey: 'signatureWorkshopName', kind: 'text' },
    cta:           { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider sizes={[]}>
          <ContentRegistryProvider
            contents={getEmailEhsAccelerateSignatureContents({
              eventDate,
              eventLocation,
              workshopName,
              ctaText,
              setEventDate,
              setEventLocation,
              setWorkshopName,
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
                <EmailEhsAccelerateSignature
                  eventDate={eventDateEff}
                  eventLocation={eventLocationEff}
                  workshopName={workshopNameEff}
                  ctaText={ctaEff}
                  showWorkshopName={showWorkshopNameEff}
                  showEventDetails={showEventDetailsEff}
                  showCta={showCtaEff}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    // Map block ids to their visibility slot path for drag config.
                    const visibilityPath =
                      blockId === 'eventDate' || blockId === 'eventLocation'
                        ? 'email-ehs-accelerate-signature.eventDetails'
                        : `email-ehs-accelerate-signature.${blockId}`
                    const slot = slots.find((s) => s.path === visibilityPath)
                    const dragConfig = blockId !== 'logo' && slot
                      ? {
                          data: { region: 'stage' as const, path: visibilityPath },
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
                        templateId="email-ehs-accelerate-signature"
                        slotKey={blockId}
                        storeKey={cfg.storeKey}
                        kind={cfg.kind}
                        drag={dragConfig}
                        previewActive={
                          previewKey === blockId ||
                          (previewKey === 'eventDetails' &&
                            (blockId === 'eventDate' || blockId === 'eventLocation'))
                        }
                      >
                        {content}
                      </Editable>
                    )
                  }}
                  renderInlineEditor={(blockId, defaultInner) => {
                    const path = `email-ehs-accelerate-signature.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId === 'logo') return defaultInner
                    const value =
                      blockId === 'eventDate'     ? eventDate :
                      blockId === 'eventLocation' ? eventLocation :
                      blockId === 'workshopName'  ? workshopName :
                      blockId === 'cta'           ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eventDate':     setEventDate(next); break
                        case 'eventLocation': setEventLocation(next); break
                        case 'workshopName':  setWorkshopName(next); break
                        case 'cta':           setCtaText(next); break
                      }
                    }
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={handleChange}
                        format="plain"
                        singleLine={blockId !== 'workshopName'}
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
