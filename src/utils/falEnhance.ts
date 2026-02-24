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
  const key = import.meta.env.VITE_FAL_KEY as string | undefined
  if (!key?.trim()) {
    throw new Error('Missing VITE_FAL_KEY. Add it to .env or .env.local.')
  }

  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: key })

  const result = await fal.subscribe(FAL_EDIT_ENDPOINT, {
    input: {
      prompt,
      image_urls: [imageDataUrl],
    },
  })

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
