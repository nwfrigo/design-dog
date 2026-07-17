'use client'

import { CSSProperties, Fragment, type ReactNode } from 'react'
import type { TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { getIconByName } from '@/components/IconPickerModal'
import {
  EXEC_TOKENS as T,
  EXEC_PAGE_W,
  EXEC_PAGE_H,
  EXEC_PLACEHOLDERS as PH,
  type ExecutiveOverviewBlockId,
  type ExecutiveOverviewCard,
  type ExecutiveOverviewStat,
} from './constants'

/**
 * Executive Overview — Page 2 (value cards + stats + contact).
 * Fixed-composition (Track 2). Standard S&B render-prop contract.
 */

export interface Page2Props {
  tagline: string
  cards: ExecutiveOverviewCard[] // length EXEC_CARD_COUNT
  trustedHeader: string
  trustedSubhead: string
  stats: ExecutiveOverviewStat[] // length EXEC_STAT_COUNT
  footerCta: string
  contactName: string
  contactRole: string
  contactEmail: string
  contactAvatarUrl?: string | null
  showTagline: boolean
  showTrustedHeader: boolean
  showTrustedSubhead: boolean
  showContact: boolean
  renderBlock?: (blockId: ExecutiveOverviewBlockId, content: ReactNode) => ReactNode
  renderInlineEditor?: (blockId: ExecutiveOverviewBlockId, defaultInner: ReactNode) => ReactNode
  renderOverlay?: () => ReactNode
  typography: TypographyConfig
  scale?: number
}

const CAP_LABEL: CSSProperties = {
  fontSize: 8,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: 0.88,
  lineHeight: 1,
}

export function Page2({
  tagline,
  cards,
  trustedHeader,
  trustedSubhead,
  stats,
  footerCta,
  contactName,
  contactRole,
  contactEmail,
  contactAvatarUrl,
  showTagline,
  showTrustedHeader,
  showTrustedSubhead,
  showContact,
  renderBlock,
  renderInlineEditor,
  renderOverlay,
  typography,
  scale = 1,
}: Page2Props) {
  const wrapBlock = renderBlock ?? ((_id, content) => content)
  const wrapInline = renderInlineEditor ?? ((_id, defaultInner) => defaultInner)
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const containerStyle: CSSProperties = {
    width: EXEC_PAGE_W,
    height: EXEC_PAGE_H,
    position: 'relative',
    overflow: 'hidden',
    background: T.pageBg,
    fontFamily,
    color: T.text,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const renderCard = (card: ExecutiveOverviewCard, i: number) => {
    const n = i + 1
    return (
      <div
        key={n}
        style={{
          width: 246,
          height: 210,
          padding: 12,
          background: T.cardBg,
          border: `${T.borderXs}px solid ${T.border}`,
          borderRadius: T.radiusS,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Title + body are anchored at the top (fixed placement); chips pin to
            the bottom via marginTop:auto. Body is top-aligned and capped at 4
            lines in the editor, so its edit box starts at the top, not floated. */}
        {wrapBlock(`card${n}Title` as ExecutiveOverviewBlockId, (
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: '18px', color: T.text }}>
            {wrapInline(`card${n}Title` as ExecutiveOverviewBlockId, <span>{card.title || PH.cardTitle}</span>)}
          </div>
        ))}
        {wrapBlock(`card${n}Body` as ExecutiveOverviewBlockId, (
          <div style={{ width: 216, marginTop: 10, fontSize: 14, fontWeight: 350, lineHeight: '18px', color: T.text }}>
            {wrapInline(`card${n}Body` as ExecutiveOverviewBlockId, <span>{card.body || PH.cardBody}</span>)}
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 'auto' }}>
          {card.chips.map((chip, j) => {
            if (!chip.show) return null
            const chipId = `card${n}Chip${j + 1}` as ExecutiveOverviewBlockId
            const Icon = getIconByName(chip.icon)
            // key on the outer list item (wrapBlock returns an <Editable> in the
            // editor, which is the actual child — key it via a Fragment).
            return (
              <Fragment key={chipId}>{wrapBlock(chipId, (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: 6,
                  background: T.chipBg,
                  border: `${T.borderXs}px solid ${T.border}`,
                  borderRadius: T.radiusXs,
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ width: 12, height: 12, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {Icon
                    ? <Icon size={12} strokeWidth={1.5} color={T.orange} />
                    : <span style={{ width: 4, height: 4, borderRadius: 1, background: T.orange }} />}
                </span>
                <span style={{ ...CAP_LABEL, color: T.text }}>
                  {wrapInline(chipId, <span>{chip.label || PH.chipLabel}</span>)}
                </span>
              </div>
            ))}</Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  const renderStat = (stat: ExecutiveOverviewStat, k: number) => {
    if (!stat.show) return null
    const statId = `stat${k + 1}` as ExecutiveOverviewBlockId
    return (
      <Fragment key={statId}>{wrapBlock(statId, (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 4, borderRadius: 1, background: T.orange, flexShrink: 0 }} />
        <span style={{ ...CAP_LABEL, color: T.text, whiteSpace: 'nowrap' }}>
          {wrapInline(statId, <span>{stat.label || PH.stat}</span>)}
        </span>
      </div>
    ))}</Fragment>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header: Cority logo + tagline */}
      <div style={{ position: 'absolute', left: 48, top: 48 }}>
        <CorityLogo fill={T.text} height={22} />
      </div>
      {showTagline && wrapBlock('tagline', (
        <div style={{ position: 'absolute', left: 149, top: 51, width: 415, fontSize: 14, fontWeight: 350, lineHeight: '18px', color: T.text }}>
          {wrapInline('tagline', <span>{tagline || PH.tagline}</span>)}
        </div>
      ))}

      {/* Value cards grid */}
      <div style={{ position: 'absolute', left: 48, top: 104, width: 516, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {cards.slice(0, 2).map((c, i) => renderCard(c, i))}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {cards.slice(2, 4).map((c, i) => renderCard(c, i + 2))}
        </div>
      </div>

      {/* Section header row */}
      {showTrustedHeader && wrapBlock('trustedHeader', (
        <div style={{ position: 'absolute', left: 48, top: 576, fontSize: 30, fontWeight: 350, lineHeight: 1.2, color: T.text, whiteSpace: 'nowrap' }}>
          {wrapInline('trustedHeader', <span>{trustedHeader || PH.trustedHeader}</span>)}
        </div>
      ))}
      {showTrustedSubhead && wrapBlock('trustedSubhead', (
        <div style={{ position: 'absolute', left: 318, top: 576, width: 210, fontSize: 14, fontWeight: 350, lineHeight: '18px', color: T.text }}>
          {wrapInline('trustedSubhead', <span>{trustedSubhead || PH.trustedSubhead}</span>)}
        </div>
      ))}

      {/* Stats — two centered rows */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 646, width: 506, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
          {stats.slice(0, 3).map((s, k) => renderStat(s, k))}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
          {stats.slice(3, 5).map((s, k) => renderStat(s, k + 3))}
        </div>
      </div>

      {/* Footer band */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 704,
        width: EXEC_PAGE_W,
        height: 88,
        background: T.footerBg,
        borderTop: `${T.borderXs}px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        paddingLeft: 48,
        paddingRight: 48,
        boxSizing: 'border-box',
      }}>
        {wrapBlock('footerCta', (
          <div style={{ width: 246, fontSize: 14, fontWeight: 350, lineHeight: '18px', color: T.text }}>
            {wrapInline('footerCta', <span>{footerCta || PH.footerCta}</span>)}
          </div>
        ))}
        {showContact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {wrapBlock('contactAvatar', (
              <ContactAvatar url={contactAvatarUrl} />
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {wrapBlock('contactName', (
                <div style={{ ...CAP_LABEL, color: T.text, whiteSpace: 'nowrap' }}>
                  {wrapInline('contactName', <span>{contactName || PH.contactName}</span>)}
                </div>
              ))}
              {wrapBlock('contactRole', (
                <div style={{ ...CAP_LABEL, color: T.textSecondary, whiteSpace: 'nowrap' }}>
                  {wrapInline('contactRole', <span>{contactRole || PH.contactRole}</span>)}
                </div>
              ))}
              {wrapBlock('contactEmail', (
                <div style={{ ...CAP_LABEL, color: T.textSecondary, whiteSpace: 'nowrap' }}>
                  {wrapInline('contactEmail', <span>{contactEmail || PH.contactEmail}</span>)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {renderOverlay?.()}
    </div>
  )
}

function ContactAvatar({ url }: { url?: string | null }) {
  const base: CSSProperties = { width: 38, height: 38, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }
  if (!url) {
    return (
      <div style={{ ...base, background: '#E6E6E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth={1.25}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </div>
    )
  }
  return (
    <div style={base}>
      <img src={url} alt="" data-export-image="true" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

export default Page2
