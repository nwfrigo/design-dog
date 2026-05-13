'use client'

import { useStore } from '@/store'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  WebsiteFloatingBanner,
  floatingBannerVariantSwatch,
  type WebsiteFloatingBannerBlockId,
  type FloatingBannerVariant,
} from '../../templates/WebsiteFloatingBanner'
import type { EnumOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for website-floating-banner.
 *
 * Track 2. 2256×100 desktop floater. Editable: eyebrow / headline / cta
 * (logo is brand-locked, colored per variant). Stage bar exposes the
 * 7-swatch variant selector.
 */

const VARIANTS: FloatingBannerVariant[] = [
  'white', 'orange', 'dark',
  'blue-gradient-1', 'blue-gradient-2', 'dark-gradient-1', 'dark-gradient-2',
]
const VARIANT_OPTIONS: EnumOption[] = VARIANTS.map((v) => ({
  value: v,
  ariaLabel: v.replace(/-/g, ' '),
  swatch: floatingBannerVariantSwatch(v),
}))

export const WebsiteFloatingBannerStageBench =
  defineStageBenchAdapter<WebsiteFloatingBannerBlockId>({
    templateId: 'website-floating-banner',
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
        size: { default: 28, min: 18, max: 48, step: 2 },
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

      const variant = useStore((s) => s.floatingBannerVariant)
      const setVariant = useStore((s) => s.setFloatingBannerVariant)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

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
          cta: {
            value: ctaText,
            visible: showCta,
            setValue: setCtaText,
            setVisible: setShowCta,
          },
        },
        stageBar: {
          variant: { value: variant, set: (v) => setVariant(v as FloatingBannerVariant) },
        },
        extras: { variant },
      }
    },
    renderTemplate: (ctx) => (
      <WebsiteFloatingBanner
        eyebrow={ctx.textOf('eyebrow')}
        headline={ctx.textOf('headline')}
        cta={ctx.textOf('cta')}
        variant={ctx.extras.variant as FloatingBannerVariant}
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
