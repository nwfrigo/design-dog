'use client'

/**
 * Custom-Size RESIZE lab — SPIKE. The hero interaction: drag the canvas to
 * resize and watch the engine re-art-direct live. Not wired into the app.
 * View at /custom-size-lab/resize.
 */

import { useState } from 'react'
import Link from 'next/link'
import type { TemplateTheme } from '@/lib/template-themes'
import { ResizableCanvasStage } from '@/components/custom-size/ResizableCanvasStage'
import { ContentControls, DEFAULT_CONTENT, fieldStyle, labelStyle } from '@/components/custom-size/labShared'
import { resolveLayout, type CustomContent } from '@/lib/custom-size/resolve'

const PRESETS = [
  { label: '1:1', w: 1080, h: 1080 },
  { label: '4:3', w: 1200, h: 900 },
  { label: '16:9', w: 1280, h: 720 },
]

const REASON_LABEL: Record<string, string> = {
  'band-excluded': "doesn't suit this shape",
  'no-space': 'no room at this size',
  'too-small': 'would be illegible',
  'empty': 'no content',
}

export default function ResizeLab() {
  const [content, setContent] = useState<CustomContent>(DEFAULT_CONTENT)
  const [theme, setTheme] = useState<TemplateTheme>('dark')
  const [w, setW] = useState(1080)
  const [h, setH] = useState(1080)
  const [snap, setSnap] = useState(true)
  const set = (patch: Partial<CustomContent>) => setContent((c) => ({ ...c, ...patch }))
  const layout = resolveLayout(content, w, h)

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
    background: active ? '#2f4660' : '#242527', color: active ? '#cfe0f5' : '#cfd2d6',
    border: `1px solid ${active ? '#5b9bd5' : '#3a3b3d'}`,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#161719', color: '#f2f2f3', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 6 }}>
        <h1 style={{ fontSize: 18 }}>Custom-Size Resize Lab <span style={{ color: '#7c7d80', fontWeight: 400 }}>· spike</span></h1>
        <Link href="/custom-size-lab" style={{ color: '#5b9bd5', fontSize: 13 }}>↩ ratio grid</Link>
      </div>
      <p style={{ color: '#7c7d80', fontSize: 13, marginBottom: 20, maxWidth: 760 }}>
        Drag the canvas handles. The engine re-resolves live — content reflows and triages as the shape changes. Toggle snapping to feel the magnetic ratio stops.
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Controls */}
        <div style={{ width: 280, flexShrink: 0, background: '#1c1d1f', border: '1px solid #2c2d2f', borderRadius: 10, padding: 16 }}>
          <ContentControls content={content} onChange={set} />

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2c2d2f' }}>
            <label style={labelStyle}>Presets</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => { setW(p.w); setH(p.h) }}
                  style={chipStyle(w === p.w && h === p.h)}>{p.label}</button>
              ))}
            </div>

            <label style={labelStyle}>Size</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={fieldStyle} type="number" value={w} onChange={(e) => setW(Math.max(1, +e.target.value || 1))} />
              <span style={{ color: '#7c7d80' }}>×</span>
              <input style={fieldStyle} type="number" value={h} onChange={(e) => setH(Math.max(1, +e.target.value || 1))} />
            </div>
            <button onClick={() => { setW(h); setH(w) }} style={{ ...chipStyle(false), width: '100%', marginBottom: 12 }}>⤢ flip orientation</button>

            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 12, color: '#cfd2d6' }}>
              <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} /> snap to presets
            </label>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 12, color: '#cfd2d6', marginTop: 6 }}>
              <input type="checkbox" checked={theme === 'dark'} onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} /> dark theme
            </label>
          </div>
        </div>

        {/* Stage + live readout */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ResizableCanvasStage content={content} theme={theme} width={w} height={h} onResize={(nw, nh) => { setW(nw); setH(nh) }} snapEnabled={snap} />

          <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 12, color: '#9aa0a6', flexWrap: 'wrap' }}>
            <span><span style={{ color: '#5b9bd5' }}>{layout.band}</span> · {layout.strategyLabel}</span>
            <span>scale {layout.sizeScale.toFixed(2)}×</span>
            {layout.triagedOut.length > 0 && (
              <span>triaged: {layout.triagedOut.map((t) => `${t.id} (${REASON_LABEL[t.reason] ?? t.reason})`).join(', ')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
