'use client'

/**
 * Custom-Size EXPORT FIDELITY test — SPIKE.
 *
 * Renders representative docs at NATIVE 1× (no scaling), so a screenshot here ≈
 * what the Puppeteer export would produce. Use it to eyeball the things that
 * render differently in a headless screenshot than in the editor:
 *   - overlay gradients + mix-blend-mode noise
 *   - the data-URI noise texture
 *   - fractional (scale-invariant) font sizes
 *   - background-image loading
 *
 * Lab-only — does NOT go through the production export route. View at
 * /custom-size-lab/export-test. `#render-ready` is included so a headless
 * screenshotter can wait on it.
 */

import colorsJson from '@/public/assets/brand-config/colors.json'
import typographyJson from '@/public/assets/brand-config/typography.json'
import type { ColorsConfig, TypographyConfig } from '@/lib/brand-config'
import { CustomSizeCanvas } from '@/components/custom-size/CustomSizeCanvas'
import { DEFAULT_CONTENT } from '@/components/custom-size/labShared'
import type { CustomContent } from '@/lib/custom-size/resolve'

const colors = colorsJson as ColorsConfig
const typography = typographyJson as TypographyConfig

const SCENE = '/assets/image-library/images/scenes/design-dog-library_006.jpg'

const CASES: { label: string; w: number; h: number; content: CustomContent }[] = [
  {
    label: 'Landscape + zone image (row) — 1200×628',
    w: 1200, h: 628,
    content: { ...DEFAULT_CONTENT, hasImage: true, backgroundImage: null },
  },
  {
    label: 'Square + background overlay (fade-up, noise) — 1080×1080',
    w: 1080, h: 1080,
    content: { ...DEFAULT_CONTENT, backgroundImage: SCENE, overlayColor: '#060015', overlayOpacity: 0.55, overlayCoverage: 'fade-up', overlayNoise: true, bgFocalX: 50, bgFocalY: 40 },
  },
  {
    label: 'Portrait + orange overlay (fade-down) — 1080×1350',
    w: 1080, h: 1350,
    content: { ...DEFAULT_CONTENT, backgroundImage: SCENE, overlayColor: '#D35F0B', overlayOpacity: 0.5, overlayCoverage: 'fade-down', overlayNoise: false, bgFocalX: 55, bgFocalY: 45 },
  },
  {
    label: 'Tower (fractional sizes) — 300×1500',
    w: 300, h: 1500,
    content: { ...DEFAULT_CONTENT, hasImage: false, backgroundImage: null },
  },
  {
    label: 'Strip — 1500×300',
    w: 1500, h: 300,
    content: { ...DEFAULT_CONTENT, hasImage: false, backgroundImage: null },
  },
]

export default function ExportFidelityTest() {
  return (
    <div style={{ background: '#444', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>
        Custom-Size export fidelity · native 1× (screenshot ≈ exported PNG)
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {CASES.map((c) => (
          <div key={c.label}>
            <div style={{ color: '#ddd', fontSize: 12, fontFamily: 'monospace', marginBottom: 6 }}>{c.label}</div>
            <div style={{ display: 'inline-block', boxShadow: '0 0 0 1px rgba(0,0,0,0.4)' }}>
              <CustomSizeCanvas content={c.content} width={c.w} height={c.h} theme="dark" colors={colors} typography={typography} scale={1} />
            </div>
          </div>
        ))}
      </div>
      <div id="render-ready" />
    </div>
  )
}
