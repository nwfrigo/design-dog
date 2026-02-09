'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Header } from '@/components/Header'
import { ReportBugModal, ReportBugLink } from '@/components/ReportBugModal'

interface EditorLayoutProps {
  children: React.ReactNode
}

export function EditorLayout({ children }: EditorLayoutProps) {
  const router = useRouter()
  const mainRef = useRef<HTMLElement>(null)
  const {
    saveDraft,
    generatedAssets,
    selectedAssets,
    setSelectedAssets,
    exportQueue,
    currentScreen,
    setCurrentScreen,
    addAllGeneratedToQueue,
    verbatimCopy,
    templateType,
    eyebrow,
    editingQueueItemId,
    cancelQueueEdit,
  } = useStore()

  // Check if we're editing from queue
  const isEditingFromQueue = !!editingQueueItemId

  // State for cancel confirmation modal when clicking View Queue while editing
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [showSaveToast, setShowSaveToast] = useState(false)
  const [showBugModal, setShowBugModal] = useState(false)

  // Derive screen name for bug reports
  const getScreenName = () => {
    if (currentScreen === 'queue') return 'Export Queue'
    const hasGeneratedAssets = Object.keys(generatedAssets).length > 0
    return hasGeneratedAssets ? 'Editor (Auto-Create)' : 'Editor'
  }

  // Auto-save on changes (using key state values as proxy for all changes)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [
    saveDraft,
    generatedAssets,
    selectedAssets,
    exportQueue,
    verbatimCopy,
    templateType,
    eyebrow,
  ])

  const handleLogoClick = () => {
    saveDraft() // Save before leaving
    setShowSaveToast(true)
    // Set screen to select and navigate after brief delay to show toast
    setTimeout(() => {
      // Clear selectedAssets when returning home - user unlikely to want same selection
      setSelectedAssets([])
      setCurrentScreen('select')
      router.push('/')
    }, 800)
  }

  // Auto-hide toast
  useEffect(() => {
    if (showSaveToast) {
      const timer = setTimeout(() => setShowSaveToast(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showSaveToast])

  const handleExportAll = () => {
    addAllGeneratedToQueue()
    setCurrentScreen('queue')
  }

  const handleViewQueue = () => {
    // If editing from queue, show confirmation modal instead
    if (isEditingFromQueue) {
      setShowCancelConfirm(true)
      return
    }
    setCurrentScreen('queue')
  }

  const handleBackToEditor = () => {
    const hasGeneratedAssets = Object.keys(generatedAssets).length > 0
    setCurrentScreen(hasGeneratedAssets ? 'auto-create-editor' : 'editor')
  }

  const assetCount = Math.max(
    Object.keys(generatedAssets).length,
    selectedAssets.length
  )

  const isQueueScreen = currentScreen === 'queue'
  const isSolutionOverviewExport = currentScreen === 'solution-overview-export'

  const centerContent = isQueueScreen ? (
    <button
      onClick={handleBackToEditor}
      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-1"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to Editor
    </button>
  ) : null

  const rightContent = (
    <>
      {exportQueue.length > 0 && !isQueueScreen && !isSolutionOverviewExport && (
        <button
          onClick={handleViewQueue}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          View Queue ({exportQueue.length})
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      {Object.keys(generatedAssets).length > 0 && !isQueueScreen && !isEditingFromQueue && !isSolutionOverviewExport && (
        <button
          onClick={handleExportAll}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export All
        </button>
      )}
      <ReportBugLink onClick={() => setShowBugModal(true)} />
      <ThemeToggle />
    </>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <Header
        onLogoClick={handleLogoClick}
        centerContent={centerContent}
        rightContent={rightContent}
        scrollContainerRef={mainRef}
      />

      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {children}
        </div>
      </main>

      {/* Save success toast */}
      {showSaveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 px-5 py-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Assets saved
            </span>
          </div>
        </div>
      )}

      {/* Cancel edit confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Discard changes?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your changes will not be saved. The original asset will remain in the queue.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                  bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                  border border-gray-200 dark:border-gray-700 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false)
                  cancelQueueEdit()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg
                  hover:bg-red-600 transition-colors"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {showBugModal && (
        <ReportBugModal
          screenName={getScreenName()}
          onClose={() => setShowBugModal(false)}
        />
      )}
    </div>
  )
}
