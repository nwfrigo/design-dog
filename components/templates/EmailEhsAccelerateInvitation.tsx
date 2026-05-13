'use client'

import { type ReactNode } from 'react'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

/** Editable block ids for Stage & Bench wiring. Logo + RSVP button +
 *  background image are brand-locked. */
export type EmailEhsAccelerateInvitationBlockId =
  | 'invitationHeader'
  | 'invitationHeadline'
  | 'invitationEventTitle'
  | 'invitationEventDate'
  | 'invitationEventLocation'
  | 'invitationEventTime'
  | 'invitationEventTimeNote'
  | 'invitationBody'

export interface EmailEhsAccelerateInvitationProps {
  invitationHeader: string
  invitationHeadline: string
  invitationEventTitle: string
  invitationEventDate: string
  invitationEventLocation: string
  invitationEventTime: string
  invitationEventTimeNote: string
  invitationBody: string
  /** Stage & Bench render-prop: wraps each editable region in <Editable>. */
  renderBlock?: (blockId: EmailEhsAccelerateInvitationBlockId, content: ReactNode) => ReactNode
  /** Stage & Bench render-prop: swaps a block's inner text for an in-place editor. */
  renderInlineEditor?: (blockId: EmailEhsAccelerateInvitationBlockId, defaultInner: ReactNode) => ReactNode
  /** Stage & Bench render-prop: absolutely-positioned overlay (drag scrim). */
  renderOverlay?: () => ReactNode
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
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: EmailEhsAccelerateInvitationProps) {
  // Render-prop shims: in export/preview contexts these are no-ops; in
  // the editor they wrap blocks with <Editable> and swap inner text for
  // an in-place editor when selected.
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const bodyHtml = invitationBody || DEFAULT_BODY
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  return (
    <div style={{ width: 420, height: 595, position: 'relative', overflow: 'hidden', background: 'white', fontFamily, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      {/* Background image */}
      <img
        src="/assets/backgrounds/ehs_accelerate_invitation_background.png"
        alt=""
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* EHS+ Accelerate Logo (top right) */}
      <div style={{ position: 'absolute', left: 256, top: 27, width: 136, height: 44, overflow: 'hidden' }}>
        <EhsAccelerateLogo width={136} />
      </div>

      {/* "You're Invited" header */}
      {wrapBlock('invitationHeader', (
        <div style={{
          position: 'absolute', left: 28, top: 36,
          color: '#060015', fontSize: 18, fontWeight: 350, lineHeight: '16.92px',
        }}>
          {wrapInline('invitationHeader', invitationHeader || "You're Invited")}
        </div>
      ))}

      {/* Main headline */}
      {wrapBlock('invitationHeadline', (
        <div style={{
          position: 'absolute', width: 250, left: 26, top: 65,
          color: '#060015', fontSize: 40.93, fontWeight: 350, lineHeight: '38.47px',
          wordWrap: 'break-word',
        }}>
          {wrapInline('invitationHeadline', invitationHeadline || 'Exclusive EHS+ Leader Workshop')}
        </div>
      ))}

      {/* Event details bar */}
      <div style={{
        position: 'absolute', left: 28, top: 201,
        display: 'flex', alignItems: 'flex-start', gap: 18,
      }}>
        {/* Event title */}
        {wrapBlock('invitationEventTitle', (
          <div style={{
            maxWidth: 118,
            color: '#060015', fontSize: 8, fontWeight: 400,
            textTransform: 'uppercase', lineHeight: '9.92px',
          }}>
            {wrapInline('invitationEventTitle', invitationEventTitle || 'EHS+ Accelerate: Tech Convergence Workshop')}
          </div>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 21, background: '#060015', opacity: 0.3, flexShrink: 0, marginTop: 1 }} />

        {/* Date + Location — two separate editable blocks stacked, gap matches
            the original <br/> rhythm (9.92px line-height ≈ 10px). */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          color: '#060015', fontSize: 8, fontWeight: 400,
          textTransform: 'uppercase', lineHeight: '9.92px',
        }}>
          {wrapBlock('invitationEventDate', (
            <div>{wrapInline('invitationEventDate', invitationEventDate || '13 November')}</div>
          ))}
          {wrapBlock('invitationEventLocation', (
            <div>{wrapInline('invitationEventLocation', invitationEventLocation || 'London, England')}</div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 21, background: '#060015', opacity: 0.3, flexShrink: 0, marginTop: 1 }} />

        {/* Time + Note — two separate editable blocks stacked. */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          color: '#060015', fontSize: 8, fontWeight: 400,
          textTransform: 'uppercase', lineHeight: '9.92px',
        }}>
          {wrapBlock('invitationEventTime', (
            <div>{wrapInline('invitationEventTime', invitationEventTime || '10:00–14:30')}</div>
          ))}
          {wrapBlock('invitationEventTimeNote', (
            <div>{wrapInline('invitationEventTimeNote', invitationEventTimeNote || 'Lunch Included')}</div>
          ))}
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
        {wrapBlock('invitationBody', (
          <div
            className="ehs-invite-body"
            style={{
              position: 'absolute', left: 13, top: 19, width: 337,
              color: '#060015', fontSize: 10, fontWeight: 350,
              lineHeight: '13.9px',
            }}
          >
            {wrapInline(
              'invitationBody',
              <span dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            )}
          </div>
        ))}

        {/* RSVP button */}
        <div style={{
          position: 'absolute', left: 13, top: 280,
          paddingLeft: 17, paddingRight: 17, paddingTop: 10, paddingBottom: 10,
          background: '#F1F3F4', borderRadius: 4,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: 'black', fontSize: 10, fontWeight: 350, lineHeight: '10px' }}>
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
        .ehs-invite-body ul, .ehs-invite-body ol { margin: 4px 0 6px 0; padding-left: 0; list-style: none; }
        .ehs-invite-body ul li { position: relative; padding-left: 10px; margin: 2px 0; }
        .ehs-invite-body ul li::before { content: '•'; position: absolute; left: 0; top: 0; }
        .ehs-invite-body ol { counter-reset: item; }
        .ehs-invite-body ol li { position: relative; padding-left: 14px; margin: 2px 0; counter-increment: item; }
        .ehs-invite-body ol li::before { content: counter(item) '.'; position: absolute; left: 0; top: 0; }
        .ehs-invite-body li p { display: inline; margin: 0; }
        .ehs-invite-body strong { font-weight: 500; }
      `}</style>
      {renderOverlay?.()}
    </div>
  )
}
