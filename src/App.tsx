import { useState, useMemo, useRef, useCallback } from 'react'
import { Viewer3D } from './components/Viewer3D'
import { PalettePanel } from './components/PalettePanel'
import { Toolbar } from './components/Toolbar'
import { RendersPanel, type GeneratedRender } from './components/RendersPanel'
import { palettes } from './data/palettes'
import { downloadSnapshot, generateSpecPdf } from './utils/export'
import { enhanceImageWithFal } from './utils/falEnhance'
import type { SelectedSurface } from './types'

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export default function App() {
  const [selectedSurfaces, setSelectedSurfaces] = useState<SelectedSurface[]>([])
  const [appliedPaletteId, setAppliedPaletteId] = useState<string | null>(null)
  const [appliedRole, setAppliedRole] = useState<'primary' | 'accent' | 'frame' | 'feature'>('primary')
  const [compareMode, setCompareMode] = useState<'single' | 'split'>('single')
  const [comparePaletteId, setComparePaletteId] = useState<string | null>(null)
  const [generatedRenders, setGeneratedRenders] = useState<GeneratedRender[]>([])
  const [isGeneratingRender, setIsGeneratingRender] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [aiEnabled, setAiEnabled] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const generateStartRef = useRef<number>(0)

  const MIN_SKELETON_MS = 1200

  const handleGenerateRender = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setGenerateError(null)
    setIsGeneratingRender(true)
    generateStartRef.current = Date.now()
    const palette = appliedPaletteId ? palettes.find((p) => p.id === appliedPaletteId) : null
    const paletteLabel = palette ? `${palette.name} (${palette.style})` : undefined
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve(canvas.toDataURL('image/png'))
          })
        })
      })
      let finalDataUrl = dataUrl
      if (aiEnabled) {
        finalDataUrl = await enhanceImageWithFal(dataUrl)
      }
      setGeneratedRenders((prev) => [
        {
          id: `render-${Date.now()}`,
          dataUrl: finalDataUrl,
          createdAt: Date.now(),
          paletteName: aiEnabled ? `${paletteLabel ?? 'Render'}` : paletteLabel,
        },
        ...prev,
      ])
    } catch (e) {
      console.error('Generate render failed:', e)
      const message = e instanceof Error ? e.message : 'Generation failed. Try again.'
      setGenerateError(message)
    } finally {
      const elapsed = Date.now() - generateStartRef.current
      const remaining = Math.max(0, MIN_SKELETON_MS - elapsed)
      if (remaining > 0) {
        setTimeout(() => setIsGeneratingRender(false), remaining)
      } else {
        setIsGeneratingRender(false)
      }
    }
  }, [appliedPaletteId, aiEnabled])

  const handleDeleteRender = useCallback((id: string) => {
    setGeneratedRenders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const handleDownloadRender = useCallback((render: GeneratedRender) => {
    downloadSnapshot(render.dataUrl, `alubond-render-${render.id}.png`)
  }, [])

  const handleSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    downloadSnapshot(dataUrl)
  }, [])

  const handleExportPdf = useCallback(() => {
    const palette = appliedPaletteId ? palettes.find((p) => p.id === appliedPaletteId) : null
    const colors = palette
      ? [
          { name: palette.primary.name, sku: palette.primary.sku, hex: palette.primary.hex, finish: palette.primary.finish },
          { name: palette.accent.name, sku: palette.accent.sku, hex: palette.accent.hex, finish: palette.accent.finish },
          { name: palette.frame.name, sku: palette.frame.sku, hex: palette.frame.hex, finish: palette.frame.finish },
          { name: palette.feature.name, sku: palette.feature.sku, hex: palette.feature.hex, finish: palette.feature.finish },
        ]
      : []
    const snapshotDataUrl = canvasRef.current?.toDataURL('image/png')
    generateSpecPdf(
      palette?.name ?? 'No palette',
      palette?.style ?? '—',
      colors,
      selectedSurfaces.length,
      snapshotDataUrl
    )
  }, [appliedPaletteId, selectedSurfaces.length])

  const appliedMaterials = useMemo(() => {
    const map = new Map<string, { color: number; metalness: number; roughness: number }>()
    const palette = appliedPaletteId ? palettes.find((p) => p.id === appliedPaletteId) : null
    if (!palette || selectedSurfaces.length === 0) return map
    const colorDef = palette[appliedRole]
    const color = hexToNumber(colorDef.hex)
    const metalness = colorDef.metalness ?? 0
    const roughness = colorDef.roughness ?? 0.7
    selectedSurfaces.forEach((s) => map.set(s.uuid, { color, metalness, roughness }))
    return map
  }, [appliedPaletteId, appliedRole, selectedSurfaces])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside
        style={{
          width: 320,
          minWidth: 280,
          background: '#ffffff',
          borderRight: '1px solid #1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <header style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>Alubond Color Studio</h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>
            Select surfaces, then apply a palette.
          </p>
        </header>
        <Toolbar
          selectedCount={selectedSurfaces.length}
          compareMode={compareMode}
          onCompareModeChange={setCompareMode}
          onSnapshot={handleSnapshot}
          onExportPdf={handleExportPdf}
        />
        <PalettePanel
          palettes={palettes}
          selectedPaletteId={appliedPaletteId}
          selectedRole={appliedRole}
          onSelectPalette={setAppliedPaletteId}
          onSelectRole={setAppliedRole}
          comparePaletteId={comparePaletteId}
          onComparePaletteId={setComparePaletteId}
          compareMode={compareMode}
        />
      </aside>
      <main style={{ flex: 1, position: 'relative' }}>
        <Viewer3D
          selectedSurfaces={selectedSurfaces}
          onSelectionChange={setSelectedSurfaces}
          appliedMaterials={appliedMaterials}
          onCanvasReady={(el) => { canvasRef.current = el }}
        />
        {compareMode === 'split' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            <div style={{ flex: 1, borderRight: '2px solid #1a1a1a' }} />
          </div>
        )}
      </main>
      <RendersPanel
        renders={generatedRenders}
        onGenerate={handleGenerateRender}
        onDelete={handleDeleteRender}
        onDownload={handleDownloadRender}
        isGenerating={isGeneratingRender}
        generateError={generateError}
        aiEnabled={aiEnabled}
        onAiEnabledChange={setAiEnabled}
      />
    </div>
  )
}
