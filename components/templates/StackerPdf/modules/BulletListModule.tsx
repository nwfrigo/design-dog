'use client'

import { CSSProperties } from 'react'
import { getStackerTheme } from '@/lib/stacker-theme'

export interface BulletListModuleProps {
  heading: string
  showHeading?: boolean
  columns: [
    { label: string; bullets: string[] },
    { label: string; bullets: string[] },
    { label: string; bullets: string[] }
  ]
  accentColor?: string
  scale?: number
  darkMode?: boolean
}

export function BulletListModule({
  heading,
  showHeading = true,
  columns,
  accentColor = '#000000',
  scale = 1,
  darkMode,
}: BulletListModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'
  const t = getStackerTheme(darkMode)
  const effectiveAccent = darkMode && accentColor === '#000000' ? '#D35F0B' : accentColor

  const containerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const headingStyle: CSSProperties = {
    color: effectiveAccent,
    fontSize: 18,
    fontWeight: 350,
    wordWrap: 'break-word',
  }

  const columnsContainerStyle: CSSProperties = {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-start',
  }

  const columnStyle: CSSProperties = {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  }

  const labelStyle: CSSProperties = {
    color: t.text,
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.88,
    wordWrap: 'break-word',
  }

  const bulletListStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  }

  const bulletItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }

  const bulletDotStyle: CSSProperties = {
    width: 6,
    height: 6,
    background: effectiveAccent,
    borderRadius: 1.76,
    flexShrink: 0,
  }

  const bulletTextStyle: CSSProperties = {
    flex: '1 1 0',
    color: t.text,
    fontSize: 9,
    fontWeight: 350,
    lineHeight: '13px',
    wordWrap: 'break-word',
  }

  return (
    <div style={containerStyle}>
      {showHeading && heading && (
        <div style={headingStyle}>{heading}</div>
      )}

      <div style={columnsContainerStyle}>
        {columns.map((column, colIndex) => (
          <div key={colIndex} style={columnStyle}>
            {column.label && (
              <div style={labelStyle}>{column.label}</div>
            )}
            <div style={bulletListStyle}>
              {column.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} style={bulletItemStyle}>
                  <div style={bulletDotStyle} />
                  <div style={bulletTextStyle}>{bullet}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BulletListModule
