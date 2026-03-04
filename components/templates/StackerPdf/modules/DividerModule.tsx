'use client'

import { CSSProperties } from 'react'
import { getStackerTheme } from '@/lib/stacker-theme'

export interface DividerModuleProps {
  scale?: number
  darkMode?: boolean
}

export function DividerModule({
  scale = 1,
  darkMode,
}: DividerModuleProps) {
  const t = getStackerTheme(darkMode)

  const containerStyle: CSSProperties = {
    width: '100%',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const lineStyle: CSSProperties = {
    width: '100%',
    height: 1,
    background: t.dividerColor,
  }

  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
    </div>
  )
}

export default DividerModule
