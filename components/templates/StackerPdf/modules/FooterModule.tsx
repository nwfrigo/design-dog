'use client'

import { CSSProperties } from 'react'

// Cority logo (orange version)
function CorityLogoOrange() {
  return (
    <svg width="60" height="20" viewBox="0 0 383.8 128.41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M278.36,86.3c-4.39,0-6.9-3.61-6.9-8.32V43.78h13l-6.78-17.41h-6.26V0H251.38V83.31c0,13.5,7.53,20.71,21.49,20.71,8.29,0,13.61-2.18,16.6-4.84L284,85A12.73,12.73,0,0,1,278.36,86.3Z" fill="#D35F0B"/>
      <path d="M112.31,24.18c-24.94,0-40,18.19-40,39.69s15.06,39.84,40,39.84c25.1,0,40.16-18.2,40.16-39.84S137.41,24.18,112.31,24.18Zm0,61.8C99.92,86,93,75.79,93,63.87c0-11.77,6.9-22,19.29-22s19.46,10.2,19.46,22C131.77,75.79,124.71,86,112.31,86Z" fill="#D35F0B"/>
      <path d="M41.1,41.9c6.9,0,12.39,2.83,16,8.16l.5-.47a53.22,53.22,0,0,1,7.54-17.11c-5.49-4.66-13.59-8.3-25-8.3C16.78,24.18,0,40.65,0,63.87s16.78,39.84,40.16,39.84c11.39,0,19.48-3.64,25-8.36a53.25,53.25,0,0,1-7.49-17l-.54-.49A19.12,19.12,0,0,1,41.1,86C29,86,20.55,77,20.55,63.87S29,41.9,41.1,41.9Z" fill="#D35F0B"/>
      <path d="M183.48,38.14A12.08,12.08,0,0,0,171.4,26.06h-7.84v75.77h19.92V53.51c3.3-4.86,12.08-8.63,18.67-8.63a25.46,25.46,0,0,1,5.49.63V26.06C198.23,26.06,188.81,31.39,183.48,38.14Z" fill="#D35F0B"/>
      <rect x="217.71" y="26.06" width="19.92" height="75.77" fill="#D35F0B"/>
      <path d="M347.67,26.06l-20,52.09L308.14,26.06H286.81l31.1,77.52-9.54,24.83h9.52a15.71,15.71,0,0,0,14.6-9.91l36.67-92.44Z" fill="#D35F0B"/>
      <rect x="217.71" width="19.92" height="16.98" fill="#D35F0B"/>
    </svg>
  )
}

export interface FooterModuleProps {
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  stat4Value: string
  stat4Label: string
  stat5Value: string
  stat5Label: string
  scale?: number
}

// Locked boilerplate about text
const ABOUT_TEXT = `Cority helps customers see and prevent risks across their operations, in real time. Our EHS+ platform converges people, data, and AI agents to stay ahead of the biggest operating risks across environmental management, employee health, safety, quality, and sustainability. For 40 years, Cority has been the market leader in EHS+, recognized by top analysts and trusted by more than 1,500 of the most complex organizations worldwide.`

export function FooterModule({
  stat1Value,
  stat1Label,
  stat2Value,
  stat2Label,
  stat3Value,
  stat3Label,
  stat4Value,
  stat4Label,
  stat5Value,
  stat5Label,
  scale = 1,
}: FooterModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const containerStyle: CSSProperties = {
    width: '100%',
    paddingTop: 24,
    paddingBottom: 24,
    borderTop: '0.5px solid #89888B',
    display: 'flex',
    alignItems: 'center',
    gap: 38,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const gridStyle: CSSProperties = {
    width: 222,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    columnGap: 24,
    rowGap: 18,
    flexShrink: 0,
  }

  const statStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  }

  const statValueStyle: CSSProperties = {
    fontSize: 20,
    fontWeight: 350,
    color: '#37393D',
    lineHeight: 1,
  }

  const statLabelStyle: CSSProperties = {
    fontSize: 8,
    fontWeight: 350,
    color: '#37393D',
    marginTop: 2,
  }

  const aboutStyle: CSSProperties = {
    flex: 1,
    fontSize: 9,
    fontWeight: 350,
    color: '#37393D',
    lineHeight: 1.5,
  }

  return (
    <div style={containerStyle}>
      {/* Left: 3x2 Grid (Logo + 5 Stats) */}
      <div style={gridStyle}>
        {/* Row 1, Col 1: Cority Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CorityLogoOrange />
        </div>

        {/* Row 1, Col 2: Stat 1 */}
        <div style={statStyle}>
          <div style={statValueStyle}>{stat1Value}</div>
          <div style={statLabelStyle}>{stat1Label}</div>
        </div>

        {/* Row 1, Col 3: Stat 2 */}
        <div style={statStyle}>
          <div style={statValueStyle}>{stat2Value}</div>
          <div style={statLabelStyle}>{stat2Label}</div>
        </div>

        {/* Row 2, Col 1: Stat 3 */}
        <div style={statStyle}>
          <div style={statValueStyle}>{stat3Value}</div>
          <div style={statLabelStyle}>{stat3Label}</div>
        </div>

        {/* Row 2, Col 2: Stat 4 */}
        <div style={statStyle}>
          <div style={statValueStyle}>{stat4Value}</div>
          <div style={statLabelStyle}>{stat4Label}</div>
        </div>

        {/* Row 2, Col 3: Stat 5 */}
        <div style={statStyle}>
          <div style={statValueStyle}>{stat5Value}</div>
          <div style={statLabelStyle}>{stat5Label}</div>
        </div>
      </div>

      {/* Right: About Paragraph */}
      <div style={aboutStyle}>
        {ABOUT_TEXT}
      </div>
    </div>
  )
}

export default FooterModule
