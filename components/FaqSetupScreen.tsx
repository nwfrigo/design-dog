'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { useStore } from '@/store'
import type { SolutionCategory, FaqPage } from '@/types'
import { solutionCategories } from '@/config/solution-overview-assets'

// FAQ categories (excluding converged, same as FAQ editor)
const faqCategories: SolutionCategory[] = ['environmental', 'health', 'safety', 'quality', 'sustainability']

export function FaqSetupScreen() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    faqTitle,
    setFaqTitle,
    faqCoverSolution,
    setFaqCoverSolution,
    setFaqPages,
    setFaqCoverSubheader,
    setCurrentScreen,
    saveDraft,
    reset,
    clearDraft,
  } = useStore()

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Unselected color based on theme
  const unselectedColor = isDark ? '#37393D' : '#dddddd'

  const handleCategorySelect = (category: SolutionCategory) => {
    setFaqCoverSolution(category)
  }

  const handleFileSelect = (file: File) => {
    // Accept Word docs (.doc, .docx) and PDFs
    const validTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ]
    const validExtensions = ['.doc', '.docx', '.pdf']
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (validTypes.includes(file.type) || hasValidExtension) {
      setUploadedFile(file)
      setParseError(null)
    } else {
      alert('Please upload a Word document (.doc, .docx) or PDF (.pdf)')
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
    setParseError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Parse the uploaded document and populate FAQ pages
  const parseAndPopulate = async (file: File): Promise<boolean> => {
    setIsParsing(true)
    setParseError(null)

    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf')
      const uploadEndpoint = isPdf ? '/api/upload-pdf' : '/api/upload-doc'
      const folderName = isPdf ? 'faq-pdfs' : 'faq-docs'

      // Upload to Vercel Blob
      const blob = await upload(`${folderName}/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: uploadEndpoint,
      })

      // Call parse API
      const response = await fetch('/api/parse-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docUrl: blob.url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse document')
      }

      // Populate FAQ pages from extracted content
      if (data.pages && data.pages.length > 0) {
        // Map the parsed blocks to proper FaqPage structure with correct types
        const typedPages: FaqPage[] = data.pages.map((page: {
          id: string
          blocks: Array<{
            type: 'heading' | 'qa' | 'table'
            id: string
            text?: string
            question?: string
            answer?: string
            rows?: number
            cols?: number
            data?: string[][]
          }>
        }) => ({
          id: page.id,
          blocks: page.blocks.map(block => {
            if (block.type === 'heading') {
              return {
                type: 'heading' as const,
                id: block.id,
                text: block.text || '',
              }
            } else if (block.type === 'qa') {
              return {
                type: 'qa' as const,
                id: block.id,
                question: block.question || '',
                answer: block.answer || '',
              }
            } else {
              return {
                type: 'table' as const,
                id: block.id,
                rows: block.rows || 3,
                cols: block.cols || 3,
                data: block.data || [['', '', ''], ['', '', ''], ['', '', '']],
              }
            }
          }),
        }))
        setFaqPages(typedPages)
      }

      return true
    } catch (error) {
      console.error('Error parsing document:', error)
      setParseError(error instanceof Error ? error.message : 'Failed to parse document')
      return false
    } finally {
      setIsParsing(false)
    }
  }

  const handleContinue = async () => {
    // If there's an uploaded file, parse it first
    if (uploadedFile) {
      const success = await parseAndPopulate(uploadedFile)
      if (!success) {
        return // Don't continue if parsing failed
      }
    }

    // Go to FAQ editor
    setCurrentScreen('faq-editor')
    saveDraft()
  }

  const handleSkip = () => {
    // Go directly to editor without parsing (empty template)
    setCurrentScreen('faq-editor')
    saveDraft()
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
          FAQ Document
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">
          Create branded FAQs by uploading an existing document or starting from scratch.
        </p>

        {/* Section 1: Solution Category */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Solution Category
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            {faqCategories.map((category) => {
              const isSelected = faqCoverSolution === category
              const config = solutionCategories[category]

              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="transition-all"
                  style={{
                    padding: '12px 16px',
                    background: isSelected ? 'rgba(0, 127, 255, 0.10)' : 'transparent',
                    borderRadius: 6,
                    border: isSelected ? '1px solid #0080FF' : `1px solid ${unselectedColor}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      background: isSelected ? config.color : unselectedColor,
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: isSelected ? 'white' : unselectedColor,
                      fontSize: 13,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {config.label}
                  </span>
                </button>
              )
            })}
            {/* None option */}
            <button
              onClick={() => setFaqCoverSolution('none')}
              className="transition-all"
              style={{
                padding: '12px 16px',
                background: faqCoverSolution === 'none' ? 'rgba(0, 127, 255, 0.10)' : 'transparent',
                borderRadius: 6,
                border: faqCoverSolution === 'none' ? '1px solid #0080FF' : `1px solid ${unselectedColor}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: faqCoverSolution === 'none' ? '#888' : unselectedColor,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: faqCoverSolution === 'none' ? 'white' : unselectedColor,
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                None
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: FAQ Name */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            FAQ Title
          </label>
          <input
            type="text"
            value={faqTitle}
            onChange={(e) => setFaqTitle(e.target.value)}
            placeholder="Enter FAQ title..."
            className="w-full px-6 py-5 border border-gray-300 dark:border-gray-600 rounded-xl text-3xl font-light text-gray-900 dark:text-gray-100 placeholder-[#37393D] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            style={{ backgroundColor: isDark ? '#000000' : 'white' }}
          />
        </div>

        {/* Section 3: Document Upload */}
        <div className="mb-12">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Source Document
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">(optional)</span>
          </label>

          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Upload a document</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Word (.doc, .docx) or PDF files
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                disabled={isParsing}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Upload an existing FAQ document to auto-populate content, or skip to create from scratch.
          </p>

          {/* Parse Error */}
          {parseError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{parseError}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            disabled={isParsing}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
          >
            Skip, start from scratch
          </button>

          <button
            onClick={handleContinue}
            disabled={isParsing || !uploadedFile}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isParsing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Parsing document...
              </>
            ) : (
              <>
                Continue to Editor
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FaqSetupScreen
