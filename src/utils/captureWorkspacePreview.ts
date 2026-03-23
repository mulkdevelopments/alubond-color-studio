import { toJpeg } from 'html-to-image'

/**
 * Rasterize the visible Image Studio preview (building + optional ref column) to one JPEG data URL.
 * Uses pixelRatio 1 and moderate quality to keep NanoBanana JSON payloads small.
 */
export async function captureWorkspacePreviewToDataUrl(element: HTMLElement): Promise<string> {
  const rect = element.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) {
    throw new Error('Preview area is too small to capture')
  }

  return toJpeg(element, {
    quality: 0.82,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: '#141414',
    skipFonts: true,
  })
}
