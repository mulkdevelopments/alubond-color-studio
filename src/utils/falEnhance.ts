/**
 * Sends the snapshot to the server-side enhance API (Fal.ai Flux 2 Turbo Edit).
 * The API key is never sent to the browser. Returns the enhanced image as a data URL.
 */
const DEFAULT_PROMPT =
  'Turn this into a final architectural visualization. Keep the building, facade, and all colors and materials exactly as shown. Replace the plain background with a realistic clear sky and natural daylight. Add minimal, tasteful landscaping: soft ground, small trees or shrubs in planters at the base if appropriate, so it looks like a professional 3D render for a client—clean, modern, and presentation-ready.'

export async function enhanceImageWithFal(
  imageDataUrl: string,
  prompt: string = DEFAULT_PROMPT
): Promise<string> {
  const base = typeof window !== 'undefined' ? '' : process.env.VITE_APP_URL ?? ''
  const res = await fetch(`${base}/api/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl, prompt }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message = (data?.error as string) || res.statusText || 'Enhancement failed'
    throw new Error(message)
  }

  const data = (await res.json()) as { dataUrl?: string }
  if (!data?.dataUrl) {
    throw new Error('No image returned from the server. Try again.')
  }
  return data.dataUrl
}
