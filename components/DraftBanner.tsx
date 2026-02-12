'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasDraft, getDraftAssetCount, clearDraft, loadDraftFromStorage } from '@/lib/draft-storage'
import { useStore } from '@/store'

export function DraftBanner() {
  const router = useRouter()
  const { reset, setCurrentScreen } = useStore()
  const [showBanner, setShowBanner] = useState(false)
  const [assetCount, setAssetCount] = useState(0)
  const [isFaqDraft, setIsFaqDraft] = useState(false)

  useEffect(() => {
    // Check for draft in localStorage
    if (hasDraft()) {
      setShowBanner(true)
      setAssetCount(getDraftAssetCount())

      // Check if draft is for FAQ template (has faqPages with content)
      const draft = loadDraftFromStorage()
      if (draft) {
        const hasFaqContent = draft.faqPages &&
                              draft.faqPages.length > 0 &&
                              draft.faqPages.some(p => p.blocks && p.blocks.length > 0)
        setIsFaqDraft(hasFaqContent)
      }
    }
  }, [])

  const handleResume = () => {
    if (isFaqDraft) {
      // For FAQ templates, navigate to faq-editor screen
      setCurrentScreen('faq-editor')
      router.push('/editor')
    } else {
      router.push('/editor')
    }
  }

  const handleStartOver = () => {
    clearDraft()
    reset()
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Continue your project
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {assetCount} {assetCount === 1 ? 'asset' : 'assets'} in progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStartOver}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Start Over
          </button>
          <button
            onClick={handleResume}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Resume Editing
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
