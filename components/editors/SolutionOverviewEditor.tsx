'use client'

import { ToggleSwitch } from '@/components/shared/ToggleSwitch'
import { IconPickerModal, getIconByName } from '@/components/IconPickerModal'
import { SolutionOverviewImageLibraryModal } from '@/components/SolutionOverviewImageLibraryModal'
import { ImageLibraryModal } from '@/components/ImageLibraryModal'
import { ImageCropModal } from '@/components/ImageCropModal'
import { solutionCategories, heroImages, ctaOptions, type SolutionCategory } from '@/config/solution-overview-assets'
import { Page1Cover, Page2Body, Page3BenefitsFeatures } from '@/components/templates/SolutionOverviewPdf'
import { useState } from 'react'
import type { SolutionOverviewBenefit, SolutionOverviewFeature } from '@/types'

// ─────────────────────────────────────────────────────────────
// Types for state passed in from EditorScreen
// ─────────────────────────────────────────────────────────────

interface SolutionOverviewEditorControlsProps {
  // Page 1
  solutionOverviewSolution: SolutionCategory
  setSolutionOverviewSolution: (v: SolutionCategory) => void
  solutionOverviewSolutionName: string
  setSolutionOverviewSolutionName: (v: string) => void
  solutionOverviewTagline: string
  setSolutionOverviewTagline: (v: string) => void
  solutionOverviewCurrentPage: number

  // Page 2
  solutionOverviewHeroImageUrl: string | null
  setSolutionOverviewHeroImageUrl: (v: string | null) => void
  solutionOverviewHeroImagePosition: { x: number; y: number }
  setSolutionOverviewHeroImagePosition: (v: { x: number; y: number }) => void
  solutionOverviewHeroImageZoom: number
  setSolutionOverviewHeroImageZoom: (v: number) => void
  solutionOverviewHeroImageGrayscale: boolean
  setSolutionOverviewHeroImageGrayscale: (v: boolean) => void
  solutionOverviewPage2Header: string
  setSolutionOverviewPage2Header: (v: string) => void
  solutionOverviewSectionHeader: string
  setSolutionOverviewSectionHeader: (v: string) => void
  solutionOverviewIntroParagraph: string
  setSolutionOverviewIntroParagraph: (v: string) => void
  solutionOverviewKeySolutions: string[]
  setSolutionOverviewKeySolution: (index: number, value: string) => void
  addSolutionOverviewKeySolution: () => void
  removeSolutionOverviewKeySolution: (index: number) => void
  solutionOverviewQuoteText: string
  setSolutionOverviewQuoteText: (v: string) => void
  solutionOverviewQuoteName: string
  setSolutionOverviewQuoteName: (v: string) => void
  solutionOverviewQuoteTitle: string
  setSolutionOverviewQuoteTitle: (v: string) => void
  solutionOverviewQuoteCompany: string
  setSolutionOverviewQuoteCompany: (v: string) => void

  // Page 2 Stats
  solutionOverviewStat1Value: string
  setSolutionOverviewStat1Value: (v: string) => void
  solutionOverviewStat1Label: string
  setSolutionOverviewStat1Label: (v: string) => void
  solutionOverviewStat2Value: string
  setSolutionOverviewStat2Value: (v: string) => void
  solutionOverviewStat2Label: string
  setSolutionOverviewStat2Label: (v: string) => void
  solutionOverviewStat3Value: string
  setSolutionOverviewStat3Value: (v: string) => void
  solutionOverviewStat3Label: string
  setSolutionOverviewStat3Label: (v: string) => void
  solutionOverviewStat4Value: string
  setSolutionOverviewStat4Value: (v: string) => void
  solutionOverviewStat4Label: string
  setSolutionOverviewStat4Label: (v: string) => void
  solutionOverviewStat5Value: string
  setSolutionOverviewStat5Value: (v: string) => void
  solutionOverviewStat5Label: string
  setSolutionOverviewStat5Label: (v: string) => void

