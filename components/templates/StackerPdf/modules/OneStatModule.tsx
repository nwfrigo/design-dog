'use client'

import { CSSProperties } from 'react'

export interface OneStatModuleProps {
  value: string
  label: string
  eyebrow: string
  body: string
  scale?: number
}

export function OneStatModule({
  value,
  label,
  eyebrow,
  body,
  scale = 1,
}: OneStatModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const containerStyle: CSSProperties = {
    width: '100%',
    padding: 24,
    background: '#F9F9F9',
    borderRadius: 6,
    border: '1px solid #D9D8D6',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const statContainerStyle: CSSProperties = {
    flex: '1 1 0',
    maxWidth: 172,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  }

  const valueStyle: CSSProperties = {
    color: 'black',
    fontSize: 36,
    fontWeight: 350,
    wordWrap: 'break-word',
  }

  const labelStyle: CSSProperties = {
    width: '100%',
    maxWidth: 172,
    textAlign: 'center',
    color: 'black',
    fontSize: 8,
    fontWeight: 350,
    lineHeight: '12px',
    wordWrap: 'break-word',
  }

  const textContainerStyle: CSSProperties = {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }

  const eyebrowStyle: CSSProperties = {
    color: 'black',
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.88,
    wordWrap: 'break-word',
  }

  const bodyStyle: CSSProperties = {
    color: 'black',
    fontSize: 12,
    fontWeight: 350,
    lineHeight: '16px',
    wordWrap: 'break-word',
  }

  return (
    <div style={containerStyle}>
      <div style={statContainerStyle}>
        <div style={valueStyle}>{value}</div>
        <div style={labelStyle}>{label}</div>
      </div>
      <div style={textContainerStyle}>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <div style={bodyStyle}>{body}</div>
      </div>
    </div>
  )
}

export default OneStatModule
