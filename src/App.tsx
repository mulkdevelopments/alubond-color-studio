import { useState, useMemo, useRef, useCallback, useEffect, lazy, Suspense } from 'react'
import { FacadeViewer } from './components/FacadeViewer'
import { FacadeControls } from './components/FacadeControls'
import type { FacadeSettings } from './components/FacadeBuilding'
import { WorkspaceLayout } from './components/WorkspaceLayout'
import { LibraryFilmBottomDock } from './components/LibraryFilmBottomDock'
import { RendersPanel, type GeneratedRender } from './components/RendersPanel'
import { LandingPage, type AppMode } from './components/LandingPage'
import { palettes, getFinishLabel, getColoursByStyle } from './data/palettes'
import { ImageStudioCenter } from './components/ImageStudioCenter'
import { IfcLeftColumn } from './components/workspace/IfcLeftColumn'
import { ImageLeftColumn } from './components/workspace/ImageLeftColumn'
import {
  ImageStudioGenerateDialog,
  type ImageStudioGenerateUiOptions,
} from './components/ImageStudioGenerateDialog'
import {
  buildFacadePrompt,
  buildFacadePromptMinimal,
  buildFacadeReferenceImageSuffix,
} from './utils/imageFacadePrompt'
import { buildPaletteReferenceDataUrls } from './utils/paletteReferenceImages'
import { downloadSnapshot, generateSpecPdf } from './utils/export'

const IFCViewerLazy = lazy(() => import('./components/IFCViewer').then((m) => ({ default: m.IFCViewer })))
import { getFusionTextureCycle, stripeFromMeshUuid } from './utils/fusionPanelCycle'
import { orderMeshesForIfcFacade, type IfcMeshMeta } from './utils/ifcMeshOrdering'
import { materialOverridesForSlots, type PanelMaterialSlot } from './utils/panelMaterialBulkApply'
import { materialPropsForFolder } from './services/fusionSuggestions'
import { enhanceImageWithNanobanana, DEFAULT_PROMPT, type NanobananaGenerateOptions } from './utils/nanobananaEnhance'
import { brand, workspace, type Theme } from './theme'
import type { MaterialState, AlubondColor, PaletteStyle } from './types'

