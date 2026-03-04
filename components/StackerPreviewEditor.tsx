'use client'

import { useState, useCallback, useMemo, useEffect, useRef, ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { StackerModule, SolutionCategory } from '@/types'
import { STACKER_PLACEHOLDER_IMAGE_1x1, STACKER_PLACEHOLDER_IMAGE_16x9 } from '@/lib/stacker-modules'
import { StackerPdf } from './templates/StackerPdf'
import { StackerDraggableModule } from './StackerDraggableModule'
import { StackerDropIndicator } from './StackerDropIndicator'
import { StackerSpacingHandle } from './StackerSpacingHandle'

// Module types for rendering in overlay
import { LogoChipModule } from './templates/StackerPdf/modules/LogoChipModule'
import { HeaderModule } from './templates/StackerPdf/modules/HeaderModule'
import { ParagraphModule } from './templates/StackerPdf/modules/ParagraphModule'
import { DividerModule } from './templates/StackerPdf/modules/DividerModule'
import { ImageModule } from './templates/StackerPdf/modules/ImageModule'
import { Image16x9Module } from './templates/StackerPdf/modules/Image16x9Module'
import { CardsModule } from './templates/StackerPdf/modules/CardsModule'
import { ImageCardsModule } from './templates/StackerPdf/modules/ImageCardsModule'
import { QuoteModule } from './templates/StackerPdf/modules/QuoteModule'
import { ThreeStatsModule } from './templates/StackerPdf/modules/ThreeStatsModule'
import { OneStatModule } from './templates/StackerPdf/modules/OneStatModule'
import { FooterModule } from './templates/StackerPdf/modules/FooterModule'
import { BulletListModule } from './templates/StackerPdf/modules/BulletListModule'

// Module type metadata for the add menu
interface ModuleTypeInfo {
  type: StackerModule['type']
  label: string
  description: string
}

const MODULE_TYPES_INFO: ModuleTypeInfo[] = [
  { type: 'paragraph', label: 'Paragraph', description: 'Intro text with body copy' },
  { type: 'bullet-three', label: '3 Bullets', description: 'Three columns of bullet points' },
  { type: 'image', label: 'Image - Tall', description: 'Tall image with text' },
  { type: 'image-16x9', label: 'Image - Short', description: 'Short image with text' },
  { type: 'divider', label: 'Divider', description: 'Horizontal separator line' },
  { type: 'three-card', label: 'Simple Cards', description: 'Three icon cards' },
  { type: 'image-cards', label: 'Image Cards', description: 'Cards with images' },
  { type: 'quote', label: 'Quote', description: 'Customer testimonial' },
  { type: 'three-stats', label: '3 Stats', description: 'Three key metrics' },
  { type: 'one-stat', label: '1 Stat', description: 'Single featured metric' },
]

// Estimated heights for each module type at native 564px width (for scaling calculations)
const MODULE_HEIGHTS: Record<StackerModule['type'], number> = {
  'logo-chip': 60,
  'header': 100,
  'paragraph': 80,
  'bullet-three': 140,
  'image': 210,
  'image-16x9': 130,
  'divider': 30,
  'three-card': 150,
  'image-cards': 220,
  'quote': 100,
  'three-stats': 80,
  'one-stat': 100,
  'footer': 80,
}

// Sample data for module previews
function getSampleModule(type: StackerModule['type']): StackerModule {
  const id = `preview-${type}`
  switch (type) {
    case 'paragraph':
      return {
        id, type: 'paragraph',
        intro: 'Transform your safety operations with a unified platform.',
        body: 'Connect incident reporting, corrective actions, audits, and compliance tracking across all locations for real-time visibility.',
        showIntro: true, showBody: true,
      }
    case 'bullet-three':
      return {
        id, type: 'bullet-three',
        heading: '',
        columns: [
          { label: 'Challenges', bullets: ['Manual processes', 'Data silos', 'Compliance gaps'] },
          { label: 'Solutions', bullets: ['Automation', 'Integration', 'Real-time tracking'] },
          { label: 'Outcomes', bullets: ['40% faster', 'Zero incidents', 'Audit-ready'] },
        ],
      }
    case 'image':
      return {
        id, type: 'image',
        imagePosition: 'left', imageSize: 'S' as const, imageUrl: STACKER_PLACEHOLDER_IMAGE_1x1, imagePan: { x: 0, y: 0 }, imageZoom: 1, grayscale: false,
        eyebrow: 'Platform', showEyebrow: true,
        heading: 'Unified Dashboard', showHeading: true,
        body: 'See all your safety data in one place with real-time updates.', showBody: true,
        cta: 'Learn More', ctaUrl: '', showCta: true,
      }
    case 'image-16x9':
      return {
        id, type: 'image-16x9',
        imagePosition: 'right', imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9, imagePan: { x: 0, y: 0 }, imageZoom: 1, grayscale: false,
        eyebrow: 'Feature', showEyebrow: true,
        heading: 'Mobile Access', showHeading: true,
        body: 'Access your data anywhere with our mobile app.', showBody: true,
      }
    case 'divider':
      return { id, type: 'divider' }
    case 'three-card':
      return {
        id, type: 'three-card',
        cards: [
          { icon: 'shield-check', title: 'Safety First', description: 'Proactive hazard identification' },
          { icon: 'clipboard-check', title: 'Compliance', description: 'Automated tracking' },
          { icon: 'trending-up', title: 'Analytics', description: 'Data-driven insights' },
        ],
      }
    case 'image-cards':
      return {
        id, type: 'image-cards',
        heading: '', showHeading: false,
        cards: [
          { imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9, imagePan: { x: 0, y: 0 }, imageZoom: 1, eyebrow: 'Feature', showEyebrow: true, title: 'Incident Reporting', body: 'Capture incidents in real-time' },
          { imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9, imagePan: { x: 0, y: 0 }, imageZoom: 1, eyebrow: 'Feature', showEyebrow: true, title: 'Risk Assessment', body: 'Identify and mitigate risks' },
          { imageUrl: STACKER_PLACEHOLDER_IMAGE_16x9, imagePan: { x: 0, y: 0 }, imageZoom: 1, eyebrow: 'Feature', showEyebrow: true, title: 'Audit Management', body: 'Streamline your audits' },
        ],
        showCard3: true, grayscale: false,
      }
    case 'quote':
      return {
        id, type: 'quote',
        quote: 'This platform transformed how we manage safety across all our facilities.',
        name: 'Sarah Johnson', jobTitle: 'VP of Operations', organization: 'Global Manufacturing Inc.',
      }
    case 'three-stats':
      return {
        id, type: 'three-stats',
        stats: [
          { value: '40%', label: 'Incident reduction' },
          { value: '3x', label: 'Faster audits' },
          { value: '$2M', label: 'Annual savings' },
        ],
        showStat3: true,
      }
    case 'one-stat':
      return {
        id, type: 'one-stat',
        value: '99.9%', label: 'Uptime guaranteed',
        eyebrow: 'Reliability', body: 'Our platform ensures your critical safety systems are always available.',
      }
    default:
      return { id, type: 'divider' }
  }
}

export interface StackerPreviewEditorProps {
  modules: StackerModule[]
  selectedModuleId: string | null
  onModulesChange: (modules: StackerModule[]) => void
  onSelectModule: (moduleId: string) => void
  onDeleteModule: (moduleId: string) => void
  onAddModule: (type: StackerModule['type']) => void
  onAddModuleWithAI?: (type: StackerModule['type']) => void
  hasSourceContent?: boolean
  isGeneratingModule?: boolean
  previewZoom: number
  readOnly?: boolean // When true, disables all drag/drop, delete, and add functionality
  moduleSpacing?: Record<string, number>
  onSpacingChange?: (moduleId: string, spacing: number) => void
  onDeselectAll?: () => void
  onDuplicateModule?: (moduleId: string) => void
  onToggleFooterVisibility?: () => void
  isFooterHidden?: boolean
}

// Solution category colors
const SOLUTION_COLORS: Record<SolutionCategory, string> = {
  environmental: '#49763E',
  health: '#00767F',
  safety: '#C3B01E',
  quality: '#006FA3',
  sustainability: '#A61F67',
  converged: '#D35F0B',
}

function getAccentColor(modules: StackerModule[]): string {
  const logoChip = modules.find(m => m.type === 'logo-chip')
  if (logoChip && logoChip.type === 'logo-chip' && logoChip.activeCategories.length === 1) {
    return SOLUTION_COLORS[logoChip.activeCategories[0]] || '#000000'
  }
  return '#000000'
}

// Render a module for the drag overlay
function RenderModuleForOverlay({ module, accentColor }: { module: StackerModule; accentColor?: string }) {
  switch (module.type) {
    case 'logo-chip':
      return (
        <LogoChipModule
          showChips={module.showChips}
          activeCategories={module.activeCategories}
        />
      )
    case 'header':
      return (
        <HeaderModule
          heading={module.heading}
          headingSize={module.headingSize}
          subheader={module.subheader}
          showSubheader={module.showSubheader}
          cta={module.cta}
          ctaUrl={module.ctaUrl}
          showCta={module.showCta}
        />
      )
    case 'paragraph':
      return (
        <ParagraphModule
          intro={module.intro}
          body={module.body}
          showIntro={module.showIntro}
          showBody={module.showBody}
        />
      )
    case 'divider':
      return <DividerModule />
    case 'image':
      return (
        <ImageModule
          imagePosition={module.imagePosition}
          imageSize={module.imageSize}
          imageUrl={module.imageUrl}
          imagePan={module.imagePan}
          imageZoom={module.imageZoom}
          grayscale={module.grayscale}
          eyebrow={module.eyebrow}
          showEyebrow={module.showEyebrow}
          heading={module.heading}
          showHeading={module.showHeading}
          body={module.body}
          showBody={module.showBody}
          cta={module.cta}
          ctaUrl={module.ctaUrl}
          showCta={module.showCta}
        />
      )
    case 'image-16x9':
      return (
        <Image16x9Module
          imagePosition={module.imagePosition}
          imageUrl={module.imageUrl}
          imagePan={module.imagePan}
          imageZoom={module.imageZoom}
          grayscale={module.grayscale}
          eyebrow={module.eyebrow}
          showEyebrow={module.showEyebrow}
          heading={module.heading}
          showHeading={module.showHeading}
          body={module.body}
          showBody={module.showBody}
        />
      )
    case 'three-card':
      return <CardsModule cards={module.cards} />
    case 'image-cards':
      return (
        <ImageCardsModule
          heading={module.heading}
          showHeading={module.showHeading}
          cards={module.cards}
          showCard3={module.showCard3}
          grayscale={module.grayscale}
        />
      )
    case 'quote':
      return (
        <QuoteModule
          quote={module.quote}
          name={module.name}
          jobTitle={module.jobTitle}
          organization={module.organization}
        />
      )
    case 'three-stats':
      return <ThreeStatsModule stats={module.stats} />
    case 'one-stat':
      return (
        <OneStatModule
          value={module.value}
          label={module.label}
          eyebrow={module.eyebrow}
          body={module.body}
        />
      )
    case 'footer':
      return (
        <FooterModule
          stat1Value={module.stat1Value}
          stat1Label={module.stat1Label}
          stat2Value={module.stat2Value}
          stat2Label={module.stat2Label}
          stat3Value={module.stat3Value}
          stat3Label={module.stat3Label}
          stat4Value={module.stat4Value}
          stat4Label={module.stat4Label}
          stat5Value={module.stat5Value}
          stat5Label={module.stat5Label}
        />
      )
    case 'bullet-three':
      return (
        <BulletListModule
          heading={module.heading}
          columns={module.columns}
          accentColor={accentColor}
        />
      )
    default:
      return null
  }
}

export function StackerPreviewEditor({
  modules,
  selectedModuleId,
  onModulesChange,
  onSelectModule,
  onDeleteModule,
  onAddModule,
  onAddModuleWithAI,
  hasSourceContent = false,
  isGeneratingModule = false,
  previewZoom,
  readOnly = false,
  moduleSpacing,
  onSpacingChange,
  onDeselectAll,
  onDuplicateModule,
  onToggleFooterVisibility,
  isFooterHidden = false,
}: StackerPreviewEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addMenuStep, setAddMenuStep] = useState<'choice' | 'select-blank' | 'select-ai'>('choice')
  const [previewingModule, setPreviewingModule] = useState<StackerModule['type'] | null>(null)
  const [generatingModuleType, setGeneratingModuleType] = useState<string | null>(null)
  const wasGenerating = useRef(false)

  // Reset step when modal opens
  useEffect(() => {
    if (showAddMenu) {
      setAddMenuStep('choice')
      setGeneratingModuleType(null)
    }
  }, [showAddMenu])

  // Auto-close modal when generation completes
  useEffect(() => {
    if (wasGenerating.current && !isGeneratingModule) {
      // Generation just finished — close the modal
      setShowAddMenu(false)
      setGeneratingModuleType(null)
    }
    wasGenerating.current = isGeneratingModule
  }, [isGeneratingModule])

  // Handle Escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isGeneratingModule) return // Don't close during generation
        if (previewingModule) {
          setPreviewingModule(null)
        } else if (showAddMenu) {
          setShowAddMenu(false)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [previewingModule, showAddMenu, isGeneratingModule])

  // Configure sensors with activation constraint to distinguish click vs drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get the active module for overlay
  const activeModule = useMemo(() => {
    if (!activeId) return null
    return modules.find(m => m.id === activeId)
  }, [activeId, modules])

  // Get only content module IDs for sortable context (exclude locked modules)
  const sortableModuleIds = useMemo(() => {
    const lockedTypes = ['logo-chip', 'header', 'footer']
    return modules.filter(m => !lockedTypes.includes(m.type)).map(m => m.id)
  }, [modules])

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  // Handle drag over (for drop indicator positioning)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string | null)
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setOverId(null)

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex(m => m.id === active.id)
      const newIndex = modules.findIndex(m => m.id === over.id)
      onModulesChange(arrayMove(modules, oldIndex, newIndex))
    }
  }, [modules, onModulesChange])

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  // Render module wrapper with drag capabilities (or read-only)
  const renderModuleWrapper = useCallback((module: StackerModule, children: ReactNode, index: number) => {
    const isOverAbove = overId === module.id && activeId !== module.id
    const isLastModule = index === modules.length - 1
    const isOverAfterLast = isLastModule && overId === module.id && activeId !== null
    const isFooter = module.type === 'footer'
    const isLocked = ['logo-chip', 'header', 'footer'].includes(module.type)

    return (
      <StackerDraggableModule
        key={module.id}
        module={module}
        isSelected={readOnly ? false : selectedModuleId === module.id}
        isOverAbove={readOnly ? false : isOverAbove}
        onSelect={onSelectModule}
        onDelete={onDeleteModule}
        onDuplicate={!readOnly && !isLocked ? onDuplicateModule : undefined}
        onToggleVisibility={!readOnly && isFooter && onToggleFooterVisibility ? () => onToggleFooterVisibility() : undefined}
        isHidden={isFooter ? isFooterHidden : false}
        readOnly={readOnly}
      >
        {children}
        {/* Show drop indicator after last module when dragging (not in readOnly) */}
        {!readOnly && isOverAfterLast && (
          <div style={{ marginTop: 8 }}>
            <StackerDropIndicator isVisible={true} />
          </div>
        )}
      </StackerDraggableModule>
    )
  }, [selectedModuleId, onSelectModule, onDeleteModule, onDuplicateModule, onToggleFooterVisibility, isFooterHidden, overId, activeId, modules.length, readOnly])

  // Render add module tile inside the document
  const renderAddModuleTile = useCallback(() => (
    <div className="relative">
      <button
        onClick={() => setShowAddMenu(true)}
        className="w-full py-4 rounded-md border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group"
      >
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
            Add Module
          </span>
        </div>
      </button>
    </div>
  ), [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={sortableModuleIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="ring-1 ring-gray-300/50 dark:ring-line-subtle/50 rounded-sm shadow-lg"
          style={{
            zoom: previewZoom / 100,
          }}
          onClick={() => {
            // Deselect when clicking the document background
            if (onDeselectAll) onDeselectAll()
          }}
        >
          <StackerPdf
            modules={modules}
            scale={1}
            moduleSpacing={moduleSpacing}
            renderModuleWrapper={renderModuleWrapper}
            renderSpacerBetween={!readOnly && onSpacingChange ? (moduleId, spacing) => (
              <StackerSpacingHandle
                key={`spacer-${moduleId}`}
                moduleId={moduleId}
                spacing={spacing}
                onChange={onSpacingChange}
                scale={previewZoom / 100}
              />
            ) : undefined}
            renderFooterContent={readOnly ? undefined : renderAddModuleTile}
          />
        </div>
      </SortableContext>

      {/* Drag overlay with lift effect */}
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'ease-out',
        }}
      >
        {activeModule && (
          <div
            style={{
              width: 564, // 612 - 48 padding
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              opacity: 0.85,
              transform: 'scale(1.02)',
              padding: '0 24px',
              pointerEvents: 'none',
            }}
          >
            <RenderModuleForOverlay module={activeModule} accentColor={getAccentColor(modules)} />
          </div>
        )}
      </DragOverlay>

      {/* Add Module Modal — Two-step: choice → module grid */}
      {showAddMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isGeneratingModule && setShowAddMenu(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-surface-primary rounded-xl shadow-2xl w-full max-w-[900px] max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-line-subtle">
              <div className="flex items-center gap-3">
                {addMenuStep !== 'choice' && !isGeneratingModule && (
                  <button
                    onClick={() => setAddMenuStep('choice')}
                    className="p-1 text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-content-primary">
                  {addMenuStep === 'choice' ? 'Add Module' : addMenuStep === 'select-ai' ? 'Write with AI' : 'Insert Blank Module'}
                </h2>
              </div>
              {!isGeneratingModule && (
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="p-1 text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Step 1: Choice — AI vs Blank */}
            {addMenuStep === 'choice' && (
              <div className="flex-1 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 w-full max-w-[560px]">
                  {/* Write with AI */}
                  <button
                    onClick={() => hasSourceContent && setAddMenuStep('select-ai')}
                    disabled={!hasSourceContent}
                    className={`flex flex-col items-center gap-4 p-8 rounded-xl border-2 transition-all ${
                      hasSourceContent
                        ? 'border-gray-200 dark:border-line-subtle hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-surface-secondary cursor-pointer'
                        : 'border-gray-100 dark:border-line-subtle/30 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {/* Sparkle icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasSourceContent ? 'bg-blue-50 dark:bg-blue-500/20' : 'bg-gray-100 dark:bg-surface-secondary'}`}>
                      <svg className={`w-6 h-6 ${hasSourceContent ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-content-secondary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className={`text-sm font-semibold ${hasSourceContent ? 'text-gray-900 dark:text-content-primary' : 'text-gray-400 dark:text-content-secondary'}`}>Write with AI</h3>
                      <p className={`text-xs mt-1 ${hasSourceContent ? 'text-gray-500 dark:text-content-secondary' : 'text-gray-400 dark:text-content-secondary'}`}>
                        {hasSourceContent
                          ? 'Generate content from your source material'
                          : 'No source content available'}
                      </p>
                    </div>
                  </button>

                  {/* Insert Blank */}
                  <button
                    onClick={() => setAddMenuStep('select-blank')}
                    className="flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-gray-200 dark:border-line-subtle hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-surface-secondary transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-surface-secondary flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400 dark:text-content-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-content-primary">Insert Blank Module</h3>
                      <p className="text-xs text-gray-500 dark:text-content-secondary mt-1">Start with an empty template</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2a: Blank module grid */}
            {addMenuStep === 'select-blank' && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4" style={{ gridAutoRows: 'auto' }}>
                  {MODULE_TYPES_INFO.map((info) => {
                    const sampleModule = getSampleModule(info.type)
                    const scale = 0.71
                    const padding = 16
                    const scaledHeight = MODULE_HEIGHTS[info.type] * scale + padding * 2

                    return (
                      <div
                        key={info.type}
                        className="bg-gray-50 dark:bg-surface-secondary rounded-lg overflow-hidden border border-gray-200 dark:border-line-subtle hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                      >
                        <div
                          className="relative bg-white cursor-pointer overflow-hidden"
                          onClick={() => {
                            onAddModule(info.type)
                            setShowAddMenu(false)
                          }}
                          style={{ height: scaledHeight, padding }}
                        >
                          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 564, pointerEvents: 'none' }}>
                            <RenderModuleForOverlay module={sampleModule} />
                          </div>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-content-primary">{info.label}</h3>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewingModule(info.type) }}
                            className="text-xs text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2b: AI module grid (excludes divider, quote, stats — verbatim-only modules) */}
            {addMenuStep === 'select-ai' && (
              <div className="flex-1 overflow-y-auto p-6 relative">
                {/* Loading overlay */}
                {isGeneratingModule && (
                  <div className="absolute inset-0 z-10 bg-white/80 dark:bg-surface-primary/80 flex flex-col items-center justify-center gap-4 rounded-b-xl">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-content-secondary">
                      Generating {generatingModuleType ? MODULE_TYPES_INFO.find(m => m.type === generatingModuleType)?.label || generatingModuleType : 'module'}...
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4" style={{ gridAutoRows: 'auto' }}>
                  {MODULE_TYPES_INFO.filter(info => !['divider', 'quote', 'three-stats', 'one-stat'].includes(info.type)).map((info) => {
                    const sampleModule = getSampleModule(info.type)
                    const scale = 0.71
                    const padding = 16
                    const scaledHeight = MODULE_HEIGHTS[info.type] * scale + padding * 2

                    return (
                      <div
                        key={info.type}
                        className="bg-gray-50 dark:bg-surface-secondary rounded-lg overflow-hidden border border-gray-200 dark:border-line-subtle hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                      >
                        <div
                          className="relative bg-white cursor-pointer overflow-hidden"
                          onClick={() => {
                            if (!isGeneratingModule && onAddModuleWithAI) {
                              setGeneratingModuleType(info.type)
                              onAddModuleWithAI(info.type)
                            }
                          }}
                          style={{ height: scaledHeight, padding }}
                        >
                          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 564, pointerEvents: 'none' }}>
                            <RenderModuleForOverlay module={sampleModule} />
                          </div>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-content-primary">{info.label}</h3>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewingModule(info.type) }}
                            className="text-xs text-gray-400 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer — shown on choice and grid steps, hidden during generation */}
            {!isGeneratingModule && (
              <div className="p-6 border-t border-gray-200 dark:border-line-subtle">
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="w-full py-3 text-sm font-medium text-gray-600 dark:text-content-secondary bg-gray-100 dark:bg-surface-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-interactive-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module Preview Lightbox */}
      {previewingModule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setPreviewingModule(null)}
          />

          {/* Preview Container - stacked vertically */}
          <div className="relative flex flex-col items-center max-w-[700px] w-full">
            {/* Close button above preview */}
            <div className="w-full flex justify-end mb-2">
              <button
                onClick={() => setPreviewingModule(null)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-h-[80vh] overflow-auto">
              {/* Module preview - scales to fill width */}
              <div className="p-6">
                <RenderModuleForOverlay module={getSampleModule(previewingModule)} />
              </div>

              {/* Add button */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {MODULE_TYPES_INFO.find(m => m.type === previewingModule)?.label}
                </span>
                <button
                  onClick={() => {
                    onAddModule(previewingModule)
                    setPreviewingModule(null)
                    setShowAddMenu(false)
                  }}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}

export default StackerPreviewEditor
