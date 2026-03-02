import { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Stage, Html } from '@react-three/drei'
import * as THREE from 'three'
import { BuildingModel } from './BuildingModel'
import type { MaterialState } from '../types'

const DEFAULT_MODEL = '/models/building/building.gltf'

/** Sun position from time of day (0–24). Returns [x, y, z] normalised direction; sun is "at" infinity. */
export function getSunDirectionFromTime(timeOfDay: number): [number, number, number] {
  const t = ((timeOfDay % 24) + 24) % 24
  const hourRad = (t - 6) * (Math.PI / 12)
  const azimuth = hourRad
  const elevation = Math.sin(hourRad) * 0.85
  const r = Math.cos(elevation)
  return [r * Math.sin(azimuth), Math.sin(elevation), r * Math.cos(azimuth)]
}

function CanvasRef({ onReady }: { onReady: (canvas: HTMLCanvasElement) => void }) {
  const { gl } = useThree()
  useEffect(() => {
    onReady(gl.domElement)
  }, [gl, onReady])
  return null
}

interface Viewer3DProps {
  modelUrl?: string
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
  /** R&D: time of day 0–24 for sun position */
  timeOfDay?: number
  /** R&D: drei Environment preset (dawn, sunset, night, studio, warehouse, park, etc.) */
  environmentPreset?: string
}

function LoadingOverlay() {
  return (
    <Html center style={{ color: '#333', fontSize: 14 }}>
      Loading model…
    </Html>
  )
}

const SUN_DISTANCE = 80

function Scene({
  modelUrl,
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
  timeOfDay = 14,
  environmentPreset = 'studio',
}: {
  modelUrl: string
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
  timeOfDay?: number
  environmentPreset?: string
}) {
  const sunDir = useMemo(() => getSunDirectionFromTime(timeOfDay), [timeOfDay])
  const sunPosition: [number, number, number] = [
    sunDir[0] * SUN_DISTANCE,
    sunDir[1] * SUN_DISTANCE,
    sunDir[2] * SUN_DISTANCE,
  ]
  const isNight = timeOfDay < 6 || timeOfDay > 20
  const sunIntensity = isNight ? 0.08 : 0.6 + Math.sin(((timeOfDay - 6) * Math.PI) / 12) * 0.3
  const ambientIntensity = isNight ? 0.2 : 0.5 + (1 - Math.abs(timeOfDay - 12) / 12) * 0.35
  const envPreset = ['dawn', 'sunset', 'night', 'studio', 'warehouse', 'park', 'city', 'apartment', 'forest', 'lobby'].includes(environmentPreset)
    ? environmentPreset
    : 'studio'

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={sunPosition}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      {!isNight && (
        <directionalLight position={[sunDir[0] * 30, sunDir[1] * 30 + 15, sunDir[2] * 30]} intensity={0.25} />
      )}
      <Environment preset={envPreset} />
      <Stage
        intensity={isNight ? 0.2 : 0.5}
        environment={envPreset}
        shadows={{ type: 'contact', opacity: isNight ? 0.05 : 0.15, blur: 2 }}
        adjustCamera={1.2}
      >
        <BuildingModel
          url={modelUrl}
          selectionToolEnabled={selectionToolEnabled}
          onApplyColor={onApplyColor}
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
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
  onCanvasReady,
  timeOfDay = 14,
  environmentPreset = 'studio',
}: Viewer3DProps) {
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
            selectionToolEnabled={selectionToolEnabled}
            onApplyColor={onApplyColor}
            appliedMaterials={appliedMaterials}
            timeOfDay={timeOfDay}
            environmentPreset={environmentPreset}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
