import Image from 'next/image'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

export interface EmailEhsAccelerateInvitationProps {
  invitationHeader: string
  invitationHeadline: string
  invitationEventTitle: string
  invitationEventDate: string
  invitationEventLocation: string
  invitationEventTime: string
  invitationEventTimeNote: string
  invitationBody: string
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const DEFAULT_BODY = `<p>Cority is bringing together a select group of senior leaders for a free half-day, in-person event.</p><p>This intimate, curated session is designed for senior EHS&amp;S and IT leaders who are shaping the future of EHS+. Together, we'll explore:</p><ul><li>Why tech and data consolidation matters now more than ever to drive performance advantage</li><li>Powerful yet practical ways to minimise risk with AI</li><li>Customer stories of going from fragmented to future-ready systems</li><li>Practical frameworks for mapping your modernisation journey</li></ul><p>Beyond insights, this is a rare chance to unplug and connect with like-minded peers in a VIP setting. Seats are limited to keep discussions meaningful.</p><p>We hope to see you there!</p>`

export function EmailEhsAccelerateInvitation({
  invitationHeader,
  invitationHeadline,
  invitationEventTitle,
  invitationEventDate,
  invitationEventLocation,
  invitationEventTime,
  invitationEventTimeNote,
  invitationBody,
  scale = 1,
}: EmailEhsAccelerateInvitationProps) {
  const bodyHtml = invitationBody || DEFAULT_BODY

  return (
    <div style={{ width: 420, height: 595, position: 'relative', overflow: 'hidden', background: 'white', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      {/* Background image */}
      <Image
        src="/assets/backgrounds/ehs_accelerate_invitation_background.png"
        alt=""
        width={420}
        height={595}
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Orange orb */}
      <div style={{
        width: 802, height: 802, left: -349, top: 114,
        position: 'absolute', opacity: 0.50,
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #F78534 14%, rgba(252,196,119,0.87) 35%, rgba(252,196,119,0.64) 60%, rgba(252,196,119,0.36) 76%, rgba(252,196,119,0) 100%)',
        borderRadius: 9999, filter: 'blur(33.4px)',
      }} />

      {/* Blue orb */}
      <div style={{
        width: 579, height: 579, left: 189, top: -308,
        position: 'absolute', opacity: 0.50,
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #0022FF 0%, rgba(0,34,255,0.30) 58%, rgba(0,34,255,0.10) 80%, rgba(0,34,255,0) 100%)',
        borderRadius: 9999, filter: 'blur(2px)',
      }} />

      {/* EHS+ Accelerate Logo (top right) */}
      <div style={{ position: 'absolute', left: 256, top: 27, width: 136, height: 44, overflow: 'hidden' }}>
        <EhsAccelerateLogo width={136} />
      </div>

      {/* "You're Invited" header */}
      <div style={{
        position: 'absolute', left: 28, top: 36,
        color: '#060015', fontSize: 18, fontFamily: 'var(--font-fakt)', fontWeight: 350, lineHeight: '16.92px',
      }}>
        {invitationHeader || "You're Invited"}
      </div>

      {/* Main headline */}
      <div style={{
        position: 'absolute', width: 250, left: 26, top: 65,
        color: '#060015', fontSize: 40.93, fontFamily: 'var(--font-fakt)', fontWeight: 350, lineHeight: '38.47px',
        wordWrap: 'break-word',
      }}>
        {invitationHeadline || 'Exclusive EHS+ Leader Workshop'}
      </div>

      {/* Event details bar */}
      <div style={{
        position: 'absolute', left: 28, top: 201,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        {/* Event title */}
        <div style={{
          width: 108,
          color: '#060015', fontSize: 8, fontFamily: 'var(--font-fakt)', fontWeight: 400,
          textTransform: 'uppercase', lineHeight: '9.92px',
        }}>
          {invitationEventTitle || 'EHS+ Accelerate: Tech Convergence Workshop'}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 21, background: '#060015', opacity: 0.3, flexShrink: 0, marginTop: 1 }} />

        {/* Date + Location */}
        <div style={{
          color: '#060015', fontSize: 8, fontFamily: 'var(--font-fakt)', fontWeight: 400,
          textTransform: 'uppercase', lineHeight: '9.92px',
        }}>
          {invitationEventDate || '13 November'}<br />
          {invitationEventLocation || 'London, England'}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 21, background: '#060015', opacity: 0.3, flexShrink: 0, marginTop: 1 }} />

        {/* Time + Note */}
        <div style={{
          color: '#060015', fontSize: 8, fontFamily: 'var(--font-fakt)', fontWeight: 400,
          textTransform: 'uppercase', lineHeight: '9.92px',
        }}>
          {invitationEventTime || '10:00–14:30'}<br />
          {invitationEventTimeNote || 'Lunch Included'}
        </div>
      </div>

      {/* White card */}
      <div style={{
        position: 'absolute', width: 364, height: 320, left: 28, top: 245,
        background: 'white', borderRadius: 8,
        boxShadow: '0px 0px 5px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}>
        {/* Body text */}
        <div
          className="ehs-invite-body"
          style={{
            position: 'absolute', left: 13, top: 19, width: 337,
            color: '#060015', fontSize: 10, fontFamily: 'var(--font-fakt)', fontWeight: 350,
            lineHeight: '13.9px',
          }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* RSVP button */}
        <div style={{
          position: 'absolute', left: 13, top: 280,
          paddingLeft: 17, paddingRight: 17, paddingTop: 10, paddingBottom: 10,
          background: '#F1F3F4', borderRadius: 4,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: 'black', fontSize: 10, fontFamily: 'var(--font-fakt)', fontWeight: 350, lineHeight: '10px' }}>
            RSVP
          </span>
          {/* Arrow icon */}
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path d="M1 3h6.5M5.5 1l2.5 2-2.5 2" stroke="black" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Body styles for rich text inside card */}
      <style>{`
        .ehs-invite-body p { margin: 0 0 6px 0; }
        .ehs-invite-body p:last-child { margin-bottom: 0; }
        .ehs-invite-body ul { margin: 4px 0 6px 0; padding-left: 14px; }
        .ehs-invite-body li { margin: 2px 0; }
        .ehs-invite-body strong { font-weight: 500; }
      `}</style>
    </div>
  )
}
