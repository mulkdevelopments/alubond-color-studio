import type { Material } from 'three'

export type FinishType = 'matte' | 'metallic' | 'anodise' | 'wood' | 'patina' | 'fusion'

export interface AlubondColor {
  sku: string
  name: string
  collection: string
  finish: FinishType
  hex: string
  metalness?: number
  roughness?: number
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
}
