'use client'

import { Smile, ArrowUpRight } from 'lucide-react'

interface InfoToastProps {
  onClick: () => void
}

/**
 * Collapsed-state chip. Sits bottom-left of the viewport, no border, drop
 * shadow only. Click anywhere reopens the modal. Spec is Figma node
 * `395:2427`: 213×40, p-12, gap-48 between smile-text group and arrow,
 * gap-8 inside group.
 */
export function InfoToast({ onClick }: InfoToastProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="See what's new in Design Dog 1.5"
      className="fixed bottom-5 left-5 z-[10001] flex h-10 items-center gap-12 rounded-md bg-surface-secondary px-3 font-mono text-xs uppercase tracking-wider text-content-primary transition-colors hover:opacity-90"
      style={{
        boxShadow:
          '0 var(--elevation-md-y) var(--elevation-md-blur) var(--elevation-md-color)',
      }}
    >
      <span className="flex items-center gap-2">
        <Smile size={20} strokeWidth={1.5} />
        <span>See what&rsquo;s new</span>
      </span>
      <ArrowUpRight size={12} strokeWidth={1.5} />
    </button>
  )
}
