'use client'

/**
 * Custom-Size lab — SPIKE (exploration only, not linked from the app).
 *
 * Renders the layout engine across extreme ratios so we can SEE the judgment
 * and tune the per-band rules in lib/custom-size/resolve.ts to good. This page
 * is the tuning surface; nothing here is wired into the real editor/export.
 *
 * View at /custom-size-lab with the dev server running.
 */

import { useState } from 'react'
import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import type { TemplateTheme } from '@/lib/template-themes'
import { CustomSizeCanvas } from '@/components/custom-size/CustomSizeCanvas'
import { resolveLayout, type CustomContent } from '@/lib/custom-size/resolve'

const colors = colorsJson as ColorsConfig
const typography = typographyJson as TypographyConfig

const SIZES: { label: string; w: number; h: number }[] = [
  { label: 'Skyscraper 1:5', w: 300, h: 1500 },
  { label: 'IG Story 9:16', w: 1080, h: 1920 },
  { label: 'Portrait 4:5', w: 1080, h: 1350 },
  { label: 'Square 1:1', w: 1080, h: 1080 },
  { label: 'Landscape 16:9', w: 1280, h: 720 },
  { label: 'Social 1.91:1', w: 1200, h: 628 },
  { label: 'Banner 5:1', w: 1500, h: 300 },
  { label: 'Leaderboard ~8:1', w: 728, h: 90 },
  { label: 'Floating 22:1', w: 2256, h: 100 },
  // Scale-invariance check: same ratios as above, but huge. Should look
  // IDENTICAL to their small twins — just a bigger scale factor.
  { label: 'HUGE 16:9 (5120×2880)', w: 5120, h: 2880 },
  { label: 'HUGE 1.43 (5000×3500)', w: 5000, h: 3500 },
]

const BOX_W = 360
const BOX_H = 300

const REASON_LABEL: Record<string, string> = {
  'band-excluded': "doesn't suit this shape",
  'no-space': "no room at this size",
  'too-small': 'would be illegible',
  'empty': 'no content',
}

const SOLUTIONS = ['safety', 'health', 'environmental', 'quality', 'sustainability', 'none']

