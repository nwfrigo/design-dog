'use client'

import { useStore } from '@/store'
import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  SocialEhsAccelerate,
  type SocialEhsAccelerateBlockId,
} from '../../templates/SocialEhsAccelerate'

/**
 * Stage & Bench adapter for social-ehs-accelerate (factory-driven).
 *
 * Smallest social: headline / subhead / cta. Logo lockup is a brand-locked
 * topAnchor (cority + EHS+ ACCELERATE + workshop label, all baked in).
 * Background image is baked in too — no theme / color / layout selectors.
 * The only stage-bar control is content-stack alignment.
 */

export const SocialEhsAccelerateStageBench = defineStageBenchAdapter<SocialEhsAccelerateBlockId>({
  templateId: 'social-ehs-accelerate',
  slots: [
    {
      blockId: 'logo',
      label: 'Logo',
      iconKey: 'logo',
      kind: 'image',
      benchable: false,
    },
    {
      blockId: 'headline',
      label: 'Headline',
      iconKey: 'headline',
      kind: 'text',
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
      blockId: 'cta',
      label: 'CTA',
      iconKey: 'cta',
      kind: 'cta',
      content: { format: 'plain', placeholder: 'Call to action' },
    },
  ],
  stageBar: [
    { id: 'stackAlign', kind: 'stack', label: 'content stack' },
  ],
  contentStack: { templateKey: 'social-ehs-accelerate' },
  useStoreBindings: () => {
    const verbatimCopy = useStore((s) => s.verbatimCopy)
    const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
    const ctaText = useStore((s) => s.ctaText)
    const setCtaText = useStore((s) => s.setCtaText)

    const showHeadline = useStore((s) => s.showHeadline)
    const setShowHeadline = useStore((s) => s.setShowHeadline)
    const showSubhead = useStore((s) => s.showSubhead)
    const setShowSubhead = useStore((s) => s.setShowSubhead)
    const showCta = useStore((s) => s.showCta)
    const setShowCta = useStore((s) => s.setShowCta)

    const headlineFontSize = useStore((s) => s.headlineFontSize)
    const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)
    const subheadFontSize = useStore((s) => s.subheadFontSize)
    const setSubheadFontSize = useStore((s) => s.setSubheadFontSize)

    const stackAlign = useStore((s) => s.stackAlign)
    const setStackAlign = useStore((s) => s.setStackAlign)
    const gaps = useStore((s) => s.templateGaps['social-ehs-accelerate'] ?? {})
    const setTemplateGap = useStore((s) => s.setTemplateGap)

    return {
      slotState: {
        logo: {},
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
      },
      stageBar: {
        stackAlign: { value: stackAlign, set: setStackAlign as (v: unknown) => void },
      },
      contentStack: {
        stackAlign,
        setStackAlign,
        gaps,
        setGap: (key, value) => setTemplateGap('social-ehs-accelerate', key, value),
      },
    }
  },
  renderTemplate: (ctx) => (
    <SocialEhsAccelerate
      headline={ctx.textOf('headline')}
      subhead={ctx.textOf('subhead')}
      ctaText={ctx.textOf('cta')}
      showHeadline={ctx.visibilityOf('headline')}
      showSubhead={ctx.visibilityOf('subhead')}
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
  ),
})
