// Page 2: Body - Solution Overview PDF Template
// Layout: Header band with hero image, main content with intro and key solutions, quote section, stats/about footer

import { solutionCategories, type SolutionCategory } from '@/config/solution-overview-assets'

// Inline SVG for Cority logo (black version, 40px wide)
function CorityLogoBlack() {
  return (
    <svg width="40" height="13" viewBox="0 0 383.8 128.41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M278.36,86.3c-4.39,0-6.9-3.61-6.9-8.32V43.78h13l-6.78-17.41h-6.26V0H251.38V83.31c0,13.5,7.53,20.71,21.49,20.71,8.29,0,13.61-2.18,16.6-4.84L284,85A12.73,12.73,0,0,1,278.36,86.3Z" fill="black"/>
      <path d="M112.31,24.18c-24.94,0-40,18.19-40,39.69s15.06,39.84,40,39.84c25.1,0,40.16-18.2,40.16-39.84S137.41,24.18,112.31,24.18Zm0,61.8C99.92,86,93,75.79,93,63.87c0-11.77,6.9-22,19.29-22s19.46,10.2,19.46,22C131.77,75.79,124.71,86,112.31,86Z" fill="black"/>
      <path d="M41.1,41.9c6.9,0,12.39,2.83,16,8.16l.5-.47a53.22,53.22,0,0,1,7.54-17.11c-5.49-4.66-13.59-8.3-25-8.3C16.78,24.18,0,40.65,0,63.87s16.78,39.84,40.16,39.84c11.39,0,19.48-3.64,25-8.36a53.25,53.25,0,0,1-7.49-17l-.54-.49A19.12,19.12,0,0,1,41.1,86C29,86,20.55,77,20.55,63.87S29,41.9,41.1,41.9Z" fill="black"/>
      <path d="M183.48,38.14A12.08,12.08,0,0,0,171.4,26.06h-7.84v75.77h19.92V53.51c3.3-4.86,12.08-8.63,18.67-8.63a25.46,25.46,0,0,1,5.49.63V26.06C198.23,26.06,188.81,31.39,183.48,38.14Z" fill="black"/>
      <rect x="217.71" y="26.06" width="19.92" height="75.77" fill="black"/>
      <path d="M347.67,26.06l-20,52.09L308.14,26.06H286.81l31.1,77.52-9.54,24.83h9.52a15.71,15.71,0,0,0,14.6-9.91l36.67-92.44Z" fill="black"/>
      <rect x="217.71" width="19.92" height="16.98" fill="black"/>
    </svg>
  )
}

export interface Page2BodyProps {
  solution: SolutionCategory
  page2Header: string
  heroImageUrl?: string
  heroImagePosition?: { x: number; y: number }
  heroImageZoom?: number
  heroImageGrayscale?: boolean
  sectionHeader: string
  introParagraph: string
  keySolutions: string[]
  quoteText: string
  quoteName: string
  quoteTitle: string
  quoteCompany: string
  // Footer stats (editable)
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  stat4Value?: string
  stat4Label?: string
  stat5Value?: string
  stat5Label?: string
  scale?: number
}

