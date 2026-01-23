'use client'

import { useStore } from '@/store'
import { AssetSelectionScreen } from '@/components/AssetSelectionScreen'
import { EditorScreen } from '@/components/EditorScreen'
import { ExportQueueScreen } from '@/components/ExportQueueScreen'

export default function Home() {
  const { currentScreen, exportQueue, goToQueue } = useStore()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Design Dog
          </h1>

          {/* Export Queue Button */}
          <button
            onClick={goToQueue}
            className={`flex items-center gap-2 px-3 py-1.5 font-medium transition-colors ${
              currentScreen === 'queue'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Export Queue
            {exportQueue.length > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {exportQueue.length}
              </span>
            )}
          </button>
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
