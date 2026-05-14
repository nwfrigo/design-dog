'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'
import type { ImageVariant, TemplateTheme } from '@/types'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  WebsiteReport,
  type WebsiteReportBlockId,
  type ReportVariant,
} from '../../templates/WebsiteReport'

/**
 * Stage & Bench adapter for website-report (factory-driven).
 *
 * Track 2. Report card. Editable: eyebrow / headline / subhead / cta +
 * solutionPill + image. Stage bar: theme, layout-2 (image|text), and
 * content-stack alignment.
 */

const IMAGE_PLACEHOLDER = '/assets/images/safer_is_stronger_sample_page.png'

export const WebsiteReportStageBench =
  defineStageBenchAdapter<WebsiteReportBlockId>({
    templateId: 'website-report',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      { blockId: 'solutionPill', label: 'Category', iconKey: 'category', chipKind: 'category', kind: 'pill' },
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
        size: { default: 38, min: 24, max: 60, step: 2 },
      },
      {
        blockId: 'subhead',
        label: 'Subhead',
        iconKey: 'subhead',
        chipKind: 'subheadline',
        kind: 'text',
        content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.subhead },
        size: { default: 18, min: 12, max: 28, step: 1 },
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
      { id: 'layout', kind: 'layout-2', label: 'layout' },
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
    contentStack: { templateKey: 'website-report', maxGap: 96 },
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
      const showSubhead = useStore((s) => s.showSubhead)
      const setShowSubhead = useStore((s) => s.setShowSubhead)
      const showCta = useStore((s) => s.showCta)
      const setShowCta = useStore((s) => s.setShowCta)
      const showSolutionSet = useStore((s) => s.showSolutionSet)
      const setShowSolutionSet = useStore((s) => s.setShowSolutionSet)

      const solution = useStore((s) => s.solution)
      const setSolution = useStore((s) => s.setSolution)
      const theme = useStore((s) => s.theme)
      const setTheme = useStore((s) => s.setTheme)
      const reportVariant = useStore((s) => s.reportVariant)
      const setReportVariant = useStore((s) => s.setReportVariant)
      const grayscale = useStore((s) => s.grayscale)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
      const subheadFontSize = useStore((s) => s.subheadFontSize)
      const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

      const stackAlign = useStore((s) => s.stackAlign)
      const setStackAlign = useStore((s) => s.setStackAlign)
      const gaps = useStore((s) => s.templateGaps['website-report'] ?? {})
      const setTemplateGap = useStore((s) => s.setTemplateGap)

      const thumbnailImageUrl = useStore((s) => s.thumbnailImageUrl)
      const setThumbnailImageUrl = useStore((s) => s.setThumbnailImageUrl)
      const thumbnailImageSettings = useStore((s) => s.thumbnailImageSettings)
      const setThumbnailImageSettings = useStore((s) => s.setThumbnailImageSettings)
      const raw = thumbnailImageSettings['website-report']
      const position = raw?.position ?? { x: 0, y: 0 }
      const zoom = raw?.zoom ?? 1
      const filters = raw?.filters ?? NEUTRAL_FILTERS

      const layoutView: 'image' | 'text' = reportVariant === 'image' ? 'image' : 'text'
      const setLayoutFromView = (next: unknown) => {
        const v = next as 'image' | 'text'
        setReportVariant((v === 'image' ? 'image' : 'none') as ImageVariant)
      }

      return {
        slotState: {
          logo: {},
          solutionPill: {
            visible: showSolutionSet,
            setVisible: setShowSolutionSet,
          },
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
          setSettings: (next) => setThumbnailImageSettings('website-report', next),
          frameWidth: 320,
          frameHeight: 386,
        },
        category: {
          value: solution,
          set: setSolution,
        },
        contentStack: {
          stackAlign,
          setStackAlign,
          gaps,
          setGap: (key, value) => setTemplateGap('website-report', key, value),
        },
        extras: { theme, reportVariant: reportVariant as ReportVariant, grayscale, solution },
      }
    },
    renderTemplate: (ctx) => {
      const theme = ctx.extras.theme as TemplateTheme
      const variant = ctx.extras.reportVariant as ReportVariant
      const grayscale = ctx.extras.grayscale as boolean
      const solution = ctx.extras.solution as string
      const showSolution = ctx.visibilityOf('solutionPill')
      return (
        <WebsiteReport
          eyebrow={ctx.textOf('eyebrow')}
          headline={ctx.textOf('headline')}
          subhead={ctx.textOf('subhead')}
          cta={ctx.textOf('cta')}
          solution={showSolution ? solution : 'none'}
          variant={variant}
          imageUrl={ctx.image?.url}
          imagePosition={ctx.image?.position}
          imageZoom={ctx.image?.zoom}
          imageFilters={ctx.image?.filters}
          showEyebrow={ctx.visibilityOf('eyebrow')}
          showHeadline={ctx.rawVisibilityOf('headline')}
          showSubhead={ctx.visibilityOf('subhead')}
          showCta={ctx.visibilityOf('cta')}
          grayscale={grayscale}
          theme={theme}
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
