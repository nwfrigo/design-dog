import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium-min'
import { trackExport } from '@/lib/usage-tracking'
import { businessCardConfig, getPixelDimensions } from '@/config/print-config'

// Remote Chromium binary for Vercel serverless (official Sparticuz release)
const CHROMIUM_REMOTE_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'

async function getBrowser() {
  const isVercel = !!process.env.VERCEL_ENV

  if (isVercel) {
    const execPath = await chromium.executablePath(CHROMIUM_REMOTE_URL)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      template = 'business-card',
      side = 'front', // 'front' or 'back'
      // Business card fields
      name,
      title,
      email,
      phone,
    } = body

    // Get dimensions for the template
    const { baseWidth, baseHeight, scaleFactor } = getPixelDimensions(businessCardConfig)

    // Browser viewport uses base dimensions (96 DPI)
    // scaleFactor is already calculated: dpi / 96
    const deviceScaleFactor = scaleFactor

    // Build query params for render page
    const params = new URLSearchParams()
    if (name) params.set('name', name)
    if (title) params.set('title', title)
    if (email) params.set('email', email)
    if (phone) params.set('phone', phone)

    // Get the base URL from the request
    const host = request.headers.get('host') || 'localhost:3000'
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    const protocol = isLocalhost ? 'http' : (request.headers.get('x-forwarded-proto') || 'https')
    const baseUrl = `${protocol}://${host}`

    // Render page path based on side
    const renderPath = side === 'back' ? 'business-card-back' : 'business-card-front'
    const renderUrl = `${baseUrl}/render/${renderPath}?${params.toString()}`
    console.log('Print export URL:', renderUrl)

    // Launch Puppeteer
    const browser = await getBrowser()
    const page = await browser.newPage()

    // Set viewport with high DPI scale factor
    await page.setViewport({
      width: baseWidth,
      height: baseHeight,
      deviceScaleFactor,
    })

    // Navigate to render page
    await page.goto(renderUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Wait for the ready signal (fonts loaded)
    try {
      await page.waitForSelector('#render-ready', { timeout: 20000 })
    } catch (waitError) {
      const pageContent = await page.content()
      console.error('Page content at timeout:', pageContent.substring(0, 1000))
      throw waitError
    }

    // Hide any Next.js dev error overlays
    await page.evaluate(() => {
      const errorOverlay = document.querySelector('nextjs-portal')
      if (errorOverlay) {
        (errorOverlay as HTMLElement).style.display = 'none'
      }
      const toasts = document.querySelectorAll('[data-nextjs-toast]')
      toasts.forEach(toast => {
        (toast as HTMLElement).style.display = 'none'
      })
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    // Generate PDF with exact dimensions
    // PDF dimensions need to be in points (1 inch = 72 points)
    // Business card with bleed: 3.75" × 2.25" = 270pt × 162pt
    const pdfWidthPt = (businessCardConfig.dimensions.width + businessCardConfig.dimensions.bleed * 2) * 72
    const pdfHeightPt = (businessCardConfig.dimensions.height + businessCardConfig.dimensions.bleed * 2) * 72

    const pdfBuffer = await page.pdf({
      width: `${pdfWidthPt}pt`,
      height: `${pdfHeightPt}pt`,
      printBackground: true,
      scale: 1,
    })

    await browser.close()

    // Track export
    trackExport(`${template}-${side}`)

    // Generate filename
    const safeName = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'business-card'
    const filename = `${safeName}-${side}.pdf`

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Print export error:', errorMessage, errorStack)
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
