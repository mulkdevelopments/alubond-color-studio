import { useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group, Mesh, Material, MeshStandardMaterial } from 'three'
import type { GLTF } from 'three-stdlib'
import type { SelectedSurface } from '../types'

type GLTFResult = GLTF & {
  nodes: Record<string, Mesh>
  materials: Record<string, Material>
}

interface BuildingModelProps {
  url: string
  selectedIds: Set<string>
  onSelect: (surfaces: SelectedSurface[]) => void
  appliedMaterials?: Map<string, { color: number; metalness: number; roughness: number }>
}

function traverseMeshes(node: THREE.Object3D, fn: (mesh: Mesh) => void) {
  if ((node as Mesh).isMesh) fn(node as Mesh)
  node.children.forEach((c) => traverseMeshes(c, fn))
}

export function BuildingModel({ url, selectedIds, onSelect, appliedMaterials }: BuildingModelProps) {
  const group = useRef<Group>(null)
  const { scene } = useGLTF(url) as GLTFResult
  const [hovered, setHovered] = useState<string | null>(null)

  const clone = useRef<Group | null>(null)
  if (!clone.current) {
    clone.current = scene.clone(true) as Group
  }
  const cloned = clone.current

  const collectSelectable = (): SelectedSurface[] => {
    const out: SelectedSurface[] = []
    traverseMeshes(cloned, (mesh) => {
      if (!mesh.material) return
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
      const uuid = mesh.uuid
      const std = mat as MeshStandardMaterial
      out.push({
        uuid,
        name: mesh.name || uuid.slice(0, 8),
        material: mat,
        originalColor: std.color?.getHex?.(),
        originalMetalness: std.metalness,
        originalRoughness: std.roughness,
      })
    })
    return out
  }

  const handleClick = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation()
    const mesh = e.object as Mesh
    const all = collectSelectable()
    const existing = new Set(selectedIds)
    if (existing.has(mesh.uuid)) existing.delete(mesh.uuid)
    else existing.add(mesh.uuid)
    onSelect(all.filter((s) => existing.has(s.uuid)))
  }

  useFrame(() => {
    traverseMeshes(cloned, (mesh) => {
      const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
      if (!mat?.color) return
      const applied = appliedMaterials?.get(mesh.uuid)
      if (applied) {
        mat.color.setHex(applied.color)
        mat.metalness = applied.metalness
        mat.roughness = applied.roughness
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
