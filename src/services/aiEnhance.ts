/**
 * Free AI image enhancement via Hugging Face Inference API.
 * Get a free token: https://huggingface.co/settings/tokens (enable "Inference" or "Read").
 * Rate limit: 300 requests/hour on free tier.
 */

const HF_IMG2IMG_MODEL = 'stabilityai/stable-diffusion-2-1'
const ENHANCE_PROMPT =
  'Professional architectural visualization, modern building with trees and greenery, landscaping and plants around the base, clean render, white background, photorealistic, high quality'

export interface AiEnhanceResult {
  ok: true
  dataUrl: string
}

export interface AiEnhanceError {
  ok: false
  error: string
}

export type AiEnhanceResponse = AiEnhanceResult | AiEnhanceError

/**
 * Sends the image to Hugging Face image-to-image (or text-to-image with image as init)
 * and returns the enhanced image as data URL.
 * Free tier: https://huggingface.co/docs/api-inference
 */
export async function enhanceWithHuggingFace(
  imageDataUrl: string,
  apiKey: string,
  prompt: string = ENHANCE_PROMPT
): Promise<AiEnhanceResponse> {
  try {
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '')
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    const formData = new FormData()
    formData.append('inputs', new Blob([imageBytes], { type: 'image/png' }))
    formData.append('parameters', JSON.stringify({
      prompt,
      negative_prompt: 'blurry, low quality, distorted',
      num_inference_steps: 25,
      guidance_scale: 7.5,
    }))

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_IMG2IMG_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const text = await response.text()
      let err = `API error ${response.status}`
      try {
        const json = JSON.parse(text)
        if (json.error) err = json.error
        else if (json.estimated_time) err = `Model loading (try again in ~${Math.ceil(json.estimated_time)}s)`
      } catch {
        if (text) err = text.slice(0, 200)
      }
      return { ok: false, error: err }
    }

    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    return { ok: true, dataUrl }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: message }
  }
}

export async function enhanceWithHuggingFaceImg2Img(
  imageDataUrl: string,
  apiKey: string,
  prompt: string = ENHANCE_PROMPT
): Promise<AiEnhanceResponse> {
  try {
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '')

    const response = await fetch(
      `https://api-inference.huggingface.co/models/ostris/flux-fill-dev`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: base64Data,
          parameters: {
            prompt,
            num_inference_steps: 28,
            guidance_scale: 3.5,
          },
        }),
      }
    )

    if (!response.ok) {
      const text = await response.text()
      let err = `API error ${response.status}`
      try {
        const json = JSON.parse(text)
        if (json.error) err = json.error
        else if (json.estimated_time) err = `Model loading (try again in ~${Math.ceil(json.estimated_time)}s)`
      } catch {
        if (text) err = text.slice(0, 200)
      }
      return { ok: false, error: err }
    }

    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    return { ok: true, dataUrl }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: message }
  }
}

const STORAGE_KEY = 'alubond-hf-token'

export function getStoredToken(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setStoredToken(token: string): void {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
