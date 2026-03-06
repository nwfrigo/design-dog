'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

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
  showHeadline?: boolean
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

  // Text sizing
  headlineFontSize?: number

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
  showHeadline = true,
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
  headlineFontSize,
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
            <ArrowIcon color="#060015" width={17} height={13} viewBox="0 0 17 13" pathD="M10 1L16 6.5M16 6.5L10 12M16 6.5H0" strokeLinecap="butt" strokeLinejoin="miter" />
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
            <SolutionPill
              variant="email-grid"
              solutionColor={solutionColor}
              solutionLabel={solutionLabel}
              textColor={colors.ui.textPrimary}
              background={colors.ui.surface}
              border={`0.79px solid ${colors.ui.border}`}
            />
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
          {showLightHeader && showHeadline && (
            <div style={{
              color: colors.ui.textPrimary,
              fontSize: headlineFontSize ?? 38,
              fontWeight: 300,
              lineHeight: `${(headlineFontSize ?? 38) * (48 / 38)}px`,
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
