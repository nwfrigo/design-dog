'use client'

import { CSSProperties } from 'react'
import type { SolutionCategory } from '@/types'
import { getStackerTheme } from '@/lib/stacker-theme'
import { CorityLogo } from '@/components/shared/CorityLogo'

// Solution category colors
const SOLUTION_COLORS: Record<SolutionCategory, string> = {
  environmental: '#49763E',
  health: '#00767F',
  safety: '#C3B01E',
  quality: '#006FA3',
  sustainability: '#A61F67',
  converged: '#D35F0B',
}

const SOLUTION_LABELS: Record<SolutionCategory, string> = {
  environmental: 'ENVIRONMENTAL',
  health: 'HEALTH',
  safety: 'SAFETY',
  quality: 'QUALITY',
  sustainability: 'SUSTAINABILITY',
  converged: 'CONVERGED',
}

// Categories to display (excluding converged for chip row)
const DISPLAY_CATEGORIES: SolutionCategory[] = ['environmental', 'health', 'safety', 'quality', 'sustainability']

export interface LogoChipModuleProps {
  showChips: boolean
  activeCategories: SolutionCategory[]
  scale?: number
  darkMode?: boolean
}

export function LogoChipModule({
  showChips,
  activeCategories,
  scale = 1,
  darkMode,
}: LogoChipModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'
  const t = getStackerTheme(darkMode)

  const containerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const chipRowStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
  }

  const getChipStyle = (isActive: boolean): CSSProperties => ({
    padding: 7,
    background: isActive ? t.chipActiveBg : 'transparent',
    borderRadius: 3,
    border: isActive ? t.chipActiveBorder : `0.14px solid ${t.chipInactiveBorder}`,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  })

  const getDotStyle = (category: SolutionCategory, isActive: boolean): CSSProperties => ({
    width: 7,
    height: 7,
    background: isActive ? SOLUTION_COLORS[category] : t.chipInactiveDot,
    borderRadius: 1,
    flexShrink: 0,
  })

  const getLabelStyle = (isActive: boolean): CSSProperties => ({
    color: isActive ? t.chipActiveText : t.chipInactiveText,
    fontSize: 5,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    whiteSpace: 'nowrap',
    lineHeight: 1,
    position: 'relative',
    top: 1,
  })

  return (
    <div style={containerStyle}>
      <CorityLogo height={20} fill={t.logoFill} />

      {showChips && (
        <div style={chipRowStyle}>
          {DISPLAY_CATEGORIES.map((category) => {
            const isActive = activeCategories.includes(category)
            return (
              <div key={category} style={getChipStyle(isActive)}>
                <div style={getDotStyle(category, isActive)} />
                <span style={getLabelStyle(isActive)}>
                  {SOLUTION_LABELS[category]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LogoChipModule