export function Page2Body({
  solution,
  page2Header,
  heroImageUrl,
  heroImagePosition = { x: 0, y: 0 },
  heroImageZoom = 1,
  heroImageGrayscale = false,
  sectionHeader,
  introParagraph,
  keySolutions,
  quoteText,
  quoteName,
  quoteTitle,
  quoteCompany,
  // Footer stats with defaults
  stat1Value = '20+',
  stat1Label = 'Awards',
  stat2Value = '350+',
  stat2Label = 'Experts',
  stat3Value = '100%',
  stat3Label = 'Deployment',
  stat4Value = '2M+',
  stat4Label = 'End Users',
  stat5Value = '1.2K',
  stat5Label = 'Clients',
  scale = 1,
}: Page2BodyProps) {
  const solutionConfig = solutionCategories[solution]
  const solutionColor = solutionConfig.color

  // Render line breaks as <br /> for WYSIWYG-style preservation
  const renderWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div
      style={{
        width: 612,
        height: 792,
        position: 'relative',
        background: 'white',
        overflow: 'hidden',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
      }}
    >
      {/* Header Band - 180px height */}
      <div
        style={{
          width: '100%',
          height: 180,
          display: 'flex',
          borderBottom: '0.5px solid #89888B',
        }}
      >
        {/* Left side - Solution name H1 */}
        <div
          style={{
            width: 230,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px',
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 350,
              color: '#060015',
              lineHeight: 1.2,
            }}
          >
            {page2Header}
          </div>
        </div>

        {/* Right side - Hero image (382px wide, left-aligned to right edge) */}
        <div
          style={{
            width: 382,
            height: '100%',
            overflow: 'hidden',
            background: heroImageUrl
              ? undefined
              : 'linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 100%)',
          }}
        >
          {/* Always render img element so data URLs can be injected for export */}
          <img
            src={heroImageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
            alt=""
            data-so-hero-image="true"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${50 - heroImagePosition.x}% ${50 - heroImagePosition.y}%`,
              transform: heroImageZoom !== 1
                ? `translate(${heroImagePosition.x * (heroImageZoom - 1)}%, ${heroImagePosition.y * (heroImageZoom - 1)}%) scale(${heroImageZoom})`
                : undefined,
              transformOrigin: 'center',
              filter: heroImageGrayscale ? 'grayscale(100%)' : undefined,
              display: heroImageUrl ? 'block' : 'none',
            }}
          />
        </div>
      </div>

      {/* Vertical divider - extends from header band to bottom of Key Solutions */}
      {/* Vertical divider - fades to white at bottom */}
      <div
        style={{
          position: 'absolute',
          top: 180,
          left: 371,
          width: 0.5,
          height: 170,
          background: 'linear-gradient(to bottom, #89888B 0%, #89888B 85%, #ffffff 100%)',
        }}
      />

      {/* Main Content Area */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          padding: '32px 40px 24px 40px',
        }}
      >
        {/* Left Column - Section header + Intro paragraph */}
        <div
          style={{
            width: 331,
            paddingRight: 24,
          }}
        >
          {/* Section Header */}
          <div
            style={{
              fontSize: 18,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 350,
              color: '#060015',
              lineHeight: 1.3,
              marginBottom: 16,
            }}
          >
            {renderWithLineBreaks(sectionHeader)}
          </div>

          {/* Intro Paragraph */}
          <div
            style={{
              fontSize: 12,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 350,
              color: '#37393D',
              lineHeight: 1.5,
            }}
          >
            {renderWithLineBreaks(introParagraph)}
          </div>
        </div>

        {/* Right Column - Key Solutions */}
        <div
          style={{
            width: 200,
            paddingLeft: 24,
          }}
        >
          {/* Key Solutions Label */}
          <div
            style={{
              fontSize: 8,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 500,
              color: '#37393D',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            Key Solutions
          </div>

          {/* Solution Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {keySolutions.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                {/* Teal dot */}
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: solutionColor,
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />
                {/* Solution text */}
                <div
                  style={{
                    fontSize: 9,
                    fontFamily: 'Fakt Pro, sans-serif',
                    fontWeight: 350,
                    color: '#37393D',
                    lineHeight: 1.4,
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div
        style={{
          width: '100%',
          padding: '24px 40px',
        }}
      >
        {/* Quote Text - matches section header styling: 18pt, light weight, italic */}
        <div
          style={{
            fontSize: 18,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 350,
            fontStyle: 'italic',
            color: '#060015',
            lineHeight: 1.3,
            marginBottom: 16,
          }}
        >
          {renderWithLineBreaks(quoteText)}
        </div>

        {/* Attribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Name - matches KEY SOLUTIONS label styling */}
          <div
            style={{
              fontSize: 8,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 500,
              color: '#37393D',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {quoteName}
          </div>
          {/* Title - matches company name styling: solution color, light weight, title case */}
          <div
            style={{
              fontSize: 10,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 350,
              color: solutionColor,
            }}
          >
            {quoteTitle}
          </div>
          {/* Company - solution color, light weight */}
          <div
            style={{
              fontSize: 10,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 350,
              color: solutionColor,
            }}
          >
            {quoteCompany}
          </div>
        </div>
      </div>

      {/* Footer Section - Fixed at bottom, 162px tall */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 162,
          borderTop: '0.5px solid #89888B',
          background: 'white',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 38,
        }}
      >
        {/* Left: 3x2 Grid (Logo + 5 Stats) - 222px wide */}
        <div
          style={{
            width: 222,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            columnGap: 40,
            rowGap: 18,
            flexShrink: 0,
            alignSelf: 'center',
          }}
        >
          {/* Row 1, Col 1: Cority Logo - center aligned with stats */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CorityLogoBlack />
          </div>

          {/* Row 1, Col 2: Stat 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', lineHeight: 1 }}>
              {stat1Value}
            </div>
            <div style={{ fontSize: 8, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', marginTop: 2 }}>
              {stat1Label}
            </div>
          </div>

          {/* Row 1, Col 3: Stat 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', lineHeight: 1 }}>
              {stat2Value}
            </div>
            <div style={{ fontSize: 8, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', marginTop: 2 }}>
              {stat2Label}
            </div>
          </div>

          {/* Row 2, Col 1: Stat 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', lineHeight: 1 }}>
              {stat3Value}
            </div>
            <div style={{ fontSize: 8, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', marginTop: 2 }}>
              {stat3Label}
            </div>
          </div>

          {/* Row 2, Col 2: Stat 4 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', lineHeight: 1 }}>
              {stat4Value}
            </div>
            <div style={{ fontSize: 8, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', marginTop: 2 }}>
              {stat4Label}
            </div>
          </div>

          {/* Row 2, Col 3: Stat 5 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ fontSize: 20, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', lineHeight: 1 }}>
              {stat5Value}
            </div>
            <div style={{ fontSize: 8, fontFamily: 'Fakt Pro, sans-serif', fontWeight: 350, color: '#37393D', marginTop: 2 }}>
              {stat5Label}
            </div>
          </div>
        </div>

        {/* Right: About Paragraph (Static) */}
        <div
          style={{
            flex: 1,
            fontSize: 9,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 350,
            color: '#37393D',
            lineHeight: 1.5,
          }}
        >
          Cority helps customers see and prevent risks across their operations, in real time. Our EHS+ platform converges people, data, and AI agents to stay ahead of the biggest operating risks across environmental management, employee health, safety, quality, and sustainability.<br /><br />For 40 years, Cority has been the market leader in EHS+, recognized by top analysts and trusted by more than 1,500 of the most complex organizations worldwide.
        </div>
      </div>
    </div>
  )
}
