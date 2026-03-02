import { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { GLTF } from 'three-stdlib'
import type { MaterialState } from '../types'

type GLTFResult = GLTF & {
  nodes: Record<string, Mesh>
  materials: Record<string, THREE.Material>
}

interface BuildingModelProps {
  url: string
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
}

function traverseMeshes(node: THREE.Object3D, fn: (mesh: Mesh) => void) {
  if ((node as Mesh).isMesh) fn(node as Mesh)
  node.children.forEach((c) => traverseMeshes(c, fn))
}

function getMaterialState(mat: MeshStandardMaterial): MaterialState {
  return {
    color: mat.color?.getHex?.() ?? 0x888888,
    metalness: mat.metalness ?? 0,
    roughness: mat.roughness ?? 0.7,
  }
}

const METALLIC_ENV_INTENSITY = 1.6
const METALLIC_THRESHOLD = 0.5

/** Creates a reusable wood-grain texture (neutral tones so material color tints it). */
function createWoodGrainTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  // Base: light warm neutral so oak/walnut/teak tint shows through
  ctx.fillStyle = '#e5dccf'
  ctx.fillRect(0, 0, size, size)
  // Horizontal grain lines (main wood-grain look)
  const lineCount = 120
  for (let i = 0; i < lineCount; i++) {
    const y = (i / lineCount) * size + (Math.random() - 0.5) * 6
    const thickness = 0.4 + Math.random() * 1.4
    const alpha = 0.12 + Math.random() * 0.22
    ctx.fillStyle = `rgba(70,55,45,${alpha})`
    ctx.fillRect(0, Math.floor(y), size, Math.max(1, thickness))
  }
  // Lighter streaks between grain (annual ring effect)
  for (let x = 0; x < size; x += 3 + Math.floor(Math.random() * 6)) {
    const g = 0.88 + Math.random() * 0.14
    ctx.fillStyle = `rgb(${Math.floor(g * 230)},${Math.floor(g * 218)},${Math.floor(g * 200)})`
    ctx.fillRect(x, 0, 2, size)
  }
  // Fine fibre noise
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22
    data[i] = Math.max(0, Math.min(255, data[i] + n))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
  }
  ctx.putImageData(imageData, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

let woodGrainTexture: THREE.CanvasTexture | null = null
function getWoodGrainTexture(): THREE.CanvasTexture {
  if (!woodGrainTexture) woodGrainTexture = createWoodGrainTexture()
  return woodGrainTexture
}

export function BuildingModel({
  url,
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
}: BuildingModelProps) {
  const group = useRef<Group>(null)
  const { scene } = useGLTF(url) as GLTFResult
  const { gl, scene: threeScene } = useThree()
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    gl.domElement.style.cursor = selectionToolEnabled && hovered ? 'pointer' : 'default'
  }, [selectionToolEnabled, hovered, gl])

  const clone = useRef<Group | null>(null)
  if (!clone.current) {
    clone.current = scene.clone(true) as Group
  }
  const cloned = clone.current

  const handleClick = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation()
    if (!selectionToolEnabled) return
    const mesh = e.object as Mesh
    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
    if (!mat?.color) return
    const currentState = getMaterialState(mat)
    onApplyColor(mesh.uuid, currentState)
  }

  useFrame(() => {
    const envMap = threeScene.environment ?? null
    const woodTex = getWoodGrainTexture()
    traverseMeshes(cloned, (mesh) => {
      const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
      if (!mat?.color) return
      const applied = appliedMaterials?.get(mesh.uuid)
      if (applied) {
        mat.color.setHex(applied.color)
        mat.metalness = applied.metalness
        mat.roughness = applied.roughness
        if (applied.finish === 'wood') {
          mat.map = woodTex
        } else {
          mat.map = null
        }
        if (applied.metalness >= METALLIC_THRESHOLD && envMap) {
          mat.envMap = envMap
          mat.envMapIntensity = METALLIC_ENV_INTENSITY
        } else {
          mat.envMapIntensity = 1
        }
      }
      const isHover = hovered === mesh.uuid
      if (isHover) mat.emissive?.setHex(0x222222)
      else mat.emissive?.setHex(0x000000)
    })
  })

  return (
    <group ref={group}>
      <primitive
        object={cloned}
        onClick={handleClick}
        onPointerOver={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
          e.stopPropagation()
          setHovered((e.object as Mesh).uuid)
        }}
        onPointerOut={() => setHovered(null)}
      />
    </group>
  )
}

useGLTF.preload('/models/building/building.gltf')
useGLTF.preload('/models/zaha_hadid/zaha_hadid.glb')
