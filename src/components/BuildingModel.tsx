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
    traverseMeshes(cloned, (mesh) => {
      const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
      if (!mat?.color) return
      const applied = appliedMaterials?.get(mesh.uuid)
      if (applied) {
        mat.color.setHex(applied.color)
        mat.metalness = applied.metalness
        mat.roughness = applied.roughness
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
