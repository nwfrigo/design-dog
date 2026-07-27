/**
 * Shared validation + failure handling for the image uploaders.
 *
 * Every image upload path (`EditorScreen`, the three library modals, the
 * Stage & Bench image editor) catches upload errors and falls back to a
 * `FileReader` data URL. That fallback exists for one specific case: local dev
 * without `BLOB_READ_WRITE_TOKEN`, where there is no Blob store to upload to.
 *
 * The problem was that it caught *everything*, so a genuine server rejection
 * looked identical to success — the image landed on the canvas as a
 * multi-megabyte base64 string, which ARCHITECTURE.md notes can exceed the
 * export pipeline's body limit and cause silent export failures. The user got
 * no error either way.
 *
 * Note on why this isn't done by inspecting the error: `@vercel/blob` collapses
 * every failure of the token endpoint into one message — "Failed to retrieve
 * the client token" — whether the route rejected the file with a 400 or no
 * token is configured at all. The two cases are indistinguishable from the
 * thrown error, so we (a) validate the file up front, where we can give an
 * accurate reason, and (b) ask the server whether Blob is configured before
 * deciding a failure is safe to paper over with a data URL.
 */

/** Extensions the upload route accepts. Single source of truth — the route
 *  imports this, and the client pre-checks against it so the user gets a real
 *  reason instead of a generic failure after a round trip. */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] as const

/** Generic message for infrastructure failures (network, Blob outage). */
export const IMAGE_UPLOAD_FAILED = 'Upload failed — try again'

/** Shown when the browser doesn't consider the picked file an image at all. */
export const IMAGE_UPLOAD_NOT_IMAGE = "That file isn't an image"

/** Shown when the file is an image but not a format the pipeline accepts. */
export const IMAGE_UPLOAD_BAD_FORMAT = 'Use a JPG, PNG, GIF, WebP or SVG'

/**
 * Pre-flight check, mirroring the upload route's own rules so a predictable
 * rejection is reported instantly and specifically rather than as a generic
 * failure. Returns null when the file is acceptable.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return IMAGE_UPLOAD_NOT_IMAGE
  const ext = file.name.toLowerCase().split('.').pop()
  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.includes(ext as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])) {
    return IMAGE_UPLOAD_BAD_FORMAT
  }
  return null
}

/**
 * Whether a Blob store is actually configured, per the server.
 *
 * Used on the failure path only, to decide whether the data-URL fallback is
 * appropriate (local dev, no token) or whether the user needs to see an error
 * (everything else). Defaults to `true` on any doubt, so an unexpected
 * condition surfaces an error rather than silently degrading to a data URL.
 */
export async function isBlobConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/upload-image', { method: 'GET' })
    if (!response.ok) return true
    const data = (await response.json()) as { configured?: boolean }
    return data.configured !== false
  } catch {
    return true
  }
}
