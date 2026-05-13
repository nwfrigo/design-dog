'use client'

import { useStore } from '@/store'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailCorityCustomerExchangeSignature,
  type EmailCorityCustomerExchangeSignatureBlockId,
} from '../../templates/EmailCorityCustomerExchangeSignature'

/**
 * Stage & Bench adapter for email-cority-customer-exchange-signature.
 *
 * 400×100 Track-2 sign-off card. Logo lockup is brand-locked; the three
 * meta lines (date / location / time) + CTA are editable. No stage-bar
 * controls — pure content edits.
 */

export const EmailCorityCustomerExchangeSignatureStageBench =
  defineStageBenchAdapter<EmailCorityCustomerExchangeSignatureBlockId>({
    templateId: 'email-cority-customer-exchange-signature',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      {
        blockId: 'eventDate',
        label: 'Date',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Date' },
      },
      {
        blockId: 'eventLocation',
        label: 'Location',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Location' },
      },
      {
        blockId: 'eventTime',
        label: 'Time',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Time' },
      },
      {
        blockId: 'cta',
        label: 'CTA',
        iconKey: 'cta',
        kind: 'cta',
        content: { format: 'plain', placeholder: 'Call to Action' },
      },
    ],
    useStoreBindings: () => {
      const eventDate = useStore((s) => s.eventDate)
      const setEventDate = useStore((s) => s.setEventDate)
      const eventLocation = useStore((s) => s.eventLocation)
      const setEventLocation = useStore((s) => s.setEventLocation)
      const cceEventTime = useStore((s) => s.cceEventTime)
      const setCceEventTime = useStore((s) => s.setCceEventTime)
      const ctaText = useStore((s) => s.ctaText)
      const setCtaText = useStore((s) => s.setCtaText)

      const showCceEventDate = useStore((s) => s.showCceEventDate)
      const setShowCceEventDate = useStore((s) => s.setShowCceEventDate)
      const showCceEventLocation = useStore((s) => s.showCceEventLocation)
      const setShowCceEventLocation = useStore((s) => s.setShowCceEventLocation)
      const showCceEventTime = useStore((s) => s.showCceEventTime)
      const setShowCceEventTime = useStore((s) => s.setShowCceEventTime)
      const showCta = useStore((s) => s.showCta)
      const setShowCta = useStore((s) => s.setShowCta)

      return {
        slotState: {
          logo: {},
          eventDate: {
            value: eventDate,
            visible: showCceEventDate,
            setValue: setEventDate,
            setVisible: setShowCceEventDate,
          },
          eventLocation: {
            value: eventLocation,
            visible: showCceEventLocation,
            setValue: setEventLocation,
            setVisible: setShowCceEventLocation,
          },
          eventTime: {
            value: cceEventTime,
            visible: showCceEventTime,
            setValue: setCceEventTime,
            setVisible: setShowCceEventTime,
          },
          cta: {
            value: ctaText,
            visible: showCta,
            setValue: setCtaText,
            setVisible: setShowCta,
          },
        },
      }
    },
    renderTemplate: (ctx) => (
      <EmailCorityCustomerExchangeSignature
        eventDate={ctx.textOf('eventDate')}
        eventLocation={ctx.textOf('eventLocation')}
        eventTime={ctx.textOf('eventTime')}
        ctaText={ctx.textOf('cta')}
        showEventDate={ctx.visibilityOf('eventDate')}
        showEventLocation={ctx.visibilityOf('eventLocation')}
        showEventTime={ctx.visibilityOf('eventTime')}
        showCta={ctx.visibilityOf('cta')}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderOverlay={ctx.renderOverlay}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
      />
    ),
  })
