import type { PanelMaterialSlot } from './panelMaterialBulkApply'

export type IfcMeshMeta = { uuid: string; cx: number; cy: number; cz: number }

/**
 * Order IFC mesh fragments for facade-like material bands:
 * - Detects the tallest axis of the model (typical building height).
 * - Slices along that axis into horizontal "courses" (like storey bands).
 * - Sorts within each band by the two horizontal axes so fusion cycles sweep
 *   bottom → top, then left → right / front → back — similar to curtain-wall layout.
 */
export function orderMeshesForIfcFacade(meshes: IfcMeshMeta[]): PanelMaterialSlot[] {
  if (meshes.length === 0) return []

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity
  for (const m of meshes) {
    minX = Math.min(minX, m.cx)
    maxX = Math.max(maxX, m.cx)
    minY = Math.min(minY, m.cy)
    maxY = Math.max(maxY, m.cy)
    minZ = Math.min(minZ, m.cz)
    maxZ = Math.max(maxZ, m.cz)
  }
  const sx = maxX - minX
  const sy = maxY - minY
  const sz = maxZ - minZ

  type Ax = 'x' | 'y' | 'z'
  let vertical: Ax = 'y'
  if (sx >= sy && sx >= sz) vertical = 'x'
  else if (sz >= sy && sz >= sx) vertical = 'z'

  const coord = (m: IfcMeshMeta, a: Ax) => (a === 'x' ? m.cx : a === 'y' ? m.cy : m.cz)
  const vertMin = vertical === 'x' ? minX : vertical === 'y' ? minY : minZ
  const vertSpan = Math.max(vertical === 'x' ? sx : vertical === 'y' ? sy : sz, 1e-6)

  const horizAxes: [Ax, Ax] =
    vertical === 'y'
      ? ['x', 'z']
      : vertical === 'x'
        ? ['y', 'z']
        : ['x', 'y']

  const n = meshes.length
  const targetBands = Math.max(4, Math.min(56, Math.round(Math.sqrt(n * 1.35))))
  const rowStep = Math.max(vertSpan / targetBands, 1e-5)

  type Enriched = IfcMeshMeta & { rowBand: number; h1: number; h2: number }
  const enriched: Enriched[] = meshes.map((m) => {
    const v = coord(m, vertical)
    const rowBand = Math.floor((v - vertMin) / rowStep)
    const h1 = coord(m, horizAxes[0])
    const h2 = coord(m, horizAxes[1])
    return { ...m, rowBand, h1, h2 }
  })

  enriched.sort((a, b) => {
    if (a.rowBand !== b.rowBand) return a.rowBand - b.rowBand
    if (a.h1 !== b.h1) return a.h1 - b.h1
    if (a.h2 !== b.h2) return a.h2 - b.h2
    return a.uuid.localeCompare(b.uuid)
  })

  let lastBand = -1
  let colInBand = 0
  return enriched.map((m, index) => {
    if (m.rowBand !== lastBand) {
      lastBand = m.rowBand
      colInBand = 0
    }
    const col = colInBand++
    return {
      uuid: m.uuid,
      row: m.rowBand,
      col,
      stripeIndex: index,
    }
  })
}
