'use client'

import { Maximize2, ListPlus, Download, Loader2, ListChecks, type LucideIcon } from 'lucide-react'

/**
 * ActionButton — atomic button used in the action row below the Stage.
 *
 * Visual contract (matches Figma node 323:2070):
 *   - 28h, 0.5px line-subtle border, radius/sm (4px)
 *   - px-8 py-6, gap spacing/md (8px)
 *   - 12×12 icon + UPPERCASE mono 12px label
 *   - preview / add-to-queue / save-to-queue: bg surface/primary, text/icon
 *     content/secondary (muted secondary-style)
 *   - export: bg surface/inverse, text/icon content/inverse (the primary CTA)
 *
 * `loading` swaps the kind icon for a spinner (matches the existing
 * "isExporting" UX in EditorScreen).
 */

export type ActionFn = 'preview' | 'add-to-queue' | 'save-to-queue' | 'export'

const FN_ICON: Record<ActionFn, LucideIcon> = {
  preview: Maximize2,
  'add-to-queue': ListPlus,
  'save-to-queue': ListChecks,
  export: Download,
}

const DEFAULT_LABEL: Record<ActionFn, string> = {
  preview: 'Preview',
  'add-to-queue': 'Add to Queue',
  'save-to-queue': 'Save & Return to Queue',
  export: 'Export',
}

export interface ActionButtonProps {
  fn: ActionFn
  /** Optional label override. Default: friendly label rendered uppercase via CSS. */
  label?: string
  onClick: () => void
  disabled?: boolean
  /** Spinner replaces the kind icon. */
  loading?: boolean
}

export function ActionButton({ fn, label, onClick, disabled, loading }: ActionButtonProps) {
  const Icon = loading ? Loader2 : FN_ICON[fn]
  const isInverse = fn === 'export'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center gap-2',
        'h-7 px-2',
        'border-[0.5px] border-line-subtle rounded-[4px]',
        'whitespace-nowrap',
        'transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isInverse
          ? 'bg-surface-inverse text-content-inverse hover:opacity-90'
          : 'bg-surface-primary text-content-secondary hover:bg-interactive-hover',
      ].join(' ')}
    >
      <Icon size={12} className={['shrink-0', loading ? 'animate-spin' : ''].join(' ')} />
      <span className="font-mono text-[12px] uppercase leading-none">
        {label ?? DEFAULT_LABEL[fn]}
      </span>
    </button>
  )
}
