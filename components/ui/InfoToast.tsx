'use client'

import { Smile, ArrowUpRight, type LucideIcon } from 'lucide-react'

/**
 * InfoToast — small floating info/announce pill (design-system, Figma node
 * 395:2427 "info-toast-closed").
 *
 * `surface-secondary` fill, elevation/md shadow, radius/md, 40px tall. Leading
 * icon (20px) + UPPERCASE mono label + trailing arrow-up-right. Renders as a
 * link when `href` is set, else a button. The "closed" (collapsed) presentation;
 * an expanded variant can layer on later.
 */

export interface InfoToastProps {
  label: string
  /** Leading glyph. Default: Smile. */
  icon?: LucideIcon
  href?: string
  onClick?: () => void
}

export function InfoToast({ label, icon: Icon = Smile, href, onClick }: InfoToastProps) {
  const inner = (
    <>
      <span className="inline-flex items-center gap-2">
        <Icon size={20} className="shrink-0 text-content-primary" />
        <span className="font-mono text-[12px] uppercase text-content-primary whitespace-nowrap">
          {label}
        </span>
      </span>
      <ArrowUpRight size={12} className="shrink-0 text-content-primary" />
    </>
  )

  const className = [
    'inline-flex items-center justify-between gap-12 h-10 px-3',
    'bg-surface-secondary rounded-md',
    'shadow-[0_var(--elevation-md-y)_var(--elevation-md-blur)_var(--elevation-md-color)]',
    'cursor-pointer',
  ].join(' ')

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  )
}
