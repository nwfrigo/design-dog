'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'
import type { NewsletterTopBannerVariant } from '@/types'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  NewsletterTopBanner,
  type NewsletterTopBannerBlockId,
} from '../../templates/NewsletterTopBanner'

/**
 * Stage & Bench adapter for newsletter-top-banner (factory-driven).
 *
 * 600×240 newsletter header banner. Logo + 5 category chips are
 * brand-locked. Editable: eyebrow / headline / subhead. Stage bar:
 * binary dark/light theme toggle.
 *
 * All three editable slots (eyebrow / headline / subhead) are benchable.
 */

export const NewsletterTopBannerStageBench =
  defineStageBenchAdapter<NewsletterTopBannerBlockId>({
    templateId: 'newsletter-top-banner',
    slots: [
      {
        blockId: 'eyebrow',
        label: 'Eyebrow',
        iconKey: 'eyebrow',
        chipKind: 'eyebrow',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Month | Year' },
      },
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        content: { format: 'plain', placeholder: SLOT_PLACEHOLDERS.headline },
      },
      {
        blockId: 'subhead',
        label: 'Subhead',
        iconKey: 'subhead',
        chipKind: 'subheadline',
        kind: 'text',
        content: { format: 'plain', placeholder: SLOT_PLACEHOLDERS.subhead },
        size: { default: 22, min: 14, max: 32, step: 2 },
      },
    ],
    stageBar: [
      { id: 'variant', kind: 'theme', label: 'theme' },
    ],
    useStoreBindings: () => {
      const eyebrow = useStore((s) => s.eyebrow)
      const setEyebrow = useStore((s) => s.setEyebrow)
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)

      const showEyebrow = useStore((s) => s.showEyebrow)
      const setShowEyebrow = useStore((s) => s.setShowEyebrow)
      const showHeadline = useStore((s) => s.showHeadline)
      const setShowHeadline = useStore((s) => s.setShowHeadline)
      const showSubhead = useStore((s) => s.showSubhead)
      const setShowSubhead = useStore((s) => s.setShowSubhead)

      const variant = useStore((s) => s.newsletterTopBannerVariant)
      const setVariant = useStore((s) => s.setNewsletterTopBannerVariant)

      const subheadFontSize = useStore((s) => s.subheadFontSize)
      const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

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
            setValue: (v) => setVerbatimCopy({ headline: v }),
            setVisible: setShowHeadline,
          },
          subhead: {
            value: verbatimCopy.subhead || '',
            visible: showSubhead,
            fontSize: subheadFontSize ?? undefined,
            setValue: (v) => setVerbatimCopy({ subhead: v }),
            setVisible: setShowSubhead,
            setFontSize: setSubheadFontSize,
          },
        },
        stageBar: {
          variant: { value: variant, set: (v) => setVariant(v as NewsletterTopBannerVariant) },
        },
        extras: { variant },
      }
    },
    renderTemplate: (ctx) => {
      const variant = ctx.extras.variant as NewsletterTopBannerVariant
      return (
        <NewsletterTopBanner
          eyebrow={ctx.textOf('eyebrow')}
          headline={ctx.textOf('headline')}
          subhead={ctx.textOf('subhead')}
          variant={variant}
          showEyebrow={ctx.visibilityOf('eyebrow')}
          showHeadline={ctx.rawVisibilityOf('headline')}
          showSubhead={ctx.visibilityOf('subhead')}
          subheadFontSize={ctx.fontSizeOf('subhead')}
          renderBlock={ctx.renderBlock}
          renderInlineEditor={ctx.renderInlineEditor}
          renderOverlay={ctx.renderOverlay}
          colors={ctx.colors}
          typography={ctx.typography}
          scale={ctx.scale}
        />
      )
    },
  })
