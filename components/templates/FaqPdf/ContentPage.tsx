// FAQ PDF Template - Content Page
// Layout: Header bar with title and logo, content area with headings, Q&A pairs, and tables

import type { FaqContentBlock } from '@/types'

// Re-export for convenience
export type { FaqContentBlock } from '@/types'

// Inline SVG for Cority logo (black version with R mark, 34px wide)
function CorityLogoBlack() {
  return (
    <svg width="34" height="11" viewBox="0 0 383.8 128.41" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export interface ContentPageProps {
  title: string
  blocks: FaqContentBlock[]
  pageNumber?: number
  scale?: number
}

export function ContentPage({
  title,
  blocks,
  pageNumber,
  scale = 1,
}: ContentPageProps) {
  // Render a content block
  const renderBlock = (block: FaqContentBlock) => {
    switch (block.type) {
      case 'heading':
        return (
          <div
            key={block.id}
            style={{
              color: 'black',
              fontSize: 18,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 350,
              wordWrap: 'break-word',
              marginBottom: 24,
            }}
          >
            {block.text}
          </div>
        )

      case 'qa':
        return (
          <div
            key={block.id}
            style={{
              width: 492,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 12,
              display: 'flex',
              marginBottom: 24,
            }}
          >
            {/* Question - medium weight, not editable styling */}
            <div
              style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 12,
                fontFamily: 'Fakt Pro, sans-serif',
                fontWeight: 500,
                lineHeight: '16px',
                wordWrap: 'break-word',
              }}
            >
              {block.question}
            </div>
            {/* Answer - light weight, supports rich text HTML */}
            <div
              style={{
                alignSelf: 'stretch',
                color: 'black',
                fontSize: 12,
                fontFamily: 'Fakt Pro, sans-serif',
                fontWeight: 350,
                lineHeight: '16px',
                wordWrap: 'break-word',
              }}
            >
              {/* Use a style tag for list styling since inline styles don't cascade */}
              <style dangerouslySetInnerHTML={{ __html: `
                .faq-answer-${block.id} ul { list-style-type: disc; padding-left: 20px; margin: 8px 0; }
                .faq-answer-${block.id} ol { list-style-type: decimal; padding-left: 20px; margin: 8px 0; }
                .faq-answer-${block.id} li { margin: 4px 0; }
                .faq-answer-${block.id} a { color: #D35F0B; text-decoration: none; }
                .faq-answer-${block.id} p { margin: 4px 0; }
              `}} />
              <div
                className={`faq-answer-${block.id}`}
                dangerouslySetInnerHTML={{ __html: block.answer }}
              />
            </div>
          </div>
        )

      case 'table':
        return (
          <div
            key={block.id}
            style={{
              width: 492,
              marginBottom: 24,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                fontSize: 12,
                fontFamily: 'Fakt Pro, sans-serif',
                fontWeight: 350,
                lineHeight: '16px',
              }}
            >
              <tbody>
                {block.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          border: '0.5px solid #89888B',
                          padding: 8,
                          verticalAlign: 'top',
                          color: 'black',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return null
    }
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
      {/* Header Bar */}
      <div
        style={{
          width: 512,
          height: 27,
          left: 50,
          top: 36,
          position: 'absolute',
          background: 'white',
          overflow: 'hidden',
          borderRadius: 7,
          border: '0.5px solid #D9D8D6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 10,
          paddingRight: 10,
          boxSizing: 'border-box',
        }}
      >
        {/* Left: FAQ's label + title */}
        <div
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 11,
            display: 'flex',
          }}
        >
          <div
            style={{
              color: '#060015',
              fontSize: 8,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.88,
              wordWrap: 'break-word',
            }}
          >
            FAQ&apos;S
          </div>
          <div
            style={{
              width: 4,
              height: 4,
              background: '#B3B2B1',
              borderRadius: 9999,
            }}
          />
          <div
            style={{
              color: '#060015',
              fontSize: 8,
              fontFamily: 'Fakt Pro, sans-serif',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.88,
              wordWrap: 'break-word',
            }}
          >
            {title}
          </div>
        </div>

        {/* Right: Cority Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CorityLogoBlack />
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: 96,
          width: 492,
        }}
      >
        {blocks.map((block) => renderBlock(block))}
      </div>

      {/* Page Number (optional) */}
      {pageNumber && (
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 50,
            fontSize: 8,
            fontFamily: 'Fakt Pro, sans-serif',
            fontWeight: 350,
            color: '#89888B',
          }}
        >
          {pageNumber}
        </div>
      )}
    </div>
  )
}