function SizeCard({
  label, w, h, content, theme,
}: { label: string; w: number; h: number; content: CustomContent; theme: TemplateTheme }) {
  const scale = Math.min(BOX_W / w, BOX_H / h, 1)
  const layout = resolveLayout(content, w, h)
  return (
    <div style={{ background: '#1c1d1f', borderRadius: 10, padding: 14, border: '1px solid #2c2d2f' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <strong style={{ color: '#f2f2f3', fontSize: 13 }}>{label}</strong>
        <span style={{ color: '#7c7d80', fontSize: 11, fontFamily: 'monospace' }}>{w}×{h}</span>
      </div>
      <div style={{ color: '#9aa0a6', fontSize: 11, marginBottom: 10 }}>
        <span style={{ color: '#5b9bd5' }}>{layout.band}</span> · {layout.strategyLabel}
        <span style={{ color: '#5b6b5b' }}> · {layout.sizeScale.toFixed(2)}×</span>
      </div>
      <div style={{ width: BOX_W, height: BOX_H, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1011', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: w * scale, height: h * scale, boxShadow: '0 0 0 1px rgba(255,255,255,0.12)' }}>
          <CustomSizeCanvas content={content} width={w} height={h} theme={theme} colors={colors} typography={typography} scale={scale} />
        </div>
      </div>
      {layout.triagedOut.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: '#7c7d80' }}>
          <div style={{ marginBottom: 2, color: '#9aa0a6' }}>triaged out:</div>
          {layout.triagedOut.map((tb, i) => (
            <div key={i}>· <span style={{ color: '#c98a8a' }}>{tb.id}</span> — {REASON_LABEL[tb.reason] ?? tb.reason}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CustomSizeLab() {
  const [theme, setTheme] = useState<TemplateTheme>('dark')
  const [content, setContent] = useState<CustomContent>({
    showLogo: true,
    eyebrow: 'New platform release',
    headline: 'Manage EHS risk with confidence',
    subhead: 'One connected platform for safety, health, and sustainability.',
    body: 'Cority brings compliance, incidents, and analytics together so your teams can act faster and prove impact.',
    cta: 'Learn more',
    solution: 'safety',
    showSolutionPill: true,
    hasImage: true,
  })
  const [customW, setCustomW] = useState(900)
  const [customH, setCustomH] = useState(1200)

  const set = (patch: Partial<CustomContent>) => setContent((c) => ({ ...c, ...patch }))

  const fieldStyle: React.CSSProperties = { width: '100%', background: '#242527', color: '#f2f2f3', border: '1px solid #3a3b3d', borderRadius: 4, padding: '6px 8px', fontSize: 12, marginBottom: 8 }
  const labelStyle: React.CSSProperties = { color: '#7c7d80', fontSize: 11, display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }

  return (
    <div style={{ minHeight: '100vh', background: '#161719', color: '#f2f2f3', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 18, marginBottom: 4 }}>Custom-Size Layout Lab <span style={{ color: '#7c7d80', fontWeight: 400 }}>· spike</span></h1>
      <p style={{ color: '#7c7d80', fontSize: 13, marginBottom: 20, maxWidth: 720 }}>
        One pure resolver + one ContentStack-based renderer, across extreme ratios. The per-band rules in <code style={{ color: '#9aa0a6' }}>lib/custom-size/resolve.ts</code> are the design judgment — tune them here until each band reads well.
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Controls */}
        <div style={{ width: 280, flexShrink: 0, background: '#1c1d1f', border: '1px solid #2c2d2f', borderRadius: 10, padding: 16 }}>
          <label style={labelStyle}>Eyebrow</label>
          <input style={fieldStyle} value={content.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
          <label style={labelStyle}>Headline</label>
          <textarea style={{ ...fieldStyle, height: 50 }} value={content.headline} onChange={(e) => set({ headline: e.target.value })} />
          <label style={labelStyle}>Subhead</label>
          <textarea style={{ ...fieldStyle, height: 44 }} value={content.subhead} onChange={(e) => set({ subhead: e.target.value })} />
          <label style={labelStyle}>Body</label>
          <textarea style={{ ...fieldStyle, height: 60 }} value={content.body} onChange={(e) => set({ body: e.target.value })} />
          <label style={labelStyle}>CTA</label>
          <input style={fieldStyle} value={content.cta} onChange={(e) => set({ cta: e.target.value })} />
          <label style={labelStyle}>Solution</label>
          <select style={fieldStyle} value={content.solution} onChange={(e) => set({ solution: e.target.value })}>
            {SOLUTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, fontSize: 12 }}>
            <label><input type="checkbox" checked={content.showLogo} onChange={(e) => set({ showLogo: e.target.checked })} /> logo</label>
            <label><input type="checkbox" checked={content.showSolutionPill} onChange={(e) => set({ showSolutionPill: e.target.checked })} /> solution pill</label>
            <label><input type="checkbox" checked={content.hasImage} onChange={(e) => set({ hasImage: e.target.checked })} /> image</label>
            <label><input type="checkbox" checked={theme === 'dark'} onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} /> dark theme</label>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #2c2d2f' }}>
            <label style={labelStyle}>Custom size (the real entry)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={fieldStyle} type="number" value={customW} onChange={(e) => setCustomW(+e.target.value || 1)} />
              <input style={fieldStyle} type="number" value={customH} onChange={(e) => setCustomH(+e.target.value || 1)} />
            </div>
          </div>
        </div>

        {/* Previews */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${BOX_W + 28}px, 1fr))`, gap: 16, alignItems: 'start' }}>
          <SizeCard label="Custom" w={Math.max(1, customW)} h={Math.max(1, customH)} content={content} theme={theme} />
          {SIZES.map((s) => (
            <SizeCard key={s.label} label={s.label} w={s.w} h={s.h} content={content} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  )
}
