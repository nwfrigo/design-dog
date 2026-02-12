// FAQ PDF Template - Cover Page
// Layout: Logo, title block with subheader and solution pill, full-height image on right

import { solutionCategories, type SolutionCategory } from '@/config/solution-overview-assets'

// Inline SVG for Cority logo (black version, 81px wide to match design)
function CorityLogoBlack() {
  return (
    <svg width="81" height="26" viewBox="0 0 383.8 128.41" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export interface CoverPageProps {
  title: string
  solution: SolutionCategory | 'none'
  coverImageUrl?: string
  coverImagePosition?: { x: number; y: number }
  coverImageZoom?: number
  coverImageGrayscale?: boolean
  scale?: number
}

export function CoverPage({
  title,
  solution,
  coverImageUrl,
  coverImagePosition = { x: 0, y: 0 },
  coverImageZoom = 1,
  coverImageGrayscale = false,
  scale = 1,
}: CoverPageProps) {
  // Get solution config (only if not 'none')
  const showSolutionPill = solution !== 'none'
  const solutionConfig = solution !== 'none' ? solutionCategories[solution] : null
  const solutionColor = solutionConfig?.color
  const solutionLabel = solutionConfig?.label

  // Default placeholder image
  const placeholderImage = '/assets/faq/cover-images/placeholder_faq_1.png'
  const imageUrl = coverImageUrl || placeholderImage

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
      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 65,
        }}
      >
        <CorityLogoBlack />
      </div>

      {/* Title Block - Flex column that pushes content down */}
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 227,
          width: 340,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Subheader - "Frequently Asked Questions" */}
        <div
          style={{
            color: 'black',
            fontSize: 12,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 350,
            lineHeight: '16px',
            wordWrap: 'break-word',
            marginBottom: 8,
          }}
        >
          Frequently Asked Questions
        </div>

        {/* Title */}
        <div
          style={{
            color: 'black',
            fontSize: 36,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 350,
            wordWrap: 'break-word',
            lineHeight: 1.2,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* Solution Pill - only shown when solution is not 'none' */}
        {showSolutionPill && solutionColor && solutionLabel && (
          <div
            style={{
              paddingLeft: 13,
              paddingRight: 13,
              paddingTop: 10.76,
              paddingBottom: 10.76,
              background: 'white',
              borderRadius: 5.38,
              border: '0.68px solid #D9D8D6',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10.34,
              display: 'inline-flex',
              alignSelf: 'flex-start',
            }}
          >
            {/* Color dot */}
            <div
              style={{
                width: 7.86,
                height: 7.86,
                background: solutionColor,
                borderRadius: 1.65,
              }}
            />
            {/* Label */}
            <div
              style={{
                color: 'black',
                fontSize: 7.62,
                fontFamily: 'Fakt Pro, sans-serif',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.84,
                wordWrap: 'break-word',
              }}
            >
              {solutionLabel}
            </div>
          </div>
        )}
      </div>

      {/* Cover Image - Full height, aligned to right edge */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 204,
          height: 792,
          overflow: 'hidden',
          background: imageUrl
            ? undefined
            : 'linear-gradient(135deg, #E8E8E8 0%, #D0D0D0 100%)',
        }}
      >
        {/* Always render img element so data URLs can be injected for export */}
        <img
          src={imageUrl}
          alt=""
          data-faq-cover-image="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${50 - coverImagePosition.x}% ${50 - coverImagePosition.y}%`,
            transform: coverImageZoom !== 1
              ? `translate(${coverImagePosition.x * (coverImageZoom - 1)}%, ${coverImagePosition.y * (coverImageZoom - 1)}%) scale(${coverImageZoom})`
              : undefined,
            transformOrigin: 'center',
            filter: coverImageGrayscale ? 'grayscale(100%)' : undefined,
          }}
        />
      </div>
    </div>
  )
}
