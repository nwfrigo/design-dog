'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export type EventListingVariant = 'orange' | 'light' | 'dark-gradient'

export interface WebsiteEventListingProps {
  eyebrow: string
  headline: string
  subhead: string
  cta: string
  variant: EventListingVariant
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

export function WebsiteEventListing({
  eyebrow,
  headline,
  subhead,
  cta,
  variant,
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
  colors,
  typography,
  scale = 1,
}: WebsiteEventListingProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  // Get colors based on variant
  const getVariantColors = () => {
    switch (variant) {
      case 'orange':
        return {
          background: '#D35F0B',
          textColor: 'white',
          borderColor: 'white',
          logoFill: 'white',
          gridBackground: '#D35F0B',
        }
      case 'light':
        return {
          background: '#F9F9F9',
          textColor: '#060015',
          borderColor: '#D9D8D6',
          logoFill: 'black',
          gridBackground: '#F9F9F9',
        }
      case 'dark-gradient':
        return {
          background: '#060015',
          textColor: 'white',
          borderColor: '#0080FF',
          logoFill: 'white',
          gridBackground: '#060015',
        }
    }
  }

  const variantColors = getVariantColors()

  // Build grid details array:
  // - Row 1: always visible (not hideable)
  // - Row 2: hideable via showRow3 prop (naming inherited from social-grid-detail)
  // - Row 3: hideable via showRow4 prop (naming inherited from social-grid-detail)
  // - Row 4: always visible as CTA (not hideable)
  const gridDetails = [
    { text: gridDetail1Text, isCtaRow: false },
    ...(showRow3 ? [{ text: gridDetail2Text, isCtaRow: false }] : []),
    ...(showRow4 ? [{ text: gridDetail3Text, isCtaRow: false }] : []),
    { text: gridDetail4Text, isCtaRow: true }, // CTA row - always visible
  ]

  const containerStyle: CSSProperties = {
    width: 800,
    height: 450,
    position: 'relative',
    background: variantColors.background,
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
                color: variantColors.textColor,
                fontSize: 12.50,
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
                  color: variantColors.textColor,
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
                  color: variantColors.textColor,
                  fontSize: 24,
                  fontWeight: 350,
                }}
              >
                {subhead}
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 62.27,
            display: 'inline-flex',
          }}
        >
          <CorityLogo fill={variantColors.logoFill} height={36} />
        </div>
      </div>

      {/* Right side - Grid details panel */}
      <div
        style={{
          alignSelf: 'stretch',
          background: variantColors.gridBackground,
          boxShadow: variant === 'dark-gradient' ? '0px 0px 60px rgba(0, 127.50, 255, 0.30)' : undefined,
          borderLeft: `1px ${variantColors.borderColor} solid`,
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
              borderTop: index > 0 ? `1px ${variantColors.borderColor} solid` : undefined,
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
                    color: variantColors.textColor,
                    fontSize: 18,
                    fontWeight: 350,
                  }}
                >
                  {detail.text}
                </div>
                <ArrowIcon color={variantColors.textColor} width={17} height={14} viewBox="0 0 17 14" pathD="M10 1L16 7M16 7L10 13M16 7H1" strokeWidth={1.17} />
              </div>
            ) : (
              <div
                style={{
                  color: variantColors.textColor,
                  fontSize: 18,
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
