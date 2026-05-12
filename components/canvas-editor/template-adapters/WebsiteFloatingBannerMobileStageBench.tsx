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
  getWebsiteFloatingBannerMobileSlots,
  getWebsiteFloatingBannerMobileSizes,
  getWebsiteFloatingBannerMobileContents,
} from '../template-configs/website-floating-banner-mobile'
import {
  WebsiteFloatingBannerMobile,
  floatingBannerMobileVariantSwatch,
  type WebsiteFloatingBannerMobileBlockId,
  type FloatingBannerMobileVariant,
  type FloatingBannerMobileArrowType,
} from '../../templates/WebsiteFloatingBannerMobile'
import type { StageBenchEditorProps } from '../StageBenchEditor'

/**
 * Stage & Bench adapter for website-floating-banner-mobile.
 *
 * Track 2. 580×80 horizontal strip. Slots: eyebrow / headline / cta.
 * Stage bar: variant selector (7 swatches via the `enum` primitive) +
 * arrow-type toggle (text + arrow / arrow-only).
 */

const PREVIEW_PLACEHOLDERS: Record<string, string> = {
  eyebrow: 'EYEBROW',
  headline: 'Lightweight header.',
  cta: 'Learn More',
}

const ICON_KIND_TO_CHIP_KIND: Record<string, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  cta: 'button',
}

const VARIANTS: FloatingBannerMobileVariant[] = [
  'light', 'orange', 'dark',
  'blue-gradient-1', 'blue-gradient-2', 'dark-gradient-1', 'dark-gradient-2',
]
const VARIANT_OPTIONS: EnumOption[] = VARIANTS.map((v) => ({
  value: v,
  ariaLabel: v.replace(/-/g, ' '),
  swatch: floatingBannerMobileVariantSwatch(v),
}))

export function WebsiteFloatingBannerMobileStageBench(props: StageBenchEditorProps) {
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
  const ctaText = useStore((s) => s.ctaText)
  const setCtaText = useStore((s) => s.setCtaText)

  const showEyebrow = useStore((s) => s.showEyebrow)
  const setShowEyebrow = useStore((s) => s.setShowEyebrow)
  const showHeadline = useStore((s) => s.showHeadline)
  const setShowHeadline = useStore((s) => s.setShowHeadline)
  const showCta = useStore((s) => s.showCta)
  const setShowCta = useStore((s) => s.setShowCta)

  const variant = useStore((s) => s.floatingBannerMobileVariant)
  const setVariant = useStore((s) => s.setFloatingBannerMobileVariant)
  const arrowType = useStore((s) => s.floatingBannerMobileArrowType)
  const setArrowType = useStore((s) => s.setFloatingBannerMobileArrowType)

  const headlineFontSize = useStore((s) => s.headlineFontSize)
  const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

  const editingPath = useCanvasEditorStore((s) => s.editingPath)

  const slots = getWebsiteFloatingBannerMobileSlots({
    showEyebrow, showHeadline, showCta,
    setShowEyebrow, setShowHeadline, setShowCta,
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

  const eyebrowEff  = withPlaceholder('eyebrow',  eyebrow)
  const headlineEff = withPlaceholder('headline', verbatimCopy.headline)
  const ctaEff      = withPlaceholder('cta',      ctaText)

  const showEyebrowEff  = showEyebrow  || previewKey === 'eyebrow'
  const showHeadlineEff = showHeadline || previewKey === 'headline'
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
    <>
      <SelectorRow label="variant">
        <SelectorPrimitive
          kind="enum"
          value={variant}
          onChange={(v) => setVariant(v as FloatingBannerMobileVariant)}
          options={VARIANT_OPTIONS}
        />
      </SelectorRow>
      <SelectorRow label="arrow">
        <Toggle<FloatingBannerMobileArrowType>
          value={arrowType}
          onChange={setArrowType}
          options={[
            { value: 'text', label: 'Text' },
            { value: 'arrow', label: 'Arrow only' },
          ] as const}
          ariaLabel="Arrow type"
        />
      </SelectorRow>
    </>
  )

  const slotConfig: Record<WebsiteFloatingBannerMobileBlockId, { storeKey: string; kind: 'text' | 'cta' }> = {
    eyebrow:  { storeKey: 'eyebrow', kind: 'text' },
    headline: { storeKey: 'verbatimCopy.headline', kind: 'text' },
    cta:      { storeKey: 'ctaText', kind: 'cta' },
  }

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider slots={slots}>
        <SizeRegistryProvider
          sizes={getWebsiteFloatingBannerMobileSizes({ headlineFontSize, setHeadlineFontSize })}
        >
          <ContentRegistryProvider
            contents={getWebsiteFloatingBannerMobileContents({
              eyebrow,
              headline: verbatimCopy.headline || '',
              ctaText,
              setEyebrow,
              setHeadline: (v) => setVerbatimCopy({ headline: v }),
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
                <WebsiteFloatingBannerMobile
                  eyebrow={eyebrowEff}
                  headline={headlineEff}
                  cta={ctaEff}
                  showEyebrow={showEyebrowEff}
                  showHeadline={showHeadlineEff}
                  variant={variant}
                  arrowType={arrowType}
                  headlineFontSize={headlineFontSize ?? undefined}
                  colors={colorsConfig}
                  typography={typographyConfig}
                  scale={1}
                  renderBlock={(blockId, content) => {
                    const cfg = slotConfig[blockId]
                    const slotPath = `website-floating-banner-mobile.${blockId}`
                    const slot = slots.find((s) => s.path === slotPath)
                    const dragConfig = blockId !== 'cta' && slot
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
                        templateId="website-floating-banner-mobile"
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
                    const path = `website-floating-banner-mobile.${blockId}`
                    if (editingPath !== path) return defaultInner
                    if (showCta && arrowType === 'arrow' && blockId === 'cta') {
                      // CTA text isn't visible when arrowType is arrow-only;
                      // skip inline editor for that case.
                      return defaultInner
                    }
                    const value =
                      blockId === 'eyebrow'  ? eyebrow :
                      blockId === 'headline' ? (verbatimCopy.headline || '') :
                      blockId === 'cta'      ? ctaText : ''
                    const handleChange = (next: string) => {
                      switch (blockId) {
                        case 'eyebrow':  setEyebrow(next); break
                        case 'headline': setVerbatimCopy({ headline: next }); break
                        case 'cta':      setCtaText(next); break
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
