import type { Palette, AlubondColor } from '../types'

/** Tab id matches Palette style; label for library UI */
export const libraryTabs = [
  { id: 'Modern' as const, label: 'Solid colours' },
  { id: 'Metallic' as const, label: 'Metallic colours' },
  { id: 'Wood' as const, label: 'Wood' },
  { id: 'Anodise' as const, label: 'Anodise' },
  { id: 'Patina' as const, label: 'Patina' },
  { id: 'Fusion' as const, label: 'Fusion' },
]

export const palettes: Palette[] = [
  {
    id: 'modern-1',
    name: 'Urban Grey',
    style: 'Modern',
    primary: { sku: 'M-101', name: 'Slate Grey', collection: 'Modern', finish: 'matte', hex: '#4a5568', roughness: 0.85, metalness: 0 },
    accent: { sku: 'M-102', name: 'Pearl White', collection: 'Modern', finish: 'matte', hex: '#f7fafc', roughness: 0.8, metalness: 0 },
    frame: { sku: 'M-103', name: 'Graphite', collection: 'Modern', finish: 'matte', hex: '#2d3748', roughness: 0.9, metalness: 0 },
    feature: { sku: 'M-104', name: 'Charcoal', collection: 'Modern', finish: 'matte', hex: '#1a202c', roughness: 0.85, metalness: 0 },
  },
  {
    id: 'modern-2',
    name: 'Coastal',
    style: 'Modern',
    primary: { sku: 'M-201', name: 'Seafoam', collection: 'Modern', finish: 'matte', hex: '#81e6d9', roughness: 0.8, metalness: 0 },
    accent: { sku: 'M-202', name: 'Sand', collection: 'Modern', finish: 'matte', hex: '#e2e8f0', roughness: 0.75, metalness: 0 },
    frame: { sku: 'M-203', name: 'Ocean Blue', collection: 'Modern', finish: 'matte', hex: '#2b6cb0', roughness: 0.85, metalness: 0 },
    feature: { sku: 'M-204', name: 'Deep Teal', collection: 'Modern', finish: 'matte', hex: '#234e52', roughness: 0.8, metalness: 0 },
  },
  {
    id: 'metallic-1',
    name: 'Brushed Steel',
    style: 'Metallic',
    primary: { sku: 'MT-101', name: 'Brushed Aluminium', collection: 'Metallic', finish: 'metallic', hex: '#c0c8d0', roughness: 0.4, metalness: 0.9 },
    accent: { sku: 'MT-102', name: 'Chrome Silver', collection: 'Metallic', finish: 'metallic', hex: '#e8ecf0', roughness: 0.2, metalness: 1 },
    frame: { sku: 'MT-103', name: 'Gunmetal', collection: 'Metallic', finish: 'metallic', hex: '#2c3e50', roughness: 0.35, metalness: 0.95 },
    feature: { sku: 'MT-104', name: 'Titanium', collection: 'Metallic', finish: 'metallic', hex: '#7f8c8d', roughness: 0.45, metalness: 0.85 },
  },
  {
    id: 'metallic-2',
    name: 'Copper Accent',
    style: 'Metallic',
    primary: { sku: 'MT-201', name: 'Warm Grey', collection: 'Metallic', finish: 'metallic', hex: '#95a5a6', roughness: 0.5, metalness: 0.7 },
    accent: { sku: 'MT-202', name: 'Copper', collection: 'Metallic', finish: 'metallic', hex: '#b87333', roughness: 0.3, metalness: 0.95 },
    frame: { sku: 'MT-203', name: 'Bronze', collection: 'Metallic', finish: 'metallic', hex: '#8b6914', roughness: 0.4, metalness: 0.9 },
    feature: { sku: 'MT-204', name: 'Antique Brass', collection: 'Metallic', finish: 'metallic', hex: '#cd7f32', roughness: 0.45, metalness: 0.85 },
  },
  {
    id: 'anodise-1',
    name: 'Clear Anodise',
    style: 'Anodise',
    primary: { sku: 'A-101', name: 'Clear Anodised', collection: 'Anodise', finish: 'anodise', hex: '#d4dce4', roughness: 0.25, metalness: 0.95 },
    accent: { sku: 'A-102', name: 'Champagne', collection: 'Anodise', finish: 'anodise', hex: '#e8dcc8', roughness: 0.3, metalness: 0.9 },
    frame: { sku: 'A-103', name: 'Black Anodised', collection: 'Anodise', finish: 'anodise', hex: '#2c2c2c', roughness: 0.2, metalness: 0.98 },
    feature: { sku: 'A-104', name: 'Smoke', collection: 'Anodise', finish: 'anodise', hex: '#6b7280', roughness: 0.28, metalness: 0.92 },
  },
  {
    id: 'wood-1',
    name: 'Natural Oak',
    style: 'Wood',
    primary: { sku: 'W-101', name: 'Oak Natural', collection: 'Wood', finish: 'wood', hex: '#c4a574', roughness: 0.7, metalness: 0 },
    accent: { sku: 'W-102', name: 'Walnut', collection: 'Wood', finish: 'wood', hex: '#5c4033', roughness: 0.65, metalness: 0 },
    frame: { sku: 'W-103', name: 'Ash Grey', collection: 'Wood', finish: 'wood', hex: '#8b7355', roughness: 0.75, metalness: 0 },
    feature: { sku: 'W-104', name: 'Teak', collection: 'Wood', finish: 'wood', hex: '#a67c52', roughness: 0.68, metalness: 0 },
  },
  {
    id: 'patina-1',
    name: 'Weathered Copper',
    style: 'Patina',
    primary: { sku: 'P-101', name: 'Verdigris', collection: 'Patina', finish: 'patina', hex: '#3d8b6b', roughness: 0.6, metalness: 0.6 },
    accent: { sku: 'P-102', name: 'Copper Patina', collection: 'Patina', finish: 'patina', hex: '#5a9c7a', roughness: 0.55, metalness: 0.5 },
    frame: { sku: 'P-103', name: 'Oxidised Bronze', collection: 'Patina', finish: 'patina', hex: '#4a6741', roughness: 0.65, metalness: 0.55 },
    feature: { sku: 'P-104', name: 'Aged Copper', collection: 'Patina', finish: 'patina', hex: '#6b8e6b', roughness: 0.58, metalness: 0.52 },
  },
  {
    id: 'fusion-1',
    name: 'Urban Fusion',
    style: 'Fusion',
    primary: { sku: 'F-101', name: 'Concrete Grey', collection: 'Fusion', finish: 'matte', hex: '#6b7280', roughness: 0.8, metalness: 0.1 },
    accent: { sku: 'F-102', name: 'Brushed Dark', collection: 'Fusion', finish: 'metallic', hex: '#374151', roughness: 0.4, metalness: 0.85 },
    frame: { sku: 'F-103', name: 'Anthracite', collection: 'Fusion', finish: 'matte', hex: '#1f2937', roughness: 0.85, metalness: 0 },
    feature: { sku: 'F-104', name: 'Steel Blue', collection: 'Fusion', finish: 'metallic', hex: '#4b5563', roughness: 0.35, metalness: 0.9 },
  },
]

