'use client'

import { type DragEvent } from 'react'
import { useStore } from '@/store'
import { useCanvasEditorStore } from '@/store/canvas-editor'
import type { TemplateType, ColorStyle } from '@/types'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { TEMPLATE_LABELS } from '@/lib/template-config'

import { StageBenchShell } from './StageBenchShell'
import { StageBenchTab } from './StageBenchTab'
import { BenchChip, type BenchChipKind } from './bench/BenchChip'
import { ActionRow } from './action-row/ActionRow'
import { ActionButton } from './action-row/ActionButton'
import { SelectorRow } from './stage-bar/SelectorRow'
import { SelectorPrimitive, type ColorOption } from './stage-bar/SelectorPrimitive'
import {
  VisibilityRegistryProvider,
  useVisibilitySlots,
  SLOT_DRAG_MIME,
  type SlotVisibility,
} from './VisibilityRegistry'
import { SizeRegistryProvider } from './SizeRegistry'
import { ContentRegistryProvider } from './ContentRegistry'
import { LineHeightRegistryProvider } from './LineHeightRegistry'
import { CanvasEditorProvider } from './CanvasEditorProvider'
import { Editable } from './Editable'
import { ContextualToolbar } from './ContextualToolbar'
import { SelectionRing } from './SelectionRing'
import { InlineTextEdit } from './InlineTextEdit'
import { SpacingHandle } from './handles/SpacingHandle'
import {
  getEmailDarkGradientSlots,
  getEmailDarkGradientSizes,
  getEmailDarkGradientContents,
  getEmailDarkGradientLineHeights,
} from './template-configs/email-dark-gradient'
import { EmailDarkGradient, type EmailDarkGradientBlockId } from '../templates/EmailDarkGradient'

/**
 * StageBenchEditor — new on-canvas editor screen for templates that opt into
 * the Stage & Bench UI (see migrated-templates.ts). Replaces the legacy
 * sidebar-form + preview-pad layout for these templates.
 *
 * Owns: the StageBenchShell composition, per-template stage-bar selectors,
 * bench rail, action row, and the Stage canvas itself. EditorScreen dispatches
 * to this component when `isStageBenchTemplate(currentTemplate)` is true.
 *
 * Currently supports: email-dark-gradient (pilot). Adding more templates =
 * one new branch in `renderStage` + extending the per-template registry.
 */

const COLOR_STYLE_OPTIONS: ColorOption[] = [
  { value: '1', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-1.png)' }, ariaLabel: 'Color 1' },
  { value: '2', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-2.png)' }, ariaLabel: 'Color 2' },
  { value: '3', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-3.png)' }, ariaLabel: 'Color 3' },
  { value: '4', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-4.png)' }, ariaLabel: 'Color 4' },
]

const ICON_KIND_TO_CHIP_KIND: Record<NonNullable<SlotVisibility['iconKey']>, BenchChipKind> = {
  eyebrow: 'eyebrow',
  headline: 'headline',
  subhead: 'subheadline',
  body: 'body',
  cta: 'button',
  generic: 'headline',
}

function getChannelFromTemplate(t: TemplateType): string {
  // Templates are dash-separated with the channel as the first token:
  // 'email-dark-gradient' → 'email', 'social-blue-gradient' → 'social', etc.
  return t.split('-')[0] ?? ''
}

export interface StageBenchEditorProps {
  currentTemplate: TemplateType
  selectedAssets: TemplateType[]
  currentAssetIndex: number
  isExporting: boolean
  isEditingFromQueue: boolean
  colorsConfig: ColorsConfig
  typographyConfig: TypographyConfig
  onExport: () => void
  onAddToQueue: () => void
  onPreview: () => void
  onAddAsset: () => void
  onGoToAsset: (idx: number) => void
  onDeleteAsset: (idx: number) => void
  getAssetLabel: (assetType: TemplateType, index: number) => string
}

