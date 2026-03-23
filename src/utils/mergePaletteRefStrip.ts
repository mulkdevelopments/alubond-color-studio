/**
 * NanoBanana generate-2 expects `imageUrls` as URIs; multiple huge data URLs often trigger 500s.
 * Combine panel reference JPEGs into one grid so we send at most: [building, compositeRefs].
 */
export async function mergePaletteRefsToCompositeDataUrl(
  jpegDataUrls: string[],
  options?: { maxWidth?: number; maxHeight?: number; gap?: number; jpegQuality?: number }
): Promise<string | null> {
  if (jpegDataUrls.length === 0) return null
  if (jpegDataUrls.length === 1) return jpegDataUrls[0]

  const maxWidth = options?.maxWidth ?? 960
  const maxHeight = options?.maxHeight ?? 420
  const gap = options?.gap ?? 6
  const jpegQuality = options?.jpegQuality ?? 0.82

  const load = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load ref image'))
      img.src = url
    })

  let images: HTMLImageElement[]
  try {
    images = await Promise.all(jpegDataUrls.map(load))
  } catch {
    return null
  }

  const n = images.length
  const cols = Math.min(n, 4)
  const rows = Math.ceil(n / cols)

  let cellW = Math.floor((maxWidth - gap * Math.max(0, cols - 1)) / cols)
  let cellH = Math.floor((maxHeight - gap * Math.max(0, rows - 1)) / rows)
  cellW = Math.max(48, cellW)
  cellH = Math.max(48, cellH)

  const canvas = document.createElement('canvas')
  canvas.width = cols * cellW + gap * Math.max(0, cols - 1)
  canvas.height = rows * cellH + gap * Math.max(0, rows - 1)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#ececec'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < n; i++) {
    const img = images[i]
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * (cellW + gap)
    const y = row * (cellH + gap)
    const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight)
    const dw = Math.max(1, Math.round(img.naturalWidth * scale))
    const dh = Math.max(1, Math.round(img.naturalHeight * scale))
    const dx = x + Math.floor((cellW - dw) / 2)
    const dy = y + Math.floor((cellH - dh) / 2)
    ctx.drawImage(img, dx, dy, dw, dh)
  }

  try {
    return canvas.toDataURL('image/jpeg', jpegQuality)
  } catch {
    return null
  }
}
