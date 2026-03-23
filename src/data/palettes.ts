import type { Palette, AlubondColor, PaletteStyle, FinishType, FusionCombo, PanelTextureRef } from '../types'
import { PANEL_TEXTURE_FILES } from './panelTextureInventory'

/** Tab id matches Palette style; label for library UI */
export const libraryTabs = [
  { id: 'Modern' as const, label: 'Solid colours' },
  { id: 'Metallic' as const, label: 'Metallic colours' },
  { id: 'Wood' as const, label: 'Wood' },
  { id: 'Anodise' as const, label: 'Anodise' },
  { id: 'Patina' as const, label: 'Patina' },
  { id: 'Brush' as const, label: 'Brush' },
  { id: 'Concrete' as const, label: 'Concrete' },
  { id: 'Najdi' as const, label: 'Najdi' },
  { id: 'Prismatic' as const, label: 'Prismatic' },
  { id: 'Sparkle' as const, label: 'Sparkle' },
  { id: 'StoneMarble' as const, label: 'Stone & Marbles' },
  { id: 'Texture' as const, label: 'Texture' },
  { id: 'Fusion' as const, label: 'Fusion' },
]

const PANEL_STYLE_ROWS: Array<{
  folder: string
  style: PaletteStyle
  collection: string
  finish: FinishType
  roughness: number
  metalness: number
  hex: string
}> = [
  { folder: 'wood', style: 'Wood', collection: 'Wood', finish: 'wood', roughness: 0.7, metalness: 0, hex: '#C4A574' },
  { folder: 'patina', style: 'Patina', collection: 'Patina', finish: 'patina', roughness: 0.6, metalness: 0.5, hex: '#5a9c7a' },
  { folder: 'anodise', style: 'Anodise', collection: 'Anodise', finish: 'anodise', roughness: 0.25, metalness: 0.95, hex: '#d4dce4' },
  { folder: 'metalic', style: 'Metallic', collection: 'Metallic', finish: 'metallic', roughness: 0.4, metalness: 0.9, hex: '#c0c8d0' },
  { folder: 'brush', style: 'Brush', collection: 'Brush', finish: 'matte', roughness: 0.8, metalness: 0, hex: '#a8a29e' },
  { folder: 'concrete', style: 'Concrete', collection: 'Concrete', finish: 'matte', roughness: 0.9, metalness: 0, hex: '#78716c' },
  { folder: 'najdi', style: 'Najdi', collection: 'Najdi', finish: 'matte', roughness: 0.75, metalness: 0, hex: '#d6d3d1' },
  { folder: 'prismatic', style: 'Prismatic', collection: 'Prismatic', finish: 'matte', roughness: 0.5, metalness: 0.2, hex: '#e7e5e4' },
  { folder: 'sparkle', style: 'Sparkle', collection: 'Sparkle', finish: 'metallic', roughness: 0.35, metalness: 0.85, hex: '#d1d5db' },
  { folder: 'stone&marbles', style: 'StoneMarble', collection: 'Stone & Marbles', finish: 'matte', roughness: 0.75, metalness: 0, hex: '#e5e5e5' },
  { folder: 'texture', style: 'Texture', collection: 'Texture', finish: 'matte', roughness: 0.8, metalness: 0, hex: '#9ca3af' },
]

function buildPanelTexturePalettes(): Palette[] {
  const out: Palette[] = []
  let pid = 0
  for (const cfg of PANEL_STYLE_ROWS) {
    const files = PANEL_TEXTURE_FILES[cfg.folder]
    if (!files?.length) continue
    for (const fileId of files) {
      const suffix = fileId.replace(/^AB-SS-/, '')
      const sku = `${cfg.collection} · ${fileId}`
      const c: AlubondColor = {
        sku,
        name: `${cfg.collection} ${suffix}`,
        collection: cfg.collection,
        finish: cfg.finish,
        hex: cfg.hex,
        roughness: cfg.roughness,
        metalness: cfg.metalness,
        panelTexture: { folder: cfg.folder, fileId },
      }
      pid += 1
      out.push({
        id: `panel-${cfg.folder.replace(/[^a-z0-9]/gi, '-')}-${suffix}-${pid}`,
        name: cfg.collection,
        style: cfg.style,
        primary: c,
        accent: c,
        frame: c,
        feature: c,
      })
    }
  }
  return out
}

