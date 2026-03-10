import { useState, useRef, useCallback } from 'react'
import { getThemeTokens, brand, type Theme } from '../theme'
import { PalettePanel } from './PalettePanel'
import { palettes, getFinishLabel } from '../data/palettes'
import { enhanceImageWithNanobanana } from '../utils/nanobananaEnhance'
import type { AlubondColor } from '../types'

interface ImageStudioProps {
  theme: Theme
  onBack: () => void
  onThemeToggle: () => void
}

const IMAGE_FACADE_PROMPT_BASE =
  'You are looking at a real building photograph. Apply Alubond ACP facade cladding to this building. ' +
  'Preserve the building shape, windows, structure, and proportions exactly. ' +
  'Only change the facade surface material/colour to match this specification: '

function buildFacadePrompt(color: AlubondColor | null): string {
  if (!color) {
    return (
      IMAGE_FACADE_PROMPT_BASE +
      'Use a modern silver metallic ACP finish. ' +
      'Result: photorealistic architectural visualization with ACP cladding, natural daylight, clear sky, professional render quality.'
    )
  }
  const finishDesc: Record<string, string> = {
    matte: 'smooth matte',
    metallic: 'brushed metallic reflective',
    anodise: 'anodised aluminium with subtle sheen',
    wood: 'realistic wood-grain ACP panel',
    patina: 'weathered patina with aged copper tones',
    fusion: 'mixed-material combination',
  }
  const finishLabel = getFinishLabel(color)
  const finishPrompt = color.finish === 'fusion' && color.fusionOf?.length === 2
    ? `fusion of ${color.fusionOf.join(' and ')} (${finishLabel})`
    : (finishDesc[color.finish] ?? color.finish)
  return (
    IMAGE_FACADE_PROMPT_BASE +
    `Colour: ${color.name} (${color.hex}). Finish: ${finishPrompt}. ` +
    `The facade should look like real Alubond ${finishLabel} ACP panels in the colour ${color.name}. ` +
    'Result: photorealistic architectural visualization with ACP cladding, natural daylight, clear sky, professional render quality.'
  )
}

