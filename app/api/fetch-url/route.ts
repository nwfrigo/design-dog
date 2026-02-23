import { NextRequest, NextResponse } from 'next/server'

/**
 * Attempts to fetch content from a public URL.
 * Returns the text content or an error explaining why it failed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      )
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check for known inaccessible domains
    const hostname = parsedUrl.hostname.toLowerCase()
    const inaccessibleDomains = [
      'sharepoint.com',
      'sharepoint-df.com',
      'onedrive.live.com',
      'onedrive.com',
      'drive.google.com',
      'docs.google.com',
      'dropbox.com',
      'box.com',
      'notion.so',
      'confluence.atlassian.com',
    ]

    const isKnownInaccessible = inaccessibleDomains.some(domain =>
      hostname.includes(domain)
    )

    if (isKnownInaccessible) {
      return NextResponse.json({
        success: false,
        requiresAuth: true,
        error: `This link requires authentication. Please download the file and upload it, or copy-paste the content directly.`,
        domain: hostname,
      })
    }

    // Attempt to fetch the URL
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DesignDog/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return NextResponse.json({
            success: false,
            requiresAuth: true,
            error: `This link requires authentication (${response.status}). Please download the file and upload it, or copy-paste the content directly.`,
          })
        }

        if (response.status === 404) {
          return NextResponse.json({
            success: false,
            error: 'Page not found (404). Please check the URL and try again.',
          })
        }

        return NextResponse.json({
          success: false,
          error: `Failed to fetch URL (HTTP ${response.status}). Please try uploading the file or pasting the content directly.`,
        })
      }

      const contentType = response.headers.get('content-type') || ''

      // Handle PDF - we can't extract text server-side easily, suggest upload
      if (contentType.includes('application/pdf')) {
        return NextResponse.json({
          success: false,
          isPdf: true,
          error: 'This is a PDF file. Please download it and upload using the attach button for best results.',
        })
      }

      // Handle other binary files
      if (
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/zip') ||
        contentType.includes('image/') ||
        contentType.includes('video/') ||
        contentType.includes('audio/')
      ) {
        return NextResponse.json({
          success: false,
          error: 'This URL points to a binary file. Please download and upload it using the attach button.',
        })
      }

      // Get text content
      const text = await response.text()

      // Check if it's HTML and extract text content
      if (contentType.includes('text/html') || text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
        const extractedText = extractTextFromHtml(text)

        if (extractedText.length < 100) {
          return NextResponse.json({
            success: false,
            error: 'Could not extract meaningful content from this page. Please copy-paste the relevant text directly.',
          })
        }

        return NextResponse.json({
          success: true,
          content: extractedText,
          contentType: 'html',
          url: url,
        })
      }

      // Plain text content
      if (text.length < 50) {
        return NextResponse.json({
          success: false,
          error: 'The URL returned very little content. Please paste more detailed content directly.',
        })
      }

      return NextResponse.json({
        success: true,
        content: text,
        contentType: 'text',
        url: url,
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Request timed out. The URL may be slow or inaccessible. Please try uploading the file or pasting content directly.',
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Could not access this URL. It may require authentication or be behind a firewall. Please download and upload the file, or paste the content directly.',
      })
    }

  } catch (error) {
    console.error('URL fetch error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * Extract readable text from HTML, removing scripts, styles, and tags.
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // Replace common block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, '\n')
  text = text.replace(/<(br|hr)[^>]*\/?>/gi, '\n')

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ')

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&bull;/g, '•')

  // Clean up whitespace
  text = text
    .replace(/\t/g, ' ')
    .replace(/ +/g, ' ')
    .replace(/\n +/g, '\n')
    .replace(/ +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return text
}
