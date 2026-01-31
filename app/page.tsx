'use client'

import { useStore } from '@/store'
import { AssetSelectionScreen } from '@/components/AssetSelectionScreen'
import { EditorScreen } from '@/components/EditorScreen'
import { ExportQueueScreen } from '@/components/ExportQueueScreen'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const { currentScreen } = useStore()

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
            Design Dog
          </h1>

          {/* Settings Area */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {currentScreen === 'select' && <AssetSelectionScreen />}
        {currentScreen === 'editor' && <EditorScreen />}
        {currentScreen === 'queue' && <ExportQueueScreen />}
      </div>
    </main>
  )
}
