'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { CarouselSlide, CarouselBackgroundStyle } from '@/types'

// Inline SVG logo for export compatibility
const CorityLogo = ({ fill = '#FFFFFF', height = 36 }: { fill?: string; height?: number }) => {
  const width = Math.round(height * 3.056)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 383.8 128.41"
      width={width}
      height={height}
      fill={fill}
      style={{ flexShrink: 0, width, height }}
    >
      <path d="M278.36,86.3c-4.39,0-6.9-3.61-6.9-8.32V43.78h13l-6.78-17.41h-6.26V0H251.38V83.31c0,13.5,7.53,20.71,21.49,20.71,8.29,0,13.61-2.18,16.6-4.84L284,85A12.73,12.73,0,0,1,278.36,86.3Z"/>
      <path d="M112.31,24.18c-24.94,0-40,18.19-40,39.69s15.06,39.84,40,39.84c25.1,0,40.16-18.2,40.16-39.84S137.41,24.18,112.31,24.18Zm0,61.8C99.92,86,93,75.79,93,63.87c0-11.77,6.9-22,19.29-22s19.46,10.2,19.46,22C131.77,75.79,124.71,86,112.31,86Z"/>
      <path d="M41.1,41.9c6.9,0,12.39,2.83,16,8.16l.5-.47a53.22,53.22,0,0,1,7.54-17.11c-5.49-4.66-13.59-8.3-25-8.3C16.78,24.18,0,40.65,0,63.87s16.78,39.84,40.16,39.84c11.39,0,19.48-3.64,25-8.36a53.25,53.25,0,0,1-7.49-17l-.54-.49A19.12,19.12,0,0,1,41.1,86C29,86,20.55,77,20.55,63.87S29,41.9,41.1,41.9Z"/>
      <path d="M183.48,38.14A12.08,12.08,0,0,0,171.4,26.06h-7.84v75.77h19.92V53.51c3.3-4.86,12.08-8.63,18.67-8.63a25.46,25.46,0,0,1,5.49.63V26.06C198.23,26.06,188.81,31.39,183.48,38.14Z"/>
      <rect x="217.71" y="26.06" width="19.92" height="75.77"/>
      <path d="M347.67,26.06l-20,52.09L308.14,26.06H286.81l31.1,77.52-9.54,24.83h9.52a15.71,15.71,0,0,0,14.6-9.91l36.67-92.44Z"/>
      <rect x="217.71" width="19.92" height="16.98"/>
      <path d="M379,35.66a4.65,4.65,0,0,1-1.88-.38,4.73,4.73,0,0,1-1.54-1,4.82,4.82,0,0,1-1-1.54,4.91,4.91,0,0,1-.38-1.89,4.82,4.82,0,0,1,.38-1.88,4.88,4.88,0,0,1,2.58-2.58A4.82,4.82,0,0,1,379,26a4.91,4.91,0,0,1,1.89.38,4.67,4.67,0,0,1,1.53,1,4.82,4.82,0,0,1,1.42,3.42,4.73,4.73,0,0,1-.38,1.89,4.85,4.85,0,0,1-2.57,2.57A4.73,4.73,0,0,1,379,35.66Zm0-8.76a3.92,3.92,0,1,0,3.92,3.92A3.93,3.93,0,0,0,379,26.9Z"/>
      <path d="M380.66,32.86a7.57,7.57,0,0,0-.6-1.4A1.87,1.87,0,0,0,379,28H377v5.62h1.12V31.76h.79a4.21,4.21,0,0,1,.73,1.47,3.73,3.73,0,0,0,.14.4H381A5.08,5.08,0,0,1,380.66,32.86ZM379,30.64h-1v-1.5h1a.75.75,0,0,1,0,1.5Z"/>
    </svg>
  )
}

