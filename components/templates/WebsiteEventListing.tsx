'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'

// Inline SVG logo for export compatibility
const CorityLogo = ({ fill = '#FFFFFF', height = 36 }: { fill?: string; height?: number }) => {
  const width = Math.round(height * 3.062)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 383.8 128.41"
      width={width}
      height={height}
      fill={fill}
    >
      <path d="M278.36,86.3c-4.39,0-6.9-3.61-6.9-8.32V43.78h13l-6.78-17.41h-6.26V0H251.38V83.31c0,13.5,7.53,20.71,21.49,20.71,8.29,0,13.61-2.18,16.6-4.84L284,85A12.73,12.73,0,0,1,278.36,86.3Z"/>
      <path d="M112.31,24.18c-24.94,0-40,18.19-40,39.69s15.06,39.84,40,39.84c25.1,0,40.16-18.2,40.16-39.84S137.41,24.18,112.31,24.18Zm0,61.8C99.92,86,93,75.79,93,63.87c0-11.77,6.9-22,19.29-22s19.46,10.2,19.46,22C131.77,75.79,124.71,86,112.31,86Z"/>
      <path d="M41.1,41.9c6.9,0,12.39,2.83,16,8.16l.5-.47a53.22,53.22,0,0,1,7.54-17.11c-5.49-4.66-13.59-8.3-25-8.3C16.78,24.18,0,40.65,0,63.87s16.78,39.84,40.16,39.84c11.39,0,19.48-3.64,25-8.36a53.25,53.25,0,0,1-7.49-17l-.54-.49A19.12,19.12,0,0,1,41.1,86C29,86,20.55,77,20.55,63.87S29,41.9,41.1,41.9Z"/>
      <path d="M183.48,38.14A12.08,12.08,0,0,0,171.4,26.06h-7.84v75.77h19.92V53.51c3.3-4.86,12.08-8.63,18.67-8.63a25.46,25.46,0,0,1,5.49.63V26.06C198.23,26.06,188.81,31.39,183.48,38.14Z"/>
      <rect x="217.71" y="26.06" width="19.92" height="75.77"/>
      <path d="M347.67,26.06l-20,52.09L308.14,26.06H286.81l31.1,77.52-9.54,24.83h9.52a15.71,15.71,0,0,0,14.6-9.91l36.67-92.44Z"/>
      <rect x="217.71" width="19.92" height="16.98"/>
      <path d="M379,35.66a4.65,4.65,0,0,1-1.88-.38,4.73,4.73,0,0,1-1.54-1,4.82,4.82,0,0,1-1-1.54,4.91,4.91,0,0,1-.38-1.89,4.82,4.82,0,0,1,.38-1.88,4.88,4.88,0,0,1,2.58-2.58A4.82,4.82,0,0,1,379,26a4.91,4.91,0,0,1,1.89.38,4.67,4.67,0,0,1,1.53,1,4.82,4.82,0,0,1,1.42,3.42,4.73,4.73,0,0,1-.38,1.89,4.85,4.85,0,0,1-2.57,2.57A4.73,4.73,0,0,1,379,35.66Zm0-8.76a3.92,3.92,0,1,0,3.92,3.92A3.93,3.93,0,0,0,379,26.9Z"/>
      <path d="M380.66,32.86a7.57,7.57,0,0,0-.6-1.4A1.87,1.87,0,0,0,379,28H377v5.62h1.12V31.76h.79a4.21,4.21,0,0,1,.73,1.47,3.73,3.73,0,0,0,.14.4H381A5.08,5.08,0,0,1,380.66,32.86ZM379,30.64h-1v-1.5h1a.75.75,0,0,1,0,1.5Z"/>
    </svg>
  )
}

// Arrow icon for CTA
const ArrowIcon = ({ color = '#FFFFFF' }: { color?: string }) => (
  <svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1L16 7M16 7L10 13M16 7H1" stroke={color} strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

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
  showSubhead: boolean
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
  showSubhead,
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
          borderColor: 'white',
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
      {/* Dark gradient background effect */}
      {variant === 'dark-gradient' && (
        <div
          style={{
            width: 800,
            height: 450,
            position: 'absolute',
            left: 0,
            top: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src="/assets/backgrounds/website_event_listing_dark_background.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

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
            <div
              style={{
                alignSelf: 'stretch',
                color: variantColors.textColor,
                fontSize: 58,
                fontWeight: 350,
                lineHeight: '64px',
              }}
            >
              {headline || 'Headline'}
            </div>

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
          borderTop: `0.67px ${variantColors.borderColor} solid`,
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
              borderBottom: `1px ${variantColors.borderColor} solid`,
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
                <ArrowIcon color={variantColors.textColor} />
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
