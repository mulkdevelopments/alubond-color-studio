/**
 * Sends the snapshot to NanoBanana API (generate-2) for image enhancement.
 * Keeps the building/facade and enhances background (sky, landscaping).
 * Returns the enhanced image as a data URL.
 * API: https://nanobananaapi.ai/dashboard
 * Docs: https://docs.nanobananaapi.ai
 */

const NANOBANANA_BASE = 'https://api.nanobananaapi.ai/api/v1/nanobanana'

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
}

const POLL_INTERVAL_MS = 3000
const MAX_WAIT_MS = 300000 // 5 min

/** Max dimension (width or height) for the image we send to avoid 413 Content Too Large. */
const MAX_SEND_DIMENSION = 1024
/** JPEG quality for request payload (keeps size well under typical body limits). */
const SEND_JPEG_QUALITY = 0.82

type TaskStatus = {
  successFlag: 0 | 1 | 2 | 3
  response?: { resultImageUrl?: string }
  errorMessage?: string
}

/**
 * Resize and compress a data URL to JPEG so the request body stays under server/Cloudflare limits (413).
 */
function compressImageForUpload(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const scale = Math.min(1, MAX_SEND_DIMENSION / Math.max(w, h))
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

export async function enhanceImageWithNanobanana(
  imageDataUrl: string,
  prompt: string = DEFAULT_PROMPT,
  options?: NanobananaGenerateOptions
): Promise<string> {
  const key = (import.meta.env.VITE_NANOBANANA_KEY as string | undefined)?.trim()
  if (!key) {
    throw new Error('Missing VITE_NANOBANANA_KEY. Add it to .env or .env.local (get a key at https://nanobananaapi.ai/api-key).')
  }

  // Compress/resize to avoid 413 Content Too Large (request body limit)
  const payloadImageUrl = await compressImageForUpload(imageDataUrl)

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }

  const opts = options ?? {}
  const createRes = await fetch(`${NANOBANANA_BASE}/generate-2`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      imageUrls: [payloadImageUrl],
      aspectRatio: opts.aspectRatio ?? '16:9',
      resolution: opts.resolution ?? '1K',
      outputFormat: opts.outputFormat ?? 'png',
      googleSearch: opts.googleSearch ?? false,
    }),
  })

  if (createRes.status === 413) {
    throw new Error(
      'NanoBanana API: Request too large (413). The image was compressed; if you still see this, try a smaller view or lower resolution.'
    )
  }

  let createJson: { code?: number; msg?: string; message?: string; error?: string; data?: { taskId?: string } }
  try {
    createJson = await createRes.json()
  } catch {
    createJson = {}
  }
  const taskId =
    createJson?.data?.taskId ??
    (createJson?.data && typeof createJson.data === 'object' && 'taskId' in createJson.data
      ? (createJson.data as { taskId?: string }).taskId
      : null)

  if (!createRes.ok || !taskId) {
    const msg = createJson?.msg ?? createJson?.message ?? createJson?.error ?? 'Unknown error'
    if (createRes.status === 401) {
      throw new Error(`NanoBanana API: Invalid or missing API key. Check VITE_NANOBANANA_KEY and https://nanobananaapi.ai/api-key`)
    }
    if (createRes.status === 402) {
      throw new Error(`NanoBanana API: Insufficient credits. Top up at https://nanobananaapi.ai/dashboard`)
    }
    throw new Error(`NanoBanana API error: ${msg}`)
  }

  // Poll until done
  const start = Date.now()
  while (Date.now() - start < MAX_WAIT_MS) {
    const statusRes = await fetch(
      `${NANOBANANA_BASE}/record-info?taskId=${encodeURIComponent(taskId)}`,
      { method: 'GET', headers: { Authorization: `Bearer ${key}` } }
    )
    const statusJson = await statusRes.json()

    // Response can be wrapped in { code, msg, data } or be the task object directly
    const data = statusJson?.data ?? statusJson
    const successFlag = data?.successFlag as TaskStatus['successFlag'] | undefined

    if (successFlag === 1) {
      const resultUrl = data?.response?.resultImageUrl ?? data?.info?.resultImageUrl
      if (!resultUrl) {
        throw new Error('NanoBanana API: No image URL in success response')
      }
      const blob = await fetch(resultUrl).then((r) => r.blob())
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read enhanced image'))
        reader.readAsDataURL(blob)
      })
    }

    if (successFlag === 2 || successFlag === 3) {
      const errMsg = data?.errorMessage ?? data?.msg ?? statusJson?.msg ?? 'Generation failed'
      throw new Error(`NanoBanana API: ${errMsg}`)
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }

  throw new Error('NanoBanana API: Timed out waiting for image generation')
}
