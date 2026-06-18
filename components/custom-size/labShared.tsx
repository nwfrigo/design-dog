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
