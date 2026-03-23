import { mergePaletteRefsToCompositeDataUrl } from './mergePaletteRefStrip'

/**
 * Sends the snapshot to NanoBanana API (generate-2) for image enhancement.
 * Keeps the building/facade and enhances background (sky, landscaping).
 * Returns the enhanced image as a data URL.
 * API: https://nanobananaapi.ai/dashboard
 * Docs: https://docs.nanobananaapi.ai/nanobanana-api/generate-image-2
 *
 * Panel references are merged into one composite JPEG so `imageUrls` stays small
 * (building + at most one ref sheet)—many providers 500 on many large data: URIs.
 */

const NANOBANANA_BASE = 'https://api.nanobananaapi.ai/api/v1/nanobanana'
const NANOBANANA_ORIGIN = 'https://api.nanobananaapi.ai'

/**
 * Result URLs are sometimes returned as root-relative paths (/files/...).
 * A bare fetch("/files/...") hits the Vite dev server → 404. Resolve against the API origin.
 */
export function resolveNanobananaAssetUrl(url: string): string {
  const u = url.trim()
  if (!u) return u
  if (u.startsWith('data:')) return u
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('//')) return `https:${u}`
  try {
    const path = u.startsWith('/') ? u : `/${u}`
    return new URL(path, `${NANOBANANA_ORIGIN}/`).href
  } catch {
    return u
  }
}

async function safeParseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const text = await res.text()
    if (!text) return {}
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {}
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read image blob'))
    reader.readAsDataURL(blob)
  })
}

