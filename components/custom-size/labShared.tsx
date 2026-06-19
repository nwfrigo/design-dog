'use client'

/** Shared bits for the custom-size SPIKE lab pages (grid + resize). Spike-only. */

import type { CSSProperties } from 'react'
import type { CustomContent } from '@/lib/custom-size/resolve'

export const SOLUTIONS = ['safety', 'health', 'environmental', 'quality', 'sustainability', 'none']

export const DEFAULT_CONTENT: CustomContent = {
  showLogo: true,
  eyebrow: 'New platform release',
  headline: 'Manage EHS risk with confidence',
  subhead: 'One connected platform for safety, health, and sustainability.',
  body: 'Cority brings compliance, incidents, and analytics together so your teams can act faster and prove impact.',
  cta: 'Learn more',
  solution: 'safety',
  showSolutionPill: true,
  hasImage: true,
}

export const fieldStyle: CSSProperties = { width: '100%', background: '#242527', color: '#f2f2f3', border: '1px solid #3a3b3d', borderRadius: 4, padding: '6px 8px', fontSize: 12, marginBottom: 8 }
export const labelStyle: CSSProperties = { color: '#7c7d80', fontSize: 11, display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }

export const BG_IMAGES: { label: string; url: string | null }[] = [
  { label: 'none', url: null },
  { label: 'Scene A', url: '/assets/image-library/images/scenes/design-dog-library_006.jpg' },
  { label: 'Scene B', url: '/assets/image-library/images/scenes/design-dog-library_012.jpg' },
  { label: 'Scene C', url: '/assets/image-library/images/scenes/design-dog-library_007.jpg' },
]

const bgChip = (active: boolean): CSSProperties => ({
  padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
  background: active ? '#2f4660' : '#242527', color: active ? '#cfe0f5' : '#cfd2d6',
  border: `1px solid ${active ? '#5b9bd5' : '#3a3b3d'}`,
})

export function BackgroundControls({ content, onChange }: { content: CustomContent; onChange: (patch: Partial<CustomContent>) => void }) {
  return (
    <div>
      <label style={labelStyle}>Background image (image-led mode)</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {BG_IMAGES.map((b) => (
          <button key={b.label} onClick={() => onChange({ backgroundImage: b.url, bgFocalX: 50, bgFocalY: 50 })} style={bgChip((content.backgroundImage ?? null) === b.url)}>{b.label}</button>
        ))}
      </div>
      {content.backgroundImage && (
        <>
          <label style={labelStyle}>Focal X · {content.bgFocalX ?? 50}</label>
          <input type="range" min={0} max={100} value={content.bgFocalX ?? 50} onChange={(e) => onChange({ bgFocalX: +e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <label style={labelStyle}>Focal Y · {content.bgFocalY ?? 50}</label>
          <input type="range" min={0} max={100} value={content.bgFocalY ?? 50} onChange={(e) => onChange({ bgFocalY: +e.target.value })} style={{ width: '100%' }} />
        </>
      )}
    </div>
  )
}

export function ContentControls({ content, onChange }: { content: CustomContent; onChange: (patch: Partial<CustomContent>) => void }) {
  return (
    <>
      <label style={labelStyle}>Eyebrow</label>
      <input style={fieldStyle} value={content.eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} />
      <label style={labelStyle}>Headline</label>
      <textarea style={{ ...fieldStyle, height: 50 }} value={content.headline} onChange={(e) => onChange({ headline: e.target.value })} />
      <label style={labelStyle}>Subhead</label>
      <textarea style={{ ...fieldStyle, height: 44 }} value={content.subhead} onChange={(e) => onChange({ subhead: e.target.value })} />
      <label style={labelStyle}>Body</label>
      <textarea style={{ ...fieldStyle, height: 60 }} value={content.body} onChange={(e) => onChange({ body: e.target.value })} />
      <label style={labelStyle}>CTA</label>
      <input style={fieldStyle} value={content.cta} onChange={(e) => onChange({ cta: e.target.value })} />
      <label style={labelStyle}>Solution</label>
      <select style={fieldStyle} value={content.solution} onChange={(e) => onChange({ solution: e.target.value })}>
        {SOLUTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, fontSize: 12 }}>
        <label><input type="checkbox" checked={content.showLogo} onChange={(e) => onChange({ showLogo: e.target.checked })} /> logo</label>
        <label><input type="checkbox" checked={content.showSolutionPill} onChange={(e) => onChange({ showSolutionPill: e.target.checked })} /> solution pill</label>
        <label><input type="checkbox" checked={content.hasImage} onChange={(e) => onChange({ hasImage: e.target.checked })} /> image</label>
      </div>
    </>
  )
}
