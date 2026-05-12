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
import { ImageRegistryProvider, useImageSelectionEffect, type SlotImage } from '../ImageRegistry'
import { ImageEditorModal } from '../../image-editor'
import { NEUTRAL_FILTERS, type ImageSlotSettings } from '@/lib/image-filters'
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
  getEmailSpeakersSlots,
  getEmailSpeakersSizes,
  getEmailSpeakersContents,
} from '../template-configs/email-speakers'
import {
  EmailSpeakers,
  type EmailSpeakersBlockId,
} from '../../templates/EmailSpeakers'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-speakers.
 *
 * Notable differences from email-dark-gradient:
 *  - Multi-instance speakers (1/2/3 each independently bench-able)
 *  - Solution pill is a 'category' chip (toggle visibility via bench)
 *  - Content stack alignment + spacing applies to LEFT column only
 *    (eyebrow/headline/body/cta). Right speaker column is unaffected.
 *  - speakerCount is derived from showSpeaker1/2/3, passed to template
 *    purely for legacy compat (template uses showSpeakerN when present)
 */

/** Block IDs that map to BenchChip kinds. The `speaker*` and `solutionPill`
 *  variants use the chip kinds we added (speaker, category). */
const BLOCK_TO_CHIP_KIND: Record<EmailSpeakersBlockId, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  body: 'body',
  cta: 'button',
  solutionPill: 'category',
  speaker1: 'speaker',
  speaker2: 'speaker',
  speaker3: 'speaker',
}

const BLOCK_TO_LABEL: Record<EmailSpeakersBlockId, string> = {
  eyebrow: 'Eyebrow',
  headline: 'Headline',
  body: 'Body',
  cta: 'CTA',
  solutionPill: 'Category',
  speaker1: 'Speaker 1',
  speaker2: 'Speaker 2',
  speaker3: 'Speaker 3',
}

/** 1×1 transparent gif — fallback `imageSrc` for ImageEditorModal when a
 *  speaker has no image yet. The lightbox still renders (so Change Image
 *  is reachable) but the preview shows nothing until the user picks a
 *  real avatar. */
const PLACEHOLDER_AVATAR_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