/** taskId may live under data, result, or use task_id. */
function findTaskId(obj: unknown, depth = 0): string | null {
  if (depth > 6 || obj === null || obj === undefined) return null
  if (typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>
  for (const k of ['taskId', 'task_id']) {
    const v = o[k]
    if (typeof v === 'string' && v.length > 0) return v
    if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  }
  for (const k of ['data', 'result', 'payload']) {
    const inner = findTaskId(o[k], depth + 1)
    if (inner) return inner
  }
  return null
}

/**
 * record-info returns either a flat object (quickstart) or { code, data: { successFlag, ... } }.
 */
function getPollingPayload(statusJson: Record<string, unknown>): Record<string, unknown> {
  const d = statusJson.data
  if (d && typeof d === 'object') {
    const inner = d as Record<string, unknown>
    if (inner.successFlag !== undefined || inner.response !== undefined) return inner
    const nested = inner.data
    if (nested && typeof nested === 'object') {
      const n = nested as Record<string, unknown>
      if (n.successFlag !== undefined) return n
    }
  }
  return statusJson
}

function asSuccessFlag(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function extractResultImageUrl(payload: Record<string, unknown>): string | null {
  const fromObj = (o: unknown): string | null => {
    if (!o || typeof o !== 'object') return null
    const r = o as Record<string, unknown>
    for (const k of ['resultImageUrl', 'result_image_url', 'imageUrl', 'url', 'outputUrl']) {
      const v = r[k]
      if (typeof v === 'string' && v.length > 2) return v
    }
    return null
  }
  return (
    fromObj(payload) ??
    fromObj(payload.response) ??
    fromObj(payload.info) ??
    null
  )
}

/** Download result bytes; in dev, fall back to same-origin proxy if CORS/network fails. */
async function fetchResultToDataUrl(resolvedUrl: string): Promise<string> {
  const fetchOnce = async (url: string) => {
    const r = await fetch(url)
    if (!r.ok) throw new Error(String(r.status))
    return blobToDataUrl(await r.blob())
  }
  try {
    return await fetchOnce(resolvedUrl)
  } catch {
    if (import.meta.env.DEV) {
      const proxy = `/api/nb-asset?src=${encodeURIComponent(resolvedUrl)}`
      try {
        return await fetchOnce(proxy)
      } catch {
        /* use direct URL in <img> */
      }
    }
  }
  return resolvedUrl
}

/** Core instruction: never change the customer's building shape or facade design. */
const PRESERVE_INSTRUCTION =
  'CRITICAL: Preserve this building exactly as shown—same structure, same geometry, same facade layout, same cladding panels and all colors and materials. Do not redesign, reshape, or alter the building in any way. Only improve lighting, environment, and presentation quality.'

/** Default enhancement: premium arch-viz look without changing the building. */
const DEFAULT_STYLE =
  'Turn this into a final architectural visualization. Replace the plain background with a realistic clear sky and natural daylight. Add minimal, tasteful landscaping: soft ground, small trees or shrubs in planters at the base if appropriate. Result: professional 3D render for a client—clean, modern, ACP/clad building, photorealistic, presentation-ready, high-end architectural visualization.'

export const DEFAULT_PROMPT = `${PRESERVE_INSTRUCTION} ${DEFAULT_STYLE}`

export type NanobananaGenerateOptions = {
  aspectRatio?: string
  resolution?: string
  outputFormat?: string
  googleSearch?: boolean
  /** Smaller max side can avoid provider 500s on large uploads (default 1024). */
  maxSendDimension?: number
  /** When true (Image Studio), apply extra retries + legacy API on generate-2 code 500. */
  imageStudioMode?: boolean
  /**
   * Extra reference images (data URLs) appended after the main photo.
   * API max 14 images total — we keep main + up to 13 refs.
   */
  paletteReferenceDataUrls?: string[]
  /** Cap how many palette refs are sent (smaller payloads; some providers error on many images). */
  maxPaletteReferences?: number
}

const POLL_INTERVAL_MS = 3000
const MAX_WAIT_MS = 300000 // 5 min

/** Max dimension (width or height) for the image we send to avoid 413 Content Too Large. */
const MAX_SEND_DIMENSION = 1024
/** JPEG quality for request payload (keeps size well under typical body limits). */
const SEND_JPEG_QUALITY = 0.82

/** Must match generate-2 API enum; used when `auto` misbehaves on img2img. */
const ASPECT_RATIO_PRESETS: { key: string; w: number; h: number }[] = [
  { key: '1:1', w: 1, h: 1 },
  { key: '2:3', w: 2, h: 3 },
  { key: '3:2', w: 3, h: 2 },
  { key: '3:4', w: 3, h: 4 },
  { key: '4:3', w: 4, h: 3 },
  { key: '4:5', w: 4, h: 5 },
  { key: '5:4', w: 5, h: 4 },
  { key: '9:16', w: 9, h: 16 },
  { key: '16:9', w: 16, h: 9 },
  { key: '21:9', w: 21, h: 9 },
]

/**
 * Pick the closest API aspect ratio to the source image (reduces server-side issues vs `auto` on some accounts).
 */
export function getNearestAspectRatioFromDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = img.naturalWidth || 1
      const h = img.naturalHeight || 1
      const r = w / h
      let best = '4:3'
      let bestScore = Infinity
      for (const { key, w: rw, h: rh } of ASPECT_RATIO_PRESETS) {
        const v = rw / rh
        const score = Math.abs(Math.log(r / v))
        if (score < bestScore) {
          bestScore = score
          best = key
        }
      }
      resolve(best)
    }
    img.onerror = () => reject(new Error('Failed to read image dimensions'))
    img.src = dataUrl
  })
}

/**
 * Resize and compress a data URL to JPEG so the request body stays under server/Cloudflare limits (413).
 */
function compressImageForUpload(dataUrl: string, maxSide: number = MAX_SEND_DIMENSION): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const scale = Math.min(1, maxSide / Math.max(w, h))
      const cw = Math.round(w * scale)
      const ch = Math.round(h * scale)
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, cw, ch)
      try {
        const out = canvas.toDataURL('image/jpeg', SEND_JPEG_QUALITY)
        resolve(out)
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image for compression'))
    img.src = dataUrl
  })
}

/**
 * Builds the full enhancement prompt so the model preserves the building
 * and applies optional user style (e.g. "Zaha Hadid influence, sand texture with anodise").
 * Structure and facade are always preserved; only style and environment are guided by the user.
 */
export function buildRenderPrompt(userStyleHint?: string | null): string {
  const stylePart =
    userStyleHint?.trim() ?
      `Apply this aesthetic to the image (without changing the building structure or facade): ${userStyleHint.trim()}. `
    : ''
  return `${PRESERVE_INSTRUCTION} ${stylePart}${DEFAULT_STYLE}`
}

const LEGACY_IMAGE_SIZES = new Set([
  '1:1',
  '9:16',
  '16:9',
  '3:4',
  '4:3',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '21:9',
])