function isSameWorkspaceColor(a: AlubondColor | null, b: AlubondColor | null): boolean {
  if (!a || !b) return a === b
  return a.sku === b.sku
}

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
  void theme
  const panel = {
    bg: '#000000',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#f0f0f0',
    muted: 'rgba(255, 255, 255, 0.58)',
    fieldBg: '#141414',
    fieldBorder: 'rgba(255, 255, 255, 0.12)',
    cancelBg: '#1a1a1a',
  }
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

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: panel.text, marginBottom: 6 }
  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 14,
    background: panel.fieldBg,
    border: `1px solid ${panel.fieldBorder}`,
    borderRadius: 8,
    color: panel.text,
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
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: panel.bg,
          borderRadius: 16,
          border: `1px solid ${panel.border}`,
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${panel.border}` }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: panel.text }}>AI generate options</h3>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: panel.muted }}>
            Adjust settings or use defaults. Custom prompt overrides the default.
          </p>
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
            <label htmlFor="google-search" style={{ fontSize: 13, color: panel.text }}>
              Use Google search grounding
            </label>
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
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${panel.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              background: panel.cancelBg,
              border: `1px solid ${panel.fieldBorder}`,
              borderRadius: 8,
              color: panel.text,
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
              background: brand.orange,
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: '0.01em',
            }}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}

/** Header dropdown in workspace: switch app mode (no GLB model picker). */
const STUDIO_HEADER_MODES: { id: AppMode; name: string }[] = [
  { id: 'studio', name: 'Facade Maker' },
  { id: 'image', name: 'Image Studio' },
  { id: 'ifc', name: 'IFC Studio' },
]

const DEFAULT_FACADE_SETTINGS: FacadeSettings = {
  columns: 7,
  rows: 5,
  style: 'landscape',
  typology: 'square',
  typologyParam: 3,
  transform: 'flat',
  tiltAngle: 15,
}

export type PaintAction = { uuid: string; prev: MaterialState | null; next: MaterialState }

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('landing')
  const [selectedColor, setSelectedColor] = useState<AlubondColor | null>(null)
  const [compareMode, setCompareMode] = useState<'single' | 'split'>('single')
  const [libraryTab, setLibraryTab] = useState<PaletteStyle>('Modern')
  const [generatedRenders, setGeneratedRenders] = useState<GeneratedRender[]>([])
  const [isGeneratingRender, setIsGeneratingRender] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [, setTheme] = useState<Theme>('light')
  const [facadeSettings, setFacadeSettings] = useState<FacadeSettings>(DEFAULT_FACADE_SETTINGS)
  const facadePanelsRef = useRef<{ uuid: string; row: number; stripeIndex: number }[]>([])
  const selectedColorRef = useRef<AlubondColor | null>(null)
  selectedColorRef.current = selectedColor
  const selectionToolEnabled = false
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showImageGenerateDialog, setShowImageGenerateDialog] = useState(false)
  const [facadePaintState, setFacadePaintState] = useState<{
    colorOverrides: Map<string, MaterialState>
    undoStack: PaintAction[]
    redoStack: PaintAction[]
  }>({ colorOverrides: new Map(), undoStack: [], redoStack: [] })
  const [ifcPaintState, setIfcPaintState] = useState<{
    colorOverrides: Map<string, MaterialState>
    undoStack: PaintAction[]
    redoStack: PaintAction[]
  }>({ colorOverrides: new Map(), undoStack: [], redoStack: [] })

  const colorOverrides = facadePaintState.colorOverrides
  const undoStack = facadePaintState.undoStack
  const redoStack = facadePaintState.redoStack
  const ifcUndoStack = ifcPaintState.undoStack
  const ifcRedoStack = ifcPaintState.redoStack

  const [ifcUrl, setIfcUrl] = useState<string | null>(null)
  const [ifcError, setIfcError] = useState<string | null>(null)
  const [ifcDragActive, setIfcDragActive] = useState(false)
  const [ifcSelectionTool, setIfcSelectionTool] = useState(false)
  const [ifcMeshCount, setIfcMeshCount] = useState(0)
  const ifcOrderedPanelsRef = useRef<PanelMaterialSlot[]>([])

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageDragActive, setImageDragActive] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const coloursByWorkspaceStyle = useMemo(() => getColoursByStyle(palettes), [])
  const workspaceFilmColours = coloursByWorkspaceStyle[libraryTab] ?? []

  const handleGenerateRender = useCallback(async () => {
    if (appMode === 'image') return
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
  }, [appMode, selectedColor, aiEnabled])

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
    if (appMode === 'image') return
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    downloadSnapshot(dataUrl)
  }, [appMode])

  const handleExportPdf = useCallback(() => {
    if (appMode !== 'studio') return
    const colors = selectedColor
      ? [{ name: selectedColor.name, sku: selectedColor.sku, hex: selectedColor.hex, finish: getFinishLabel(selectedColor) }]
      : []
    const snapshotDataUrl = canvasRef.current?.toDataURL('image/png')
    generateSpecPdf(
      selectedColor?.name ?? 'Alubond facade',
      selectedColor?.collection ?? '—',
      colors,
      colorOverrides.size,
      snapshotDataUrl
    )
  }, [appMode, selectedColor, colorOverrides.size])

  const appliedMaterials = useMemo(() => new Map(colorOverrides), [colorOverrides])
  const ifcAppliedMaterials = useMemo(() => new Map(ifcPaintState.colorOverrides), [ifcPaintState.colorOverrides])

  const handleStudioHeaderMode = useCallback((id: string) => {
    setAppMode(id as AppMode)
  }, [])

  const handleApplyColor = useCallback(
    (uuid: string, currentState: MaterialState) => {
      if (!selectedColor) return
      const cycle = getFusionTextureCycle(selectedColor)
      if (cycle && cycle.length >= 2) {
        const panel = facadePanelsRef.current.find((p) => p.uuid === uuid)
        const stripe = panel?.stripeIndex ?? panel?.row ?? 0
        const ref = cycle[stripe % cycle.length]
        const mp = materialPropsForFolder(ref.folder)
        const next: MaterialState = {
          color: hexToNumber(selectedColor.hex),
          metalness: mp.metalness,
          roughness: mp.roughness,
          finish: selectedColor.finish,
          panelTexture: ref,
        }
        const action: PaintAction = { uuid, prev: currentState, next }
        setFacadePaintState((prev) => ({
          colorOverrides: new Map(prev.colorOverrides).set(uuid, next),
          undoStack: [...prev.undoStack, action],
          redoStack: [],
        }))
        return
      }
      const next: MaterialState = {
        color: hexToNumber(selectedColor.hex),
        metalness: selectedColor.metalness ?? 0,
        roughness: selectedColor.roughness ?? 0.7,
        finish: selectedColor.finish,
        ...(selectedColor.panelTexture ? { panelTexture: selectedColor.panelTexture } : {}),
      }
      const action: PaintAction = { uuid, prev: currentState, next }
      setFacadePaintState((prev) => ({
        colorOverrides: new Map(prev.colorOverrides).set(uuid, next),
        undoStack: [...prev.undoStack, action],
        redoStack: [],
      }))
    },
    [selectedColor]
  )

  const applyColorToPanels = useCallback((panels: PanelMaterialSlot[], color: AlubondColor) => {
    const bulk = materialOverridesForSlots(panels, color)
    setFacadePaintState((prev) => {
      const overrides = new Map(prev.colorOverrides)
      for (const [uuid, state] of bulk) overrides.set(uuid, state)
      return { colorOverrides: overrides, undoStack: prev.undoStack, redoStack: [] }
    })
  }, [])

  const handleApplyAllPanels = useCallback(() => {
    if (!selectedColor) return
    applyColorToPanels(facadePanelsRef.current, selectedColor)
  }, [selectedColor, applyColorToPanels])

  /** Stable callback so FacadeBuilding’s panel effect doesn’t re-run on every colour change (avoids races with texture apply). */
  const handlePanelsReady = useCallback(
    (panels: { uuid: string; row: number; stripeIndex: number }[]) => {
      facadePanelsRef.current = panels
      const c = selectedColorRef.current
      if (c) applyColorToPanels(panels, c)
    },
    [applyColorToPanels]
  )

  // When user picks a colour in Facade Maker, apply to all panels
  useEffect(() => {
    if (appMode !== 'studio' || !selectedColor) return
    handleApplyAllPanels()
  }, [appMode, selectedColor, handleApplyAllPanels])

  useEffect(() => {
    return () => {
      if (ifcUrl?.startsWith('blob:')) URL.revokeObjectURL(ifcUrl)
    }
  }, [ifcUrl])

  const handleIfcFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'ifc') {
      setIfcError('Please upload an IFC file (.ifc)')
      return
    }
    setIfcError(null)
    setIfcUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setIfcPaintState({ colorOverrides: new Map(), undoStack: [], redoStack: [] })
    ifcOrderedPanelsRef.current = []
    setIfcMeshCount(0)
  }, [])

  const handleIfcMeshesReady = useCallback((metas: IfcMeshMeta[]) => {
    ifcOrderedPanelsRef.current = orderMeshesForIfcFacade(metas)
    setIfcMeshCount(metas.length)
  }, [])

  const handleIfcApplyAll = useCallback(() => {
    if (!selectedColor) return
    const panels = ifcOrderedPanelsRef.current
    if (panels.length === 0) return
    const bulk = materialOverridesForSlots(panels, selectedColor)
    setIfcPaintState((prev) => {
      const overrides = new Map(prev.colorOverrides)
      for (const [uuid, state] of bulk) overrides.set(uuid, state)
      return { colorOverrides: overrides, undoStack: prev.undoStack, redoStack: [] }
    })
  }, [selectedColor])

  const handleIfcApplyColor = useCallback(
    (uuid: string, currentState: MaterialState) => {
      if (!selectedColor) return
      const slot = ifcOrderedPanelsRef.current.find((p) => p.uuid === uuid)
      const cycle = getFusionTextureCycle(selectedColor)
      if (cycle && cycle.length >= 2) {
        const stripeIndex = slot
          ? slot.stripeIndex
          : stripeFromMeshUuid(uuid, cycle.length)
        const ref = cycle[stripeIndex % cycle.length]
        const mp = materialPropsForFolder(ref.folder)
        const next: MaterialState = {
          color: hexToNumber(selectedColor.hex),
          metalness: mp.metalness,
          roughness: mp.roughness,
          finish: selectedColor.finish,
          panelTexture: ref,
        }
        const action: PaintAction = { uuid, prev: currentState, next }
        setIfcPaintState((prev) => ({
          colorOverrides: new Map(prev.colorOverrides).set(uuid, next),
          undoStack: [...prev.undoStack, action],
          redoStack: [],
        }))
        return
      }
      const isFusionTwo =
        selectedColor.finish === 'fusion' &&
        (selectedColor.hexSecondary != null || selectedColor.panelTextureSecondary != null)
      const stateA: MaterialState = {
        color: hexToNumber(selectedColor.hex),
        metalness: selectedColor.metalness ?? 0,
        roughness: selectedColor.roughness ?? 0.7,
        finish: selectedColor.finish,
        ...(selectedColor.panelTexture ? { panelTexture: selectedColor.panelTexture } : {}),
      }
      const stateB: MaterialState = isFusionTwo
        ? {
            color: hexToNumber(selectedColor.hexSecondary ?? selectedColor.hex),
            metalness: selectedColor.metalnessSecondary ?? selectedColor.metalness ?? 0,
            roughness: selectedColor.roughnessSecondary ?? selectedColor.roughness ?? 0.7,
            finish: selectedColor.finish,
            ...(selectedColor.panelTextureSecondary
              ? { panelTexture: selectedColor.panelTextureSecondary }
              : {}),
          }
        : stateA
      const useB =
        isFusionTwo &&
        (slot ? slot.row % 2 === 1 : stripeFromMeshUuid(uuid, 2) === 1)
      const next = useB ? stateB : stateA
      const action: PaintAction = { uuid, prev: currentState, next }
      setIfcPaintState((prev) => ({
        colorOverrides: new Map(prev.colorOverrides).set(uuid, next),
        undoStack: [...prev.undoStack, action],
        redoStack: [],
      }))
    },
    [selectedColor]
  )

  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    setImageError(null)
    setResultImage(null)
    const reader = new FileReader()
    reader.onload = () => setUploadedImage(reader.result as string)
    reader.onerror = () => setImageError('Failed to read file')
    reader.readAsDataURL(file)
  }, [])

  const handleOpenImageStudioGenerate = useCallback(() => {
    if (!uploadedImage || !selectedColor) return
    setShowImageGenerateDialog(true)
  }, [uploadedImage, selectedColor])

  const handleConfirmImageStudioGenerate = useCallback(
    async (ui: ImageStudioGenerateUiOptions) => {
      setShowImageGenerateDialog(false)
      if (!uploadedImage || !selectedColor) return
      setImageProcessing(true)
      setImageError(null)
      try {
        const paletteReferenceDataUrls = await buildPaletteReferenceDataUrls(selectedColor)
        const refSuffix = buildFacadeReferenceImageSuffix(paletteReferenceDataUrls.length > 0)
        let prompt = buildFacadePrompt(selectedColor) + refSuffix
        if (ui.customPrompt.trim()) {
          prompt += ` Additional creative direction: ${ui.customPrompt.trim()}`
        }
        const nanoOpts: NanobananaGenerateOptions = {
          aspectRatio: ui.aspectRatio,
          resolution: ui.resolution,
          outputFormat: ui.outputFormat,
          googleSearch: ui.googleSearch,
          maxSendDimension: 896,
          imageStudioMode: true,
          maxPaletteReferences: 8,
          paletteReferenceDataUrls,
        }
        const run = (p: string) => enhanceImageWithNanobanana(uploadedImage, p, nanoOpts)
        const extra = ui.customPrompt.trim()
          ? ` Additional creative direction: ${ui.customPrompt.trim()}`
          : ''
        try {
          setResultImage(await run(prompt))
        } catch (e) {
          const msg = e instanceof Error ? e.message : ''
          if (
            /server exception|try again later|contact customer service|404|no taskId|no image URL|Result image|Timed out/i.test(
              msg
            )
          ) {
            setResultImage(await run(buildFacadePromptMinimal(selectedColor) + refSuffix + extra))
          } else {
            throw e
          }
        }
      } catch (e) {
        setImageError(e instanceof Error ? e.message : 'Failed to apply facade')
      } finally {
        setImageProcessing(false)
      }
    },
    [uploadedImage, selectedColor]
  )

  const handleDownloadImageResult = useCallback(async () => {
    if (!resultImage) return
    const name = `alubond-facade-${Date.now()}`
    try {
      if (resultImage.startsWith('http://') || resultImage.startsWith('https://')) {
        const r = await fetch(resultImage)
        if (!r.ok) throw new Error(`Download failed (${r.status})`)
        const blob = await r.blob()
        const ext = blob.type.includes('jpeg') ? 'jpg' : 'png'
        const href = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = href
        a.download = `${name}.${ext}`
        a.click()
        URL.revokeObjectURL(href)
        return
      }
      const a = document.createElement('a')
      a.href = resultImage
      a.download = `${name}.png`
      a.click()
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'Download failed')
    }
  }, [resultImage])

  const handleClearImage = useCallback(() => {
    setUploadedImage(null)
    setResultImage(null)
    setImageError(null)
  }, [])

  const handleUndo = useCallback(() => {
    if (appMode === 'image') return
    if (appMode === 'ifc') {
      setIfcPaintState((prev) => {
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
    } else {
      setFacadePaintState((prev) => {
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
    }
  }, [appMode])

  const handleRedo = useCallback(() => {
    if (appMode === 'image') return
    if (appMode === 'ifc') {
      setIfcPaintState((prev) => {
        if (prev.redoStack.length === 0) return prev
        const action = prev.redoStack[prev.redoStack.length - 1]
        const overrides = new Map(prev.colorOverrides).set(action.uuid, action.next)
        return {
          colorOverrides: overrides,
          undoStack: [...prev.undoStack, action],
          redoStack: prev.redoStack.slice(0, -1),
        }
      })
    } else {
      setFacadePaintState((prev) => {
        if (prev.redoStack.length === 0) return prev
        const action = prev.redoStack[prev.redoStack.length - 1]
        const overrides = new Map(prev.colorOverrides).set(action.uuid, action.next)
        return {
          colorOverrides: overrides,
          undoStack: [...prev.undoStack, action],
          redoStack: prev.redoStack.slice(0, -1),
        }
      })
    }
  }, [appMode])

  if (appMode === 'landing') {
    return <LandingPage onSelectMode={setAppMode} />
  }

  const workspaceTheme: Theme = 'workspace'
  const isStudio = appMode === 'studio'
  const isIfc = appMode === 'ifc'
  const isImage = appMode === 'image'

  const toolbarPreset = isStudio ? 'facade' : isIfc ? 'ifc' : 'image'
  const canUndoActive = isImage ? false : isIfc ? ifcUndoStack.length > 0 : undoStack.length > 0
  const canRedoActive = isImage ? false : isIfc ? ifcRedoStack.length > 0 : redoStack.length > 0
  const paintedCountActive = isImage ? 0 : isIfc ? ifcPaintState.colorOverrides.size : colorOverrides.size

  const statusLine =
    isImage
      ? 'Image · colours from film strip'
      : isIfc && !ifcUrl
        ? 'No IFC loaded'
        : undefined

  const leftColumn =
    isIfc ? (
      <IfcLeftColumn
        theme={workspaceTheme}
        ifcUrl={ifcUrl}
        error={ifcError}
        dragActive={ifcDragActive}
        onDragActive={setIfcDragActive}
        onFile={handleIfcFile}
        selectionToolEnabled={ifcSelectionTool}
        onToggleSelection={() => setIfcSelectionTool((v) => !v)}
        meshCount={ifcMeshCount}
        selectedColor={selectedColor}
        onApplyAllSurfaces={handleIfcApplyAll}
      />
    ) : isImage ? (
      <ImageLeftColumn
        theme={workspaceTheme}
        uploadedImage={uploadedImage}
        canGenerate={!!uploadedImage && !!selectedColor}
        hasResult={!!resultImage}
        selectedColor={selectedColor}
        isProcessing={imageProcessing}
        error={imageError}
        dragActive={imageDragActive}
        onDragActive={setImageDragActive}
        onFile={handleImageFile}
        onApplyFacade={handleOpenImageStudioGenerate}
        onDownload={handleDownloadImageResult}
        onClear={handleClearImage}
      />
    ) : null

  return (
    <>
    <WorkspaceLayout
      studioModeOptions={STUDIO_HEADER_MODES}
      activeStudioModeId={appMode}
      onStudioModeChange={handleStudioHeaderMode}
      onBack={() => setAppMode('landing')}
      onThemeToggle={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      leftPanel={leftColumn}
      facadePanel={
        isStudio ? (
          <FacadeControls
            theme={workspaceTheme}
            settings={facadeSettings}
            onChange={setFacadeSettings}
            selectedColor={selectedColor}
            onApplyAll={handleApplyAllPanels}
            layout="vertical"
          />
        ) : undefined
      }
      showFacadeTab={isStudio}
      showRightPanel={isStudio || (isIfc && !!ifcUrl)}
      toolbarPreset={toolbarPreset}
      statusLine={statusLine}
      rightPanel={
        <RendersPanel
          theme={workspaceTheme}
          renders={generatedRenders}
          onGenerate={handleGenerateRender}
          onDelete={handleDeleteRender}
          onDownload={handleDownloadRender}
          isGenerating={isGeneratingRender}
          aiEnabled={aiEnabled}
          onAiEnabledChange={setAiEnabled}
        />
      }
      canUndo={canUndoActive}
      canRedo={canRedoActive}
      onUndo={handleUndo}
      onRedo={handleRedo}
      compareMode={compareMode}
      onCompareModeChange={setCompareMode}
      onSnapshot={handleSnapshot}
      onExportPdf={handleExportPdf}
      paintedCount={paintedCountActive}
      bottomFilmDock={
        <LibraryFilmBottomDock
          theme={workspaceTheme}
          libraryTab={libraryTab}
          onLibraryTabChange={setLibraryTab}
          colours={workspaceFilmColours}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
          isSameColor={isSameWorkspaceColor}
        />
      }
    >
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {isStudio ? (
          <>
            <FacadeViewer
              key="facademaker"
              settings={facadeSettings}
              selectionToolEnabled={selectionToolEnabled}
              onApplyColor={handleApplyColor}
              appliedMaterials={appliedMaterials}
              onCanvasReady={(el) => { canvasRef.current = el }}
              onPanelsReady={handlePanelsReady}
              canvasBackground={workspace.canvas}
              transparentBackground
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
                <div style={{ flex: 1, borderRight: '2px solid rgba(255,255,255,0.1)' }} />
              </div>
            )}
          </>
        ) : isIfc ? (
          ifcUrl ? (
            <Suspense
              fallback={
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                  Loading IFC viewer…
                </div>
              }
            >
              <IFCViewerLazy
                ifcUrl={ifcUrl}
                selectionToolEnabled={ifcSelectionTool}
                onApplyColor={handleIfcApplyColor}
                appliedMaterials={ifcAppliedMaterials}
                onCanvasReady={(el) => { canvasRef.current = el }}
                onMeshesReady={handleIfcMeshesReady}
              />
            </Suspense>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
                color: 'rgba(255,255,255,0.45)',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              Load an IFC file from the left panel to preview your model here.
            </div>
          )
        ) : (
          <ImageStudioCenter
            theme={workspaceTheme}
            uploadedImage={uploadedImage}
            resultImage={resultImage}
            isProcessing={imageProcessing}
            selectedColor={selectedColor}
          />
        )}
      </div>
    </WorkspaceLayout>
    {showGenerateDialog && (
      <GenerateOptionsDialog
        theme={workspaceTheme}
        onClose={() => setShowGenerateDialog(false)}
        onGenerate={handleConfirmAiGenerate}
      />
    )}
    {showImageGenerateDialog && uploadedImage && selectedColor && (
      <ImageStudioGenerateDialog
        theme={workspaceTheme}
        uploadedImage={uploadedImage}
        selectedColor={selectedColor}
        onClose={() => setShowImageGenerateDialog(false)}
        onConfirm={handleConfirmImageStudioGenerate}
      />
    )}
  </>
  )
}
