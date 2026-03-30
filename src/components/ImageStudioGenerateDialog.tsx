import { useEffect, useState } from 'react'
import { brand, getStudioModalChrome, type Theme } from '../theme'
import type { AlubondColor } from '../types'
import {
  anyColorUsesPanelTextureRefs,
  buildPaletteReferenceDataUrlsMulti,
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
  selectedColors: AlubondColor[]
  onClose: () => void
  onConfirm: (opts: ImageStudioGenerateUiOptions) => void
}

export function ImageStudioGenerateDialog({
  theme,
  uploadedImage,
  selectedColors,
  onClose,
  onConfirm,
}: Props) {
  const panel = getStudioModalChrome(theme)
  const isLight = theme === 'light'
  const [aspectRatio, setAspectRatio] = useState<string>('16:9')
  const [resolution, setResolution] = useState<string>('1K')
  const [outputFormat, setOutputFormat] = useState<string>('jpg')
  const [googleSearch, setGoogleSearch] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [refUrls, setRefUrls] = useState<string[]>([])
  const [refsLoading, setRefsLoading] = useState(true)

  const refSkuKey = selectedColors.map((c) => c.sku).join('|')
  const expectsRefs = anyColorUsesPanelTextureRefs(selectedColors)

  useEffect(() => {
    let cancelled = false
    setRefsLoading(true)
    buildPaletteReferenceDataUrlsMulti(selectedColors).then((urls) => {
      if (!cancelled) {
        setRefUrls(urls)
        setRefsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [refSkuKey])

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
        background: panel.overlay,
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
          background: panel.panelBg,
          borderRadius: 16,
          border: `1px solid ${panel.panelBorder}`,
          maxWidth: 560,
          width: '100%',
          boxShadow: panel.panelShadow,
          overflow: 'hidden',
          maxHeight: 'min(92vh, 900px)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${panel.panelBorder}`, flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: panel.text }}>
            Generate façade ·{' '}
            {selectedColors.length === 1
              ? selectedColors[0].name
              : `${selectedColors.length} finishes (${selectedColors.map((c) => c.name).join(', ')})`}
          </h3>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: panel.muted, lineHeight: 1.55 }}>
            Uses{' '}
            <a href="https://docs.nanobananaapi.ai/" target="_blank" rel="noopener noreferrer" style={{ color: brand.orange }}>
              NanoBanana
            </a>
            . We send a <strong style={{ color: panel.text }}>JPEG snapshot of the building preview</strong> (same view as
            the centre panel, smaller than a raw upload—like a canvas capture in other modes). For
            textured catalogue finishes we add <strong style={{ color: panel.text }}>one merged reference strip</strong> built
            from the same panel JPEGs (same approach as Facade Maker AI)—keeps the NanoBanana request reliable. Solid/uniform
            colours stay in the text only (name, hex, SKU).
          </p>
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
                background: isLight ? '#e8ecf4' : '#111',
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
                <strong style={{ color: panel.text }}>
                  {selectedColors.length > 1 ? 'Solid / multi-colour finishes' : 'Solid / uniform finish'}
                </strong>{' '}
                — the API uses your uploaded building photo plus the prompt; solid colours are specified by name, hex, and SKU
                in text only.
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
                  Thumbnails match your selection; the API receives them combined into a single reference image with your
                  photo.
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
            borderTop: `1px solid ${panel.panelBorder}`,
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
            disabled={expectsRefs && refsLoading}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              background: expectsRefs && refsLoading ? panel.fieldBorder : brand.orange,
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              cursor: expectsRefs && refsLoading ? 'not-allowed' : 'pointer',
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