function toLegacyImageSize(aspect: string | undefined): string {
  const a = aspect?.trim() || '16:9'
  return LEGACY_IMAGE_SIZES.has(a) ? a : '4:3'
}

/** Legacy /generate requires a callback URL; we poll record-info instead. */
const LEGACY_CALLBACK_PLACEHOLDER = 'https://example.com/'

type Generate2Body = {
  prompt: string
  aspectRatio: string
  resolution: string
  outputFormat: string
  googleSearch: boolean
}

async function postGenerate2(
  key: string,
  imageUrls: string[],
  body: Generate2Body
): Promise<{ taskId: string | null; code: number; msg: string; httpStatus: number }> {
  const safeP = body.prompt.length > 8000 ? `${body.prompt.slice(0, 7997)}...` : body.prompt
  const res = await fetch(`${NANOBANANA_BASE}/generate-2`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: safeP,
      imageUrls,
      aspectRatio: body.aspectRatio,
      resolution: body.resolution,
      outputFormat: body.outputFormat,
      googleSearch: body.googleSearch,
    }),
  })
  if (res.status === 413) {
    return { taskId: null, code: 413, msg: 'Request too large', httpStatus: 413 }
  }
  const json = await safeParseJson(res)
  const codeRaw = json.code
  const apiCode =
    typeof codeRaw === 'number' ? codeRaw : typeof codeRaw === 'string' ? Number(codeRaw) : res.status
  const msg =
    (typeof json.msg === 'string' ? json.msg : null) ??
    (typeof json.message === 'string' ? json.message : null) ??
    (typeof json.error === 'string' ? json.error : null) ??
    'Unknown error'
  return {
    taskId: findTaskId(json),
    code: Number.isFinite(apiCode) ? apiCode : res.status,
    msg,
    httpStatus: res.status,
  }
}

async function postGenerateLegacy(
  key: string,
  imageUrls: string[],
  prompt: string,
  imageSize: string
): Promise<{ taskId: string | null; code: number; msg: string }> {
  const safeP = prompt.length > 8000 ? `${prompt.slice(0, 7997)}...` : prompt
  const res = await fetch(`${NANOBANANA_BASE}/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: safeP,
      type: 'IMAGETOIAMGE',
      imageUrls,
      numImages: 1,
      image_size: imageSize,
      callBackUrl: LEGACY_CALLBACK_PLACEHOLDER,
    }),
  })
  const json = await safeParseJson(res)
  const codeRaw = json.code
  const apiCode =
    typeof codeRaw === 'number' ? codeRaw : typeof codeRaw === 'string' ? Number(codeRaw) : res.status
  const msg =
    (typeof json.msg === 'string' ? json.msg : null) ??
    (typeof json.message === 'string' ? json.message : null) ??
    'Unknown error'
  return {
    taskId: findTaskId(json),
    code: Number.isFinite(apiCode) ? apiCode : res.status,
    msg,
  }
}

function isRetryableGenerate2Failure(code: number, msg: string): boolean {
  return code === 500 || code === 502 || code === 503 || /server exception|internal error|try again/i.test(msg)
}

/**
 * generate-2 attempts + optional Image Studio legacy /generate.
 * Throws on auth, credits, 413, or hard generate-2 failure (same rules as before).
 */
async function runNanobananaImg2ImgPhase(
  key: string,
  imageUrls: string[],
  attempts: Generate2Body[],
  safePrompt: string,
  imageStudioMode: boolean | undefined,
  aspectRatio: string | undefined
): Promise<{ taskId: string | null; lastMsg: string; lastCode: number }> {
  let taskId: string | null = null
  let lastMsg = 'Unknown error'
  let lastCode = 0

  for (let i = 0; i < attempts.length; i++) {
    const r = await postGenerate2(key, imageUrls, attempts[i])
    lastMsg = r.msg
    lastCode = r.code
    if (r.taskId) {
      taskId = r.taskId
      break
    }
    if (r.code === 401 || r.httpStatus === 401) {
      throw new Error(
        `NanoBanana API: Invalid or missing API key. Check VITE_NANOBANANA_KEY and https://nanobananaapi.ai/api-key`
      )
    }
    if (r.code === 402 || r.httpStatus === 402) {
      throw new Error(`NanoBanana API: Insufficient credits. Top up at https://nanobananaapi.ai/dashboard`)
    }
    if (r.code === 413) {
      throw new Error(
        'NanoBanana API: Request too large (413). Try a smaller photo or lower resolution.'
      )
    }
    const isLastAttempt = i === attempts.length - 1
    const failRetryable = isRetryableGenerate2Failure(r.code, r.msg)
    if (!isLastAttempt && failRetryable) continue
    if (imageStudioMode && isLastAttempt && failRetryable) break
    throw new Error(`NanoBanana API error: ${r.msg} (code ${r.code})`)
  }

  if (!taskId && imageStudioMode) {
    const legSize = toLegacyImageSize(aspectRatio)
    let leg = await postGenerateLegacy(key, imageUrls, safePrompt, legSize)
    lastMsg = leg.msg
    lastCode = leg.code
    if (leg.taskId) taskId = leg.taskId
    if (!taskId && isRetryableGenerate2Failure(leg.code, leg.msg)) {
      leg = await postGenerateLegacy(key, imageUrls, DEFAULT_PROMPT, '4:3')
      lastMsg = leg.msg
      lastCode = leg.code
      if (leg.taskId) taskId = leg.taskId
    }
    if (!taskId) {
      if (leg.code === 401) {
        throw new Error(
          `NanoBanana API: Invalid or missing API key. Check VITE_NANOBANANA_KEY and https://nanobananaapi.ai/api-key`
        )
      }
      if (leg.code === 402) {
        throw new Error(`NanoBanana API: Insufficient credits. Top up at https://nanobananaapi.ai/dashboard`)
      }
    }
  }

  return { taskId, lastMsg, lastCode }
}

