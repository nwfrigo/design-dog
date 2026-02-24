import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

// This endpoint handles the client-side upload token request for images
// Used by templates that need to export large images (bypasses 4.5MB API body limit)
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate that it's an image upload
        const ext = pathname.toLowerCase().split('.').pop()
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

        if (!ext || !allowedExtensions.includes(ext)) {
          throw new Error('Only image files are allowed (jpg, jpeg, png, gif, webp, svg)')
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB max
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Image uploaded:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    )
  }
}
