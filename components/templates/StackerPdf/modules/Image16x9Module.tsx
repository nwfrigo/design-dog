'use client'

import { CSSProperties } from 'react'

export interface Image16x9ModuleProps {
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
  scale?: number
}

export function Image16x9Module({
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
  scale = 1,
}: Image16x9ModuleProps) {
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

  const imageContainerStyle: CSSProperties = {
    width: 180,
    height: 100,
    borderRadius: 6.45,
    border: '0.33px solid #D9D8D6',
    flexShrink: 0,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  }

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${50 - imagePan.x}% ${50 - imagePan.y}%`,
    transform: imageZoom !== 1
      ? `translate(${imagePan.x * (imageZoom - 1)}%, ${imagePan.y * (imageZoom - 1)}%) scale(${imageZoom})`
      : undefined,
    transformOrigin: 'center',
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
    fontSize: 12,
    fontWeight: 350,
    lineHeight: '16px',
    wordWrap: 'break-word',
  }

  const bodyStyle: CSSProperties = {
    color: 'black',
    fontSize: 8,
    fontWeight: 350,
    lineHeight: '12px',
    wordWrap: 'break-word',
  }

  return (
    <div style={containerStyle}>
      <div style={imageContainerStyle}>
        {imageUrl ? (
          <img src={imageUrl} alt="" style={imageStyle} data-stacker-image="true" />
        ) : (
          <img alt="" style={{ ...imageStyle, display: 'none' }} data-stacker-image="true" />
        )}
      </div>

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
      </div>
    </div>
  )
}

export default Image16x9Module
