'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'
import type { TemplateTheme } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  NewsletterLight,
  type NewsletterLightBlockId,
} from '../../templates/NewsletterLight'

/**
 * Stage & Bench adapter for newsletter-light (factory-driven).
 *
 * 640×179 newsletter banner. Editable: eyebrow / headline / subhead / cta
 * + image slot. Stage-bar: theme toggle (light|dark), layout
 * (text|even|image via `newsletterImageSize`), content-stack alignment.
 *
 * Differs from NewsletterBlueGradient / NewsletterDarkGradient by replacing
 * the 4-swatch color selector with a binary theme toggle.
 */

const IMAGE_PLACEHOLDER = '/placeholder-mountain.jpg'

export const NewsletterLightStageBench = defineStageBenchAdapter<NewsletterLightBlockId>({
  templateId: 'newsletter-light',
  slots: [
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
      size: { default: 24, min: 14, max: 40, step: 2 },
    },
    {
      blockId: 'subhead',
      label: 'Subhead',
      iconKey: 'subhead',
      chipKind: 'subheadline',
      kind: 'text',
      content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.subhead },
      size: { default: 12, min: 10, max: 20, step: 1 },
    },
    {
      blockId: 'cta',
      label: 'CTA',
      iconKey: 'cta',
      kind: 'cta',
      content: { format: 'plain', placeholder: SLOT_PLACEHOLDERS.cta },
    },
    { blockId: 'image', label: 'Image', iconKey: 'image', kind: 'image', benchable: false },
  ],
  stageBar: [
    { id: 'theme', kind: 'theme', label: 'theme' },
    { id: 'layout', kind: 'layout', label: 'layout' },
    { id: 'stackAlign', kind: 'stack', label: 'content stack' },
  ],
  image: { blockId: 'image', placeholderSrc: IMAGE_PLACEHOLDER },
  contentStack: { templateKey: 'newsletter-light', maxGap: 48 },
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

    const theme = useStore((s) => s.theme)
    const setTheme = useStore((s) => s.setTheme)
    const grayscale = useStore((s) => s.grayscale)

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
    const subheadFontSize = useStore((s) => s.subheadFontSize)
    const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

    const newsletterImageSize = useStore((s) => s.newsletterImageSize)
    const setNewsletterImageSize = useStore((s) => s.setNewsletterImageSize)
    const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
    const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
    const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
    const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
    const raw = thumbnailImageSettings['newsletter-light']
    const position = raw?.position ?? { x: 0, y: 0 }
    const zoom = raw?.zoom ?? 1
    const filters = raw?.filters ?? NEUTRAL_FILTERS

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['newsletter-light'] ?? {})
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
        theme: { value: theme, set: (v) => setTheme(v as TemplateTheme) },
        layout: { value: layoutView, set: setLayoutFromView },
        stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
      },
      image: {
        url: thumbnailImageUrl ?? undefined,
        position,
        zoom,
        filters,
        setUrl: setThumbnailImageUrl,
        setSettings: (next) => setThumbnailImageSettings('newsletter-light', next),
        frameWidth,
        frameHeight,
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('newsletter-light', key, value),
      },
      extras: { grayscale, theme, imageSize: newsletterImageSize },
    }
  },
  renderTemplate: (ctx) => {
    const grayscale = ctx.extras.grayscale as boolean
    const theme = ctx.extras.theme as TemplateTheme
    const imageSize = ctx.extras.imageSize as 'none' | 'small' | 'large'
    return (
      <NewsletterLight
        eyebrow={ctx.textOf('eyebrow')}
        headline={ctx.textOf('headline')}
        subhead={ctx.textOf('subhead')}
        ctaText={ctx.textOf('cta')}
        theme={theme}
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
