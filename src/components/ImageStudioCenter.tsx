import type { CSSProperties } from 'react'
import { getThemeTokens, brand, glassChrome, type Theme } from '../theme'
import type { AlubondColor } from '../types'

/** Image preview fills space between header and bottom film dock; keeps aspect ratio (no squashing). */
export function ImageStudioCenter({
  theme,
  uploadedImage,
  resultImage,
  isProcessing,
  selectedColor,
}: {
  theme: Theme
  uploadedImage: string | null
  resultImage: string | null
  isProcessing: boolean
  selectedColor: AlubondColor | null
}) {
  const t = getThemeTokens(theme)
  /** Slightly lighter than pure black so letterboxing matches the scene, not a harsh void */
  const imageMat = 'rgba(22, 22, 24, 0.92)'

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
              ORIGINAL
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                position: 'relative',
                borderRadius: 14,
                overflow: 'hidden',
                border: `1px solid ${glassChrome.border}`,
                background: imageMat,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                    Applying {selectedColor?.name ?? 'facade'}…
                  </p>
                  <style>{`@keyframes imgStudioSpin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}
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
