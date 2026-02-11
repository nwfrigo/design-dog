'use client'

import { useState, useEffect } from 'react'
import { Page1Cover, Page2Body, Page3BenefitsFeatures } from '@/components/templates/SolutionOverviewPdf'
import { heroImages } from '@/config/solution-overview-assets'
import type { SolutionCategory, SolutionOverviewBenefit, SolutionOverviewFeature } from '@/types'

export interface SolutionOverviewPdfRenderProps {
  // Current page to render (1, 2, 3, or 'all' for PDF export)
  page: '1' | '2' | '3' | 'all'

  // Page 1: Cover
  solution: SolutionCategory
  solutionName: string
  tagline: string

  // Page 2: Body
  heroImageId: string
  heroImageUrl: string | null
  heroImagePosition: { x: number; y: number }
  heroImageZoom: number
  heroImageGrayscale: boolean
  page2Header: string
  sectionHeader: string
  introParagraph: string
  keySolutions: string[]
  quoteText: string
  quoteName: string
  quoteTitle: string
  quoteCompany: string
  // Page 2: Footer Stats
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  stat4Value?: string
  stat4Label?: string
  stat5Value?: string
  stat5Label?: string

  // Page 3: Benefits & Features
  benefits: SolutionOverviewBenefit[]
  features: SolutionOverviewFeature[]
  screenshotUrl: string | null
  screenshotPosition: { x: number; y: number }
  screenshotZoom: number
  screenshotGrayscale: boolean
  ctaOption: 'demo' | 'learn' | 'start' | 'contact'
  ctaUrl?: string
}

export function SolutionOverviewPdfRender(props: SolutionOverviewPdfRenderProps) {
  const {
    page,
    solution,
    solutionName,
    tagline,
    heroImageId,
    heroImageUrl: customHeroImageUrl,
    heroImagePosition,
    heroImageZoom,
    heroImageGrayscale,
    page2Header,
    sectionHeader,
    introParagraph,
    keySolutions,
    quoteText,
    quoteName,
    quoteTitle,
    quoteCompany,
    stat1Value,
    stat1Label,
    stat2Value,
    stat2Label,
    stat3Value,
    stat3Label,
    stat4Value,
    stat4Label,
    stat5Value,
    stat5Label,
    benefits,
    features,
    screenshotUrl,
    screenshotPosition,
    screenshotZoom,
    screenshotGrayscale,
    ctaOption,
    ctaUrl,
  } = props
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait for fonts to load before signaling ready
    const waitForFonts = async () => {
      try {
        await document.fonts.ready
        setTimeout(() => setReady(true), 100)
      } catch {
        setTimeout(() => setReady(true), 500)
      }
    }
    waitForFonts()
  }, [])

  // Get hero image URL - use custom URL if provided, otherwise look up from ID
  const heroImageUrl = customHeroImageUrl || heroImages.find(img => img.id === heroImageId)?.src

  const renderPage1 = () => (
    <Page1Cover
      solution={solution}
      solutionName={solutionName}
      tagline={tagline}
      scale={1}
    />
  )

  const renderPage2 = () => (
    <Page2Body
      solution={solution}
      page2Header={page2Header}
      heroImageUrl={heroImageUrl}
      heroImagePosition={heroImagePosition}
      heroImageZoom={heroImageZoom}
      heroImageGrayscale={heroImageGrayscale}
      sectionHeader={sectionHeader}
      introParagraph={introParagraph}
      keySolutions={keySolutions}
      quoteText={quoteText}
      quoteName={quoteName}
      quoteTitle={quoteTitle}
      quoteCompany={quoteCompany}
      stat1Value={stat1Value}
      stat1Label={stat1Label}
      stat2Value={stat2Value}
      stat2Label={stat2Label}
      stat3Value={stat3Value}
      stat3Label={stat3Label}
      stat4Value={stat4Value}
      stat4Label={stat4Label}
      stat5Value={stat5Value}
      stat5Label={stat5Label}
      scale={1}
    />
  )

  const renderPage3 = () => (
    <Page3BenefitsFeatures
      solution={solution}
      solutionName={solutionName}
      benefits={benefits}
      features={features}
      screenshotUrl={screenshotUrl}
      screenshotPosition={screenshotPosition}
      screenshotZoom={screenshotZoom}
      screenshotGrayscale={screenshotGrayscale}
      ctaOption={ctaOption}
      ctaUrl={ctaUrl}
      scale={1}
    />
  )

  return (
    <>
      {ready && <div id="render-ready" style={{ display: 'none' }} />}

      {page === '1' && renderPage1()}
      {page === '2' && renderPage2()}
      {page === '3' && renderPage3()}

      {/* For PDF export, render all pages with page breaks */}
      {page === 'all' && (
        <div>
          <div style={{ pageBreakAfter: 'always' }}>{renderPage1()}</div>
          <div style={{ pageBreakAfter: 'always' }}>{renderPage2()}</div>
          <div>{renderPage3()}</div>
        </div>
      )}
    </>
  )
}

export default SolutionOverviewPdfRender
