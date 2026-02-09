'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Page1Cover, Page2Body, Page3BenefitsFeatures } from './templates/SolutionOverviewPdf'
import { heroImages } from '@/config/solution-overview-assets'

export function SolutionOverviewExportScreen() {
  const {
    setCurrentScreen,
    // Solution Overview state
    solutionOverviewSolution,
    solutionOverviewSolutionName,
    solutionOverviewTagline,
    solutionOverviewHeroImageId,
    solutionOverviewHeroImageUrl,
    solutionOverviewHeroImagePosition,
    solutionOverviewHeroImageZoom,
    solutionOverviewHeroImageGrayscale,
    solutionOverviewPage2Header,
    solutionOverviewSectionHeader,
    solutionOverviewIntroParagraph,
    solutionOverviewKeySolutions,
    solutionOverviewQuoteText,
    solutionOverviewQuoteName,
    solutionOverviewQuoteTitle,
    solutionOverviewQuoteCompany,
    solutionOverviewBenefits,
    solutionOverviewFeatures,
    solutionOverviewScreenshotUrl,
    solutionOverviewScreenshotPosition,
    solutionOverviewScreenshotZoom,
    solutionOverviewScreenshotGrayscale,
    solutionOverviewCtaOption,
    solutionOverviewCtaUrl,
  } = useStore()

  // Local state for export
  const [filename, setFilename] = useState(
    sanitizeFilename(solutionOverviewSolutionName) + '-Solution-Overview'
  )
  const [exportScale, setExportScale] = useState<1 | 2>(2)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Sanitize filename - remove special characters, replace spaces with hyphens
  function sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleBack = () => {
    setCurrentScreen('editor')
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    setExportSuccess(false)

    try {
      // Build export params
      const exportParams: Record<string, unknown> = {
        template: 'solution-overview-pdf',
        page: 'all',
        scale: exportScale,
        solution: solutionOverviewSolution,
        solutionName: solutionOverviewSolutionName,
        tagline: solutionOverviewTagline,
        heroImageId: solutionOverviewHeroImageId,
        heroImageUrl: solutionOverviewHeroImageUrl || undefined,
        heroImagePositionX: solutionOverviewHeroImagePosition.x,
        heroImagePositionY: solutionOverviewHeroImagePosition.y,
        heroImageZoom: solutionOverviewHeroImageZoom,
        heroImageGrayscale: solutionOverviewHeroImageGrayscale,
        page2Header: solutionOverviewPage2Header,
        sectionHeader: solutionOverviewSectionHeader,
        introParagraph: solutionOverviewIntroParagraph,
        keySolutions: solutionOverviewKeySolutions,
        quoteText: solutionOverviewQuoteText,
        quoteName: solutionOverviewQuoteName,
        quoteTitle: solutionOverviewQuoteTitle,
        quoteCompany: solutionOverviewQuoteCompany,
        benefits: solutionOverviewBenefits,
        features: solutionOverviewFeatures,
        screenshotUrl: solutionOverviewScreenshotUrl || undefined,
        screenshotPositionX: solutionOverviewScreenshotPosition.x,
        screenshotPositionY: solutionOverviewScreenshotPosition.y,
        screenshotZoom: solutionOverviewScreenshotZoom,
        screenshotGrayscale: solutionOverviewScreenshotGrayscale,
        ctaOption: solutionOverviewCtaOption,
        ctaUrl: solutionOverviewCtaUrl || undefined,
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportParams),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob and download
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportError('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Get hero image URL
  const heroImageUrl = solutionOverviewHeroImageUrl || heroImages.find(img => img.id === solutionOverviewHeroImageId)?.src

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Edit
        </button>

        <div className="flex items-center gap-3">
          {/* Resolution Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Resolution:</span>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setExportScale(1)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  exportScale === 1
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setExportScale(2)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  exportScale === 2
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                2x
              </button>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
              bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : exportSuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Downloaded!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {exportError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {exportError}
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-8">
        {/* PDF Preview - Left/Main */}
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6">
            <div className="max-w-[612px] mx-auto space-y-4">
              {/* Page 1 */}
              <div className="rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                <Page1Cover
                  solution={solutionOverviewSolution}
                  solutionName={solutionOverviewSolutionName}
                  tagline={solutionOverviewTagline}
                  scale={1}
                />
              </div>

              {/* Page 2 */}
              <div className="rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                <Page2Body
                  solution={solutionOverviewSolution}
                  page2Header={solutionOverviewPage2Header}
                  heroImageUrl={heroImageUrl}
                  heroImagePosition={solutionOverviewHeroImagePosition}
                  heroImageZoom={solutionOverviewHeroImageZoom}
                  heroImageGrayscale={solutionOverviewHeroImageGrayscale}
                  sectionHeader={solutionOverviewSectionHeader}
                  introParagraph={solutionOverviewIntroParagraph}
                  keySolutions={solutionOverviewKeySolutions}
                  quoteText={solutionOverviewQuoteText}
                  quoteName={solutionOverviewQuoteName}
                  quoteTitle={solutionOverviewQuoteTitle}
                  quoteCompany={solutionOverviewQuoteCompany}
                  scale={1}
                />
              </div>

              {/* Page 3 */}
              <div className="rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
                <Page3BenefitsFeatures
                  solution={solutionOverviewSolution}
                  solutionName={solutionOverviewSolutionName}
                  benefits={solutionOverviewBenefits}
                  features={solutionOverviewFeatures}
                  screenshotUrl={solutionOverviewScreenshotUrl}
                  screenshotPosition={solutionOverviewScreenshotPosition}
                  screenshotZoom={solutionOverviewScreenshotZoom}
                  screenshotGrayscale={solutionOverviewScreenshotGrayscale}
                  ctaOption={solutionOverviewCtaOption}
                  ctaUrl={solutionOverviewCtaUrl}
                  scale={1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Export Settings - Right Sidebar */}
        <div className="w-[300px] flex-shrink-0">
          <div className="sticky top-0 space-y-6">
            {/* Document Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Document Details
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Solution
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {solutionOverviewSolutionName}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Pages
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    3 pages
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Format
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    Letter (8.5" × 11")
                  </div>
                </div>
              </div>
            </div>

            {/* Filename */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Filename
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(sanitizeFilename(e.target.value))}
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 dark:text-gray-100"
                  placeholder="Enter filename"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">.pdf</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Special characters will be removed automatically
              </p>
            </div>

            {/* Export Quality Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Export Quality
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">1x:</strong> Standard resolution (612 × 792px per page)
                </p>
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">2x:</strong> High resolution (1224 × 1584px per page)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
