'use client'

import { CSSProperties } from 'react'
import { getStackerTheme } from '@/lib/stacker-theme'

export interface QuoteModuleProps {
  quote: string
  name: string
  jobTitle: string
  organization: string
  scale?: number
  darkMode?: boolean
}

export function QuoteModule({
  quote,
  name,
  jobTitle,
  organization,
  scale = 1,
  darkMode,
}: QuoteModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'
  const t = getStackerTheme(darkMode)

  const containerStyle: CSSProperties = {
    width: '100%',
    paddingLeft: 48,
    paddingRight: 48,
    paddingTop: 24,
    paddingBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const quoteStyle: CSSProperties = {
    width: '100%',
    textAlign: 'center',
    color: t.ctaColor,
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: 350,
    wordWrap: 'break-word',
  }

  const attributionContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  }

  const nameStyle: CSSProperties = {
    textAlign: 'center',
    color: t.text,
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.88,
    wordWrap: 'break-word',
  }

  const titlesContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  }

  const titleStyle: CSSProperties = {
    textAlign: 'center',
    color: t.text,
    fontSize: 9,
    fontWeight: 350,
    wordWrap: 'break-word',
  }

  return (
    <div style={containerStyle}>
      <div style={quoteStyle}>
        {quote || '"Enter your quote here"'}
      </div>
      <div style={attributionContainerStyle}>
        <div style={nameStyle}>
          {name || 'Firstname Lastname'}
        </div>
        <div style={titlesContainerStyle}>
          <div style={titleStyle}>
            {jobTitle || 'Job Title'}
          </div>
          <div style={titleStyle}>
            {organization || 'Organization Name'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteModule
