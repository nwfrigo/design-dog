'use client'

import { useStore } from '@/store'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailCorityCustomerExchangeBanner,
  type EmailCorityCustomerExchangeBannerBlockId,
  type CCEBannerColorStyle,
  CCE_BANNER_BACKGROUND_IMAGES,
} from '../../templates/EmailCorityCustomerExchangeBanner'
import type { EnumOption } from '../stage-bar/SelectorPrimitive'

/**
 * Stage & Bench adapter for email-cority-customer-exchange-banner.
 *
 * Track 2 fixed-composition. 640×300. Logo stacked lockup is brand-locked
 * inside a translucent left panel; the right column holds headline /
 * body / cta. Stage bar exposes a 4-swatch color variant.
 */

const COLOR_OPTIONS: EnumOption[] = (['1', '2', '3', '4'] as const).map((v) => ({
  value: v,
  ariaLabel: `Color ${v}`,
  swatch: { backgroundImage: `url(${CCE_BANNER_BACKGROUND_IMAGES[v]})` },
}))

export const EmailCorityCustomerExchangeBannerStageBench =
  defineStageBenchAdapter<EmailCorityCustomerExchangeBannerBlockId>({
    templateId: 'email-cority-customer-exchange-banner',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
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
        content: { format: 'plain', placeholder: 'Call to Action' },
      },
    ],
    stageBar: [
      { id: 'colorStyle', kind: 'enum', label: 'background', options: COLOR_OPTIONS },
    ],
    useStoreBindings: () => {
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
      const ctaText = useStore((s) => s.ctaText)
      const setCtaText = useStore((s) => s.setCtaText)

      const showHeadline = useStore((s) => s.showHeadline)
      const setShowHeadline = useStore((s) => s.setShowHeadline)
      const showBody = useStore((s) => s.showBody)
      const setShowBody = useStore((s) => s.setShowBody)
      const showCta = useStore((s) => s.showCta)
      const setShowCta = useStore((s) => s.setShowCta)

      const colorStyle = useStore((s) => s.colorStyle)
      const setColorStyle = useStore((s) => s.setColorStyle)

      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

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
        },
        stageBar: {
          colorStyle: { value: colorStyle, set: (v) => setColorStyle(v as CCEBannerColorStyle) },
        },
        extras: { colorStyle },
      }
    },
    renderTemplate: (ctx) => (
      <EmailCorityCustomerExchangeBanner
        headline={ctx.textOf('headline')}
        body={ctx.textOf('body')}
        ctaText={ctx.textOf('cta')}
        colorStyle={ctx.extras.colorStyle as CCEBannerColorStyle}
        showHeadline={ctx.visibilityOf('headline')}
        showBody={ctx.visibilityOf('body')}
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
