'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

export interface GridDetailRow {
  type: 'data' | 'cta'
  text: string
}

export interface SocialGridDetailProps {
  // Content
  headline: string
  subhead: string
  eyebrow: string
  showEyebrow: boolean
  showHeadline?: boolean
  showSubhead: boolean

  // Solution pill
  showSolutionSet: boolean
  solution: string

  // Logo
  logoColor: 'black' | 'orange'

  // Grid details (4 rows)
  showRow3: boolean
  showRow4: boolean
  gridDetail1: GridDetailRow
  gridDetail2: GridDetailRow
  gridDetail3: GridDetailRow
  gridDetail4: GridDetailRow

  // Text sizing
  headlineFontSize?: number

  // Brand config
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function SocialGridDetail({
  headline,
  subhead,
  eyebrow,
  showEyebrow,
  showHeadline = true,
  showSubhead,
  showSolutionSet,
  solution,
  logoColor,
  showRow3,
  showRow4,
  gridDetail1,
  gridDetail2,
  gridDetail3,
  gridDetail4,
  headlineFontSize,
  colors,
  typography,
  scale = 1,
}: SocialGridDetailProps) {
  const solutionConfig = colors.solutions[solution] || colors.solutions.general
  const solutionColor = solutionConfig.color
  const solutionLabel = solutionConfig.label
  const logoFill = logoColor === 'orange' ? colors.brand.primary : colors.brand.black
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const borderColor = colors.ui.borderHighContrast || '#000000'
  const textColor = colors.ui.textPrimary

  // Build visible grid details based on toggle states
  const visibleGridDetails: GridDetailRow[] = [gridDetail1, gridDetail2]
  if (showRow3) visibleGridDetails.push(gridDetail3)
  if (showRow4) visibleGridDetails.push(gridDetail4)

  const containerStyle: CSSProperties = {
    width: 1200,
    height: 628,
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: 64,
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    overflow: 'hidden',
  }

  const renderGridDetail = (detail: GridDetailRow, index: number) => {
    const rowStyle: CSSProperties = {
      width: 360,
      flex: '1 1 0',
      padding: 24,
      borderBottom: `1px solid ${borderColor}`,
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
            gap: 16,
          }}>
            <span style={{
              color: '#0080FF',
              fontSize: 24,
              fontWeight: 500,
              lineHeight: '24px',
              textAlign: 'center',
            }}>
              {detail.text || 'Join the event'}
            </span>
            <ArrowIcon color="#0080FF" width={22} height={18} viewBox="0 0 22 18" pathD="M13 1L21 9M21 9L13 17M21 9H1" />
          </div>
        </div>
      )
    }

    // Data row
    return (
      <div key={index} style={rowStyle}>
        <span style={{
          color: textColor,
          fontSize: 24,
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
        flex: '1 1 0',
        alignSelf: 'stretch',
        paddingTop: 64,
        paddingBottom: 64,
        paddingLeft: 64,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {/* Header: Logo + Solution Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 64,
        }}>
          <CorityLogo fill={logoFill} height={37} />

          {showSolutionSet && solution !== 'none' && (
            <SolutionPill
              variant="social"
              solutionColor={solutionColor}
              solutionLabel={solutionLabel}
              textColor={textColor}
              background="#ffffff"
              border={`1.25px solid ${colors.ui.border}`}
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
              color: textColor,
              fontSize: 14,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1.54px',
            }}>
              {eyebrow}
            </div>
          )}

          {/* Headline + Subhead group */}
          <div style={{
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
          }}>
            {/* Headline */}
            {showHeadline && (
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: headlineFontSize ?? 84,
                fontWeight: 300,
                lineHeight: `${(headlineFontSize ?? 84) * (96 / 84)}px`,
              }}>
                {headline || 'Headline'}
              </div>
            )}

            {/* Subhead */}
            {showSubhead && subhead && (
              <div style={{
                alignSelf: 'stretch',
                color: textColor,
                fontSize: 36,
                fontWeight: 300,
                lineHeight: 1.3,
              }}>
                {subhead}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right grid area */}
      <div style={{
        alignSelf: 'stretch',
        borderLeft: `1px solid ${borderColor}`,
        borderTop: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}>
        {visibleGridDetails.map((detail, index) =>
          renderGridDetail(detail, index)
        )}
      </div>
    </div>
  )
}
