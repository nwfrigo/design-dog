import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { trackExport } from '@/lib/usage-tracking'

// Remote Chromium binary for Vercel serverless (official Sparticuz release)
// Must match the @sparticuz/chromium-min version (v143.0.4)
const CHROMIUM_REMOTE_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'

async function getBrowser() {
  const isVercel = !!process.env.VERCEL_ENV

  if (isVercel) {
    // Production (Vercel) - use remote chromium binary
    const execPath = await chromium.executablePath(CHROMIUM_REMOTE_URL)
    console.log('Chromium path:', execPath)

    return puppeteer.launch({
      args: chromium.args,
      executablePath: execPath,
      headless: true,
    })
  }

  // Local development - find Chrome on macOS
  const paths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ]

  let localChromePath = ''
  for (const p of paths) {
    try {
      const fs = await import('fs')
      if (fs.existsSync(p)) {
        localChromePath = p
        break
      }
    } catch {
      continue
    }
  }

  if (!localChromePath) {
    throw new Error('Chrome not found. Install Google Chrome.')
  }

  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null,
    executablePath: localChromePath,
    headless: true,
  })
}

// Template dimensions
const TEMPLATE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  'website-thumbnail': { width: 800, height: 450 },
  'website-press-release': { width: 800, height: 450 },
  'website-webinar': { width: 800, height: 450 },
  'website-report': { width: 800, height: 450 },
  'website-event-listing': { width: 800, height: 450 },
  'website-floating-banner': { width: 2256, height: 100 },
  'website-floating-banner-mobile': { width: 580, height: 80 },
  'email-grid': { width: 640, height: 300 },
  'email-image': { width: 640, height: 300 },
  'email-dark-gradient': { width: 640, height: 300 },
  'email-speakers': { width: 640, height: 300 },
  'email-product-release': { width: 640, height: 164 },
  'social-dark-gradient': { width: 1200, height: 628 },
  'social-blue-gradient': { width: 1200, height: 628 },
  'social-image': { width: 1200, height: 628 },
  'social-grid-detail': { width: 1200, height: 628 },
  'newsletter-dark-gradient': { width: 640, height: 179 },
  'newsletter-blue-gradient': { width: 640, height: 179 },
  'newsletter-light': { width: 640, height: 179 },
  'newsletter-top-banner': { width: 600, height: 240 },
  'solution-overview-pdf': { width: 612, height: 792 },
  'faq-pdf': { width: 612, height: 792 },
  'stacker-pdf': { width: 612, height: 2000 }, // Dynamic height, this is a fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      template = 'website-thumbnail',
      scale = 2,
      // Common fields
      eyebrow,
      headline,
      subhead,
      body: bodyText,
      solution,
      logoColor,
      showEyebrow,
      showSubhead,
      showBody,
      // Website thumbnail specific
      imageUrl,
      imagePositionX,
      imagePositionY,
      imageZoom,
      ebookVariant,
      // Email grid specific
      subheading,
      showLightHeader,
      showHeavyHeader,
      showSubheading,
      showSolutionSet,
      showGridDetail2,
      gridDetail1Type,
      gridDetail1Text,
      gridDetail2Type,
      gridDetail2Text,
      gridDetail3Type,
      gridDetail3Text,
      // Social dark gradient specific
      metadata,
      ctaText,
      colorStyle,
      headingSize,
      alignment,
      ctaStyle,
      showMetadata,
      showCta,
      // Social image specific
      layout,
      // Social grid detail specific
      gridDetail4Type,
      gridDetail4Text,
      showRow3,
      showRow4,
      // Email speakers specific
      speakerCount,
      speaker1Name,
      speaker1Role,
      speaker1ImageUrl,
      speaker1ImagePositionX,
      speaker1ImagePositionY,
      speaker1ImageZoom,
      speaker2Name,
      speaker2Role,
      speaker2ImageUrl,
      speaker2ImagePositionX,
      speaker2ImagePositionY,
      speaker2ImageZoom,
      speaker3Name,
      speaker3Role,
      speaker3ImageUrl,
      speaker3ImagePositionX,
      speaker3ImagePositionY,
      speaker3ImageZoom,
      // Newsletter specific
      imageSize,
      // Image effects
      grayscale,
    } = body

    // Build query params for render page
    const params = new URLSearchParams()

    // Common params
    if (eyebrow) params.set('eyebrow', eyebrow)
    if (headline) params.set('headline', headline)
    if (subhead) params.set('subhead', subhead)
    if (bodyText) params.set('body', bodyText)
    if (solution) params.set('solution', solution)
    if (logoColor) params.set('logoColor', logoColor)
    if (showEyebrow !== undefined) params.set('showEyebrow', String(showEyebrow))
    if (showSubhead !== undefined) params.set('showSubhead', String(showSubhead))
    if (showBody !== undefined) params.set('showBody', String(showBody))

    // Website thumbnail specific
    // Only pass imageUrl via query params if it's a regular URL (not a data URL or blob URL)
    // Data URLs are too large for query params and will be injected via Puppeteer
    // Blob URLs are inaccessible to Puppeteer (different browser context)
    if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
      params.set('imageUrl', imageUrl)
    }
    if (imagePositionX !== undefined) params.set('imagePositionX', String(imagePositionX))
    if (imagePositionY !== undefined) params.set('imagePositionY', String(imagePositionY))
    if (imageZoom !== undefined) params.set('imageZoom', String(imageZoom))
    if (ebookVariant) params.set('variant', ebookVariant)

    // Email grid specific
    if (subheading) params.set('subheading', subheading)
    if (showLightHeader !== undefined) params.set('showLightHeader', String(showLightHeader))
    if (showHeavyHeader !== undefined) params.set('showHeavyHeader', String(showHeavyHeader))
    if (showSubheading !== undefined) params.set('showSubheading', String(showSubheading))
    if (showSolutionSet !== undefined) params.set('showSolutionSet', String(showSolutionSet))
    if (showGridDetail2 !== undefined) params.set('showGridDetail2', String(showGridDetail2))
    if (gridDetail1Type) params.set('gridDetail1Type', gridDetail1Type)
    if (gridDetail1Text) params.set('gridDetail1Text', gridDetail1Text)
    if (gridDetail2Type) params.set('gridDetail2Type', gridDetail2Type)
    if (gridDetail2Text) params.set('gridDetail2Text', gridDetail2Text)
    if (gridDetail3Type) params.set('gridDetail3Type', gridDetail3Type)
    if (gridDetail3Text) params.set('gridDetail3Text', gridDetail3Text)

    // Social dark gradient specific
    if (metadata) params.set('metadata', metadata)
    if (ctaText) params.set('ctaText', ctaText)
    if (colorStyle) params.set('colorStyle', colorStyle)
    if (headingSize) params.set('headingSize', headingSize)
    if (alignment) params.set('alignment', alignment)
    if (ctaStyle) params.set('ctaStyle', ctaStyle)
    if (showMetadata !== undefined) params.set('showMetadata', String(showMetadata))
    if (showCta !== undefined) params.set('showCta', String(showCta))

    // Social image specific
    if (layout) params.set('layout', layout)

    // Social grid detail specific
    if (gridDetail4Type) params.set('gridDetail4Type', gridDetail4Type)
    if (gridDetail4Text) params.set('gridDetail4Text', gridDetail4Text)
    if (showRow3 !== undefined) params.set('showRow3', String(showRow3))
    if (showRow4 !== undefined) params.set('showRow4', String(showRow4))

    // Email speakers specific
    if (speakerCount !== undefined) params.set('speakerCount', String(speakerCount))
    if (speaker1Name) params.set('speaker1Name', speaker1Name)
    if (speaker1Role) params.set('speaker1Role', speaker1Role)
    if (speaker1ImageUrl) params.set('speaker1ImageUrl', speaker1ImageUrl)
    if (speaker1ImagePositionX !== undefined) params.set('speaker1ImagePositionX', String(speaker1ImagePositionX))
    if (speaker1ImagePositionY !== undefined) params.set('speaker1ImagePositionY', String(speaker1ImagePositionY))
    if (speaker1ImageZoom !== undefined) params.set('speaker1ImageZoom', String(speaker1ImageZoom))
    if (speaker2Name) params.set('speaker2Name', speaker2Name)
    if (speaker2Role) params.set('speaker2Role', speaker2Role)
    if (speaker2ImageUrl) params.set('speaker2ImageUrl', speaker2ImageUrl)
    if (speaker2ImagePositionX !== undefined) params.set('speaker2ImagePositionX', String(speaker2ImagePositionX))
    if (speaker2ImagePositionY !== undefined) params.set('speaker2ImagePositionY', String(speaker2ImagePositionY))
    if (speaker2ImageZoom !== undefined) params.set('speaker2ImageZoom', String(speaker2ImageZoom))
    if (speaker3Name) params.set('speaker3Name', speaker3Name)
    if (speaker3Role) params.set('speaker3Role', speaker3Role)
    if (speaker3ImageUrl) params.set('speaker3ImageUrl', speaker3ImageUrl)
    if (speaker3ImagePositionX !== undefined) params.set('speaker3ImagePositionX', String(speaker3ImagePositionX))
    if (speaker3ImagePositionY !== undefined) params.set('speaker3ImagePositionY', String(speaker3ImagePositionY))
    if (speaker3ImageZoom !== undefined) params.set('speaker3ImageZoom', String(speaker3ImageZoom))

    // Newsletter specific - only override image params for newsletter templates
    const isNewsletterTemplate = template.startsWith('newsletter-')
    if (imageSize) params.set('imageSize', imageSize)
    // For newsletter templates, pass newsletterImageUrl as imageUrl (for non-data URLs)
    if (isNewsletterTemplate && body.newsletterImageUrl && !body.newsletterImageUrl.startsWith('data:') && !body.newsletterImageUrl.startsWith('blob:')) {
      params.set('imageUrl', body.newsletterImageUrl)
    }
    if (isNewsletterTemplate && body.newsletterImagePositionX !== undefined) params.set('imagePositionX', String(body.newsletterImagePositionX))
    if (isNewsletterTemplate && body.newsletterImagePositionY !== undefined) params.set('imagePositionY', String(body.newsletterImagePositionY))
    if (isNewsletterTemplate && body.newsletterImageZoom !== undefined) params.set('imageZoom', String(body.newsletterImageZoom))

    // Website webinar specific
    if (body.variant) params.set('variant', body.variant)
    if (body.showSpeaker1 !== undefined) params.set('showSpeaker1', String(body.showSpeaker1))
    if (body.showSpeaker2 !== undefined) params.set('showSpeaker2', String(body.showSpeaker2))
    if (body.showSpeaker3 !== undefined) params.set('showSpeaker3', String(body.showSpeaker3))

    // Website floating banner specific
    if (body.cta) params.set('cta', body.cta)

    // Image effects
    if (grayscale !== undefined) params.set('grayscale', String(grayscale))

    // Solution Overview PDF specific - Page 1
    if (body.solutionName) params.set('solutionName', body.solutionName)
    if (body.tagline) params.set('tagline', body.tagline)
    if (body.page) params.set('page', body.page)
    // Solution Overview PDF specific - Page 2
    if (body.heroImageId) params.set('heroImageId', body.heroImageId)
    // Skip data URLs for hero image - they'll be injected via page.evaluate()
    if (body.heroImageUrl && !body.heroImageUrl.startsWith('data:') && !body.heroImageUrl.startsWith('blob:')) {
      params.set('heroImageUrl', body.heroImageUrl)
    }
    if (body.heroImagePositionX !== undefined) params.set('heroImagePositionX', String(body.heroImagePositionX))
    if (body.heroImagePositionY !== undefined) params.set('heroImagePositionY', String(body.heroImagePositionY))
    if (body.heroImageZoom !== undefined) params.set('heroImageZoom', String(body.heroImageZoom))
    if (body.page2Header) params.set('page2Header', body.page2Header)
    if (body.sectionHeader) params.set('sectionHeader', body.sectionHeader)
    if (body.introParagraph) params.set('introParagraph', body.introParagraph)
    if (body.keySolutions) params.set('keySolutions', JSON.stringify(body.keySolutions))
    if (body.quoteText) params.set('quoteText', body.quoteText)
    if (body.quoteName) params.set('quoteName', body.quoteName)
    if (body.quoteTitle) params.set('quoteTitle', body.quoteTitle)
    if (body.quoteCompany) params.set('quoteCompany', body.quoteCompany)
    // Solution Overview PDF specific - Page 3
    if (body.benefits) params.set('benefits', JSON.stringify(body.benefits))
    if (body.features) params.set('features', JSON.stringify(body.features))
    // Skip data URLs for screenshot - they'll be injected via page.evaluate()
    if (body.screenshotUrl && !body.screenshotUrl.startsWith('data:') && !body.screenshotUrl.startsWith('blob:')) {
      params.set('screenshotUrl', body.screenshotUrl)
    }
    if (body.screenshotPositionX !== undefined) params.set('screenshotPositionX', String(body.screenshotPositionX))
    if (body.screenshotPositionY !== undefined) params.set('screenshotPositionY', String(body.screenshotPositionY))
    if (body.screenshotZoom !== undefined) params.set('screenshotZoom', String(body.screenshotZoom))
    if (body.ctaOption) params.set('ctaOption', body.ctaOption)
    if (body.ctaUrl) params.set('ctaUrl', body.ctaUrl)
    // Solution Overview PDF - Page 2 footer stats
    if (body.stat1Value) params.set('stat1Value', body.stat1Value)
    if (body.stat1Label) params.set('stat1Label', body.stat1Label)
    if (body.stat2Value) params.set('stat2Value', body.stat2Value)
    if (body.stat2Label) params.set('stat2Label', body.stat2Label)
    if (body.stat3Value) params.set('stat3Value', body.stat3Value)
    if (body.stat3Label) params.set('stat3Label', body.stat3Label)
    if (body.stat4Value) params.set('stat4Value', body.stat4Value)
    if (body.stat4Label) params.set('stat4Label', body.stat4Label)
    if (body.stat5Value) params.set('stat5Value', body.stat5Value)
    if (body.stat5Label) params.set('stat5Label', body.stat5Label)
    // Solution Overview PDF - grayscale settings
    if (body.heroImageGrayscale !== undefined) params.set('heroImageGrayscale', String(body.heroImageGrayscale))
    if (body.screenshotGrayscale !== undefined) params.set('screenshotGrayscale', String(body.screenshotGrayscale))

    // FAQ PDF specific - strip data URLs from image blocks to avoid URL length limits
    // They'll be injected via page.evaluate() after loading
    interface FaqImageData {
      blockId: string
      imageUrl: string
    }
    const faqImageData: FaqImageData[] = []

    if (body.title) params.set('title', body.title)
    if (body.pages) {
      // Process pages to extract data URL images
      const pagesForUrl = (body.pages as Array<{ id: string; blocks: Array<{ type: string; id: string; imageUrl?: string }> }>).map((page) => {
        const processedBlocks = page.blocks.map((block) => {
          if (block.type === 'image' && block.imageUrl && block.imageUrl.startsWith('data:')) {
            faqImageData.push({ blockId: block.id, imageUrl: block.imageUrl })
            return { ...block, imageUrl: null } // Clear data URL for URL params
          }
          return block
        })
        return { ...page, blocks: processedBlocks }
      })
      params.set('pages', encodeURIComponent(JSON.stringify(pagesForUrl)))
    }
    // FAQ PDF cover page
    if (body.coverSolution) params.set('coverSolution', body.coverSolution)
    if (body.coverSubheader) params.set('coverSubheader', body.coverSubheader)
    // Skip data URLs for cover image - they'll be injected via page.evaluate()
    if (body.coverImageUrl && !body.coverImageUrl.startsWith('data:') && !body.coverImageUrl.startsWith('blob:')) {
      params.set('coverImageUrl', body.coverImageUrl)
    }
    if (body.coverImagePosition) {
      params.set('coverImagePositionX', String(body.coverImagePosition.x || 0))
      params.set('coverImagePositionY', String(body.coverImagePosition.y || 0))
    }
    if (body.coverImageZoom !== undefined) params.set('coverImageZoom', String(body.coverImageZoom))
    if (body.coverImageGrayscale !== undefined) params.set('coverImageGrayscale', String(body.coverImageGrayscale))

    // Stacker PDF specific - strip data URLs to avoid URL length limits
    // They'll be injected via page.evaluate() after loading
    interface StackerImageData {
      moduleId: string
      imageUrl: string
    }
    const stackerImageData: StackerImageData[] = []

    if (body.modules) {
      const modulesForUrl = (body.modules as Record<string, unknown>[]).map((module) => {
        // Check if this module has an imageUrl that's a data URL
        const imageUrl = module.imageUrl as string | undefined
        if (imageUrl && imageUrl.startsWith('data:')) {
          stackerImageData.push({ moduleId: module.id as string, imageUrl })
          return { ...module, imageUrl: null } // Clear data URL for URL params
        }
        // Check for image-cards modules with card images
        const cards = module.cards as Record<string, unknown>[] | undefined
        if (cards && Array.isArray(cards)) {
          const updatedCards = cards.map((card, idx) => {
            const cardImageUrl = card.imageUrl as string | undefined
            if (cardImageUrl && cardImageUrl.startsWith('data:')) {
              stackerImageData.push({ moduleId: `${module.id}-card-${idx}`, imageUrl: cardImageUrl })
              return { ...card, imageUrl: null }
            }
            return card
          })
          return { ...module, cards: updatedCards }
        }
        return module
      })
      params.set('modules', encodeURIComponent(JSON.stringify(modulesForUrl)))
    }

    // Get the base URL from the request
    const host = request.headers.get('host') || 'localhost:3000'
    // Use http for localhost, otherwise check x-forwarded-proto or default to https
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    const protocol = isLocalhost ? 'http' : (request.headers.get('x-forwarded-proto') || 'https')
    const baseUrl = `${protocol}://${host}`
    const renderUrl = `${baseUrl}/render/${template}?${params.toString()}`
    console.log('Base URL:', baseUrl)
    console.log('Render URL:', renderUrl)

    // Launch Puppeteer
    const browser = await getBrowser()

    const page = await browser.newPage()

    // Set viewport to template dimensions
    const dimensions = TEMPLATE_DIMENSIONS[template] || TEMPLATE_DIMENSIONS['website-thumbnail']
    const { width, height } = dimensions

    // For PDF exports with page=all, use taller viewport to render all pages
    const isSolutionOverviewPdf = template === 'solution-overview-pdf' && body.page === 'all'
    const isFaqPdf = template === 'faq-pdf' && body.page === 'all'
    const isStackerPdf = template === 'stacker-pdf'
    const isPdfExport = isSolutionOverviewPdf || isFaqPdf || isStackerPdf
    // For FAQ PDF, calculate pages from the pages array; for SO PDF, fixed at 3 pages
    // For Stacker PDF, use a tall initial viewport (will measure actual height later)
    const numPages = isFaqPdf ? (body.numPages || 1) : 3
    const viewportHeight = isStackerPdf ? 4000 : (isPdfExport ? height * numPages : height)

    // For Stacker PDF export, use scale 1 to preserve thin CSS borders
    const isStackerPdfExport = isStackerPdf && body.format === 'pdf'
    const viewportScale = isStackerPdfExport ? 1 : scale

    await page.setViewport({
      width,
      height: viewportHeight,
      deviceScaleFactor: viewportScale,
    })

    // Navigate to render page
    console.log('Navigating to:', renderUrl)
    await page.goto(renderUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Wait for the ready signal (indicates fonts loaded) - longer timeout for cold starts
    try {
      await page.waitForSelector('#render-ready', { timeout: 20000 })
    } catch (waitError) {
      // Log page content for debugging
      const pageContent = await page.content()
      console.error('Page content at timeout:', pageContent.substring(0, 1000))
      throw waitError
    }

    // Inject image data if provided (data URLs are too large for query params)
    // Helper function to inject a single image
    const injectDataUrlImage = async (dataUrl: string, selector: string) => {
      console.log(`Injecting data URL image for ${selector}, length:`, dataUrl.length)
      const injected = await page.evaluate((imgSrc: string, sel: string) => {
        const img = document.querySelector(sel) as HTMLImageElement
        if (!img) {
          console.log(`No image found for selector: ${sel}`)
          return false
        }

        return new Promise<boolean>((resolve) => {
          img.onload = () => {
            console.log(`Image loaded successfully for ${sel}`)
            // Show the image (it may be hidden with display:none when no URL was provided)
            img.style.display = 'block'
            // Hide any sibling placeholder divs
            const parent = img.parentElement
            if (parent) {
              const siblings = parent.querySelectorAll('div')
              siblings.forEach(sib => {
                if (sib.textContent?.includes('Screenshot') || sib.textContent?.includes('Product')) {
                  sib.style.display = 'none'
                }
              })
            }
            resolve(true)
          }
          img.onerror = (e) => {
            console.log(`Image load error for ${sel}:`, e)
            resolve(false)
          }
          img.src = imgSrc
          // Fallback timeout in case onload doesn't fire (data URLs load synchronously sometimes)
          setTimeout(() => {
            img.style.display = 'block'
            resolve(true)
          }, 500)
        })
      }, dataUrl, selector)
      console.log(`Image injection result for ${selector}:`, injected)
      return injected
    }

    // Inject main image (thumbnailImageUrl)
    if (imageUrl && imageUrl.startsWith('data:')) {
      await injectDataUrlImage(imageUrl, 'img[data-export-image="true"]')

      // Apply grayscale filter directly if enabled (canvas conversion won't work on injected images)
      if (grayscale) {
        await page.evaluate(() => {
          const img = document.querySelector('img[data-export-image="true"]') as HTMLImageElement
          if (img) {
            img.style.filter = 'grayscale(100%)'
          }
        })
      }
    }

    // Inject speaker images
    if (body.speaker1ImageUrl && body.speaker1ImageUrl.startsWith('data:')) {
      await injectDataUrlImage(body.speaker1ImageUrl, 'img[data-speaker="1"]')
    }
    if (body.speaker2ImageUrl && body.speaker2ImageUrl.startsWith('data:')) {
      await injectDataUrlImage(body.speaker2ImageUrl, 'img[data-speaker="2"]')
    }
    if (body.speaker3ImageUrl && body.speaker3ImageUrl.startsWith('data:')) {
      await injectDataUrlImage(body.speaker3ImageUrl, 'img[data-speaker="3"]')
    }

    // Inject newsletter image
    if (body.newsletterImageUrl && body.newsletterImageUrl.startsWith('data:')) {
      await injectDataUrlImage(body.newsletterImageUrl, 'img[data-newsletter-image="true"]')
    }

    // Inject Solution Overview images
    if (body.heroImageUrl && body.heroImageUrl.startsWith('data:')) {
      await injectDataUrlImage(body.heroImageUrl, 'img[data-so-hero-image="true"]')
    }
    if (body.screenshotUrl && body.screenshotUrl.startsWith('data:')) {
      await injectDataUrlImage(body.screenshotUrl, 'img[data-so-screenshot="true"]')
    }

    // Inject FAQ cover image
    if (body.coverImageUrl && body.coverImageUrl.startsWith('data:')) {
      await injectDataUrlImage(body.coverImageUrl, 'img[data-faq-cover-image="true"]')
    }

    // Inject FAQ content page images
    for (const imgData of faqImageData) {
      const selector = `img[data-faq-image="${imgData.blockId}"]`
      await injectDataUrlImage(imgData.imageUrl, selector)
    }

    // Inject Stacker PDF images using the same helper as other templates
    for (const imgData of stackerImageData) {
      // For regular image modules (image, image-16x9)
      if (!imgData.moduleId.includes('-card-')) {
        const selector = `[data-module-id="${imgData.moduleId}"] img[data-stacker-image="true"]`
        await injectDataUrlImage(imgData.imageUrl, selector)
      } else {
        // For image-cards modules - moduleId is like "module-id-card-0"
        const parts = imgData.moduleId.split('-card-')
        const moduleId = parts[0]
        const cardIdx = parts[1]
        const selector = `[data-module-id="${moduleId}"] img[data-stacker-card-image="${cardIdx}"]`
        await injectDataUrlImage(imgData.imageUrl, selector)
      }
    }

    // Additional delay for rendering
    const hasDataUrlImages = (imageUrl && imageUrl.startsWith('data:')) ||
        (body.speaker1ImageUrl && body.speaker1ImageUrl.startsWith('data:')) ||
        (body.speaker2ImageUrl && body.speaker2ImageUrl.startsWith('data:')) ||
        (body.speaker3ImageUrl && body.speaker3ImageUrl.startsWith('data:')) ||
        (body.newsletterImageUrl && body.newsletterImageUrl.startsWith('data:')) ||
        (body.heroImageUrl && body.heroImageUrl.startsWith('data:')) ||
        (body.screenshotUrl && body.screenshotUrl.startsWith('data:')) ||
        (body.coverImageUrl && body.coverImageUrl.startsWith('data:')) ||
        faqImageData.length > 0 ||
        stackerImageData.length > 0

    if (hasDataUrlImages) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Extra delay for grayscale canvas conversion
    if (grayscale) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Hide any Next.js dev error overlays that might appear
    await page.evaluate(() => {
      // Hide Next.js error overlay
      const errorOverlay = document.querySelector('nextjs-portal')
      if (errorOverlay) {
        (errorOverlay as HTMLElement).style.display = 'none'
      }
      // Also try to hide any toast notifications
      const toasts = document.querySelectorAll('[data-nextjs-toast]')
      toasts.forEach(toast => {
        (toast as HTMLElement).style.display = 'none'
      })
    })

    // Small delay after hiding overlays
    await new Promise(resolve => setTimeout(resolve, 100))

    // For Stacker, measure actual content height and export as PNG or PDF based on format
    if (isStackerPdf) {
      // Reset body min-height to prevent min-h-screen (100vh) from inflating
      // the page beyond actual content — 100vh in a 4000px viewport creates
      // extra blank PDF pages
      await page.evaluate(() => {
        document.body.style.minHeight = '0'
      })

      // Use getBoundingClientRect for sub-pixel precision (offsetHeight rounds
      // to integer which can undercount by <1px, pushing the footer to page 2)
      const actualHeight = await page.evaluate(() => {
        const content = document.getElementById('stacker-content')
        if (content) {
          return Math.ceil(content.getBoundingClientRect().height)
        }
        // Fallback to body measurement
        return document.body.scrollHeight
      })

      console.log('Stacker actual height:', actualHeight)

      const stackerFilename = body.filename || 'stacker-document'

      // Export as PDF if format is 'pdf'
      if (body.format === 'pdf') {
        // Use screen media type to preserve thin borders (print media can round them up)
        await page.emulateMediaType('screen')

        // Generate PDF with dynamic height based on content
        // Explicit zero margins prevent any default PDF margin from shrinking
        // the content area below the measured height
        const pdfBuffer = await page.pdf({
          width: `${width}px`,
          height: `${actualHeight}px`,
          printBackground: true,
          margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        })

        await browser.close()

        // Track export (fire-and-forget)
        trackExport(template)

        return new NextResponse(Buffer.from(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${stackerFilename}.pdf"`,
          },
        })
      }

      // Default: Take full-page screenshot with 2x scale for quality (PNG)
      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width,
          height: actualHeight,
        },
      })

      await browser.close()

      // Track export (fire-and-forget)
      trackExport(template)

      return new NextResponse(Buffer.from(screenshot), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${stackerFilename}.png"`,
        },
      })
    }

    // For other PDF exports (FAQ, Solution Overview) with page=all, generate a PDF
    if (isPdfExport) {
      // Generate PDF using Puppeteer's PDF feature
      // Note: scale must be 1 for PDFs to maintain proper page dimensions
      // (scale=2 is for PNG retina quality, but would double PDF content size)
      const pdfBuffer = await page.pdf({
        width: `${width}px`,
        height: `${height}px`,
        printBackground: true,
      })

      await browser.close()

      // Track export (fire-and-forget)
      trackExport(template)

      // Use document title for FAQ PDF filename, sanitized for filesystem
      const faqFilename = body.title
        ? `${body.title.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}.pdf`
        : 'faq.pdf'
      const filename = isFaqPdf ? faqFilename : (isStackerPdf ? (body.filename || 'stacker.pdf') : 'solution-overview.pdf')
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // Take screenshot for other templates
    const screenshot = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width,
        height,
      },
    })

    await browser.close()

    // Track export (fire-and-forget)
    trackExport(template)

    // Return the image
    return new NextResponse(Buffer.from(screenshot), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="design-${scale}x.png"`,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Export error:', errorMessage, errorStack)
    return NextResponse.json(
      {
        error: 'Export failed',
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        env: process.env.VERCEL_ENV || 'local'
      },
      { status: 500 }
    )
  }
}
