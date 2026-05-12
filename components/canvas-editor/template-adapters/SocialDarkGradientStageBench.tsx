'use client'

import { useRef } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { ColorStyle, TextAlignment, LogoColor } from '@/types'
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
import { Toggle } from '../editbar/Toggle'
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
  getSocialDarkGradientSlots,
  getSocialDarkGradientSizes,
  getSocialDarkGradientContents,
} from '../template-configs/social-dark-gradient'
import {
  SocialDarkGradient,
  type SocialDarkGradientBlockId,
} from '../../templates/SocialDarkGradient'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for social-dark-gradient.
 *
 * Tier-1 template, closest mirror of EmailDarkGradient. Differences:
 *   - No content-stack alignment (template uses `space-between`, not a
 *     stackable column), so no `stack` selector.
 *   - No theme selector (template is always dark-themed).
 *   - Adds a `logoColor` Toggle (orange / white) to the stage bar — social
 *     templates need the option since dark backgrounds work with both.
 *   - Metadata slot (uppercase chip below text). Treated as plain text.
 *   - No `headingSize: S | M | L` preset in S&B (replaced by per-slot
 *     continuous A↑/A↓ for headline + subhead). Body retains the legacy
 *     formula via the headingSize value still passed from the store.
 *
 * No image slot (background is a preset; no editable image), so no
 * ImageRegistryProvider. No solution pill, so no CategoryRegistryProvider.
 * No per-slot line-heights either.
 */

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
  'small-caption': 'small-caption',
  cta: 'button',
}

