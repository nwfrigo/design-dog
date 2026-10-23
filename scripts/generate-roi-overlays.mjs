/**
 * Generates the pre-rendered PNG overlays used by the industry-roi template.
 *
 * Why these exist: Chromium's print-to-PDF encodes CSS alpha gradients and
 * box-shadows as shading patterns + soft masks, which pdf.js (Firefox,
 * Highspot, Seismic, SharePoint previews…) misrenders — alpha gradients come
 * out magenta and glow shadows get hard rectangular banding. Transparent PNGs
 * become plain images with an alpha SMask, which every PDF renderer handles.
 *
 * Run: node scripts/generate-roi-overlays.mjs
 * Output: public/assets/industry-roi/*.png (committed; only re-run when the
 * fade/glow design values in components/templates/IndustryRoi.tsx change).
 */
import puppeteer from 'puppeteer'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const OUT_DIR = fileURLToPath(new URL('../public/assets/industry-roi/', import.meta.url))

// Sizes mirror the live elements in IndustryRoi.tsx. The glow PNGs stretch a
// few px at render time (calc(100% + 2*spread)), which is invisible on a blur.
const SPECS = [
  {
    name: 'hero-fade-left', w: 367, h: 264, margin: 0,
    css: 'background: linear-gradient(to right, #ffffff 0%, #ffffff 55%, rgba(255,255,255,0.86) 72%, rgba(255,255,255,0) 100%)',
  },
  {
    name: 'hero-fade-bottom', w: 612, h: 150, margin: 0,
    css: 'background: linear-gradient(to top, #ffffff 30%, rgba(255,255,255,0.86) 60%, rgba(255,255,255,0) 100%)',
  },
  {
    name: 'glow-card', w: 164, h: 208, margin: 20,
    css: 'border-radius: 6px; box-shadow: 0 0 12px rgba(0,128,255,0.3)',
  },
  {
    name: 'glow-chip', w: 110, h: 26, margin: 12,
    css: 'border-radius: 6px; box-shadow: 0 0 6px rgba(0,128,255,0.3)',
  },
  {
    name: 'shadow-pill', w: 140, h: 25, margin: 6,
    css: 'border-radius: 6px; box-shadow: 0 0 2px rgba(0,0,0,0.1)',
  },
]

const browser = await puppeteer.launch()
const page = await browser.newPage()

await mkdir(OUT_DIR, { recursive: true })

for (const { name, w, h, margin, css } of SPECS) {
  await page.setViewport({ width: w + margin * 2, height: h + margin * 2, deviceScaleFactor: 2 })
  await page.setContent(`
    <style>html, body { margin: 0; background: transparent; }</style>
    <div style="position: absolute; left: ${margin}px; top: ${margin}px; width: ${w}px; height: ${h}px; ${css}"></div>
  `)
  const png = await page.screenshot({ type: 'png', omitBackground: true })
  await writeFile(new URL(`${name}.png`, `file://${OUT_DIR}`), png)
  console.log(`wrote ${name}.png (${(w + margin * 2) * 2}x${(h + margin * 2) * 2})`)
}

await browser.close()
