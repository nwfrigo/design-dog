'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { useStore } from '@/store'
import { HeaderControls } from '@/components/HeaderControls'
import { useThemeDetection } from '@/hooks/useThemeDetection'

type FileType = 'pdf' | 'docx' | 'pptx' | 'txt' | 'md'

// Loading phrases that cycle during generation
const LOADING_PHASES = {
  upload: [
    'Uploading your file...',
    'Preparing content for analysis...',
  ],
  extract: [
    'Reading your document...',
    'Extracting key information...',
    'Understanding your content...',
  ],
  fetch: [
    'Fetching content from URL...',
    'Retrieving page content...',
  ],
  generate: [
    'Analyzing your content...',
    'Identifying key themes...',
    'Selecting the best modules...',
    'Crafting compelling copy...',
    'Designing document structure...',
    'Polishing the layout...',
    'Validating data accuracy...',
    'Cross-checking figures against source...',
    'Verifying counts and statistics...',
    'Almost there...',
  ],
}

function getFileType(filename: string): FileType | null {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'pdf': return 'pdf'
    case 'docx':
    case 'doc': return 'docx'
    case 'pptx':
    case 'ppt': return 'pptx'
    case 'txt': return 'txt'
    case 'md': return 'md'
    default: return null
  }
}

function getFileIcon(fileType: FileType) {
  switch (fileType) {
    case 'pdf':
      return (
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z"/>
        </svg>
      )
    case 'docx':
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h6v2H9v-2zm0 3h6v2H9v-2z"/>
        </svg>
      )
    case 'pptx':
      return (
        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h2v4H9v-4zm3 0h2v4h-2v-4z"/>
        </svg>
      )
    case 'txt':
    case 'md':
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

// Detect if text looks like a URL
function detectUrl(text: string): string | null {
  const trimmed = text.trim()
  // Check if the entire input (or first line) is a URL
  const firstLine = trimmed.split('\n')[0].trim()

  // Common URL patterns
  const urlPattern = /^https?:\/\/[^\s]+$/i
  if (urlPattern.test(firstLine)) {
    return firstLine
  }

  // Check for URLs without protocol
  const domainPattern = /^(www\.)?[a-z0-9][-a-z0-9]*(\.[a-z]{2,})+[^\s]*$/i
  if (domainPattern.test(firstLine)) {
    return `https://${firstLine}`
  }

  return null
}

export function StackerSetupScreen() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setCurrentScreen, reset, clearDraft, setStackerGeneratedModules, setStackerDocumentTitle, setStackerSourceContent } = useStore()

  // Single text input
  const [textContent, setTextContent] = useState('')

  // Attachment state
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedFileType, setAttachedFileType] = useState<FileType | null>(null)

  // Processing state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingPhase, setGeneratingPhase] = useState<keyof typeof LOADING_PHASES | null>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Cycle through loading phrases
  useEffect(() => {
    if (!isGenerating || !generatingPhase) {
      setPhraseIndex(0)
      return
    }

    const phrases = LOADING_PHASES[generatingPhase]
    if (!phrases || phrases.length <= 1) return

    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length)
    }, 2500) // Change phrase every 2.5 seconds

    return () => clearInterval(interval)
  }, [isGenerating, generatingPhase])

  // Get current loading phrase
  const currentPhrase = generatingPhase
    ? LOADING_PHASES[generatingPhase][phraseIndex] || LOADING_PHASES[generatingPhase][0]
    : ''

  // URL detection state
  const detectedUrl = detectUrl(textContent)

  // Theme detection
  const isDark = useThemeDetection()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [textContent])

  const handleFileSelect = (file: File) => {
    const fileType = getFileType(file.name)
    if (fileType) {
      setAttachedFile(file)
      setAttachedFileType(fileType)
      setError(null)
    } else {
      setError('Unsupported file type. Please upload PDF, Word, PowerPoint, TXT, or MD files.')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setAttachedFile(null)
    setAttachedFileType(null)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Can generate if there's text OR an attachment
  const canGenerate = textContent.trim().length > 20 || attachedFile !== null

  const handleGenerate = async () => {
    if (!canGenerate) return

    setIsGenerating(true)
    setError(null)

    try {
      let sourceContent = ''
      let purpose = ''

      // Logic:
      // - If only text: text is sourceContent
      // - If only attachment: extracted content is sourceContent
      // - If both: text is purpose/context, attachment is sourceContent

      if (attachedFile && attachedFileType) {
        setGeneratingPhase('upload')
        setPhraseIndex(0)

        // For txt/md files, read content directly
        if (attachedFileType === 'txt' || attachedFileType === 'md') {
          sourceContent = await attachedFile.text()
        } else {
          // Upload to Vercel Blob
          const blob = await upload(`stacker-content/${Date.now()}-${attachedFile.name}`, attachedFile, {
            access: 'public',
            handleUploadUrl: '/api/upload-content',
          })

          setGeneratingPhase('extract')
          setPhraseIndex(0)

          // Parse content from file
          const parseResponse = await fetch('/api/parse-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl: blob.url, fileType: attachedFileType }),
          })

          if (!parseResponse.ok) {
            const errorData = await parseResponse.json()
            throw new Error(errorData.error || 'Failed to parse file')
          }

          const parseResult = await parseResponse.json()
          sourceContent = parseResult.content || ''
        }

        // If there's also text, use it as purpose/context
        if (textContent.trim()) {
          purpose = textContent.trim()
        }
      } else if (detectedUrl) {
        // Text looks like a URL - try to fetch it
        setGeneratingPhase('fetch')
        setPhraseIndex(0)

        const fetchResponse = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: detectedUrl }),
        })

        const fetchResult = await fetchResponse.json()

        if (!fetchResult.success) {
          throw new Error(fetchResult.error || 'Could not fetch content from URL')
        }

        sourceContent = fetchResult.content
      } else {
        // Regular text content
        sourceContent = textContent.trim()
      }

      if (!sourceContent || sourceContent.length < 50) {
        throw new Error('Not enough content to generate a document. Please add more text or attach a file with more content.')
      }

      setGeneratingPhase('generate')
      setPhraseIndex(0)

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

      // Store the generated modules, document title, and source content for single-module AI gen
      setStackerGeneratedModules(result.modules)
      setStackerDocumentTitle(result.documentTitle)
      setStackerSourceContent(sourceContent)

      // Navigate to stacker editor
      setCurrentScreen('stacker-editor')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
      setGeneratingPhase(null)
      setPhraseIndex(0)
    }
  }

  const handleBack = () => {
    clearDraft()
    reset()
    router.push('/')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to generate
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canGenerate && !isGenerating) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div
      className="min-h-screen bg-white dark:bg-surface-primary"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-line-subtle">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-content-secondary hover:text-gray-900 dark:hover:text-content-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to templates
          </button>
          <HeaderControls screenName="Stacker Setup" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-light text-gray-900 dark:text-content-primary mb-2">
          Stacker
        </h1>
        <p className="text-gray-500 dark:text-content-secondary mb-10">
          Describe what you need or attach source content. AI will generate a structured document for you.
        </p>

        {/* Chat-like input area */}
        <div className="relative">
          <div
            className={`
              border rounded-2xl transition-all
              ${error
                ? 'border-red-300 dark:border-red-700'
                : 'border-gray-300 dark:border-line-subtle focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
              }
            `}
            style={{ backgroundColor: isDark ? '#000000' : 'white' }}
          >
            {/* Attached file pill */}
            {attachedFile && attachedFileType && (
              <div className="px-4 pt-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-surface-secondary rounded-lg text-sm">
                  {getFileIcon(attachedFileType)}
                  <span className="text-gray-700 dark:text-content-secondary max-w-[200px] truncate">
                    {attachedFile.name}
                  </span>
                  <button
                    onClick={handleRemoveFile}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-content-primary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachedFile
                ? "Add context or instructions for the document (optional)..."
                : "Describe what you need, paste content, or attach a file..."
              }
              className="w-full px-4 py-3 text-sm text-gray-900 dark:text-content-primary placeholder-gray-400 dark:placeholder:text-content-secondary focus:outline-none resize-none bg-transparent min-h-[80px]"
              rows={3}
              disabled={isGenerating}
            />

            {/* Bottom bar with attachment + submit */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-line-subtle">
              {/* Attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                className="p-2 text-gray-500 dark:text-content-secondary hover:text-gray-700 dark:hover:text-content-primary transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100 dark:hover:bg-interactive-hover"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Submit button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className={`
                  p-2 rounded-lg transition-all
                  ${canGenerate && !isGenerating
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-surface-secondary text-gray-400 cursor-not-allowed'}
                `}
              >
                {isGenerating ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* URL detection notice */}
          {detectedUrl && !attachedFile && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  URL detected. We&apos;ll try to fetch the content. If it requires login, please download and upload the file instead.
                </p>
              </div>
            </div>
          )}

          {/* Helper text */}
          <p className="text-xs text-gray-400 dark:text-content-secondary mt-3 text-center">
            {attachedFile
              ? 'Your text will be used as context for interpreting the attached content.'
              : detectedUrl
              ? 'Public URLs will be fetched automatically. Private links require file upload.'
              : 'Supports PDF, Word, PowerPoint, TXT, and Markdown files. Or just type your content.'
            }
          </p>
          <p className="text-xs text-gray-400 dark:text-content-secondary mt-1 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-surface-secondary rounded text-gray-500 dark:text-content-secondary">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-surface-secondary rounded text-gray-500 dark:text-content-secondary">Enter</kbd> to generate
          </p>

          {/* Skip link */}
          <button
            onClick={() => {
              // Go to editor with empty/default modules (no AI generation)
              setStackerGeneratedModules(null)
              setStackerDocumentTitle(null)
              setStackerSourceContent(null)
              setCurrentScreen('stacker-editor')
            }}
            className="mt-6 text-xs text-gray-400 dark:text-content-secondary hover:text-gray-600 dark:hover:text-content-secondary transition-colors"
          >
            Skip and go to Stacker
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-white/95 dark:bg-surface-primary/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            {/* Animated Logo/Spinner */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-line-subtle" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            {/* Status Text with Fade Animation */}
            <div className="h-8 flex items-center justify-center">
              <p
                key={currentPhrase}
                className="text-lg font-medium text-gray-700 dark:text-content-secondary animate-fade-in"
              >
                {currentPhrase}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500"
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Add fade-in animation style */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default StackerSetupScreen
