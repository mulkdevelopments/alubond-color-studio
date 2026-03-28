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
  buildFacadePromptMulti,
  buildFacadePromptMinimalMulti,
  buildFacadeReferenceImageSuffix,
} from './utils/imageFacadePrompt'
import { captureWorkspacePreviewToDataUrl } from './utils/captureWorkspacePreview'
import { anyColorUsesPanelTextureRefs, buildPaletteReferenceDataUrlsMulti } from './utils/paletteReferenceImages'
import { downloadSnapshot, generateSpecPdf } from './utils/export'

const IFCViewerLazy = lazy(() => import('./components/IFCViewer').then((m) => ({ default: m.IFCViewer })))
import { stripeFromMeshUuid } from './utils/fusionPanelCycle'
import { orderMeshesForIfcFacade, type IfcMeshMeta } from './utils/ifcMeshOrdering'
import {
  materialOverridesForSlotsMulti,
  materialStateForPanelSlot,
  paletteColorIndexForSlot,
  type PanelMaterialSlot,
} from './utils/panelMaterialBulkApply'
import { enhanceImageWithNanobanana, DEFAULT_PROMPT, type NanobananaGenerateOptions } from './utils/nanobananaEnhance'
import { brand, workspace, getStudioModalChrome, type Theme, type WorkspaceAppearance } from './theme'
import type { MaterialState, AlubondColor, PaletteStyle } from './types'

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
  const panel = getStudioModalChrome(theme)
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
        background: panel.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: panel.panelBg,
          borderRadius: 16,
          border: `1px solid ${panel.panelBorder}`,
          maxWidth: 440,
          width: '100%',
          boxShadow: panel.panelShadow,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${panel.panelBorder}` }}>
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
            borderTop: `1px solid ${panel.panelBorder}`,
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
  paletteLayout: 'linear',
  tiltAngle: 15,
  leftEndThickness: 0,
  rightEndThickness: 0,
  bottomEndThickness: 0,
  topEndThickness: 0,
}

export type PaintAction = { uuid: string; prev: MaterialState | null; next: MaterialState }

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('landing')
  const [selectedColors, setSelectedColors] = useState<AlubondColor[]>([])
  const [compareMode, setCompareMode] = useState<'single' | 'split'>('single')
  const [libraryTab, setLibraryTab] = useState<PaletteStyle>('Modern')
  const [generatedRenders, setGeneratedRenders] = useState<GeneratedRender[]>([])
  const [isGeneratingRender, setIsGeneratingRender] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [workspaceAppearance, setWorkspaceAppearance] = useState<WorkspaceAppearance>('dark')
  const [facadeSettings, setFacadeSettings] = useState<FacadeSettings>(DEFAULT_FACADE_SETTINGS)
  const facadePanelsRef = useRef<PanelMaterialSlot[]>([])
  const selectedColorsRef = useRef<AlubondColor[]>([])
  selectedColorsRef.current = selectedColors

  const primaryColor = selectedColors[0] ?? null

  const selectionToolEnabled = false
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showImageGenerateDialog, setShowImageGenerateDialog] = useState(false)
  const imageStudioPreviewRef = useRef<HTMLDivElement>(null)
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

  const removePaletteColorBySku = useCallback((sku: string) => {
    setSelectedColors((prev) => prev.filter((c) => c.sku !== sku))
  }, [])

  const togglePaletteColor = useCallback(
    (c: AlubondColor) => {
      setSelectedColors((prev) => {
        if (appMode === 'ifc' && ifcSelectionTool) {
          const i = prev.findIndex((x) => x.sku === c.sku)
          if (i >= 0) return []
          return [c]
        }
        const j = prev.findIndex((x) => x.sku === c.sku)
        if (j >= 0) return prev.filter((_, k) => k !== j)
        return [...prev, c]
      })
    },
    [appMode, ifcSelectionTool]
  )

  /** IFC click-to-paint: one library finish at a time. Trim when turning selection on. */
  useEffect(() => {
    if (appMode !== 'ifc' || !ifcSelectionTool) return
    setSelectedColors((prev) => (prev.length > 1 ? [prev[0]] : prev))
  }, [appMode, ifcSelectionTool])

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
    const colorLabel =
      selectedColors.length === 0
        ? undefined
        : selectedColors.length === 1
          ? `${selectedColors[0].name} (${selectedColors[0].sku})`
          : selectedColors.map((c) => c.sku).join(', ')
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
  }, [appMode, selectedColors, aiEnabled])

  const handleConfirmAiGenerate = useCallback(
    async (options: NanobananaGenerateOptions, customPrompt: string) => {
      setShowGenerateDialog(false)
      const canvas = canvasRef.current
      if (!canvas) return
      setIsGeneratingRender(true)
      const colorLabel =
      selectedColors.length === 0
        ? undefined
        : selectedColors.length === 1
          ? `${selectedColors[0].name} (${selectedColors[0].sku})`
          : selectedColors.map((c) => c.sku).join(', ')
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
    [selectedColors, aiEnabled]
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
    const colors = selectedColors.map((c) => ({
      name: c.name,
      sku: c.sku,
      hex: c.hex,
      finish: getFinishLabel(c),
    }))
    const snapshotDataUrl = canvasRef.current?.toDataURL('image/png')
    const titleName =
      selectedColors.length === 0
        ? 'Alubond facade'
        : selectedColors.length === 1
          ? selectedColors[0].name
          : `${selectedColors.length} finishes`
    const collectionLine =
      selectedColors.length === 0
        ? '—'
        : selectedColors.length === 1
          ? selectedColors[0].collection
          : selectedColors.map((c) => c.collection).filter((v, i, a) => a.indexOf(v) === i).join(' · ')
    generateSpecPdf(titleName, collectionLine, colors, colorOverrides.size, snapshotDataUrl)
  }, [appMode, selectedColors, colorOverrides.size])

  const appliedMaterials = useMemo(() => new Map(colorOverrides), [colorOverrides])
  const ifcAppliedMaterials = useMemo(() => new Map(ifcPaintState.colorOverrides), [ifcPaintState.colorOverrides])

  const handleStudioHeaderMode = useCallback((id: string) => {
    setAppMode(id as AppMode)
  }, [])

  const handleApplyColor = useCallback(
    (uuid: string, currentState: MaterialState) => {
      if (selectedColors.length === 0) return
      const panel = facadePanelsRef.current.find((p) => p.uuid === uuid)
      const slot: PanelMaterialSlot = panel ?? { uuid, row: 0, col: 0, stripeIndex: 0 }
      const colors = selectedColors
      const layout = facadeSettings.paletteLayout
      const c =
        colors.length === 1 ? colors[0] : colors[paletteColorIndexForSlot(slot, layout, colors.length)]
      const next = materialStateForPanelSlot(slot, c)
      const action: PaintAction = { uuid, prev: currentState, next }
      setFacadePaintState((prev) => ({
        colorOverrides: new Map(prev.colorOverrides).set(uuid, next),
        undoStack: [...prev.undoStack, action],
        redoStack: [],
      }))
    },
    [selectedColors, facadeSettings.paletteLayout]
  )

  const applyColorsToPanels = useCallback(
    (panels: PanelMaterialSlot[], colors: AlubondColor[], layout: FacadeSettings['paletteLayout']) => {
      if (colors.length === 0) return
      const bulk = materialOverridesForSlotsMulti(panels, colors, layout)
      setFacadePaintState((prev) => {
        const overrides = new Map(prev.colorOverrides)
        for (const [uuid, state] of bulk) overrides.set(uuid, state)
        return { colorOverrides: overrides, undoStack: prev.undoStack, redoStack: [] }
      })
    },
    []
  )

  const handleApplyAllPanels = useCallback(() => {
    if (selectedColors.length === 0) return
    applyColorsToPanels(facadePanelsRef.current, selectedColors, facadeSettings.paletteLayout)
  }, [selectedColors, applyColorsToPanels, facadeSettings.paletteLayout])

  const handleClearAllPalettes = useCallback(() => {
    setSelectedColors([])
    setFacadePaintState({ colorOverrides: new Map(), undoStack: [], redoStack: [] })
  }, [])

  /** Stable callback so FacadeBuilding’s panel effect doesn’t re-run on every colour change (avoids races with texture apply). */
  const handlePanelsReady = useCallback(
    (panels: PanelMaterialSlot[]) => {
      facadePanelsRef.current = panels
      const cols = selectedColorsRef.current
      if (cols.length > 0) applyColorsToPanels(panels, cols, facadeSettings.paletteLayout)
    },
    [applyColorsToPanels, facadeSettings.paletteLayout]
  )

  // When user updates palette selection or layout in Facade Maker, apply to all panels
  useEffect(() => {
    if (appMode !== 'studio' || selectedColors.length === 0) return
    handleApplyAllPanels()
  }, [appMode, selectedColors, handleApplyAllPanels, facadeSettings.paletteLayout])

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
    if (selectedColors.length === 0) return
    const panels = ifcOrderedPanelsRef.current
    if (panels.length === 0) return
    const bulk = materialOverridesForSlotsMulti(panels, selectedColors, facadeSettings.paletteLayout)
    setIfcPaintState((prev) => {
      const overrides = new Map(prev.colorOverrides)
      for (const [uuid, state] of bulk) overrides.set(uuid, state)
      return { colorOverrides: overrides, undoStack: prev.undoStack, redoStack: [] }
    })
  }, [selectedColors, facadeSettings.paletteLayout])

  // Re-map whole IFC when palette layout or film-strip swatches change — but not in surface/click mode,
  // where each click should only touch one mesh (apply-all is explicit via the left panel button).
  useEffect(() => {
    if (appMode !== 'ifc' || selectedColors.length === 0) return
    if (ifcSelectionTool) return
    handleIfcApplyAll()
  }, [appMode, selectedColors, facadeSettings.paletteLayout, handleIfcApplyAll, ifcSelectionTool])

  const handleIfcApplyColor = useCallback(
    (uuid: string, currentState: MaterialState) => {
      if (selectedColors.length === 0) return
      const slot =
        ifcOrderedPanelsRef.current.find((p) => p.uuid === uuid) ?? {
          uuid,
          row: 0,
          col: 0,
          stripeIndex: stripeFromMeshUuid(uuid, Math.max(8, selectedColors.length * 3)),
        }
      const colors = selectedColors
      const layout = facadeSettings.paletteLayout
      const c =
        colors.length === 1 ? colors[0] : colors[paletteColorIndexForSlot(slot, layout, colors.length)]
      const next = materialStateForPanelSlot(slot, c)
      const action: PaintAction = { uuid, prev: currentState, next }
      setIfcPaintState((prev) => ({
        colorOverrides: new Map(prev.colorOverrides).set(uuid, next),
        undoStack: [...prev.undoStack, action],
        redoStack: [],
      }))
    },
    [selectedColors, facadeSettings.paletteLayout]
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
    if (!uploadedImage || selectedColors.length === 0) return
    setShowImageGenerateDialog(true)
  }, [uploadedImage, selectedColors.length])

  const handleConfirmImageStudioGenerate = useCallback(
    async (ui: ImageStudioGenerateUiOptions) => {
      if (!uploadedImage || selectedColors.length === 0) return

      let imageForApi: string
      try {
        const el = imageStudioPreviewRef.current
        if (!el) {
          setImageError('Workspace preview is not ready. Wait for the image to appear, then try again.')
          return
        }
        imageForApi = await captureWorkspacePreviewToDataUrl(el)
      } catch (e) {
        setImageError(
          e instanceof Error ? e.message : 'Could not capture the workspace preview. Try a smaller window or reload.'
        )
        return
      }

      setShowImageGenerateDialog(false)
      setImageProcessing(true)
      setImageError(null)
      try {
        const hasTextureRefs = anyColorUsesPanelTextureRefs(selectedColors)
        const refSuffix = buildFacadeReferenceImageSuffix(hasTextureRefs)
        let prompt = buildFacadePromptMulti(selectedColors) + refSuffix
        if (ui.customPrompt.trim()) {
          prompt += ` Additional creative direction: ${ui.customPrompt.trim()}`
        }
        /** Full-size panel JPEGs as a second (merged) image — the on-screen ref strip is too small in the capture alone. */
        let paletteReferenceDataUrls: string[] | undefined
        if (hasTextureRefs) {
          try {
            const urls = await buildPaletteReferenceDataUrlsMulti(selectedColors)
            if (urls.length > 0) paletteReferenceDataUrls = urls
          } catch {
            /* main workspace capture still includes the strip when visible */
          }
        }
        const nanoOpts: NanobananaGenerateOptions = {
          aspectRatio: ui.aspectRatio,
          resolution: ui.resolution,
          outputFormat: ui.outputFormat,
          googleSearch: ui.googleSearch,
          maxSendDimension: 768,
          imageStudioMode: true,
          paletteReferenceDataUrls,
        }
        const nanoOptsMainOnly: NanobananaGenerateOptions = {
          ...nanoOpts,
          paletteReferenceDataUrls: undefined,
        }
        const runNano = (p: string, opts: NanobananaGenerateOptions) =>
          enhanceImageWithNanobanana(imageForApi, p, opts)
        const extra = ui.customPrompt.trim()
          ? ` Additional creative direction: ${ui.customPrompt.trim()}`
          : ''
        const retryableNano = (msg: string) =>
          /server exception|try again later|contact customer service|\b500\b|404|no taskId|no image URL|Result image|Timed out/i.test(
            msg
          )
        try {
          setResultImage(await runNano(prompt, nanoOpts))
        } catch (e) {
          const msg = e instanceof Error ? e.message : ''
          if (!retryableNano(msg)) throw e
          if (paletteReferenceDataUrls?.length) {
            try {
              setResultImage(await runNano(prompt, nanoOptsMainOnly))
            } catch (e2) {
              const m2 = e2 instanceof Error ? e2.message : ''
              if (!retryableNano(m2)) throw e2
              setResultImage(
                await runNano(buildFacadePromptMinimalMulti(selectedColors) + refSuffix + extra, nanoOptsMainOnly)
              )
            }
          } else {
            setResultImage(
              await runNano(buildFacadePromptMinimalMulti(selectedColors) + refSuffix + extra, nanoOptsMainOnly)
            )
          }
        }
      } catch (e) {
        setImageError(e instanceof Error ? e.message : 'Failed to apply facade')
      } finally {
        setImageProcessing(false)
      }
    },
    [uploadedImage, selectedColors]
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

  const workspaceTheme: Theme = workspaceAppearance === 'light' ? 'light' : 'dark'
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
        selectedColors={selectedColors}
        onApplyAllSurfaces={handleIfcApplyAll}
      />
    ) : isImage ? (
      <ImageLeftColumn
        theme={workspaceTheme}
        uploadedImage={uploadedImage}
        canGenerate={!!uploadedImage && selectedColors.length > 0}
        hasResult={!!resultImage}
        selectedColor={primaryColor}
        selectedCount={selectedColors.length}
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
      workspaceAppearance={workspaceAppearance}
      onThemeToggle={() => setWorkspaceAppearance((p) => (p === 'light' ? 'dark' : 'light'))}
      leftPanel={leftColumn}
      facadePanel={
        isStudio ? (
          <FacadeControls
            theme={workspaceTheme}
            settings={facadeSettings}
            onChange={setFacadeSettings}
            selectedColors={selectedColors}
            onClearAllPalettes={handleClearAllPalettes}
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
          workspaceAppearance={workspaceAppearance}
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
          workspaceAppearance={workspaceAppearance}
          libraryTab={libraryTab}
          onLibraryTabChange={setLibraryTab}
          colours={workspaceFilmColours}
          selectedColors={selectedColors}
          onTogglePaletteColor={togglePaletteColor}
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
            selectedColors={selectedColors}
            previewCaptureRef={imageStudioPreviewRef}
            onRemovePaletteColorBySku={removePaletteColorBySku}
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
    {showImageGenerateDialog && uploadedImage && selectedColors.length > 0 && (
      <ImageStudioGenerateDialog
        theme={workspaceTheme}
        uploadedImage={uploadedImage}
        selectedColors={selectedColors}
        onClose={() => setShowImageGenerateDialog(false)}
        onConfirm={handleConfirmImageStudioGenerate}
      />
    )}
  </>
  )
}
