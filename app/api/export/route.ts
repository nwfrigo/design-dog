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
  'social-image-meddbase': { width: 1200, height: 628 },
  'social-grid-detail': { width: 1200, height: 628 },
  'newsletter-dark-gradient': { width: 640, height: 179 },
  'newsletter-blue-gradient': { width: 640, height: 179 },
  'newsletter-light': { width: 640, height: 179 },
  'newsletter-top-banner': { width: 600, height: 240 },
  'solution-overview-pdf': { width: 612, height: 792 },
  'faq-pdf': { width: 612, height: 792 },
  'stacker-pdf': { width: 612, height: 2000 }, // Dynamic height, this is a fallback
  'social-carousel': { width: 1080, height: 1080 },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const template = body.template || 'website-thumbnail'
    const scale = body.scale || 2

    // ---------------------------------------------------------------
    // Generic param forwarding
    // ---------------------------------------------------------------
    // Instead of manually destructuring and forwarding each field,
    // iterate all body keys and forward them automatically.
    // This ensures new editor params always reach the render page
    // without requiring changes to this file.

    const params = new URLSearchParams()

    // Keys consumed by the route itself, never forwarded to the render page
    const ROUTE_ONLY_KEYS = new Set([
      'template', 'scale', 'format', 'filename', 'numPages', 'numSlides',
    ])

    // Keys that require special processing (handled in dedicated blocks below)
    const COMPLEX_KEYS = new Set([
      // FAQ: pages need data URL stripping + double encoding
      'pages',
      // Stacker: modules need data URL stripping + double encoding
      'modules', 'moduleSpacing', 'footerHidden', 'darkMode',
      // FAQ cover: object needs splitting to X/Y params
      'coverImagePosition',
      // Carousel: only forwarded when exporting all slides
      'slidesData',
      // Newsletter: keys are remapped to generic image* names
      'newsletterImageUrl', 'newsletterImagePositionX', 'newsletterImagePositionY', 'newsletterImageZoom',
    ])

    for (const [key, value] of Object.entries(body)) {
      if (ROUTE_ONLY_KEYS.has(key)) continue
      if (COMPLEX_KEYS.has(key)) continue
      if (value == null) continue
      // Data/blob URLs can't be passed via query params — they're injected via Puppeteer
      if (typeof value === 'string' && (value.startsWith('data:') || value.startsWith('blob:'))) continue

      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        params.set(key, JSON.stringify(value))
      } else {
        params.set(key, String(value))
      }
    }

    // ---------------------------------------------------------------
    // Special-case handling
    // ---------------------------------------------------------------

    // Newsletter templates: remap newsletterImage* → image* for render page
    if (template.startsWith('newsletter-')) {
      if (body.newsletterImageUrl && !body.newsletterImageUrl.startsWith('data:') && !body.newsletterImageUrl.startsWith('blob:')) {
        params.set('imageUrl', body.newsletterImageUrl)
      }
      if (body.newsletterImagePositionX != null) params.set('imagePositionX', String(body.newsletterImagePositionX))
      if (body.newsletterImagePositionY != null) params.set('imagePositionY', String(body.newsletterImagePositionY))
      if (body.newsletterImageZoom != null) params.set('imageZoom', String(body.newsletterImageZoom))
    }

    // FAQ cover image position: object → flat X/Y params
    if (body.coverImagePosition) {
      params.set('coverImagePositionX', String(body.coverImagePosition.x || 0))
      params.set('coverImagePositionY', String(body.coverImagePosition.y || 0))
    }

    // Stacker flags: truthy → '1' encoding
    if (body.footerHidden) params.set('footerHidden', '1')
    if (body.darkMode) params.set('darkMode', '1')

    // Carousel slidesData: only forwarded when exporting all slides as PDF
    if (body.slidesData && body.page === 'all') {
      params.set('slidesData', body.slidesData)
    }

    // FAQ PDF: strip data URLs from image blocks (they'll be injected via Puppeteer)
    interface FaqImageData {
      blockId: string
      imageUrl: string
    }
    const faqImageData: FaqImageData[] = []

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

    // Stacker PDF: strip data URLs from modules (they'll be injected via Puppeteer)
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

      // Pass module spacing if provided
      if (body.moduleSpacing && Object.keys(body.moduleSpacing).length > 0) {
        params.set('moduleSpacing', encodeURIComponent(JSON.stringify(body.moduleSpacing)))
      }
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
    const isCarouselPdf = template === 'social-carousel' && body.page === 'all'
    const isPdfExport = isSolutionOverviewPdf || isFaqPdf || isStackerPdf || isCarouselPdf
    // For FAQ PDF, calculate pages from the pages array; for SO PDF, fixed at 3 pages
    // For Stacker PDF, use a tall initial viewport (will measure actual height later)
    // For Carousel PDF, calculate from number of slides
    const numPages = isFaqPdf ? (body.numPages || 1) : isCarouselPdf ? (body.numSlides || 1) : 3
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
    if (body.imageUrl && body.imageUrl.startsWith('data:')) {
      await injectDataUrlImage(body.imageUrl, 'img[data-export-image="true"]')

      // Apply grayscale filter directly if enabled (canvas conversion won't work on injected images)
      if (body.grayscale) {
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
    const hasDataUrlImages = (body.imageUrl && body.imageUrl.startsWith('data:')) ||
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
    if (body.grayscale) {
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
      const filename = isCarouselPdf ? 'social-carousel.pdf' : isFaqPdf ? faqFilename : (isStackerPdf ? (body.filename || 'stacker.pdf') : 'solution-overview.pdf')
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
