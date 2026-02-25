/**
 * Shared enhance logic for both Vercel API and Vite dev server.
 * Call this from api/enhance.ts and from vite.config.ts middleware.
 */
const FAL_EDIT_ENDPOINT = 'fal-ai/flux-2/turbo/edit'
const DEFAULT_PROMPT =
  'Turn this into a final architectural visualization. Keep the building, facade, and all colors and materials exactly as shown. Replace the plain background with a realistic clear sky and natural daylight. Add minimal, tasteful landscaping: soft ground, small trees or shrubs in planters at the base if appropriate, so it looks like a professional 3D render for a client—clean, modern, and presentation-ready.'

export async function runEnhance(
  imageDataUrl: string,
  apiKey: string,
  prompt: string = DEFAULT_PROMPT
): Promise<string> {
  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: apiKey })

  const result = await fal.subscribe(FAL_EDIT_ENDPOINT, {
    input: { prompt, image_urls: [imageDataUrl] },
  })

  const data = result.data as { images?: Array<{ url?: string }> }
  const imageUrl = data?.images?.[0]?.url
  if (!imageUrl) throw new Error('No image returned from Fal.ai.')

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) throw new Error('Failed to fetch enhanced image from Fal.')
  const buffer = Buffer.from(await imageResponse.arrayBuffer())
  const base64 = buffer.toString('base64')
  const contentType = imageResponse.headers.get('content-type') || 'image/png'
  return `data:${contentType};base64,${base64}`
}