/** Curated two-panel fusions (row A / row B on facade). */
const FUSION_PANEL_SETS: Array<{
  name: string
  fusionOf: [FusionCombo, FusionCombo]
  a: PanelTextureRef
  b: PanelTextureRef
  hex: string
  hexSecondary: string
  roughness: number
  metalness: number
  roughnessSecondary: number
  metalnessSecondary: number
}> = [
  {
    name: 'Metallic + Anodise',
    fusionOf: ['metallic', 'anodise'],
    a: { folder: 'metalic', fileId: 'AB-SS-003' },
    b: { folder: 'anodise', fileId: 'AB-SS-006' },
    hex: '#c0c8d0',
    hexSecondary: '#d4dce4',
    roughness: 0.4,
    metalness: 0.9,
    roughnessSecondary: 0.25,
    metalnessSecondary: 0.95,
  },
  {
    name: 'Metallic + Anodise',
    fusionOf: ['metallic', 'anodise'],
    a: { folder: 'metalic', fileId: 'AB-SS-010' },
    b: { folder: 'anodise', fileId: 'AB-SS-008' },
    hex: '#94a3b8',
    hexSecondary: '#d4dce4',
    roughness: 0.42,
    metalness: 0.88,
    roughnessSecondary: 0.25,
    metalnessSecondary: 0.95,
  },
  {
    name: 'Wood + Metallic',
    fusionOf: ['wood', 'metallic'],
    a: { folder: 'wood', fileId: 'AB-SS-007' },
    b: { folder: 'metalic', fileId: 'AB-SS-005' },
    hex: '#c4a574',
    hexSecondary: '#c0c8d0',
    roughness: 0.7,
    metalness: 0,
    roughnessSecondary: 0.4,
    metalnessSecondary: 0.9,
  },
  {
    name: 'Wood + Metallic',
    fusionOf: ['wood', 'metallic'],
    a: { folder: 'wood', fileId: 'AB-SS-001' },
    b: { folder: 'metalic', fileId: 'AB-SS-012' },
    hex: '#c4a574',
    hexSecondary: '#64748b',
    roughness: 0.7,
    metalness: 0,
    roughnessSecondary: 0.38,
    metalnessSecondary: 0.92,
  },
  {
    name: 'Patina + Metallic',
    fusionOf: ['patina', 'metallic'],
    a: { folder: 'patina', fileId: 'AB-SS-001' },
    b: { folder: 'metalic', fileId: 'AB-SS-009' },
    hex: '#5a9c7a',
    hexSecondary: '#b87333',
    roughness: 0.6,
    metalness: 0.5,
    roughnessSecondary: 0.3,
    metalnessSecondary: 0.95,
  },
  {
    name: 'Patina + Metallic',
    fusionOf: ['patina', 'metallic'],
    a: { folder: 'patina', fileId: 'AB-SS-004' },
    b: { folder: 'metalic', fileId: 'AB-SS-007' },
    hex: '#5a9c7a',
    hexSecondary: '#94a3b8',
    roughness: 0.58,
    metalness: 0.52,
    roughnessSecondary: 0.4,
    metalnessSecondary: 0.9,
  },
  {
    name: 'Stone & Marbles + Texture',
    fusionOf: ['matte', 'matte'],
    a: { folder: 'stone&marbles', fileId: 'AB-SS-005' },
    b: { folder: 'texture', fileId: 'AB-SS-006' },
    hex: '#e5e5e5',
    hexSecondary: '#9ca3af',
    roughness: 0.75,
    metalness: 0,
    roughnessSecondary: 0.8,
    metalnessSecondary: 0,
  },
  {
    name: 'Concrete + Metallic',
    fusionOf: ['matte', 'metallic'],
    a: { folder: 'concrete', fileId: 'AB-SS-004' },
    b: { folder: 'metalic', fileId: 'AB-SS-006' },
    hex: '#78716c',
    hexSecondary: '#94a3b8',
    roughness: 0.9,
    metalness: 0,
    roughnessSecondary: 0.4,
    metalnessSecondary: 0.9,
  },
  {
    name: 'Brush + Anodise',
    fusionOf: ['matte', 'anodise'],
    a: { folder: 'brush', fileId: 'AB-SS-005' },
    b: { folder: 'anodise', fileId: 'AB-SS-005' },
    hex: '#a8a29e',
    hexSecondary: '#d4dce4',
    roughness: 0.8,
    metalness: 0,
    roughnessSecondary: 0.25,
    metalnessSecondary: 0.95,
  },
  {
    name: 'Sparkle + Anodise',
    fusionOf: ['metallic', 'anodise'],
    a: { folder: 'sparkle', fileId: 'AB-SS-006' },
    b: { folder: 'anodise', fileId: 'AB-SS-007' },
    hex: '#d1d5db',
    hexSecondary: '#c5cbd4',
    roughness: 0.35,
    metalness: 0.85,
    roughnessSecondary: 0.23,
    metalnessSecondary: 0.97,
  },
  {
    name: 'Prismatic + Metallic',
    fusionOf: ['matte', 'metallic'],
    a: { folder: 'prismatic', fileId: 'AB-SS-005' },
    b: { folder: 'metalic', fileId: 'AB-SS-014' },
    hex: '#e7e5e4',
    hexSecondary: '#cbd5e1',
    roughness: 0.5,
    metalness: 0.2,
    roughnessSecondary: 0.35,
    metalnessSecondary: 0.92,
  },
  {
    name: 'Najdi + Wood',
    fusionOf: ['matte', 'wood'],
    a: { folder: 'najdi', fileId: 'AB-SS-006' },
    b: { folder: 'wood', fileId: 'AB-SS-003' },
    hex: '#d6d3d1',
    hexSecondary: '#c4a574',
    roughness: 0.75,
    metalness: 0,
    roughnessSecondary: 0.7,
    metalnessSecondary: 0,
  },
]

