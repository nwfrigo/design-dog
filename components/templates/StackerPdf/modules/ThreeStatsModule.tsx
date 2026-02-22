'use client'

import { CSSProperties } from 'react'

export interface StatData {
  value: string
  label: string
}

export interface ThreeStatsModuleProps {
  stats: [StatData, StatData, StatData]
  showStat3?: boolean
  scale?: number
}

export function ThreeStatsModule({
  stats,
  showStat3 = true,
  scale = 1,
}: ThreeStatsModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const containerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    gap: 24,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const statStyle: CSSProperties = {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  }

  const valueStyle: CSSProperties = {
    color: 'black',
    fontSize: 36,
    fontWeight: 350,
    textAlign: 'center',
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

  const visibleStats = showStat3 ? stats : stats.slice(0, 2)

  return (
    <div style={containerStyle}>
      {visibleStats.map((stat, index) => (
        <div key={index} style={statStyle}>
          <div style={valueStyle}>{stat.value}</div>
          <div style={labelStyle}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export default ThreeStatsModule
