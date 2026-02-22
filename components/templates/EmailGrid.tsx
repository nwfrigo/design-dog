'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo, ArrowIcon } from '@/components/shared'

export interface GridDetail {
  type: 'data' | 'cta'
  text: string
}

export interface EmailGridProps {
  // Content
  headline: string
  body: string
  showEyebrow: boolean
  eyebrow?: string
  showLightHeader: boolean
  showHeavyHeader: boolean
  showSubheading: boolean
  subheading?: string
  showBody: boolean

  // Solution pill
  showSolutionSet: boolean
  solution: string

  // Logo
  logoColor: 'black' | 'orange'

  // Grid details (right side)
  showGridDetail2: boolean // When false, only show 2 rows
  gridDetail1: GridDetail
  gridDetail2: GridDetail
  gridDetail3: GridDetail

  // Brand config
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function EmailGrid({
  headline,
  body,
  showEyebrow,
  eyebrow = '',
  showLightHeader,
  showHeavyHeader,
  showSubheading,
  subheading = '',
  showBody,
  showSolutionSet,
  solution,
  logoColor,
  showGridDetail2,
  gridDetail1,
  gridDetail2,
  gridDetail3,
  colors,
  typography,
  scale = 1,
}: EmailGridProps) {
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const borderColor = colors.ui.borderHighContrast || '#000000'

  // Determine which grid details to show
  const visibleGridDetails = showGridDetail2
    ? [gridDetail1, gridDetail2, gridDetail3]
    : [gridDetail1, gridDetail3] // Skip detail 2 when hidden

  const containerStyle: CSSProperties = {
    width: 640,
    height: 300,
    background: colors.ui.surface,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 24,
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }

  const renderGridDetail = (detail: GridDetail, index: number, isLast: boolean) => {
    const rowStyle: CSSProperties = {
      flex: '1 1 0',
      alignSelf: 'stretch',
      padding: 24,
      borderBottom: isLast ? 'none' : `0.75px solid ${borderColor}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    }

    if (detail.type === 'cta') {
      return (
        <div key={index} style={rowStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{
              color: '#060015',
              fontSize: 18,
              fontWeight: 300,
              lineHeight: '18px',
            }}>
              {detail.text}
            </span>
            <ArrowIcon color="#060015" />
          </div>
        </div>
      )
    }

    // Data row
    return (
      <div key={index} style={rowStyle}>
        <span style={{
          color: colors.ui.textPrimary,
          fontSize: 18,
          fontWeight: 300,
        }}>
          {detail.text}
        </span>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Left content area */}
      <div style={{
        width: 360,
        alignSelf: 'stretch',
        padding: 32,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {/* Header: Logo + Solution Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
        }}>
          <CorityLogo fill={logoFill} height={23} />

          {showSolutionSet && solution !== 'none' && (
            <div style={{
              padding: '12px 15px',
              background: colors.ui.surface,
              borderRadius: 6,
              border: `0.79px solid ${colors.ui.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 9,
                height: 9,
                background: solutionColor,
                borderRadius: 2,
              }} />
              <span style={{
                color: colors.ui.textPrimary,
                fontSize: 9,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.97px',
              }}>
                {solutionLabel}
              </span>
            </div>
          )}
        </div>

        {/* Text content */}
        <div style={{
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          {/* Eyebrow */}
          {showEyebrow && eyebrow && (
            <div style={{
              color: colors.ui.textPrimary,
              fontSize: 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1.1px',
            }}>
              {eyebrow}
            </div>
          )}

          {/* Headline */}
          {showLightHeader && (
            <div style={{
              color: colors.ui.textPrimary,
              fontSize: 38,
              fontWeight: 300,
              lineHeight: '48px',
            }}>
              {headline || 'Headline'}
            </div>
          )}

          {/* Subheading */}
          {showSubheading && subheading && (
            <div style={{
              color: colors.ui.textPrimary,
              fontSize: 20,
              fontWeight: 300,
              lineHeight: 1.3,
            }}>
              {subheading}
            </div>
          )}

          {/* Body */}
          {showBody && (
            <div style={{
              color: colors.ui.textPrimary,
              fontSize: 18,
              fontWeight: 300,
            }}>
              {body || 'This is your body copy. Lorem ipsum dolor sit am'}
            </div>
          )}
        </div>
      </div>

      {/* Right grid area */}
      <div style={{
        flex: '1 1 0',
        alignSelf: 'stretch',
        overflow: 'hidden',
        borderLeft: `0.75px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {visibleGridDetails.map((detail, index) =>
          renderGridDetail(detail, index, index === visibleGridDetails.length - 1)
        )}
      </div>
    </div>
  )
}
