#!/usr/bin/env node --experimental-strip-types
/**
 * Validates Stage & Bench Registration files against their adapters.
 *
 * Specifically: every toggleable slot (one whose `slotState[blockId].setVisible`
 * is wired in the adapter) MUST be reflected in the registration's
 * `exportBuilder` — either as a LHS key (`showFoo: s.showFoo`) or by
 * referencing `s.showFoo` on the RHS of a renamed key (`showRenamed: s.showFoo`).
 *
 * The same toggleable flags MUST also appear in `renderProps` as either a
 * direct emitter (`showFoo: asset.showFoo`) or via `asset.showFoo` referenced
 * in some emitted key (rename pattern).
 *
 * This catches the class of bug where a user toggles a slot off in the editor
 * but the export pipeline silently ignores it and the rendered output shows
 * the slot anyway.
 *
 * SECOND CHECK — text render sites. Every slot declaring
 * `content: { format: 'html' }` stores real HTML (InlineTextEdit reads
 * `innerHTML` back out of its contentEditable; the editbar's block-level Bold
 * wraps the value in `<strong>`). Its render site in the template component
 * MUST therefore go through the `<RichText>` primitive. Passing an HTML string
 * to React as a text child escapes it, so the user sees literal `<strong>` /
 * `<div>` on the canvas AND in the export.
 *
 * This is not hypothetical: 21 slots across 11 templates shipped this way. The
 * adapters were given `format: 'html'` wholesale during the Stage & Bench
 * migration, but only the templates that had previously been on the legacy
 * sidebar's rich-text allow-list had render sites that spoke HTML. Nothing
 * connected the two halves — hence this gate.
 *
 * The mirror case is checked too: a `plain` slot that allows Enter (not
 * `singleLine`, not a CTA) stores a literal `\n`, which HTML collapses to a
 * space. Those render sites must use `<PlainText>`, whose `pre-wrap` keeps the
 * break the editor already shows.
 *
 * Run via: `npm run validate:registrations`
 * Exits 1 if any drift is found.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ADAPTERS_DIR = join(
  process.cwd(),
  'components/canvas-editor/template-adapters',
)

type AdapterSummary = {
  name: string
  registrationPath: string
  adapterPath: string
  /** show* flags the adapter wires via setVisible in slotState (user-toggleable). */
  toggleableFlags: string[]
  /** Full text of exportBuilder (for searching). */
  builderText: string
  /** Full text of renderProps (for searching). */
  renderPropsText: string
}

function readAdapterPair(name: string): AdapterSummary | null {
  const adapterPath = join(ADAPTERS_DIR, `${name}StageBench.tsx`)

  let registration: string
  let registrationPath: string
  let adapter: string
  try {
    // Registrations may be .ts or .tsx (the latter when they carry preview JSX).
    registrationPath = join(ADAPTERS_DIR, `${name}Registration.ts`)
    try {
      registration = readFileSync(registrationPath, 'utf8')
    } catch {
      registrationPath = join(ADAPTERS_DIR, `${name}Registration.tsx`)
      registration = readFileSync(registrationPath, 'utf8')
    }
    adapter = readFileSync(adapterPath, 'utf8')
  } catch {
    return null
  }

  const toggleableFlags = Array.from(
    adapter.matchAll(/setVisible:\s*set(Show[A-Z][a-zA-Z0-9]*)/g),
  )
    .map((m) => 'show' + m[1].slice(4))
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()

  const builderText = extractFnBody(registration, 'exportBuilder')
  const renderPropsText = extractFnBody(registration, 'renderProps')

  return {
    name,
    registrationPath,
    adapterPath,
    toggleableFlags,
    builderText,
    renderPropsText,
  }
}

/** Extracts the body of `name: (...) => ({ ... })` or `name: (...) => { ... }` from a file. */
function extractFnBody(text: string, name: string): string {
  const startRe = new RegExp(`${name}:\\s*\\([^)]*\\)\\s*=>\\s*`)
  const match = startRe.exec(text)
  if (!match) return ''
  let i = match.index + match[0].length
  // We expect either '(' (paren-wrapped object) or '{' (block).
  const open = text[i]
  if (open !== '(' && open !== '{') return ''
  const wantClose = open === '(' ? ')' : '}'
  const wantBraceMatch = '{'
  const braceClose = '}'
  let depth = 0
  let braceDepth = 0
  const start = i
  for (; i < text.length; i++) {
    const c = text[i]
    if (c === open) depth++
    else if (c === wantClose) {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    } else if (open === '(' && c === wantBraceMatch) braceDepth++
    else if (open === '(' && c === braceClose) braceDepth--
  }
  return text.slice(start)
}

