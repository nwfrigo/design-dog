'use client'

import { useState, useMemo } from 'react'
import { icons, type LucideIcon } from 'lucide-react'

// All Lucide icons available dynamically
// icons is an object like { Activity: IconComponent, ... }
const ALL_ICONS = Object.entries(icons).map(([name, icon]) => ({
  name: name
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, ''), // Convert PascalCase to kebab-case
  pascalName: name,
  icon: icon as LucideIcon,
}))

// Helper to get icon component by kebab-case name
export function getIconByName(name: string): LucideIcon | null {
  // Convert kebab-case back to PascalCase for lookup
  const pascalName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  return (icons as Record<string, LucideIcon>)[pascalName] ?? null
}

interface IconPickerModalProps {
  value?: string
  onChange: (iconName: string) => void
  onClose: () => void
}

export function IconPickerModal({ value, onChange, onClose }: IconPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter icons by search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_ICONS
    }

    const query = searchQuery.toLowerCase()
    return ALL_ICONS.filter(item =>
      item.name.includes(query) ||
      item.pascalName.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const handleSelect = (iconName: string) => {
    onChange(iconName)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal — aligned to the newer editor UI (mono/uppercase labels, surface
          + line-subtle tokens, neutral selection ring rather than blue). */}
      <div className="relative bg-white dark:bg-surface-primary border border-gray-200 dark:border-line-subtle rounded-lg shadow-xl w-[560px] max-w-[90vw] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-line-subtle">
          <h3 className="font-mono text-[12px] uppercase tracking-wide text-gray-500 dark:text-content-secondary">
            Select Icon
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-gray-400 hover:text-gray-700 dark:text-content-secondary dark:hover:text-content-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-line-subtle">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons…"
              className="w-full pl-10 pr-4 py-2 font-mono text-[13px] bg-gray-50 dark:bg-surface-secondary border border-gray-200 dark:border-line-subtle rounded-md text-gray-900 dark:text-content-primary placeholder:text-gray-400 dark:placeholder:text-content-secondary focus:outline-none focus:border-gray-400 dark:focus:border-content-secondary transition-colors"
              autoFocus
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-content-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filteredIcons.length === 0 ? (
            <p className="text-center font-mono text-[12px] uppercase tracking-wide text-gray-400 dark:text-content-secondary py-8">
              No icons match your search
            </p>
          ) : (
            <div className="grid grid-cols-10 gap-1">
              {filteredIcons.map((item) => {
                const IconComponent = item.icon
                const isSelected = value === item.name

                return (
                  <button
                    key={item.name}
                    onClick={() => handleSelect(item.name)}
                    title={item.name.replace(/-/g, ' ')}
                    className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-gray-100 dark:bg-surface-secondary ring-1 ring-gray-900 dark:ring-content-primary'
                        : 'hover:bg-gray-100 dark:hover:bg-interactive-hover'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${
                        isSelected
                          ? 'text-gray-900 dark:text-content-primary'
                          : 'text-gray-600 dark:text-content-secondary'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-line-subtle font-mono text-[11px] uppercase tracking-wide text-gray-400 dark:text-content-secondary">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}

// Simple inline picker button + modal combo (optional convenience component)
interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const SelectedIcon = value ? getIconByName(value) : null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex-shrink-0 w-8 h-8 bg-white dark:bg-surface-tertiary border border-gray-300 dark:border-line-subtle rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer ${className ?? ''}`}
        title="Select icon"
      >
        {SelectedIcon ? (
          <SelectedIcon className="w-4 h-4 text-gray-600 dark:text-content-secondary" />
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <IconPickerModal
          value={value}
          onChange={onChange}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