function buildFusionPanelPalettes(): Palette[] {
  return FUSION_PANEL_SETS.map((row, idx) => {
    const sku = `Fusion · ${row.a.fileId} + ${row.b.fileId}`
    const c: AlubondColor = {
      sku,
      name: row.name,
      collection: 'Fusion',
      finish: 'fusion',
      fusionOf: row.fusionOf,
      hex: row.hex,
      hexSecondary: row.hexSecondary,
      roughness: row.roughness,
      metalness: row.metalness,
      roughnessSecondary: row.roughnessSecondary,
      metalnessSecondary: row.metalnessSecondary,
      panelTexture: row.a,
      panelTextureSecondary: row.b,
    }
    return {
      id: `fusion-panel-${idx + 1}`,
      name: 'Fusion',
      style: 'Fusion' as const,
      primary: c,
      accent: c,
      frame: c,
      feature: c,
    }
  })
}

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
  // —— Metallic & Anodise: panel images only (see buildPanelTexturePalettes) ——
  // —— Panel textures (wood, patina, anodise, metalic, brush, concrete, najdi, prismatic, sparkle, stone&marbles, texture) ——
  ...buildPanelTexturePalettes(),
  // —— Fusion: real panel pairs (row-alternating on facade) + AI hex suggestions in UI ——
  ...buildFusionPanelPalettes(),
]

export const styleCategories = [
  'Modern',
  'Metallic',
  'Fusion',
  'Anodise',
  'Wood',
  'Patina',
  'Brush',
  'Concrete',
  'Najdi',
  'Prismatic',
  'Sparkle',
  'StoneMarble',
  'Texture',
] as const

/** Display label for finish; Fusion shows e.g. "Metallic + Anodise" when fusionOf is set. */
export function getFinishLabel(color: AlubondColor): string {
  if (color.finish === 'fusion' && color.fusionOf && color.fusionOf.length >= 2) {
    return color.fusionOf.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(' + ')
  }
  return color.finish
}

/** All unique colours per style for library grid (dedupe by sku within each style) */
export function getColoursByStyle(palettesList: Palette[]): Record<PaletteStyle, AlubondColor[]> {
  const byStyle: Record<PaletteStyle, { list: AlubondColor[]; seen: Set<string> }> = {
    Modern: { list: [], seen: new Set() },
    Metallic: { list: [], seen: new Set() },
    Fusion: { list: [], seen: new Set() },
    Anodise: { list: [], seen: new Set() },
    Wood: { list: [], seen: new Set() },
    Patina: { list: [], seen: new Set() },
    Brush: { list: [], seen: new Set() },
    Concrete: { list: [], seen: new Set() },
    Najdi: { list: [], seen: new Set() },
    Prismatic: { list: [], seen: new Set() },
    Sparkle: { list: [], seen: new Set() },
    StoneMarble: { list: [], seen: new Set() },
    Texture: { list: [], seen: new Set() },
  }
  for (const p of palettesList) {
    const entry = byStyle[p.style]
    if (!entry) continue
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
    Brush: byStyle.Brush.list,
    Concrete: byStyle.Concrete.list,
    Najdi: byStyle.Najdi.list,
    Prismatic: byStyle.Prismatic.list,
    Sparkle: byStyle.Sparkle.list,
    StoneMarble: byStyle.StoneMarble.list,
    Texture: byStyle.Texture.list,
  }
}
