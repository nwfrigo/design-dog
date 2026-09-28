'use client'

import { useStore } from '@/store'
import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import type { EnumOption } from '@/components/ui/SelectorPrimitive'
import {
  EmailCorityConnect2026,
  backgroundUrl,
  type EmailCorityConnect2026BlockId,
  type CCBackgroundVariant,
} from '../../templates/EmailCorityConnect2026'

/**
 * Stage & Bench adapter for email-cority-connect-2027 — a verbatim clone
 * of the 2026 adapter (same slots, same 16-background stage bar, same
 * shared ccBackgroundVariant store field); only the template component
 * (and with it the year lockup) differs.
 */

const BACKGROUND_VARIANTS: CCBackgroundVariant[] = [
  'dark-blue-1', 'dark-blue-2', 'dark-blue-3', 'dark-blue-4',
  'dark-orange-1', 'dark-orange-2', 'dark-orange-3', 'dark-orange-4',
  'light-blue-1', 'light-blue-2', 'light-blue-3', 'light-blue-4',
  'light-orange-1', 'light-orange-2', 'light-orange-3', 'light-orange-4',
]

const BACKGROUND_OPTIONS: EnumOption[] = BACKGROUND_VARIANTS.map((v) => ({
  value: v,
  ariaLabel: v.replace(/-/g, ' '),
  swatch: { backgroundImage: `url(${backgroundUrl(v)})` },
}))

export const EmailCorityConnect2027StageBench = defineStageBenchAdapter<EmailCorityConnect2026BlockId>({
  templateId: 'email-cority-connect-2027',
  slots: [
    { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
    {
      blockId: 'headline',
      label: 'Headline',
      iconKey: 'headline',
      kind: 'text',
      content: { format: 'html', placeholder: 'Lightweight header.' },
      size: { default: 38.15, min: 20, max: 60, step: 2 },
    },
    {
      blockId: 'body',
      label: 'Body',
      iconKey: 'body',
      chipKind: 'body',
      kind: 'text',
      content: { format: 'html' },
    },
    {
      blockId: 'cta',
      label: 'CTA',
      iconKey: 'cta',
      kind: 'cta',
      content: { format: 'plain', placeholder: 'Register' },
    },
  ],
  stageBar: [
    { id: 'background', kind: 'enum', label: 'background', options: BACKGROUND_OPTIONS },
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

    const ccBackgroundVariant = useStore((s) => s.ccBackgroundVariant)
    const setCcBackgroundVariant = useStore((s) => s.setCcBackgroundVariant)

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
        background: {
          value: ccBackgroundVariant,
          set: (v) => setCcBackgroundVariant(v as CCBackgroundVariant),
        },
      },
      extras: { ccBackgroundVariant },
    }
  },
  renderTemplate: (ctx) => {
    const backgroundVariant = ctx.extras.ccBackgroundVariant as CCBackgroundVariant
    return (
      <EmailCorityConnect2026
        year="2027"
        headline={ctx.textOf('headline')}
        body={ctx.rawTextOf('body')}
        ctaText={ctx.textOf('cta')}
        backgroundVariant={backgroundVariant}
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
    )
  },
})
