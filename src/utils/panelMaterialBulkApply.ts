import type { AlubondColor, MaterialState } from '../types'
import { getFusionTextureCycle } from './fusionPanelCycle'
import { materialPropsForFolder } from '../services/fusionSuggestions'

/**
 * How multiple library palettes map onto the façade / IFC surfaces.
 * - `linear` — read order (left→right, top→bottom), one palette per cell in sequence.
 * - `horizontal_bands` — full row shares one palette; cycles by row (horizontal stripes).
 * - `vertical_bands` — full column shares one palette; cycles by column (vertical stripes).
 * - `checker` — `(row + col) % N` diagonal / checkerboard.
 */
export type PaletteLayout = 'linear' | 'horizontal_bands' | 'vertical_bands' | 'checker'

/** Facade / IFC slot: `col` for column-based layouts (defaults treated as 0 if missing). */
export type PanelMaterialSlot = { uuid: string; row: number; stripeIndex: number; col?: number }

export function paletteColorIndexForSlot(
  slot: PanelMaterialSlot,
  layout: PaletteLayout,
  colorCount: number
): number {
  if (colorCount <= 1) return 0
  const col = slot.col ?? 0
  switch (layout) {
    case 'linear':
      return slot.stripeIndex % colorCount
    case 'horizontal_bands':
      return slot.row % colorCount
    case 'vertical_bands':
      return col % colorCount
    case 'checker':
      return (slot.row + col) % colorCount
    default:
      return slot.stripeIndex % colorCount
  }
}

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

/** Material for one slot as if the whole façade used `color` (respects fusion cycles & row alternation). */
export function materialStateForPanelSlot(slot: PanelMaterialSlot, color: AlubondColor): MaterialState {
  const cycle = getFusionTextureCycle(color)
  if (cycle && cycle.length >= 2) {
    /** Row-based rhythm (matches fusion copy: row r → cycle[r % length]), not per-panel read order. */
    const ref = cycle[slot.row % cycle.length]
    const mp = materialPropsForFolder(ref.folder)
    return {
      color: hexToNumber(color.hex),
      metalness: mp.metalness,
      roughness: mp.roughness,
      finish: color.finish,
      panelTexture: ref,
    }
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

  return isFusionTwo && slot.row % 2 === 1 ? stateB : stateA
}

/**
 * Build per-uuid material state for a batch of panels (facade grid or spatially ordered IFC meshes).
 */
export function materialOverridesForSlots(
  panels: PanelMaterialSlot[],
  color: AlubondColor
): Map<string, MaterialState> {
  const overrides = new Map<string, MaterialState>()
  for (const slot of panels) {
    overrides.set(slot.uuid, materialStateForPanelSlot(slot, color))
  }
  return overrides
}

/**
 * Map several palette colours onto panels using {@link PaletteLayout}.
 */
export function materialOverridesForSlotsMulti(
  panels: PanelMaterialSlot[],
  colors: AlubondColor[],
  layout: PaletteLayout
): Map<string, MaterialState> {
  const overrides = new Map<string, MaterialState>()
  if (colors.length === 0) return overrides
  if (colors.length === 1) return materialOverridesForSlots(panels, colors[0])
  const n = colors.length
  for (const slot of panels) {
    const i = paletteColorIndexForSlot(slot, layout, n)
    overrides.set(slot.uuid, materialStateForPanelSlot(slot, colors[i]))
  }
  return overrides
}
