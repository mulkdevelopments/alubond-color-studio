import type { Material } from 'three'

export type FinishType = 'matte' | 'metallic' | 'anodise' | 'wood' | 'patina' | 'fusion'

/** For finish 'fusion': the two finishes combined (e.g. metallic + anodise). */
export type FusionCombo = Exclude<FinishType, 'fusion'>

/** Reference to a PNG under public/Panels/{folder}/{fileId}.png */
export interface PanelTextureRef {
  folder: string
  fileId: string
}

export type PaletteStyle =
  | 'Modern'
  | 'Metallic'
  | 'Fusion'
  | 'Anodise'
  | 'Wood'
  | 'Patina'
  | 'Brush'
  | 'Concrete'
  | 'Najdi'
  | 'Prismatic'
  | 'Sparkle'
  | 'StoneMarble'
  | 'Texture'

export interface AlubondColor {
  sku: string
  name: string
  collection: string
  finish: FinishType
  /** When finish is 'fusion', material labels for each rotating panel (order matches cycle). */
  fusionOf?: FusionCombo[]
  hex: string
  /** When finish is 'fusion', second colour for row-alternating apply (row 0 = hex, row 1 = hexSecondary, etc.). */
  hexSecondary?: string
  metalness?: number
  roughness?: number
  metalnessSecondary?: number
  roughnessSecondary?: number
  /** When set, swatch and facade use this panel image from public/Panels/. */
  panelTexture?: PanelTextureRef
  /** Fusion: second panel (row-alternating with panelTexture). */
  panelTextureSecondary?: PanelTextureRef
  /** Fusion: 2+ panels rotating by row (row i → index i % length). When set, takes precedence over texture pair for cycling. */
  fusionPanelCycle?: PanelTextureRef[]
}

export interface Palette {
  id: string
  name: string
  style: PaletteStyle
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
  finish?: FinishType
  /** When set, facade uses this panel image. */
  panelTexture?: PanelTextureRef
}
