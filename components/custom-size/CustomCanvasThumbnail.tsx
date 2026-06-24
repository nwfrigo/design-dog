/**
 * CustomCanvasThumbnail — the decorative tile thumbnail for the Custom Size
 * entry: a tilted montage of outlined rounded rectangles (reproduced from Figma
 * node 568:1004).
 *
 * Theme-flipping for free: the rectangles are drawn with `stroke="currentColor"`,
 * and the parent sets `text-line-subtle` — the same CSS-variable-backed token the
 * rest of the app uses for hairlines. Light mode → #BDBEC0, dark mode → #494A4C,
 * swapped by the existing dark-mode variable. One vector asset, no second image,
 * no JS. `vector-effect: non-scaling-stroke` keeps the hairlines crisp regardless
 * of how the SVG is scaled to fill the tile.
 */

// Rounded-rect montage in Figma's Frame-73 local space (viewBox 1332×803).
// [x, y, w, h]; corner radius tracks the rect size (rx ≈ 4.8% per the design).
const RECTS: [number, number, number, number][] = [
  [682.6, 0, 308, 308],
  [341.3, 187.3, 308, 308],
  [1024, 187.3, 308, 616],
  [341.3, 528.6, 649, 275],
  [154, 0, 154, 308],
  [341.3, 0, 308, 154],
  [682.6, 341.3, 308, 154],
  [0, 341.3, 308, 154],
  [1024, 0, 154, 154],
  [154, 528.6, 154, 154],
]

export function CustomCanvasThumbnail({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1332 803"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {RECTS.map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={14.8}
          strokeWidth={1.4}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
