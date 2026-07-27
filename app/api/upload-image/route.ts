import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { ALLOWED_IMAGE_EXTENSIONS } from '@/lib/image-upload'

// Reports whether a Blob store is configured. The client uses this on the
// failure path to tell "no token, local dev — fall back to a data URL" apart
// from "this upload genuinely failed — tell the user." Needed because
// @vercel/blob surfaces both as the same "Failed to retrieve the client token"
// error, so the thrown error alone can't distinguish them.
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ configured: Boolean(process.env.BLOB_READ_WRITE_TOKEN) })
}

// This endpoint handles the client-side upload token request for images
// Used by templates that need to export large images (bypasses 4.5MB API body limit)
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate that it's an image upload. Same list the client pre-checks
        // against (lib/image-upload.ts) so the two can't drift.
        const ext = pathname.toLowerCase().split('.').pop()

        if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
          throw new Error(
            `Only image files are allowed (${ALLOWED_IMAGE_EXTENSIONS.join(', ')})`,
          )
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
