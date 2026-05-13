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
 * Run via: `npm run validate:registrations`
 * Exits 1 if any drift is found.
 */

import { readFileSync, readdirSync } from 'node:fs'
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
  const registrationPath = join(ADAPTERS_DIR, `${name}Registration.ts`)
  const adapterPath = join(ADAPTERS_DIR, `${name}StageBench.tsx`)

  let registration: string
  let adapter: string
  try {
    registration = readFileSync(registrationPath, 'utf8')
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

function main() {
  const files = readdirSync(ADAPTERS_DIR)
    .filter((f) => f.endsWith('Registration.ts'))
    .map((f) => f.replace(/Registration\.ts$/, ''))
    .sort()

  let failures = 0
  const results: { name: string; issues: string[] }[] = []

  for (const name of files) {
    const summary = readAdapterPair(name)
    if (!summary) continue

    const issues: string[] = []

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
  console.error('Fix: for each missing toggleable, either emit it as a LHS key in')
  console.error('exportBuilder/renderProps, or reference s.<flag> / asset.<flag>')
  console.error('on the RHS of a renamed key (e.g. `showEventDate: s.showCceEventDate`).')
  process.exit(1)
}

main()
