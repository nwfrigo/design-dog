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
  sectionHeader: string
  introParagraph: string
  keySolutions: [string, string, string, string, string, string]
  quoteText: string
  quoteName: string
  quoteTitle: string
  quoteCompany: string

  // Page 3: Benefits & Features
  benefits: SolutionOverviewBenefit[]
  features: SolutionOverviewFeature[]
  screenshotUrl: string | null
  screenshotPosition: { x: number; y: number }
  screenshotZoom: number
  ctaOption: 'demo' | 'learn' | 'start' | 'contact'
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
    sectionHeader,
    introParagraph,
    keySolutions,
    quoteText,
    quoteName,
    quoteTitle,
    quoteCompany,
    benefits,
    features,
    screenshotUrl,
    screenshotPosition,
    screenshotZoom,
    ctaOption,
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
      solutionName={solutionName}
      heroImageUrl={heroImageUrl}
      heroImagePosition={heroImagePosition}
      heroImageZoom={heroImageZoom}
      sectionHeader={sectionHeader}
      introParagraph={introParagraph}
      keySolutions={keySolutions}
      quoteText={quoteText}
      quoteName={quoteName}
      quoteTitle={quoteTitle}
      quoteCompany={quoteCompany}
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
      ctaOption={ctaOption}
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
