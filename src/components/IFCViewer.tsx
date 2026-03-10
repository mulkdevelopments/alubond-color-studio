import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Mesh, MeshStandardMaterial, Group } from 'three'
import { IfcAPI } from 'web-ifc'
import type { MaterialState } from '../types'

interface IFCViewerProps {
  ifcUrl: string
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

function CanvasRef({ onReady }: { onReady: (canvas: HTMLCanvasElement) => void }) {
  const { gl } = useThree()
  useEffect(() => { onReady(gl.domElement) }, [gl, onReady])
  return null
}

function getMaterialState(mat: MeshStandardMaterial): MaterialState {
  return {
    color: mat.color?.getHex?.() ?? 0x888888,
    metalness: mat.metalness ?? 0,
    roughness: mat.roughness ?? 0.7,
  }
}

function IFCModel({
  ifcUrl,
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
}: {
  ifcUrl: string
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
}) {
  const groupRef = useRef<Group>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const { gl, scene: threeScene } = useThree()

  useEffect(() => {
    gl.domElement.style.cursor = selectionToolEnabled && hovered ? 'pointer' : 'default'
  }, [selectionToolEnabled, hovered, gl])

  useEffect(() => {
    let cancelled = false
    const ifcApi = new IfcAPI()

    async function load() {
      try {
        ifcApi.SetWasmPath('/')
        await ifcApi.Init()

        const response = await fetch(ifcUrl)
        const data = new Uint8Array(await response.arrayBuffer())
        const modelID = ifcApi.OpenModel(data)

        if (cancelled) { ifcApi.CloseModel(modelID); return }

        const group = groupRef.current
        if (!group) return

        while (group.children.length > 0) group.remove(group.children[0])

        ifcApi.StreamAllMeshes(modelID, (flatMesh) => {
          const placedGeometries = flatMesh.geometries
          for (let i = 0; i < placedGeometries.size(); i++) {
            const placed = placedGeometries.get(i)
            const geometry = ifcApi.GetGeometry(modelID, placed.geometryExpressID)

            const verts = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize())
            const indices = ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize())

            const bufferGeometry = new THREE.BufferGeometry()

            const posFloats = new Float32Array(verts.length / 2 * 3)
            const normFloats = new Float32Array(verts.length / 2 * 3)
            for (let j = 0; j < verts.length; j += 6) {
              const idx = (j / 6) * 3
              posFloats[idx] = verts[j]
              posFloats[idx + 1] = verts[j + 1]
              posFloats[idx + 2] = verts[j + 2]
              normFloats[idx] = verts[j + 3]
              normFloats[idx + 1] = verts[j + 4]
              normFloats[idx + 2] = verts[j + 5]
            }

            bufferGeometry.setAttribute('position', new THREE.BufferAttribute(posFloats, 3))
            bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normFloats, 3))
            bufferGeometry.setIndex(new THREE.BufferAttribute(indices, 1))

            const color = new THREE.Color(placed.color.x, placed.color.y, placed.color.z)
            const opacity = placed.color.w

            const material = new THREE.MeshStandardMaterial({
              color,
              opacity,
              transparent: opacity < 1,
              side: THREE.DoubleSide,
              roughness: 0.7,
              metalness: 0,
            })

            const mesh = new THREE.Mesh(bufferGeometry, material)

            const matrix = new THREE.Matrix4()
            matrix.fromArray(placed.flatTransformation)
            mesh.applyMatrix4(matrix)

            group.add(mesh)
            geometry.delete()
          }
        })

        ifcApi.CloseModel(modelID)

        // Auto-fit camera to loaded model
        const box = new THREE.Box3().setFromObject(group)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        group.position.sub(center)

        if (maxDim > 0) {
          const scale = 40 / maxDim
          group.scale.setScalar(scale)
        }

        if (!cancelled) setLoaded(true)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load IFC')
      }
    }

    load()
    return () => { cancelled = true }
  }, [ifcUrl])

  const handleClick = (e: { stopPropagation: () => void; object: THREE.Object3D }) => {
    e.stopPropagation()
    if (!selectionToolEnabled) return
    const mesh = e.object as Mesh
    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
    if (!mat?.color) return
    onApplyColor(mesh.uuid, getMaterialState(mat))
  }

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const envMap = threeScene.environment ?? null
    group.traverse((node) => {
      if (!(node as Mesh).isMesh) return
      const mesh = node as Mesh
      const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial
      if (!mat?.color) return
      const applied = appliedMaterials?.get(mesh.uuid)
      if (applied) {
        mat.color.setHex(applied.color)
        mat.metalness = applied.metalness
        mat.roughness = applied.roughness
        if (applied.metalness >= 0.5 && envMap) {
          mat.envMap = envMap
          mat.envMapIntensity = 1.6
        } else {
          mat.envMapIntensity = 1
        }
      }
      if (hovered === mesh.uuid) mat.emissive?.setHex(0x222222)
      else mat.emissive?.setHex(0x000000)
    })
  })

  if (error) {
    return (
      <Html center>
        <div style={{ color: '#f87171', fontSize: 14, textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Failed to load IFC file</p>
          <p style={{ color: '#8b949e' }}>{error}</p>
        </div>
      </Html>
    )
  }

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e: { stopPropagation: () => void; object: THREE.Object3D }) => {
        e.stopPropagation()
        setHovered((e.object as Mesh).uuid)
      }}
      onPointerOut={() => setHovered(null)}
    >
      {!loaded && (
        <Html center>
          <div style={{ color: '#8b949e', fontSize: 14 }}>Loading IFC model…</div>
        </Html>
      )}
    </group>
  )
}

export function IFCViewer({
  ifcUrl,
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
  onCanvasReady,
}: IFCViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#fafafa' }}>
      <Canvas
        shadows
        camera={{ position: [40, 30, 40], fov: 45 }}
        gl={{
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.setClearColor(0xfafafa, 1)
        }}
      >
        <Suspense fallback={<Html center><span style={{ color: '#333', fontSize: 14 }}>Loading…</span></Html>}>
          {onCanvasReady && <CanvasRef onReady={onCanvasReady} />}
          <ambientLight intensity={0.85} />
          <directionalLight position={[20, 25, 15]} intensity={0.6} castShadow />
          <directionalLight position={[-15, 20, -10]} intensity={0.35} />
          <Environment preset="warehouse" />
          <IFCModel
            ifcUrl={ifcUrl}
            selectionToolEnabled={selectionToolEnabled}
            onApplyColor={onApplyColor}
            appliedMaterials={appliedMaterials}
          />
          <OrbitControls makeDefault enablePan enableZoom enableRotate minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        </Suspense>
      </Canvas>
    </div>
  )
}