// Arrow icon for CTA
const ArrowIcon = ({ color = 'white', width = 33, height = 26 }: { color?: string; width?: number; height?: number }) => (
  <svg width={width} height={height} viewBox="0 0 33 26" fill="none">
    <path
      d="M19 1L31 13M31 13L19 25M31 13H1"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BACKGROUND_IMAGES: Record<CarouselBackgroundStyle, string> = {
  '1': '/assets/backgrounds/carousel-dark-gradient-1.png',
  '2': '/assets/backgrounds/carousel-dark-gradient-2.png',
  '3': '/assets/backgrounds/carousel-dark-gradient-3.png',
  '4': '/assets/backgrounds/carousel-dark-gradient-4.png',
  '5': '/assets/backgrounds/carousel-dark-gradient-5.png',
  '6': '/assets/backgrounds/carousel-dark-gradient-6.png',
  '7': '/assets/backgrounds/carousel-dark-gradient-7.png',
}

// Check if HTML content is effectively empty
function isHtmlEmpty(html: string | undefined): boolean {
  if (!html) return true
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return stripped === ''
}

// Rich text styles for HTML content
const RICH_TEXT_STYLES = `
  .rich-text-white strong { font-weight: 500; }
  .rich-text-white em { font-style: italic; }
  .rich-text-white p { margin: 0; }
  .rich-text-white p + p { margin-top: 0.3em; }
`

export interface SocialCarouselProps {
  slide: CarouselSlide
  logoColor?: 'orange' | 'white'
  colors: ColorsConfig
  typography: TypographyConfig
  scale?: number
}

export function SocialCarousel({
  slide,
  logoColor = 'white',
  colors,
  typography,
  scale = 1,
}: SocialCarouselProps) {
  const fontFamily = `"${typography.fontFamily.primary}", ${typography.fontFamily.fallback}`
  const logoFill = logoColor === 'orange' ? colors.brand.primary : '#FFFFFF'
  const textColor = '#FFFFFF'

  const containerStyle: CSSProperties = {
    width: 1080,
    height: 1080,
    position: 'relative',
    overflow: 'hidden',
    fontFamily,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    background: '#060015',
  }

  const hasHeadline = !isHtmlEmpty(slide.headline)
  const hasSubhead = !isHtmlEmpty(slide.subhead)
  const hasBody = !isHtmlEmpty(slide.body)

  // Determine font sizes based on slide type
  const isCoverOrOutro = slide.slideType === 'cover-text' || slide.slideType === 'cover-image' || slide.slideType === 'outro'
  const defaultHeadlineSize = isCoverOrOutro ? 112 : 60
  const headlineSize = slide.headlineFontSize ?? defaultHeadlineSize
  const subheadSize = isCoverOrOutro ? 45 : 38

  // Render based on slide type
  switch (slide.slideType) {
    case 'cover-text':
      return renderCoverText()
    case 'cover-image':
      return renderCoverImage()
    case 'text':
      return renderText()
    case 'text-image':
      return renderTextImage()
    case 'outro':
      return renderOutro()
    default:
      return renderCoverText()
  }

  function renderCoverText() {
    return (
      <div style={containerStyle}>
        <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />
        <img src={BACKGROUND_IMAGES[slide.backgroundStyle]} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 64, display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <CorityLogo fill={logoFill} height={36} />

          {/* Text block */}
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 66 }}>
            {/* Eyebrow */}
            {slide.showEyebrow && slide.eyebrow && (
              <div style={{ color: textColor, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1.54 }}>
                {slide.eyebrow}
              </div>
            )}
            {/* Headline */}
            {slide.showHeadline && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: headlineSize, fontWeight: 350, lineHeight: 1.05 }} dangerouslySetInnerHTML={{ __html: hasHeadline ? slide.headline : 'Headline' }} />
            )}
            {/* Subhead */}
            {slide.showSubhead && hasSubhead && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: subheadSize, fontWeight: 350, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: slide.subhead }} />
            )}
            {/* Body */}
            {slide.showBody && hasBody && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: 24, fontWeight: 350, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: slide.body }} />
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderCoverImage() {
    return (
      <div style={containerStyle}>
        <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />
        <img src={BACKGROUND_IMAGES[slide.backgroundStyle]} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'inline-flex', flexDirection: 'row' }}>
          {/* Left column */}
          <div style={{ width: 650, padding: 64, paddingRight: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <CorityLogo fill={logoFill} height={36} />

            {/* Text block */}
            <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 66 }}>
              {/* Eyebrow */}
              {slide.showEyebrow && slide.eyebrow && (
                <div style={{ color: textColor, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1.54 }}>
                  {slide.eyebrow}
                </div>
              )}
              {/* Headline */}
              {slide.showHeadline && (
                <div className="rich-text-white" style={{ color: textColor, fontSize: headlineSize, fontWeight: 350, lineHeight: 1.05 }} dangerouslySetInnerHTML={{ __html: hasHeadline ? slide.headline : 'Headline' }} />
              )}
              {/* Subhead */}
              {slide.showSubhead && hasSubhead && (
                <div className="rich-text-white" style={{ color: textColor, fontSize: subheadSize, fontWeight: 350, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: slide.subhead }} />
              )}
            </div>
          </div>

          {/* Right image - absolute positioned, bleeds to right edge */}
          {slide.imageUrl ? (
            <div
              style={{
                position: 'absolute',
                left: 778,
                top: 0,
                width: 302,
                height: 1080,
                overflow: 'hidden',
              }}
            >
              <img
                src={slide.imageUrl}
                alt=""
                data-export-image="true"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${50 - slide.imagePosition.x}% ${50 - slide.imagePosition.y}%`,
                  transform: slide.imageZoom !== 1
                    ? `translate(${slide.imagePosition.x * (slide.imageZoom - 1)}%, ${slide.imagePosition.y * (slide.imageZoom - 1)}%) scale(${slide.imageZoom})`
                    : undefined,
                  transformOrigin: 'center',
                  filter: slide.grayscale ? 'grayscale(100%)' : undefined,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                position: 'absolute',
                left: 778,
                top: 0,
                width: 302,
                height: 1080,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="1.5" />
                <path d="M2 16l5-5a2 2 0 012.8 0L14 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 13l2-2a2 2 0 012.8 0L22 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8.5" cy="9.5" r="1.5" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderText() {
    return (
      <div style={containerStyle}>
        <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />
        <img src={BACKGROUND_IMAGES[slide.backgroundStyle]} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 64, display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <CorityLogo fill={logoFill} height={36} />

          {/* Text block */}
          <div style={{ marginTop: 128, display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* Eyebrow */}
            {slide.showEyebrow && slide.eyebrow && (
              <div style={{ color: textColor, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1.54 }}>
                {slide.eyebrow}
              </div>
            )}
            {/* Headline */}
            {slide.showHeadline && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: headlineSize, fontWeight: 350, lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: hasHeadline ? slide.headline : 'Headline' }} />
            )}
            {/* Subhead */}
            {slide.showSubhead && hasSubhead && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: subheadSize, fontWeight: 350, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: slide.subhead }} />
            )}
            {/* Body */}
            {slide.showBody && hasBody && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: 24, fontWeight: 350, lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: slide.body }} />
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderTextImage() {
    return (
      <div style={containerStyle}>
        <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />
        <img src={BACKGROUND_IMAGES[slide.backgroundStyle]} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 64, display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <CorityLogo fill={logoFill} height={36} />

          {/* Text block */}
          <div style={{ marginTop: 128, display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* Eyebrow */}
            {slide.showEyebrow && slide.eyebrow && (
              <div style={{ color: textColor, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1.54 }}>
                {slide.eyebrow}
              </div>
            )}
            {/* Headline */}
            {slide.showHeadline && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: headlineSize, fontWeight: 350, lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: hasHeadline ? slide.headline : 'Headline' }} />
            )}
            {/* Subhead */}
            {slide.showSubhead && hasSubhead && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: subheadSize, fontWeight: 350, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: slide.subhead }} />
            )}
          </div>

          {/* Bottom image */}
          <div style={{ flex: 1 }} />
          {slide.imageUrl ? (
            <div
              style={{
                width: 952,
                height: 628,
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              <img
                src={slide.imageUrl}
                alt=""
                data-export-image="true"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${50 - slide.imagePosition.x}% ${50 - slide.imagePosition.y}%`,
                  transform: slide.imageZoom !== 1
                    ? `translate(${slide.imagePosition.x * (slide.imageZoom - 1)}%, ${slide.imagePosition.y * (slide.imageZoom - 1)}%) scale(${slide.imageZoom})`
                    : undefined,
                  transformOrigin: 'center',
                  filter: slide.grayscale ? 'grayscale(100%)' : undefined,
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 952,
                height: 628,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.25 }}>
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="1.5" />
                <path d="M2 16l5-5a2 2 0 012.8 0L14 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 13l2-2a2 2 0 012.8 0L22 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8.5" cy="9.5" r="1.5" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderOutro() {
    return (
      <div style={containerStyle}>
        <style dangerouslySetInnerHTML={{ __html: RICH_TEXT_STYLES }} />
        <img src={BACKGROUND_IMAGES[slide.backgroundStyle]} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Logo */}
          <CorityLogo fill={logoFill} height={36} />

          {/* Text block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            {/* Eyebrow */}
            {slide.showEyebrow && slide.eyebrow && (
              <div style={{ color: textColor, fontSize: 14, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1.54 }}>
                {slide.eyebrow}
              </div>
            )}
            {/* Headline */}
            {slide.showHeadline && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: headlineSize, fontWeight: 350, lineHeight: 1.05 }} dangerouslySetInnerHTML={{ __html: hasHeadline ? slide.headline : 'Headline' }} />
            )}
            {/* Subhead */}
            {slide.showSubhead && hasSubhead && (
              <div className="rich-text-white" style={{ color: textColor, fontSize: subheadSize, fontWeight: 350, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: slide.subhead }} />
            )}
          </div>

          {/* CTA */}
          {slide.showCta && slide.ctaText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: textColor, fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
                {slide.ctaText}
              </span>
              <ArrowIcon color={textColor} width={33} height={26} />
            </div>
          )}
        </div>
      </div>
    )
  }
}
