import { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { MaterialState } from '../types'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'

export type PanelTransform = 'flat' | 'alternate' | 'wave' | 'fold' | 'diagonal'
export type PanelStyle = 'landscape' | 'portrait' | 'square'

/** Style & Typology pattern: geometric panel pattern / subdivision type (aligned with competitor) */
export type TypologyType =
  | 'square'
  | 'triangleDown'
  | 'diagonal'        // TL–BR
  | 'diagonalTR'     // TR–BL
  | 'diamond'
  | 'x'
  | 'verticalLine'   // square with one vertical line (2 panels)
  | 'horizontalLine' // square with one horizontal line (2 panels)
  | 'twoVertical'    // 3 vertical divisions
  | 'twoHorizontal'  // 3 horizontal divisions
  // legacy / optional
  | 'parallelogram'
  | 'grid2x2'
  | 'triangleRight'
  | 'triangleLeft'
  | 'grid3x3'
  /** Full cell with a thicker horizontal band at the bottom projecting forward (cassette / reveal). */
  | 'thickBottomLip'
  /** Single cell: panel depth tapers top→bottom; bottom extrusion depth is 4× the top (flat back, sloped outer face). */
  | 'doubleDepthBottom'
  /** Single cell: extrusion depth is 4× nominal at vertical center, tapering linearly to nominal at top and bottom edges. */
  | 'centerDepth4x'

export interface FacadeSettings {
  columns: number
  rows: number
  style: PanelStyle
  typology: TypologyType
  /** Numeric parameter for typology (e.g. grid cell index or divisions), 1–9 */
  typologyParam: number
  transform: PanelTransform
  tiltAngle: number
}

interface FacadeBuildingProps {
  settings: FacadeSettings
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
  /**
   * Called for each paintable panel mesh. `stripeIndex` is 0..n-1 in facade order (used for N-way fusion cycling).
   * `row` is the facade grid row (only 0..rows-1), so using row alone cannot express 3+ palette cycles when rows < 3.
   */
  onPanelsReady?: (panels: { uuid: string; row: number; stripeIndex: number }[]) => void
}

function getMaterialState(mat: MeshStandardMaterial): MaterialState {
  return {
    color: mat.color?.getHex?.() ?? 0x888888,
    metalness: mat.metalness ?? 0,
    roughness: mat.roughness ?? 0.7,
  }
}

const METALLIC_THRESHOLD = 0.5
const METALLIC_ENV_INTENSITY = 1.6

const FACADE_W = 24
const FACADE_H = 14
const DEPTH = 10
const PANEL_DEPTH = 0.15
const GAP = 0.06
const WALL_COLOR = 0x2a2a2a
const DEFAULT_PANEL_COLOR = 0xc0c8d0
const GROUND_COLOR = 0xd8d8d8

function getPanelRotation(
  col: number, row: number, cols: number, rows: number,
  transform: PanelTransform, tiltAngle: number
): [number, number, number] {
  const a = tiltAngle * (Math.PI / 180)
  switch (transform) {
    case 'flat':
      return [0, 0, 0]
    case 'alternate':
      return [0, ((col + row) % 2 === 0 ? a : -a), 0]
    case 'wave':
      return [0, Math.sin((col / cols) * Math.PI * 2) * a, 0]
    case 'fold':
      return [((row % 2 === 0 ? 1 : -1) * a * 0.5), ((col % 2 === 0 ? 1 : -1) * a), 0]
    case 'diagonal': {
      const diag = (col + row) / (cols + rows)
      return [0, Math.sin(diag * Math.PI * 4) * a, 0]
    }
    default:
      return [0, 0, 0]
  }
}

function makePanelMaterial(): MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: DEFAULT_PANEL_COLOR,
    roughness: 0.35,
    metalness: 0.85,
    side: THREE.DoubleSide,
  })
}

/**
 * Maps palette textures in façade space: same (u,v) as a full cell rectangle, using vertex (x,y) in mesh-local
 * space plus the mesh’s cell offset. Fixes missing/bad UVs on extrudes and custom BufferGeometry.
 */
