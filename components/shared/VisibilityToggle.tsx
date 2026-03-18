'use client'

interface VisibilityToggleProps {
  label: string
  visible: boolean
  onToggle: () => void
}

export function VisibilityToggle({ label, visible, onToggle }: VisibilityToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-500 dark:text-content-secondary">{label}</label>
      <button
        onClick={onToggle}
        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors"
        title={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      >
        {visible ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-content-secondary">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-content-secondary">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </button>
    </div>
  )
}
