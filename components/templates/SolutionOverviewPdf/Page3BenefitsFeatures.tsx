// Page 3: Benefits & Features - Solution Overview PDF Template
// Layout: Left column with benefits, right column (230px) with screenshot and features
// Full-height vertical divider at 230px from right edge
// Two-box footer with CTA and logo stacked in right box

import { solutionCategories, footerContactInfo, ctaOptions, type SolutionCategory } from '@/config/solution-overview-assets'
import { getIconByName } from '@/components/IconPickerModal'

// Inline SVG for Cority logo (black version for footer)
function CorityLogoBlack() {
  return (
    <svg width="50" height="16" viewBox="0 0 383.8 128.41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M278.36,86.3c-4.39,0-6.9-3.61-6.9-8.32V43.78h13l-6.78-17.41h-6.26V0H251.38V83.31c0,13.5,7.53,20.71,21.49,20.71,8.29,0,13.61-2.18,16.6-4.84L284,85A12.73,12.73,0,0,1,278.36,86.3Z" fill="black"/>
      <path d="M112.31,24.18c-24.94,0-40,18.19-40,39.69s15.06,39.84,40,39.84c25.1,0,40.16-18.2,40.16-39.84S137.41,24.18,112.31,24.18Zm0,61.8C99.92,86,93,75.79,93,63.87c0-11.77,6.9-22,19.29-22s19.46,10.2,19.46,22C131.77,75.79,124.71,86,112.31,86Z" fill="black"/>
      <path d="M41.1,41.9c6.9,0,12.39,2.83,16,8.16l.5-.47a53.22,53.22,0,0,1,7.54-17.11c-5.49-4.66-13.59-8.3-25-8.3C16.78,24.18,0,40.65,0,63.87s16.78,39.84,40.16,39.84c11.39,0,19.48-3.64,25-8.36a53.25,53.25,0,0,1-7.49-17l-.54-.49A19.12,19.12,0,0,1,41.1,86C29,86,20.55,77,20.55,63.87S29,41.9,41.1,41.9Z" fill="black"/>
      <path d="M183.48,38.14A12.08,12.08,0,0,0,171.4,26.06h-7.84v75.77h19.92V53.51c3.3-4.86,12.08-8.63,18.67-8.63a25.46,25.46,0,0,1,5.49.63V26.06C198.23,26.06,188.81,31.39,183.48,38.14Z" fill="black"/>
      <rect x="217.71" y="26.06" width="19.92" height="75.77" fill="black"/>
      <path d="M347.67,26.06l-20,52.09L308.14,26.06H286.81l31.1,77.52-9.54,24.83h9.52a15.71,15.71,0,0,0,14.6-9.91l36.67-92.44Z" fill="black"/>
      <rect x="217.71" width="19.92" height="16.98" fill="black"/>
      <path d="M379,35.66a4.65,4.65,0,0,1-1.88-.38,4.73,4.73,0,0,1-1.54-1,4.82,4.82,0,0,1-1-1.54,4.91,4.91,0,0,1-.38-1.89,4.82,4.82,0,0,1,.38-1.88,4.88,4.88,0,0,1,2.58-2.58A4.82,4.82,0,0,1,379,26a4.91,4.91,0,0,1,1.89.38,4.67,4.67,0,0,1,1.53,1,4.82,4.82,0,0,1,1.42,3.42,4.73,4.73,0,0,1-.38,1.89,4.85,4.85,0,0,1-2.57,2.57A4.73,4.73,0,0,1,379,35.66Zm0-8.76a3.92,3.92,0,1,0,3.92,3.92A3.93,3.93,0,0,0,379,26.9Z" fill="black"/>
      <path d="M380.66,32.86a7.57,7.57,0,0,0-.6-1.4A1.87,1.87,0,0,0,379,28H377v5.62h1.12V31.76h.79a4.21,4.21,0,0,1,.73,1.47,3.73,3.73,0,0,0,.14.4H381A5.08,5.08,0,0,1,380.66,32.86ZM379,30.64h-1v-1.5h1a.75.75,0,0,1,0,1.5Z" fill="black"/>
    </svg>
  )
}

