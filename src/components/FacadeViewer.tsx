import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import { FacadeBuilding, type FacadeSettings } from './FacadeBuilding'
import type { MaterialState } from '../types'

interface FacadeViewerProps {
  settings: FacadeSettings
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
  onPanelsReady?: (panels: { uuid: string; row: number }[]) => void
  /** Background color for canvas (e.g. workspace dark #1A1A1A) */
  canvasBackground?: string
  /** When true, canvas clears with transparency so parent gradient shows through */
  transparentBackground?: boolean
}

function CanvasRef({ onReady }: { onReady: (canvas: HTMLCanvasElement) => void }) {
  const { gl } = useThree()
  useEffect(() => { onReady(gl.domElement) }, [gl, onReady])
  return null
}

function Scene({
  settings,
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
  onPanelsReady,
}: {
  settings: FacadeSettings
  selectionToolEnabled: boolean
  onApplyColor: (uuid: string, currentState: MaterialState) => void
  appliedMaterials?: Map<string, MaterialState>
  onPanelsReady?: (panels: { uuid: string; row: number }[]) => void
}) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[20, 25, 18]}
        intensity={0.65}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-15, 18, -10]} intensity={0.3} />
      <directionalLight position={[0, 30, 5]} intensity={0.2} />
      <Environment preset="city" />
      <FacadeBuilding
        settings={settings}
        selectionToolEnabled={selectionToolEnabled}
        onApplyColor={onApplyColor}
        appliedMaterials={appliedMaterials}
        onPanelsReady={onPanelsReady}
      />
      <OrbitControls
        makeDefault
        target={[0, 7, 0]}
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={10}
        maxDistance={60}
      />
    </>
  )
}

const DEFAULT_BG = '#e8ecf0'

export function FacadeViewer({
  settings,
  selectionToolEnabled,
  onApplyColor,
  appliedMaterials,
  onCanvasReady,
  onPanelsReady,
  canvasBackground = DEFAULT_BG,
  transparentBackground = false,
}: FacadeViewerProps) {
  const bgHex = canvasBackground.startsWith('#') ? parseInt(canvasBackground.slice(1), 16) : 0xe8ecf0
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: transparentBackground ? 'transparent' : canvasBackground,
      }}
    >
      <Canvas
        shadows
        camera={{ position: [22, 12, 22], fov: 45 }}
        gl={{
          antialias: true,
          alpha: transparentBackground,
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.1
          gl.outputColorSpace = THREE.SRGBColorSpace
          if (transparentBackground) {
            gl.setClearColor(0x000000, 0)
          } else {
            gl.setClearColor(bgHex, 1)
          }
        }}
      >
        <Suspense fallback={<Html center><span style={{ color: transparentBackground ? 'rgba(255,255,255,0.6)' : '#333', fontSize: 14 }}>Loading…</span></Html>}>
          {onCanvasReady && <CanvasRef onReady={onCanvasReady} />}
          <Scene
            settings={settings}
            selectionToolEnabled={selectionToolEnabled}
            onApplyColor={onApplyColor}
            appliedMaterials={appliedMaterials}
            onPanelsReady={onPanelsReady}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
