'use client'

import { useRef } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { ColorStyle } from '@/types'
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
import { SelectorPrimitive, type ColorOption } from '../stage-bar/SelectorPrimitive'
import { VisibilityRegistryProvider } from '../VisibilityRegistry'
import { SizeRegistryProvider } from '../SizeRegistry'
import { ContentRegistryProvider } from '../ContentRegistry'
import { LineHeightRegistryProvider } from '../LineHeightRegistry'
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
  getEmailDarkGradientSlots,
  getEmailDarkGradientSizes,
  getEmailDarkGradientContents,
  getEmailDarkGradientLineHeights,
} from '../template-configs/email-dark-gradient'
import {
  EmailDarkGradient,
  type EmailDarkGradientBlockId,
} from '../../templates/EmailDarkGradient'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for email-dark-gradient.
 *
 * Reference implementation for the per-template adapter pattern. Each
 * adapter is a self-contained component that:
 *   1. Subscribes to its template's store fields
 *   2. Computes slot / size / content / line-height configs from store
 *   3. Renders the StageBenchShell with shared sub-components
 *      (Header, ActionRow, Bench) plus its template-specific stage bar
 *   4. Renders the template inside the stage container, wiring renderBlock
 *      / renderInlineEditor / renderOverlay so each editable region gets
 *      <Editable> + drag config + the shared scrim
 *   5. Uses useStageBenchDroppables to wire stage + bench drop targets
 *      driven by slot.show() / slot.hide() — no per-template setShowX
 *      handlers needed
 *
 * Fits the "escape hatch" Layer-2 of the architecture: the adapter is a
 * full React component because the template's render contract is
 * non-trivial (rich text formatting, spacer slots, gap config, etc.).
 * Simpler templates can use the upcoming Layer-1 declarative descriptor
 * instead.
 */

// Drag-preview placeholders — used both during chip drag-preview AND
// as the empty-content fallback so blocks don't disappear when the user
// deletes their text. See StageBenchEditor history for context.
const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  eyebrow: 'Eyebrow',
  headline: 'Headline',
  subhead: 'Subheadline',
  body: 'Body copy',
  cta: 'Call to action',
}

const COLOR_STYLE_OPTIONS: ColorOption[] = [
  { value: '1', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-1.png)' }, ariaLabel: 'Color 1' },
  { value: '2', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-2.png)' }, ariaLabel: 'Color 2' },
  { value: '3', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-3.png)' }, ariaLabel: 'Color 3' },
  { value: '4', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-4.png)' }, ariaLabel: 'Color 4' },
]

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  body: 'body',
  cta: 'button',
}