function validateFlag(flag: string, builderText: string, renderPropsText: string): {
  builderOk: boolean
  renderPropsOk: boolean
} {
  // Builder ok if `flag:` is a LHS key, or `s.flag` is referenced anywhere
  // in the builder body (rename pattern).
  const builderOk =
    new RegExp(`^\\s+${flag}:`, 'm').test(builderText) ||
    new RegExp(`\\bs\\.${flag}\\b`).test(builderText)

  // renderProps ok if `flag:` is a LHS key, or `asset.flag` is referenced.
  const renderPropsOk =
    new RegExp(`^\\s+${flag}:`, 'm').test(renderPropsText) ||
    new RegExp(`\\basset\\.${flag}\\b`).test(renderPropsText)

  return { builderOk, renderPropsOk }
}

/**
 * Slot ids grouped by the render primitive their template must use.
 *
 * Slot descriptors are flat object literals, so we window forward from each
 * `blockId:` to the next one and read the content spec inside that window.
 *
 *  - `html`      → `<RichText>`  (stores real HTML; escaping it shows raw tags)
 *  - `plainMulti`→ `<PlainText>` (stores `\n`; HTML collapses it to a space)
 *
 * Single-line plain slots need no primitive — they can't contain a newline and
 * can't carry tags. "Single-line" follows the factory's own default:
 * `spec.singleLine ?? (kind === 'cta')`.
 */
function slotIdsByRenderKind(adapter: string): { html: string[]; plainMulti: string[] } {
  const html: string[] = []
  const plainMulti: string[] = []
  const chunks = adapter.split(/blockId:\s*'/).slice(1)
  for (const chunk of chunks) {
    const id = chunk.slice(0, chunk.indexOf("'"))
    const win = chunk.slice(0, 900)
    const spec = /content:\s*\{([^}]*)\}/.exec(win)
    if (!spec) continue
    const body = spec[1]
    if (/format:\s*'html'/.test(body)) {
      if (!html.includes(id)) html.push(id)
      continue
    }
    if (!/format:\s*'plain'/.test(body)) continue
    const kind = /kind:\s*'(\w+)'/.exec(win)?.[1] ?? ''
    const singleLine = /singleLine:/.test(body)
      ? /singleLine:\s*true/.test(body)
      : kind === 'cta'
    if (!singleLine && !plainMulti.includes(id)) plainMulti.push(id)
  }
  return { html, plainMulti }
}

/**
 * Template component files this adapter renders. Adapters reach the templates
 * either relatively (`../../templates/X`, the common form) or via the alias
 * (`@/components/templates/X`); both resolve to `components/templates/`.
 * A directory import pulls in every page/part file inside it.
 */
function templateSourcesFor(adapter: string): string[] {
  const out: string[] = []
  const importRe = /from '(?:@\/components|\.\.\/\.\.|\.\.)\/templates\/([A-Za-z0-9/]+)'/g
  for (const m of Array.from(adapter.matchAll(importRe))) {
    const base = join(process.cwd(), 'components/templates', m[1])
    if (existsSync(`${base}.tsx`)) out.push(`${base}.tsx`)
    if (existsSync(base) && statSync(base).isDirectory()) {
      for (const f of readdirSync(base)) {
        if (f.endsWith('.tsx')) out.push(join(base, f))
      }
    }
  }
  return out
}

/**
 * The JSX a template renders for `blockId` when the slot is NOT being edited.
 * Two shapes exist across the substrate (STAGE-AND-BENCH.md §4.15 / §8.5):
 *   ContentStack — `{ id: 'x', …, defaultInner: <JSX> }`
 *   Track 2      — `wrapInline('x', <JSX>)`
 * Returns null when neither shape is found, which the caller reports rather
 * than treating as a pass.
 */
function renderSiteFor(blockId: string, source: string): string | null {
  const id = blockId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const stack = new RegExp(
    `id:\\s*'${id}'[\\s\\S]{0,600}?defaultInner:\\s*([\\s\\S]{0,300}?)(?:renderChrome:|\\n\\s*\\},)`,
  ).exec(source)
  if (stack) return stack[1]
  const inline = new RegExp(
    `wrapInline\\(\\s*\`?'${id}'[\\s\\S]{0,20}?,\\s*\\(?\\s*([\\s\\S]{0,300}?)\\)?\\s*\\)`,
  ).exec(source)
  if (inline) return inline[1]
  return null
}

