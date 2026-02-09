import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

// This endpoint handles the client-side upload token request for Word documents
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate that it's a Word document upload
        const isDocx = pathname.endsWith('.docx')
        const isDoc = pathname.endsWith('.doc')

        if (!isDocx && !isDoc) {
          throw new Error('Only Word documents (.doc, .docx) are allowed')
        }

        return {
          allowedContentTypes: [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/msword', // .doc
          ],
          maximumSizeInBytes: 30 * 1024 * 1024, // 30MB max
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Word doc uploaded:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    )
  }
}
