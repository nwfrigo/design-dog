'use client'

import { useStore } from '@/store'
import type { ColorStyle } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  NewsletterBlueGradient,
  type NewsletterBlueGradientBlockId,
} from '../../templates/NewsletterBlueGradient'
import type { ColorOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for newsletter-blue-gradient (factory-driven).
 *
 * 640×179 newsletter banner. Editable: eyebrow / headline / subhead / cta
 * + image slot. Stage-bar: 4-swatch color selector, layout (text|even|image
 * via `newsletterImageSize`), content-stack alignment.
 *
 * Structural twin of NewsletterDarkGradient / NewsletterLight — same slots,
 * same store fields, swatches differ.
 */

const COLOR_STYLE_OPTIONS: ColorOption[] = [
  { value: '1', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-blue-gradient-1.png)' }, ariaLabel: 'Color 1' },
  { value: '2', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-blue-gradient-2.png)' }, ariaLabel: 'Color 2' },
  { value: '3', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-blue-gradient-3.png)' }, ariaLabel: 'Color 3' },
  { value: '4', swatch: { backgroundImage: 'url(/assets/backgrounds/newsletter-blue-gradient-4.png)' }, ariaLabel: 'Color 4' },
]

const IMAGE_PLACEHOLDER = '/placeholder-mountain.jpg'

export const NewsletterBlueGradientStageBench = defineStageBenchAdapter<NewsletterBlueGradientBlockId>({
  templateId: 'newsletter-blue-gradient',
  slots: [
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
      size: { default: 24, min: 14, max: 40, step: 2 },
    },
    {
      blockId: 'subhead',
      label: 'Subhead',
      iconKey: 'subhead',
      chipKind: 'subheadline',
      kind: 'text',
      content: { format: 'html', placeholder: 'Subheadline' },
      size: { default: 12, min: 10, max: 20, step: 1 },
    },
    {
      blockId: 'cta',
      label: 'CTA',
      iconKey: 'cta',
      kind: 'cta',
      content: { format: 'plain', placeholder: 'Call to Action' },
    },
    { blockId: 'image', label: 'Image', iconKey: 'image', kind: 'image', benchable: false },
  ],
  stageBar: [
    { id: 'colorStyle', kind: 'color-4', label: 'color', options: COLOR_STYLE_OPTIONS },
    { id: 'layout', kind: 'layout', label: 'layout' },
    { id: 'stackAlign', kind: 'stack', label: 'content stack' },
  ],
  image: { blockId: 'image', placeholderSrc: IMAGE_PLACEHOLDER },
  contentStack: { templateKey: 'newsletter-blue-gradient', maxGap: 48 },
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
    const showCta = useStore((s) => s.showCta)
    const setShowCta = useStore((s) => s.setShowCta)

    const colorStyle = useStore((s) => s.colorStyle)
    const setColorStyle = useStore((s) => s.setColorStyle)
    const grayscale = useStore((s) => s.grayscale)

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
    const subheadFontSize = useStore((s) => s.subheadFontSize)
    const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

    const newsletterImageSize = useStore((s) => s.newsletterImageSize)
    const setNewsletterImageSize = useStore((s) => s.setNewsletterImageSize)
    const newsletterImageUrl = useStore((s) => s.newsletterImageUrl)
    const setNewsletterImageUrl = useStore((s) => s.setNewsletterImageUrl)
    const newsletterImagePosition = useStore((s) => s.newsletterImagePosition)
    const setNewsletterImagePosition = useStore((s) => s.setNewsletterImagePosition)
    const newsletterImageZoom = useStore((s) => s.newsletterImageZoom)
    const setNewsletterImageZoom = useStore((s) => s.setNewsletterImageZoom)
    const newsletterImageFilters = useStore((s) => s.newsletterImageFilters) ?? NEUTRAL_FILTERS
    const setNewsletterImageFilters = useStore((s) => s.setNewsletterImageFilters)

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['newsletter-blue-gradient'] ?? {})
    const setTemplateGap = useStore((s) => s.setTemplateGap)

    const layoutView: 'image' | 'even' | 'text' =
      newsletterImageSize === 'none' ? 'text' :
      newsletterImageSize === 'small' ? 'even' : 'image'
    const setLayoutFromView = (next: unknown) => {
      const v = next as 'image' | 'even' | 'text'
      setNewsletterImageSize(v === 'text' ? 'none' : v === 'even' ? 'small' : 'large')
    }

    const frameWidth = newsletterImageSize === 'large' ? 317 : 234
    const frameHeight = newsletterImageSize === 'large' ? 179 : 132

    return {
      slotState: {
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
        cta: {
          value: ctaText,
          visible: showCta,
          setValue: setCtaText,
          setVisible: setShowCta,
        },
        image: {},
      },
      stageBar: {
        colorStyle: { value: colorStyle, set: (v) => setColorStyle(v as ColorStyle) },
        layout: { value: layoutView, set: setLayoutFromView },
        stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
      },
      image: {
        url: newsletterImageUrl ?? undefined,
        position: newsletterImagePosition,
        zoom: newsletterImageZoom,
        filters: newsletterImageFilters,
        setUrl: setNewsletterImageUrl,
        setSettings: (next) => {
          setNewsletterImagePosition(next.position)
          setNewsletterImageZoom(next.zoom)
          setNewsletterImageFilters(next.filters)
        },
        frameWidth,
        frameHeight,
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('newsletter-blue-gradient', key, value),
      },
      extras: { grayscale, colorStyle, imageSize: newsletterImageSize },
    }
  },
  renderTemplate: (ctx) => {
    const grayscale = ctx.extras.grayscale as boolean
    const colorStyle = ctx.extras.colorStyle as ColorStyle
    const imageSize = ctx.extras.imageSize as 'none' | 'small' | 'large'
    return (
      <NewsletterBlueGradient
        eyebrow={ctx.textOf('eyebrow')}
        headline={ctx.textOf('headline')}
        subhead={ctx.textOf('subhead')}
        ctaText={ctx.textOf('cta')}
        colorStyle={colorStyle}
        imageSize={imageSize}
        imageUrl={ctx.image?.url ?? null}
        imagePosition={ctx.image?.position}
        imageZoom={ctx.image?.zoom}
        imageFilters={ctx.image?.filters}
        showEyebrow={ctx.visibilityOf('eyebrow')}
        showHeadline={ctx.visibilityOf('headline')}
        showSubhead={ctx.visibilityOf('subhead')}
        showCta={ctx.visibilityOf('cta')}
        grayscale={grayscale}
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
