'use client'

import { useStore } from '@/store'
import { NEUTRAL_FILTERS } from '@/lib/image-filters'

import { defineStageBenchAdapter } from '../factory/defineStageBenchAdapter'
import {
  EmailEhsAccelerateInvitation,
  EHS_INVITATION_PARTNER_LOGO,
  type EmailEhsAccelerateInvitationBlockId,
} from '../../templates/EmailEhsAccelerateInvitation'

/**
 * Stage & Bench adapter for email-ehs-accelerate-invitation
 * (factory-driven).
 *
 * 420×595 RSVP invitation. Logo, RSVP button, and the background image
 * are brand-locked. 8 editable text slots:
 *
 *  - Header / Headline (top of card)
 *  - Event Title / Date / Location / Time / Time Note (info bar)
 *  - Body (HTML rich-text; bold + italic via the standard toolbar)
 *
 * Date+Location and Time+Note were previously rendered as a single block
 * with `<br/>` separating two values; they're now split into two slots
 * each so users can target each line independently.
 *
 * No stage-bar items — the template has no variants, theme, or layout
 * toggle.
 */

export const EmailEhsAccelerateInvitationStageBench =
  defineStageBenchAdapter<EmailEhsAccelerateInvitationBlockId>({
    templateId: 'email-ehs-accelerate-invitation',
    slots: [
      {
        blockId: 'partnerLogo', label: 'Partner logo', iconKey: 'image', kind: 'image', benchable: false,
        size: { default: EHS_INVITATION_PARTNER_LOGO.default, min: EHS_INVITATION_PARTNER_LOGO.min, max: EHS_INVITATION_PARTNER_LOGO.max, step: 1 },
      },
      {
        blockId: 'invitationHeader',
        label: 'Header',
        iconKey: 'eyebrow',
        chipKind: 'eyebrow',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: "You're Invited" },
      },
      {
        blockId: 'invitationHeadline',
        label: 'Headline',
        iconKey: 'headline',
        kind: 'text',
        content: { format: 'plain', placeholder: 'Exclusive EHS+ Leader Workshop' },
      },
      {
        blockId: 'invitationEventTitle',
        label: 'Event Title',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', placeholder: 'EHS+ Accelerate: Tech Convergence Workshop' },
      },
      {
        blockId: 'invitationEventDate',
        label: 'Date',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: '13 November' },
      },
      {
        blockId: 'invitationEventLocation',
        label: 'Location',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'London, England' },
      },
      {
        blockId: 'invitationEventTime',
        label: 'Time',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: '10:00–14:30' },
      },
      {
        blockId: 'invitationEventTimeNote',
        label: 'Note',
        iconKey: 'small-caption',
        chipKind: 'small-caption',
        kind: 'text',
        content: { format: 'plain', singleLine: true, placeholder: 'Lunch Included' },
      },
      {
        blockId: 'invitationBody',
        label: 'Body',
        iconKey: 'body',
        kind: 'text',
        content: { format: 'html', placeholder: 'Body text' },
      },
    ],
    stageBar: [],
    childImages: [
      { blockId: 'partnerLogo', placeholderSrc: '', frameWidth: 120, frameHeight: 32, replaceOnly: true },
    ],
    useStoreBindings: () => {
      const partnerLogo = useStore((s) => s.partnerLogoSettings['email-ehs-accelerate-invitation'])
      const setPartnerLogo = useStore((s) => s.setPartnerLogo)
      const invitationHeader = useStore((s) => s.invitationHeader)
      const setInvitationHeader = useStore((s) => s.setInvitationHeader)
      const invitationHeadline = useStore((s) => s.invitationHeadline)
      const setInvitationHeadline = useStore((s) => s.setInvitationHeadline)
      const invitationEventTitle = useStore((s) => s.invitationEventTitle)
      const setInvitationEventTitle = useStore((s) => s.setInvitationEventTitle)
      const invitationEventDate = useStore((s) => s.invitationEventDate)
      const setInvitationEventDate = useStore((s) => s.setInvitationEventDate)
      const invitationEventLocation = useStore((s) => s.invitationEventLocation)
      const setInvitationEventLocation = useStore((s) => s.setInvitationEventLocation)
      const invitationEventTime = useStore((s) => s.invitationEventTime)
      const setInvitationEventTime = useStore((s) => s.setInvitationEventTime)
      const invitationEventTimeNote = useStore((s) => s.invitationEventTimeNote)
      const setInvitationEventTimeNote = useStore((s) => s.setInvitationEventTimeNote)
      const invitationBody = useStore((s) => s.invitationBody)
      const setInvitationBody = useStore((s) => s.setInvitationBody)

      return {
        slotState: {
          partnerLogo: {
            fontSize: partnerLogo?.height ?? EHS_INVITATION_PARTNER_LOGO.default,
            setFontSize: (v) => setPartnerLogo('email-ehs-accelerate-invitation', { height: v }),
          },
          invitationHeader: { value: invitationHeader, setValue: setInvitationHeader },
          invitationHeadline: { value: invitationHeadline, setValue: setInvitationHeadline },
          invitationEventTitle: { value: invitationEventTitle, setValue: setInvitationEventTitle },
          invitationEventDate: { value: invitationEventDate, setValue: setInvitationEventDate },
          invitationEventLocation: { value: invitationEventLocation, setValue: setInvitationEventLocation },
          invitationEventTime: { value: invitationEventTime, setValue: setInvitationEventTime },
          invitationEventTimeNote: { value: invitationEventTimeNote, setValue: setInvitationEventTimeNote },
          invitationBody: { value: invitationBody, setValue: setInvitationBody },
        },
        childImages: {
          partnerLogo: {
            url: partnerLogo?.url ?? undefined,
            position: { x: 0, y: 0 },
            zoom: 1,
            filters: NEUTRAL_FILTERS,
            setUrl: (url) => setPartnerLogo('email-ehs-accelerate-invitation', { url }),
            setSettings: () => {},
          },
        },
        extras: { partnerLogoUrl: partnerLogo?.url ?? null },
      }
    },
    renderTemplate: (ctx) => (
      <EmailEhsAccelerateInvitation
        partnerLogoUrl={ctx.extras.partnerLogoUrl as string | null}
        partnerLogoHeight={ctx.fontSizeOf('partnerLogo') ?? EHS_INVITATION_PARTNER_LOGO.default}
        invitationHeader={ctx.textOf('invitationHeader')}
        invitationHeadline={ctx.textOf('invitationHeadline')}
        invitationEventTitle={ctx.textOf('invitationEventTitle')}
        invitationEventDate={ctx.textOf('invitationEventDate')}
        invitationEventLocation={ctx.textOf('invitationEventLocation')}
        invitationEventTime={ctx.textOf('invitationEventTime')}
        invitationEventTimeNote={ctx.textOf('invitationEventTimeNote')}
        invitationBody={ctx.textOf('invitationBody')}
        renderBlock={ctx.renderBlock}
        renderInlineEditor={ctx.renderInlineEditor}
        renderOverlay={ctx.renderOverlay}
        colors={ctx.colors}
        typography={ctx.typography}
        scale={ctx.scale}
      />
    ),
  })
