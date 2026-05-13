'use client'

import { useStore } from '@/store'
import type { ImageLayout } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailImage,
  type EmailImageBlockId,
} from '../../templates/EmailImage'

/**
 * Stage & Bench adapter for email-image (factory-driven).
 *
 * 640×300 email banner. Editable: headline / body / cta + solution pill +
 * image. Logo is a brand-locked anchor. Stage-bar: theme, layout
 * (image|even|text via `LayoutVariant`), content-stack alignment.
 *
 * Uses the universal `thumbnailImage*` model and the
 * `thumbnailImageSettings['email-image']` slot for per-template image
 * crop / zoom / filters.
 */

const IMAGE_PLACEHOLDER = '/assets/images/default_placeholder_image_1.png'

export const EmailImageStageBench = defineStageBenchAdapter<EmailImageBlockId>({
  templateId: 'email-image',
  slots: [
    { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
    { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
    {
      blockId: 'headline',
      label: 'Headline',
      iconKey: 'headline',
      kind: 'text',
      benchable: false,
      content: { format: 'html', placeholder: 'Headline' },
      size: { default: 38, min: 24, max: 60, step: 2 },
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
      content: { format: 'plain', placeholder: 'Learn more' },
    },
    { blockId: 'image', label: 'Image', iconKey: 'image', kind: 'image', benchable: false },
  ],
  stageBar: [
    { id: 'theme', kind: 'theme', label: 'theme' },
    { id: 'layout', kind: 'layout', label: 'layout' },
    { id: 'stackAlign', kind: 'stack', label: 'content stack' },
  ],
  image: { blockId: 'image', placeholderSrc: IMAGE_PLACEHOLDER },
  category: {
    blockId: 'solutionPill',
    options: (colors) =>
      Object.entries(colors.solutions)
        .filter(([key]) => key !== 'none')
        .map(([key, cfg]) => ({ value: key, label: cfg.label, color: cfg.color })),
  },
  contentStack: { templateKey: 'email-image' },
  useStoreBindings: () => {
    const verbatimCopy = useStore((s) => s.verbatimCopy)
    const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
    const ctaText = useStore((s) => s.ctaText)
    const setCtaText = useStore((s) => s.setCtaText)

    const showHeadline = useStore((s) => s.showHeadline)
    const showBody = useStore((s) => s.showBody)
    const setShowBody = useStore((s) => s.setShowBody)
    const showCta = useStore((s) => s.showCta)
    const setShowCta = useStore((s) => s.setShowCta)
    const showSolutionSet = useStore((s) => s.showSolutionSet)
    const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)

    const solution = useStore((s) => s.solution)
    const setSolution = useStore((s) => s.setSolution)
    const theme = useStore((s) => s.theme)
    const setTheme = useStore((s) => s.setTheme)
    const layout = useStore((s) => s.layout)
    const setLayout = useStore((s) => s.setLayout)
    const grayscale = useStore((s) => s.grayscale)

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['email-image'] ?? {})
    const setTemplateGap = useStore((s) => s.setTemplateGap)

    const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
    const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
    const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
    const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)

    const raw = thumbnailImageSettings['email-image']
    const position = raw?.position ?? { x: 0, y: 0 }
    const zoom = raw?.zoom ?? 1
    const filters = raw?.filters ?? NEUTRAL_FILTERS

    const layoutView: 'image' | 'even' | 'text' =
      layout === 'more-text' ? 'text' :
      layout === 'more-image' ? 'image' : 'even'
    const setLayoutFromView = (next: unknown) => {
      const v = next as 'image' | 'even' | 'text'
      setLayout((v === 'text' ? 'more-text' : v === 'image' ? 'more-image' : 'even') as ImageLayout)
    }

    const frameWidth =
      layout === 'more-image' ? 320 :
      layout === 'more-text' ? 180 : 250

    return {
      slotState: {
        logo: {},
        solutionPill: {
          visible: showSolutionSet,
          setVisible: setShowSolutionSet,
        },
        headline: {
          value: verbatimCopy.headline || '',
          visible: showHeadline,
          fontSize: headlineFontSize ?? undefined,
          setValue: (v) => setVerbatimCopy({ headline: v }),
          setFontSize: setHeadlineFontSize,
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
        image: {},
      },
      stageBar: {
        theme: { value: theme, set: setTheme as (v: unknown) => void },
        layout: { value: layoutView, set: setLayoutFromView },
        stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
      },
      image: {
        url: thumbnailImageUrl ?? undefined,
        position,
        zoom,
        filters,
        setUrl: setThumbnailImageUrl,
        setSettings: (next) => setThumbnailImageSettings('email-image', next),
        frameWidth,
        frameHeight: 300,
      },
      category: {
        value: solution,
        set: setSolution,
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('email-image', key, value),
      },
      extras: { theme, layout, grayscale, solution },
    }
  },
  renderTemplate: (ctx) => {
    const theme = ctx.extras.theme as 'light' | 'dark'
    const layout = ctx.extras.layout as ImageLayout
    const grayscale = ctx.extras.grayscale as boolean
    const solution = ctx.extras.solution as string
    const showSolution = ctx.visibilityOf('solutionPill')
    return (
      <EmailImage
        headline={ctx.textOf('headline')}
        body={ctx.textOf('body')}
        ctaText={ctx.textOf('cta')}
        imageUrl={ctx.image?.url ?? IMAGE_PLACEHOLDER}
        imagePosition={ctx.image?.position}
        imageZoom={ctx.image?.zoom}
        imageFilters={ctx.image?.filters}
        layout={layout}
        solution={showSolution ? solution : 'none'}
        showHeadline={ctx.rawVisibilityOf('headline')}
        showBody={ctx.visibilityOf('body')}
        showCta={ctx.visibilityOf('cta')}
        showSolutionSet={showSolution}
        grayscale={grayscale}
        theme={theme}
        headlineFontSize={ctx.fontSizeOf('headline')}
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
