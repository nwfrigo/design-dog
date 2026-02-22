'use client'

interface ArrowIconProps {
  /** Stroke color for the arrow */
  color?: string
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Stroke width */
  strokeWidth?: number
}

/**
 * Arrow icon for CTA buttons.
 * Inline SVG ensures export compatibility with Puppeteer screenshots.
 */
export function ArrowIcon({
  color = '#060015',
  width = 17,
  height = 14,
  strokeWidth = 1.17,
}: ArrowIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 17 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 1L16 7M16 7L10 13M16 7H1"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
