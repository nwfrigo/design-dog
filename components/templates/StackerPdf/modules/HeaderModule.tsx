'use client'

import { CSSProperties } from 'react'

// Arrow SVG for CTA
const ArrowIcon = () => (
  <svg
    width="11"
    height="9"
    viewBox="0 0 11 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 4.5H10M10 4.5L6.5 1M10 4.5L6.5 8"
      stroke="#060015"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export interface HeaderModuleProps {
  heading: string
  headingSize: 'h1' | 'h2'
  subheader?: string
  showSubheader: boolean
  cta?: string
  ctaUrl?: string
  showCta: boolean
  scale?: number
}

export function HeaderModule({
  heading,
  headingSize,
  subheader,
  showSubheader,
  cta,
  ctaUrl,
  showCta,
  scale = 1,
}: HeaderModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const containerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const textGroupStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }

  const headingStyle: CSSProperties = {
    color: 'black',
    fontSize: headingSize === 'h1' ? 36 : 30,
    fontWeight: 350,
    lineHeight: 1.15,
    margin: 0,
    wordWrap: 'break-word',
  }

  const subheaderStyle: CSSProperties = {
    color: 'black',
    fontSize: 12,
    fontWeight: 350,
    lineHeight: '16px',
    maxWidth: 360,
    margin: 0,
    wordWrap: 'break-word',
  }

  const ctaStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    cursor: ctaUrl ? 'pointer' : 'default',
  }

  const ctaTextStyle: CSSProperties = {
    color: '#060015',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '12px',
  }

  const ctaContent = (
    <>
      <span style={ctaTextStyle}>{cta || 'Responsive'}</span>
      <ArrowIcon />
    </>
  )

  return (
    <div style={containerStyle}>
      <div style={textGroupStyle}>
        <div style={headingStyle}>
          {heading || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'}
        </div>

        {showSubheader && subheader && (
          <div style={subheaderStyle}>
            {subheader}
          </div>
        )}
      </div>

      {showCta && (
        ctaUrl ? (
          <a href={ctaUrl} style={ctaStyle}>
            {ctaContent}
          </a>
        ) : (
          <div style={ctaStyle}>
            {ctaContent}
          </div>
        )
      )}
    </div>
  )
}

export default HeaderModule
