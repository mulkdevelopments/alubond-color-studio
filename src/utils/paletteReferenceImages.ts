import type { AlubondColor, PanelTextureRef } from '../types'
import { getFusionTextureCycle } from './fusionPanelCycle'
import { getPanelTextureUrl } from './panelTextureUrl'

/** Max panel/swatch refs to attach (API allows many; keep payload reasonable). */
const MAX_PALETTE_REFS = 8
const REF_JPEG_MAX_SIDE = 512
const REF_JPEG_QUALITY = 0.86

function absolutePublicUrl(relativePath: string): string {
  if (typeof window === 'undefined') return relativePath
  if (/^https?:\/\//i.test(relativePath)) return relativePath
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `${window.location.origin}${path}`
}

function downscaleDataUrlToJpeg(dataUrl: string, maxSide: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const scale = Math.min(1, maxSide / Math.max(w, h, 1))
      const cw = Math.max(1, Math.round(w * scale))
      const ch = Math.max(1, Math.round(h * scale))
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
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('Failed to load reference image'))
    img.src = dataUrl
  })
}

/** Solid-colour swatch when no panel PNG exists (Modern solids, etc.). */
export function hexSwatchDataUrl(hex: string, size = 256): string {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return 'data:image/jpeg;base64,'
  let h = hex.replace('#', '').trim()
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const n = parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) {
    ctx.fillStyle = '#c0c8d0'
    ctx.fillRect(0, 0, size, size)
    return canvas.toDataURL('image/jpeg', REF_JPEG_QUALITY)
  }
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const grd = ctx.createLinearGradient(0, 0, size, size)
  grd.addColorStop(0, `rgb(${r},${g},${b})`)
  grd.addColorStop(
    1,
    `rgb(${Math.max(0, r - 28)},${Math.max(0, g - 28)},${Math.max(0, b - 28)})`
  )
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1)
  return canvas.toDataURL('image/jpeg', REF_JPEG_QUALITY)
}

async function panelRefToJpegDataUrl(ref: PanelTextureRef): Promise<string | null> {
  const url = absolutePublicUrl(getPanelTextureUrl(ref))
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('read fail'))
      reader.readAsDataURL(blob)
    })
    return await downscaleDataUrlToJpeg(dataUrl, REF_JPEG_MAX_SIDE, REF_JPEG_QUALITY)
  } catch {
    return null
  }
}

/**
 * True when this colour uses real panel PNGs (fusion cycle or primary/secondary textures).
 * Solid Modern colours etc. use text (hex, name, finish) only — no reference images.
 */
export function colorUsesPanelTextureRefs(color: AlubondColor | null): boolean {
  if (!color) return false
  const cycle = getFusionTextureCycle(color)
  if (cycle && cycle.length >= 2) return true
  return !!(color.panelTexture || color.panelTextureSecondary)
}

/** True if any selected colour contributes panel PNG references (Image Studio / dialog). */
export function anyColorUsesPanelTextureRefs(colors: AlubondColor[]): boolean {
  return colors.some((c) => colorUsesPanelTextureRefs(c))
}

/** One reference thumbnail in the Image Studio strip, tied to a library colour for remove actions. */
export type PaletteRefItem = { url: string; sku: string; name: string }

/**
 * Merged panel reference JPEGs for several library colours (deduped, order preserved, capped).
 */
export async function buildPaletteReferenceDataUrlsMulti(colors: AlubondColor[]): Promise<string[]> {
  const seen = new Set<string>()
  const out: string[] = []
  for (const color of colors) {
    const batch = await buildPaletteReferenceDataUrls(color)
    for (const u of batch) {
      if (seen.has(u)) continue
      seen.add(u)
      out.push(u)
      if (out.length >= MAX_PALETTE_REFS) return out
    }
  }
  return out
}

/**
 * Reference thumbnails for Image Studio sidebar: one row per texture, tagged with owning colour (no cross-colour URL dedupe so each tile can remove the right palette entry).
 * Colours with no loadable panel PNG still get a hex swatch so the strip always reflects the selection.
 */
export async function buildPaletteReferenceItemsMulti(colors: AlubondColor[]): Promise<PaletteRefItem[]> {
  const out: PaletteRefItem[] = []
  for (const color of colors) {
    let batch = await buildPaletteReferenceDataUrls(color)
    if (batch.length === 0) {
      batch = [hexSwatchDataUrl(color.hex)]
    }
    for (const u of batch) {
      out.push({ url: u, sku: color.sku, name: color.name })
      if (out.length >= MAX_PALETTE_REFS) return out
    }
  }
  return out
}

/**
 * JPEG data URLs for Alubond **panel texture** finishes only (sent after the building photo).
 * Returns [] for null colour, solid colours, or if PNGs fail to load — use `buildFacadePrompt` for those.
 */
export async function buildPaletteReferenceDataUrls(color: AlubondColor | null): Promise<string[]> {
  const out: string[] = []
  if (!color) return out

  const cycle = getFusionTextureCycle(color)
  const panelRefs: PanelTextureRef[] = []

  if (cycle && cycle.length >= 2) {
    const seen = new Set<string>()
    for (const p of cycle) {
      const key = `${p.folder}/${p.fileId}`
      if (seen.has(key)) continue
      seen.add(key)
      panelRefs.push(p)
      if (panelRefs.length >= MAX_PALETTE_REFS) break
    }
  } else {
    if (color.panelTexture) panelRefs.push(color.panelTexture)
    if (color.panelTextureSecondary) panelRefs.push(color.panelTextureSecondary)
  }

  for (const ref of panelRefs) {
    const jpeg = await panelRefToJpegDataUrl(ref)
    if (jpeg) out.push(jpeg)
  }

  return out.slice(0, MAX_PALETTE_REFS)
}
