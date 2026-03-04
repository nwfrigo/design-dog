'use client'

import { CSSProperties } from 'react'
import { getStackerTheme } from '@/lib/stacker-theme'

export interface ParagraphModuleProps {
  intro: string
  body: string
  showIntro: boolean
  showBody: boolean
  scale?: number
  darkMode?: boolean
}

export function ParagraphModule({
  intro,
  body,
  showIntro,
  showBody,
  scale = 1,
  darkMode,
}: ParagraphModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'
  const t = getStackerTheme(darkMode)

  const containerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const introStyle: CSSProperties = {
    color: t.text,
    fontSize: 18,
    fontWeight: 350,
    wordWrap: 'break-word',
  }

  const bodyStyle: CSSProperties = {
    color: t.text,
    fontSize: 12,
    fontWeight: 350,
    lineHeight: '16px',
    wordWrap: 'break-word',
  }

  return (
    <div style={containerStyle}>
      {showIntro && intro && (
        <div style={introStyle}>
          {intro}
        </div>
      )}
      {showBody && body && (
        <div style={bodyStyle}>
          {body}
        </div>
      )}
    </div>
  )
}

export default ParagraphModule
