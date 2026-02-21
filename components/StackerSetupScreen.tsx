'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { useStore } from '@/store'

export function StackerSetupScreen() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setCurrentScreen, reset, clearDraft, setStackerGeneratedModules, setStackerDocumentTitle } = useStore()

  // Input mode: 'upload' or 'text'
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload')

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Text input state
  const [textContent, setTextContent] = useState('')

  // Purpose field (optional)
  const [purpose, setPurpose] = useState('')

  // Processing state
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Theme detection
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const handleFileSelect = (file: File) => {
    const validTypes = ['application/pdf']
    const validExtensions = ['.pdf']
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (validTypes.includes(file.type) || hasValidExtension) {
      setUploadedFile(file)
      setError(null)
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const canGenerate = inputMode === 'upload' ? !!uploadedFile : textContent.trim().length > 50

  const handleGenerate = async () => {
    if (!canGenerate) return

    setIsGenerating(true)
    setError(null)

    try {
      let sourceContent = ''

      if (inputMode === 'upload' && uploadedFile) {
        // Upload PDF to Vercel Blob
        const blob = await upload(`stacker-pdfs/${Date.now()}-${uploadedFile.name}`, uploadedFile, {
          access: 'public',
          handleUploadUrl: '/api/upload-pdf',
        })

        // Parse PDF to extract text
        const parseResponse = await fetch('/api/parse-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdfUrl: blob.url, fileSize: uploadedFile.size }),
        })

        if (!parseResponse.ok) {
          const errorData = await parseResponse.json()
          throw new Error(errorData.error || 'Failed to parse PDF')
        }

        const parseResult = await parseResponse.json()
        sourceContent = parseResult.rawSummary || parseResult.summary || ''
      } else {
        sourceContent = textContent
      }

      // Call AI to generate the Stacker document
      const generateResponse = await fetch('/api/generate-stacker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceContent, purpose }),
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || 'Failed to generate document')
      }

      const result = await generateResponse.json()

      // Store the generated modules and document title
      setStackerGeneratedModules(result.modules)
      setStackerDocumentTitle(result.documentTitle)

      // Navigate to stacker editor
      setCurrentScreen('stacker-editor')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    clearDraft()
    reset()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to templates
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-gray-900 dark:text-white mb-2">
          Stacker
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">
          Upload source content and AI will generate a structured document for you.
        </p>

        {/* Section 1: Input Mode Toggle */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Content Source
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                inputMode === 'upload'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Upload PDF
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                inputMode === 'text'
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {/* Section 2: Content Input */}
        <div className="mb-8">
          {inputMode === 'upload' ? (
            // PDF Upload
            <>
              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                    ${isDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Upload a PDF</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Product briefs, whitepapers, press releases, etc.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // File uploaded state
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9h4v2h-4v-2zm0 3h4v2h-4v-2zm-2-3H7v2h1v-2zm0 3H7v2h1v-2z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Text paste
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your source content here... (press releases, product descriptions, key messages, talking points, etc.)"
              className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              style={{ backgroundColor: isDark ? '#000000' : 'white' }}
            />
          )}
        </div>

        {/* Section 3: Purpose (optional) */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What's this for?
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">(optional)</span>
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g., Sales leave-behind for CFOs, Executive summary of Q4 results, Event follow-up for attendees..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            style={{ backgroundColor: isDark ? '#000000' : 'white' }}
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Helps the AI understand tone, audience, and structure
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className={`
            w-full py-4 rounded-xl text-base font-medium transition-all flex items-center justify-center gap-2
            ${canGenerate && !isGenerating
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}
          `}
        >
          {isGenerating ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing content...
            </>
          ) : (
            <>
              Generate Stacker
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        {/* Helper text */}
        {inputMode === 'text' && textContent.length > 0 && textContent.length < 50 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
            Add more content for better results (minimum 50 characters)
          </p>
        )}
      </div>
    </div>
  )
}

export default StackerSetupScreen
