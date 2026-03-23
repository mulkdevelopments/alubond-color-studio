import type { AlubondColor, PanelTextureRef } from '../types'

/**
 * Stable index 0..modulo-1 from a mesh uuid (IFC faces have no facade row/stripe).
 * Used so fusion / dual textures vary per surface like the facade grid.
 */
export function stripeFromMeshUuid(uuid: string, modulo: number): number {
  if (modulo <= 0) return 0
  let h = 0
  for (let i = 0; i < uuid.length; i++) {
    h = (Math.imul(31, h) + uuid.charCodeAt(i)) | 0
  }
  return Math.abs(h) % modulo
}

/** Ordered panel textures that rotate by facade row (fusion). */
export function getFusionTextureCycle(color: AlubondColor): PanelTextureRef[] | null {
  if (color.finish !== 'fusion') return null
  if (color.fusionPanelCycle && color.fusionPanelCycle.length >= 2) {
    return color.fusionPanelCycle
  }
  if (color.panelTexture && color.panelTextureSecondary) {
    return [color.panelTexture, color.panelTextureSecondary]
  }
  return null
}

export function fusionTextureCycleLength(color: AlubondColor): number {
  return getFusionTextureCycle(color)?.length ?? 0
}
