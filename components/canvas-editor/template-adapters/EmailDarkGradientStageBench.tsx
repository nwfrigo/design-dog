'use client'

import { useStore } from '@/store'
import type { ColorStyle, TextAlignment, CtaStyle } from '@/types'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailDarkGradient,
  type EmailDarkGradientBlockId,
} from '../../templates/EmailDarkGradient'
import type { ColorOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for email-dark-gradient (factory-driven).
 *
 * 640×300 dark email banner. Editable: eyebrow / headline / subhead /
 * body / cta. Logo is a brand-locked anchor. Stage-bar: 4-swatch color,
 * content-stack alignment, text alignment.
 *
 * lineHeights is a sparse record edited via per-slot toolbars (not
 * surfaced on the stage-bar); it flows through the extras → template.
 */

const COLOR_STYLE_OPTIONS: ColorOption[] = [
  { value: '1', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-1.png)' }, ariaLabel: 'Color 1' },
  { value: '2', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-2.png)' }, ariaLabel: 'Color 2' },
  { value: '3', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-3.png)' }, ariaLabel: 'Color 3' },
  { value: '4', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-4.png)' }, ariaLabel: 'Color 4' },
]

export const EmailDarkGradientStageBench = defineStageBenchAdapter<EmailDarkGradientBlockId>({
  templateId: 'email-dark-gradient',
  slots: [
    { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
    {
      blockId: 'eyebrow',
      label: 'Eyebrow',
      iconKey: 'eyebrow',
      chipKind: 'eyebrow',
      kind: 'text',
      content: { format: 'plain', singleLine: true, placeholder: 'Eyebrow' },
    },
    {
      blockId: 'headline',
      label: 'Headline',
      iconKey: 'headline',
      kind: 'text',
      content: { format: 'html', placeholder: 'Headline' },
      size: { default: 38, min: 24, max: 60, step: 2 },
    },
    {
      blockId: 'subhead',
      label: 'Subhead',
      iconKey: 'subhead',
      chipKind: 'subheadline',
      kind: 'text',
      content: { format: 'html', placeholder: 'Subheadline' },
      size: { default: 18, min: 12, max: 28, step: 1 },
    },
    {
      blockId: 'body',
      label: 'Body',
      iconKey: 'body',
      chipKind: 'body',
      kind: 'text',
      content: { format: 'html', placeholder: 'Body copy goes here.' },
    },
    {
      blockId: 'cta',
      label: 'CTA',
      iconKey: 'cta',
      kind: 'cta',
      content: { format: 'plain', placeholder: 'Call to Action' },
    },
  ],
  stageBar: [
    { id: 'colorStyle', kind: 'color-4', label: 'color', options: COLOR_STYLE_OPTIONS },
    { id: 'stackAlign', kind: 'stack', label: 'content stack' },
    { id: 'alignment', kind: 'alignment', label: 'alignment' },
  ],
  contentStack: { templateKey: 'email-dark-gradient', maxGap: 96 },
  useStoreBindings: () => {
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

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
    const subheadFontSize = useStore((s) => s.subheadFontSize)
    const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['email-dark-gradient'] ?? {})
    const setTemplateGap = useStore((s) => s.setTemplateGap)
    const lineHeights = useStore((s) => s.lineHeights)

    return {
      slotState: {
        logo: {},
        eyebrow: {
          value: eyebrow,
          visible: showEyebrow,
          setValue: setEyebrow,
          setVisible: setShowEyebrow,
        },
        headline: {
          value: verbatimCopy.headline || '',
          visible: showHeadline,
          fontSize: headlineFontSize ?? undefined,
          setValue: (v) => setVerbatimCopy({ headline: v }),
          setVisible: setShowHeadline,
          setFontSize: setHeadlineFontSize,
        },
        subhead: {
          value: verbatimCopy.subhead || '',
          visible: showSubhead,
          fontSize: subheadFontSize ?? undefined,
          setValue: (v) => setVerbatimCopy({ subhead: v }),
          setVisible: setShowSubhead,
          setFontSize: setSubheadFontSize,
        },
        body: {
          value: verbatimCopy.body || '',
          visible: showBody,
          setValue: (v) => setVerbatimCopy({ body: v }),
          setVisible: setShowBody,
        },
        cta: {
          value: ctaText,
          visible: showCta,
          setValue: setCtaText,
          setVisible: setShowCta,
        },
      },
      stageBar: {
        colorStyle: { value: colorStyle, set: (v) => setColorStyle(v as ColorStyle) },
        stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
        alignment: { value: alignment, set: (v) => setAlignment(v as TextAlignment) },
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('email-dark-gradient', key, value),
      },
      extras: { colorStyle, ctaStyle, alignment, lineHeights },
    }
  },
  renderTemplate: (ctx) => {
    const colorStyle = ctx.extras.colorStyle as ColorStyle
    const ctaStyle = ctx.extras.ctaStyle as CtaStyle
    const alignment = ctx.extras.alignment as TextAlignment
    const lineHeights = ctx.extras.lineHeights as Record<string, number>
    return (
      <EmailDarkGradient
        eyebrow={ctx.textOf('eyebrow')}
        headline={ctx.textOf('headline')}
        subhead={ctx.textOf('subhead')}
        body={ctx.textOf('body')}
        ctaText={ctx.textOf('cta')}
        colorStyle={colorStyle}
        alignment={alignment}
        ctaStyle={ctaStyle}
        showEyebrow={ctx.visibilityOf('eyebrow')}
        showHeadline={ctx.visibilityOf('headline')}
        showSubhead={ctx.visibilityOf('subhead')}
        showBody={ctx.visibilityOf('body')}
        showCta={ctx.visibilityOf('cta')}
        headlineFontSize={ctx.fontSizeOf('headline')}
        subheadFontSize={ctx.fontSizeOf('subhead')}
        stackAlign={ctx.stackAlign}
        gaps={ctx.gaps}
        lineHeights={lineHeights}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderOverlay={ctx.renderOverlay}
        renderSpacerBetween={ctx.renderSpacerBetween}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
      />
    )
  },
})
