'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'

// Category chips configuration
const CATEGORIES = [
  { label: 'Environmental', color: '#49763E', shadowColor: 'rgba(0, 117, 14, 0.38)' },
  { label: 'Health', color: '#00767F', shadowColor: 'rgba(0, 118, 127, 0.60)' },
  { label: 'Safety', color: '#C3B01E', shadowColor: 'rgba(200, 178, 0, 0.50)' },
  { label: 'Quality', color: '#006FA3', shadowColor: 'rgba(0, 98, 189, 0.43)' },
  { label: 'Sustainability', color: '#A61F67', shadowColor: 'rgba(231, 105, 178, 0.50)' },
]

export type TopBannerVariant = 'dark' | 'light'

export interface NewsletterTopBannerProps {
  eyebrow: string
  headline: string
  subhead: string
  variant: TopBannerVariant
  showHeadline?: boolean
  showSubhead: boolean
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function NewsletterTopBanner({
  eyebrow,
  headline,
  subhead,
  variant = 'dark',
  showHeadline = true,
  showSubhead,
  colors,
  typography,
  scale = 1,
}: NewsletterTopBannerProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`

  const isDark = variant === 'dark'
  const textColor = isDark ? 'white' : 'black'
  const eyebrowColor = '#89888B'
  const chipTextColor = isDark ? 'white' : '#060015'
  const backgroundImage = `/assets/backgrounds/newsletter_header_background_${variant}.png`

  const containerStyle: CSSProperties = {
    width: 600,
    height: 240,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 34,
    paddingBottom: 34,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
    display: 'inline-flex',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  // Chip styles differ between dark and light variants
  const getChipStyle = (category: typeof CATEGORIES[0]): CSSProperties => {
    if (isDark) {
      return {
        paddingLeft: 10.40,
        paddingRight: 10.40,
        paddingTop: 7.12,
        paddingBottom: 7.12,
        background: 'rgba(0, 128, 255, 0.10)',
        borderRadius: 3.56,
        border: '0.50px solid #0080FF',
        backdropFilter: 'blur(1.75px)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6.84,
        display: 'flex',
      }
    } else {
      return {
        paddingLeft: 10.40,
        paddingRight: 10.40,
        paddingTop: 7.12,
        paddingBottom: 7.12,
        background: 'white',
        boxShadow: `0px 0px 7.2px ${category.shadowColor}`,
        borderRadius: 3.56,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6.84,
        display: 'flex',
      }
    }
  }

  return (
    <div style={containerStyle}>
      {/* Background Image */}
      <img
        src={backgroundImage}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Content Layer */}
      <div style={{
        alignSelf: 'stretch',
        flex: '1 1 0',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        display: 'flex',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header Row: Logo + Category Chips */}
        <div style={{
          height: 25,
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 80,
          display: 'inline-flex',
        }}>
          {/* Logo */}
          <CorityLogo fill="#D65F00" height={25} />

          {/* Category Chips */}
          <div style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 10.54,
            display: 'flex',
          }}>
            {CATEGORIES.map((category) => (
              <div key={category.label} style={getChipStyle(category)}>
                <div style={{
                  width: 5.20,
                  height: 5.20,
                  background: category.color,
                  borderRadius: 1.09,
                }} />
                <div style={{
                  color: chipTextColor,
                  fontSize: 8.21,
                  fontFamily: 'Fakt Pro',
                  fontWeight: '350',
                  wordWrap: 'break-word',
                }}>
                  {category.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text Content Area */}
        <div style={{
          width: 275,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 12.6,
          display: 'flex',
        }}>
          {/* Eyebrow */}
          <div style={{
            alignSelf: 'stretch',
            color: eyebrowColor,
            fontSize: 10,
            fontFamily: 'Fakt Pro',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 1.10,
            wordWrap: 'break-word',
          }}>
            {eyebrow || 'Month | Year'}
          </div>

          {/* Headline + Subhead */}
          <div style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 5.6,
            display: 'flex',
          }}>
            {showHeadline && (
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 36.91,
                fontFamily: 'Fakt Pro',
                fontWeight: '350',
                wordWrap: 'break-word',
              }}>
                {headline || 'EHS+ Newsletter'}
              </div>
            )}

            {showSubhead && subhead && (
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 22,
                fontFamily: 'Fakt Pro',
                fontWeight: '350',
                wordWrap: 'break-word',
              }}>
                {subhead}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