function applyFacadeCellPlanarUVs(
  geo: THREE.BufferGeometry,
  cellW: number,
  cellH: number,
  meshOffsetY = 0,
  meshOffsetX = 0
): void {
  const pos = geo.getAttribute('position')
  if (!pos || pos.count === 0) return
  const n = pos.count
  const uvs = new Float32Array(n * 2)
  const invW = cellW > 1e-8 ? 1 / cellW : 1
  const invH = cellH > 1e-8 ? 1 / cellH : 1
  for (let i = 0; i < n; i++) {
    const xCell = meshOffsetX + pos.getX(i)
    const yCell = meshOffsetY + pos.getY(i)
    uvs[i * 2] = (xCell + cellW / 2) * invW
    uvs[i * 2 + 1] = (yCell + cellH / 2) * invH
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
}

/**
 * Frustum between main face (front at +d/2) and lip front (z = zLipFront), same back plane z = -d/2.
 * Fills the vertical gap so the outer skin ramps instead of a hard step; normals are averaged for smooth light falloff.
 */
function createCassetteBlendGeometry(w: number, blendH: number, d: number, zLipFront: number): THREE.BufferGeometry {
  const hw = w / 2
  const hb = blendH / 2
  const positions = new Float32Array([
    -hw, hb, -d / 2,
    hw, hb, -d / 2,
    hw, hb, d / 2,
    -hw, hb, d / 2,
    -hw, -hb, -d / 2,
    hw, -hb, -d / 2,
    hw, -hb, zLipFront,
    -hw, -hb, zLipFront,
  ])
  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    0, 4, 5, 0, 5, 1,
    3, 2, 6, 3, 6, 7,
    0, 3, 7, 0, 7, 4,
    1, 5, 6, 1, 6, 2,
  ]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Flat vertical back (same plane as standard `dTop` panels); outer face ramps so depth is `dTop` at top and `dBottom` at bottom. */
function createLinearTaperDepthGeometry(w: number, h: number, dTop: number, dBottom: number): THREE.BufferGeometry {
  const hw = w / 2
  const hh = h / 2
  const zBack = -dTop / 2
  const zFrontTop = zBack + dTop
  const zFrontBot = zBack + dBottom
  const positions = new Float32Array([
    -hw, hh, zBack,
    hw, hh, zBack,
    hw, hh, zFrontTop,
    -hw, hh, zFrontTop,
    -hw, -hh, zBack,
    hw, -hh, zBack,
    hw, -hh, zFrontBot,
    -hw, -hh, zFrontBot,
  ])
  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1,
    3, 2, 6, 3, 6, 7,
    0, 3, 7, 0, 7, 4,
    1, 5, 6, 1, 6, 2,
  ]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/**
 * Flat back (z = −dEdge/2); front depth varies with |y|: `dEdge` at y = ±h/2, `dEdge * peakMult` at y = 0 (linear in |y|).
 */
function createCenterPeakDepthGeometry(
  w: number,
  h: number,
  dEdge: number,
  peakMult: number,
  ringSegments: number
): THREE.BufferGeometry {
  const hw = w / 2
  const hh = h / 2
  const zb = -dEdge / 2
  const segs = Math.max(8, ringSegments)
  const rings = segs + 1
  const positions: number[] = []
  const indices: number[] = []

  const depthAtY = (y: number) => {
    const t = Math.abs(y) / hh
    return dEdge * (peakMult - (peakMult - 1) * t)
  }

  for (let i = 0; i < rings; i++) {
    const y = -hh + (i / segs) * h
    const zf = zb + depthAtY(y)
    positions.push(-hw, y, zb, hw, y, zb, hw, y, zf, -hw, y, zf)
  }

  const v = (ring: number, corner: number) => ring * 4 + corner

  for (let i = 0; i < segs; i++) {
    const bi = v(i, 0)
    indices.push(bi + 0, bi + 4, bi + 5, bi + 0, bi + 5, bi + 1)
    indices.push(bi + 2, bi + 3, bi + 7, bi + 2, bi + 7, bi + 6)
    indices.push(bi + 0, bi + 4, bi + 7, bi + 0, bi + 7, bi + 3)
    indices.push(bi + 1, bi + 5, bi + 6, bi + 1, bi + 6, bi + 2)
  }

  const b0 = 0
  indices.push(b0 + 0, b0 + 1, b0 + 2, b0 + 0, b0 + 2, b0 + 3)

  const bt = v(segs, 0)
  indices.push(bt + 1, bt + 0, bt + 3, bt + 1, bt + 3, bt + 2)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Triangular prism: vertices A,B,C in XY, CCW from +Z; extruded z ∈ [−d/2, d/2]. */
function createTriangularPrismGeometry(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  d: number
): THREE.BufferGeometry {
  const z0 = -d / 2
  const z1 = d / 2
  const positions = new Float32Array([
    ax, ay, z0,
    bx, by, z0,
    cx, cy, z0,
    ax, ay, z1,
    bx, by, z1,
    cx, cy, z1,
  ])
  const indices = [
    0, 2, 1,
    3, 4, 5,
    0, 1, 4, 0, 4, 3,
    1, 2, 5, 1, 5, 4,
    2, 0, 3, 2, 3, 5,
  ]
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function createDiagonalSplitGeometries(w: number, h: number, d: number): [THREE.BufferGeometry, THREE.BufferGeometry] {
  const bl: [number, number] = [-w / 2, -h / 2]
  const br: [number, number] = [w / 2, -h / 2]
  const tr: [number, number] = [w / 2, h / 2]
  const tl: [number, number] = [-w / 2, h / 2]
  const gLower = createTriangularPrismGeometry(bl[0], bl[1], br[0], br[1], tr[0], tr[1], d)
  const gUpper = createTriangularPrismGeometry(bl[0], bl[1], tr[0], tr[1], tl[0], tl[1], d)
  return [gLower, gUpper]
}

/** Up-pointing triangle plus left/right top-corner prisms (down-pointing from the top edge), filling the cell rectangle. */
function createTriangleColumnStackGeometries(
  w: number,
  h: number,
  d: number
): [THREE.BufferGeometry, THREE.BufferGeometry, THREE.BufferGeometry] {
  const bl: [number, number] = [-w / 2, -h / 2]
  const br: [number, number] = [w / 2, -h / 2]
  const apex: [number, number] = [0, h / 2]
  const tl: [number, number] = [-w / 2, h / 2]
  const tr: [number, number] = [w / 2, h / 2]
  const gUp = createTriangularPrismGeometry(bl[0], bl[1], br[0], br[1], apex[0], apex[1], d)
  const gLeftInv = createTriangularPrismGeometry(apex[0], apex[1], tl[0], tl[1], bl[0], bl[1], d)
  const gRightInv = createTriangularPrismGeometry(apex[0], apex[1], tr[0], tr[1], br[0], br[1], d)
  return [gUp, gLeftInv, gRightInv]
}

/** Create one or more panel meshes for a single cell. Offsets are in cell-local space (cell center = 0,0). */
function createCellMeshes(
  typology: TypologyType,
  _typologyParam: number,
  w: number,
  h: number
): { mesh: THREE.Mesh; offsetX: number; offsetY: number; rotationZ?: number; offsetZ?: number }[] {
  const d = PANEL_DEPTH
  const out: { mesh: THREE.Mesh; offsetX: number; offsetY: number; rotationZ?: number; offsetZ?: number }[] = []

  switch (typology) {
    case 'square': {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makePanelMaterial())
      out.push({ mesh, offsetX: 0, offsetY: 0 })
      break
    }
    case 'parallelogram': {
      // Sheared quad: horizontal top/bottom, slanted sides (like the icon - skewed prism)
      const skew = w * 0.12
      const shape = new THREE.Shape()
        .moveTo(-w / 2 + skew, -h / 2)
        .lineTo(w / 2 + skew, -h / 2)
        .lineTo(w / 2 - skew, h / 2)
        .lineTo(-w / 2 - skew, h / 2)
        .closePath()
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
      geo.translate(0, 0, -d / 2)
      out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      break
    }
    case 'diagonal': {
      const [gLower, gUpper] = createDiagonalSplitGeometries(w, h, d)
      const matLower = makePanelMaterial()
      const matUpper = makePanelMaterial()
      matLower.color.multiplyScalar(0.88)
      out.push({ mesh: new THREE.Mesh(gLower, matLower), offsetX: 0, offsetY: 0 })
      out.push({ mesh: new THREE.Mesh(gUpper, matUpper), offsetX: 0, offsetY: 0 })
      break
    }
    case 'diagonalTR': {
      const shape1 = new THREE.Shape().moveTo(w / 2, -h / 2).lineTo(-w / 2, -h / 2).lineTo(-w / 2, h / 2).closePath()
      const shape2 = new THREE.Shape().moveTo(w / 2, -h / 2).lineTo(w / 2, h / 2).lineTo(-w / 2, h / 2).closePath()
      const extrude = { depth: d, bevelEnabled: false }
      const g1 = new THREE.ExtrudeGeometry(shape1, extrude)
      const g2 = new THREE.ExtrudeGeometry(shape2, extrude)
      g1.translate(0, 0, -d / 2)
      g2.translate(0, 0, -d / 2)
      out.push({ mesh: new THREE.Mesh(g1, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      out.push({ mesh: new THREE.Mesh(g2, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      break
    }
    case 'verticalLine': {
      const gap2 = GAP / 2
      const halfW = w / 2 - gap2
      out.push({ mesh: new THREE.Mesh(new THREE.BoxGeometry(halfW, h, d), makePanelMaterial()), offsetX: -w / 4 - gap2 / 2, offsetY: 0 })
      out.push({ mesh: new THREE.Mesh(new THREE.BoxGeometry(halfW, h, d), makePanelMaterial()), offsetX: w / 4 + gap2 / 2, offsetY: 0 })
      break
    }
    case 'horizontalLine': {
      const gap2 = GAP / 2
      const halfH = h / 2 - gap2
      out.push({ mesh: new THREE.Mesh(new THREE.BoxGeometry(w, halfH, d), makePanelMaterial()), offsetX: 0, offsetY: h / 4 + gap2 / 2 })
      out.push({ mesh: new THREE.Mesh(new THREE.BoxGeometry(w, halfH, d), makePanelMaterial()), offsetX: 0, offsetY: -h / 4 - gap2 / 2 })
      break
    }
    case 'twoVertical': {
      const gap3 = GAP / 3
      const thirdW = w / 3 - gap3
      for (let i = 0; i < 3; i++) {
        const ox = (i - 1) * (w / 3) + w / 6
        out.push({ mesh: new THREE.Mesh(new THREE.BoxGeometry(thirdW, h, d), makePanelMaterial()), offsetX: ox, offsetY: 0 })
      }
      break
    }
    case 'twoHorizontal': {
      const gap3 = GAP / 3
      const thirdH = h / 3 - gap3
      for (let i = 0; i < 3; i++) {
        const oy = (i - 1) * (h / 3) + h / 6
        out.push({ mesh: new THREE.Mesh(new THREE.BoxGeometry(w, thirdH, d), makePanelMaterial()), offsetX: 0, offsetY: oy })
      }
      break
    }
    case 'x': {
      const cx = 0, cy = 0
      for (const [ax, ay, bx, by, cx_, cy_] of [
        [-w / 2, -h / 2, w / 2, -h / 2, cx, cy],
        [w / 2, -h / 2, w / 2, h / 2, cx, cy],
        [w / 2, h / 2, -w / 2, h / 2, cx, cy],
        [-w / 2, h / 2, -w / 2, -h / 2, cx, cy],
      ]) {
        const shape = new THREE.Shape().moveTo(ax, ay).lineTo(bx, by).lineTo(cx_, cy_).closePath()
        const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
        geo.translate(0, 0, -d / 2)
        out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      }
      break
    }
    case 'grid2x2': {
      const gap2 = GAP / 2
      const sw = w / 2 - gap2
      const sh = h / 2 - gap2
      const positions: [number, number][] = [
        [-w / 4 + sw / 2, h / 4 - sh / 2],
        [w / 4 - sw / 2, h / 4 - sh / 2],
        [-w / 4 + sw / 2, -h / 4 + sh / 2],
        [w / 4 - sw / 2, -h / 4 + sh / 2],
      ]
      for (const [ox, oy] of positions) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, d), makePanelMaterial())
        out.push({ mesh, offsetX: ox, offsetY: oy })
      }
      break
    }
    case 'grid3x3': {
      const gap3 = GAP / 3
      const sw = w / 3 - gap3
      const sh = h / 3 - gap3
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const ox = (c - 1) * (w / 3) + w / 6
          const oy = (r - 1) * (h / 3) + h / 6
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, d), makePanelMaterial())
          out.push({ mesh, offsetX: ox, offsetY: oy })
        }
      }
      break
    }
    case 'triangleDown': {
      const [gUp, gLeft, gRight] = createTriangleColumnStackGeometries(w, h, d)
      const matUp = makePanelMaterial()
      const matInv = makePanelMaterial()
      matInv.color.multiplyScalar(0.9)
      out.push({ mesh: new THREE.Mesh(gUp, matUp), offsetX: 0, offsetY: 0 })
      out.push({ mesh: new THREE.Mesh(gLeft, matInv), offsetX: 0, offsetY: 0 })
      const matInvR = makePanelMaterial()
      matInvR.color.multiplyScalar(0.9)
      out.push({ mesh: new THREE.Mesh(gRight, matInvR), offsetX: 0, offsetY: 0 })
      break
    }
    case 'triangleRight': {
      const shape = new THREE.Shape().moveTo(-w / 2, -h / 2).lineTo(w / 2, 0).lineTo(-w / 2, h / 2).closePath()
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
      geo.translate(0, 0, -d / 2)
      out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      break
    }
    case 'triangleLeft': {
      const shape = new THREE.Shape().moveTo(w / 2, -h / 2).lineTo(-w / 2, 0).lineTo(w / 2, h / 2).closePath()
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
      geo.translate(0, 0, -d / 2)
      out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      break
    }
    case 'diamond': {
      const shape = new THREE.Shape()
        .moveTo(0, h / 2)
        .lineTo(w / 2, 0)
        .lineTo(0, -h / 2)
        .lineTo(-w / 2, 0)
        .closePath()
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
      geo.translate(0, 0, -d / 2)
      out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      break
    }
    case 'doubleDepthBottom': {
      const dTop = d
      const dBottom = d * 4
      const geo = createLinearTaperDepthGeometry(w, h, dTop, dBottom)
      out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      break
    }
    case 'centerDepth4x': {
      const geo = createCenterPeakDepthGeometry(w, h, d, 4, 32)
      out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      break
    }
    case 'thickBottomLip': {
      const lipFrac = 0.2
      const lipH = Math.max(h * lipFrac, 0.05)
      const lipD = d * 2.35
      const zLipFront = lipD - d / 2
      const maxBlend = Math.max(h - lipH - h * 0.1, 0.04)
      const blendH = Math.min(Math.max(lipH * 0.55, h * 0.032), maxBlend)
      const mainH = h - lipH - blendH
      const main = new THREE.Mesh(new THREE.BoxGeometry(w, mainH, d), makePanelMaterial())
      const blend = new THREE.Mesh(createCassetteBlendGeometry(w, blendH, d, zLipFront), makePanelMaterial())
      const lip = new THREE.Mesh(new THREE.BoxGeometry(w, lipH, lipD), makePanelMaterial())
      const mainOffsetY = (lipH + blendH) / 2
      const blendOffsetY = -h / 2 + lipH + blendH / 2
      const lipOffsetY = -h / 2 + lipH / 2
      const lipOffsetZ = (lipD - d) / 2
      out.push({ mesh: main, offsetX: 0, offsetY: mainOffsetY })
      out.push({ mesh: blend, offsetX: 0, offsetY: blendOffsetY })
      out.push({ mesh: lip, offsetX: 0, offsetY: lipOffsetY, offsetZ: lipOffsetZ })
      break
    }
    default: {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makePanelMaterial())
      out.push({ mesh, offsetX: 0, offsetY: 0 })
    }
  }
  if (typology !== 'square') {
    for (const { mesh, offsetX, offsetY } of out) {
      const g = mesh.geometry as THREE.BufferGeometry
      if (g) applyFacadeCellPlanarUVs(g, w, h, offsetY, offsetX)
    }
  }
  return out
}

