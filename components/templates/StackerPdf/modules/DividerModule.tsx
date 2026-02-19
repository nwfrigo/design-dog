'use client'

import { CSSProperties } from 'react'

export interface DividerModuleProps {
  scale?: number
}

export function DividerModule({
  scale = 1,
}: DividerModuleProps) {
  const containerStyle: CSSProperties = {
    width: '100%',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const lineStyle: CSSProperties = {
    width: '100%',
    height: 1,
    background: '#B3B2B1',
  }

  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
    </div>
  )
}

export default DividerModule