// Render Lucide icon in a styled container (17x17 white background, no border)
function BenefitIcon({ iconId }: { iconId: string }) {
  const IconComponent = getIconByName(iconId)

  return (
    <div
      style={{
        width: 17,
        height: 17,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {IconComponent ? (
        <IconComponent
          size={17}
          strokeWidth={1.5}
          color="#37393D"
        />
      ) : (
        // Fallback circle icon
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <circle cx="8.5" cy="8.5" r="5" stroke="#37393D" strokeWidth="1.5"/>
        </svg>
      )}
    </div>
  )
}

export interface SolutionOverviewBenefit {
  icon: string
  title: string
  description: string
}

export interface SolutionOverviewFeature {
  title: string
  description: string
}

export interface Page3BenefitsFeaturesProps {
  solution: SolutionCategory
  solutionName: string
  benefits: SolutionOverviewBenefit[]
  features: SolutionOverviewFeature[]
  screenshotUrl: string | null
  screenshotPosition: { x: number; y: number }
  screenshotZoom: number
  screenshotGrayscale?: boolean
  ctaOption: 'demo' | 'learn' | 'start' | 'contact'
  ctaUrl?: string
  scale?: number
}

export function Page3BenefitsFeatures({
  solution,
  solutionName,
  benefits,
  features,
  screenshotUrl,
  screenshotPosition,
  screenshotZoom,
  screenshotGrayscale = false,
  ctaOption,
  ctaUrl,
  scale = 1,
}: Page3BenefitsFeaturesProps) {
  const solutionConfig = solutionCategories[solution]
  const solutionColor = solutionConfig.color
  const ctaLabel = ctaOptions.find(opt => opt.id === ctaOption)?.label || 'Request a demo'

  // Layout constants
  const pageWidth = 612
  const pageHeight = 792
  const verticalLineX = pageWidth - 230 // 382px from left
  const footerHeight = 146
  const footerDividerX = verticalLineX / 2 // 191px - halfway between vertical line and left edge

  // CTA button component (supports hyperlink)
  const CTAButton = () => {
    const buttonStyle: React.CSSProperties = {
      padding: '12px 20px 10px 20px',
      background: '#D35F0B',
      borderRadius: 9999, // Pill shape
      color: 'white',
      fontSize: 11,
      fontFamily: 'Fakt Pro, sans-serif',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none',
      lineHeight: 1,
    }

    const content = (
      <>
        {ctaLabel}
        {/* Arrow */}
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M7 1L11 5M11 5L7 9M11 5H1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </>
    )

    if (ctaUrl) {
      return (
        <a href={ctaUrl} style={buttonStyle} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      )
    }

    return <div style={buttonStyle}>{content}</div>
  }

  return (
    <div
      style={{
        width: pageWidth,
        height: pageHeight,
        position: 'relative',
        background: 'white',
        overflow: 'hidden',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      {/* Full-height vertical divider - 230px from right edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: verticalLineX,
          width: 0.5,
          height: pageHeight,
          background: '#89888B',
          zIndex: 10,
        }}
      />

      {/* Horizontal footer divider - only extends to vertical line */}
      <div
        style={{
          position: 'absolute',
          top: pageHeight - footerHeight,
          left: 0,
          width: verticalLineX + 0.5, // Goes up to and includes the vertical line
          height: 0.5,
          background: '#89888B',
        }}
      />

      {/* Footer vertical divider - halfway between main vertical and left edge */}
      <div
        style={{
          position: 'absolute',
          top: pageHeight - footerHeight,
          left: footerDividerX,
          width: 0.5,
          height: footerHeight,
          background: '#89888B',
        }}
      />


      {/* Left Column - Benefits (width: 382px minus padding) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: verticalLineX,
          height: pageHeight - footerHeight,
          padding: '32px 40px',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 8,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 500,
            color: solutionColor,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          {solutionName}
        </div>

        {/* Key Benefits Heading - matches H2 (18pt blonde) */}
        <div
          style={{
            fontSize: 18,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 350,
            color: '#060015',
            marginBottom: 20,
          }}
        >
          Key Benefits
        </div>

        {/* Benefits List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {/* Header row: Icon + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Icon - dark over white */}
                <div style={{ flexShrink: 0 }}>
                  <BenefitIcon iconId={benefit.icon} />
                </div>
                {/* Title - 12pt semibold */}
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: 'Fakt Pro, sans-serif',
                    fontWeight: 500,
                    color: '#060015',
                  }}
                >
                  {benefit.title}
                </div>
              </div>
              {/* Description - 12pt blonde, left-aligned with icon edge */}
              <div
                style={{
                  fontSize: 12,
                  fontFamily: 'Fakt Pro, sans-serif',
                  fontWeight: 350,
                  color: '#37393D',
                  lineHeight: 1.5,
                }}
              >
                {benefit.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Screenshot and Features (230px wide) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 230,
          height: pageHeight - footerHeight,
          padding: '32px 40px 32px 24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Product Screenshot - 230x230px */}
        <div
          style={{
            width: 230,
            minWidth: 230,
            height: 230,
            minHeight: 230,
            marginTop: -32, // Offset to align with column top edge
            marginLeft: -24, // Offset to align with column left edge
            marginRight: -40, // Offset to align with column right edge
            marginBottom: 12,
            flexShrink: 0,
            borderRadius: 0,
            borderBottom: '0.5px solid #89888B',
            overflow: 'hidden',
            background: screenshotUrl
              ? undefined
              : 'linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 100%)',
          }}
        >
          {/* Always render img element so data URLs can be injected for export */}
          <img
            src={screenshotUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
            alt=""
            data-so-screenshot="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${50 - screenshotPosition.x}% ${50 - screenshotPosition.y}%`,
              transform: screenshotZoom !== 1
                ? `translate(${screenshotPosition.x * (screenshotZoom - 1)}%, ${screenshotPosition.y * (screenshotZoom - 1)}%) scale(${screenshotZoom})`
                : undefined,
              transformOrigin: 'center',
              filter: screenshotGrayscale ? 'grayscale(100%)' : undefined,
              display: screenshotUrl ? 'block' : 'none',
            }}
          />
          {!screenshotUrl && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: 9,
                fontFamily: 'Fakt Pro, sans-serif',
              }}
            >
              Product Screenshot
            </div>
          )}
        </div>

        {/* Powerful Features Heading - matches H2 (18pt blonde) */}
        <div
          style={{
            fontSize: 18,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 350,
            color: '#060015',
            marginBottom: 16,
          }}
        >
          Powerful Features
        </div>

        {/* Features List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((feature, index) => (
            <div key={index}>
              {/* Title - 9pt semibold, solution color */}
              <div
                style={{
                  fontSize: 9,
                  fontFamily: 'Fakt Pro, sans-serif',
                  fontWeight: 500,
                  color: solutionColor,
                  marginBottom: 3,
                }}
              >
                {feature.title}
              </div>
              {/* Description - 9pt blonde */}
              <div
                style={{
                  fontSize: 9,
                  fontFamily: 'Fakt Pro, sans-serif',
                  fontWeight: 350,
                  color: '#37393D',
                  lineHeight: 1.5,
                }}
              >
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Left Box (Contact Info) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: footerDividerX,
          height: footerHeight,
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 400,
            color: '#37393D',
          }}
        >
          {footerContactInfo.phone}
        </div>
        <div
          style={{
            fontSize: 9,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 400,
            color: '#37393D',
          }}
        >
          {footerContactInfo.email}
        </div>
        <div
          style={{
            fontSize: 9,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 400,
            color: solutionColor,
          }}
        >
          {footerContactInfo.website}
        </div>
      </div>

      {/* Footer - Right Box (CTA and Logo stacked vertically) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: footerDividerX,
          width: verticalLineX - footerDividerX, // From footer divider to main vertical line
          height: footerHeight,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <CTAButton />
        <CorityLogoBlack />
      </div>
    </div>
  )
}
