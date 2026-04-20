'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { EhsAccelerateLogo } from '@/components/shared/EhsAccelerateLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export interface WebsiteEhsAccelerateListingProps {
  eyebrow: string
  headline: string
  subhead: string
  // Grid details (up to 4 rows)
  gridDetail1Text: string
  gridDetail2Text: string
  gridDetail3Text: string
  gridDetail4Text: string
  showRow3: boolean
  showRow4: boolean
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean
  headlineFontSize?: number
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

const BACKGROUND_IMAGE = '/assets/backgrounds/Template_Website_EHS-Accelerate_Listing_background.png'
const TEXT_COLOR = '#060015'
const BORDER_COLOR = '#969899'
const PANEL_BG = '#FFFFFF'

export function WebsiteEhsAccelerateListing({
  eyebrow,
  headline,
  subhead,
  gridDetail1Text,
  gridDetail2Text,
  gridDetail3Text,
  gridDetail4Text,
  showRow3,
  showRow4,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  headlineFontSize,
  typography,
  scale = 1,
}: WebsiteEhsAccelerateListingProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // Grid rows — Row 1 always visible, Rows 2/3 toggleable, Row 4 always visible (CTA)
  const gridDetails = [
    { text: gridDetail1Text, isCtaRow: false },
    ...(showRow3 ? [{ text: gridDetail2Text, isCtaRow: false }] : []),
    ...(showRow4 ? [{ text: gridDetail3Text, isCtaRow: false }] : []),
    { text: gridDetail4Text, isCtaRow: true },
  ]

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    position: 'relative',
    background: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 42.67,
    display: 'flex',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  return (
    <div style={containerStyle}>
      {/* Full-canvas background image (gradients baked in). The right white
          panel sits on top and covers the right portion. */}
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        data-export-image="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Left content area */}
      <div
        style={{
          flex: '1 1 0',
          alignSelf: 'stretch',
          paddingTop: 64,
          paddingBottom: 32,
          paddingLeft: 32,
          paddingRight: 32,
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          display: 'inline-flex',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Content block */}
        <div
          style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 25.10,
            display: 'flex',
          }}
        >
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div
              style={{
                alignSelf: 'stretch',
                color: TEXT_COLOR,
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 1.38,
              }}
            >
              {eyebrow}
            </div>
          )}

          {/* Headline + Subhead */}
          <div
            style={{
              alignSelf: 'stretch',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 12,
              display: 'flex',
            }}
          >
            {showHeadline && (
              <div
                style={{
                  alignSelf: 'stretch',
                  color: TEXT_COLOR,
                  fontSize: headlineFontSize ?? 58,
                  fontWeight: 350,
                  lineHeight: `${(headlineFontSize ?? 58) * (64 / 58)}px`,
                }}
              >
                {headline || 'Headline'}
              </div>
            )}

            {showSubhead && subhead && (
              <div
                style={{
                  alignSelf: 'stretch',
                  color: TEXT_COLOR,
                  fontSize: 24,
                  fontWeight: 350,
                }}
              >
                {subhead}
              </div>
            )}
          </div>
        </div>

        {/* EHS+ Accelerate lockup (cority + EHS+ ACCELERATE + TECH CONVERGENCE WORKSHOP baked in) */}
        <div
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          <EhsAccelerateLogo width={254} />
        </div>
      </div>

      {/* Right grid panel — opaque white, covers right ~300px of the bg image */}
      <div
        style={{
          alignSelf: 'stretch',
          background: PANEL_BG,
          borderLeft: `1px ${BORDER_COLOR} solid`,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          display: 'inline-flex',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {gridDetails.map((detail, index) => (
          <div
            key={index}
            style={{
              width: 300,
              flex: '1 1 0',
              padding: 24,
              borderTop: index > 0 ? `1px ${BORDER_COLOR} solid` : undefined,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              display: 'inline-flex',
            }}
          >
            {detail.isCtaRow ? (
              <div
                style={{
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 12,
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    color: TEXT_COLOR,
                    fontSize: 20,
                    fontWeight: 350,
                  }}
                >
                  {detail.text}
                </div>
                <ArrowIcon color={TEXT_COLOR} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
              </div>
            ) : (
              <div
                style={{
                  color: TEXT_COLOR,
                  fontSize: 20,
                  fontWeight: 350,
                }}
              >
                {detail.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
