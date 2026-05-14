'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'
import type { ColorStyle, TextAlignment, HeadingSize, CtaStyle, LogoColor } from '@/types'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  SocialDarkGradient,
  type SocialDarkGradientBlockId,
} from '../../templates/SocialDarkGradient'
import type { ColorOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for social-dark-gradient (factory-driven).
 *
 * Tier-1 social template. Same 6 editable blocks + logo topAnchor as
 * social-blue-gradient, plus a logoColor toggle (orange / white) since
 * dark backgrounds work with both.
 */

const LOGO_COLOR_OPTIONS: ColorOption[] = [
  { value: 'white',  swatch: { backgroundColor: '#FFFFFF' }, ariaLabel: 'White logo' },
  { value: 'orange', swatch: { backgroundColor: '#D35F0B' }, ariaLabel: 'Orange logo' },
]

const COLOR_STYLE_OPTIONS: ColorOption[] = [
  { value: '1', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-1.png)' }, ariaLabel: 'Color 1' },
  { value: '2', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-2.png)' }, ariaLabel: 'Color 2' },
  { value: '3', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-3.png)' }, ariaLabel: 'Color 3' },
  { value: '4', swatch: { backgroundImage: 'url(/assets/backgrounds/social-dark-gradient-4.png)' }, ariaLabel: 'Color 4' },
]

export const SocialDarkGradientStageBench = defineStageBenchAdapter<SocialDarkGradientBlockId>({
  templateId: 'social-dark-gradient',
  slots: [
    { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
    {
      blockId: 'eyebrow',
      label: 'Eyebrow',
      iconKey: 'eyebrow',
      chipKind: 'eyebrow',
      kind: 'text',
      content: { format: 'plain', singleLine: true, placeholder: SLOT_PLACEHOLDERS.eyebrow },
    },
    {
      blockId: 'headline',
      label: 'Headline',
      iconKey: 'headline',
      kind: 'text',
      content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.headline },
      size: { default: 84, min: 40, max: 140, step: 4 },
    },
    {
      blockId: 'subhead',
      label: 'Subhead',
      iconKey: 'subhead',
      chipKind: 'subheadline',
      kind: 'text',
      content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.subhead },
      size: { default: 36, min: 20, max: 48, step: 2 },
    },
    {
      blockId: 'body',
      label: 'Body',
      iconKey: 'body',
      chipKind: 'body',
      kind: 'text',
      content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.body },
    },
    {
      blockId: 'metadata',
      label: 'Small Caption',
      iconKey: 'small-caption',
      chipKind: 'small-caption',
      kind: 'text',
      content: { format: 'plain', singleLine: true, placeholder: SLOT_PLACEHOLDERS.metadata },
    },
    {
      blockId: 'cta',
      label: 'CTA',
      iconKey: 'cta',
      kind: 'cta',
      content: { format: 'plain', placeholder: SLOT_PLACEHOLDERS.cta },
    },
  ],
  stageBar: [
    { id: 'colorStyle', kind: 'color-4', label: 'color', options: COLOR_STYLE_OPTIONS },
    { id: 'stackAlign', kind: 'stack', label: 'content stack' },
    { id: 'alignment', kind: 'alignment', label: 'alignment' },
    { id: 'logoColor', kind: 'color-2', label: 'logo', options: LOGO_COLOR_OPTIONS },
  ],
  contentStack: { templateKey: 'social-dark-gradient', maxGap: 96 },
  useStoreBindings: () => {
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

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['social-dark-gradient'] ?? {})
    const setTemplateGap = useStore((s) => s.setTemplateGap)

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
        metadata: {
          value: metadata,
          visible: showMetadata,
          setValue: setMetadata,
          setVisible: setShowMetadata,
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
        logoColor: { value: logoColor, set: (v) => setLogoColor(v as LogoColor) },
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('social-dark-gradient', key, value),
      },
      extras: { colorStyle, headingSize, ctaStyle, alignment, logoColor },
    }
  },
  renderTemplate: (ctx) => {
    const colorStyle = ctx.extras.colorStyle as ColorStyle
    const headingSize = ctx.extras.headingSize as HeadingSize
    const ctaStyle = ctx.extras.ctaStyle as CtaStyle
    const alignment = ctx.extras.alignment as TextAlignment
    const logoColor = ctx.extras.logoColor as LogoColor
    return (
      <SocialDarkGradient
        eyebrow={ctx.textOf('eyebrow')}
        headline={ctx.textOf('headline')}
        subhead={ctx.textOf('subhead')}
        body={ctx.textOf('body')}
        metadata={ctx.textOf('metadata')}
        ctaText={ctx.textOf('cta')}
        colorStyle={colorStyle}
        headingSize={headingSize}
        alignment={alignment}
        ctaStyle={ctaStyle}
        logoColor={logoColor === 'orange' ? 'orange' : 'white'}
        showEyebrow={ctx.visibilityOf('eyebrow')}
        showHeadline={ctx.visibilityOf('headline')}
        showSubhead={ctx.visibilityOf('subhead')}
        showBody={ctx.visibilityOf('body')}
        showMetadata={ctx.visibilityOf('metadata')}
        showCta={ctx.visibilityOf('cta')}
        headlineFontSize={ctx.fontSizeOf('headline')}
        subheadFontSize={ctx.fontSizeOf('subhead')}
        stackAlign={ctx.stackAlign}
        gaps={ctx.gaps}
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
