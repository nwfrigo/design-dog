import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

// Use local Chrome in development, serverless chromium in production
async function getBrowser() {
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === undefined) {
    // Local development - use installed Chrome
    const puppeteerFull = await import('puppeteer')
    return puppeteerFull.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }

  // Production (Vercel) - use serverless chromium
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: null,
    executablePath: await chromium.executablePath(),
    headless: true,
  })
}

// Template dimensions
const TEMPLATE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  'website-thumbnail': { width: 700, height: 434 },
  'email-grid': { width: 640, height: 300 },
  'social-dark-gradient': { width: 1200, height: 628 },
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
    if (imageUrl) params.set('imageUrl', imageUrl)

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

    // Get the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`
    const renderUrl = `${baseUrl}/render/${template}?${params.toString()}`

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
    await page.goto(renderUrl, {
      waitUntil: 'networkidle0',
    })

    // Wait for the ready signal (indicates fonts loaded)
    await page.waitForSelector('#render-ready', { timeout: 10000 })

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
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed', details: String(error) },
      { status: 500 }
    )
  }
}
