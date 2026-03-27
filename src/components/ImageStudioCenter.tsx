import { useEffect, useState, type CSSProperties, type Ref } from 'react'
import { getThemeTokens, brand, glassChrome, type Theme } from '../theme'
import type { AlubondColor } from '../types'
import {
  anyColorUsesPanelTextureRefs,
  buildPaletteReferenceDataUrlsMulti,
} from '../utils/paletteReferenceImages'

/** Image preview fills space between header and bottom film dock; keeps aspect ratio (no squashing). */
export function ImageStudioCenter({
  theme,
  uploadedImage,
  resultImage,
  isProcessing,
  selectedColors,
  previewCaptureRef,
}: {
  theme: Theme
  uploadedImage: string | null
  resultImage: string | null
  isProcessing: boolean
  selectedColors: AlubondColor[]
  /** Set on the bordered preview (photo + refs) for NanoBanana — exact pixels you see. */
  previewCaptureRef?: Ref<HTMLDivElement>
}) {
  const t = getThemeTokens(theme)
  const [paletteRefUrls, setPaletteRefUrls] = useState<string[]>([])
  const [refsLoading, setRefsLoading] = useState(false)

  const refSkuKey = selectedColors.map((c) => c.sku).join('|')
  const showPaletteSidebar =
    !!uploadedImage && selectedColors.length > 0 && anyColorUsesPanelTextureRefs(selectedColors)

  useEffect(() => {
    if (!uploadedImage || selectedColors.length === 0 || !anyColorUsesPanelTextureRefs(selectedColors)) {
      setPaletteRefUrls([])
      setRefsLoading(false)
      return
    }
    let cancelled = false
    setRefsLoading(true)
    buildPaletteReferenceDataUrlsMulti(selectedColors).then((urls) => {
      if (!cancelled) {
        setPaletteRefUrls(urls)
        setRefsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [uploadedImage, refSkuKey])

  /** Slightly lighter than pure black so letterboxing matches the scene, not a harsh void */
  const imageMat = 'rgba(22, 22, 24, 0.92)'

  const applyingLabel =
    selectedColors.length === 0
      ? 'facade'
      : selectedColors.length === 1
        ? selectedColors[0].name
        : `${selectedColors.length} finishes`

  const rootShell: CSSProperties = {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  if (!uploadedImage) {
    return (
      <div style={rootShell}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            textAlign: 'center',
            minHeight: 0,
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="1" opacity={0.35}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p style={{ margin: '16px 0 0', fontSize: 14, color: t.textMuted, maxWidth: 320, lineHeight: 1.5 }}>
            Upload a building photo from the left panel. Preview and AI result will appear here.
          </p>
        </div>
      </div>
    )
  }

  const sidebarW = 108
  const paletteSidebar =
    showPaletteSidebar && (paletteRefUrls.length > 0 || refsLoading) ? (
      <div
        style={{
          width: sidebarW,
          flexShrink: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${glassChrome.border}`,
          background: '#141414',
          borderRadius: '0 14px 14px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: 8,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.08em',
            padding: '8px 8px 4px',
            flexShrink: 0,
          }}
        >
          ALUBOND REFS
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: '4px 8px 10px',
            boxSizing: 'border-box',
          }}
        >
          {refsLoading ? (
            <p style={{ margin: 0, fontSize: 10, color: t.textMuted, lineHeight: 1.4 }}>Loading…</p>
          ) : (
            paletteRefUrls.map((url, i) => (
              <div
                key={`${i}-${url.slice(0, 30)}`}
                style={{
                  flex: '0 0 auto',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#222',
                  aspectRatio: '1',
                  maxHeight: 88,
                }}
              >
                <img
                  src={url}
                  alt={`Finish ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))
          )}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 9,
            color: 'rgba(255,255,255,0.35)',
            padding: '0 8px 8px',
            lineHeight: 1.35,
          }}
        >
          Sent as one image with your photo
        </p>
      </div>
    ) : null

  return (
    <div style={rootShell}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 16px 16px',
          gap: 12,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: resultImage ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
            gridTemplateRows: 'minmax(0, 1fr)',
            gap: 16,
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, letterSpacing: '0.06em', flexShrink: 0 }}>
              ORIGINAL{showPaletteSidebar ? ' + REFERENCES' : ''}
            </div>
            <div
              ref={previewCaptureRef}
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${glassChrome.border}`,
                background: imageMat,
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                {isProcessing && !resultImage && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        border: `3px solid ${glassChrome.border}`,
                        borderTopColor: brand.orange,
                        animation: 'imgStudioSpin 0.8s linear infinite',
                      }}
                    />
                    <p style={{ margin: 0, fontSize: 13, color: '#e5e5e5', padding: '0 16px', textAlign: 'center' }}>
                      Applying {applyingLabel}…
                    </p>
                    <style>{`@keyframes imgStudioSpin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}
              </div>
              {paletteSidebar}
            </div>
          </div>

          {resultImage ? (
            <div
              style={{
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: brand.orange, letterSpacing: '0.06em', flexShrink: 0 }}>
                WITH ALUBOND
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: `1px solid ${brand.orange}55`,
                  background: imageMat,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={resultImage}
                  alt="Result"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
