import { useState, useMemo, useRef, useCallback } from 'react'
import { Viewer3D } from './components/Viewer3D'
import { PalettePanel } from './components/PalettePanel'
import { AppHeader } from './components/AppHeader'
import { RendersPanel, type GeneratedRender } from './components/RendersPanel'
import { palettes } from './data/palettes'
import { downloadSnapshot, generateSpecPdf } from './utils/export'
import { enhanceImageWithFal } from './utils/falEnhance'
import { getThemeTokens, type Theme } from './theme'
import type { MaterialState, AlubondColor } from './types'

export type PaintAction = { uuid: string; prev: MaterialState | null; next: MaterialState }

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export default function App() {
  const [selectedColor, setSelectedColor] = useState<AlubondColor | null>(null)
  const [compareMode, setCompareMode] = useState<'single' | 'split'>('single')
  const [comparePaletteId, setComparePaletteId] = useState<string | null>(null)
  const [generatedRenders, setGeneratedRenders] = useState<GeneratedRender[]>([])
  const [isGeneratingRender, setIsGeneratingRender] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')
  const [selectionToolEnabled, setSelectionToolEnabled] = useState(false)
  const [paintState, setPaintState] = useState<{
    colorOverrides: Map<string, MaterialState>
    undoStack: PaintAction[]
    redoStack: PaintAction[]
  }>({ colorOverrides: new Map(), undoStack: [], redoStack: [] })
  const colorOverrides = paintState.colorOverrides
  const undoStack = paintState.undoStack
  const redoStack = paintState.redoStack
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const t = getThemeTokens(theme)

  const handleGenerateRender = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsGeneratingRender(true)
    const colorLabel = selectedColor ? `${selectedColor.name} (${selectedColor.sku})` : undefined
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
          paletteName: aiEnabled ? (colorLabel ?? 'Render') : colorLabel,
        },
        ...prev,
      ])
    } catch (e) {
      console.error('Generate render failed:', e)
    } finally {
      setIsGeneratingRender(false)
    }
  }, [selectedColor, aiEnabled])

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
    const colors = selectedColor
      ? [{ name: selectedColor.name, sku: selectedColor.sku, hex: selectedColor.hex, finish: selectedColor.finish }]
      : []
    const snapshotDataUrl = canvasRef.current?.toDataURL('image/png')
    generateSpecPdf(
      selectedColor?.name ?? 'Alubond facade',
      selectedColor?.collection ?? '—',
      colors,
      colorOverrides.size,
      snapshotDataUrl
    )
  }, [selectedColor, colorOverrides.size])

  const appliedMaterials = useMemo(() => new Map(colorOverrides), [colorOverrides])

  const handleApplyColor = useCallback(
    (uuid: string, currentState: MaterialState) => {
      if (!selectedColor) return
      const next: MaterialState = {
        color: hexToNumber(selectedColor.hex),
        metalness: selectedColor.metalness ?? 0,
        roughness: selectedColor.roughness ?? 0.7,
      }
      const action: PaintAction = { uuid, prev: currentState, next }
      setPaintState((prev) => ({
        colorOverrides: new Map(prev.colorOverrides).set(uuid, next),
        undoStack: [...prev.undoStack, action],
        redoStack: [],
      }))
    },
    [selectedColor]
  )

  const handleUndo = useCallback(() => {
    setPaintState((prev) => {
      if (prev.undoStack.length === 0) return prev
      const action = prev.undoStack[prev.undoStack.length - 1]
      const overrides = new Map(prev.colorOverrides)
      if (action.prev === null) overrides.delete(action.uuid)
      else overrides.set(action.uuid, action.prev)
      return {
        colorOverrides: overrides,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [...prev.redoStack, action],
      }
    })
  }, [])

  const handleRedo = useCallback(() => {
    setPaintState((prev) => {
      if (prev.redoStack.length === 0) return prev
      const action = prev.redoStack[prev.redoStack.length - 1]
      const overrides = new Map(prev.colorOverrides).set(action.uuid, action.next)
      return {
        colorOverrides: overrides,
        undoStack: [...prev.undoStack, action],
        redoStack: prev.redoStack.slice(0, -1),
      }
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppHeader
        theme={theme}
        onThemeToggle={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        selectionToolEnabled={selectionToolEnabled}
        onSelectionToolChange={setSelectionToolEnabled}
        paintedCount={colorOverrides.size}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        onSnapshot={handleSnapshot}
        onExportPdf={handleExportPdf}
      />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <aside
          style={{
            width: 320,
            minWidth: 280,
            background: t.sidebarBg,
            borderRight: `1px solid ${t.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <PalettePanel
            theme={theme}
            palettes={palettes}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            comparePaletteId={comparePaletteId}
            onComparePaletteId={setComparePaletteId}
            compareMode={compareMode}
          />
        </aside>
        <main style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <Viewer3D
          selectionToolEnabled={selectionToolEnabled}
          onApplyColor={handleApplyColor}
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
              <div style={{ flex: 1, borderRight: `2px solid ${t.compareDivider}` }} />
            </div>
          )}
        </main>
        <RendersPanel
          theme={theme}
        renders={generatedRenders}
          onGenerate={handleGenerateRender}
          onDelete={handleDeleteRender}
          onDownload={handleDownloadRender}
          isGenerating={isGeneratingRender}
          aiEnabled={aiEnabled}
          onAiEnabledChange={setAiEnabled}
        />
      </div>
    </div>
  )
}