export async function enhanceImageWithNanobanana(
  imageDataUrl: string,
  prompt: string = DEFAULT_PROMPT,
  options?: NanobananaGenerateOptions
): Promise<string> {
  const key = (import.meta.env.VITE_NANOBANANA_KEY as string | undefined)?.trim()
  if (!key) {
    throw new Error('Missing VITE_NANOBANANA_KEY. Add it to .env or .env.local (get a key at https://nanobananaapi.ai/api-key).')
  }

  const opts = options ?? {}
  const maxDim = Math.min(
    2048,
    Math.max(320, opts.maxSendDimension ?? MAX_SEND_DIMENSION)
  )
  const hasPaletteRefs = (opts.paletteReferenceDataUrls?.length ?? 0) > 0
  const mainMaxDim = hasPaletteRefs ? Math.min(maxDim, 768) : maxDim
  const payloadImageUrl = await compressImageForUpload(imageDataUrl, mainMaxDim)

  const refMaxSide = Math.min(384, mainMaxDim)
  const maxRefCount = Math.min(8, opts.maxPaletteReferences ?? 8)
  const compressedRefs: string[] = []
  for (const raw of (opts.paletteReferenceDataUrls ?? []).slice(0, maxRefCount)) {
    if (typeof raw !== 'string' || !raw.startsWith('data:')) continue
    try {
      compressedRefs.push(await compressImageForUpload(raw, refMaxSide))
    } catch {
      /* skip invalid ref */
    }
  }

  let refPayload: string[] = []
  if (compressedRefs.length === 1) {
    refPayload = [compressedRefs[0]]
  } else if (compressedRefs.length > 1) {
    const merged = await mergePaletteRefsToCompositeDataUrl(compressedRefs, {
      maxWidth: 920,
      maxHeight: 400,
      gap: 6,
      jpegQuality: 0.8,
    })
    if (merged) {
      refPayload = [await compressImageForUpload(merged, 720)]
    } else {
      refPayload = [compressedRefs[0]]
    }
  }
  const imageUrls = [payloadImageUrl, ...refPayload]

  const safePrompt = prompt.length > 8000 ? `${prompt.slice(0, 7997)}...` : prompt
  const googleSearch = opts.googleSearch ?? false

  const attempts: Generate2Body[] = []

  if (opts.imageStudioMode) {
    /** Docs default `auto` + 1K is the most reliable for img2img. */
    attempts.push({
      prompt: safePrompt,
      aspectRatio: 'auto',
      resolution: opts.resolution ?? '1K',
      outputFormat: opts.outputFormat ?? 'jpg',
      googleSearch: false,
    })
    attempts.push({
      prompt: safePrompt,
      aspectRatio: opts.aspectRatio ?? '16:9',
      resolution: opts.resolution ?? '1K',
      outputFormat: opts.outputFormat ?? 'jpg',
      googleSearch,
    })
    attempts.push({
      prompt: `${DEFAULT_PROMPT} Optional exterior finish hint (do not change building shape): ${safePrompt.slice(0, 520)}`,
      aspectRatio: 'auto',
      resolution: '1K',
      outputFormat: 'jpg',
      googleSearch: false,
    })
    attempts.push({
      prompt: DEFAULT_PROMPT,
      aspectRatio: 'auto',
      resolution: '1K',
      outputFormat: 'jpg',
      googleSearch: false,
    })
  } else {
    attempts.push({
      prompt: safePrompt,
      aspectRatio: opts.aspectRatio ?? '16:9',
      resolution: opts.resolution ?? '1K',
      outputFormat: opts.outputFormat ?? 'jpg',
      googleSearch,
    })
  }

  const { taskId, lastMsg, lastCode } = await runNanobananaImg2ImgPhase(
    key,
    imageUrls,
    attempts,
    safePrompt,
    opts.imageStudioMode,
    opts.aspectRatio
  )

  if (!taskId && opts.imageStudioMode) {
    if (lastCode === 401) {
      throw new Error(
        `NanoBanana API: Invalid or missing API key. Check VITE_NANOBANANA_KEY and https://nanobananaapi.ai/api-key`
      )
    }
    if (lastCode === 402) {
      throw new Error(`NanoBanana API: Insufficient credits. Top up at https://nanobananaapi.ai/dashboard`)
    }
    throw new Error(
      `NanoBanana API error: ${lastMsg} (code ${lastCode}). Image Studio tried generate-2 and legacy /generate. ` +
        `Try 1K resolution, a smaller source photo, or disable Google grounding. Docs: https://docs.nanobananaapi.ai/nanobanana-api/generate-image-2`
    )
  }

  if (!taskId) {
    if (lastCode === 401) {
      throw new Error(
        `NanoBanana API: Invalid or missing API key. Check VITE_NANOBANANA_KEY and https://nanobananaapi.ai/api-key`
      )
    }
    if (lastCode === 402) {
      throw new Error(`NanoBanana API: Insufficient credits. Top up at https://nanobananaapi.ai/dashboard`)
    }
    throw new Error(
      !taskId && lastCode
        ? `NanoBanana API error: ${lastMsg} (code ${lastCode})`
        : `NanoBanana API error: ${lastMsg} (no taskId — check API key, credits, or dashboard for outages)`
    )
  }

  // Poll until done (early polls may return HTTP 404 / code 404 until the task is registered)
  const start = Date.now()
  while (Date.now() - start < MAX_WAIT_MS) {
    const statusRes = await fetch(
      `${NANOBANANA_BASE}/record-info?taskId=${encodeURIComponent(taskId)}`,
      { method: 'GET', headers: { Authorization: `Bearer ${key}` } }
    )
    if (statusRes.status === 401) {
      throw new Error('NanoBanana API: Unauthorized when checking task status (invalid key?)')
    }

    const statusJson = await safeParseJson(statusRes)
    const http404 = statusRes.status === 404
    const code404 = statusJson.code === 404
    if (http404 || code404) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
      continue
    }

    const data = getPollingPayload(statusJson)
    const successFlag = asSuccessFlag(data.successFlag)

    if (successFlag === 1) {
      const rawUrl = extractResultImageUrl(data)
      if (!rawUrl) {
        throw new Error('NanoBanana API: No image URL in success response')
      }
      const resultUrl = resolveNanobananaAssetUrl(rawUrl)
      return fetchResultToDataUrl(resultUrl)
    }

    if (successFlag === 2 || successFlag === 3) {
      const errMsg =
        (typeof data.errorMessage === 'string' ? data.errorMessage : null) ??
        (typeof data.msg === 'string' ? data.msg : null) ??
        (typeof statusJson.msg === 'string' ? statusJson.msg : null) ??
        'Generation failed'
      throw new Error(`NanoBanana API: ${errMsg}`)
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }

  throw new Error('NanoBanana API: Timed out waiting for image generation')
}