  // Page 3
  solutionOverviewBenefits: SolutionOverviewBenefit[]
  setSolutionOverviewBenefit: (index: number, value: SolutionOverviewBenefit) => void
  addSolutionOverviewBenefit: () => void
  removeSolutionOverviewBenefit: (index: number) => void
  solutionOverviewFeatures: SolutionOverviewFeature[]
  setSolutionOverviewFeature: (index: number, value: SolutionOverviewFeature) => void
  addSolutionOverviewFeature: () => void
  removeSolutionOverviewFeature: (index: number) => void
  solutionOverviewScreenshotUrl: string | null
  setSolutionOverviewScreenshotUrl: (v: string | null) => void
  solutionOverviewScreenshotPosition: { x: number; y: number }
  setSolutionOverviewScreenshotPosition: (v: { x: number; y: number }) => void
  solutionOverviewScreenshotZoom: number
  setSolutionOverviewScreenshotZoom: (v: number) => void
  solutionOverviewScreenshotGrayscale: boolean
  setSolutionOverviewScreenshotGrayscale: (v: boolean) => void
  solutionOverviewCtaOption: 'demo' | 'learn' | 'start' | 'contact'
  setSolutionOverviewCtaOption: (v: 'demo' | 'learn' | 'start' | 'contact') => void
  solutionOverviewCtaUrl: string
  setSolutionOverviewCtaUrl: (v: string) => void

  // Image library modal triggers from parent
  setShowImageLibrary: (v: boolean) => void
  setSelectingSOScreenshot: (v: boolean) => void
}

/**
 * Form controls for the Solution Overview PDF editor.
 * Renders the left-panel controls for pages 1, 2, and 3.
 *
 * Modals (hero image library, icon picker, crop modals) are managed
 * internally to keep modal state self-contained.
 */