export function EmailDarkGradientStageBench(props: StageBenchEditorProps) {
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
  const setShowHeadline = useStore((s) => s.setShowHeadline)
  const showSubhead = useStore((s) => s.showSubhead)
  const setShowSubhead = useStore((s) => s.setShowSubhead)
  const showBody = useStore((s) => s.showBody)
  const setShowBody = useStore((s) => s.setShowBody)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)
  const colorStyle = useStore((s) => s.colorStyle)
  const setColorStyle = useStore((s) => s.setColorStyle)
  const alignment = useStore((s) => s.alignment)
  const setAlignment = useStore((s) => s.setAlignment)
  const ctaStyle = useStore((s) => s.ctaStyle)
  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const subheadFontSize = useStore((s) => s.subheadFontSize)
  const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)
  const emailDarkGradientGaps = useStore((s) => s.emailDarkGradientGaps)
  const setEmailDarkGradientGap = useStore((s) => s.setEmailDarkGradientGap)
  const lineHeights = useStore((s) => s.lineHeights)
  const setLineHeight = useStore((s) => s.setLineHeight)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  // ---- slot config (from template-configs) ----
  const slots = getEmailDarkGradientSlots({
    showEyebrow, showHeadline, showSubhead, showBody, showCta,
    setShowEyebrow, setShowHeadline, setShowSubhead, setShowBody, setShowCta,
  })

  // ---- preview state from active drag ----
  const activeDrag = useActiveDrag<SlotDragData>()
  const previewKey =
    activeDrag &&
    activeDrag.data.region === 'bench' &&
    activeDrag.overTargetId === STAGE_DROPPABLE_ID
      ? activeDrag.data.path.split('.').slice(1).join('.')
      : null
  const showStageScrim = previewKey !== null

  // ---- effective content (real value, with placeholder fallback) ----
  const withPlaceholder = (key: string, real: string | undefined): string =>
    real || PREVIEW_PLACEHOLDERS[key] || ''

  const eyebrowEff  = withPlaceholder('eyebrow',  eyebrow)
  const headlineEff = withPlaceholder('headline', verbatimCopy.headline)
  const subheadEff  = withPlaceholder('subhead',  verbatimCopy.subhead)
  const bodyEff     = withPlaceholder('body',     verbatimCopy.body)
  const ctaEff      = withPlaceholder('cta',      ctaText)

  const showEyebrowEff  = showEyebrow  || previewKey === 'eyebrow'
  const showHeadlineEff = showHeadline || previewKey === 'headline'
  const showSubheadEff  = showSubhead  || previewKey === 'subhead'
  const showBodyEff     = showBody     || previewKey === 'body'
  const showCtaEff      = showCta      || previewKey === 'cta'

  // ---- FLIP + drop targets ----
  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)

  // Compose stage refs (FLIP container + drop target).
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  // ---- stage bar ----
  const stageBar = (
    <>
      <SelectorRow label="theme">
        <SelectorPrimitive kind="theme" value={theme} onChange={setTheme} />
      </SelectorRow>
      <SelectorRow label="color">
        <SelectorPrimitive
          kind="color-4"
          value={colorStyle}
          onChange={(v) => setColorStyle(v as ColorStyle)}
          options={COLOR_STYLE_OPTIONS}
        />
      </SelectorRow>
      <SelectorRow label="content stack">
        <SelectorPrimitive kind="stack" value={stackAlign} onChange={setStackAlign} />
      </SelectorRow>
      <SelectorRow label="alignment">
        <SelectorPrimitive kind="alignment" value={alignment} onChange={setAlignment} />
      </SelectorRow>
    </>
  )

  // ---- per-block Editable wrapping (handles preview z-index + drag) ----
  const slotConfig: Record<EmailDarkGradientBlockId, { storeKey: string; kind: 'text' | 'image' | 'cta' }> = {
    logo: { storeKey: 'logo', kind: 'image' },
    eyebrow: { storeKey: 'eyebrow', kind: 'text' },
    headline: { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead: { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    body: { storeKey: 'verbatimCopy.body', kind: 'text' },
    cta: { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getEmailDarkGradientSizes({
            headlineFontSize, subheadFontSize,
            setHeadlineFontSize, setSubheadFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getEmailDarkGradientContents({
              eyebrow,
              headlineHtml: verbatimCopy.headline || '',
              subheadHtml: verbatimCopy.subhead || '',
              bodyHtml: verbatimCopy.body || '',
              ctaText,
              setEyebrow,
              setHeadlineHtml: (v) => setVerbatimCopy({ headline: v }),
              setSubheadHtml: (v) => setVerbatimCopy({ subhead: v }),
              setBodyHtml: (v) => setVerbatimCopy({ body: v }),
              setCtaText,
            })}
          >
            <LineHeightRegistryProvider
              lineHeights={getEmailDarkGradientLineHeights({ lineHeights, setLineHeight })}
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
                  <EmailDarkGradient
                    headline={headlineEff}
                    eyebrow={eyebrowEff}
                    subhead={subheadEff}
                    body={bodyEff}
                    ctaText={ctaEff}
                    colorStyle={colorStyle}
                    alignment={alignment}
                    ctaStyle={ctaStyle}
                    showEyebrow={showEyebrowEff}
                    showHeadline={showHeadlineEff}
                    showSubhead={showSubheadEff}
                    showBody={showBodyEff}
                    showCta={showCtaEff}
                    headlineFontSize={headlineFontSize ?? undefined}
                    subheadFontSize={subheadFontSize ?? undefined}
                    stackAlign={stackAlign}
                    gaps={emailDarkGradientGaps}
                    lineHeights={lineHeights}
                    renderSpacerBetween={(key, value) => (
                      <Editable
                        templateId="email-dark-gradient"
                        slotKey={key}
                        storeKey="emailDarkGradientGaps"
                        kind="spacer"
                      >
                        <SpacingHandle
                          spacing={value}
                          onChange={(next) => setEmailDarkGradientGap(key, next)}
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
                      const slotPath = `email-dark-gradient.${blockId}`
                      const slot = slots.find((s) => s.path === slotPath)
                      const dragConfig = slot
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
                          templateId="email-dark-gradient"
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
                      const path = `email-dark-gradient.${blockId}`
                      if (editingPath !== path) return defaultInner
                      const isPlainText = blockId === 'eyebrow' || blockId === 'cta'
                      // Inline editor reads from the *real* store values.
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
                          format={isPlainText ? 'plain' : 'html'}
                          singleLine={isPlainText}
                        />
                      )
                    }}
                    colors={colorsConfig}
                    typography={typographyConfig}
                    scale={1}
                    renderOverlay={() => <StageScrim visible={showStageScrim} />}
                  />
                </div>
              </StageBenchShell>
              <ContextualToolbar />
              <SelectionRing />
            </LineHeightRegistryProvider>
          </ContentRegistryProvider>
        </SizeRegistryProvider>
      </VisibilityRegistryProvider>
    </CanvasEditorProvider>
  )
}