export function SocialDarkGradientStageBench(props: StageBenchEditorProps) {
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
  const metadata = useStore((s) => s.metadata)
  const setMetadata = useStore((s) => s.setMetadata)
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
  const showMetadata = useStore((s) => s.showMetadata)
  const setShowMetadata = useStore((s) => s.setShowMetadata)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)

  const colorStyle = useStore((s) => s.colorStyle)
  const setColorStyle = useStore((s) => s.setColorStyle)
  const alignment = useStore((s) => s.alignment)
  const setAlignment = useStore((s) => s.setAlignment)
  const headingSize = useStore((s) => s.headingSize)
  const ctaStyle = useStore((s) => s.ctaStyle)
  const logoColor = useStore((s) => s.logoColor)
  const setLogoColor = useStore((s) => s.setLogoColor)
  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
  const subheadFontSize = useStore((s) => s.subheadFontSize)
  const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

  // Renovation-pattern wiring — stackAlign drives vertical distribution,
  // socialDarkGradientGaps is the sparse per-gap override record edited
  // via the per-spacer drag handle. Both flow through the bundled
  // `templateGaps` record + universal `setTemplateGap` setter.
  const stackAlign = useStore((s) => s.stackAlign)
  const setStackAlign = useStore((s) => s.setStackAlign)
  const socialDarkGradientGaps = useStore((s) => s.templateGaps['social-dark-gradient'] ?? {})
  const setTemplateGap = useStore((s) => s.setTemplateGap)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  // ---- slot config ----
  const slots = getSocialDarkGradientSlots({
    showEyebrow, showHeadline, showSubhead, showBody, showMetadata, showCta,
    setShowEyebrow, setShowHeadline, setShowSubhead, setShowBody, setShowMetadata, setShowCta,
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

  // ---- Effective content — raw value, empty when unset. The template
  // file owns the canonical placeholder fallback so editor / thumbnail / export all render the same string. ----
  const eyebrowEff  = eyebrow ?? ''
  const headlineEff = verbatimCopy.headline ?? ''
  const subheadEff  = verbatimCopy.subhead ?? ''
  const bodyEff     = verbatimCopy.body ?? ''
  const metadataEff = metadata ?? ''
  const ctaEff      = ctaText ?? ''

  const showEyebrowEff  = showEyebrow  || previewKey === 'eyebrow'
  const showHeadlineEff = showHeadline || previewKey === 'headline'
  const showSubheadEff  = showSubhead  || previewKey === 'subhead'
  const showBodyEff     = showBody     || previewKey === 'body'
  const showMetadataEff = showMetadata || previewKey === 'metadata'
  const showCtaEff      = showCta      || previewKey === 'cta'

  // ---- FLIP + drop targets ----
  const stageRef = useRef<HTMLDivElement | null>(null)
  useFlipReflow(stageRef)
  const { setStageNodeRef: setStageDropRef, setBenchNodeRef } =
    useStageBenchDroppables(slots)
  const setStageNodeRef = (el: HTMLDivElement | null) => {
    stageRef.current = el
    setStageDropRef(el)
  }

  // ---- stage bar ----
  const stageBar = (
    <>
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
        <SelectorPrimitive
          kind="alignment"
          value={alignment}
          onChange={(v) => setAlignment(v as TextAlignment)}
        />
      </SelectorRow>
      <SelectorRow label="logo">
        <SelectorPrimitive
          kind="color-2"
          value={logoColor === 'orange' ? 'orange' : 'white'}
          onChange={(v) => setLogoColor(v as LogoColor)}
          options={[
            { value: 'white',  swatch: { backgroundColor: '#FFFFFF' }, ariaLabel: 'White logo' },
            { value: 'orange', swatch: { backgroundColor: '#D35F0B' }, ariaLabel: 'Orange logo' },
          ]}
        />
      </SelectorRow>
    </>
  )

  // ---- per-block Editable wrapping ----
  // 'logo' is the topAnchor (brand-locked) but is part of the BlockId union
  // so ContentStack's typing stays strict. Wrapped as image-kind for
  // selection feedback (ring on click) but it doesn't surface a toolbar.
  const slotConfig: Record<SocialDarkGradientBlockId, { storeKey: string; kind: 'text' | 'cta' | 'image' }> = {
    logo:     { storeKey: 'logo', kind: 'image' },
    eyebrow:  { storeKey: 'eyebrow', kind: 'text' },
    headline: { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead:  { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    body:     { storeKey: 'verbatimCopy.body', kind: 'text' },
    metadata: { storeKey: 'metadata', kind: 'text' },
    cta:      { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getSocialDarkGradientSizes({
            headlineFontSize, subheadFontSize,
            setHeadlineFontSize, setSubheadFontSize,
          })}
        >
          <ContentRegistryProvider
            contents={getSocialDarkGradientContents({
              eyebrow,
              headlineHtml: verbatimCopy.headline || '',
              subheadHtml: verbatimCopy.subhead || '',
              bodyHtml: verbatimCopy.body || '',
              metadata,
              ctaText,
              setEyebrow,
              setHeadlineHtml: (v) => setVerbatimCopy({ headline: v }),
              setSubheadHtml: (v) => setVerbatimCopy({ subhead: v }),
              setBodyHtml: (v) => setVerbatimCopy({ body: v }),
              setMetadata,
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
                <SocialDarkGradient
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  subhead={subheadEff}
                  body={bodyEff}
                  metadata={metadataEff}
                  ctaText={ctaEff}
                  colorStyle={colorStyle}
                  headingSize={headingSize}
                  alignment={alignment}
                  ctaStyle={ctaStyle}
                  logoColor={logoColor === 'orange' ? 'orange' : 'white'}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadlineEff}
                  showSubhead={showSubheadEff}
                  showBody={showBodyEff}
                  showMetadata={showMetadataEff}
                  showCta={showCtaEff}
                  headlineFontSize={headlineFontSize ?? undefined}
                  subheadFontSize={subheadFontSize ?? undefined}
                  stackAlign={stackAlign}
                  gaps={socialDarkGradientGaps}
                  renderSpacerBetween={(key, value, _prev, _next) => (
                    <Editable
                      templateId="social-dark-gradient"
                      slotKey={key}
                      storeKey="templateGaps"
                      kind="spacer"
                    >
                      <SpacingHandle
                        spacing={value}
                        onChange={(next) => setTemplateGap('social-dark-gradient', key, next)}
                        scale={1}
                        direction={stackAlign === 'bottom' ? 'up' : 'down'}
                        min={0}
                        max={96}
                        showUnit
                      />
                    </Editable>
                  )}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `social-dark-gradient.${blockId}`
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
                        templateId="social-dark-gradient"
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
                    const path = `social-dark-gradient.${blockId}`
                    if (editingPath !== path) return defaultInner
                    const isPlainText =
                      blockId === 'eyebrow' ||
                      blockId === 'metadata' ||
                      blockId === 'cta'
                    const value =
                      blockId === 'eyebrow'  ? eyebrow :
                      blockId === 'headline' ? (verbatimCopy.headline || '') :
                      blockId === 'subhead'  ? (verbatimCopy.subhead || '') :
                      blockId === 'body'     ? (verbatimCopy.body || '') :
                      blockId === 'metadata' ? metadata :
                      blockId === 'cta'      ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow':  setEyebrow(next); break
                        case 'headline': setVerbatimCopy({ headline: next }); break
                        case 'subhead':  setVerbatimCopy({ subhead: next }); break
                        case 'body':     setVerbatimCopy({ body: next }); break
                        case 'metadata': setMetadata(next); break
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
