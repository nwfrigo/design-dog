/**
 * Shared right-pointing arrow SVG icon.
 * Used across all template components for CTA arrows at various sizes.
 * Accepts explicit width/height/viewBox/pathD/strokeWidth to support
 * the different arrow scales used by each template.
 */
export const ArrowIcon = ({
  color = 'white',
  width,
  height,
  viewBox = '0 0 22 17.5',
  pathD = 'M13 1L21 8.75M21 8.75L13 16.5M21 8.75H1',
  strokeWidth = 1.5,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
}: {
  color?: string
  width?: number | string
  height?: number | string
  viewBox?: string
  pathD?: string
  strokeWidth?: number | string
  strokeLinecap?: 'butt' | 'round' | 'square'
  strokeLinejoin?: 'miter' | 'round' | 'bevel'
}) => (
  <svg width={width} height={height} viewBox={viewBox} fill="none">
    <path
      d={pathD}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
  </svg>
)
