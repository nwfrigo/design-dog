import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'

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
  'email-grid': { width: 640, height: 300 },
  'email-image': { width: 640, height: 300 },
  'email-dark-gradient': { width: 640, height: 300 },
  'email-speakers': { width: 640, height: 300 },
  'social-dark-gradient': { width: 1200, height: 628 },
  'social-blue-gradient': { width: 1200, height: 628 },
  'social-image': { width: 1200, height: 628 },
  'social-grid-detail': { width: 1200, height: 628 },
  'newsletter-dark-gradient': { width: 640, height: 179 },
  'newsletter-blue-gradient': { width: 640, height: 179 },
  'newsletter-light': { width: 640, height: 179 },
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

    // Newsletter specific
    if (imageSize) params.set('imageSize', imageSize)
    // For newsletter templates, pass newsletterImageUrl as imageUrl (for non-data URLs)
    if (body.newsletterImageUrl && !body.newsletterImageUrl.startsWith('data:') && !body.newsletterImageUrl.startsWith('blob:')) {
      params.set('imageUrl', body.newsletterImageUrl)
    }
    if (body.newsletterImagePositionX !== undefined) params.set('imagePositionX', String(body.newsletterImagePositionX))
    if (body.newsletterImagePositionY !== undefined) params.set('imagePositionY', String(body.newsletterImagePositionY))
    if (body.newsletterImageZoom !== undefined) params.set('imageZoom', String(body.newsletterImageZoom))

    // Website webinar specific
    if (body.variant) params.set('variant', body.variant)
    if (body.showSpeaker1 !== undefined) params.set('showSpeaker1', String(body.showSpeaker1))
    if (body.showSpeaker2 !== undefined) params.set('showSpeaker2', String(body.showSpeaker2))
    if (body.showSpeaker3 !== undefined) params.set('showSpeaker3', String(body.showSpeaker3))

    // Image effects
    if (grayscale !== undefined) params.set('grayscale', String(grayscale))

    // Get the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'localhost:3000'
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
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: scale,
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
            resolve(true)
          }
          img.onerror = (e) => {
            console.log(`Image load error for ${sel}:`, e)
            resolve(false)
          }
          img.src = imgSrc
          // Fallback timeout in case onload doesn't fire (data URLs load synchronously sometimes)
          setTimeout(() => resolve(true), 500)
        })
      }, dataUrl, selector)
      console.log(`Image injection result for ${selector}:`, injected)
      return injected
    }

    // Inject main image (thumbnailImageUrl)
    if (imageUrl && imageUrl.startsWith('data:')) {
      await injectDataUrlImage(imageUrl, 'img[data-export-image="true"]')
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

    // Additional delay for rendering
    if ((imageUrl && imageUrl.startsWith('data:')) ||
        (body.speaker1ImageUrl && body.speaker1ImageUrl.startsWith('data:')) ||
        (body.speaker2ImageUrl && body.speaker2ImageUrl.startsWith('data:')) ||
        (body.speaker3ImageUrl && body.speaker3ImageUrl.startsWith('data:')) ||
        (body.newsletterImageUrl && body.newsletterImageUrl.startsWith('data:'))) {
      await new Promise(resolve => setTimeout(resolve, 300))
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

    // Take screenshot
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
