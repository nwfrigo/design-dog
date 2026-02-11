'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { hasDraft } from '@/lib/draft-storage'
import { EditorLayout } from '@/components/EditorLayout'
import { EditorScreen } from '@/components/EditorScreen'
import { AutoCreateEditor } from '@/components/QuickStartEditor'
import { ExportQueueScreen } from '@/components/ExportQueueScreen'
import { SolutionOverviewExportScreen } from '@/components/SolutionOverviewExportScreen'
import { SolutionOverviewSetupScreen } from '@/components/SolutionOverviewSetupScreen'
import { FaqEditorScreen } from '@/components/FaqEditorScreen'

export default function EditorPage() {
  const router = useRouter()
  const { loadDraft, generatedAssets, selectedAssets, currentScreen, setCurrentScreen } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [hasValidDraft, setHasValidDraft] = useState(false)

  useEffect(() => {
    // Check for draft and load it
    if (hasDraft()) {
      const loaded = loadDraft()
      if (loaded) {
        setHasValidDraft(true)
      } else {
        // No valid draft, redirect to homepage
        router.replace('/?message=no-project')
      }
    } else {
      // No draft at all, redirect to homepage
      router.replace('/?message=no-project')
    }
    setIsLoading(false)
  }, [loadDraft, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading your project...</p>
        </div>
      </div>
    )
  }

  // No valid draft (will redirect)
  if (!hasValidDraft) {
    return null
  }

  // Determine which editor view to show based on state
  const hasGeneratedAssets = Object.keys(generatedAssets).length > 0
  const isQueueScreen = currentScreen === 'queue'
  const isSolutionOverviewExport = currentScreen === 'solution-overview-export'
  const isSolutionOverviewSetup = currentScreen === 'solution-overview-setup'
  const isFaqEditor = currentScreen === 'faq-editor'

  // Solution Overview Setup screen has its own layout (no EditorLayout wrapper)
  if (isSolutionOverviewSetup) {
    return <SolutionOverviewSetupScreen />
  }

  // FAQ Editor has its own layout
  if (isFaqEditor) {
    return <FaqEditorScreen />
  }

  return (
    <EditorLayout>
      {isSolutionOverviewExport ? (
        <SolutionOverviewExportScreen />
      ) : isQueueScreen ? (
        <ExportQueueScreen />
      ) : hasGeneratedAssets ? (
        <AutoCreateEditor />
      ) : (
        <EditorScreen />
      )}
    </EditorLayout>
  )
}
