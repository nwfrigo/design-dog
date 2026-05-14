'use client'

import { SLOT_PLACEHOLDERS } from '@/lib/slot-placeholders'

import { useStore } from '@/store'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailEhsAccelerateBanner,
  type EmailEhsAccelerateBannerBlockId,
} from '../../templates/EmailEhsAccelerateBanner'

/**
 * Stage & Bench adapter for email-ehs-accelerate-banner.
 *
 * 600×373 banner. Logo lockup is brand-locked (workshop branding baked
 * in); editable: headline / body / eventDate / eventLocation / cta.
 * No stage-bar controls.
 */

export const EmailEhsAccelerateBannerStageBench =
  defineStageBenchAdapter<EmailEhsAccelerateBannerBlockId>({
    templateId: 'email-ehs-accelerate-banner',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      {
        blockId: 'headline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        benchable: false,
        content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.headline },
        size: { default: 38, min: 24, max: 60, step: 2 },
      },
      {
        blockId: 'body',
        label: 'Body',
        iconKey: 'body',
        chipKind: 'body',
        kind: 'text',
        content: { format: 'html', placeholder: SLOT_PLACEHOLDERS.body },
      },
      {
        blockId: 'eventDate',
        label: 'Date',
        iconKey: 'date',
        chipKind: 'date',
        kind: 'text',
        benchable: false,
        content: { format: 'plain', singleLine: true, placeholder: 'Date' },
      },
      {
        blockId: 'eventLocation',
        label: 'Location',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        benchable: false,
        content: { format: 'plain', singleLine: true, placeholder: 'Location' },
      },
      {
        blockId: 'cta',
        label: 'CTA',
        iconKey: 'cta',
        kind: 'cta',
        benchable: false,
        content: { format: 'plain', placeholder: SLOT_PLACEHOLDERS.cta },
      },
    ],
    useStoreBindings: () => {
      const verbatimCopy = useStore((s) => s.verbatimCopy)
      const setVerbatimCopy = useStore((s) => s.setVerbatimCopy)
      const ctaText = useStore((s) => s.ctaText)
      const setCtaText = useStore((s) => s.setCtaText)
      const eventDate = useStore((s) => s.eventDate)
      const setEventDate = useStore((s) => s.setEventDate)
      const eventLocation = useStore((s) => s.eventLocation)
      const setEventLocation = useStore((s) => s.setEventLocation)
      const showBody = useStore((s) => s.showBody)
      const setShowBody = useStore((s) => s.setShowBody)
      const headlineFontSize = useStore((s) => s.headlineFontSize)
      const setHeadlineFontSize = useStore((s) => s.setHeadlineFontSize)

      return {
        slotState: {
          logo: {},
          headline: {
            value: verbatimCopy.headline || '',
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
          eventDate: {
            value: eventDate,
            setValue: setEventDate,
          },
          eventLocation: {
            value: eventLocation,
            setValue: setEventLocation,
          },
          cta: {
            value: ctaText,
            setValue: setCtaText,
          },
        },
      }
    },
    renderTemplate: (ctx) => (
      <EmailEhsAccelerateBanner
        headline={ctx.textOf('headline')}
        body={ctx.textOf('body')}
        showBody={ctx.visibilityOf('body')}
        ctaText={ctx.textOf('cta')}
        headlineFontSize={ctx.fontSizeOf('headline')}
        eventDate={ctx.textOf('eventDate')}
        eventLocation={ctx.textOf('eventLocation')}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderOverlay={ctx.renderOverlay}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
      />
    ),
  })
