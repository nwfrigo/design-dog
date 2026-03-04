'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { StackerPreviewEditor } from './StackerPreviewEditor'
import { ImageCropModal } from './ImageCropModal'
import { ImageLibraryModal } from './ImageLibraryModal'
import { IconPicker } from './IconPickerModal'
import type { StackerModule, StackerImageModule, StackerImage16x9Module, StackerImageCardsModule, SolutionCategory, StackerLogoChipModule, StackerHeaderModule, StackerFooterModule } from '@/types'
import { STACKER_PLACEHOLDER_IMAGE_1x1, STACKER_PLACEHOLDER_IMAGE_16x9 } from '@/lib/stacker-modules'
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

// Delete Confirmation Modal
function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  itemType,
  itemLabel,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  itemType: string
  itemLabel?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-surface-secondary rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-content-primary mb-2">
          Delete {itemType}{itemLabel ? ` ${itemLabel}` : ''}?
        </h3>
        <p className="text-sm text-gray-600 dark:text-content-secondary mb-6">
          This action cannot be undone. Are you sure you want to delete this {itemType.toLowerCase()}?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-content-secondary bg-gray-100 dark:bg-surface-tertiary rounded-lg hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9)

// Module type labels
const MODULE_LABELS: Record<string, string> = {
  'logo-chip': 'Logo & Chips',
  'header': 'Header',
  'paragraph': 'Paragraph',
  'bullet-three': '3 Bullets',
  'image': 'Image - Tall',
  'image-16x9': 'Image - Short',
  'divider': 'Divider',
  'three-card': 'Simple Cards',
  'image-cards': 'Image Cards',
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
        imageSize: 'S',
        imageUrl: STACKER_PLACEHOLDER_IMAGE_1x1,
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
        imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9,
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
    case 'image-cards':
      return {
        id,
        type: 'image-cards',
        heading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        showHeading: true,
        cards: [
          {
            imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9,
            imagePan: { x: 0, y: 0 },
            imageZoom: 1,
            eyebrow: 'Lorem ipsum dolor',
            showEyebrow: true,
            title: 'Lorem ipsum dolor sit',
            body: 'Suspendisse potenti. Pellentesque imperdiet at odio tincidunt vehicula. Donec vel felis erat. Praesent iaculis malesuada neque at mattis.',
          },
          {
            imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9,
            imagePan: { x: 0, y: 0 },
            imageZoom: 1,
            eyebrow: 'Lorem ipsum dolor',
            showEyebrow: true,
            title: 'Lorem ipsum dolor sit',
            body: 'Suspendisse potenti. Pellentesque imperdiet at odio tincidunt vehicula. Donec vel felis erat. Praesent iaculis malesuada neque at mattis.',
          },
          {
            imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9,
            imagePan: { x: 0, y: 0 },
            imageZoom: 1,
            eyebrow: 'Lorem ipsum dolor',
            showEyebrow: true,
            title: 'Lorem ipsum dolor sit',
            body: 'Suspendisse potenti. Pellentesque imperdiet at odio tincidunt vehicula. Donec vel felis erat. Praesent iaculis malesuada neque at mattis.',
          },
        ],
        showCard3: true,
        grayscale: false,
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
        showStat3: true,
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
      return `Image Short ${module.imagePosition} · ${module.imageUrl ? 'Uploaded' : 'No image'}`
    case 'divider':
      return 'Horizontal divider'
    case 'three-card':
      return module.cards[0]?.title || '3 Cards'
    case 'image-cards':
      return `${module.showCard3 ? '3' : '2'} Image Cards`
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
  onOpenLibrary,
}: {
  module: StackerModule
  isExpanded: boolean
  isSelected: boolean
  onToggleExpand: () => void
  onUpdate: (updates: Partial<StackerModule>) => void
  onOpenCropModal?: (moduleId: string, cardIndex?: number) => void
  onOpenLibrary?: (moduleId: string, cardIndex?: number) => void
}) {
  return (
    <div
      data-module-id={module.id}
      className={`bg-white dark:bg-surface-secondary border rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-transparent'
      }`}
    >
      {/* Collapsed Header - Always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-interactive-hover transition-colors"
        onClick={onToggleExpand}
      >
        {/* Lock Icon */}
        <div className="p-1 text-gray-300 dark:text-content-tertiary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Module Type Label */}
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-content-secondary uppercase tracking-wide">
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
        <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-line-subtle/50">
          <ModuleEditor module={module} onUpdate={onUpdate} onOpenCropModal={onOpenCropModal} onOpenLibrary={onOpenLibrary} />
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
  onOpenLibrary,
}: {
  module: StackerModule
  isExpanded: boolean
  isSelected: boolean
  onToggleExpand: () => void
  onUpdate: (updates: Partial<StackerModule>) => void
  onOpenCropModal?: (moduleId: string, cardIndex?: number) => void
  onOpenLibrary?: (moduleId: string, cardIndex?: number) => void
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
      className={`bg-white dark:bg-surface-secondary border rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-transparent'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Collapsed Header - Always visible */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-interactive-hover transition-colors"
        onClick={onToggleExpand}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-primary cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Module Type Label */}
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-content-secondary uppercase tracking-wide">
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
        <div className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-line-subtle/50">
          <ModuleEditor module={module} onUpdate={onUpdate} onOpenCropModal={onOpenCropModal} onOpenLibrary={onOpenLibrary} />
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
  onOpenLibrary,
}: {
  module: StackerModule
  onUpdate: (updates: Partial<StackerModule>) => void
  onOpenCropModal?: (moduleId: string, cardIndex?: number) => void
  onOpenLibrary?: (moduleId: string, cardIndex?: number) => void
}) {
  const categoryOptions: SolutionCategory[] = ['environmental', 'health', 'safety', 'quality', 'sustainability']

  switch (module.type) {
    case 'logo-chip':
      return (
        <div className="space-y-3">
          {/* Show Chips Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Category Chips</label>
            <button
              onClick={() => onUpdate({ showChips: !module.showChips })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showChips ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-2">Active Categories</label>
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
                          : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
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
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Heading</label>
            <textarea
              value={module.heading}
              onChange={(e) => onUpdate({ heading: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
              rows={2}
              placeholder="Enter heading"
            />
          </div>

          {/* Heading Size */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Heading Size</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ headingSize: 'h1' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.headingSize === 'h1'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                }`}
              >
                Large
              </button>
              <button
                onClick={() => onUpdate({ headingSize: 'h2' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.headingSize === 'h2'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => onUpdate({ headingSize: 'h3' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.headingSize === 'h3'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                }`}
              >
                Small
              </button>
            </div>
          </div>

          {/* Subheader Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Subheader</label>
            <button
              onClick={() => onUpdate({ showSubheader: !module.showSubheader })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showSubheader ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Subheader</label>
              <textarea
                value={module.subheader}
                onChange={(e) => onUpdate({ subheader: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={2}
                placeholder="Enter subheader"
              />
            </div>
          )}

          {/* CTA Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show CTA</label>
            <button
              onClick={() => onUpdate({ showCta: !module.showCta })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showCta ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">CTA Text</label>
                <input
                  type="text"
                  value={module.cta}
                  onChange={(e) => onUpdate({ cta: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                  placeholder="Enter CTA text"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">CTA URL</label>
                <input
                  type="text"
                  value={module.ctaUrl}
                  onChange={(e) => onUpdate({ ctaUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
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
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Intro</label>
            <button
              onClick={() => onUpdate({ showIntro: !module.showIntro })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showIntro ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Intro (18pt)</label>
              <textarea
                value={module.intro}
                onChange={(e) => onUpdate({ intro: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={2}
                placeholder="Enter intro text"
              />
            </div>
          )}

          {/* Show Body Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Body</label>
            <button
              onClick={() => onUpdate({ showBody: !module.showBody })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showBody ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Body (12pt)</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={4}
                placeholder="Enter body text"
              />
            </div>
          )}
        </div>
      )

    case 'divider':
      return (
        <div className="text-sm text-gray-500 dark:text-content-secondary py-2 text-center">
          No settings for divider
        </div>
      )

    case 'bullet-three':
      return (
        <div className="space-y-4">
          {/* Heading */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Heading</label>
            <input
              type="text"
              value={module.heading}
              onChange={(e) => onUpdate({ heading: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
              placeholder="Enter heading"
            />
          </div>

          {/* Columns */}
          {module.columns.map((column, colIndex) => (
            <div key={colIndex} className="space-y-2 p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-content-secondary mb-2">
                Column {colIndex + 1}
              </div>

              {/* Column Label */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Label</label>
                <input
                  type="text"
                  value={column.label}
                  onChange={(e) => {
                    const newColumns = [...module.columns] as typeof module.columns
                    newColumns[colIndex] = { ...column, label: e.target.value }
                    onUpdate({ columns: newColumns })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                  placeholder="Column label"
                />
              </div>

              {/* Bullets */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">
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
                        className="flex-1 px-2 py-1.5 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
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
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Image Position</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ imagePosition: 'left' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'left'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => onUpdate({ imagePosition: 'right' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'right'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                }`}
              >
                Right
              </button>
            </div>
          </div>

          {/* Image Size Picker */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Image Size</label>
            <div className="flex gap-2">
              {(['S', 'M', 'L'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdate({ imageSize: size })}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    (module.imageSize || 'S') === size
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                  }`}
                >
                  {size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Image</label>
            {module.imageUrl ? (
              <div className="relative">
                {/* Image preview - click to adjust */}
                <div
                  onClick={() => onOpenCropModal?.(module.id)}
                  className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 dark:border-line-subtle hover:border-blue-400 transition-colors"
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
                {/* Adjust / Library buttons */}
                <div className="absolute bottom-1 left-1 flex gap-1 z-20">
                  <button
                    onClick={() => onOpenCropModal?.(module.id)}
                    className="px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors"
                  >
                    Adjust
                  </button>
                  <button
                    onClick={() => onOpenLibrary?.(module.id)}
                    className="px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors"
                  >
                    Library
                  </button>
                </div>
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
              <div className="flex gap-2">
                <div
                  className="flex-1 border-2 border-dashed rounded-lg h-20 transition-colors border-gray-300 dark:border-line-subtle hover:border-gray-400"
                >
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-content-secondary">
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
                    Upload
                  </label>
                </div>
                <button
                  onClick={() => onOpenLibrary?.(module.id)}
                  className="border-2 border-dashed rounded-lg h-20 px-3 transition-colors border-gray-300 dark:border-line-subtle hover:border-blue-400 hover:text-blue-500 flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Library
                </button>
              </div>
            )}
          </div>

          {/* Grayscale Toggle - only show when image is uploaded */}
          {module.imageUrl && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500 dark:text-content-secondary">Grayscale</label>
              <button
                onClick={() => onUpdate({ grayscale: !module.grayscale })}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  module.grayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Eyebrow</label>
            <button
              onClick={() => onUpdate({ showEyebrow: !module.showEyebrow })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showEyebrow ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Eyebrow</label>
              <input
                type="text"
                value={module.eyebrow}
                onChange={(e) => onUpdate({ eyebrow: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                placeholder="Enter eyebrow"
              />
            </div>
          )}

          {/* Show Heading Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Heading</label>
            <button
              onClick={() => onUpdate({ showHeading: !module.showHeading })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showHeading ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Heading</label>
              <textarea
                value={module.heading}
                onChange={(e) => onUpdate({ heading: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={2}
                placeholder="Enter heading"
              />
            </div>
          )}

          {/* Show Body Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Body</label>
            <button
              onClick={() => onUpdate({ showBody: !module.showBody })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showBody ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Body</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={3}
                placeholder="Enter body text"
              />
            </div>
          )}

          {/* Show CTA Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show CTA</label>
            <button
              onClick={() => onUpdate({ showCta: !module.showCta })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showCta ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">CTA Text</label>
                <input
                  type="text"
                  value={module.cta}
                  onChange={(e) => onUpdate({ cta: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                  placeholder="Enter CTA text"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">CTA URL</label>
                <input
                  type="text"
                  value={module.ctaUrl}
                  onChange={(e) => onUpdate({ ctaUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
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
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Image Position</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ imagePosition: 'left' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'left'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => onUpdate({ imagePosition: 'right' })}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  module.imagePosition === 'right'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-surface-tertiary text-gray-600 dark:text-content-secondary'
                }`}
              >
                Right
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Image (Short)</label>
            {module.imageUrl ? (
              <div className="relative">
                {/* Image preview - click to adjust */}
                <div
                  onClick={() => onOpenCropModal?.(module.id)}
                  className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 dark:border-line-subtle hover:border-blue-400 transition-colors"
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
                {/* Adjust / Library buttons */}
                <div className="absolute bottom-1 left-1 flex gap-1 z-20">
                  <button
                    onClick={() => onOpenCropModal?.(module.id)}
                    className="px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors"
                  >
                    Adjust
                  </button>
                  <button
                    onClick={() => onOpenLibrary?.(module.id)}
                    className="px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors"
                  >
                    Library
                  </button>
                </div>
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
              <div className="flex gap-2">
                <div
                  className="flex-1 border-2 border-dashed rounded-lg h-16 transition-colors border-gray-300 dark:border-line-subtle hover:border-gray-400"
                >
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-content-secondary">
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
                    Upload
                </label>
              </div>
                <button
                  onClick={() => onOpenLibrary?.(module.id)}
                  className="border-2 border-dashed rounded-lg h-16 px-3 transition-colors border-gray-300 dark:border-line-subtle hover:border-blue-400 hover:text-blue-500 flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
                >
                  <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Library
                </button>
              </div>
            )}
          </div>

          {/* Grayscale Toggle - only show when image is uploaded */}
          {module.imageUrl && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500 dark:text-content-secondary">Grayscale</label>
              <button
                onClick={() => onUpdate({ grayscale: !module.grayscale })}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  module.grayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Eyebrow</label>
            <button
              onClick={() => onUpdate({ showEyebrow: !module.showEyebrow })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showEyebrow ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Eyebrow</label>
              <input
                type="text"
                value={module.eyebrow}
                onChange={(e) => onUpdate({ eyebrow: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                placeholder="Enter eyebrow"
              />
            </div>
          )}

          {/* Show Heading Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Heading</label>
            <button
              onClick={() => onUpdate({ showHeading: !module.showHeading })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showHeading ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Heading</label>
              <textarea
                value={module.heading}
                onChange={(e) => onUpdate({ heading: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={2}
                placeholder="Enter heading"
              />
            </div>
          )}

          {/* Show Body Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Body</label>
            <button
              onClick={() => onUpdate({ showBody: !module.showBody })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showBody ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Body</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
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
            <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-content-secondary mb-2">
                Card {index + 1}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Icon</label>
                <div className="flex items-center gap-2">
                  <IconPicker
                    value={card.icon}
                    onChange={(iconName) => {
                      const newCards = [...module.cards] as [typeof card, typeof card, typeof card]
                      newCards[index] = { ...card, icon: iconName }
                      onUpdate({ cards: newCards })
                    }}
                  />
                  <input
                    type="text"
                    value={card.icon}
                    onChange={(e) => {
                      const newCards = [...module.cards] as [typeof card, typeof card, typeof card]
                      newCards[index] = { ...card, icon: e.target.value }
                      onUpdate({ cards: newCards })
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                    placeholder="e.g., zap, shield-check, clock"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Title</label>
                <textarea
                  value={card.title}
                  onChange={(e) => {
                    const newCards = [...module.cards] as [typeof card, typeof card, typeof card]
                    newCards[index] = { ...card, title: e.target.value }
                    onUpdate({ cards: newCards })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                  rows={2}
                  placeholder="Enter card title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Description</label>
                <textarea
                  value={card.description}
                  onChange={(e) => {
                    const newCards = [...module.cards] as [typeof card, typeof card, typeof card]
                    newCards[index] = { ...card, description: e.target.value }
                    onUpdate({ cards: newCards })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                  rows={3}
                  placeholder="Enter card description"
                />
              </div>
            </div>
          ))}
        </div>
      )

    case 'image-cards':
      return (
        <div className="space-y-4">
          {/* Show Heading Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Heading</label>
            <button
              onClick={() => onUpdate({ showHeading: !module.showHeading })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showHeading ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
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
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Heading</label>
              <textarea
                value={module.heading}
                onChange={(e) => onUpdate({ heading: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={2}
                placeholder="Enter heading"
              />
            </div>
          )}

          {/* Show Third Card Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Show Third Card</label>
            <button
              onClick={() => onUpdate({ showCard3: !module.showCard3 })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.showCard3 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.showCard3 ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Grayscale Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500 dark:text-content-secondary">Grayscale Images</label>
            <button
              onClick={() => onUpdate({ grayscale: !module.grayscale })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                module.grayscale ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  module.grayscale ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Cards */}
          {module.cards.slice(0, module.showCard3 ? 3 : 2).map((card, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-content-secondary mb-2">
                Card {index + 1}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Image</label>
                {card.imageUrl ? (
                  <div className="relative">
                    <div
                      onClick={() => onOpenCropModal?.(module.id, index)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 dark:border-line-subtle hover:border-blue-400 transition-colors"
                      style={{ width: '100%', height: 60 }}
                    >
                      <img
                        src={card.imageUrl}
                        alt={`Card ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${50 - (card.imagePan?.x ?? 0)}% ${50 - (card.imagePan?.y ?? 0)}%`,
                          transform: (card.imageZoom ?? 1) !== 1 ? `scale(${card.imageZoom})` : undefined,
                          filter: module.grayscale ? 'grayscale(100%)' : undefined,
                        }}
                      />
                    </div>
                    {/* Adjust / Library buttons */}
                    <div className="absolute bottom-1 left-1 flex gap-1 z-20">
                      <button
                        onClick={() => onOpenCropModal?.(module.id, index)}
                        className="px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => onOpenLibrary?.(module.id, index)}
                        className="px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors"
                      >
                        Library
                      </button>
                    </div>
                    {/* Remove button */}
                    <button
                      onClick={() => {
                        const newCards = [...module.cards] as typeof module.cards
                        newCards[index] = { ...card, imageUrl: null, imagePan: { x: 0, y: 0 }, imageZoom: 1 }
                        onUpdate({ cards: newCards })
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
                  <div className="flex gap-1.5">
                    <div className="flex-1 border-2 border-dashed rounded-lg h-12 transition-colors border-gray-300 dark:border-line-subtle hover:border-gray-400">
                      <label className="flex items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-content-secondary gap-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = () => {
                                const newCards = [...module.cards] as typeof module.cards
                                newCards[index] = { ...card, imageUrl: reader.result as string }
                                onUpdate({ cards: newCards })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="hidden"
                        />
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload
                      </label>
                    </div>
                    <button
                      onClick={() => onOpenLibrary?.(module.id, index)}
                      className="border-2 border-dashed rounded-lg h-12 px-2 transition-colors border-gray-300 dark:border-line-subtle hover:border-blue-400 hover:text-blue-500 flex items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
                      title="Choose from library"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Show Eyebrow Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 dark:text-content-secondary">Show Eyebrow</label>
                <button
                  onClick={() => {
                    const newCards = [...module.cards] as typeof module.cards
                    newCards[index] = { ...card, showEyebrow: !card.showEyebrow }
                    onUpdate({ cards: newCards })
                  }}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    card.showEyebrow ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      card.showEyebrow ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Eyebrow Text */}
              {card.showEyebrow && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Eyebrow</label>
                  <input
                    type="text"
                    value={card.eyebrow}
                    onChange={(e) => {
                      const newCards = [...module.cards] as typeof module.cards
                      newCards[index] = { ...card, eyebrow: e.target.value }
                      onUpdate({ cards: newCards })
                    }}
                    className="w-full px-2 py-1.5 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                    placeholder="Eyebrow text"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => {
                    const newCards = [...module.cards] as typeof module.cards
                    newCards[index] = { ...card, title: e.target.value }
                    onUpdate({ cards: newCards })
                  }}
                  className="w-full px-2 py-1.5 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                  placeholder="Card title"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Body</label>
                <textarea
                  value={card.body}
                  onChange={(e) => {
                    const newCards = [...module.cards] as typeof module.cards
                    newCards[index] = { ...card, body: e.target.value }
                    onUpdate({ cards: newCards })
                  }}
                  className="w-full px-2 py-1.5 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                  rows={2}
                  placeholder="Card body text"
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
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Quote</label>
            <textarea
              value={module.quote}
              onChange={(e) => onUpdate({ quote: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none italic"
              rows={4}
              placeholder="Enter quote text"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Name</label>
            <input
              type="text"
              value={module.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
              placeholder="Firstname Lastname"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Job Title</label>
            <input
              type="text"
              value={module.jobTitle}
              onChange={(e) => onUpdate({ jobTitle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
              placeholder="Job Title"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Organization</label>
            <input
              type="text"
              value={module.organization}
              onChange={(e) => onUpdate({ organization: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
              placeholder="Organization Name"
            />
          </div>
        </div>
      )

    case 'three-stats': {
      const visibleStats = module.showStat3 ? module.stats : module.stats.slice(0, 2)
      return (
        <div className="space-y-4">
          {/* Show 3rd Stat Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-line-subtle">
            <span className="text-xs text-gray-600 dark:text-content-secondary">Show 3rd Stat</span>
            <button
              onClick={() => onUpdate({ showStat3: !module.showStat3 })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                module.showStat3 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-surface-tertiary'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  module.showStat3 ? 'translate-x-[18px]' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {visibleStats.map((stat, index) => (
            <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg">
              <div className="text-xs font-medium text-gray-600 dark:text-content-secondary mb-2">
                Stat {index + 1}
              </div>

              {/* Value */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Value</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => {
                    const newStats = [...module.stats] as [typeof stat, typeof stat, typeof stat]
                    newStats[index] = { ...stat, value: e.target.value }
                    onUpdate({ stats: newStats })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                  placeholder="0,000"
                />
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Label</label>
                <textarea
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...module.stats] as [typeof stat, typeof stat, typeof stat]
                    newStats[index] = { ...stat, label: e.target.value }
                    onUpdate({ stats: newStats })
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                  rows={2}
                  placeholder="Stat description"
                />
              </div>
            </div>
          ))}
        </div>
      )
    }

    case 'one-stat':
      return (
        <div className="space-y-3">
          {/* Stat Section */}
          <div className="p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-content-secondary mb-2">
              Stat
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Value</label>
              <input
                type="text"
                value={module.value}
                onChange={(e) => onUpdate({ value: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                placeholder="0,000"
              />
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Label</label>
              <textarea
                value={module.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
                rows={2}
                placeholder="Stat description"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-content-secondary mb-2">
              Description
            </div>

            {/* Eyebrow */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Eyebrow</label>
              <input
                type="text"
                value={module.eyebrow}
                onChange={(e) => onUpdate({ eyebrow: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                placeholder="Firstname Lastname"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs text-gray-500 dark:text-content-secondary mb-1">Body</label>
              <textarea
                value={module.body}
                onChange={(e) => onUpdate({ body: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary resize-none"
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
          <div className="text-xs text-gray-500 dark:text-content-secondary mb-2">
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
                <label className="block text-[10px] text-gray-500 dark:text-content-secondary mb-1">Stat {stat.num}</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => onUpdate({ [stat.valueKey]: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
                  placeholder="Value"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 dark:text-content-secondary mb-1">Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => onUpdate({ [stat.labelKey]: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm bg-gray-100 dark:bg-surface-primary border border-gray-300 dark:border-line-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-content-primary"
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
  const {
    setCurrentScreen,
    stackerGeneratedModules,
    stackerDocumentTitle,
    clearStackerGenerated,
    setStackerLogoChipModule,
    setStackerHeaderModule,
    setStackerContentModules,
    setStackerFooterModule,
    setStackerModuleSpacing,
    setStackerFooterHidden,
    stackerSourceContent,
    // Persisted edited modules (for coming back from export)
    stackerLogoChipModule: storedLogoChip,
    stackerHeaderModule: storedHeader,
    stackerContentModules: storedContent,
    stackerFooterModule: storedFooter,
    stackerModuleSpacing: storedModuleSpacing,
    stackerFooterHidden: storedFooterHidden,
  } = useStore()

  // Locked modules (always present, not deletable, not draggable)
  const [logoChipModule, setLogoChipModule] = useState<StackerModule>(() => createDefaultModule('logo-chip'))
  const [headerModule, setHeaderModule] = useState<StackerModule>(() => createDefaultModule('header'))
  const [footerModule, setFooterModule] = useState<StackerModule>(() => createDefaultModule('footer'))

  // Content modules (draggable in preview, deletable)
  const [contentModules, setContentModules] = useState<StackerModule[]>([])

  // Per-module vertical spacing
  const [moduleSpacing, setModuleSpacing] = useState<Record<string, number>>({})

  // Footer visibility
  const [isFooterHidden, setIsFooterHidden] = useState(false)

  // Load modules from store on mount (either from fresh generation or returning from export)
  useEffect(() => {
    if (stackerGeneratedModules && stackerGeneratedModules.length > 0) {
      // Fresh generation - load from stackerGeneratedModules
      const logoChip = stackerGeneratedModules.find(m => m.type === 'logo-chip')
      const header = stackerGeneratedModules.find(m => m.type === 'header')
      const footer = stackerGeneratedModules.find(m => m.type === 'footer')

      if (logoChip) setLogoChipModule(logoChip)
      if (header) setHeaderModule(header)
      if (footer) setFooterModule(footer)

      // Set content modules (everything except locked modules)
      const content = stackerGeneratedModules.filter(
        m => m.type !== 'logo-chip' && m.type !== 'header' && m.type !== 'footer'
      )
      setContentModules(content)

      // Clear the generated modules so we don't reload on future mounts
      clearStackerGenerated()
    } else if (storedContent && storedContent.length > 0) {
      // Coming back from export - restore from persisted edited modules
      setLogoChipModule(storedLogoChip)
      setHeaderModule(storedHeader)
      setContentModules(storedContent)
      setFooterModule(storedFooter)
    }
    // Always restore spacing and footer visibility from store
    if (storedModuleSpacing && Object.keys(storedModuleSpacing).length > 0) {
      setModuleSpacing(storedModuleSpacing)
    }
    setIsFooterHidden(storedFooterHidden)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local state to store for draft persistence (so EditorLayout auto-save picks up changes)
  useEffect(() => {
    setStackerLogoChipModule(logoChipModule as StackerLogoChipModule)
    setStackerHeaderModule(headerModule as StackerHeaderModule)
    setStackerContentModules(contentModules)
    setStackerFooterModule(footerModule as StackerFooterModule)
  }, [logoChipModule, headerModule, contentModules, footerModule, setStackerLogoChipModule, setStackerHeaderModule, setStackerContentModules, setStackerFooterModule])

  // Sync module spacing to store for draft persistence
  useEffect(() => {
    setStackerModuleSpacing(moduleSpacing)
  }, [moduleSpacing, setStackerModuleSpacing])

  // Sync footer visibility to store for draft persistence
  useEffect(() => {
    setStackerFooterHidden(isFooterHidden)
  }, [isFooterHidden, setStackerFooterHidden])

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [previewZoom, setPreviewZoom] = useState(100)

  // Selected module for preview-sidebar sync
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  // Delete confirmation state
  const [deleteModuleConfirm, setDeleteModuleConfirm] = useState<{ moduleId: string; moduleType: string } | null>(null)

  // Preview modals state
  const [showAllPagesPreview, setShowAllPagesPreview] = useState(false)

  // AI module generation state
  const [isGeneratingModule, setIsGeneratingModule] = useState(false)
  const [showAIToast, setShowAIToast] = useState(false)
  const [aiToastMessage, setAiToastMessage] = useState('')
  const [aiToastExiting, setAiToastExiting] = useState(false)
  const aiToastTimeout = useRef<NodeJS.Timeout | null>(null)

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
  const [cropModalCardIndex, setCropModalCardIndex] = useState<number | undefined>(undefined)

  const openCropModal = (moduleId: string, cardIndex?: number) => {
    setCropModalModuleId(moduleId)
    setCropModalCardIndex(cardIndex)
  }

  // Get the image module being edited in crop modal
  const cropModalModule = cropModalModuleId
    ? contentModules.find(m => m.id === cropModalModuleId && (m.type === 'image' || m.type === 'image-16x9' || m.type === 'image-cards')) as (StackerImageModule | StackerImage16x9Module | StackerImageCardsModule) | undefined
    : undefined

  // Image library modal state
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [imageLibraryTarget, setImageLibraryTarget] = useState<{ moduleId: string; cardIndex?: number } | null>(null)

  const openImageLibrary = (moduleId: string, cardIndex?: number) => {
    setImageLibraryTarget({ moduleId, cardIndex })
    setShowImageLibrary(true)
  }

  const handleLibrarySelect = (url: string) => {
    if (imageLibraryTarget) {
      if (imageLibraryTarget.cardIndex !== undefined) {
        // Image Cards — update specific card
        const mod = contentModules.find(m => m.id === imageLibraryTarget.moduleId)
        if (mod && mod.type === 'image-cards') {
          const typedMod = mod as StackerImageCardsModule
          const newCards: typeof typedMod.cards = [...typedMod.cards]
          newCards[imageLibraryTarget.cardIndex] = { ...newCards[imageLibraryTarget.cardIndex], imageUrl: url }
          updateModule(imageLibraryTarget.moduleId, { cards: newCards })
        }
      } else {
        // Image or Image 16:9
        updateModule(imageLibraryTarget.moduleId, { imageUrl: url, imageZoom: 1, imagePan: { x: 0, y: 0 } })
      }
    }
    setShowImageLibrary(false)
    setImageLibraryTarget(null)
  }

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

  // Add content module (blank)
  const addModule = useCallback((type: StackerModule['type']) => {
    const newModule = createDefaultModule(type)
    setContentModules(prev => [...prev, newModule])
    // Auto-expand the new module (accordion - only this one)
    setExpandedModules(new Set([newModule.id]))
  }, [])

  // Add content module via AI generation
  const addModuleWithAI = useCallback(async (type: StackerModule['type']) => {
    if (!stackerSourceContent) return

    setIsGeneratingModule(true)
    try {
      // Build lightweight context of existing modules
      const existingModules = contentModules.map(m => {
        let heading: string | undefined
        if (m.type === 'paragraph' || m.type === 'bullet-three' || m.type === 'image' || m.type === 'image-16x9' || m.type === 'image-cards') {
          heading = 'heading' in m ? m.heading : undefined
        }
        return { type: m.type, heading }
      })

      const response = await fetch('/api/generate-stacker-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleType: type,
          sourceContent: stackerSourceContent,
          existingModules,
        }),
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const result = await response.json()
      if (result.module) {
        setContentModules(prev => [...prev, result.module])
        setExpandedModules(new Set([result.module.id]))
      } else {
        throw new Error('No module in response')
      }
    } catch {
      // Fallback: insert blank module + show toast
      const fallbackModule = createDefaultModule(type)
      setContentModules(prev => [...prev, fallbackModule])
      setExpandedModules(new Set([fallbackModule.id]))

      // Show failure toast
      if (aiToastTimeout.current) clearTimeout(aiToastTimeout.current)
      setAiToastMessage('Could not generate. Inserted a blank one instead.')
      setShowAIToast(true)
      setAiToastExiting(false)
      aiToastTimeout.current = setTimeout(() => {
        setAiToastExiting(true)
        setTimeout(() => {
          setShowAIToast(false)
          setAiToastExiting(false)
        }, 500)
      }, 4000)
    } finally {
      setIsGeneratingModule(false)
    }
  }, [stackerSourceContent, contentModules, aiToastTimeout])

  // Duplicate a content module (deep clone with new ID, insert after original)
  const duplicateModule = useCallback((moduleId: string) => {
    setContentModules(prev => {
      const index = prev.findIndex(m => m.id === moduleId)
      if (index === -1) return prev
      const original = prev[index]
      const clone = { ...JSON.parse(JSON.stringify(original)), id: generateId() }
      const next = [...prev]
      next.splice(index + 1, 0, clone)
      return next
    })
  }, [])

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (aiToastTimeout.current) clearTimeout(aiToastTimeout.current)
    }
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
  // Request delete (shows confirmation modal)
  const requestDeleteModule = useCallback((moduleId: string) => {
    const foundModule = contentModules.find(m => m.id === moduleId)
    if (foundModule) {
      setDeleteModuleConfirm({
        moduleId,
        moduleType: MODULE_LABELS[foundModule.type] || foundModule.type,
      })
    }
  }, [contentModules])

  // Execute delete (after confirmation)
  const executeDeleteModule = useCallback(() => {
    if (!deleteModuleConfirm) return
    const { moduleId } = deleteModuleConfirm
    setContentModules(prev => prev.filter(mod => mod.id !== moduleId))
    // Clean up spacing entry for deleted module
    setModuleSpacing(prev => {
      const next = { ...prev }
      delete next[moduleId]
      return next
    })
    // Clear selection if deleted module was selected
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null)
    }
    setDeleteModuleConfirm(null)
  }, [selectedModuleId, deleteModuleConfirm])

  // Navigate to Review & Export screen
  const handleGoToExport = useCallback(() => {
    // Sync current state to store so export screen can access it
    setStackerLogoChipModule(logoChipModule as StackerLogoChipModule)
    setStackerHeaderModule(headerModule as StackerHeaderModule)
    setStackerContentModules(contentModules)
    setStackerFooterModule(footerModule as StackerFooterModule)
    setStackerModuleSpacing(moduleSpacing)
    setStackerFooterHidden(isFooterHidden)
    // Navigate to export screen
    setCurrentScreen('stacker-export')
  }, [logoChipModule, headerModule, contentModules, footerModule, moduleSpacing, isFooterHidden, setStackerLogoChipModule, setStackerHeaderModule, setStackerContentModules, setStackerFooterModule, setStackerModuleSpacing, setStackerFooterHidden, setCurrentScreen])

  return (
    <div className="space-y-6">
      {/* Header with title */}
      <div className="flex items-center border-b border-gray-200 dark:border-line-subtle">
        <div className="flex">
          <div className="px-4 py-2.5 text-sm font-medium border-t border-l border-r rounded-t-lg -mb-px border-gray-200 dark:border-line-subtle bg-white dark:bg-surface-primary text-gray-900 dark:text-content-primary">
            Stacker Document
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex h-[calc(100vh-180px)]">
        {/* Left: Module List */}
        <div className="flex-shrink-0 flex flex-col" style={{ width: editorWidth }}>
          <div className="bg-gray-100 dark:bg-surface-primary rounded-xl p-4 flex-1 flex flex-col overflow-hidden">
            {/* Module Count */}
            <div className="text-xs text-gray-500 dark:text-content-secondary mb-2">
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
                      onOpenCropModal={openCropModal}
                      onOpenLibrary={openImageLibrary}
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
          <div className="w-0.5 h-12 bg-gray-300 dark:bg-surface-tertiary group-hover:bg-blue-400 rounded-full transition-colors" />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col overflow-hidden pl-4">
          {/* Toolbar - matches FAQ/SO editor pattern */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Preview Button */}
              <button
                onClick={() => setShowAllPagesPreview(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                  text-gray-600 dark:text-content-secondary bg-gray-100 dark:bg-surface-secondary rounded-md
                  hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors
                  border border-gray-200 dark:border-line-subtle"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>

              {/* Review & Export Button */}
              <button
                onClick={handleGoToExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white
                  bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
              >
                Review & Export
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-300 dark:bg-surface-tertiary ml-1" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => setPreviewZoom(Math.max(75, previewZoom - 25))}
                  disabled={previewZoom <= 75}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-content-secondary dark:hover:text-content-primary disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-line-subtle rounded-l bg-white dark:bg-surface-secondary"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <select
                  value={previewZoom}
                  onChange={(e) => setPreviewZoom(Number(e.target.value))}
                  className="h-7 px-2 text-xs text-gray-600 dark:text-content-secondary bg-white dark:bg-surface-secondary border-y border-gray-300 dark:border-line-subtle focus:outline-none cursor-pointer"
                >
                  <option value={200}>200%</option>
                  <option value={175}>175%</option>
                  <option value={150}>150%</option>
                  <option value={125}>125%</option>
                  <option value={100}>100%</option>
                  <option value={75}>75%</option>
                </select>
                <button
                  onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}
                  disabled={previewZoom >= 200}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-content-secondary dark:hover:text-content-primary disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 dark:border-line-subtle rounded-r bg-white dark:bg-surface-secondary"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 dark:bg-transparent rounded-xl p-6 overflow-auto">
            <div className="flex justify-center">
              <StackerPreviewEditor
                modules={allModules}
                selectedModuleId={selectedModuleId}
                onModulesChange={handleModulesChange}
                onSelectModule={handleSelectModule}
                onDeleteModule={requestDeleteModule}
                onAddModule={addModule}
                onAddModuleWithAI={addModuleWithAI}
                hasSourceContent={!!stackerSourceContent}
                isGeneratingModule={isGeneratingModule}
                previewZoom={previewZoom}
                moduleSpacing={moduleSpacing}
                onSpacingChange={(moduleId, spacing) => {
                  setModuleSpacing(prev => ({ ...prev, [moduleId]: spacing }))
                }}
                onDeselectAll={() => setSelectedModuleId(null)}
                onDuplicateModule={duplicateModule}
                onToggleFooterVisibility={() => setIsFooterHidden(prev => !prev)}
                isFooterHidden={isFooterHidden}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {cropModalModule && (() => {
        // Derive modal props based on module type
        const isCardCrop = cropModalModule.type === 'image-cards' && cropModalCardIndex !== undefined
        const cardModule = isCardCrop ? (cropModalModule as StackerImageCardsModule) : null
        const card = cardModule?.cards[cropModalCardIndex!]
        const imageSrc = isCardCrop ? card?.imageUrl : (cropModalModule as StackerImageModule | StackerImage16x9Module).imageUrl
        const initialPosition = isCardCrop ? (card?.imagePan ?? { x: 0, y: 0 }) : (cropModalModule as StackerImageModule | StackerImage16x9Module).imagePan
        const initialZoom = isCardCrop ? (card?.imageZoom ?? 1) : (cropModalModule as StackerImageModule | StackerImage16x9Module).imageZoom
        const imageSizeWidths: Record<string, number> = { S: 200, M: 270, L: 372 }
        const frameWidth = cropModalModule.type === 'image'
          ? imageSizeWidths[(cropModalModule as StackerImageModule).imageSize || 'S']
          : 180
        const frameHeight = (isCardCrop || cropModalModule.type === 'image-16x9') ? 100 : 200

        if (!imageSrc) return null

        return (
          <ImageCropModal
            isOpen={!!cropModalModuleId}
            onClose={() => { setCropModalModuleId(null); setCropModalCardIndex(undefined) }}
            imageSrc={imageSrc}
            frameWidth={frameWidth}
            frameHeight={frameHeight}
            initialPosition={initialPosition}
            initialZoom={initialZoom}
            onSave={(position, zoom) => {
              if (isCardCrop && cardModule) {
                const newCards = [...cardModule.cards] as typeof cardModule.cards
                newCards[cropModalCardIndex!] = { ...newCards[cropModalCardIndex!], imagePan: position, imageZoom: zoom }
                updateModule(cropModalModule.id, { cards: newCards })
              } else {
                updateModule(cropModalModule.id, {
                  imagePan: position,
                  imageZoom: zoom,
                })
              }
              setCropModalModuleId(null)
              setCropModalCardIndex(undefined)
            }}
          />
        )
      })()}

      {/* Image Library Modal */}
      {showImageLibrary && (
        <ImageLibraryModal
          onSelect={handleLibrarySelect}
          onClose={() => {
            setShowImageLibrary(false)
            setImageLibraryTarget(null)
          }}
        />
      )}

      {/* Delete Module Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModuleConfirm !== null}
        onConfirm={executeDeleteModule}
        onCancel={() => setDeleteModuleConfirm(null)}
        itemType={deleteModuleConfirm?.moduleType || 'Module'}
      />

      {/* All Pages Preview Modal (View-Only) */}
      {showAllPagesPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg font-medium text-white">
              Document Preview
            </h3>
            <button
              onClick={() => setShowAllPagesPreview(false)}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center">
            <div
              className="bg-white rounded-sm shadow-2xl"
              style={{ width: 612 }}
            >
              <StackerPreviewEditor
                modules={allModules}
                selectedModuleId={null}
                onModulesChange={() => {}}
                onSelectModule={() => {}}
                onDeleteModule={() => {}}
                onAddModule={() => {}}
                previewZoom={100}
                readOnly={true}
                moduleSpacing={moduleSpacing}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Failure Toast */}
      {showAIToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
            aiToastExiting
              ? 'opacity-0 -translate-y-4'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg shadow-lg backdrop-blur-sm">
            <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-amber-200">{aiToastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StackerEditorScreen