export function FacadeBuilding({
  settings,
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
  onPanelsReady,
}: FacadeBuildingProps) {
  const groupRef = useRef<Group>(null)
  const { gl, scene: threeScene, invalidate } = useThree()
  const [hovered, setHovered] = useState<string | null>(null)
  const panelRefs = useRef<Mesh[]>([])
  const panelTextureCache = useRef<Map<string, THREE.Texture>>(new Map())
  const panelTextureLoading = useRef<Set<string>>(new Set())

  // Re-render the canvas when overrides change so materials don’t wait for another UI event
  useLayoutEffect(() => {
    invalidate()
  }, [appliedMaterials, invalidate])

  // Preload any applied panel textures (all categories under public/Panels/)
  useEffect(() => {
    if (!appliedMaterials?.size) return
    const cache = panelTextureCache.current
    const loading = panelTextureLoading.current
    appliedMaterials.forEach((state) => {
      if (!state.panelTexture) return
      const url = getPanelTextureUrl(state.panelTexture)
      if (cache.has(url) || loading.has(url)) return
      loading.add(url)
      const loader = new THREE.TextureLoader()
      loader.load(
        url,
        (t) => {
          t.wrapS = t.wrapT = THREE.RepeatWrapping
          if ('colorSpace' in t) (t as THREE.Texture).colorSpace = THREE.SRGBColorSpace
          t.needsUpdate = true
          cache.set(url, t)
          loading.delete(url)
          invalidate()
        },
        undefined,
        () => {
          loading.delete(url)
        }
      )
    })
  }, [appliedMaterials, invalidate])

  useEffect(() => {
    gl.domElement.style.cursor = selectionToolEnabled && hovered ? 'pointer' : 'default'
  }, [selectionToolEnabled, hovered, gl])

  const { columns, rows, style, transform, tiltAngle, typology, typologyParam } = settings

  /** Upward triangles share bottom corners / stacked apexes; normal GAP would show as dark strips between cells. */
  const cellGap = typology === 'triangleDown' ? 0 : GAP

  const panelW = (FACADE_W - cellGap * (columns + 1)) / columns
  const panelH = (FACADE_H - cellGap * (rows + 1)) / rows

  const adjustedPanelW = style === 'portrait' ? panelW * 0.6 : style === 'square' ? Math.min(panelW, panelH) : panelW
  const adjustedPanelH = style === 'portrait' ? panelH : style === 'square' ? Math.min(panelW, panelH) : panelH

  const building = useMemo(() => {
    const g = new THREE.Group()

    const wallMat = new THREE.MeshStandardMaterial({ color: WALL_COLOR, roughness: 0.9, metalness: 0 })

    // Back wall
    const back = new THREE.Mesh(new THREE.BoxGeometry(FACADE_W + 0.4, FACADE_H, 0.2), wallMat)
    back.position.set(0, FACADE_H / 2, -DEPTH / 2)
    g.add(back)

    // Left wall
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, FACADE_H, DEPTH), wallMat)
    left.position.set(-FACADE_W / 2 - 0.1, FACADE_H / 2, 0)
    g.add(left)

    // Right wall
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.2, FACADE_H, DEPTH), wallMat)
    right.position.set(FACADE_W / 2 + 0.1, FACADE_H / 2, 0)
    g.add(right)

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(FACADE_W + 0.4, 0.3, DEPTH + 0.4), wallMat)
    roof.position.set(0, FACADE_H + 0.15, 0)
    g.add(roof)

    // Ground
    const groundMat = new THREE.MeshStandardMaterial({ color: GROUND_COLOR, roughness: 0.95, metalness: 0 })
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.01
    ground.receiveShadow = true
    g.add(ground)

    return g
  }, [])

  const panels = useMemo(() => {
    const list: { mesh: THREE.Mesh; col: number; row: number; stripeIndex: number }[] = []
    const startX = -FACADE_W / 2 + cellGap + adjustedPanelW / 2
    const startY = cellGap + adjustedPanelH / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const baseX = startX + c * (adjustedPanelW + cellGap)
        const baseY = startY + r * (adjustedPanelH + cellGap)
        const [rx, ry, rz] = getPanelRotation(c, r, columns, rows, transform, tiltAngle)

        const cellMeshes = createCellMeshes(typology, typologyParam, adjustedPanelW, adjustedPanelH)
        const baseZ = DEPTH / 2 + PANEL_DEPTH / 2
        for (const { mesh, offsetX, offsetY, rotationZ, offsetZ } of cellMeshes) {
          mesh.position.set(baseX + offsetX, baseY + offsetY, baseZ + (offsetZ ?? 0))
          mesh.rotation.set(rx, ry, rz + (rotationZ ?? 0))
          mesh.castShadow = true
          mesh.receiveShadow = true
          if (typology === 'diagonal' || typology === 'triangleDown') mesh.userData.cellGroupKey = `${c}-${r}`
          list.push({ mesh, col: c, row: r, stripeIndex: list.length })
        }
      }
    }
    return list
  }, [columns, rows, adjustedPanelW, adjustedPanelH, cellGap, transform, tiltAngle, typology, typologyParam])

  useEffect(() => {
    panelRefs.current = panels.map((p) => p.mesh)
    onPanelsReady?.(
      panels.map((p) => ({ uuid: p.mesh.uuid, row: p.row, stripeIndex: p.stripeIndex }))
    )
  }, [panels, onPanelsReady])

  const handleClick = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation()
    if (!selectionToolEnabled) return
    const mesh = e.object as Mesh
    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
    if (!mat?.color) return
    onApplyColor(mesh.uuid, getMaterialState(mat))
  }

  useFrame(() => {
    const envMap = threeScene.environment ?? null
    const texCache = panelTextureCache.current
    const hoveredCellGroupKey =
      hovered != null
        ? (panels.find((p) => p.mesh.uuid === hovered)?.mesh.userData as { cellGroupKey?: string })?.cellGroupKey
        : null
    for (const { mesh } of panels) {
      const mat = mesh.material as MeshStandardMaterial
      const applied = appliedMaterials?.get(mesh.uuid)
      if (applied) {
        const url = applied.panelTexture ? getPanelTextureUrl(applied.panelTexture) : null
        const panelTex = url ? texCache.get(url) : null
        if (applied.panelTexture && panelTex) {
          if (mat.map !== panelTex) {
            mat.map = panelTex
            mat.needsUpdate = true
          }
          mat.color.setHex(0xffffff)
        } else if (applied.panelTexture && url) {
          // Texture still loading: tint with palette colour so panels don’t flash white/grey
          if (mat.map != null) {
            mat.map = null
            mat.needsUpdate = true
          }
          mat.color.setHex(applied.color)
          mat.metalness = applied.metalness
          mat.roughness = applied.roughness
        } else {
          if (mat.map != null) {
            mat.map = null
            mat.needsUpdate = true
          }
          mat.color.setHex(applied.color)
        }
        mat.metalness = applied.metalness
        mat.roughness = applied.roughness
        if (applied.metalness >= METALLIC_THRESHOLD && envMap) {
          mat.envMap = envMap
          mat.envMapIntensity = METALLIC_ENV_INTENSITY
        } else {
          mat.envMapIntensity = 1
        }
      }
      const cellGroupKey = (mesh.userData as { cellGroupKey?: string }).cellGroupKey
      const hoverGlow =
        hovered != null &&
        (mesh.uuid === hovered ||
          (cellGroupKey != null && cellGroupKey === hoveredCellGroupKey))
      if (hoverGlow) mat.emissive?.setHex(0x222222)
      else mat.emissive?.setHex(0x000000)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={building} />
      {panels.map(({ mesh }) => (
        <primitive
          key={mesh.uuid}
          object={mesh}
          onClick={handleClick}
          onPointerOver={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
            e.stopPropagation()
            setHovered(mesh.uuid)
          }}
          onPointerOut={() => setHovered(null)}
        />
      ))}
    </group>
  )
}