export function EmailSpeakersStageBench(props: StageBenchEditorProps) {
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
  const showBody = useStore((s) => s.showBody)
  const setShowBody = useStore((s) => s.setShowBody)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)
  const showSolutionSet = useStore((s) => s.showSolutionSet)
  const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)
  const showSpeaker1 = useStore((s) => s.showSpeaker1)
  const setShowSpeaker1 = useStore((s) => s.setShowSpeaker1)
  const showSpeaker2 = useStore((s) => s.showSpeaker2)
  const setShowSpeaker2 = useStore((s) => s.setShowSpeaker2)
  const showSpeaker3 = useStore((s) => s.showSpeaker3)
  const setShowSpeaker3 = useStore((s) => s.setShowSpeaker3)
  const solution = useStore((s) => s.solution)
  const setSolution = useStore((s) => s.setSolution)
  const logoColor = useStore((s) => s.logoColor) as 'black' | 'orange'
  const grayscale = useStore((s) => s.grayscale)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const speakerCount = useStore((s) => s.speakerCount)
  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const emailSpeakersGaps = useStore((s) => s.templateGaps['email-speakers'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  // Speaker data + setters. Each speaker exposes three editable fields
  // (name / role / image); deep-click into the group selects one of them.
  const speaker1 = {
    name: useStore((s) => s.speaker1Name),
    role: useStore((s) => s.speaker1Role),
    imageUrl: useStore((s) => s.speaker1ImageUrl),
    imagePosition: useStore((s) => s.speaker1ImagePosition),
    imageZoom: useStore((s) => s.speaker1ImageZoom),
  }
  const speaker2 = {
    name: useStore((s) => s.speaker2Name),
    role: useStore((s) => s.speaker2Role),
    imageUrl: useStore((s) => s.speaker2ImageUrl),
    imagePosition: useStore((s) => s.speaker2ImagePosition),
    imageZoom: useStore((s) => s.speaker2ImageZoom),
  }
  const speaker3 = {
    name: useStore((s) => s.speaker3Name),
    role: useStore((s) => s.speaker3Role),
    imageUrl: useStore((s) => s.speaker3ImageUrl),
    imagePosition: useStore((s) => s.speaker3ImagePosition),
    imageZoom: useStore((s) => s.speaker3ImageZoom),
  }
  const setSpeaker1Name = useStore((s) => s.setSpeaker1Name)
  const setSpeaker1Role = useStore((s) => s.setSpeaker1Role)
  const setSpeaker2Name = useStore((s) => s.setSpeaker2Name)
  const setSpeaker2Role = useStore((s) => s.setSpeaker2Role)
  const setSpeaker3Name = useStore((s) => s.setSpeaker3Name)
  const setSpeaker3Role = useStore((s) => s.setSpeaker3Role)
  const setSpeaker1ImageUrl = useStore((s) => s.setSpeaker1ImageUrl)
  const setSpeaker2ImageUrl = useStore((s) => s.setSpeaker2ImageUrl)
  const setSpeaker3ImageUrl = useStore((s) => s.setSpeaker3ImageUrl)
  const setSpeaker1ImagePosition = useStore((s) => s.setSpeaker1ImagePosition)
  const setSpeaker2ImagePosition = useStore((s) => s.setSpeaker2ImagePosition)
  const setSpeaker3ImagePosition = useStore((s) => s.setSpeaker3ImagePosition)
  const setSpeaker1ImageZoom = useStore((s) => s.setSpeaker1ImageZoom)
  const setSpeaker2ImageZoom = useStore((s) => s.setSpeaker2ImageZoom)
  const setSpeaker3ImageZoom = useStore((s) => s.setSpeaker3ImageZoom)
  const speakerNameSetters = {
    speaker1: setSpeaker1Name, speaker2: setSpeaker2Name, speaker3: setSpeaker3Name,
  } as const
  const speakerRoleSetters = {
    speaker1: setSpeaker1Role, speaker2: setSpeaker2Role, speaker3: setSpeaker3Role,
  } as const
  const speakerNames = {
    speaker1: speaker1.name, speaker2: speaker2.name, speaker3: speaker3.name,
  } as const
  const speakerRoles = {
    speaker1: speaker1.role, speaker2: speaker2.role, speaker3: speaker3.role,
  } as const
  const speakerImageUrlSetters = {
    speaker1: setSpeaker1ImageUrl, speaker2: setSpeaker2ImageUrl, speaker3: setSpeaker3ImageUrl,
  } as const
  const speakerImagePositionSetters = {
    speaker1: setSpeaker1ImagePosition, speaker2: setSpeaker2ImagePosition, speaker3: setSpeaker3ImagePosition,
  } as const
  const speakerImageZoomSetters = {
    speaker1: setSpeaker1ImageZoom, speaker2: setSpeaker2ImageZoom, speaker3: setSpeaker3ImageZoom,
  } as const
  const speakerById = {
    speaker1, speaker2, speaker3,
  } as const

  // Lightbox state — which speaker's editor is open. Opens automatically
  // on selection via useImageSelectionEffect(). Library/upload UI lives
  // inside the lightbox as a view-swap; no separate modal state needed.
  type SpeakerId = 'speaker1' | 'speaker2' | 'speaker3'
  const [editorFor, setEditorFor] = useState<SpeakerId | null>(null)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  // ---- slot config ----
  const slots = getEmailSpeakersSlots({
    showEyebrow, showBody, showCta, showSolutionSet,
    showSpeaker1, showSpeaker2, showSpeaker3,
    setShowEyebrow, setShowBody, setShowCta, setShowSolutionSet,
    setShowSpeaker1, setShowSpeaker2, setShowSpeaker3,
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

  // ---- Effective content — raw value, empty when unset. The template
  // file owns the canonical placeholder fallback so editor / thumbnail / export all render the same string. ----
  const eyebrowEff  = eyebrow ?? ''
  const headlineEff = verbatimCopy.headline ?? ''
  const bodyEff     = verbatimCopy.body ?? ''
  const ctaEff      = ctaText ?? ''

  // ---- effective speaker visibility (with preview) ----
  const showEyebrowEff  = showEyebrow      || previewKey === 'eyebrow'
  const showBodyEff     = showBody         || previewKey === 'body'
  const showCtaEff      = showCta          || previewKey === 'cta'
  const showSolutionEff = showSolutionSet  || previewKey === 'solutionPill'
  const showSpeaker1Eff = showSpeaker1     || previewKey === 'speaker1'
  const showSpeaker2Eff = showSpeaker2     || previewKey === 'speaker2'
  const showSpeaker3Eff = showSpeaker3     || previewKey === 'speaker3'

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

  // ---- block kind / store mapping for Editable ----
  const blockKind: Record<EmailSpeakersBlockId, 'text' | 'cta' | 'image' | 'pill' | 'group'> = {
    eyebrow: 'text',
    headline: 'text',
    body: 'text',
    cta: 'cta',
    solutionPill: 'pill',
    speaker1: 'group',
    speaker2: 'group',
    speaker3: 'group',
  }
  const blockStoreKey: Record<EmailSpeakersBlockId, string> = {
    eyebrow: 'eyebrow',
    headline: 'verbatimCopy.headline',
    body: 'verbatimCopy.body',
    cta: 'ctaText',
    solutionPill: 'showSolutionSet',
    speaker1: 'speaker1',
    speaker2: 'speaker2',
    speaker3: 'speaker3',
  }

  // Solution category options — drives the EditbarCategory dropdown.
  const solutionOptions: CategoryOption[] = Object.entries(colorsConfig.solutions)
    .filter(([key]) => key !== 'none')
    .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color }))

  // Image actions per speaker — selecting a speaker's avatar opens its
  // lightbox directly.
  const speakerIds: SpeakerId[] = ['speaker1', 'speaker2', 'speaker3']
  const slotImages: SlotImage[] = speakerIds.map((id) => ({
    path: `email-speakers.${id}.image`,
    onSelect: () => setEditorFor(id),
  }))

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getEmailSpeakersSizes({ headlineFontSize, setHeadlineFontSize })}
        >
          <ContentRegistryProvider
            contents={getEmailSpeakersContents({
              eyebrow,
              headlineHtml: verbatimCopy.headline || '',
              bodyHtml: verbatimCopy.body || '',
              ctaText,
              setEyebrow,
              setHeadlineHtml: (v) => setVerbatimCopy({ headline: v }),
              setBodyHtml: (v) => setVerbatimCopy({ body: v }),
              setCtaText,
            })}
          >
            <CategoryRegistryProvider
              categories={[
                {
                  path: 'email-speakers.solutionPill',
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
                <EmailSpeakers
                  headline={headlineEff}
                  eyebrow={eyebrowEff}
                  body={bodyEff}
                  ctaText={ctaEff}
                  solution={solution}
                  logoColor={logoColor === 'orange' ? 'orange' : 'black'}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadline}
                  showBody={showBodyEff}
                  showCta={showCtaEff}
                  showSolutionSet={showSolutionEff}
                  grayscale={grayscale}
                  theme={theme}
                  speakerCount={speakerCount}
                  showSpeaker1={showSpeaker1Eff}
                  showSpeaker2={showSpeaker2Eff}
                  showSpeaker3={showSpeaker3Eff}
                  speaker1={speaker1}
                  speaker2={speaker2}
                  speaker3={speaker3}
                  headlineFontSize={headlineFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={emailSpeakersGaps}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderSpacerBetween={(key, value) => (
                    <Editable
                      templateId="email-speakers"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('email-speakers', key, next)}
                        scale={1}
                        direction={stackAlign === 'bottom' ? 'up' : 'down'}
                        min={0}
                        max={96}
                        showUnit
                      />
                    </Editable>
                  )}
                  renderBlock={(blockId, content) => {
                    const slotPath = `email-speakers.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = slot
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
                        templateId="email-speakers"
                        slotKey={blockId}
                        storeKey={blockStoreKey[blockId]}
                        kind={blockKind[blockId]}
                        drag={dragConfig}
                        previewActive={previewKey === blockId}
                      >
                        {content}
                      </Editable>
                    )
                  }}
                  renderInlineEditor={(blockId, defaultInner) => {
                    const path = `email-speakers.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (blockId !== 'eyebrow' && blockId !== 'headline' &&
                        blockId !== 'body' && blockId !== 'cta') {
                      return defaultInner
                    }
                    const isPlainText = blockId === 'eyebrow' || blockId === 'cta'
                    const value =
                      blockId === 'eyebrow' ? eyebrow :
                      blockId === 'headline' ? (verbatimCopy.headline || '') :
                      blockId === 'body' ? (verbatimCopy.body || '') :
                      blockId === 'cta' ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow': setEyebrow(next); break
                        case 'headline': setVerbatimCopy({ headline: next }); break
                        case 'body': setVerbatimCopy({ body: next }); break
                        case 'cta': setCtaText(next); break
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
                  renderSpeakerField={(speakerId, field, defaultInner) => {
                    const fieldKind = field === 'image' ? 'image' as const : 'text' as const
                    const fieldStoreKey =
                      field === 'image' ? `${speakerId}ImageUrl`
                        : field === 'name' ? `${speakerId}Name`
                        : `${speakerId}Role`
                    return (
                      <Editable
                        templateId="email-speakers"
                        slotKey={`${speakerId}.${field}`}
                        storeKey={fieldStoreKey}
                        kind={fieldKind}
                      >
                        {defaultInner}
                      </Editable>
                    )
                  }}
                  renderSpeakerFieldInline={(speakerId, field, defaultInner) => {
                    const fieldPath = `email-speakers.${speakerId}.${field}`
                    if (editingPath !== fieldPath) return defaultInner
                    const value = field === 'name' ? speakerNames[speakerId] : speakerRoles[speakerId]
                    const setter = field === 'name' ? speakerNameSetters[speakerId] : speakerRoleSetters[speakerId]
                    return (
                      <InlineTextEdit
                        value={value}
                        onChange={setter}
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
            {/* Per-speaker editor lightbox — opens automatically when the
             *  speaker's avatar slot is selected (via useImageSelectionEffect).
             *  Falls back to a transparent placeholder URL when the speaker
             *  has no image yet so the lightbox still has something to render;
             *  the user reaches Change Image inside the modal to populate.
             *  Library/upload UI lives inside the lightbox as a view-swap. */}
            {editorFor && (() => {
              // TODO(stage-bench/filters): per-speaker filter persistence.
              // The modal accepts a bundled ImageSlotSettings shape; for now
              // we feed it neutral filters and drop the filters portion of
              // onSettingsChange — slider UI moves locally but doesn't
              // persist across opens. Wiring 3× per-speaker `imageFilters`
              // store fields + export-params plumbing is the follow-up to
              // light this up. Press-release proves the pattern.
              const speaker = speakerById[editorFor]
              const initialSettings: ImageSlotSettings = {
                position: speaker.imagePosition,
                zoom: speaker.imageZoom,
                filters: NEUTRAL_FILTERS,
              }
              return (
                <ImageEditorModal
                  isOpen
                  onClose={() => setEditorFor(null)}
                  imageSrc={speaker.imageUrl || PLACEHOLDER_AVATAR_SRC}
                  /* Avatar is a 48×48 circular crop — same dimensions used by
                   * <SpeakerAvatar> so the crop preview matches the canvas. */
                  frameWidth={48}
                  frameHeight={48}
                  initialSettings={initialSettings}
                  onSettingsChange={(next) => {
                    speakerImagePositionSetters[editorFor](next.position)
                    speakerImageZoomSetters[editorFor](next.zoom)
                    // next.filters intentionally dropped until per-speaker
                    // filter store fields land — see TODO above.
                  }}
                  onImageChange={(url) => {
                    speakerImageUrlSetters[editorFor](url)
                    // Reset crop on image swap so the new image isn't stuck
                    // at the old image's offsets.
                    speakerImagePositionSetters[editorFor]({ x: 0, y: 0 })
                    speakerImageZoomSetters[editorFor](1)
                  }}
                />
              )
            })()}
            </ImageRegistryProvider>
            </CategoryRegistryProvider>
          </ContentRegistryProvider>
        </SizeRegistryProvider>
      </VisibilityRegistryProvider>
    </CanvasEditorProvider>
  )
}

/** Calls the foundation selection-effect hook. Must render inside
 *  ImageRegistryProvider so the hook reads the right slot list. */
function ImageSelectionEffect() {
  useImageSelectionEffect()
  return null
}