export function ImageStudio({ theme, onBack, onThemeToggle }: ImageStudioProps) {
  const t = getThemeTokens(theme)
  const [selectedColor, setSelectedColor] = useState<AlubondColor | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    setError(null)
    setResultImage(null)
    const reader = new FileReader()
    reader.onload = () => setUploadedImage(reader.result as string)
    reader.onerror = () => setError('Failed to read file')
    reader.readAsDataURL(file)
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

  const handleApplyFacade = useCallback(async () => {
    if (!uploadedImage) return
    setIsProcessing(true)
    setError(null)
    try {
      const prompt = buildFacadePrompt(selectedColor)
      const result = await enhanceImageWithNanobanana(uploadedImage, prompt, {
        aspectRatio: 'auto',
        resolution: '1K',
        outputFormat: 'png',
      })
      setResultImage(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to apply facade')
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedImage, selectedColor])

  const handleDownload = useCallback(() => {
    if (!resultImage) return
    const a = document.createElement('a')
    a.href = resultImage
    a.download = `alubond-facade-${Date.now()}.png`
    a.click()
  }, [resultImage])

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
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 500,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.85)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <img src="/alubond-logo.png" alt="Alubond" style={{ height: 30, objectFit: 'contain', opacity: 0.9 }} />
        <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.12)' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          Image Studio
        </span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onThemeToggle}
          style={{
            padding: '6px 10px',
            fontSize: 12,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.85)',
            cursor: 'pointer',
          }}
        >
          {theme === 'light' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /></svg>
          )}
        </button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Palette sidebar */}
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
            comparePaletteId={null}
            onComparePaletteId={() => {}}
            compareMode="single"
          />
        </aside>

        {/* Main area */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            overflow: 'auto',
            background: t.canvasBg,
          }}
        >
          {!uploadedImage ? (
            /* Upload zone */
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
                borderRadius: 16,
                border: `2px dashed ${dragActive ? t.primary : t.border}`,
                background: dragActive
                  ? `${t.primary}10`
                  : t.cardBg,
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
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: t.text }}>
                Upload a building image
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: t.textMuted, textAlign: 'center', maxWidth: 360 }}>
                Drag & drop or click to upload a photo, render, or elevation of your building.
                We&apos;ll apply your chosen Alubond facade.
              </p>
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
                Choose File
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          ) : (
            /* Image + result view */
            <div style={{ width: '100%', maxWidth: 1000 }}>
              {/* Generate area — clear section for AI facade generation */}
              <div
                style={{
                  padding: 20,
                  marginBottom: 24,
                  borderRadius: 12,
                  border: `1px solid ${t.border}`,
                  background: t.cardBg,
                }}
              >
                <h3 style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Generate
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: t.textMuted }}>
                  Apply your selected Alubond colour to the building image. Choose a colour from the library, then click below.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleApplyFacade}
                    disabled={isProcessing}
                    style={{
                      padding: '12px 28px',
                      fontSize: 14,
                      fontWeight: 600,
                      background: isProcessing ? t.textMuted : brand.orange,
                      border: 'none',
                      borderRadius: 10,
                      color: '#fff',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isProcessing ? 'Generating…' : `Generate with ${selectedColor?.name ?? 'Facade'}`}
                  </button>
                  {resultImage && (
                    <button
                      type="button"
                      onClick={handleDownload}
                      style={{
                        padding: '10px 20px',
                        fontSize: 14,
                        fontWeight: 500,
                        background: t.buttonBg,
                        border: `1px solid ${t.border}`,
                        borderRadius: 10,
                        color: t.text,
                        cursor: 'pointer',
                      }}
                    >
                      Download result
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setUploadedImage(null); setResultImage(null); setError(null) }}
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      background: 'transparent',
                      border: `1px solid ${t.border}`,
                      borderRadius: 8,
                      color: t.textMuted,
                      cursor: 'pointer',
                    }}
                  >
                    Upload New Image
                  </button>
                  {selectedColor && (
                    <span style={{ fontSize: 13, color: t.textMuted }}>
                      Selected: <strong style={{ color: t.text }}>{selectedColor.name}</strong>{' '}
                      <span
                        style={{
                          display: 'inline-block',
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          background: selectedColor.hex,
                          border: `1px solid ${t.border}`,
                          verticalAlign: 'middle',
                        }}
                      />
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: '12px 16px',
                    marginBottom: 16,
                    borderRadius: 8,
                    background: 'rgba(200,50,50,0.12)',
                    border: '1px solid rgba(200,50,50,0.3)',
                    color: '#f87171',
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Images */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: resultImage ? '1fr 1fr' : '1fr',
                  gap: 20,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Original
                  </div>
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: `1px solid ${t.border}`,
                      background: t.cardBg,
                    }}
                  >
                    <img
                      src={uploadedImage}
                      alt="Uploaded building"
                      style={{ width: '100%', display: 'block' }}
                    />
                  </div>
                </div>
                {resultImage && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      With Alubond Facade
                    </div>
                    <div
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: `1px solid ${t.primary}44`,
                        background: t.cardBg,
                      }}
                    >
                      <img
                        src={resultImage}
                        alt="Facade applied"
                        style={{ width: '100%', display: 'block' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Loading skeleton */}
              {isProcessing && !resultImage && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 40,
                    borderRadius: 12,
                    border: `1px solid ${t.border}`,
                    background: t.cardBg,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: `3px solid ${t.border}`,
                      borderTopColor: t.primary,
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto 16px',
                    }}
                  />
                  <p style={{ margin: 0, fontSize: 14, color: t.textMuted }}>
                    Applying {selectedColor?.name ?? 'facade'} to your building…
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: t.textMuted }}>
                    This may take up to a minute.
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
