'use client'

import { useState, useCallback, useMemo, ReactNode } from 'react'
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
import type { StackerModule } from '@/types'
import { StackerPdf } from './templates/StackerPdf'
import { StackerDraggableModule } from './StackerDraggableModule'
import { StackerDropIndicator } from './StackerDropIndicator'

// Module types for rendering in overlay
import { LogoChipModule } from './templates/StackerPdf/modules/LogoChipModule'
import { HeaderModule } from './templates/StackerPdf/modules/HeaderModule'
import { ParagraphModule } from './templates/StackerPdf/modules/ParagraphModule'
import { DividerModule } from './templates/StackerPdf/modules/DividerModule'
import { ImageModule } from './templates/StackerPdf/modules/ImageModule'
import { CardsModule } from './templates/StackerPdf/modules/CardsModule'
import { QuoteModule } from './templates/StackerPdf/modules/QuoteModule'
import { ThreeStatsModule } from './templates/StackerPdf/modules/ThreeStatsModule'
import { OneStatModule } from './templates/StackerPdf/modules/OneStatModule'
import { FooterModule } from './templates/StackerPdf/modules/FooterModule'
import { BulletListModule } from './templates/StackerPdf/modules/BulletListModule'

export interface StackerPreviewEditorProps {
  modules: StackerModule[]
  selectedModuleId: string | null
  onModulesChange: (modules: StackerModule[]) => void
  onSelectModule: (moduleId: string) => void
  onDeleteModule: (moduleId: string) => void
  previewZoom: number
}

// Render a module for the drag overlay
function RenderModuleForOverlay({ module }: { module: StackerModule }) {
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
    case 'three-card':
      return <CardsModule cards={module.cards} />
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
  previewZoom,
}: StackerPreviewEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

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

  // Render module wrapper with drag capabilities
  const renderModuleWrapper = useCallback((module: StackerModule, children: ReactNode, index: number) => {
    const isOverAbove = overId === module.id && activeId !== module.id
    const isLastModule = index === modules.length - 1
    const isOverAfterLast = isLastModule && overId === module.id && activeId !== null

    return (
      <StackerDraggableModule
        key={module.id}
        module={module}
        isSelected={selectedModuleId === module.id}
        isOverAbove={isOverAbove}
        onSelect={onSelectModule}
        onDelete={onDeleteModule}
      >
        {children}
        {/* Show drop indicator after last module when dragging */}
        {isOverAfterLast && (
          <div style={{ marginTop: 8 }}>
            <StackerDropIndicator isVisible={true} />
          </div>
        )}
      </StackerDraggableModule>
    )
  }, [selectedModuleId, onSelectModule, onDeleteModule, overId, activeId, modules.length])

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
          className="ring-1 ring-gray-300/50 dark:ring-gray-700/50 rounded-sm shadow-lg"
          style={{
            zoom: previewZoom / 100,
          }}
        >
          <StackerPdf
            modules={modules}
            scale={1}
            renderModuleWrapper={renderModuleWrapper}
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
            <RenderModuleForOverlay module={activeModule} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default StackerPreviewEditor
