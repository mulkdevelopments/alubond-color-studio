import { useState, useRef, useCallback, useMemo } from 'react'
import { getThemeTokens, brand, type Theme } from '../theme'
import { PalettePanel } from './PalettePanel'
import { palettes } from '../data/palettes'
import { RendersPanel, type GeneratedRender } from './RendersPanel'
import { downloadSnapshot } from '../utils/export'
import { IFCViewer } from './IFCViewer'
import { enhanceImageWithNanobanana, DEFAULT_PROMPT } from '../utils/nanobananaEnhance'
import type { AlubondColor, MaterialState } from '../types'

interface IFCStudioProps {
  theme: Theme
  onBack: () => void
  onThemeToggle: () => void
}

type PaintAction = { uuid: string; prev: MaterialState | null; next: MaterialState }

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export function IFCStudio({ theme, onBack, onThemeToggle }: IFCStudioProps) {
  const t = getThemeTokens(theme)
  const [selectedColor, setSelectedColor] = useState<AlubondColor | null>(null)
  const [ifcUrl, setIfcUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectionToolEnabled, setSelectionToolEnabled] = useState(false)
  const [generatedRenders, setGeneratedRenders] = useState<GeneratedRender[]>([])
  const [isGeneratingRender, setIsGeneratingRender] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [paintState, setPaintState] = useState<{
    colorOverrides: Map<string, MaterialState>
    undoStack: PaintAction[]
    redoStack: PaintAction[]
  }>({ colorOverrides: new Map(), undoStack: [], redoStack: [] })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const appliedMaterials = useMemo(() => new Map(paintState.colorOverrides), [paintState.colorOverrides])

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'ifc') {
      setError('Please upload an IFC file (.ifc)')
      return
    }
    setError(null)
    const url = URL.createObjectURL(file)
    setIfcUrl(url)
    setPaintState({ colorOverrides: new Map(), undoStack: [], redoStack: [] })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

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

  const handleGenerateRender = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsGeneratingRender(true)
    const colorLabel = selectedColor ? `${selectedColor.name} (${selectedColor.sku})` : undefined
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve(canvas.toDataURL('image/png')))
        })
      })
      if (aiEnabled) {
        const enhancedDataUrl = await enhanceImageWithNanobanana(dataUrl, DEFAULT_PROMPT, {
          aspectRatio: '16:9',
          resolution: '1K',
          outputFormat: 'png',
        })
        setGeneratedRenders((prev) => [
          { id: `render-${Date.now()}`, dataUrl: enhancedDataUrl, createdAt: Date.now(), paletteName: colorLabel ?? 'AI enhanced' },
          ...prev,
        ])
      } else {
        setGeneratedRenders((prev) => [
          { id: `render-${Date.now()}`, dataUrl, createdAt: Date.now(), paletteName: colorLabel },
          ...prev,
        ])
      }
    } catch (e) {
      console.error('Generate render failed:', e)
    } finally {
      setIsGeneratingRender(false)
    }
  }, [selectedColor, aiEnabled])

  const hdrBtn: React.CSSProperties = {
    padding: '7px 12px',
    fontSize: 12,
    fontWeight: 500,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header
        style={{
          flexShrink: 0,
          height: 52,
          padding: '0 16px',
          background: t.headerBg,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button type="button" onClick={onBack} style={{ ...hdrBtn, padding: '6px 10px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <img src="/alubond-logo.png" alt="Alubond" style={{ height: 30, objectFit: 'contain', opacity: 0.9 }} />
        <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.12)' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          IFC Viewer
        </span>
        <div style={{ flex: 1 }} />
        {ifcUrl && (
          <>
            <button
              type="button"
              onClick={() => setSelectionToolEnabled(!selectionToolEnabled)}
              style={{
                ...hdrBtn,
                ...(selectionToolEnabled ? { background: brand.orange, borderColor: brand.orange, color: '#fff' } : {}),
              }}
            >
              Select
            </button>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              {paintState.colorOverrides.size} painted
            </span>
            <button type="button" onClick={handleUndo} disabled={paintState.undoStack.length === 0} style={{ ...hdrBtn, opacity: paintState.undoStack.length === 0 ? 0.35 : 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
            </button>
            <button type="button" onClick={handleRedo} disabled={paintState.redoStack.length === 0} style={{ ...hdrBtn, opacity: paintState.redoStack.length === 0 ? 0.35 : 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
            </button>
          </>
        )}
        <button type="button" onClick={onThemeToggle} style={hdrBtn}>
          {theme === 'light' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /></svg>
          )}
        </button>
      </header>

      {/* Body: left palette | center (viewer) | right renders */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Palette sidebar */}
        {ifcUrl && (
          <aside
            style={{
              width: 280,
              flexShrink: 0,
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
              comparePaletteId={null}
              onComparePaletteId={() => {}}
              compareMode="single"
            />
          </aside>
        )}

        {/* Main area — IFC viewer gets priority; min width so it doesn't shrink */}
        <main
          style={{
            flex: 1,
            minWidth: 420,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: t.canvasBg,
          }}
        >
          {!ifcUrl ? (
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                maxWidth: 600,
                minHeight: 360,
                margin: 32,
                borderRadius: 16,
                border: `2px dashed ${dragActive ? t.primary : t.border}`,
                background: dragActive ? `${t.primary}10` : t.cardBg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="9" y1="15" x2="15" y2="15" />
                <line x1="12" y1="12" x2="12" y2="18" />
              </svg>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: t.text }}>
                Upload an IFC file
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: t.textMuted, textAlign: 'center', maxWidth: 360 }}>
                Drag & drop or click to upload your IFC building model.
                Apply Alubond facade materials to your own design.
              </p>
              {error && (
                <p style={{ margin: 0, fontSize: 13, color: '#f87171' }}>{error}</p>
              )}
              <div
                style={{
                  marginTop: 8,
                  padding: '10px 24px',
                  borderRadius: 10,
                  background: brand.orange,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Choose IFC File
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ifc"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          ) : (
            <IFCViewer
              ifcUrl={ifcUrl}
              selectionToolEnabled={selectionToolEnabled}
              onApplyColor={handleApplyColor}
              appliedMaterials={appliedMaterials}
              onCanvasReady={(el) => { canvasRef.current = el }}
            />
          )}
        </main>

        {/* Renders panel — fixed width so center viewer gets remaining space */}
        {ifcUrl && (
          <aside
            style={{
              width: 280,
              minWidth: 240,
              flex: '0 1 280px',
              maxWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <RendersPanel
              theme={theme}
              renders={generatedRenders}
              onGenerate={handleGenerateRender}
              onDelete={(id) => setGeneratedRenders((prev) => prev.filter((r) => r.id !== id))}
              onDownload={(render) => downloadSnapshot(render.dataUrl, `alubond-ifc-render-${render.id}.png`)}
              isGenerating={isGeneratingRender}
              aiEnabled={aiEnabled}
              onAiEnabledChange={setAiEnabled}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
