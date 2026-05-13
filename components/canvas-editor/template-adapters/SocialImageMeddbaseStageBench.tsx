'use client'

import { useStore } from '@/store'
import type { ImageLayout } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  SocialImageMeddbase,
  type SocialImageMeddbaseBlockId,
} from '../../templates/SocialImageMeddbase'

/**
 * Stage & Bench adapter for social-image-meddbase (factory-driven).
 *
 * Meddbase-branded variant of social-image. Same 7-slot structure +
 * universal image bindings, minus the theme toggle (always white).
 *
 * Layout selector translates the substrate's universal `image|even|text`
 * vocabulary to the template-native `more-image|even|more-text` at the
 * adapter boundary.
 */

const IMAGE_PLACEHOLDER = '/assets/images/default_placeholder_image_1.png'

export const SocialImageMeddbaseStageBench = defineStageBenchAdapter<SocialImageMeddbaseBlockId>({
  templateId: 'social-image-meddbase',
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
      size: { default: 84, min: 40, max: 140, step: 4 },
    },
    {
      blockId: 'subhead',
      label: 'Subhead',
      iconKey: 'subhead',
      chipKind: 'subheadline',
      kind: 'text',
      content: { format: 'html', placeholder: 'Subheadline' },
      size: { default: 36, min: 20, max: 48, step: 2 },
    },
    {
      blockId: 'metadata',
      label: 'Small Caption',
      iconKey: 'small-caption',
      chipKind: 'small-caption',
      kind: 'text',
      content: { format: 'plain', singleLine: true, placeholder: 'Small Caption' },
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
  contentStack: { templateKey: 'social-image-meddbase' },
  useStoreBindings: () => {
    const verbatimCopy = useStore((s) => s.verbatimCopy)
    const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
    const metadata = useStore((s) => s.metadata)
    const setMetadata = useStore((s) => s.setMetadata)
    const ctaText = useStore((s) => s.ctaText)
    const setCtaText = useStore((s) => s.setCtaText)

    const showHeadline = useStore((s) => s.showHeadline)
    const showSubhead = useStore((s) => s.showSubhead)
    const setShowSubhead = useStore((s) => s.setShowSubhead)
    const showMetadata = useStore((s) => s.showMetadata)
    const setShowMetadata = useStore((s) => s.setShowMetadata)
    const showCta = useStore((s) => s.showCta)
    const setShowCta = useStore((s) => s.setShowCta)
    const showSolutionSet = useStore((s) => s.showSolutionSet)
    const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)

    const solution = useStore((s) => s.solution)
    const setSolution = useStore((s) => s.setSolution)
    const layout = useStore((s) => s.layout)
    const setLayout = useStore((s) => s.setLayout)
    const grayscale = useStore((s) => s.grayscale)

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
    const subheadFontSize = useStore((s) => s.subheadFontSize)
    const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['social-image-meddbase'] ?? {})
    const setTemplateGap = useStore((s) => s.setTemplateGap)

    const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
    const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
    const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
    const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)

    const raw = thumbnailImageSettings['social-image-meddbase']
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
      layout === 'more-image' ? 600 :
      layout === 'more-text' ? 376 : 488

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
        subhead: {
          value: verbatimCopy.subhead || '',
          visible: showSubhead,
          fontSize: subheadFontSize ?? undefined,
          setValue: (v) => setVerbatimCopy({ subhead: v }),
          setVisible: setShowSubhead,
          setFontSize: setSubheadFontSize,
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
        image: {},
      },
      stageBar: {
        layout: { value: layoutView, set: setLayoutFromView },
        stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
      },
      image: {
        url: thumbnailImageUrl ?? undefined,
        position,
        zoom,
        filters,
        setUrl: setThumbnailImageUrl,
        setSettings: (next) => setThumbnailImageSettings('social-image-meddbase', next),
        frameWidth,
        frameHeight: 628,
      },
      category: {
        value: solution,
        set: setSolution,
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('social-image-meddbase', key, value),
      },
      extras: { layout, grayscale, solution },
    }
  },
  renderTemplate: (ctx) => {
    const layout = ctx.extras.layout as ImageLayout
    const grayscale = ctx.extras.grayscale as boolean
    const solution = ctx.extras.solution as string
    const showSolution = ctx.visibilityOf('solutionPill')
    return (
      <SocialImageMeddbase
        headline={ctx.textOf('headline')}
        subhead={ctx.textOf('subhead')}
        metadata={ctx.textOf('metadata')}
        ctaText={ctx.textOf('cta')}
        imageUrl={ctx.image?.url ?? IMAGE_PLACEHOLDER}
        imagePosition={ctx.image?.position}
        imageZoom={ctx.image?.zoom}
        imageFilters={ctx.image?.filters}
        layout={layout}
        solution={showSolution ? solution : 'none'}
        showHeadline={ctx.rawVisibilityOf('headline')}
        showSubhead={ctx.visibilityOf('subhead')}
        showMetadata={ctx.visibilityOf('metadata')}
        showCta={ctx.visibilityOf('cta')}
        showSolutionSet={showSolution}
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
