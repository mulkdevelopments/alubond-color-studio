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
  // —— Modern (Solid colours) ——
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
    id: 'modern-3',
    name: 'Earth Tones',
    style: 'Modern',
    primary: { sku: 'M-301', name: 'Terracotta', collection: 'Modern', finish: 'matte', hex: '#c05621', roughness: 0.82, metalness: 0 },
    accent: { sku: 'M-302', name: 'Cream', collection: 'Modern', finish: 'matte', hex: '#fef3c7', roughness: 0.78, metalness: 0 },
    frame: { sku: 'M-303', name: 'Sienna', collection: 'Modern', finish: 'matte', hex: '#92400e', roughness: 0.88, metalness: 0 },
    feature: { sku: 'M-304', name: 'Umber', collection: 'Modern', finish: 'matte', hex: '#78350f', roughness: 0.85, metalness: 0 },
  },
  {
    id: 'modern-4',
    name: 'Forest',
    style: 'Modern',
    primary: { sku: 'M-401', name: 'Sage Green', collection: 'Modern', finish: 'matte', hex: '#84cc16', roughness: 0.8, metalness: 0 },
    accent: { sku: 'M-402', name: 'Mint', collection: 'Modern', finish: 'matte', hex: '#d1fae5', roughness: 0.75, metalness: 0 },
    frame: { sku: 'M-403', name: 'Forest Green', collection: 'Modern', finish: 'matte', hex: '#166534', roughness: 0.85, metalness: 0 },
    feature: { sku: 'M-404', name: 'Olive', collection: 'Modern', finish: 'matte', hex: '#4d7c0f', roughness: 0.82, metalness: 0 },
  },
  {
    id: 'modern-5',
    name: 'Sunset',
    style: 'Modern',
    primary: { sku: 'M-501', name: 'Coral', collection: 'Modern', finish: 'matte', hex: '#f97316', roughness: 0.8, metalness: 0 },
    accent: { sku: 'M-502', name: 'Blush', collection: 'Modern', finish: 'matte', hex: '#fecdd3', roughness: 0.76, metalness: 0 },
    frame: { sku: 'M-503', name: 'Rust', collection: 'Modern', finish: 'matte', hex: '#ea580c', roughness: 0.84, metalness: 0 },
    feature: { sku: 'M-504', name: 'Burgundy', collection: 'Modern', finish: 'matte', hex: '#9f1239', roughness: 0.86, metalness: 0 },
  },
  {
    id: 'modern-6',
    name: 'Monochrome',
    style: 'Modern',
    primary: { sku: 'M-601', name: 'Off White', collection: 'Modern', finish: 'matte', hex: '#fafafa', roughness: 0.78, metalness: 0 },
    accent: { sku: 'M-602', name: 'Light Grey', collection: 'Modern', finish: 'matte', hex: '#d4d4d4', roughness: 0.8, metalness: 0 },
    frame: { sku: 'M-603', name: 'Mid Grey', collection: 'Modern', finish: 'matte', hex: '#737373', roughness: 0.85, metalness: 0 },
    feature: { sku: 'M-604', name: 'Jet Black', collection: 'Modern', finish: 'matte', hex: '#0a0a0a', roughness: 0.9, metalness: 0 },
  },
  {
    id: 'modern-7',
    name: 'Skyline',
    style: 'Modern',
    primary: { sku: 'M-701', name: 'Sky Blue', collection: 'Modern', finish: 'matte', hex: '#0ea5e9', roughness: 0.8, metalness: 0 },
    accent: { sku: 'M-702', name: 'Ice', collection: 'Modern', finish: 'matte', hex: '#e0f2fe', roughness: 0.76, metalness: 0 },
    frame: { sku: 'M-703', name: 'Navy', collection: 'Modern', finish: 'matte', hex: '#1e3a8a', roughness: 0.86, metalness: 0 },
    feature: { sku: 'M-704', name: 'Steel Blue', collection: 'Modern', finish: 'matte', hex: '#0369a1', roughness: 0.84, metalness: 0 },
  },
  {
    id: 'modern-8',
    name: 'Lavender',
    style: 'Modern',
    primary: { sku: 'M-801', name: 'Lilac', collection: 'Modern', finish: 'matte', hex: '#a78bfa', roughness: 0.8, metalness: 0 },
    accent: { sku: 'M-802', name: 'Lavender Mist', collection: 'Modern', finish: 'matte', hex: '#ede9fe', roughness: 0.75, metalness: 0 },
    frame: { sku: 'M-803', name: 'Plum', collection: 'Modern', finish: 'matte', hex: '#6b21a8', roughness: 0.85, metalness: 0 },
    feature: { sku: 'M-804', name: 'Violet', collection: 'Modern', finish: 'matte', hex: '#7c3aed', roughness: 0.82, metalness: 0 },
  },
  // —— Metallic ——
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
    id: 'metallic-3',
    name: 'Cool Metals',
    style: 'Metallic',
    primary: { sku: 'MT-301', name: 'Zinc', collection: 'Metallic', finish: 'metallic', hex: '#94a3b8', roughness: 0.38, metalness: 0.92 },
    accent: { sku: 'MT-302', name: 'Pewter', collection: 'Metallic', finish: 'metallic', hex: '#64748b', roughness: 0.42, metalness: 0.88 },
    frame: { sku: 'MT-303', name: 'Carbon', collection: 'Metallic', finish: 'metallic', hex: '#334155', roughness: 0.32, metalness: 0.96 },
    feature: { sku: 'MT-304', name: 'Stainless', collection: 'Metallic', finish: 'metallic', hex: '#cbd5e1', roughness: 0.25, metalness: 0.98 },
  },
  {
    id: 'metallic-4',
    name: 'Gold & Rose',
    style: 'Metallic',
    primary: { sku: 'MT-401', name: 'Rose Gold', collection: 'Metallic', finish: 'metallic', hex: '#e8b4a0', roughness: 0.35, metalness: 0.9 },
    accent: { sku: 'MT-402', name: 'Gold', collection: 'Metallic', finish: 'metallic', hex: '#d4af37', roughness: 0.28, metalness: 0.95 },
    frame: { sku: 'MT-403', name: 'Champagne Metal', collection: 'Metallic', finish: 'metallic', hex: '#c9b896', roughness: 0.4, metalness: 0.88 },
    feature: { sku: 'MT-404', name: 'Bronze Rose', collection: 'Metallic', finish: 'metallic', hex: '#a67c52', roughness: 0.42, metalness: 0.86 },
  },
  {
    id: 'metallic-5',
    name: 'Industrial',
    style: 'Metallic',
    primary: { sku: 'MT-501', name: 'Galvanised', collection: 'Metallic', finish: 'metallic', hex: '#a1a1aa', roughness: 0.5, metalness: 0.85 },
    accent: { sku: 'MT-502', name: 'Cast Iron', collection: 'Metallic', finish: 'metallic', hex: '#3f3f46', roughness: 0.55, metalness: 0.9 },
    frame: { sku: 'MT-503', name: 'Wrought Iron', collection: 'Metallic', finish: 'metallic', hex: '#52525b', roughness: 0.48, metalness: 0.88 },
    feature: { sku: 'MT-504', name: 'Aluminium Satin', collection: 'Metallic', finish: 'metallic', hex: '#b4b4b8', roughness: 0.45, metalness: 0.9 },
  },
  // —— Anodise ——
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
    id: 'anodise-2',
    name: 'Coloured Anodise',
    style: 'Anodise',
    primary: { sku: 'A-201', name: 'Bronze Anodise', collection: 'Anodise', finish: 'anodise', hex: '#8b7355', roughness: 0.22, metalness: 0.96 },
    accent: { sku: 'A-202', name: 'Red Anodise', collection: 'Anodise', finish: 'anodise', hex: '#7f1d1d', roughness: 0.26, metalness: 0.94 },
    frame: { sku: 'A-203', name: 'Blue Anodise', collection: 'Anodise', finish: 'anodise', hex: '#1e3a5f', roughness: 0.24, metalness: 0.95 },
    feature: { sku: 'A-204', name: 'Green Anodise', collection: 'Anodise', finish: 'anodise', hex: '#14532d', roughness: 0.26, metalness: 0.93 },
  },
  {
    id: 'anodise-3',
    name: 'Architectural Anodise',
    style: 'Anodise',
    primary: { sku: 'A-301', name: 'Natural Silver', collection: 'Anodise', finish: 'anodise', hex: '#c5cbd4', roughness: 0.23, metalness: 0.97 },
    accent: { sku: 'A-302', name: 'Titanium Grey', collection: 'Anodise', finish: 'anodise', hex: '#4b5563', roughness: 0.25, metalness: 0.95 },
    frame: { sku: 'A-303', name: 'Graphite Anodise', collection: 'Anodise', finish: 'anodise', hex: '#374151', roughness: 0.21, metalness: 0.98 },
    feature: { sku: 'A-304', name: 'Anthracite Anodise', collection: 'Anodise', finish: 'anodise', hex: '#1f2937', roughness: 0.2, metalness: 0.98 },
  },
  // —— Wood (panel images from public/Panels/wood/) ——
  ...(['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012-2', '013', '014', '015'] as const).map((code, idx) => {
    const woodPanelId = `AB-SS-${code}` // filename without .png e.g. AB-SS-001, AB-SS-012-2
    const sku = `AB | SS | ${code}`
    const c: AlubondColor = { sku, name: `Wood ${code}`, collection: 'Wood', finish: 'wood', hex: '#C4A574', roughness: 0.7, metalness: 0, woodPanelId }
    return { id: `wood-${idx + 1}`, name: 'Wood', style: 'Wood' as const, primary: c, accent: c, frame: c, feature: c }
  }),
  // —— Patina (panel images from public/Panels/Platina/) ——
  ...(['001', '002', '003', '004', '005', '006'] as const).map((code, idx) => {
    const patinaPanelId = `AB-SS-${code}`
    const sku = `AB | SS | ${code}`
    const c: AlubondColor = { sku, name: `Patina ${code}`, collection: 'Patina', finish: 'patina', hex: '#5a9c7a', roughness: 0.6, metalness: 0.5, patinaPanelId }
    return { id: `patina-${idx + 1}`, name: 'Patina', style: 'Patina' as const, primary: c, accent: c, frame: c, feature: c }
  }),
  // —— Fusion (combinations of two finishes: two colours, applied row-alternating) ——
  {
    id: 'fusion-1',
    name: 'Metallic + Anodise',
    style: 'Fusion',
    primary: { sku: 'F-101', name: 'Brushed Aluminium + Clear Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['metallic', 'anodise'], hex: '#c0c8d0', hexSecondary: '#d4dce4', roughness: 0.4, metalness: 0.9, roughnessSecondary: 0.25, metalnessSecondary: 0.95 },
    accent: { sku: 'F-102', name: 'Chrome + Champagne Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['metallic', 'anodise'], hex: '#e8ecf0', hexSecondary: '#e8dcc8', roughness: 0.2, metalness: 1, roughnessSecondary: 0.3, metalnessSecondary: 0.9 },
    frame: { sku: 'F-103', name: 'Gunmetal + Black Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['metallic', 'anodise'], hex: '#2c3e50', hexSecondary: '#2c2c2c', roughness: 0.35, metalness: 0.95, roughnessSecondary: 0.2, metalnessSecondary: 0.98 },
    feature: { sku: 'F-104', name: 'Titanium + Smoke Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['metallic', 'anodise'], hex: '#7f8c8d', hexSecondary: '#6b7280', roughness: 0.45, metalness: 0.85, roughnessSecondary: 0.28, metalnessSecondary: 0.92 },
  },
  {
    id: 'fusion-2',
    name: 'Matte + Metallic',
    style: 'Fusion',
    primary: { sku: 'F-201', name: 'Slate Grey + Brushed Silver', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'metallic'], hex: '#4a5568', hexSecondary: '#c0c8d0', roughness: 0.85, metalness: 0, roughnessSecondary: 0.4, metalnessSecondary: 0.9 },
    accent: { sku: 'F-202', name: 'Pearl White + Chrome', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'metallic'], hex: '#f7fafc', hexSecondary: '#e8ecf0', roughness: 0.8, metalness: 0, roughnessSecondary: 0.2, metalnessSecondary: 1 },
    frame: { sku: 'F-203', name: 'Graphite + Gunmetal', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'metallic'], hex: '#2d3748', hexSecondary: '#2c3e50', roughness: 0.9, metalness: 0, roughnessSecondary: 0.35, metalnessSecondary: 0.95 },
    feature: { sku: 'F-204', name: 'Charcoal + Titanium', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'metallic'], hex: '#1a202c', hexSecondary: '#7f8c8d', roughness: 0.85, metalness: 0, roughnessSecondary: 0.45, metalnessSecondary: 0.85 },
  },
  {
    id: 'fusion-3',
    name: 'Wood + Metallic',
    style: 'Fusion',
    primary: { sku: 'F-301', name: 'Oak + Brushed Aluminium', collection: 'Fusion', finish: 'fusion', fusionOf: ['wood', 'metallic'], hex: '#c4a574', hexSecondary: '#c0c8d0', roughness: 0.7, metalness: 0, roughnessSecondary: 0.4, metalnessSecondary: 0.9 },
    accent: { sku: 'F-302', name: 'Walnut + Bronze', collection: 'Fusion', finish: 'fusion', fusionOf: ['wood', 'metallic'], hex: '#5c4033', hexSecondary: '#8b6914', roughness: 0.65, metalness: 0, roughnessSecondary: 0.4, metalnessSecondary: 0.9 },
    frame: { sku: 'F-303', name: 'Teak + Copper', collection: 'Fusion', finish: 'fusion', fusionOf: ['wood', 'metallic'], hex: '#a67c52', hexSecondary: '#b87333', roughness: 0.68, metalness: 0, roughnessSecondary: 0.3, metalnessSecondary: 0.95 },
    feature: { sku: 'F-304', name: 'Ash + Gunmetal', collection: 'Fusion', finish: 'fusion', fusionOf: ['wood', 'metallic'], hex: '#8b7355', hexSecondary: '#2c3e50', roughness: 0.75, metalness: 0, roughnessSecondary: 0.35, metalnessSecondary: 0.95 },
  },
  {
    id: 'fusion-4',
    name: 'Matte + Anodise',
    style: 'Fusion',
    primary: { sku: 'F-401', name: 'Concrete Grey + Clear Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'anodise'], hex: '#6b7280', hexSecondary: '#d4dce4', roughness: 0.8, metalness: 0.1, roughnessSecondary: 0.25, metalnessSecondary: 0.95 },
    accent: { sku: 'F-402', name: 'Off White + Champagne Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'anodise'], hex: '#f5f5f4', hexSecondary: '#e8dcc8', roughness: 0.78, metalness: 0.05, roughnessSecondary: 0.3, metalnessSecondary: 0.9 },
    frame: { sku: 'F-403', name: 'Anthracite + Black Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'anodise'], hex: '#1f2937', hexSecondary: '#2c2c2c', roughness: 0.85, metalness: 0, roughnessSecondary: 0.2, metalnessSecondary: 0.98 },
    feature: { sku: 'F-404', name: 'Mid Grey + Smoke Anodise', collection: 'Fusion', finish: 'fusion', fusionOf: ['matte', 'anodise'], hex: '#9ca3af', hexSecondary: '#6b7280', roughness: 0.75, metalness: 0.15, roughnessSecondary: 0.28, metalnessSecondary: 0.92 },
  },
  {
    id: 'fusion-5',
    name: 'Patina + Metallic',
    style: 'Fusion',
    primary: { sku: 'F-501', name: 'Verdigris + Brushed Copper', collection: 'Fusion', finish: 'fusion', fusionOf: ['patina', 'metallic'], hex: '#3d8b6b', hexSecondary: '#b87333', roughness: 0.6, metalness: 0.6, roughnessSecondary: 0.3, metalnessSecondary: 0.95 },
    accent: { sku: 'F-502', name: 'Copper Patina + Bronze', collection: 'Fusion', finish: 'fusion', fusionOf: ['patina', 'metallic'], hex: '#5a9c7a', hexSecondary: '#8b6914', roughness: 0.55, metalness: 0.5, roughnessSecondary: 0.4, metalnessSecondary: 0.9 },
    frame: { sku: 'F-503', name: 'Oxidised Bronze + Gunmetal', collection: 'Fusion', finish: 'fusion', fusionOf: ['patina', 'metallic'], hex: '#4a6741', hexSecondary: '#2c3e50', roughness: 0.65, metalness: 0.55, roughnessSecondary: 0.35, metalnessSecondary: 0.95 },
    feature: { sku: 'F-504', name: 'Aged Copper + Antique Brass', collection: 'Fusion', finish: 'fusion', fusionOf: ['patina', 'metallic'], hex: '#6b8e6b', hexSecondary: '#cd7f32', roughness: 0.58, metalness: 0.52, roughnessSecondary: 0.45, metalnessSecondary: 0.85 },
  },
]

export const styleCategories = ['Modern', 'Metallic', 'Fusion', 'Anodise', 'Wood', 'Patina'] as const

/** Display label for finish; Fusion shows e.g. "Metallic + Anodise" when fusionOf is set. */
export function getFinishLabel(color: AlubondColor): string {
  if (color.finish === 'fusion' && color.fusionOf?.length === 2) {
    return color.fusionOf.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(' + ')
  }
  return color.finish
}

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
