'use client'

import { useStore } from '@/store'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  WebsiteFloatingBannerMobile,
  floatingBannerMobileVariantSwatch,
  type WebsiteFloatingBannerMobileBlockId,
  type FloatingBannerMobileVariant,
  type FloatingBannerMobileArrowType,
} from '../../templates/WebsiteFloatingBannerMobile'
import type { EnumOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for website-floating-banner-mobile.
 *
 * Track 2. Mobile floater. Editable: eyebrow / headline / cta. Stage
 * bar: 7-swatch variant + 2-option arrow-style enum. When `arrowType`
 * is 'arrow', the CTA renders as an icon-only chevron and the CTA text
 * value is no longer rendered.
 */

const VARIANTS: FloatingBannerMobileVariant[] = [
  'light', 'orange', 'dark',
  'blue-gradient-1', 'blue-gradient-2', 'dark-gradient-1', 'dark-gradient-2',
]
const VARIANT_OPTIONS: EnumOption[] = VARIANTS.map((v) => ({
  value: v,
  ariaLabel: v.replace(/-/g, ' '),
  swatch: floatingBannerMobileVariantSwatch(v),
}))

const ARROW_OPTIONS: EnumOption[] = [
  { value: 'text', label: 'Text', ariaLabel: 'Text CTA' },
  { value: 'arrow', label: 'Arrow only', ariaLabel: 'Arrow-only CTA' },
]

export const WebsiteFloatingBannerMobileStageBench =
  defineStageBenchAdapter<WebsiteFloatingBannerMobileBlockId>({
    templateId: 'website-floating-banner-mobile',
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
        size: { default: 18, min: 12, max: 32, step: 1 },
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
      { id: 'variant', kind: 'enum', label: 'variant', options: VARIANT_OPTIONS },
      { id: 'arrowType', kind: 'enum', label: 'arrow', options: ARROW_OPTIONS },
    ],
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
      const showCta = useStore((s) => s.showCta)
      const setShowCta = useStore((s) => s.setShowCta)

      const variant = useStore((s) => s.floatingBannerMobileVariant)
      const setVariant = useStore((s) => s.setFloatingBannerMobileVariant)
      const arrowType = useStore((s) => s.floatingBannerMobileArrowType)
      const setArrowType = useStore((s) => s.setFloatingBannerMobileArrowType)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

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
          cta: {
            value: ctaText,
            visible: showCta,
            setValue: setCtaText,
            setVisible: setShowCta,
          },
        },
        stageBar: {
          variant: { value: variant, set: (v) => setVariant(v as FloatingBannerMobileVariant) },
          arrowType: { value: arrowType, set: (v) => setArrowType(v as FloatingBannerMobileArrowType) },
        },
        extras: { variant, arrowType },
      }
    },
    renderTemplate: (ctx) => (
      <WebsiteFloatingBannerMobile
        eyebrow={ctx.textOf('eyebrow')}
        headline={ctx.textOf('headline')}
        cta={ctx.textOf('cta')}
        variant={ctx.extras.variant as FloatingBannerMobileVariant}
        arrowType={ctx.extras.arrowType as FloatingBannerMobileArrowType}
        showEyebrow={ctx.visibilityOf('eyebrow')}
        showHeadline={ctx.visibilityOf('headline')}
        showCta={ctx.visibilityOf('cta')}
        headlineFontSize={ctx.fontSizeOf('headline')}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderOverlay={ctx.renderOverlay}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
      />
    ),
  })
