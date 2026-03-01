/**
 * Sends the snapshot to Fal.ai Flux 2 Turbo Edit to create a final 3D-style
 * presentation render (sky, context, optional landscaping). Returns the enhanced image as a data URL.
 */
const FAL_EDIT_ENDPOINT = 'fal-ai/flux-2/turbo/edit'
const DEFAULT_PROMPT =
  'Turn this into a final architectural visualization. Keep the building, facade, and all colors and materials exactly as shown. Replace the plain background with a realistic clear sky and natural daylight. Add minimal, tasteful landscaping: soft ground, small trees or shrubs in planters at the base if appropriate, so it looks like a professional 3D render for a client—clean, modern, and presentation-ready.'

export async function enhanceImageWithFal(
  imageDataUrl: string,
  prompt: string = DEFAULT_PROMPT
): Promise<string> {
  const key = (import.meta.env.VITE_FAL_KEY as string | undefined)?.trim()
  if (!key) {
    throw new Error('Missing VITE_FAL_KEY. Add it to .env or .env.local.')
  }

  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: key })

  let result
  try {
    result = await fal.subscribe(FAL_EDIT_ENDPOINT, {
      input: {
        prompt,
        image_urls: [imageDataUrl],
      },
    })
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    const body = (err as { body?: unknown })?.body
    const message = (err as { message?: string })?.message
    const detail =
      typeof body === 'object' && body !== null && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : body != null
          ? JSON.stringify(body)
          : message ?? 'Unknown error'
    if (status === 403) {
      throw new Error(
        `Fal.ai access denied (403). Check: 1) API key is valid and has "API" scope at fal.ai/dashboard/keys 2) Account has credits. Details: ${detail}`
      )
    }
    throw new Error(`Fal.ai error${status != null ? ` (${status})` : ''}: ${detail}`)
  }

  const data = result.data as { images?: Array<{ url?: string }> }
  const imageUrl = data?.images?.[0]?.url
  if (!imageUrl) {
    throw new Error('No image returned from Fal.ai')
  }

  const blob = await fetch(imageUrl).then((r) => r.blob())
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read enhanced image'))
    reader.readAsDataURL(blob)
  })
}
