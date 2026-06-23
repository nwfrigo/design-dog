'use client'

/**
 * Custom-Size LOGO-SCALE lab — SPIKE. Compares how the logo + category chip
 * could scale with the canvas, side by side. Not wired into the app.
 * View at /custom-size-lab/logo-scale.
 *
 * The question: today the logo scales LINEARLY with the canvas (power 1) — a
 * constant % of the canvas, which makes its absolute size swing ~5× across the
 * size range and reads light. A sub-linear power pulls the logo toward a
 * constant ABSOLUTE size ("similar-ish across sizes"). This grid shows the laws
 * (rows) across canvas sizes (cols) so we can pick a power + reference weight.
 *
 * Two view modes:
 *   - Normalized  → every canvas drawn at the SAME display width, so the logo's
 *     FRACTION of the canvas (what ships in the export) is directly comparable.
 *   - Editing fit → every canvas drawn inside a fixed editor-sized pane at its
 *     real fit-scale, with the "shown at X%" badge — i.e. what you actually see
 *     while editing, where big canvases zoom out and everything looks small.
 */

import { useState } from 'react'
import Link from 'next/link'
import colorsJson from '@/public/assets/brand-config/colors.json'
import type { ColorsConfig } from '@/lib/brand-config'
import { CorityLogo } from '@/components/shared/CorityLogo'
import { SolutionPill } from '@/components/shared/SolutionPill'
import { TEMPLATE_THEMES, type TemplateTheme } from '@/lib/template-themes'
import { labelStyle, fieldStyle } from '@/components/custom-size/labShared'

const colors = colorsJson as ColorsConfig

// Square band reference (resolve.ts BAND_REF.square) — the regime where "logo
// too small at 2000px" lives. driver = width, refDriver = 1080.
const REF_DRIVER = 1080
const REF_HEADLINE = 96 // BAND_REF.square.headline
const TYPE_POWER = 0.78 // resolve.ts — headline already scales sub-linearly
const REF_PADDING = 56 // BAND_REF.square.padding (linear)

const SIZES = [400, 1080, 2000, 3200]

type Law = { key: string; label: string; blurb: string; power: number | 'flatter' }
const LAWS: Law[] = [
  { key: 'linear', label: 'Constant % — power 1 (today)', blurb: 'Fixed fraction of the canvas. Absolute size swings most across sizes; reads light.', power: 1 },
  { key: 'type', label: 'Type power — 0.78', blurb: 'Same curve as the headline → logo↔headline lockup stays constant at every size.', power: TYPE_POWER },
  { key: 'flatter', label: 'Own logo curve — floor + gentle power', blurb: 'Min readable px on small canvases, then sub-linear growth. Decoupled from type — this is the candidate.', power: 'flatter' },
  { key: 'fixed', label: 'Constant px — power 0', blurb: 'Identical logo px on every canvas. Tiny fraction on big canvases, heavy on small.', power: 0 },
]

const chip = (active: boolean): React.CSSProperties => ({
  padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
  background: active ? '#2f4660' : '#242527', color: active ? '#cfe0f5' : '#cfd2d6',
  border: `1px solid ${active ? '#5b9bd5' : '#3a3b3d'}`,
})

