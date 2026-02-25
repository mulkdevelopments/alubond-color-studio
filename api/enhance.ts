const FAL_EDIT_ENDPOINT = 'fal-ai/flux-2/turbo/edit'
const DEFAULT_PROMPT =
  'Turn this into a final architectural visualization. Keep the building, facade, and all colors and materials exactly as shown. Replace the plain background with a realistic clear sky and natural daylight. Add minimal, tasteful landscaping: soft ground, small trees or shrubs in planters at the base if appropriate, so it looks like a professional 3D render for a client—clean, modern, and presentation-ready.'

export default async function handler(
  req: { method?: string; body?: { imageDataUrl?: string; prompt?: string } },
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (o: object) => void }; end?: () => void }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.FAL_KEY
  if (!key?.trim()) {
    return res.status(500).json({
      error: 'FAL_KEY is not configured. Add it in Vercel project settings (Environment Variables).',
    })
  }

  try {
    const body = req.body
    const imageDataUrl = body?.imageDataUrl
    const prompt = body?.prompt ?? DEFAULT_PROMPT

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid imageDataUrl in request body.' })
    }

    const { fal } = await import('@fal-ai/client')
    fal.config({ credentials: key })
    const result = await fal.subscribe(FAL_EDIT_ENDPOINT, {
      input: { prompt, image_urls: [imageDataUrl] },
    })
    const data = result.data as { images?: Array<{ url?: string }> }
    const imageUrl = data?.images?.[0]?.url
    if (!imageUrl) return res.status(502).json({ error: 'No image returned from Fal.ai.' })

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) return res.status(502).json({ error: 'Failed to fetch enhanced image from Fal.' })
    const buffer = Buffer.from(await imageResponse.arrayBuffer())
    const base64 = buffer.toString('base64')
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    const dataUrl = `data:${contentType};base64,${base64}`

    return res.status(200).json({ dataUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Enhancement failed'
    console.error('Fal enhance error:', err)
    return res.status(502).json({ error: message })
  }
}
