/**
 * Stage & Bench registration for email-ehs-accelerate-invitation.
 */

import { EmailEhsAccelerateInvitation } from '@/components/templates/EmailEhsAccelerateInvitation'
import type { StageBenchRegistrationData } from '@/lib/stage-bench-registry'
import { EmailEhsAccelerateInvitationStageBench } from './EmailEhsAccelerateInvitationStageBench'

export const emailEhsAccelerateInvitationRegistration: StageBenchRegistrationData = {
  templateId: 'email-ehs-accelerate-invitation',
  Template: EmailEhsAccelerateInvitation,
  Adapter: EmailEhsAccelerateInvitationStageBench,
  renderProps: (asset, colors, typography) => ({
    invitationHeader: asset.invitationHeader || "You're Invited",
    invitationHeadline: asset.invitationHeadline || '',
    invitationEventTitle: asset.invitationEventTitle || '',
    invitationEventDate: asset.invitationEventDate || '',
    invitationEventLocation: asset.invitationEventLocation || '',
    invitationEventTime: asset.invitationEventTime || '',
    invitationEventTimeNote: asset.invitationEventTimeNote || '',
    invitationBody: asset.invitationBody || '',
    colors, typography, scale: 1,
  }),
  queueTextFields: [
    { key: 'invitationHeader', label: 'Header' },
    { key: 'invitationHeadline', label: 'Headline' },
    { key: 'invitationEventTitle', label: 'Event Title' },
    { key: 'invitationEventDate', label: 'Date' },
    { key: 'invitationEventLocation', label: 'Location' },
    { key: 'invitationEventTime', label: 'Time' },
    { key: 'invitationEventTimeNote', label: 'Time Note' },
    { key: 'invitationBody', label: 'Body (HTML)' },
  ],
  renderSchema: {
    width: 420,
    height: 595,
    background: '#ffffff',
    fields: [
      { param: 'invitationHeader', parser: 'string', default: "You're Invited" },
      { param: 'invitationHeadline', parser: 'string', default: 'Exclusive EHS+ Leader Workshop' },
      { param: 'invitationEventTitle', parser: 'string', default: 'EHS+ Accelerate: Tech Convergence Workshop' },
      { param: 'invitationEventDate', parser: 'string', default: '13 November' },
      { param: 'invitationEventLocation', parser: 'string', default: 'London, England' },
      { param: 'invitationEventTime', parser: 'string', default: '10:00–14:30' },
      { param: 'invitationEventTimeNote', parser: 'string', default: 'Lunch Included' },
      { param: 'invitationBody', parser: 'string', default: '' },
    ],
  },
  exportBuilder: (s) => ({
    invitationHeader: s.invitationHeader || '',
    invitationHeadline: s.invitationHeadline || '',
    invitationEventTitle: s.invitationEventTitle || '',
    invitationEventDate: s.invitationEventDate || '',
    invitationEventLocation: s.invitationEventLocation || '',
    invitationEventTime: s.invitationEventTime || '',
    invitationEventTimeNote: s.invitationEventTimeNote || '',
    invitationBody: s.invitationBody || '',
  }),
}
