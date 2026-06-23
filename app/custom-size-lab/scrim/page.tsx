'use client'

/**
 * Custom-Size SCRIM lab — SPIKE. Compares the candidate overlay gradient curves
 * (SCRIM_PROFILES in lib/custom-size/overlay) over a real image + text stack, so
 * we can pick how far the scrim fills behind content. Not wired into the app.
 * View at /custom-size-lab/scrim.
 */

import { useState } from 'react'
import Link from 'next/link'
import { overlayBackground, SCRIM_PROFILES } from '@/lib/custom-size/overlay'
import type { CustomSizeOverlay } from '@/lib/custom-size/document'
import { labelStyle } from '@/components/custom-size/labShared'

const IMAGES = [
  { label: 'Scene A', url: '/assets/image-library/images/scenes/design-dog-library_006.jpg' },
  { label: 'Scene B', url: '/assets/image-library/images/scenes/design-dog-library_012.jpg' },
  { label: 'Scene C', url: '/assets/image-library/images/scenes/design-dog-library_007.jpg' },
]
const COLORS = [
  { label: 'Dark', hex: '#060015' },
  { label: 'Black', hex: '#000000' },
  { label: 'Orange', hex: '#D35F0B' },
  { label: 'Blue', hex: '#0080FF' },
  { label: 'White', hex: '#FFFFFF' },
]
const COVERAGES: CustomSizeOverlay['coverage'][] = ['fade-up', 'fade-down', 'full']

const CARD_W = 300
const CARD_H = 380

const chip = (active: boolean): React.CSSProperties => ({
  padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
  background: active ? '#2f4660' : '#242527', color: active ? '#cfe0f5' : '#cfd2d6',
  border: `1px solid ${active ? '#5b9bd5' : '#3a3b3d'}`,
})

export default function ScrimLab() {
  const [img, setImg] = useState(IMAGES[0].url)
  const [color, setColor] = useState('#060015')
  const [opacity, setOpacity] = useState(0.55)
  const [coverage, setCoverage] = useState<CustomSizeOverlay['coverage']>('fade-up')
  const [noise, setNoise] = useState(false)

  const overlay = (): CustomSizeOverlay => ({ color, opacity, coverage, noise })
  const textTop = coverage === 'fade-down'

  return (
    <div style={{ minHeight: '100vh', background: '#161719', color: '#f2f2f3', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 6 }}>
        <h1 style={{ fontSize: 18 }}>Scrim Gradient Lab <span style={{ color: '#7c7d80', fontWeight: 400 }}>· spike</span></h1>
        <Link href="/custom-size-lab" style={{ color: '#5b9bd5', fontSize: 13 }}>↩ ratio grid</Link>
      </div>
      <p style={{ color: '#7c7d80', fontSize: 13, marginBottom: 18, maxWidth: 820 }}>
        Each card = the same overlay with a different stop curve. The goal: enough fill behind the text without
        crushing the whole image. <strong style={{ color: '#cfd2d6' }}>Floor</strong> variants never drop to 0
        at the far edge (your 100→30 idea).
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 22, background: '#1c1d1f', border: '1px solid #2c2d2f', borderRadius: 10, padding: 14 }}>
        <div>
          <label style={labelStyle}>Coverage</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {COVERAGES.map((c) => <button key={c} onClick={() => setCoverage(c)} style={chip(coverage === c)}>{c}</button>)}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Overlay colour</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {COLORS.map((c) => (
              <button key={c.hex} title={c.label} onClick={() => setColor(c.hex)}
                style={{ width: 26, height: 26, borderRadius: 6, background: c.hex, cursor: 'pointer', border: `2px solid ${color === c.hex ? '#5b9bd5' : '#3a3b3d'}` }} />
            ))}
          </div>
        </div>
        <div style={{ width: 200 }}>
          <label style={labelStyle}>Opacity · {Math.round(opacity * 100)}%</label>
          <input type="range" min={0} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(+e.target.value / 100)} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={labelStyle}>Image</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {IMAGES.map((i) => <button key={i.url} onClick={() => setImg(i.url)} style={chip(img === i.url)}>{i.label}</button>)}
          </div>
        </div>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 12, color: '#cfd2d6' }}>
          <input type="checkbox" checked={noise} onChange={(e) => setNoise(e.target.checked)} /> noise
        </label>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {SCRIM_PROFILES.map((profile) => (
          <div key={profile.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ position: 'relative', width: CARD_W, height: CARD_H, overflow: 'hidden', borderRadius: 8, border: '1px solid #2c2d2f' }}>
              <img src={img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: overlayBackground(overlay(), profile.key) }} />
              {noise && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, opacity: 0.12, mixBlendMode: 'overlay' }} />}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: textTop ? 'flex-start' : 'flex-end', padding: 22, gap: 7, color: color === '#FFFFFF' ? '#111' : '#fff' }}>
                <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.9 }}>New release</div>
                <div style={{ fontSize: 27, fontWeight: 300, lineHeight: 1.05 }}>Manage EHS risk with confidence</div>
                <div style={{ fontSize: 13, opacity: 0.92 }}>One connected platform for safety, health, and sustainability.</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>Learn more →</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#f2f2f3', fontWeight: 600 }}>{profile.label}</div>
            <div style={{ fontSize: 11, color: '#7c7d80', fontFamily: 'monospace' }}>{profile.fade.map(([p, m]) => `${p}%·${m}`).join('  ')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
