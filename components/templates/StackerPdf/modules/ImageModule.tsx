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

export interface ImageModuleProps {
  imagePosition: 'left' | 'right'
  imageUrl: string | null
  imagePan: { x: number; y: number }
  imageZoom: number
  grayscale: boolean
  eyebrow: string
  showEyebrow: boolean
  heading: string
  showHeading: boolean
  body: string
  showBody: boolean
  cta: string
  ctaUrl: string
  showCta: boolean
  scale?: number
}

export function ImageModule({
  imagePosition,
  imageUrl,
  imagePan,
  imageZoom,
  grayscale,
  eyebrow,
  showEyebrow,
  heading,
  showHeading,
  body,
  showBody,
  cta,
  ctaUrl,
  showCta,
  scale = 1,
}: ImageModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const containerStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontFamily,
    flexDirection: imagePosition === 'right' ? 'row-reverse' : 'row',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const imageStyle: CSSProperties = {
    width: 200,
    height: 200,
    borderRadius: 6.45,
    border: '0.65px solid #D9D8D6',
    flexShrink: 0,
    backgroundColor: '#f5f5f5',
    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
    backgroundSize: `${imageZoom * 100}%`,
    backgroundPosition: `${50 + imagePan.x}% ${50 + imagePan.y}%`,
    backgroundRepeat: 'no-repeat',
    filter: grayscale ? 'grayscale(100%)' : undefined,
  }

  const textContainerStyle: CSSProperties = {
    flex: 1,
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

  const headingStyle: CSSProperties = {
    color: 'black',
    fontSize: 18,
    fontWeight: 350,
    wordWrap: 'break-word',
  }

  const bodyStyle: CSSProperties = {
    color: 'black',
    fontSize: 12,
    fontWeight: 350,
    lineHeight: '16px',
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
      <span style={ctaTextStyle}>{cta || 'Learn More'}</span>
      <ArrowIcon />
    </>
  )

  return (
    <div style={containerStyle}>
      <div style={imageStyle} />

      <div style={textContainerStyle}>
        {showEyebrow && eyebrow && (
          <div style={eyebrowStyle}>{eyebrow}</div>
        )}

        {showHeading && heading && (
          <div style={headingStyle}>{heading}</div>
        )}

        {showBody && body && (
          <div style={bodyStyle}>{body}</div>
        )}

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
    </div>
  )
}

export default ImageModule