export function StageBenchEditor(props: StageBenchEditorProps) {
  const {
    currentTemplate,
    selectedAssets,
    currentAssetIndex,
    isExporting,
    isEditingFromQueue,
    colorsConfig,
    typographyConfig,
    onExport,
    onAddToQueue,
    onPreview,
    onAddAsset,
    onGoToAsset,
    onDeleteAsset,
    getAssetLabel,
  } = props

  // ---- store subscriptions (per-asset state) ----
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

  // ---- header (tabs + add asset) ----
  const header = (
    <>
      {selectedAssets.map((asset, idx) => {
        const isActive = idx === currentAssetIndex
        const label = getAssetLabel(asset, idx)
        const channel = getChannelFromTemplate(asset)
        const baseLabel = TEMPLATE_LABELS[asset] ?? label
        return (
          <StageBenchTab
            key={`${asset}-${idx}`}
            active={isActive}
            onClick={() => onGoToAsset(idx)}
          >
            <span className="font-mono text-[12px] uppercase">
              <span className="text-content-secondary">{channel}</span>
              <span className="text-content-tertiary mx-1">/</span>
              <span className={isActive ? 'text-content-primary' : ''}>{baseLabel}</span>
            </span>
          </StageBenchTab>
        )
      })}
      <button
        type="button"
        onClick={onAddAsset}
        title="Add asset"
        className="ml-2 mb-2 p-1 text-content-secondary hover:text-content-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      {selectedAssets.length > 1 && !isEditingFromQueue && (
        <button
          type="button"
          onClick={() => onDeleteAsset(currentAssetIndex)}
          title="Delete this asset"
          className="ml-auto mb-2 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
            text-content-secondary hover:text-red-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      )}
    </>
  )

  // ---- stage bar (per-template selectors) ----
  // For now hardcoded for email-dark-gradient. When more templates land, move
  // this to a per-template registry analog to STAGE_BAR_REGISTRY.
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

  // ---- action row ----
  const actionRow = (
    <ActionRow>
      <ActionButton fn="preview" onClick={onPreview} />
      {!isEditingFromQueue && <ActionButton fn="add-to-queue" onClick={onAddToQueue} />}
      <ActionButton fn="export" loading={isExporting} onClick={onExport} />
    </ActionRow>
  )

  // ---- stage (per-template) ----
  // Drop-target wrapping the canvas — drag-from-bench restores the slot.
  function handleStageDragOver(e: DragEvent<HTMLDivElement>) {
    if (!Array.from(e.dataTransfer.types).includes(SLOT_DRAG_MIME)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  function handleStageDrop(e: DragEvent<HTMLDivElement>) {
    const path = e.dataTransfer.getData(SLOT_DRAG_MIME)
    if (!path) return
    e.preventDefault()
    const slotKey = path.split('.').slice(1).join('.')
    if (slotKey === 'eyebrow')  setShowEyebrow(true)
    if (slotKey === 'headline') setShowHeadline(true)
    if (slotKey === 'subhead')  setShowSubhead(true)
    if (slotKey === 'body')     setShowBody(true)
    if (slotKey === 'cta')      setShowCta(true)
  }

  const slotConfig: Record<EmailDarkGradientBlockId, { storeKey: string; kind: 'text' | 'image' | 'cta' }> = {
    logo: { storeKey: 'logo', kind: 'image' },
    eyebrow: { storeKey: 'eyebrow', kind: 'text' },
    headline: { storeKey: 'verbatimCopy.headline', kind: 'text' },
    subhead: { storeKey: 'verbatimCopy.subhead', kind: 'text' },
    body: { storeKey: 'verbatimCopy.body', kind: 'text' },
    cta: { storeKey: 'ctaText', kind: 'cta' },
  }

  const stage = (
    <div
      data-canvas-preview-pad
      onDragOver={handleStageDragOver}
      onDrop={handleStageDrop}
    >
      <EmailDarkGradient
        headline={verbatimCopy.headline || 'Headline'}
        eyebrow={eyebrow}
        subhead={verbatimCopy.subhead}
        body={verbatimCopy.body || 'This is your body copy. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum'}
        ctaText={ctaText}
        colorStyle={colorStyle}
        alignment={alignment}
        ctaStyle={ctaStyle}
        showEyebrow={showEyebrow && !!eyebrow}
        showHeadline={showHeadline}
        showSubhead={showSubhead && !!verbatimCopy.subhead}
        showBody={showBody && !!verbatimCopy.body}
        showCta={showCta}
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
          return (
            <Editable
              templateId="email-dark-gradient"
              slotKey={blockId}
              storeKey={cfg.storeKey}
              kind={cfg.kind}
            >
              {content}
            </Editable>
          )
        }}
        renderInlineEditor={(blockId, defaultInner) => {
          const path = `email-dark-gradient.${blockId}`
          if (editingPath !== path) return defaultInner
          const isPlainText = blockId === 'eyebrow' || blockId === 'cta'
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
      />
    </div>
  )

  return (
    <CanvasEditorProvider mode="edit">
      <VisibilityRegistryProvider
        slots={getEmailDarkGradientSlots({
          showEyebrow, showHeadline, showSubhead, showBody, showCta,
          setShowEyebrow, setShowHeadline, setShowSubhead, setShowBody, setShowCta,
        })}
      >
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
                header={header}
                bench={<BenchSlot />}
                stageBar={stageBar}
                actionRow={actionRow}
              >
                {stage}
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

/**
 * BenchSlot — renders one BenchChip per hidden visibility slot. Drag wiring
 * matches the legacy Bench: writes the slot path into a custom MIME so the
 * Stage drop target can restore the slot.
 *
 * Bench is empty when no slots are hidden — that's intentional. The label
 * above the rail is a visual anchor that always renders.
 */
function BenchSlot() {
  const slots = useVisibilitySlots()
  const hidden = slots.filter((s) => s.isHidden)

  return (
    <>
      <span className="font-mono text-[10px] uppercase tracking-wider text-content-secondary mb-1">
        Bench
      </span>
      {hidden.map((slot) => {
        const chipKind = ICON_KIND_TO_CHIP_KIND[slot.iconKey ?? 'generic']
        return (
          <BenchChip
            key={slot.path}
            kind={chipKind}
            label={slot.label}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData(SLOT_DRAG_MIME, slot.path)
              e.dataTransfer.setData('text/plain', slot.path)
            }}
          />
        )
      })}
    </>
  )
}
