'use client'

import { CSSProperties } from 'react'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { CarouselSlide, CarouselBackgroundStyle } from '@/types'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { ArrowIcon } from '@/components/shared/ArrowIcon'

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
              <ArrowIcon color={textColor} width={33} height={26} viewBox="0 0 33 26" pathD="M19 1L31 13M31 13L19 25M31 13H1" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>
    )
  }
}
