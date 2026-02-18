'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { BusinessCardFront, BusinessCardBack } from '@/components/templates/BusinessCard'
import { businessCardPixels, businessCardConfig } from '@/config/print-config'

export function BusinessCardEditorScreen() {
  const router = useRouter()
  const {
    businessCardName,
    businessCardTitle,
    businessCardEmail,
    businessCardPhone,
    businessCardCurrentSide,
    setBusinessCardName,
    setBusinessCardTitle,
    setBusinessCardEmail,
    setBusinessCardPhone,
    setBusinessCardCurrentSide,
    saveDraft,
    clearDraft,
    reset,
  } = useStore()

  const [isExporting, setIsExporting] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  // Handle flip animation
  const handleFlip = (side: 'front' | 'back') => {
    if (side === businessCardCurrentSide) return
    setIsFlipping(true)
    setTimeout(() => {
      setBusinessCardCurrentSide(side)
      setIsFlipping(false)
    }, 150)
  }

  // Handle export
  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Generate filename from name
      const safeName = businessCardName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'business-card'

      // Export front
      const frontResponse = await fetch('/api/export-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'business-card',
          side: 'front',
          name: businessCardName,
          title: businessCardTitle,
          email: businessCardEmail,
          phone: businessCardPhone,
        }),
      })
      if (!frontResponse.ok) throw new Error('Failed to export front')

      const frontBlob = await frontResponse.blob()
      const frontUrl = URL.createObjectURL(frontBlob)
      const frontLink = document.createElement('a')
      frontLink.href = frontUrl
      frontLink.download = `${safeName}-front.pdf`
      frontLink.click()
      URL.revokeObjectURL(frontUrl)

      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500))

      // Export back
      const backResponse = await fetch('/api/export-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: 'business-card',
          side: 'back',
          name: businessCardName, // For filename generation
        }),
      })
      if (!backResponse.ok) throw new Error('Failed to export back')

      const backBlob = await backResponse.blob()
      const backUrl = URL.createObjectURL(backBlob)
      const backLink = document.createElement('a')
      backLink.href = backUrl
      backLink.download = `${safeName}-back.pdf`
      backLink.click()
      URL.revokeObjectURL(backUrl)

    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    clearDraft()
    reset()
    router.push('/')
  }

  // Save draft on field changes
  const handleFieldChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    saveDraft()
  }

  // Card dimensions for preview (scaled down for display)
  const previewScale = 1.5 // Make preview larger than base size for visibility
  const previewWidth = businessCardPixels.baseWidth * previewScale
  const previewHeight = businessCardPixels.baseHeight * previewScale

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left Column - Inputs */}
      <div className="w-full lg:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="p-6">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to templates
          </button>

          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Business Card
          </h2>

          {/* Input fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={businessCardName}
                onChange={(e) => handleFieldChange(setBusinessCardName, e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={businessCardTitle}
                onChange={(e) => handleFieldChange(setBusinessCardTitle, e.target.value)}
                placeholder="Your Title"
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={businessCardEmail}
                onChange={(e) => handleFieldChange(setBusinessCardEmail, e.target.value)}
                placeholder="email@cority.com"
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={businessCardPhone}
                onChange={(e) => handleFieldChange(setBusinessCardPhone, e.target.value)}
                placeholder="555-123-4567"
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Export button */}
          <div className="mt-8">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Front & Back
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Downloads two high-resolution PDFs
            </p>
          </div>

          {/* Print specs info */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Print specs:</span> {businessCardConfig.dimensions.width}" × {businessCardConfig.dimensions.height}" with {businessCardConfig.dimensions.bleed}" bleed at {businessCardConfig.dpi} DPI
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Preview */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-auto">
        <div className="flex flex-col items-center justify-center min-h-full p-8">
          {/* Card preview with flip animation */}
          <div
            className="relative transition-transform duration-150"
            style={{
              width: previewWidth,
              height: previewHeight,
              transform: isFlipping ? 'rotateY(90deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              className="rounded-lg overflow-hidden shadow-2xl cursor-pointer"
              onClick={() => handleFlip(businessCardCurrentSide === 'front' ? 'back' : 'front')}
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              {businessCardCurrentSide === 'front' ? (
                <BusinessCardFront
                  name={businessCardName}
                  title={businessCardTitle}
                  email={businessCardEmail}
                  phone={businessCardPhone}
                />
              ) : (
                <BusinessCardBack />
              )}
            </div>
          </div>

          {/* Flip toggle tabs */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => handleFlip('front')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                businessCardCurrentSide === 'front'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => handleFlip('back')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                businessCardCurrentSide === 'back'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Back
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Click card or use tabs to flip
          </p>
        </div>
      </div>
    </div>
  )
}
