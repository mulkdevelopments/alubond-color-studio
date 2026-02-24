import { Suspense, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Stage, Html } from '@react-three/drei'
import * as THREE from 'three'
import { BuildingModel } from './BuildingModel'
import type { SelectedSurface } from '../types'

const DEFAULT_MODEL = '/models/building/building.gltf'

function CanvasRef({ onReady }: { onReady: (canvas: HTMLCanvasElement) => void }) {
  const { gl } = useThree()
  useEffect(() => {
    onReady(gl.domElement)
  }, [gl, onReady])
  return null
}

interface Viewer3DProps {
  modelUrl?: string
  selectedSurfaces: SelectedSurface[]
  onSelectionChange: (surfaces: SelectedSurface[]) => void
  appliedMaterials?: Map<string, { color: number; metalness: number; roughness: number }>
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

function LoadingOverlay() {
  return (
    <Html center style={{ color: '#333', fontSize: 14 }}>
      Loading model…
    </Html>
  )
}

function Scene({
  modelUrl,
  selectedIds,
  onSelect,
  appliedMaterials,
}: {
  modelUrl: string
  selectedIds: Set<string>
  onSelect: (s: SelectedSurface[]) => void
  appliedMaterials?: Map<string, { color: number; metalness: number; roughness: number }>
}) {
  return (
    <>
      {/* Soft, even architectural-viz style lighting */}
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[20, 25, 15]}
        intensity={0.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-15, 20, -10]} intensity={0.35} />
      <directionalLight position={[0, 30, 0]} intensity={0.25} />
      <Environment preset="studio" />
      <Stage
        intensity={0.4}
        environment="studio"
        shadows={{ type: 'contact', opacity: 0.15, blur: 2 }}
        adjustCamera={1.2}
      >
        <BuildingModel
          url={modelUrl}
          selectedIds={selectedIds}
          onSelect={onSelect}
          appliedMaterials={appliedMaterials}
        />
      </Stage>
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

export function Viewer3D({
  modelUrl = DEFAULT_MODEL,
  selectedSurfaces,
  onSelectionChange,
  appliedMaterials,
  onCanvasReady,
}: Viewer3DProps) {
  const selectedIds = useMemo(
    () => new Set(selectedSurfaces.map((s) => s.uuid)),
    [selectedSurfaces]
  )

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
        <Suspense fallback={<LoadingOverlay />}>
          {onCanvasReady && <CanvasRef onReady={onCanvasReady} />}
          <Scene
            modelUrl={modelUrl}
            selectedIds={selectedIds}
            onSelect={onSelectionChange}
            appliedMaterials={appliedMaterials}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
