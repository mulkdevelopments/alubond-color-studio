import type { Material } from 'three'

export type FinishType = 'matte' | 'metallic' | 'anodise' | 'wood' | 'patina' | 'fusion'

/** For finish 'fusion': the two finishes combined (e.g. metallic + anodise). */
export type FusionCombo = Exclude<FinishType, 'fusion'>

export interface AlubondColor {
  sku: string
  name: string
  collection: string
  finish: FinishType
  /** When finish is 'fusion', describes the combination e.g. ['metallic', 'anodise']. */
  fusionOf?: [FusionCombo, FusionCombo]
  hex: string
  /** When finish is 'fusion', second colour for row-alternating apply (row 0 = hex, row 1 = hexSecondary, etc.). */
  hexSecondary?: string
  metalness?: number
  roughness?: number
  metalnessSecondary?: number
  roughnessSecondary?: number
  /** When finish is 'wood', filename (no extension) for panel texture e.g. 'AB-SS-001'. */
  woodPanelId?: string
  /** When finish is 'patina', filename (no extension) for panel texture e.g. 'AB-SS-001'. */
  patinaPanelId?: string
}

export interface Palette {
  id: string
  name: string
  style: 'Modern' | 'Metallic' | 'Fusion' | 'Anodise' | 'Wood' | 'Patina'
  primary: AlubondColor
  accent: AlubondColor
  frame: AlubondColor
  feature: AlubondColor
}

export interface SelectedSurface {
  uuid: string
  name: string
  material: Material
  originalColor?: number
  originalMetalness?: number
  originalRoughness?: number
}

export type PaletteRole = 'primary' | 'accent' | 'frame' | 'feature'

export interface MaterialState {
  color: number
  metalness: number
  roughness: number
  /** When 'wood', the viewer applies a wood-grain texture for a realistic look. */
  finish?: FinishType
  /** When finish is 'wood', which panel image to use (e.g. 'AB-SS-001'). */
  woodPanelId?: string
  /** When finish is 'patina', which panel image to use (e.g. 'AB-SS-001'). */
  patinaPanelId?: string
}
