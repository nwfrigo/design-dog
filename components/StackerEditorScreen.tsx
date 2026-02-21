'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { StackerPreviewEditor } from './StackerPreviewEditor'
import { ImageCropModal } from './ImageCropModal'
import type { StackerModule, StackerImageModule, StackerImage16x9Module, SolutionCategory } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Module type labels
const MODULE_LABELS: Record<string, string> = {
  'logo-chip': 'Logo & Chips',
  'header': 'Header',
  'paragraph': 'Paragraph',
  'bullet-three': '3 Bullets',
  'image': 'Image - 1:1',
  'image-16x9': 'Image - 16:9',
  'divider': 'Divider',
  'three-card': 'Cards',
  'quote': 'Quote',
  'three-stats': '3 Stats',
  'one-stat': '1 Stat',
  'footer': 'Footer',
}

// Create default module with initial values
function createDefaultModule(type: StackerModule['type']): StackerModule {
  const id = generateId()

  switch (type) {
    case 'logo-chip':
      return {
        id,
        type: 'logo-chip',
        showChips: true,
        activeCategories: ['environmental', 'health', 'safety', 'quality', 'sustainability'] as SolutionCategory[],
      }
    case 'header':
      return {
        id,
        type: 'header',
        heading: 'Lorem ipsum dolor sit amet',
        headingSize: 'h1',
        subheader: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        showSubheader: true,
        cta: 'Learn More',
        ctaUrl: '',
        showCta: true,
      }
    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        intro: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ultrices turpis eget commodo maximus.',
        body: 'Suspendisse potenti. Pellentesque imperdiet at odio tincidunt vehicula. Donec vel felis erat. Praesent iaculis malesuada neque at mattis.',
        showIntro: true,
        showBody: true,
      }
    case 'bullet-three':
      return {
        id,
        type: 'bullet-three',
        heading: 'Lorem ipsum dolor sit amet',
        columns: [
          { label: 'Column 1', bullets: ['First bullet', 'Second bullet', 'Third bullet'] },
          { label: 'Column 2', bullets: ['First bullet', 'Second bullet', 'Third bullet'] },
          { label: 'Column 3', bullets: ['First bullet', 'Second bullet', 'Third bullet'] },
        ],
      }
    case 'image':
      return {
        id,
        type: 'image',
        imagePosition: 'left',
        imageUrl: null,
        imagePan: { x: 0, y: 0 },
        imageZoom: 1,
        grayscale: false,
        eyebrow: 'Lorem ipsum dolor',
        showEyebrow: true,
        heading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ultrices',
        showHeading: true,
        body: 'Suspendisse potenti. Pellentesque imperdiet at odio tincidunt vehicula. Donec vel felis erat. Praesent iaculis malesuada neque at mattis.',
        showBody: true,
        cta: 'Learn More',
        ctaUrl: '',
        showCta: true,
      }
    case 'image-16x9':
      return {
        id,
        type: 'image-16x9',
        imagePosition: 'left',
        imageUrl: null,
        imagePan: { x: 0, y: 0 },
        imageZoom: 1,
        grayscale: false,
        eyebrow: 'Lorem ipsum dolor',
        showEyebrow: true,
        heading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        showHeading: true,
        body: 'Suspendisse potenti. Pellentesque imperdiet at odio tincidunt vehicula.',
        showBody: true,
      }
    case 'divider':
      return {
        id,
        type: 'divider',
      }
    case 'three-card':
      return {
        id,
        type: 'three-card',
        cards: [
          { icon: 'zap', title: 'Card 1', description: 'Description for card 1' },
          { icon: 'shield-check', title: 'Card 2', description: 'Description for card 2' },
          { icon: 'clock', title: 'Card 3', description: 'Description for card 3' },
        ],
      }
    case 'quote':
      return {
        id,
        type: 'quote',
        quote: '"Aliquam a nunc lobortis, sodales erat vel, lobortis mi. In semper elit at feugiat sodales."',
        name: 'Firstname Lastname',
        jobTitle: 'Job Title',
        organization: 'Organization Name',
      }
    case 'three-stats':
      return {
        id,
        type: 'three-stats',
        stats: [
          { value: '0,000', label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' },
          { value: '0,000', label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' },
          { value: '0,000', label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' },
        ],
      }
    case 'one-stat':
      return {
        id,
        type: 'one-stat',
        value: '0,000',
        label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        eyebrow: 'Firstname Lastname',
        body: 'Suspendisse potenti. Pellentesque imperdiet at odio tincidunt vehicula. Donec vel felis erat. Praesent iaculis malesuada neque at mattis.',
      }
    case 'footer':
      return {
        id,
        type: 'footer',
        stat1Value: '20+',
        stat1Label: 'Awards',
        stat2Value: '350+',
        stat2Label: 'Experts',
        stat3Value: '100%',
        stat3Label: 'Deployment',
        stat4Value: '2M+',
        stat4Label: 'End Users',
        stat5Value: '1.2K',
        stat5Label: 'Clients',
      }
  }
}

// Get module preview text for collapsed state
function getModulePreview(module: StackerModule): string {
  switch (module.type) {
    case 'logo-chip':
      return module.showChips ? `${module.activeCategories.length} categories` : 'Logo only'
    case 'header':
      return module.heading || 'Untitled'
    case 'paragraph':
      return module.intro?.substring(0, 40) || module.body?.substring(0, 40) || 'Empty paragraph'
    case 'bullet-three':
      return module.heading || `${module.columns[0].bullets.length} bullets per column`
    case 'image':
      return `Image ${module.imagePosition} · ${module.imageUrl ? 'Uploaded' : 'No image'}`
    case 'image-16x9':
      return `Image 16:9 ${module.imagePosition} · ${module.imageUrl ? 'Uploaded' : 'No image'}`
    case 'divider':
      return 'Horizontal divider'
    case 'three-card':
      return module.cards[0]?.title || '3 Cards'
    case 'quote':
      return module.quote.substring(0, 40) || 'Quote'
    case 'three-stats':
      return module.stats.map(s => s.value).join(' · ')
    case 'one-stat':
      return `${module.value} · ${module.eyebrow || 'One stat'}`
    case 'footer':
      return 'Cority boilerplate'
    default:
      return 'Module'
  }
}

// Locked Module Item Component (no drag, no delete)
function LockedModuleItem({
  module,
  isExpanded,
  isSelected,
  onToggleExpand,
  onUpdate,
  onOpenCropModal,
}: {
  module: StackerModule
  isExpanded: boolean
  isSelected: boolean
  onToggleExpand: () => void
  onUpdate: (updates: Partial<StackerModule>) => void
  onOpenCropModal?: (moduleId: string) => void
}) {
  return (
    <div
      data-module-id={module.id}
      className={`bg-white dark:bg-[#1a1a2e] border rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-transparent'
      }`}
    >
      {/* Collapsed Header - Always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252540] transition-colors"
        onClick={onToggleExpand}
      >
        {/* Lock Icon */}
        <div className="p-1 text-gray-300 dark:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Module Type Label */}
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {MODULE_LABELS[module.type] || module.type}
        </span>

        {/* Expand/Collapse Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700/50">
          <ModuleEditor module={module} onUpdate={onUpdate} onOpenCropModal={onOpenCropModal} />
        </div>
      )}
    </div>
  )
}

// Sortable Content Module Item Component (with drag handle)
function SortableModuleItem({
  module,
  isExpanded,
  isSelected,
  onToggleExpand,
  onUpdate,
  onOpenCropModal,
}: {
  module: StackerModule
  isExpanded: boolean
  isSelected: boolean
  onToggleExpand: () => void
  onUpdate: (updates: Partial<StackerModule>) => void
  onOpenCropModal?: (moduleId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-module-id={module.id}
      className={`bg-white dark:bg-[#1a1a2e] border rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-transparent'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Collapsed Header - Always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252540] transition-colors"
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Module Type Label */}
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {MODULE_LABELS[module.type] || module.type}
        </span>

        {/* Expand/Collapse Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700/50">
          <ModuleEditor module={module} onUpdate={onUpdate} onOpenCropModal={onOpenCropModal} />
        </div>
      )}
    </div>
  )
}

// Module-specific editor content
function ModuleEditor({
  module,
  onUpdate,
  onOpenCropModal,
}: {
  module: StackerModule
  onUpdate: (updates: Partial<StackerModule>) => void
  onOpenCropModal?: (moduleId: string) => void
}) {
  const categoryOptions: SolutionCategory[] = ['environmental', 'health', 'safety', 'quality', 'sustainability']

  switch (module.type) {
    case 'logo-chip':
      return (
        <div className="space-y-3">
          {/* Show Chips Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Category Chips</label>
            <button
              onClick={() => onUpdate({ showChips: !module.showChips })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showChips ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showChips ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Category Toggles */}
          {module.showChips && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-2">Active Categories</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => {
                  const isActive = module.activeCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        const newCategories = isActive
                          ? module.activeCategories.filter(c => c !== cat)
                          : [...module.activeCategories, cat]
                        onUpdate({ activeCategories: newCategories as SolutionCategory[] })
                      }}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )

    case 'header':
      return (
        <div className="space-y-3">
          {/* Heading */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Heading</label>
            <textarea
              value={module.heading}
              onChange={(e) => onUpdate({ heading: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
              rows={2}
              placeholder="Enter heading"
            />
          </div>

          {/* Heading Size */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Heading Size</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ headingSize: 'h1' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.headingSize === 'h1'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                H1 (36pt)
              </button>
              <button
                onClick={() => onUpdate({ headingSize: 'h2' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.headingSize === 'h2'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                H2 (30pt)
              </button>
            </div>
          </div>

          {/* Subheader Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Subheader</label>
            <button
              onClick={() => onUpdate({ showSubheader: !module.showSubheader })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showSubheader ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showSubheader ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Subheader Text */}
          {module.showSubheader && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Subheader</label>
              <textarea
                value={module.subheader}
                onChange={(e) => onUpdate({ subheader: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
                placeholder="Enter subheader"
              />
            </div>
          )}

          {/* CTA Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show CTA</label>
            <button
              onClick={() => onUpdate({ showCta: !module.showCta })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showCta ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showCta ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* CTA Fields */}
          {module.showCta && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">CTA Text</label>
                <input
                  type="text"
                  value={module.cta}
                  onChange={(e) => onUpdate({ cta: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Enter CTA text"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">CTA URL</label>
                <input
                  type="text"
                  value={module.ctaUrl}
                  onChange={(e) => onUpdate({ ctaUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>
      )

    case 'paragraph':
      return (
        <div className="space-y-3">
          {/* Show Intro Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Intro</label>
            <button
              onClick={() => onUpdate({ showIntro: !module.showIntro })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showIntro ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showIntro ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Intro Text */}
          {module.showIntro && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Intro (18pt)</label>
              <textarea
                value={module.intro}
                onChange={(e) => onUpdate({ intro: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
                placeholder="Enter intro text"
              />
            </div>
          )}

          {/* Show Body Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Body</label>
            <button
              onClick={() => onUpdate({ showBody: !module.showBody })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showBody ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showBody ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Body Text */}
          {module.showBody && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Body (12pt)</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={4}
                placeholder="Enter body text"
              />
            </div>
          )}
        </div>
      )

    case 'divider':
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
          No settings for divider
        </div>
      )

    case 'bullet-three':
      return (
        <div className="space-y-4">
          {/* Heading */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Heading</label>
            <input
              type="text"
              value={module.heading}
              onChange={(e) => onUpdate({ heading: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Enter heading"
            />
          </div>

          {/* Columns */}
          {module.columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Column {colIndex + 1}
              </div>

              {/* Column Label */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Label</label>
                <input
                  type="text"
                  value={column.label}
                  onChange={(e) => {
                    const newColumns = [...module.columns] as typeof module.columns
                    newColumns[colIndex] = { ...column, label: e.target.value }
                    onUpdate({ columns: newColumns })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Column label"
                />
              </div>

              {/* Bullets */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">
                  Bullets ({column.bullets.length})
                </label>
                <div className="space-y-1.5">
                  {column.bullets.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-1.5">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const newColumns = [...module.columns] as typeof module.columns
                          const newBullets = [...column.bullets]
                          newBullets[bulletIndex] = e.target.value
                          newColumns[colIndex] = { ...column, bullets: newBullets }
                          onUpdate({ columns: newColumns })
                        }}
                        className="flex-1 px-2 py-1.5 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                        placeholder={`Bullet ${bulletIndex + 1}`}
                      />
                      {column.bullets.length > 1 && (
                        <button
                          onClick={() => {
                            const newColumns = [...module.columns] as typeof module.columns
                            const newBullets = column.bullets.filter((_, i) => i !== bulletIndex)
                            newColumns[colIndex] = { ...column, bullets: newBullets }
                            onUpdate({ columns: newColumns })
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove bullet"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {column.bullets.length < 6 && (
                  <button
                    onClick={() => {
                      const newColumns = [...module.columns] as typeof module.columns
                      const newBullets = [...column.bullets, '']
                      newColumns[colIndex] = { ...column, bullets: newBullets }
                      onUpdate({ columns: newColumns })
                    }}
                    className="mt-2 px-2 py-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    + Add bullet
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )

    case 'image':
      return (
        <div className="space-y-3">
          {/* Image Position Toggle */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Image Position</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ imagePosition: 'left' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'left'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => onUpdate({ imagePosition: 'right' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'right'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Right
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Image</label>
            {module.imageUrl ? (
              <div className="relative">
                {/* Image preview - click to adjust */}
                <div
                  onClick={() => onOpenCropModal?.(module.id)}
                  className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors"
                  style={{ width: '100%', height: 120 }}
                >
                  <img
                    src={module.imageUrl}
                    alt="Selected image"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${50 - module.imagePan.x}% ${50 - module.imagePan.y}%`,
                      transform: module.imageZoom !== 1 ? `scale(${module.imageZoom})` : undefined,
                    }}
                  />
                </div>
                {/* Adjust button */}
                <button
                  onClick={() => onOpenCropModal?.(module.id)}
                  className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                >
                  Adjust
                </button>
                {/* Remove button */}
                <button
                  onClick={() => {
                    onUpdate({
                      imageUrl: null,
                      imageZoom: 1,
                      imagePan: { x: 0, y: 0 },
                    })
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                  title="Remove image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg h-20 transition-colors border-gray-300 dark:border-gray-600 hover:border-gray-400"
              >
                <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = () => onUpdate({ imageUrl: reader.result as string })
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Drop or click to upload
                </label>
              </div>
            )}
          </div>

          {/* Grayscale Toggle - only show when image is uploaded */}
          {module.imageUrl && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500 dark:text-gray-500">Grayscale</label>
              <button
                onClick={() => onUpdate({ grayscale: !module.grayscale })}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  module.grayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    module.grayscale ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>
          )}

          {/* Show Eyebrow Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Eyebrow</label>
            <button
              onClick={() => onUpdate({ showEyebrow: !module.showEyebrow })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showEyebrow ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showEyebrow ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Eyebrow Text */}
          {module.showEyebrow && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Eyebrow</label>
              <input
                type="text"
                value={module.eyebrow}
                onChange={(e) => onUpdate({ eyebrow: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                placeholder="Enter eyebrow"
              />
            </div>
          )}

          {/* Show Heading Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Heading</label>
            <button
              onClick={() => onUpdate({ showHeading: !module.showHeading })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showHeading ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showHeading ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Heading Text */}
          {module.showHeading && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Heading</label>
              <textarea
                value={module.heading}
                onChange={(e) => onUpdate({ heading: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
                placeholder="Enter heading"
              />
            </div>
          )}

          {/* Show Body Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Body</label>
            <button
              onClick={() => onUpdate({ showBody: !module.showBody })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showBody ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showBody ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Body Text */}
          {module.showBody && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Body</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={3}
                placeholder="Enter body text"
              />
            </div>
          )}

          {/* Show CTA Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show CTA</label>
            <button
              onClick={() => onUpdate({ showCta: !module.showCta })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showCta ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showCta ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* CTA Fields */}
          {module.showCta && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">CTA Text</label>
                <input
                  type="text"
                  value={module.cta}
                  onChange={(e) => onUpdate({ cta: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Enter CTA text"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">CTA URL</label>
                <input
                  type="text"
                  value={module.ctaUrl}
                  onChange={(e) => onUpdate({ ctaUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>
      )

    case 'image-16x9':
      return (
        <div className="space-y-3">
          {/* Image Position Toggle */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Image Position</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ imagePosition: 'left' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'left'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => onUpdate({ imagePosition: 'right' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'right'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Right
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Image (16:9)</label>
            {module.imageUrl ? (
              <div className="relative">
                {/* Image preview - click to adjust */}
                <div
                  onClick={() => onOpenCropModal?.(module.id)}
                  className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors"
                  style={{ width: '100%', height: 80 }}
                >
                  <img
                    src={module.imageUrl}
                    alt="Selected image"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${50 - module.imagePan.x}% ${50 - module.imagePan.y}%`,
                      transform: module.imageZoom !== 1 ? `scale(${module.imageZoom})` : undefined,
                    }}
                  />
                </div>
                {/* Adjust button */}
                <button
                  onClick={() => onOpenCropModal?.(module.id)}
                  className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                >
                  Adjust
                </button>
                {/* Remove button */}
                <button
                  onClick={() => {
                    onUpdate({
                      imageUrl: null,
                      imageZoom: 1,
                      imagePan: { x: 0, y: 0 },
                    })
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                  title="Remove image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-gray-600 hover:border-gray-400"
              >
                <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = () => onUpdate({ imageUrl: reader.result as string })
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Drop or click to upload
                </label>
              </div>
            )}
          </div>

          {/* Grayscale Toggle - only show when image is uploaded */}
          {module.imageUrl && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500 dark:text-gray-500">Grayscale</label>
              <button
                onClick={() => onUpdate({ grayscale: !module.grayscale })}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  module.grayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    module.grayscale ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>
          )}

          {/* Show Eyebrow Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Eyebrow</label>
            <button
              onClick={() => onUpdate({ showEyebrow: !module.showEyebrow })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showEyebrow ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showEyebrow ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Eyebrow Text */}
          {module.showEyebrow && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Eyebrow</label>
              <input
                type="text"
                value={module.eyebrow}
                onChange={(e) => onUpdate({ eyebrow: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                placeholder="Enter eyebrow"
              />
            </div>
          )}

          {/* Show Heading Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Heading</label>
            <button
              onClick={() => onUpdate({ showHeading: !module.showHeading })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showHeading ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showHeading ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Heading Text */}
          {module.showHeading && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Heading</label>
              <textarea
                value={module.heading}
                onChange={(e) => onUpdate({ heading: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
                placeholder="Enter heading"
              />
            </div>
          )}

          {/* Show Body Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-gray-500">Show Body</label>
            <button
              onClick={() => onUpdate({ showBody: !module.showBody })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showBody ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showBody ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Body Text */}
          {module.showBody && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Body</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={3}
                placeholder="Enter body text"
              />
            </div>
          )}
        </div>
      )

    case 'three-card':
      return (
        <div className="space-y-4">
          {module.cards.map((card, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Card {index + 1}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Icon</label>
                <input
                  type="text"
                  value={card.icon}
                  onChange={(e) => {
                    const newCards = [...module.cards] as [typeof card, typeof card, typeof card]
                    newCards[index] = { ...card, icon: e.target.value }
                    onUpdate({ cards: newCards })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., zap, shield-check, clock"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Title</label>
                <textarea
                  value={card.title}
                  onChange={(e) => {
                    const newCards = [...module.cards] as [typeof card, typeof card, typeof card]
                    newCards[index] = { ...card, title: e.target.value }
                    onUpdate({ cards: newCards })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                  rows={2}
                  placeholder="Enter card title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Description</label>
                <textarea
                  value={card.description}
                  onChange={(e) => {
                    const newCards = [...module.cards] as [typeof card, typeof card, typeof card]
                    newCards[index] = { ...card, description: e.target.value }
                    onUpdate({ cards: newCards })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                  rows={3}
                  placeholder="Enter card description"
                />
              </div>
            </div>
          ))}
        </div>
      )

    case 'quote':
      return (
        <div className="space-y-3">
          {/* Quote Text */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Quote</label>
            <textarea
              value={module.quote}
              onChange={(e) => onUpdate({ quote: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none italic"
              rows={4}
              placeholder="Enter quote text"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={module.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Firstname Lastname"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Job Title</label>
            <input
              type="text"
              value={module.jobTitle}
              onChange={(e) => onUpdate({ jobTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Job Title"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Organization</label>
            <input
              type="text"
              value={module.organization}
              onChange={(e) => onUpdate({ organization: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              placeholder="Organization Name"
            />
          </div>
        </div>
      )

    case 'three-stats':
      return (
        <div className="space-y-4">
          {module.stats.map((stat, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Stat {index + 1}
              </div>

              {/* Value */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Value</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => {
                    const newStats = [...module.stats] as [typeof stat, typeof stat, typeof stat]
                    newStats[index] = { ...stat, value: e.target.value }
                    onUpdate({ stats: newStats })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="0,000"
                />
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Label</label>
                <textarea
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...module.stats] as [typeof stat, typeof stat, typeof stat]
                    newStats[index] = { ...stat, label: e.target.value }
                    onUpdate({ stats: newStats })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                  rows={2}
                  placeholder="Stat description"
                />
              </div>
            </div>
          ))}
        </div>
      )

    case 'one-stat':
      return (
        <div className="space-y-3">
          {/* Stat Section */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Stat
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Value</label>
              <input
                type="text"
                value={module.value}
                onChange={(e) => onUpdate({ value: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                placeholder="0,000"
              />
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Label</label>
              <textarea
                value={module.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
                placeholder="Stat description"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Description
            </div>

            {/* Eyebrow */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Eyebrow</label>
              <input
                type="text"
                value={module.eyebrow}
                onChange={(e) => onUpdate({ eyebrow: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                placeholder="Firstname Lastname"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Body</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
                rows={3}
                placeholder="Description text"
              />
            </div>
          </div>
        </div>
      )

    case 'footer':
      return (
        <div className="space-y-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Logo and about paragraph are locked. Stats are editable.
          </div>

          {/* Stats Grid - matching the 3x2 layout */}
          {[
            { num: 1, valueKey: 'stat1Value', labelKey: 'stat1Label', value: module.stat1Value, label: module.stat1Label },
            { num: 2, valueKey: 'stat2Value', labelKey: 'stat2Label', value: module.stat2Value, label: module.stat2Label },
            { num: 3, valueKey: 'stat3Value', labelKey: 'stat3Label', value: module.stat3Value, label: module.stat3Label },
            { num: 4, valueKey: 'stat4Value', labelKey: 'stat4Label', value: module.stat4Value, label: module.stat4Label },
            { num: 5, valueKey: 'stat5Value', labelKey: 'stat5Label', value: module.stat5Value, label: module.stat5Label },
          ].map((stat) => (
            <div key={stat.num} className="flex gap-2">
              <div className="w-20">
                <label className="block text-[10px] text-gray-500 dark:text-gray-500 mb-1">Stat {stat.num}</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => onUpdate({ [stat.valueKey]: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Value"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 dark:text-gray-500 mb-1">Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => onUpdate({ [stat.labelKey]: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-gray-100 dark:bg-[#0d0d1a] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="Label"
                />
              </div>
            </div>
          ))}
        </div>
      )

    default:
      // All module types are handled above, so this case should never be reached
      return null
  }
}


export function StackerEditorScreen() {
  const { setCurrentScreen } = useStore()

  // Locked modules (always present, not deletable, not draggable)
  const [logoChipModule, setLogoChipModule] = useState<StackerModule>(() => createDefaultModule('logo-chip'))
  const [headerModule, setHeaderModule] = useState<StackerModule>(() => createDefaultModule('header'))
  const [footerModule, setFooterModule] = useState<StackerModule>(() => createDefaultModule('footer'))

  // Content modules (draggable in preview, deletable)
  const [contentModules, setContentModules] = useState<StackerModule[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [previewZoom, setPreviewZoom] = useState(100)

  // Selected module for preview-sidebar sync
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  // Resizable editor panel
  const [editorWidth, setEditorWidth] = useState(380)
  const isResizing = useRef(false)

  // Handle resize drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = Math.min(Math.max(280, e.clientX - 24), 600) // min 280, max 600
      setEditorWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const startResizing = useCallback(() => {
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  // Image crop modal state
  const [cropModalModuleId, setCropModalModuleId] = useState<string | null>(null)

  // Get the image module being edited in crop modal
  const cropModalModule = cropModalModuleId
    ? contentModules.find(m => m.id === cropModalModuleId && (m.type === 'image' || m.type === 'image-16x9')) as (StackerImageModule | StackerImage16x9Module) | undefined
    : undefined

  // Combined modules for preview (logo-chip + header + content + footer)
  const allModules = [logoChipModule, headerModule, ...contentModules, footerModule]

  // Toggle module expansion (accordion behavior - only one at a time)
  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => {
      // If already expanded, collapse it
      if (prev.has(moduleId)) {
        return new Set()
      }
      // Otherwise, collapse all and expand only this one
      return new Set([moduleId])
    })
  }

  // Handle module selection from preview (expands and scrolls to sidebar item)
  const handleSelectModule = useCallback((moduleId: string) => {
    setSelectedModuleId(moduleId)
    // Auto-expand the module in sidebar (accordion - only this one)
    setExpandedModules(new Set([moduleId]))
    // Scroll sidebar to the module
    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-module-id="${moduleId}"]`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [])

  // Handle modules reorder from preview
  const handleModulesChange = useCallback((newModules: StackerModule[]) => {
    // Extract content modules (exclude locked)
    const lockedTypes = ['logo-chip', 'header', 'footer']
    const newContentModules = newModules.filter(m => !lockedTypes.includes(m.type))
    setContentModules(newContentModules)
  }, [])

  // Sidebar drag-and-drop sensors
  const sidebarSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle sidebar drag end (reorder content modules)
  const handleSidebarDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setContentModules(prev => {
        const oldIndex = prev.findIndex(m => m.id === active.id)
        const newIndex = prev.findIndex(m => m.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }, [])

  // Add content module
  const addModule = useCallback((type: StackerModule['type']) => {
    const newModule = createDefaultModule(type)
    setContentModules(prev => [...prev, newModule])
    // Auto-expand the new module (accordion - only this one)
    setExpandedModules(new Set([newModule.id]))
  }, [])

  // Update any module (locked or content)
  const updateModule = useCallback((moduleId: string, updates: Partial<StackerModule>) => {
    // Check if it's a locked module
    if (logoChipModule.id === moduleId) {
      setLogoChipModule(prev => ({ ...prev, ...updates } as StackerModule))
      return
    }
    if (headerModule.id === moduleId) {
      setHeaderModule(prev => ({ ...prev, ...updates } as StackerModule))
      return
    }
    if (footerModule.id === moduleId) {
      setFooterModule(prev => ({ ...prev, ...updates } as StackerModule))
      return
    }
    // Otherwise update content modules
    setContentModules(prev => prev.map(mod =>
      mod.id === moduleId ? { ...mod, ...updates } as StackerModule : mod
    ))
  }, [logoChipModule.id, headerModule.id, footerModule.id])

  // Delete content module
  const deleteModule = useCallback((moduleId: string) => {
    setContentModules(prev => prev.filter(mod => mod.id !== moduleId))
    // Clear selection if deleted module was selected
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null)
    }
  }, [selectedModuleId])

  return (
    <div className="space-y-6">
      {/* Header with title */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <div className="px-4 py-2.5 text-sm font-medium border-t border-l border-r rounded-t-lg -mb-px border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            Stacker Document
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex h-[calc(100vh-180px)]">
        {/* Left: Module List */}
        <div className="flex-shrink-0 flex flex-col" style={{ width: editorWidth }}>
          <div className="bg-gray-100 dark:bg-[#0d0d1a] rounded-xl p-4 flex-1 flex flex-col overflow-hidden">
            {/* Module Count */}
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
              {allModules.length} module{allModules.length !== 1 ? 's' : ''} (3 locked)
            </div>

            {/* Module List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {/* Locked: Logo & Chips */}
              <LockedModuleItem
                module={logoChipModule}
                isExpanded={expandedModules.has(logoChipModule.id)}
                isSelected={selectedModuleId === logoChipModule.id}
                onToggleExpand={() => toggleModuleExpand(logoChipModule.id)}
                onUpdate={(updates) => updateModule(logoChipModule.id, updates)}
              />

              {/* Locked: Header */}
              <LockedModuleItem
                module={headerModule}
                isExpanded={expandedModules.has(headerModule.id)}
                isSelected={selectedModuleId === headerModule.id}
                onToggleExpand={() => toggleModuleExpand(headerModule.id)}
                onUpdate={(updates) => updateModule(headerModule.id, updates)}
              />

              {/* Content Modules (draggable in sidebar + preview) */}
              <DndContext
                sensors={sidebarSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSidebarDragEnd}
              >
                <SortableContext
                  items={contentModules.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {contentModules.map((module) => (
                    <SortableModuleItem
                      key={module.id}
                      module={module}
                      isExpanded={expandedModules.has(module.id)}
                      isSelected={selectedModuleId === module.id}
                      onToggleExpand={() => toggleModuleExpand(module.id)}
                      onUpdate={(updates) => updateModule(module.id, updates)}
                      onOpenCropModal={setCropModalModuleId}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Locked: Footer */}
              <LockedModuleItem
                module={footerModule}
                isExpanded={expandedModules.has(footerModule.id)}
                isSelected={selectedModuleId === footerModule.id}
                onToggleExpand={() => toggleModuleExpand(footerModule.id)}
                onUpdate={(updates) => updateModule(footerModule.id, updates)}
              />
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={startResizing}
          className="w-2 flex-shrink-0 cursor-col-resize group flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400 rounded-full transition-colors" />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col overflow-hidden pl-4">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Export Button (placeholder) */}
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                Export PDF
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 ml-1" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => setPreviewZoom(Math.max(50, previewZoom - 25))}
                  disabled={previewZoom <= 50}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <select
                  value={previewZoom}
                  onChange={(e) => setPreviewZoom(Number(e.target.value))}
                  className="h-7 px-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border-y border-gray-300 dark:border-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value={150}>150%</option>
                  <option value={125}>125%</option>
                  <option value={100}>100%</option>
                  <option value={75}>75%</option>
                  <option value={50}>50%</option>
                </select>
                <button
                  onClick={() => setPreviewZoom(Math.min(150, previewZoom + 25))}
                  disabled={previewZoom >= 150}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600 rounded-r bg-white dark:bg-gray-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Back to Home */}
            <button
              onClick={() => setCurrentScreen('select')}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ← Back to Templates
            </button>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 dark:bg-transparent rounded-xl p-6 overflow-auto">
            <div className="flex justify-center">
              <StackerPreviewEditor
                modules={allModules}
                selectedModuleId={selectedModuleId}
                onModulesChange={handleModulesChange}
                onSelectModule={handleSelectModule}
                onDeleteModule={deleteModule}
                onAddModule={addModule}
                previewZoom={previewZoom}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {cropModalModule && cropModalModule.imageUrl && (
        <ImageCropModal
          isOpen={!!cropModalModuleId}
          onClose={() => setCropModalModuleId(null)}
          imageSrc={cropModalModule.imageUrl}
          frameWidth={cropModalModule.type === 'image-16x9' ? 180 : 180}
          frameHeight={cropModalModule.type === 'image-16x9' ? 100 : 180}
          initialPosition={cropModalModule.imagePan}
          initialZoom={cropModalModule.imageZoom}
          onSave={(position, zoom) => {
            updateModule(cropModalModule.id, {
              imagePan: position,
              imageZoom: zoom,
            })
            setCropModalModuleId(null)
          }}
        />
      )}
    </div>
  )
}

export default StackerEditorScreen