function validateTextRenderSites(name: string, adapter: string): string[] {
  const { html: htmlIds, plainMulti: plainIds } = slotIdsByRenderKind(adapter)
  if (htmlIds.length === 0 && plainIds.length === 0) return []

  const sources = templateSourcesFor(adapter)
  if (sources.length === 0) {
    return [`could not resolve any templates/ source for ${name}`]
  }
  const source = sources.map((p) => readFileSync(p, 'utf8')).join('\n')

  const CHECKS = [
    {
      ids: htmlIds,
      label: 'html',
      primitive: 'RichText',
      why: 'React escapes HTML strings, so <strong>/<div> render as literal text',
    },
    {
      ids: plainIds,
      label: 'multi-line plain',
      primitive: 'PlainText',
      why: 'HTML collapses the stored \\n, so the user\'s line break vanishes on commit',
    },
  ]

  const issues: string[] = []
  for (const { ids, label, primitive, why } of CHECKS) {
    for (const id of ids) {
      const site = renderSiteFor(id, source)
      if (site === null) {
        issues.push(
          `${label} slot '${id}': could not locate its render site — expected ` +
            `\`defaultInner:\` (ContentStack) or \`wrapInline('${id}', …)\` (Track 2)`,
        )
      } else if (!new RegExp(`\\b${primitive}\\b`).test(site)) {
        issues.push(
          `${label} slot '${id}': render site does not use <${primitive}> — ` +
            `\`${site.replace(/\s+/g, ' ').trim().slice(0, 70)}\` (${why})`,
        )
      }
    }
  }
  return issues
}

function main() {
  const files = readdirSync(ADAPTERS_DIR)
    .filter((f) => /Registration\.tsx?$/.test(f))
    .map((f) => f.replace(/Registration\.tsx?$/, ''))
    .sort()

  let failures = 0
  const results: { name: string; issues: string[] }[] = []

  // Computed-slot adapters: the slot set is resolved at runtime and visibility
  // rides inside a serialized document (customSizeConfig), not as show* params,
  // so the static show*-flag check doesn't apply. (Substrate carve-out.)
  const COMPUTED_SLOT_ADAPTERS = new Set(['CustomSize'])

  for (const name of files) {
    const summary = readAdapterPair(name)
    if (!summary) continue

    const issues: string[] = []

    // Text render sites apply to every adapter, including the computed-slot
    // ones — the format↔render-site contract is independent of how the slot
    // set is resolved.
    issues.push(...validateTextRenderSites(name, readFileSync(summary.adapterPath, 'utf8')))

    if (COMPUTED_SLOT_ADAPTERS.has(name)) {
      if (issues.length > 0) {
        failures += issues.length
        results.push({ name, issues })
      }
      continue
    }

    for (const flag of summary.toggleableFlags) {
      const { builderOk, renderPropsOk } = validateFlag(
        flag,
        summary.builderText,
        summary.renderPropsText,
      )

      if (!builderOk) {
        issues.push(`exportBuilder: missing wiring for ${flag} (not emitted as key, and s.${flag} not referenced)`)
      }
      if (!renderPropsOk) {
        issues.push(`renderProps:   missing wiring for ${flag} (not emitted as key, and asset.${flag} not referenced)`)
      }
    }

    if (issues.length > 0) {
      failures += issues.length
      results.push({ name, issues })
    }
  }

  if (results.length === 0) {
    console.log('✓ All registration export pipelines are wired correctly.')
    console.log('✓ All html slots render through <RichText>; multi-line plain slots through <PlainText>.')
    console.log(`  Checked ${files.length} registrations.`)
    process.exit(0)
  }

  console.error('✗ Registration drift detected:\n')
  for (const r of results) {
    console.error(`  ${r.name}:`)
    for (const issue of r.issues) {
      console.error(`    - ${issue}`)
    }
    console.error()
  }
  console.error(`Total issues: ${failures}\n`)
  console.error('Fix (missing toggleable): either emit it as a LHS key in')
  console.error('exportBuilder/renderProps, or reference s.<flag> / asset.<flag>')
  console.error('on the RHS of a renamed key (e.g. `showEventDate: s.showCceEventDate`).')
  console.error()
  console.error('Fix (html slot): render the value through the shared primitive —')
  console.error("  import { RichText } from '@/components/shared/RichText'")
  console.error('  defaultInner: <RichText html={headline || SLOT_PLACEHOLDERS.headline} />')
  console.error('Or, if the slot genuinely has no inline formatting, change the')
  console.error("adapter's SlotContentSpec to `format: 'plain'`.")
  console.error()
  console.error('Fix (multi-line plain slot): preserve the newline the editor shows —')
  console.error("  import { PlainText } from '@/components/shared/PlainText'")
  console.error('  defaultInner: <PlainText text={headline || SLOT_PLACEHOLDERS.headline} />')
  console.error("Or, if the field should be one line, set `singleLine: true` on its")
  console.error('SlotContentSpec so Enter is suppressed at the source.')
  process.exit(1)
}

main()
