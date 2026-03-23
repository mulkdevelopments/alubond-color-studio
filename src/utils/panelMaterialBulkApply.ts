import type { AlubondColor, MaterialState } from '../types'
import { getFusionTextureCycle } from './fusionPanelCycle'
import { materialPropsForFolder } from '../services/fusionSuggestions'

/** Same shape as facade panels: `row` for alternating fusion, `stripeIndex` for N-way texture cycles. */
export type PanelMaterialSlot = { uuid: string; row: number; stripeIndex: number }

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

/**
 * Build per-uuid material state for a batch of panels (facade grid or spatially ordered IFC meshes).
 */
export function materialOverridesForSlots(
  panels: PanelMaterialSlot[],
  color: AlubondColor
): Map<string, MaterialState> {
  const overrides = new Map<string, MaterialState>()
  const cycle = getFusionTextureCycle(color)
  if (cycle && cycle.length >= 2) {
    for (const { uuid, stripeIndex } of panels) {
      const ref = cycle[stripeIndex % cycle.length]
      const mp = materialPropsForFolder(ref.folder)
      overrides.set(uuid, {
        color: hexToNumber(color.hex),
        metalness: mp.metalness,
        roughness: mp.roughness,
        finish: color.finish,
        panelTexture: ref,
      })
    }
    return overrides
  }

  const isFusionTwo =
    color.finish === 'fusion' &&
    (color.hexSecondary != null || color.panelTextureSecondary != null)
  const stateA: MaterialState = {
    color: hexToNumber(color.hex),
    metalness: color.metalness ?? 0,
    roughness: color.roughness ?? 0.7,
    finish: color.finish,
    ...(color.panelTexture ? { panelTexture: color.panelTexture } : {}),
  }
  const stateB: MaterialState = isFusionTwo
    ? {
        color: hexToNumber(color.hexSecondary ?? color.hex),
        metalness: color.metalnessSecondary ?? color.metalness ?? 0,
        roughness: color.roughnessSecondary ?? color.roughness ?? 0.7,
        finish: color.finish,
        ...(color.panelTextureSecondary ? { panelTexture: color.panelTextureSecondary } : {}),
      }
    : stateA

  for (const { uuid, row } of panels) {
    overrides.set(uuid, isFusionTwo && row % 2 === 1 ? stateB : stateA)
  }
  return overrides
}
