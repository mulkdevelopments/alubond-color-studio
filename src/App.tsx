import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Viewer3D } from './components/Viewer3D'
import { PalettePanel } from './components/PalettePanel'
import { AppHeader } from './components/AppHeader'
import { RendersPanel, type GeneratedRender } from './components/RendersPanel'
import { palettes } from './data/palettes'
import { downloadSnapshot, generateSpecPdf } from './utils/export'
import { enhanceImageWithNanobanana, DEFAULT_PROMPT, type NanobananaGenerateOptions } from './utils/nanobananaEnhance'
import { getThemeTokens, type Theme } from './theme'
import type { MaterialState, AlubondColor } from './types'

const ASPECT_RATIOS = ['1:1', '1:4', '1:8', '2:3', '3:2', '3:4', '4:1', '4:3', '4:5', '5:4', '8:1', '9:16', '16:9', '21:9', 'auto'] as const
const RESOLUTIONS = ['1K', '2K', '4K'] as const
const OUTPUT_FORMATS = ['png', 'jpg'] as const

function GenerateOptionsDialog({
  theme,
  onClose,
  onGenerate,
}: {
  theme: Theme
  onClose: () => void
  onGenerate: (options: NanobananaGenerateOptions, customPrompt: string) => void
}) {
  const t = getThemeTokens(theme)
  const [aspectRatio, setAspectRatio] = useState<string>('16:9')
  const [resolution, setResolution] = useState<string>('1K')
  const [outputFormat, setOutputFormat] = useState<string>('png')
  const [googleSearch, setGoogleSearch] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = () => {
    onGenerate(
      { aspectRatio, resolution, outputFormat, googleSearch },
      customPrompt
    )
  }

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 6 }
  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 14,
    background: t.cardBg,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    color: t.text,
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI generate options"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: t.sidebarBg,
          borderRadius: 16,
          border: `1px solid ${t.border}`,
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}` }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: t.text }}>AI generate options</h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: t.textMuted }}>Adjust settings or use defaults. Custom prompt overrides the default.</p>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Aspect ratio</label>
            <select style={inputStyle} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
              {ASPECT_RATIOS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Resolution</label>
            <select style={inputStyle} value={resolution} onChange={(e) => setResolution(e.target.value)}>
              {RESOLUTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Output format</label>
            <select style={inputStyle} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              {OUTPUT_FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="google-search"
              checked={googleSearch}
              onChange={(e) => setGoogleSearch(e.target.checked)}
            />
            <label htmlFor="google-search" style={{ fontSize: 13, color: t.text }}>Use Google search grounding</label>
          </div>
          <div>
            <label style={labelStyle}>Custom prompt (optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Leave empty to use default. Overrides the default when set."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              background: t.buttonBg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              color: t.text,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              background: t.primary,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}

export const SCENE_MODELS = [
  { id: 'building', name: 'Building', url: '/models/building/building.gltf' },
  { id: 'zaha_hadid', name: 'Zaha Hadid', url: '/models/zaha_hadid/zaha_hadid.glb' },
] as const

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
  const [selectedModelId, setSelectedModelId] = useState<string>(SCENE_MODELS[0].id)
  const [selectionToolEnabled, setSelectionToolEnabled] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState(14)
  const [environmentPreset, setEnvironmentPreset] = useState('studio')
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
    if (aiEnabled) {
      setShowGenerateDialog(true)
      return
    }
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
      setGeneratedRenders((prev) => [
        {
          id: `render-${Date.now()}`,
          dataUrl,
          createdAt: Date.now(),
          paletteName: colorLabel,
        },
        ...prev,
      ])
    } catch (e) {
      console.error('Generate render failed:', e)
    } finally {
      setIsGeneratingRender(false)
    }
  }, [selectedColor, aiEnabled])

  const handleConfirmAiGenerate = useCallback(
    async (options: NanobananaGenerateOptions, customPrompt: string) => {
      setShowGenerateDialog(false)
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
        const prompt = customPrompt.trim() ? customPrompt.trim() : DEFAULT_PROMPT
        const finalDataUrl = await enhanceImageWithNanobanana(dataUrl, prompt, options)
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
    },
    [selectedColor, aiEnabled]
  )

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
  const selectedModel = SCENE_MODELS.find((m) => m.id === selectedModelId) ?? SCENE_MODELS[0]

  const handleModelChange = useCallback((id: string) => {
    setSelectedModelId(id)
    setPaintState({ colorOverrides: new Map(), undoStack: [], redoStack: [] })
  }, [])

  const handleApplyColor = useCallback(
    (uuid: string, currentState: MaterialState) => {
      if (!selectedColor) return
      const next: MaterialState = {
        color: hexToNumber(selectedColor.hex),
        metalness: selectedColor.metalness ?? 0,
        roughness: selectedColor.roughness ?? 0.7,
        finish: selectedColor.finish,
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
        <main style={{ flex: 1, position: 'relative', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              gap: 0,
              padding: '8px 12px',
              borderBottom: `1px solid ${t.border}`,
              background: t.sidebarBg,
            }}
          >
            {SCENE_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModelChange(m.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 500,
                  background: selectedModelId === m.id ? t.buttonBg : 'transparent',
                  border: `1px solid ${selectedModelId === m.id ? t.border : 'transparent'}`,
                  borderBottom: selectedModelId === m.id ? `1px solid ${t.buttonBg}` : 'none',
                  borderRadius: 6,
                  marginBottom: selectedModelId === m.id ? -1 : 0,
                  color: selectedModelId === m.id ? t.text : t.textMuted,
                  cursor: 'pointer',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Viewer3D
              key={selectedModelId}
              modelUrl={selectedModel.url}
              selectionToolEnabled={selectionToolEnabled}
              onApplyColor={handleApplyColor}
              appliedMaterials={appliedMaterials}
              onCanvasReady={(el) => { canvasRef.current = el }}
              timeOfDay={timeOfDay}
              environmentPreset={environmentPreset}
            />
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 10,
                background: t.sidebarBg,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: '10px 14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                minWidth: 200,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, marginBottom: 8, letterSpacing: '0.04em' }}>
                R&D — LIGHTING LAB
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, color: t.textMuted, marginBottom: 4 }}>
                  Time of day {timeOfDay.toFixed(1)}h
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={0.5}
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(Number(e.target.value))}
                  style={{ width: '100%', accentColor: t.primary }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: t.textMuted, marginBottom: 4 }}>Environment</label>
                <select
                  value={environmentPreset}
                  onChange={(e) => setEnvironmentPreset(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: 12,
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: 6,
                    color: t.text,
                  }}
                >
                  <option value="studio">Studio</option>
                  <option value="dawn">Dawn</option>
                  <option value="sunset">Sunset</option>
                  <option value="park">Park (day)</option>
                  <option value="city">City</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="night">Night</option>
                  <option value="forest">Forest</option>
                  <option value="apartment">Apartment</option>
                  <option value="lobby">Lobby</option>
                </select>
              </div>
            </div>
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
          </div>
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
      {showGenerateDialog && (
        <GenerateOptionsDialog
          theme={theme}
          onClose={() => setShowGenerateDialog(false)}
          onGenerate={handleConfirmAiGenerate}
        />
      )}
    </div>
  )
}
