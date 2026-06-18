'use client'

/**
 * ResizableCanvasStage — SPIKE. Drag the canvas edges/corners to resize; the
 * layout engine re-resolves LIVE as you drag. Proves the "steer the engine by
 * hand" feel before any real-editor wiring.
 *
 * Interaction model = direct manipulation of layout VARIABLES (width/height),
 * never pixels. Magnetic snapping to ratio stops is the brand-safety rail.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { TemplateTheme } from '@/lib/template-themes'
import { CustomSizeCanvas } from '@/components/custom-size/CustomSizeCanvas'
import { resolveLayout, type CustomContent } from '@/lib/custom-size/resolve'

const colors = colorsJson as ColorsConfig
const typography = typographyJson as TypographyConfig

const MIN = 40
const MAX = 6000
const SNAP_TOL = 0.045
const SNAP_STOPS: { ratio: number; label: string }[] = [
  { ratio: 1, label: '1:1' },
  { ratio: 4 / 3, label: '4:3' },
  { ratio: 3 / 4, label: '3:4' },
  { ratio: 16 / 9, label: '16:9' },
  { ratio: 9 / 16, label: '9:16' },
]

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
const HANDLES: { id: Handle; x: number; y: number; cursor: string }[] = [
  { id: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
  { id: 'n', x: 0.5, y: 0, cursor: 'ns-resize' },
  { id: 'ne', x: 1, y: 0, cursor: 'nesw-resize' },
  { id: 'e', x: 1, y: 0.5, cursor: 'ew-resize' },
  { id: 'se', x: 1, y: 1, cursor: 'nwse-resize' },
  { id: 's', x: 0.5, y: 1, cursor: 'ns-resize' },
  { id: 'sw', x: 0, y: 1, cursor: 'nesw-resize' },
  { id: 'w', x: 0, y: 0.5, cursor: 'ew-resize' },
]
// Sign of each axis per handle. Centered canvas → 2× factor (both edges move).
const SX: Record<Handle, number> = { e: 1, w: -1, ne: 1, nw: -1, se: 1, sw: -1, n: 0, s: 0 }
const SY: Record<Handle, number> = { s: 1, n: -1, se: 1, sw: 1, ne: -1, nw: -1, e: 0, w: 0 }

const clamp = (v: number) => Math.round(Math.max(MIN, Math.min(MAX, v)))

interface Props {
  content: CustomContent
  theme: TemplateTheme
  width: number
  height: number
  onResize: (w: number, h: number) => void
  snapEnabled: boolean
}

export function ResizableCanvasStage({ content, theme, width, height, onResize, snapEnabled }: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [area, setArea] = useState({ w: 800, h: 540 })
  const dragRef = useRef<null | { handle: Handle; startX: number; startY: number; startW: number; startH: number; scale: number }>(null)
  const [readout, setReadout] = useState<null | { x: number; y: number; snap: string | null }>(null)
  const [, force] = useState(0)
  // keep latest props reachable from the imperative window listeners
  const snapRef = useRef(snapEnabled); snapRef.current = snapEnabled
  const onResizeRef = useRef(onResize); onResizeRef.current = onResize

  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const measure = () => setArea({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  const PAD = 96
  const fitScale = Math.min(1, (area.w - PAD) / width, (area.h - PAD) / height)
  const dragging = dragRef.current
  const scale = dragging ? dragging.scale : fitScale
  const renderedW = width * scale
  const renderedH = height * scale
  const layout = resolveLayout(content, width, height)

  function startDrag(handle: Handle, e: ReactPointerEvent) {
    e.preventDefault()
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startW: width, startH: height, scale: fitScale }
    force((n) => n + 1)

    const onMove = (ev: globalThis.PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = ev.clientX - d.startX
      const dy = ev.clientY - d.startY
      let w = clamp(d.startW + SX[d.handle] * 2 * dx / d.scale)
      let h = clamp(d.startH + SY[d.handle] * 2 * dy / d.scale)
      let snap: string | null = null
      if (snapRef.current) {
        const ratio = w / h
        let best = SNAP_STOPS[0]
        let bestD = Infinity
        for (const s of SNAP_STOPS) {
          const dd = Math.abs(ratio - s.ratio) / s.ratio
          if (dd < bestD) { bestD = dd; best = s }
        }
        if (bestD < SNAP_TOL) {
          if (d.handle === 'n' || d.handle === 's') h = clamp(w / best.ratio)
          else w = clamp(h * best.ratio)
          snap = best.label
        }
      }
      setReadout({ x: ev.clientX, y: ev.clientY, snap })
      onResizeRef.current(w, h)
    }
    const onUp = () => {
      dragRef.current = null
      setReadout(null)
      force((n) => n + 1)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const chip: CSSProperties = { position: 'absolute', top: 10, left: 12, fontSize: 11, fontFamily: 'monospace', color: '#cfd2d6', background: 'rgba(0,0,0,0.45)', padding: '4px 8px', borderRadius: 5, pointerEvents: 'none' }

  return (
    <div ref={areaRef} style={{ position: 'relative', width: '100%', height: 540, background: '#0f1011', borderRadius: 10, overflow: 'hidden', border: '1px solid #2c2d2f' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: renderedW, height: renderedH }}>
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <CustomSizeCanvas content={content} width={width} height={height} theme={theme} colors={colors} typography={typography} scale={scale} />
        </div>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: readout?.snap ? '0 0 0 2px #5b9bd5' : '0 0 0 1px rgba(255,255,255,0.28)' }} />
        {HANDLES.map((hd) => (
          <div
            key={hd.id}
            onPointerDown={(e) => startDrag(hd.id, e)}
            style={{ position: 'absolute', left: `calc(${hd.x * 100}% - 6px)`, top: `calc(${hd.y * 100}% - 6px)`, width: 12, height: 12, borderRadius: 3, background: '#fff', border: '1.5px solid #5b9bd5', cursor: hd.cursor, touchAction: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
          />
        ))}
      </div>

      <div style={chip}>
        {Math.round(width)}×{Math.round(height)} · <span style={{ color: '#5b9bd5' }}>{layout.band}</span> · {scale.toFixed(2)}×
        {readout?.snap && <span style={{ color: '#7fd17f' }}> · ⊹ {readout.snap}</span>}
      </div>

      {readout && (
        <div style={{ position: 'fixed', left: readout.x + 16, top: readout.y + 16, zIndex: 50, pointerEvents: 'none', fontSize: 12, fontFamily: 'monospace', color: '#fff', background: readout.snap ? '#2f6b2f' : '#2a2b2d', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: 5 }}>
          {Math.round(width)} × {Math.round(height)}{readout.snap ? ` · ${readout.snap}` : ''}
        </div>
      )}
    </div>
  )
}
