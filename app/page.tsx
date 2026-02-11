'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { useStore } from '@/store'
import { AssetSelectionScreen } from '@/components/AssetSelectionScreen'
import { AutoCreateContentScreen, AutoCreateAssetsScreen, AutoCreateGeneratingScreen } from '@/components/AutoCreate'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DraftBanner } from '@/components/DraftBanner'
import { Header } from '@/components/Header'
import { ReportBugModal, ReportBugLink } from '@/components/ReportBugModal'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentScreen, setCurrentScreen } = useStore()
  const [showBugModal, setShowBugModal] = useState(false)

  // Handle redirect message
  const message = searchParams.get('message')

  // Redirect to /editor for editor screens
  useEffect(() => {
    if (currentScreen === 'editor' || currentScreen === 'queue' || currentScreen === 'auto-create-editor') {
      router.push('/editor')
    }
  }, [currentScreen, router])

  // Auto-create flow screens use medium width
  const isAutoCreateFlow = currentScreen === 'auto-create-content' || currentScreen === 'auto-create-assets' || currentScreen === 'auto-create-generating'
  const isSelectScreen = currentScreen === 'select'

  // Derive screen name for bug reports
  const getScreenName = () => {
    switch (currentScreen) {
      case 'select': return 'Homepage'
      case 'auto-create-content': return 'Content Source'
      case 'auto-create-assets': return 'Asset Selection'
      case 'auto-create-generating': return 'Generating Assets'
      default: return 'Homepage'
    }
  }

  const handleLogoClick = () => {
    setCurrentScreen('select')
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Draft Banner */}
      {isSelectScreen && <DraftBanner />}

      {/* No project message */}
      {message === 'no-project' && isSelectScreen && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              No active project found. Select a template to get started.
            </p>
          </div>
        </div>
      )}

      <Header
        onLogoClick={handleLogoClick}
        rightContent={
          <div className="flex items-center gap-3">
            <ReportBugLink onClick={() => setShowBugModal(true)} />
            <ThemeToggle />
          </div>
        }
        maxWidth={isSelectScreen ? 'max-w-[1600px]' : 'max-w-5xl'}
      />

      {/* Bug Report Modal */}
      {showBugModal && (
        <ReportBugModal
          screenName={getScreenName()}
          onClose={() => setShowBugModal(false)}
        />
      )}

      {/* Main content */}
      <div className={`${isSelectScreen ? 'max-w-[1600px]' : 'max-w-5xl'} mx-auto px-6 py-8`}>
        {currentScreen === 'select' && <AssetSelectionScreen />}
        {currentScreen === 'auto-create-content' && <AutoCreateContentScreen />}
        {currentScreen === 'auto-create-assets' && <AutoCreateAssetsScreen />}
        {currentScreen === 'auto-create-generating' && <AutoCreateGeneratingScreen />}
      </div>

      {/* Analytics - only on homepage */}
      <Analytics />
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
