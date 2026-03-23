/**
 * Panel texture files under public/Panels/{folder}/ — keep in sync when adding PNGs.
 * fileId = filename without .png (e.g. AB-SS-003).
 */

export const PANEL_TEXTURE_FILES: Record<string, string[]> = {
  wood: [
    'AB-SS-001',
    'AB-SS-002',
    'AB-SS-003',
    'AB-SS-004',
    'AB-SS-005',
    'AB-SS-006',
    'AB-SS-007',
    'AB-SS-008',
    'AB-SS-009',
    'AB-SS-010',
    'AB-SS-011',
    'AB-SS-012-2',
    'AB-SS-013',
    'AB-SS-014',
    'AB-SS-015',
  ],
  patina: ['AB-SS-001', 'AB-SS-002', 'AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006'],
  anodise: ['AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006', 'AB-SS-007', 'AB-SS-008'],
  metalic: [
    'AB-SS-003',
    'AB-SS-004',
    'AB-SS-005',
    'AB-SS-006',
    'AB-SS-007',
    'AB-SS-008',
    'AB-SS-009',
    'AB-SS-010',
    'AB-SS-011',
    'AB-SS-012',
    'AB-SS-013',
    'AB-SS-014',
    'AB-SS-015',
    'AB-SS-016',
    'AB-SS-017',
  ],
  brush: ['AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006', 'AB-SS-007', 'AB-SS-008', 'AB-SS-009'],
  concrete: ['AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006'],
  najdi: ['AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006', 'AB-SS-007', 'AB-SS-008', 'AB-SS-010', 'AB-SS-011', 'AB-SS-012'],
  prismatic: ['AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006', 'AB-SS-007', 'AB-SS-008'],
  sparkle: ['AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006', 'AB-SS-007', 'AB-SS-008'],
  'stone&marbles': [
    'AB-SS-003',
    'AB-SS-004',
    'AB-SS-005',
    'AB-SS-006',
    'AB-SS-007',
    'AB-SS-008',
    'AB-SS-009',
    'AB-SS-010',
    'AB-SS-011',
    'AB-SS-012',
    'AB-SS-013',
    'AB-SS-014',
    'AB-SS-015',
    'AB-SS-016',
    'AB-SS-017',
  ],
  texture: ['AB-SS-003', 'AB-SS-004', 'AB-SS-005', 'AB-SS-006', 'AB-SS-007', 'AB-SS-008'],
}

/** True if this folder + fileId exists on disk (inventory). */
export function isValidPanelTexture(folder: string, fileId: string): boolean {
  const files = PANEL_TEXTURE_FILES[folder]
  return Array.isArray(files) && files.includes(fileId)
}

/** Folder keys that exist under public/Panels/ (stable order for UI). */
export function getPanelTextureFolderList(): string[] {
  return Object.keys(PANEL_TEXTURE_FILES).sort((a, b) => a.localeCompare(b))
}

/** Compact catalog for AI prompts: one "folder|fileId" per line (all folders). */
export function getPanelCatalogForPrompt(): string {
  return getPanelCatalogForFolders(getPanelTextureFolderList())
}

/** Catalog lines only for the given folders (must match keys in PANEL_TEXTURE_FILES). */
export function getPanelCatalogForFolders(folders: string[]): string {
  const allowed = new Set(folders)
  const lines: string[] = []
  for (const [folder, ids] of Object.entries(PANEL_TEXTURE_FILES)) {
    if (!allowed.has(folder)) continue
    for (const fileId of ids) {
      lines.push(`${folder}|${fileId}`)
    }
  }
  return lines.join('\n')
}
