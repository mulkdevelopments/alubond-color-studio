import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { MaterialState } from '../types'

const WOOD_PANEL_BASE = '/Panels/wood/'
const PATINA_PANEL_BASE = '/Panels/Platina/'

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
  /** Called with panel uuid and row index (0-based) for each panel; row used for Fusion row-alternating apply. */
  onPanelsReady?: (panels: { uuid: string; row: number }[]) => void
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

/** Create one or more panel meshes for a single cell. Offsets are in cell-local space (cell center = 0,0). */
function createCellMeshes(
  typology: TypologyType,
  _typologyParam: number,
  w: number,
  h: number
): { mesh: THREE.Mesh; offsetX: number; offsetY: number; rotationZ?: number }[] {
  const d = PANEL_DEPTH
  const out: { mesh: THREE.Mesh; offsetX: number; offsetY: number; rotationZ?: number }[] = []

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
      const shape1 = new THREE.Shape().moveTo(-w / 2, -h / 2).lineTo(w / 2, -h / 2).lineTo(w / 2, h / 2).closePath()
      const shape2 = new THREE.Shape().moveTo(-w / 2, -h / 2).lineTo(w / 2, h / 2).lineTo(-w / 2, h / 2).closePath()
      const extrude = { depth: d, bevelEnabled: false }
      const g1 = new THREE.ExtrudeGeometry(shape1, extrude)
      const g2 = new THREE.ExtrudeGeometry(shape2, extrude)
      g1.translate(0, 0, -d / 2)
      g2.translate(0, 0, -d / 2)
      out.push({ mesh: new THREE.Mesh(g1, makePanelMaterial()), offsetX: 0, offsetY: 0 })
      out.push({ mesh: new THREE.Mesh(g2, makePanelMaterial()), offsetX: 0, offsetY: 0 })
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
      const shape = new THREE.Shape().moveTo(0, h / 2).lineTo(w / 2, -h / 2).lineTo(-w / 2, -h / 2).closePath()
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false })
      geo.translate(0, 0, -d / 2)
      out.push({ mesh: new THREE.Mesh(geo, makePanelMaterial()), offsetX: 0, offsetY: 0 })
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
    default: {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makePanelMaterial())
      out.push({ mesh, offsetX: 0, offsetY: 0 })
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
  const { gl, scene: threeScene } = useThree()
  const [hovered, setHovered] = useState<string | null>(null)
  const panelRefs = useRef<Mesh[]>([])
  const woodTextureCache = useRef<Map<string, THREE.Texture>>(new Map())
  const woodTextureLoading = useRef<Set<string>>(new Set())
  const patinaTextureCache = useRef<Map<string, THREE.Texture>>(new Map())
  const patinaTextureLoading = useRef<Set<string>>(new Set())

  // Preload wood panel images by woodPanelId when any panel has wood finish
  useEffect(() => {
    if (!appliedMaterials?.size) return
    const cache = woodTextureCache.current
    const loading = woodTextureLoading.current
    appliedMaterials.forEach((state) => {
      if (state.finish !== 'wood' || !state.woodPanelId) return
      const id = state.woodPanelId
      if (cache.has(id) || loading.has(id)) return
      loading.add(id)
      const url = `${WOOD_PANEL_BASE}${id}.png`
      const loader = new THREE.TextureLoader()
      loader.load(url, (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        if ('colorSpace' in t) (t as THREE.Texture).colorSpace = THREE.SRGBColorSpace
        cache.set(id, t)
        loading.delete(id)
      }, undefined, () => { loading.delete(id) })
    })
  }, [appliedMaterials])

  // Preload patina (Platina) panel images when any panel has patina finish
  useEffect(() => {
    if (!appliedMaterials?.size) return
    const cache = patinaTextureCache.current
    const loading = patinaTextureLoading.current
    appliedMaterials.forEach((state) => {
      if (state.finish !== 'patina' || !state.patinaPanelId) return
      const id = state.patinaPanelId
      if (cache.has(id) || loading.has(id)) return
      loading.add(id)
      const url = `${PATINA_PANEL_BASE}${id}.png`
      const loader = new THREE.TextureLoader()
      loader.load(url, (t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        if ('colorSpace' in t) (t as THREE.Texture).colorSpace = THREE.SRGBColorSpace
        cache.set(id, t)
        loading.delete(id)
      }, undefined, () => { loading.delete(id) })
    })
  }, [appliedMaterials])

  useEffect(() => {
    gl.domElement.style.cursor = selectionToolEnabled && hovered ? 'pointer' : 'default'
  }, [selectionToolEnabled, hovered, gl])

  const { columns, rows, style, transform, tiltAngle, typology, typologyParam } = settings

  const panelW = (FACADE_W - GAP * (columns + 1)) / columns
  const panelH = (FACADE_H - GAP * (rows + 1)) / rows

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
    const list: { mesh: THREE.Mesh; col: number; row: number }[] = []
    const startX = -FACADE_W / 2 + GAP + adjustedPanelW / 2
    const startY = GAP + adjustedPanelH / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const baseX = startX + c * (adjustedPanelW + GAP)
        const baseY = startY + r * (adjustedPanelH + GAP)
        const [rx, ry, rz] = getPanelRotation(c, r, columns, rows, transform, tiltAngle)

        const cellMeshes = createCellMeshes(typology, typologyParam, adjustedPanelW, adjustedPanelH)
        for (const { mesh, offsetX, offsetY, rotationZ } of cellMeshes) {
          mesh.position.set(baseX + offsetX, baseY + offsetY, DEPTH / 2 + PANEL_DEPTH / 2)
          mesh.rotation.set(rx, ry, rz + (rotationZ ?? 0))
          mesh.castShadow = true
          mesh.receiveShadow = true
          list.push({ mesh, col: c, row: r })
        }
      }
    }
    return list
  }, [columns, rows, adjustedPanelW, adjustedPanelH, transform, tiltAngle, typology, typologyParam])

  useEffect(() => {
    panelRefs.current = panels.map((p) => p.mesh)
    onPanelsReady?.(panels.map((p) => ({ uuid: p.mesh.uuid, row: p.row })))
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
    const woodCache = woodTextureCache.current
    const patinaCache = patinaTextureCache.current
    for (const { mesh } of panels) {
      const mat = mesh.material as MeshStandardMaterial
      const applied = appliedMaterials?.get(mesh.uuid)
      if (applied) {
        const isWood = applied.finish === 'wood' && applied.woodPanelId
        const isPatina = applied.finish === 'patina' && applied.patinaPanelId
        const woodTex = isWood && applied.woodPanelId ? woodCache.get(applied.woodPanelId) : null
        const patinaTex = isPatina && applied.patinaPanelId ? patinaCache.get(applied.patinaPanelId) : null
        const panelTex = woodTex ?? patinaTex
        if ((isWood && woodTex) || (isPatina && patinaTex)) {
          mat.map = panelTex!
          mat.color.setHex(0xffffff)
        } else {
          mat.map = null
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
      if (hovered === mesh.uuid) mat.emissive?.setHex(0x222222)
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
