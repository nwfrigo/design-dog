'use client'

import { CSSProperties } from 'react'
import { getStackerTheme } from '@/lib/stacker-theme'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

const IMAGE_SIZE_WIDTHS: Record<'S' | 'M' | 'L', number> = {
  S: 200,
  M: 270,
  L: 372,
}

export interface ImageModuleProps {
  imagePosition: 'left' | 'right'
  imageSize?: 'S' | 'M' | 'L'
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
  darkMode?: boolean
}

export function ImageModule({
  imagePosition,
  imageSize = 'S',
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
  darkMode,
}: ImageModuleProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'
  const t = getStackerTheme(darkMode)

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
    width: IMAGE_SIZE_WIDTHS[imageSize],
    height: 200,
    borderRadius: 6.45,
    border: t.imageBorder,
    flexShrink: 0,
    backgroundColor: t.imagePlaceholderBg,
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
    color: t.textSecondary,
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.88,
    wordWrap: 'break-word',
  }

  const headingStyle: CSSProperties = {
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

  const ctaStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    cursor: ctaUrl ? 'pointer' : 'default',
  }

  const ctaTextStyle: CSSProperties = {
    color: t.ctaColor,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '12px',
  }

  const ctaContent = (
    <>
      <span style={ctaTextStyle}>{cta || 'Learn More'}</span>
      <ArrowIcon color={t.ctaColor} width={11} height={9} viewBox="0 0 11 9" pathD="M1 4.5H10M10 4.5L6.5 1M10 4.5L6.5 8" strokeWidth={1} />
    </>
  )

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
