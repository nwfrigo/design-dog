/**
 * Cority "ALWAYS AHEAD" lockup — the brand mark paired with its tagline.
 *
 * Figma `Cority_Logo_Always_Ahead` (94 × 17.062): the Cority mark on the left
 * and the tagline wordmark to its right. Used by the Executive Overview's
 * standard footer variant.
 *
 * The tagline is a vector wordmark, not text — at its design size it renders
 * ~3px tall, which no font would set legibly. Inline SVG (never `next/image`)
 * so Puppeteer's `networkidle2` has nothing to wait on during export.
 *
 * `height` scales the whole lockup; the mark and tagline keep their designed
 * proportions and relative offsets.
 */
import { CorityLogo } from './CorityLogo'

/** Design-size geometry, from the Figma lockup. Everything scales off these. */
const LOCKUP_W = 94
const LOCKUP_H = 17.062
const MARK_W = 52.073
const TAGLINE_W = 36.737
const TAGLINE_H = 2.988
const TAGLINE_X = 57.01
const TAGLINE_Y = 3.47

export const CorityAlwaysAheadLogo = ({
  markFill = '#D35F0B',
  taglineFill = '#060015',
  height = LOCKUP_H,
}: {
  /** Colour of the Cority mark. Brand orange by default. */
  markFill?: string
  /** Colour of the ALWAYS AHEAD tagline. */
  taglineFill?: string
  /** Rendered lockup height in px; width follows the design proportion. */
  height?: number
}) => {
  const scale = height / LOCKUP_H
  return (
    <div
      style={{
        position: 'relative',
        width: LOCKUP_W * scale,
        height: LOCKUP_H * scale,
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0 }}>
        <CorityLogo fill={markFill} height={LOCKUP_H * scale} />
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${TAGLINE_W} ${TAGLINE_H}`}
        width={TAGLINE_W * scale}
        height={TAGLINE_H * scale}
        fill={taglineFill}
        style={{
          position: 'absolute',
          left: TAGLINE_X * scale,
          top: TAGLINE_Y * scale,
          display: 'block',
        }}
      >
      <path d="M34.2522 2.93761V0.050359H35.2132C36.2162 0.050359 36.7365 0.654667 36.7365 1.49398C36.7365 2.3333 36.2162 2.93761 35.2132 2.93761H34.2522ZM35.1922 0.453231H34.7264V2.53474H35.1922C35.9602 2.53474 36.2413 2.05213 36.2413 1.49398C36.2413 0.935838 35.9602 0.453231 35.1922 0.453231Z" />
      <path d="M30.6891 2.93761L31.7635 0.050359H32.3216L33.3959 2.93761H32.8966L32.649 2.23678H31.4152L31.1676 2.93761H30.6891ZM32.0446 0.520376H32.0279L31.5578 1.8423H32.5105L32.0446 0.520376Z" />
      <path d="M27.8455 2.93761V0.050359H29.8683V0.453231H28.3198V1.27156H29.5619V1.66185H28.3198V2.53474H29.9061V2.93761H27.8455Z" />
      <path d="M24.2734 2.93761V0.050359H24.7476V1.27576H26.1996V0.050359H26.678V2.93761H26.1996V1.67863H24.7476V2.93761H24.2734Z" />
      <path d="M20.7103 2.93761L21.7846 0.050359H22.3428L23.4171 2.93761H22.9177L22.6701 2.23678H21.4363L21.1887 2.93761H20.7103ZM22.0658 0.520376H22.049L21.579 1.8423H22.5316L22.0658 0.520376Z" />
      <path d="M16.2832 2.11508H16.7532C16.7532 2.41303 17.0092 2.61867 17.4247 2.61867C17.8569 2.61867 18.1129 2.43821 18.1129 2.13186C18.1129 1.41844 16.3294 1.98498 16.3294 0.856103C16.3294 0.360906 16.7574 0 17.4289 0C18.0751 0 18.5116 0.314744 18.5116 0.826727H18.0458C18.0458 0.532966 17.7814 0.369299 17.4289 0.369299C17.0764 0.369299 16.8036 0.520376 16.8036 0.80994C16.8036 1.51916 18.5997 0.944231 18.5997 2.09409C18.5997 2.62706 18.1717 2.98797 17.4247 2.98797C16.6903 2.98797 16.2832 2.64385 16.2832 2.11508Z" />
      <path d="M14.1371 2.93761V1.82132L13.0921 0.050359H13.6293L14.3763 1.3513H14.3931L15.1694 0.050359H15.6688L14.6113 1.80033V2.93761H14.1371Z" />
      <path d="M10.192 2.93761L11.2663 0.050359H11.8244L12.8988 2.93761H12.3994L12.1518 2.23678H10.918L10.6704 2.93761H10.192ZM11.5475 0.520376H11.5307L11.0607 1.8423H12.0133L11.5475 0.520376Z" />
      <path d="M6.6089 2.93761L5.85351 0.050359H6.3571L6.92364 2.43402H6.94043L7.56572 0.050359H8.09449L8.72817 2.43402H8.74496L9.29051 0.050359H9.77732L9.03452 2.93761H8.4428L7.8301 0.625291H7.81332L7.20062 2.93761H6.6089Z" />
      <path d="M3.56306 2.93761V0.050359H4.03728V2.53054H5.43474V2.93761H3.56306Z" />
      <path d="M0 2.93761L1.07432 0.050359H1.63247L2.7068 2.93761H2.2074L1.9598 2.23678H0.726009L0.47841 2.93761H0ZM1.3555 0.520376H1.33871L0.868692 1.8423H1.82132L1.3555 0.520376Z" />
      </svg>
    </div>
  )
}
