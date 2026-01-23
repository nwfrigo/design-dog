import pdfParse from 'pdf-parse'

export interface ParsedPDF {
  text: string
  numPages: number
  info: {
    title?: string
    author?: string
    subject?: string
  }
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  try {
    const data = await pdfParse(buffer)

    return {
      text: data.text.trim(),
      numPages: data.numpages,
      info: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
      },
    }
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Extract key content sections from parsed PDF text
export function extractBriefContent(text: string): string {
  // Clean up the text
  let cleaned = text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page numbers
    .replace(/\b\d+\s*(?:of\s*\d+)?\s*$/gm, '')
    // Trim
    .trim()

  // If text is very long, try to extract the most relevant parts
  if (cleaned.length > 5000) {
    // Look for common brief sections
    const sections = [
      /(?:executive\s+summary|overview|introduction)[:\s]*([\s\S]*?)(?=\n\n|\z)/i,
      /(?:key\s+(?:points|takeaways|highlights))[:\s]*([\s\S]*?)(?=\n\n|\z)/i,
      /(?:about|description)[:\s]*([\s\S]*?)(?=\n\n|\z)/i,
    ]

    const extracted: string[] = []
    for (const pattern of sections) {
      const match = cleaned.match(pattern)
      if (match) {
        extracted.push(match[1].trim())
      }
    }

    if (extracted.length > 0) {
      cleaned = extracted.join('\n\n')
    } else {
      // Just take the first 5000 characters
      cleaned = cleaned.slice(0, 5000) + '...'
    }
  }

  return cleaned
}
