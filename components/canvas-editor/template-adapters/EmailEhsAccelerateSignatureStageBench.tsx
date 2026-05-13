'use client'

import { useStore } from '@/store'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailEhsAccelerateSignature,
  type EmailEhsAccelerateSignatureBlockId,
} from '../../templates/EmailEhsAccelerateSignature'

/**
 * Stage & Bench adapter for email-ehs-accelerate-signature.
 *
 * 400×100 sign-off card. Logo lockup is brand-locked; editable:
 * workshopName / eventDate / eventLocation / cta. The event detail
 * line (date+location) toggles together via `showEventDetails`.
 */

export const EmailEhsAccelerateSignatureStageBench =
  defineStageBenchAdapter<EmailEhsAccelerateSignatureBlockId>({
    templateId: 'email-ehs-accelerate-signature',
    slots: [
      { blockId: 'logo', label: 'Logo', iconKey: 'logo', kind: 'image', benchable: false },
      {
        blockId: 'eventDate',
        label: 'Date',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
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
        blockId: 'workshopName',
        label: 'Workshop',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Workshop Name' },
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
      const signatureWorkshopName = useStore((s) => s.signatureWorkshopName)
      const setSignatureWorkshopName = useStore((s) => s.setSignatureWorkshopName)
      const eventDate = useStore((s) => s.eventDate)
      const setEventDate = useStore((s) => s.setEventDate)
      const eventLocation = useStore((s) => s.eventLocation)
      const setEventLocation = useStore((s) => s.setEventLocation)
      const ctaText = useStore((s) => s.ctaText)
      const setCtaText = useStore((s) => s.setCtaText)

      const showSignatureWorkshopName = useStore((s) => s.showSignatureWorkshopName)
      const setShowSignatureWorkshopName = useStore((s) => s.setShowSignatureWorkshopName)
      const showSignatureEventDetails = useStore((s) => s.showSignatureEventDetails)
      const showCta = useStore((s) => s.showCta)
      const setShowCta = useStore((s) => s.setShowCta)

      return {
        slotState: {
          logo: {},
          eventDate: {
            value: eventDate,
            visible: showSignatureEventDetails,
            setValue: setEventDate,
          },
          eventLocation: {
            value: eventLocation,
            visible: showSignatureEventDetails,
            setValue: setEventLocation,
          },
          workshopName: {
            value: signatureWorkshopName,
            visible: showSignatureWorkshopName,
            setValue: setSignatureWorkshopName,
            setVisible: setShowSignatureWorkshopName,
          },
          cta: {
            value: ctaText,
            visible: showCta,
            setValue: setCtaText,
            setVisible: setShowCta,
          },
        },
        extras: { showSignatureEventDetails },
      }
    },
    renderTemplate: (ctx) => (
      <EmailEhsAccelerateSignature
        workshopName={ctx.textOf('workshopName')}
        eventDate={ctx.textOf('eventDate')}
        eventLocation={ctx.textOf('eventLocation')}
        ctaText={ctx.textOf('cta')}
        showWorkshopName={ctx.visibilityOf('workshopName')}
        showEventDetails={ctx.extras.showSignatureEventDetails as boolean}
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