export const styleCategories = ['Modern', 'Metallic', 'Fusion', 'Anodise', 'Wood', 'Patina'] as const

/** All unique colours per style for library grid (dedupe by sku within each style) */
export function getColoursByStyle(
  palettesList: Palette[]
): Record<Palette['style'], AlubondColor[]> {
  const byStyle: Record<string, { list: AlubondColor[]; seen: Set<string> }> = {
    Modern: { list: [], seen: new Set() },
    Metallic: { list: [], seen: new Set() },
    Fusion: { list: [], seen: new Set() },
    Anodise: { list: [], seen: new Set() },
    Wood: { list: [], seen: new Set() },
    Patina: { list: [], seen: new Set() },
  }
  for (const p of palettesList) {
    const entry = byStyle[p.style]
    for (const colour of [p.primary, p.accent, p.frame, p.feature]) {
      if (entry.seen.has(colour.sku)) continue
      entry.seen.add(colour.sku)
      entry.list.push(colour)
    }
  }
  return {
    Modern: byStyle.Modern.list,
    Metallic: byStyle.Metallic.list,
    Fusion: byStyle.Fusion.list,
    Anodise: byStyle.Anodise.list,
    Wood: byStyle.Wood.list,
    Patina: byStyle.Patina.list,
  }
}
