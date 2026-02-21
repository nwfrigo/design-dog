'use client'

import { CSSProperties, ReactNode } from 'react'
import type { StackerModule } from '@/types'
import { LogoChipModule } from './modules/LogoChipModule'
import { HeaderModule } from './modules/HeaderModule'
import { ParagraphModule } from './modules/ParagraphModule'
import { DividerModule } from './modules/DividerModule'
import { ImageModule } from './modules/ImageModule'
import { CardsModule } from './modules/CardsModule'
import { QuoteModule } from './modules/QuoteModule'
import { ThreeStatsModule } from './modules/ThreeStatsModule'
import { OneStatModule } from './modules/OneStatModule'
import { FooterModule } from './modules/FooterModule'
import { BulletListModule } from './modules/BulletListModule'

// Document dimensions
const DOCUMENT_WIDTH = 612 // Same as other PDF templates (Letter width in points)
const DOCUMENT_PADDING = 48 // Padding on all sides

export interface StackerPdfProps {
  modules: StackerModule[]
  scale?: number
  // Optional wrapper for interactive editing (drag handles, click-to-select)
  renderModuleWrapper?: (module: StackerModule, children: ReactNode, index: number) => ReactNode
  // Optional content to render after all modules (e.g., "Add Module" tile)
  renderFooterContent?: () => ReactNode
}

// Render individual module based on type
function RenderModule({ module, scale = 1 }: { module: StackerModule; scale?: number }) {
  switch (module.type) {
    case 'logo-chip':
      return (
        <LogoChipModule
          showChips={module.showChips}
          activeCategories={module.activeCategories}
          scale={scale}
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
          scale={scale}
        />
      )

    case 'paragraph':
      return (
        <ParagraphModule
          intro={module.intro}
          body={module.body}
          showIntro={module.showIntro}
          showBody={module.showBody}
          scale={scale}
        />
      )

    case 'divider':
      return (
        <DividerModule scale={scale} />
      )

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
          scale={scale}
        />
      )

    case 'three-card':
      return (
        <CardsModule
          cards={module.cards}
          scale={scale}
        />
      )

    case 'quote':
      return (
        <QuoteModule
          quote={module.quote}
          name={module.name}
          jobTitle={module.jobTitle}
          organization={module.organization}
          scale={scale}
        />
      )

    case 'three-stats':
      return (
        <ThreeStatsModule
          stats={module.stats}
          scale={scale}
        />
      )

    case 'one-stat':
      return (
        <OneStatModule
          value={module.value}
          label={module.label}
          eyebrow={module.eyebrow}
          body={module.body}
          scale={scale}
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
          scale={scale}
        />
      )

    case 'bullet-three':
      return (
        <BulletListModule
          heading={module.heading}
          columns={module.columns}
          scale={scale}
        />
      )

    default:
      return null
  }
}

export function StackerPdf({ modules, scale = 1, renderModuleWrapper, renderFooterContent }: StackerPdfProps) {
  const fontFamily = '"Fakt Pro", system-ui, sans-serif'

  const documentStyle: CSSProperties = {
    width: DOCUMENT_WIDTH,
    minHeight: 200, // Variable height, but minimum to show something
    background: 'white',
    fontFamily,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  }

  const contentStyle: CSSProperties = {
    paddingTop: 48,
    paddingRight: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 32, // Spacing between modules
  }

  return (
    <div style={documentStyle}>
      <div style={contentStyle}>
        {modules.map((module, index) => {
          const moduleContent = <RenderModule key={module.id} module={module} />
          return renderModuleWrapper
            ? renderModuleWrapper(module, moduleContent, index)
            : moduleContent
        })}
        {modules.length === 0 && (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              color: '#999',
              fontSize: 14,
              fontFamily,
            }}
          >
            Add modules to start building your document
          </div>
        )}
        {/* Optional footer content (e.g., Add Module tile in editor) */}
        {renderFooterContent && renderFooterContent()}
      </div>
    </div>
  )
}

export default StackerPdf