export default function LogoScaleLab() {
  const [refLogo, setRefLogo] = useState(40) // weight lever (today's engine = 30)
  const [pillBase, setPillBase] = useState(1.5) // chip weight at the reference size
  const [flatter, setFlatter] = useState(0.4) // the own-curve sub-linear power
  const [logoFloor, setLogoFloor] = useState(30) // min readable logo px (own curve)
  const [view, setView] = useState<'normalized' | 'fit'>('normalized')
  const [solution, setSolution] = useState('safety')
  const [theme, setTheme] = useState<TemplateTheme>('light')

  const t = TEMPLATE_THEMES[theme]
  const sol = colors.solutions[solution] || colors.solutions.none

  const powerOf = (law: Law) => (law.power === 'flatter' ? flatter : law.power)

  // Display geometry per view.
  const NORM_W = 230 // every canvas drawn at this width when normalized
  const PANE = 250 // fixed editor-sized pane (square) for the fit view
  const PANE_PAD = 28

  const cell = (law: Law, size: number) => {
    const s = size / REF_DRIVER
    const mult = Math.pow(s, powerOf(law))
    // Own curve adds a floor so small canvases keep a readable mark; all other
    // rows are pure power. Chip tracks the logo's EFFECTIVE multiplier (lockup).
    let logoPx = refLogo * mult // canvas-space logo height
    if (law.key === 'flatter') logoPx = Math.max(logoFloor, logoPx)
    const effMult = logoPx / refLogo
    const pillScale = pillBase * effMult
    const headlinePx = REF_HEADLINE * Math.pow(s, TYPE_POWER) // engine-faithful
    const padPx = REF_PADDING * s

    // Visual scale: normalized = same width for all; fit = real editor fit-scale.
    const k =
      view === 'normalized'
        ? NORM_W / size
        : Math.min(1, (PANE - PANE_PAD * 2) / size)
    const box = view === 'normalized' ? NORM_W : PANE
    const drawn = size * k

    return (
      <div key={law.key + size} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            position: 'relative', width: box, height: box,
            background: view === 'fit' ? '#0f1011' : 'transparent',
            borderRadius: 6, border: '1px solid #2c2d2f',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}
        >
          {/* the canvas */}
          <div style={{ position: 'relative', width: drawn, height: drawn, background: t.backgroundPrimary, overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute', top: 0, left: 0, width: size, height: size,
                transform: `scale(${k})`, transformOrigin: 'top left',
                padding: padPx, display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <CorityLogo fill={t.logoFill} height={logoPx} />
                <SolutionPill variant="email" scale={pillScale} solutionColor={sol.color} solutionLabel={sol.label} textColor={t.textPrimary} background={t.bgCategoryChip} border={`0.79px solid ${t.borderFocus}`} />
              </div>
              <div style={{ marginTop: padPx * 0.7, fontSize: headlinePx, fontWeight: 300, color: t.textPrimary, lineHeight: 1.04 }}>
                Manage EHS risk with confidence
              </div>
            </div>
          </div>
          {/* zoom badge (fit view) — what the real editor would show */}
          {view === 'fit' && k < 0.995 && (
            <div style={{ position: 'absolute', right: 6, bottom: 6, fontSize: 10, fontFamily: 'monospace', color: '#cfd2d6', background: 'rgba(0,0,0,0.55)', padding: '2px 6px', borderRadius: 4 }}>
              shown at {Math.round(k * 100)}%
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#9aa0a6', fontFamily: 'monospace' }}>
          {size}px · logo <span style={{ color: '#cfe0f5' }}>{logoPx.toFixed(0)}px</span> ({((logoPx / size) * 100).toFixed(1)}%)
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#161719', color: '#f2f2f3', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 6 }}>
        <h1 style={{ fontSize: 18 }}>Logo / Chip Scale Lab <span style={{ color: '#7c7d80', fontWeight: 400 }}>· spike</span></h1>
        <Link href="/custom-size-lab" style={{ color: '#5b9bd5', fontSize: 13 }}>↩ ratio grid</Link>
        <Link href="/custom-size-lab/resize" style={{ color: '#5b9bd5', fontSize: 13 }}>↩ resize</Link>
      </div>
      <p style={{ color: '#7c7d80', fontSize: 13, marginBottom: 18, maxWidth: 860 }}>
        Each row is a scaling LAW; each column a square canvas size. <strong style={{ color: '#cfd2d6' }}>Normalized</strong> draws every
        canvas at the same width so you compare the logo&apos;s fraction of the canvas (what ships).
        <strong style={{ color: '#cfd2d6' }}> Editing fit</strong> draws each canvas in a fixed pane at its real zoom — why big canvases look small while editing.
        Weight (reference px) and consistency (power) are independent levers.
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 22, background: '#1c1d1f', border: '1px solid #2c2d2f', borderRadius: 10, padding: 14 }}>
        <div>
          <label style={labelStyle}>View</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('normalized')} style={chip(view === 'normalized')}>Normalized (export)</button>
            <button onClick={() => setView('fit')} style={chip(view === 'fit')}>Editing fit</button>
          </div>
        </div>
        <div style={{ width: 170 }}>
          <label style={labelStyle}>Logo reference · {refLogo}px <span style={{ color: '#5b6066' }}>(today 30)</span></label>
          <input type="range" min={24} max={72} value={refLogo} onChange={(e) => setRefLogo(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ width: 170 }}>
          <label style={labelStyle}>Chip reference · {pillBase.toFixed(2)}×</label>
          <input type="range" min={80} max={260} value={pillBase * 100} onChange={(e) => setPillBase(+e.target.value / 100)} style={{ width: '100%' }} />
        </div>
        <div style={{ width: 180 }}>
          <label style={labelStyle}>Own-curve floor · {logoFloor}px</label>
          <input type="range" min={16} max={56} value={logoFloor} onChange={(e) => setLogoFloor(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ width: 180 }}>
          <label style={labelStyle}>Own-curve power · {flatter.toFixed(2)}</label>
          <input type="range" min={10} max={100} value={flatter * 100} onChange={(e) => setFlatter(+e.target.value / 100)} style={{ width: '100%' }} />
        </div>
        <div style={{ width: 120 }}>
          <label style={labelStyle}>Solution</label>
          <select style={fieldStyle} value={solution} onChange={(e) => setSolution(e.target.value)}>
            {Object.keys(colors.solutions).filter((k) => k !== 'none').map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 0, fontSize: 12, color: '#cfd2d6' }}>
          <input type="checkbox" checked={theme === 'dark'} onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} /> dark
        </label>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {LAWS.map((law) => (
          <div key={law.key}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: '#f2f2f3', fontWeight: 600 }}>{law.label}</span>
              <span style={{ fontSize: 12, color: '#7c7d80', marginLeft: 10 }}>{law.blurb}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {SIZES.map((size) => cell(law, size))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
