import { useRef } from 'react'
import { getThemeTokens, brand, glassChrome, type Theme } from '../../theme'
import type { AlubondColor } from '../../types'

export function ImageLeftColumn({
  theme,
  uploadedImage,
  selectedColor,
  selectedCount = 1,
  isProcessing,
  error,
  dragActive,
  onDragActive,
  onFile,
  onApplyFacade,
  onDownload,
  onClear,
  hasResult,
  canGenerate,
}: {
  theme: Theme
  uploadedImage: string | null
  /** True when user picked a library colour / fusion (enables opening generate dialog). */
  canGenerate: boolean
  /** True when AI generation produced a result (enables Download) */
  hasResult: boolean
  selectedColor: AlubondColor | null
  /** Number of swatches selected in the film strip (for button label). */
  selectedCount?: number
  isProcessing: boolean
  error: string | null
  dragActive: boolean
  onDragActive: (v: boolean) => void
  onFile: (file: File) => void
  onApplyFacade: () => void
  onDownload: () => void
  onClear: () => void
}) {
  const t = getThemeTokens(theme)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dropZone = (
    <div
      onDragEnter={(e) => {
        e.preventDefault()
        onDragActive(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        onDragActive(true)
      }}
      onDragLeave={() => onDragActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        onDragActive(false)
        const file = e.dataTransfer.files[0]
        if (file) onFile(file)
      }}
      onClick={() => fileInputRef.current?.click()}
      style={{
        borderRadius: 14,
        border: `2px dashed ${dragActive ? brand.orange : glassChrome.border}`,
        background: dragActive ? 'rgba(232,119,34,0.08)' : glassChrome.iconBg,
        padding: 14,
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 4 }}>
        {uploadedImage ? 'Replace image' : 'Upload building photo'}
      </div>
      <p style={{ margin: 0, fontSize: 10, color: t.textMuted, lineHeight: 1.4 }}>
        JPG, PNG — drag & drop or click
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
    </div>
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: 0,
        flex: 1,
        width: '100%',
        alignSelf: 'stretch',
        overflow: 'auto',
        boxSizing: 'border-box',
        padding: '20px 18px 28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingBottom: 14,
          marginBottom: 2,
          borderBottom: `1px solid ${glassChrome.borderSoft}`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand.orange} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>Image</h3>
      </div>
      {dropZone}
      {error && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(200,50,50,0.12)',
            fontSize: 11,
            color: '#f87171',
            lineHeight: 1.45,
          }}
        >
          {error}
        </div>
      )}
      {uploadedImage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, padding: '0 2px', fontSize: 11, color: t.textMuted, lineHeight: 1.5 }}>
            {canGenerate
              ? 'Open options to review references and API settings, then generate.'
              : 'Select one or more finishes in the film strip below to enable Generate (multi-select applies a mixed façade in the prompt).'}
          </p>
          {canGenerate && (
            <button
              type="button"
              onClick={onApplyFacade}
              disabled={isProcessing}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                fontSize: 12,
                fontWeight: 700,
                background: isProcessing ? t.textMuted : brand.orange,
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
              }}
            >
              {isProcessing
                ? 'Generating…'
                : selectedCount > 1
                  ? `Generate · ${selectedCount} finishes`
                  : `Generate · ${selectedColor?.name ?? 'Finish'}`}
            </button>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 2 }}>
            {hasResult && (
              <button
                type="button"
                onClick={onDownload}
                style={{
                  padding: '8px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  background: glassChrome.iconBg,
                  border: `1px solid ${glassChrome.border}`,
                  borderRadius: 8,
                  color: t.text,
                  cursor: 'pointer',
                }}
              >
                Download
              </button>
            )}
            <button
              type="button"
              onClick={onClear}
              style={{
                padding: '8px 12px',
                fontSize: 11,
                background: 'transparent',
                border: `1px solid ${glassChrome.borderSoft}`,
                borderRadius: 8,
                color: t.textMuted,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