export function SolutionOverviewEditorControls(props: SolutionOverviewEditorControlsProps) {
  const {
    solutionOverviewSolution,
    setSolutionOverviewSolution,
    solutionOverviewSolutionName,
    setSolutionOverviewSolutionName,
    solutionOverviewTagline,
    setSolutionOverviewTagline,
    solutionOverviewCurrentPage,
    solutionOverviewHeroImageUrl,
    setSolutionOverviewHeroImageUrl,
    solutionOverviewHeroImagePosition,
    setSolutionOverviewHeroImagePosition,
    solutionOverviewHeroImageZoom,
    setSolutionOverviewHeroImageZoom,
    solutionOverviewHeroImageGrayscale,
    setSolutionOverviewHeroImageGrayscale,
    solutionOverviewPage2Header,
    setSolutionOverviewPage2Header,
    solutionOverviewSectionHeader,
    setSolutionOverviewSectionHeader,
    solutionOverviewIntroParagraph,
    setSolutionOverviewIntroParagraph,
    solutionOverviewKeySolutions,
    setSolutionOverviewKeySolution,
    addSolutionOverviewKeySolution,
    removeSolutionOverviewKeySolution,
    solutionOverviewQuoteText,
    setSolutionOverviewQuoteText,
    solutionOverviewQuoteName,
    setSolutionOverviewQuoteName,
    solutionOverviewQuoteTitle,
    setSolutionOverviewQuoteTitle,
    solutionOverviewQuoteCompany,
    setSolutionOverviewQuoteCompany,
    solutionOverviewStat1Value,
    setSolutionOverviewStat1Value,
    solutionOverviewStat1Label,
    setSolutionOverviewStat1Label,
    solutionOverviewStat2Value,
    setSolutionOverviewStat2Value,
    solutionOverviewStat2Label,
    setSolutionOverviewStat2Label,
    solutionOverviewStat3Value,
    setSolutionOverviewStat3Value,
    solutionOverviewStat3Label,
    setSolutionOverviewStat3Label,
    solutionOverviewStat4Value,
    setSolutionOverviewStat4Value,
    solutionOverviewStat4Label,
    setSolutionOverviewStat4Label,
    solutionOverviewStat5Value,
    setSolutionOverviewStat5Value,
    solutionOverviewStat5Label,
    setSolutionOverviewStat5Label,
    solutionOverviewBenefits,
    setSolutionOverviewBenefit,
    addSolutionOverviewBenefit,
    removeSolutionOverviewBenefit,
    solutionOverviewFeatures,
    setSolutionOverviewFeature,
    addSolutionOverviewFeature,
    removeSolutionOverviewFeature,
    solutionOverviewScreenshotUrl,
    setSolutionOverviewScreenshotUrl,
    solutionOverviewScreenshotPosition,
    setSolutionOverviewScreenshotPosition,
    solutionOverviewScreenshotZoom,
    setSolutionOverviewScreenshotZoom,
    solutionOverviewScreenshotGrayscale,
    setSolutionOverviewScreenshotGrayscale,
    solutionOverviewCtaOption,
    setSolutionOverviewCtaOption,
    solutionOverviewCtaUrl,
    setSolutionOverviewCtaUrl,
    setShowImageLibrary,
    setSelectingSOScreenshot,
  } = props

  // Internal modal state
  const [showHeroImageLibrary, setShowHeroImageLibrary] = useState(false)
  const [showIconLibrary, setShowIconLibrary] = useState(false)
  const [activeBenefitForIcon, setActiveBenefitForIcon] = useState<number | null>(null)
  const [showSOHeroCropModal, setShowSOHeroCropModal] = useState(false)
  const [showSOScreenshotCropModal, setShowSOScreenshotCropModal] = useState(false)

  return (
    <>
      {/* SO-specific Modals */}

      {/* Solution Overview Hero Image Library Modal */}
      {showHeroImageLibrary && (
        <SolutionOverviewImageLibraryModal
          solution={solutionOverviewSolution}
          onSelect={(url) => {
            setSolutionOverviewHeroImageUrl(url)
            setShowHeroImageLibrary(false)
          }}
          onClose={() => setShowHeroImageLibrary(false)}
        />
      )}

      {/* Icon Picker Modal for benefit icons */}
      {showIconLibrary && (
        <IconPickerModal
          value={activeBenefitForIcon !== null ? solutionOverviewBenefits[activeBenefitForIcon]?.icon : undefined}
          onChange={(iconName) => {
            if (activeBenefitForIcon !== null) {
              const benefit = solutionOverviewBenefits[activeBenefitForIcon]
              if (benefit) {
                setSolutionOverviewBenefit(activeBenefitForIcon, { ...benefit, icon: iconName })
              }
            }
            setShowIconLibrary(false)
            setActiveBenefitForIcon(null)
          }}
          onClose={() => {
            setShowIconLibrary(false)
            setActiveBenefitForIcon(null)
          }}
        />
      )}

      {/* Solution Overview Hero Image Crop Modal */}
      {solutionOverviewHeroImageUrl && (
        <ImageCropModal
          isOpen={showSOHeroCropModal}
          onClose={() => setShowSOHeroCropModal(false)}
          imageSrc={solutionOverviewHeroImageUrl}
          frameWidth={382}
          frameHeight={180}
          initialPosition={solutionOverviewHeroImagePosition}
          initialZoom={solutionOverviewHeroImageZoom}
          onSave={(position, zoom) => {
            setSolutionOverviewHeroImagePosition(position)
            setSolutionOverviewHeroImageZoom(zoom)
          }}
        />
      )}

      {/* Solution Overview Screenshot Crop Modal */}
      {solutionOverviewScreenshotUrl && (
        <ImageCropModal
          isOpen={showSOScreenshotCropModal}
          onClose={() => setShowSOScreenshotCropModal(false)}
          imageSrc={solutionOverviewScreenshotUrl}
          frameWidth={230}
          frameHeight={230}
          initialPosition={solutionOverviewScreenshotPosition}
          initialZoom={solutionOverviewScreenshotZoom}
          onSave={(position, zoom) => {
            setSolutionOverviewScreenshotPosition(position)
            setSolutionOverviewScreenshotZoom(zoom)
          }}
        />
      )}

      {/* Form Controls */}
      <div className="space-y-4">
        {/* Page 1 Controls (Cover) */}
        {solutionOverviewCurrentPage === 1 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-content-secondary">Cover Page</h4>

            {/* Solution Category */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Solution Category</label>
              <select
                value={solutionOverviewSolution}
                onChange={(e) => setSolutionOverviewSolution(e.target.value as SolutionCategory)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(solutionCategories).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Solution Name */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Solution Name</label>
              <input
                type="text"
                value={solutionOverviewSolutionName}
                onChange={(e) => setSolutionOverviewSolutionName(e.target.value)}
                placeholder="Employee Health Essentials"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-1 text-xs text-gray-400 text-right">
                {solutionOverviewSolutionName.length}/60
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tagline</label>
              <input
                type="text"
                value={solutionOverviewTagline}
                onChange={(e) => setSolutionOverviewTagline(e.target.value)}
                placeholder="Built for Healthcare. Ready for You."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-1 text-xs text-gray-400 text-right">
                {solutionOverviewTagline.length}/80
              </div>
            </div>
          </div>
        )}

        {/* Page 2 Controls (Body) */}
        {solutionOverviewCurrentPage === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-content-secondary">Body Page</h4>

            {/* Hero Image Upload */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hero Image</label>
              {!solutionOverviewHeroImageUrl ? (
                <div className="flex gap-2">
                  {/* Upload box */}
                  <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16 hover:border-gray-400 dark:hover:border-line-focus transition-colors">
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer text-xs text-gray-500 dark:text-content-secondary">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader()
                            reader.onload = () => {
                              setSolutionOverviewHeroImageUrl(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="hidden"
                      />
                      <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Drop or upload
                    </label>
                  </div>
                  {/* Library box */}
                  <button
                    onClick={() => setShowHeroImageLibrary(true)}
                    className="flex-1 border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg h-16
                      hover:border-gray-400 dark:hover:border-line-focus transition-colors
                      flex flex-col items-center justify-center text-xs text-gray-500 dark:text-content-secondary"
                  >
                    <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose from library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Image preview - click to adjust */}
                  <div className="relative">
                    <div
                      onClick={() => setShowSOHeroCropModal(true)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                      style={{ width: 280, height: 132 }}
                    >
                      <img
                        src={solutionOverviewHeroImageUrl}
                        alt="Hero image"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${50 - solutionOverviewHeroImagePosition.x}% ${50 - solutionOverviewHeroImagePosition.y}%`,
                          transform: solutionOverviewHeroImageZoom !== 1 ? `scale(${solutionOverviewHeroImageZoom})` : undefined,
                        }}
                      />
                    </div>
                    {/* Adjust button */}
                    <button
                      onClick={() => setShowSOHeroCropModal(true)}
                      className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                    >
                      Adjust
                    </button>
                  </div>
                  {/* Grayscale toggle */}
                  <ToggleSwitch
                    label="Grayscale"
                    checked={solutionOverviewHeroImageGrayscale}
                    onChange={() => setSolutionOverviewHeroImageGrayscale(!solutionOverviewHeroImageGrayscale)}
                  />
                  {/* Replace/Remove buttons */}
                  <div className="flex gap-2">
                    {/* Replace with upload */}
                    <div className="flex-1 border border-gray-300 dark:border-line-subtle rounded-lg overflow-hidden">
                      <label className="flex items-center justify-center gap-1 h-8 cursor-pointer text-xs text-gray-500 dark:text-content-secondary hover:bg-gray-50 dark:hover:bg-interactive-hover transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file && file.type.startsWith('image/')) {
                              const reader = new FileReader()
                              reader.onload = () => {
                                setSolutionOverviewHeroImageUrl(reader.result as string)
                                setSolutionOverviewHeroImagePosition({ x: 0, y: 0 })
                                setSolutionOverviewHeroImageZoom(1)
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="hidden"
                        />
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload new
                      </label>
                    </div>
                    {/* Replace from library */}
                    <button
                      onClick={() => setShowHeroImageLibrary(true)}
                      className="flex-1 flex items-center justify-center gap-1 h-8 border border-gray-300 dark:border-line-subtle rounded-lg text-xs text-gray-500 dark:text-content-secondary hover:bg-gray-50 dark:hover:bg-interactive-hover transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      From library
                    </button>
                    {/* Remove button */}
                    <button
                      onClick={() => {
                        setSolutionOverviewHeroImageUrl(null)
                        setSolutionOverviewHeroImagePosition({ x: 0, y: 0 })
                        setSolutionOverviewHeroImageZoom(1)
                        setSolutionOverviewHeroImageGrayscale(false)
                      }}
                      className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-line-subtle rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Page 2 Header (H1 in header band) */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Page Header</label>
              <input
                type="text"
                value={solutionOverviewPage2Header}
                onChange={(e) => setSolutionOverviewPage2Header(e.target.value)}
                placeholder="Employee Health Essentials"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-1 text-xs text-gray-400 text-right">
                {solutionOverviewPage2Header.length}/60
              </div>
            </div>

            {/* Section Header */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Section Header</label>
              <textarea
                value={solutionOverviewSectionHeader}
                onChange={(e) => setSolutionOverviewSectionHeader(e.target.value)}
                placeholder="Streamline Employee Health.\nStrengthen Compliance."
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
              <div className="mt-1 text-xs text-gray-400 text-right">
                {solutionOverviewSectionHeader.length}/80
              </div>
            </div>

            {/* Intro Paragraph */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Intro Paragraph</label>
              <textarea
                value={solutionOverviewIntroParagraph}
                onChange={(e) => setSolutionOverviewIntroParagraph(e.target.value)}
                placeholder="Enter introduction text..."
                rows={7}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
              <div className={`mt-1 text-xs text-right ${solutionOverviewIntroParagraph.length > 500 ? 'text-orange-500' : 'text-gray-400'}`}>
                {solutionOverviewIntroParagraph.length}/500
              </div>
            </div>

            {/* Key Solutions */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">Key Solutions ({solutionOverviewKeySolutions.length} items)</label>
              <div className="space-y-2">
                {solutionOverviewKeySolutions.map((solution, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={solution}
                      onChange={(e) => setSolutionOverviewKeySolution(index, e.target.value)}
                      placeholder={`Solution ${index + 1}`}
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {solutionOverviewKeySolutions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSolutionOverviewKeySolution(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove solution"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSolutionOverviewKeySolution}
                className="mt-2 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Key Solution
              </button>
            </div>

            {/* Quote Section */}
            <div className="border-t border-gray-200 dark:border-line-subtle pt-4">
              <label className="block text-xs text-gray-500 mb-2">Quote Section</label>

              {/* Quote Text */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">Quote</label>
                <textarea
                  value={solutionOverviewQuoteText}
                  onChange={(e) => setSolutionOverviewQuoteText(e.target.value)}
                  placeholder="Enter customer quote..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                />
                <div className={`mt-1 text-xs text-right ${solutionOverviewQuoteText.length > 350 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {solutionOverviewQuoteText.length}/350
                </div>
              </div>

              {/* Quote Attribution - vertical stack */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={solutionOverviewQuoteName}
                    onChange={(e) => setSolutionOverviewQuoteName(e.target.value)}
                    placeholder="Firstname Lastname"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={solutionOverviewQuoteTitle}
                    onChange={(e) => setSolutionOverviewQuoteTitle(e.target.value)}
                    placeholder="Job Title"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Organization</label>
                  <input
                    type="text"
                    value={solutionOverviewQuoteCompany}
                    onChange={(e) => setSolutionOverviewQuoteCompany(e.target.value)}
                    placeholder="Company Name"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer Stats Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-line-subtle">
              <h4 className="text-sm font-medium text-gray-700 dark:text-content-secondary mb-3">Footer Stats</h4>
              <div className="grid grid-cols-5 gap-2">
                {/* Stat 1 */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={solutionOverviewStat1Value}
                    onChange={(e) => setSolutionOverviewStat1Value(e.target.value)}
                    placeholder="20+"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                  <input
                    type="text"
                    value={solutionOverviewStat1Label}
                    onChange={(e) => setSolutionOverviewStat1Label(e.target.value)}
                    placeholder="Awards"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                </div>
                {/* Stat 2 */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={solutionOverviewStat2Value}
                    onChange={(e) => setSolutionOverviewStat2Value(e.target.value)}
                    placeholder="350+"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                  <input
                    type="text"
                    value={solutionOverviewStat2Label}
                    onChange={(e) => setSolutionOverviewStat2Label(e.target.value)}
                    placeholder="Experts"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                </div>
                {/* Stat 3 */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={solutionOverviewStat3Value}
                    onChange={(e) => setSolutionOverviewStat3Value(e.target.value)}
                    placeholder="100%"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                  <input
                    type="text"
                    value={solutionOverviewStat3Label}
                    onChange={(e) => setSolutionOverviewStat3Label(e.target.value)}
                    placeholder="Deployment"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                </div>
                {/* Stat 4 */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={solutionOverviewStat4Value}
                    onChange={(e) => setSolutionOverviewStat4Value(e.target.value)}
                    placeholder="2M+"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                  <input
                    type="text"
                    value={solutionOverviewStat4Label}
                    onChange={(e) => setSolutionOverviewStat4Label(e.target.value)}
                    placeholder="End Users"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                </div>
                {/* Stat 5 */}
                <div className="space-y-1">
                  <input
                    type="text"
                    value={solutionOverviewStat5Value}
                    onChange={(e) => setSolutionOverviewStat5Value(e.target.value)}
                    placeholder="1.2K"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                  <input
                    type="text"
                    value={solutionOverviewStat5Label}
                    onChange={(e) => setSolutionOverviewStat5Label(e.target.value)}
                    placeholder="Clients"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 3 Controls (Benefits & Features) */}
        {solutionOverviewCurrentPage === 3 && (
          <div className="space-y-4">
            {/* Key Benefits Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-content-secondary">Key Benefits</h4>
                <span className="text-xs text-gray-400">{solutionOverviewBenefits.length}/7</span>
              </div>
              <div className="space-y-3">
                {solutionOverviewBenefits.map((benefit, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg space-y-2">
                    {/* Row 1: Icon picker + Title + X button */}
                    <div className="flex items-center gap-2">
                      {/* Icon Picker - same height as input */}
                      {(() => {
                        const IconComponent = benefit.icon ? getIconByName(benefit.icon) : null
                        return (
                          <button
                            onClick={() => {
                              setActiveBenefitForIcon(index)
                              setShowIconLibrary(true)
                            }}
                            className="flex-shrink-0 w-8 h-8 bg-white dark:bg-surface-tertiary border border-gray-300 dark:border-line-subtle rounded flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                            title={benefit.icon ? `Icon: ${benefit.icon.replace(/-/g, ' ')}` : 'Select icon'}
                          >
                            {IconComponent ? (
                              <IconComponent className="w-4 h-4 text-gray-600 dark:text-content-secondary" />
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                              </svg>
                            )}
                          </button>
                        )
                      })()}
                      {/* Title input */}
                      <input
                        type="text"
                        value={benefit.title}
                        onChange={(e) => setSolutionOverviewBenefit(index, { ...benefit, title: e.target.value })}
                        placeholder="Benefit title"
                        className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-surface-tertiary border border-gray-300 dark:border-line-subtle rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {/* X button - only show when more than 3 benefits */}
                      {solutionOverviewBenefits.length > 3 && (
                        <button
                          onClick={() => removeSolutionOverviewBenefit(index)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove benefit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {/* Row 2: Description - full width */}
                    <textarea
                      value={benefit.description}
                      onChange={(e) => setSolutionOverviewBenefit(index, { ...benefit, description: e.target.value })}
                      placeholder="Description"
                      rows={4}
                      className="w-full px-2 py-1.5 text-sm bg-white dark:bg-surface-tertiary border border-gray-300 dark:border-line-subtle rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                ))}
              </div>
              {solutionOverviewBenefits.length < 7 && (
                <button
                  onClick={addSolutionOverviewBenefit}
                  className="mt-2 w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  + Add Benefit
                </button>
              )}
            </div>

            {/* Image */}
            <div className="pt-4 border-t border-gray-200 dark:border-line-subtle">
              <h4 className="text-sm font-medium text-gray-700 dark:text-content-secondary mb-2">Image</h4>
              {!solutionOverviewScreenshotUrl ? (
                <div className="flex gap-2">
                  <label className="flex-1 aspect-[200/120] border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader()
                          reader.onload = () => {
                            setSolutionOverviewScreenshotUrl(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Upload</span>
                    </div>
                  </label>
                  <button
                    onClick={() => { setSelectingSOScreenshot(true); setShowImageLibrary(true) }}
                    className="flex-1 aspect-[200/120] border-2 border-dashed border-gray-300 dark:border-line-subtle rounded-lg cursor-pointer hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-gray-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="text-sm">Library</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Image preview - click to adjust */}
                  <div className="relative">
                    <div
                      onClick={() => setShowSOScreenshotCropModal(true)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-gray-300 hover:border-blue-400 transition-colors"
                      style={{ width: 168, height: 168 }}
                    >
                      <img
                        src={solutionOverviewScreenshotUrl}
                        alt="Image"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `${50 - solutionOverviewScreenshotPosition.x}% ${50 - solutionOverviewScreenshotPosition.y}%`,
                          transform: solutionOverviewScreenshotZoom !== 1 ? `scale(${solutionOverviewScreenshotZoom})` : undefined,
                        }}
                      />
                    </div>
                    {/* Adjust + Library buttons */}
                    <button
                      onClick={() => setShowSOScreenshotCropModal(true)}
                      className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                    >
                      Adjust
                    </button>
                    <button
                      onClick={() => { setSelectingSOScreenshot(true); setShowImageLibrary(true) }}
                      className="absolute bottom-1 left-16 px-2 py-0.5 bg-black/60 rounded text-white text-xs hover:bg-black/80 transition-colors z-20"
                    >
                      Library
                    </button>
                    {/* Remove button */}
                    <button
                      onClick={() => {
                        setSolutionOverviewScreenshotUrl(null)
                        setSolutionOverviewScreenshotPosition({ x: 0, y: 0 })
                        setSolutionOverviewScreenshotZoom(1)
                        setSolutionOverviewScreenshotGrayscale(false)
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                      title="Remove image"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Grayscale toggle */}
                  <ToggleSwitch
                    label="Grayscale"
                    checked={solutionOverviewScreenshotGrayscale}
                    onChange={() => setSolutionOverviewScreenshotGrayscale(!solutionOverviewScreenshotGrayscale)}
                  />
                </div>
              )}
            </div>

            {/* Powerful Features Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-line-subtle">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-content-secondary">Powerful Features</h4>
                <span className="text-xs text-gray-400">{solutionOverviewFeatures.length} features</span>
              </div>
              <div className="space-y-3">
                {solutionOverviewFeatures.map((feature, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-surface-secondary rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => setSolutionOverviewFeature(index, { ...feature, title: e.target.value })}
                          placeholder="Feature title"
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-surface-tertiary border border-gray-300 dark:border-line-subtle rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => setSolutionOverviewFeature(index, { ...feature, description: e.target.value })}
                          placeholder="Description"
                          rows={3}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-surface-tertiary border border-gray-300 dark:border-line-subtle rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                      {solutionOverviewFeatures.length > 1 && (
                        <button
                          onClick={() => removeSolutionOverviewFeature(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove feature"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addSolutionOverviewFeature}
                className="mt-2 w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                + Add Feature
              </button>
            </div>

            {/* CTA Option */}
            <div className="pt-4 border-t border-gray-200 dark:border-line-subtle space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-content-secondary">Call to Action</h4>
              <select
                value={solutionOverviewCtaOption}
                onChange={(e) => setSolutionOverviewCtaOption(e.target.value as 'demo' | 'learn' | 'start' | 'contact')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ctaOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              <div>
                <label className="block text-xs text-gray-500 mb-1">CTA Link URL</label>
                <input
                  type="url"
                  value={solutionOverviewCtaUrl}
                  onChange={(e) => setSolutionOverviewCtaUrl(e.target.value)}
                  placeholder="https://cority.com/request-demo"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-secondary border border-gray-300 dark:border-line-subtle rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                />
                <p className="mt-1 text-xs text-gray-400">This link will be clickable in the exported PDF</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
