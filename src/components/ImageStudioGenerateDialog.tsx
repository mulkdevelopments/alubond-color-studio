import { useEffect, useState } from 'react'
import { brand, type Theme } from '../theme'
import type { AlubondColor } from '../types'
import {
  buildPaletteReferenceDataUrls,
  colorUsesPanelTextureRefs,
} from '../utils/paletteReferenceImages'

const ASPECT_RATIOS = [
  '1:1',
  '1:4',
  '1:8',
  '2:3',
  '3:2',
  '3:4',
  '4:1',
  '4:3',
  '4:5',
  '5:4',
  '8:1',
  '9:16',
  '16:9',
  '21:9',
  'auto',
] as const
const RESOLUTIONS = ['1K', '2K', '4K'] as const
const OUTPUT_FORMATS = ['png', 'jpg'] as const

export type ImageStudioGenerateUiOptions = {
  aspectRatio: string
  resolution: string
  outputFormat: string
  googleSearch: boolean
  customPrompt: string
}

type Props = {
  theme: Theme
  uploadedImage: string
  selectedColor: AlubondColor
  onClose: () => void
  onConfirm: (opts: ImageStudioGenerateUiOptions) => void
}

export function ImageStudioGenerateDialog({
  theme,
  uploadedImage,
  selectedColor,
  onClose,
  onConfirm,
}: Props) {
  void theme
  /** Black modal chrome (consistent regardless of app theme). */
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
  const [outputFormat, setOutputFormat] = useState<string>('jpg')
  const [googleSearch, setGoogleSearch] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [refUrls, setRefUrls] = useState<string[]>([])
  const [refsLoading, setRefsLoading] = useState(true)

  const expectsRefs = colorUsesPanelTextureRefs(selectedColor)

  useEffect(() => {
    let cancelled = false
    setRefsLoading(true)
    buildPaletteReferenceDataUrls(selectedColor).then((urls) => {
      if (!cancelled) {
        setRefUrls(urls)
        setRefsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [selectedColor])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = () => {
    onConfirm({
      aspectRatio,
      resolution,
      outputFormat,
      googleSearch,
      customPrompt,
    })
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

  const thumbBox = {
    borderRadius: 10,
    overflow: 'hidden' as const,
    border: `1px solid ${panel.fieldBorder}`,
    background: panel.fieldBg,
    aspectRatio: '1',
    maxWidth: 96,
    maxHeight: 96,
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Studio generate"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        overflow: 'auto',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: panel.bg,
          borderRadius: 16,
          border: `1px solid ${panel.border}`,
          maxWidth: 560,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          maxHeight: 'min(92vh, 900px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${panel.border}`, flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: panel.text }}>
            Generate façade · {selectedColor.name}
          </h3>
         
        </div>

        <div
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            overflow: 'auto',
            minHeight: 0,
          }}
        >
          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Your building</div>
            <div
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: `1px solid ${panel.fieldBorder}`,
                maxHeight: 160,
                background: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={uploadedImage}
                alt="Your building"
                style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain' }}
              />
            </div>
          </div>

          <div>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Palette</div>
            {!expectsRefs ? (
              <p style={{ margin: 0, fontSize: 12, color: panel.muted, lineHeight: 1.55 }}>
                <strong style={{ color: panel.text }}>Solid / uniform finish</strong> — no swatch images are sent. Colour,
                name, SKU, and finish are described in the text prompt only.
              </p>
            ) : refsLoading ? (
              <p style={{ margin: 0, fontSize: 12, color: panel.muted }}>Loading panel textures…</p>
            ) : refUrls.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: panel.muted, lineHeight: 1.55 }}>
                Panel images could not be loaded. Generation will use the text prompt only (same as solid finishes).
              </p>
            ) : (
              <>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: panel.muted, lineHeight: 1.45 }}>
                 
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {refUrls.map((url, i) => (
                    <div key={`${i}-${url.slice(0, 40)}`} style={thumbBox}>
                      <img
                        src={url}
                        alt={`Reference ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <label style={labelStyle}>Aspect ratio</label>
            <select style={inputStyle} value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
              {ASPECT_RATIOS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Resolution</label>
            <select style={inputStyle} value={resolution} onChange={(e) => setResolution(e.target.value)}>
              {RESOLUTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Output format</label>
            <select style={inputStyle} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              {OUTPUT_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="img-google-search"
              checked={googleSearch}
              onChange={(e) => setGoogleSearch(e.target.checked)}
            />
            <label htmlFor="img-google-search" style={{ fontSize: 13, color: panel.text }}>
              Use Google search grounding
            </label>
          </div>
          <div>
            <label style={labelStyle}>Extra creative direction (optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              placeholder="e.g. golden hour, more contrast on the stone grain…"
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
            flexShrink: 0,
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
