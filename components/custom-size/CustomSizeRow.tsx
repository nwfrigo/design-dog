'use client'

import { useEffect, useState } from 'react'
import { Undo2, MoveHorizontal, MoveVertical, Lock, Unlock } from 'lucide-react'
import { Field, PresetChip, Toggle } from '@/components/ui'
import { RATIO_PRESETS } from '@/lib/custom-size/ratioPresets'

/**
 * CustomSizeRow — the custom-size editor's dimension control strip (Figma
 * node 531:3626). Sits between the Stage and the ActionRow.
 *
 * Composition (not a DS primitive — the arrangement is custom-size-specific;
 * the parts are DS): UNDO chip · W×H Fields · ratio preset chips · SHOW PRESETS
 * toggle. The Fields own their in-progress edit string and commit a clamped
 * integer on blur/Enter, so the canvas re-resolves on commit rather than on
 * every keystroke.
 */

const MIN_DIM = 1
const MAX_DIM = 9999

export interface CustomSizeRowProps {
  width: number
  height: number
  onCommitWidth: (n: number) => void
  onCommitHeight: (n: number) => void
  /** Apply a ratio, anchored on the current width. */
  onApplyPreset: (rw: number, rh: number) => void
  onUndo: () => void
  canUndo: boolean
  /** Magnetic snap-to-preset-ratios while edge-dragging the canvas (PRD).
   *  The "snap to presets" toggle drives this; the preset chips are always shown. */
  snapToPresets: boolean
  onToggleSnap: (next: boolean) => void
  /** Lock aspect ratio: W/H field edits + canvas drags keep the current ratio.
   *  Default off (free transform). The button replaces the W×H separator. */
  constrainProportions: boolean
  onToggleConstrain: (next: boolean) => void
}

function clampInt(raw: string, fallback: number): number {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(MAX_DIM, Math.max(MIN_DIM, n))
}

export function CustomSizeRow({
  width,
  height,
  onCommitWidth,
  onCommitHeight,
  onApplyPreset,
  onUndo,
  canUndo,
  snapToPresets,
  onToggleSnap,
  constrainProportions,
  onToggleConstrain,
}: CustomSizeRowProps) {
  // Local edit strings so the user can clear/retype freely; re-sync whenever
  // the committed dims change (preset apply, undo, external resize).
  const [wStr, setWStr] = useState(String(width))
  const [hStr, setHStr] = useState(String(height))
  useEffect(() => setWStr(String(width)), [width])
  useEffect(() => setHStr(String(height)), [height])

  const ratio = width / height
  const isActive = (rw: number, rh: number) => Math.abs(ratio - rw / rh) < 0.005

  return (
    <div className="flex items-center gap-8">
      <PresetChip icon={Undo2} label="undo" onClick={onUndo} disabled={!canUndo} />

      <div className="flex items-center gap-1">
        <Field
          icon={MoveHorizontal}
          type="number"
          value={wStr}
          onChange={setWStr}
          onCommit={() => onCommitWidth(clampInt(wStr, width))}
          widthPx={84}
          ariaLabel="Canvas width"
        />
        <button
          type="button"
          onClick={() => onToggleConstrain(!constrainProportions)}
          aria-pressed={constrainProportions}
          aria-label={constrainProportions ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
          title={constrainProportions ? 'Aspect ratio locked' : 'Lock aspect ratio'}
          className={`shrink-0 flex items-center justify-center rounded p-1 transition-colors ${
            constrainProportions ? 'text-content-primary' : 'text-content-secondary hover:text-content-primary'
          }`}
        >
          {constrainProportions ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <Field
          icon={MoveVertical}
          type="number"
          value={hStr}
          onChange={setHStr}
          onCommit={() => onCommitHeight(clampInt(hStr, height))}
          widthPx={84}
          ariaLabel="Canvas height"
        />
      </div>

      {/* Toggle: magnetic snap to preset ratios while edge-dragging the canvas. */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[12px] uppercase text-content-secondary whitespace-nowrap">
          snap to presets
        </span>
        <Toggle
          checked={snapToPresets}
          onChange={onToggleSnap}
          ariaLabel="Snap to preset ratios while resizing"
        />
      </div>

      {/* Preset ratio chips — shown to the right of the toggle only when snapping
       *  is on (they ARE the snap presets). Click to apply a ratio. */}
      {snapToPresets && (
        <div className="flex items-center gap-1">
          {RATIO_PRESETS.map((p) => (
            <PresetChip
              key={p.label}
              label={p.label}
              onClick={() => onApplyPreset(p.rw, p.rh)}
              active={isActive(p.rw, p.rh)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
