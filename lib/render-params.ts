// Shared URL parameter parsers for render pages.
//
// Every render page (app/render/*/page.tsx) parses query parameters
// to reconstruct template props. These helpers enforce consistent
// boolean defaults across all templates so that the export API
// (which sends String(booleanValue) or omits the key entirely)
// produces the same result regardless of which render page consumes it.
//
// Convention:
//   parseBoolTrue  -- param absent means true  (for fields shown by default)
//   parseBoolFalse -- param absent means false  (for fields hidden by default)

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

export type SearchParams = { [key: string]: string | string[] | undefined }

// Adapter: convert client-side URLSearchParams to the server-side format
// used by all the parse* helpers. Use in client components that call
// useSearchParams().
export function fromURLSearchParams(usp: URLSearchParams): SearchParams {
  const obj: SearchParams = {}
  usp.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

// Boolean param that defaults to TRUE when absent (uses !== 'false').
export function parseBoolTrue(params: SearchParams, key: string): boolean {
  return params[key] !== 'false'
}

// Boolean param that defaults to FALSE when absent (uses === 'true').
export function parseBoolFalse(params: SearchParams, key: string): boolean {
  return params[key] === 'true'
}

// String param with a fallback.
export function parseString(params: SearchParams, key: string, fallback: string = ''): string {
  return (params[key] as string) || fallback
}

// String param that may be null (no fallback).
export function parseStringOrNull(params: SearchParams, key: string): string | null {
  return (params[key] as string) || null
}

// Number param (float) with a fallback.
export function parseNumber(params: SearchParams, key: string, fallback: number = 0): number {
  const raw = params[key] as string
  if (!raw) return fallback
  const n = parseFloat(raw)
  return isNaN(n) ? fallback : n
}

// Integer param with a fallback.
export function parseInt_(params: SearchParams, key: string, fallback: number = 0): number {
  const raw = params[key] as string
  if (!raw) return fallback
  const n = parseInt(raw, 10)
  return isNaN(n) ? fallback : n
}

// Number param that returns undefined when absent (e.g. headlineFontSize).
export function parseNumberOrUndefined(params: SearchParams, key: string): number | undefined {
  const raw = params[key] as string
  if (!raw) return undefined
  const n = parseFloat(raw)
  return isNaN(n) ? undefined : n
}

// Enum/string param with type narrowing.
export function parseEnum<T extends string>(params: SearchParams, key: string, fallback: T): T {
  return ((params[key] as string) || fallback) as T
}

// ---------------------------------------------------------------------------
// Composite helpers
// ---------------------------------------------------------------------------

export interface ImageParams {
  imageUrl: string
  imagePositionX: number
  imagePositionY: number
  imageZoom: number
  grayscale: boolean
}

// Standard image position/zoom/grayscale param set.
export function parseImageParams(
  params: SearchParams,
  defaultImageUrl: string = '/assets/images/default_placeholder_image_1.png'
): ImageParams {
  return {
    imageUrl: parseString(params, 'imageUrl', defaultImageUrl),
    imagePositionX: parseNumber(params, 'imagePositionX', 0),
    imagePositionY: parseNumber(params, 'imagePositionY', 0),
    imageZoom: parseNumber(params, 'imageZoom', 1),
    grayscale: parseBoolFalse(params, 'grayscale'),
  }
}

export interface SpeakerParams {
  name: string
  role: string
  imageUrl: string
  imagePositionX: number
  imagePositionY: number
  imageZoom: number
}

// Parse a single speaker's params by index (1, 2, or 3).
export function parseSpeakerParams(params: SearchParams, index: 1 | 2 | 3): SpeakerParams {
  return {
    name: parseString(params, `speaker${index}Name`, 'Firstname Lastname'),
    role: parseString(params, `speaker${index}Role`, 'Role, Company'),
    imageUrl: parseString(params, `speaker${index}ImageUrl`, ''),
    imagePositionX: parseNumber(params, `speaker${index}ImagePositionX`, 0),
    imagePositionY: parseNumber(params, `speaker${index}ImagePositionY`, 0),
    imageZoom: parseNumber(params, `speaker${index}ImageZoom`, 1),
  }
}
