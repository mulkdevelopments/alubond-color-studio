import { useRef } from 'react'
import { getThemeTokens, brand, glassChrome, type Theme } from '../../theme'
import type { AlubondColor } from '../../types'

export function IfcLeftColumn({
  theme,
  ifcUrl,
  error,
  dragActive,
  onDragActive,
  onFile,
  selectionToolEnabled,
  onToggleSelection,
  meshCount,
  selectedColors,
  onApplyAllSurfaces,
}: {
  theme: Theme
  ifcUrl: string | null
  error: string | null
  dragActive: boolean
  onDragActive: (v: boolean) => void
  onFile: (file: File) => void
  selectionToolEnabled: boolean
  onToggleSelection: () => void
  meshCount: number
  selectedColors: AlubondColor[]
  onApplyAllSurfaces: () => void
}) {
  const t = getThemeTokens(theme)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const zone = (
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
        padding: 16,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="1" style={{ margin: '0 auto 10px', opacity: 0.6 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="12" y1="12" x2="12" y2="18" />
      </svg>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6 }}>
        {ifcUrl ? 'Replace IFC model' : 'Upload IFC file'}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: t.textMuted, lineHeight: 1.45 }}>
        Drag & drop or click. <strong style={{ color: t.text }}>.ifc</strong> only.
      </p>
      {error && <p style={{ margin: '10px 0 0', fontSize: 11, color: '#f87171' }}>{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ifc"
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
        overflow: 'auto',
        boxSizing: 'border-box',
        padding: '20px 18px 22px',
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>IFC model</h3>
      </div>
      {zone}
      {ifcUrl ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelection()
            }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 12,
              border: `1px solid ${selectionToolEnabled ? brand.orange : glassChrome.borderSoft}`,
              background: selectionToolEnabled ? 'rgba(232,119,34,0.15)' : glassChrome.iconBg,
              color: selectionToolEnabled ? brand.orange : t.text,
              cursor: 'pointer',
            }}
          >
            {selectionToolEnabled ? 'Selection: on' : 'Paint: select surfaces'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onApplyAllSurfaces()
            }}
            disabled={selectedColors.length === 0 || meshCount === 0}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 12,
              border: 'none',
              background:
                selectedColors.length === 0 || meshCount === 0 ? glassChrome.borderSoft : brand.orange,
              color: '#fff',
              cursor: selectedColors.length === 0 || meshCount === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedColors.length === 0 || meshCount === 0 ? 0.55 : 1,
            }}
          >
            Apply to all surfaces
          </button>
          <p
            style={{
              margin: 0,
              marginTop: 2,
              padding: '0 2px',
              fontSize: 10,
              color: t.textMuted,
              lineHeight: 1.5,
            }}
          >
            {selectionToolEnabled ? (
              <>
                <strong style={{ color: t.text }}>Surface mode</strong> — only one library swatch at a time. Pick a
                finish in the strip, then click meshes to paint. Turn selection off to multi-select swatches and use{' '}
                <strong style={{ color: t.text }}>Apply to all surfaces</strong> with your palette layout.
              </>
            ) : (
              <>
                Uses all swatches selected in the film strip (mapping follows your Facade Maker palette layout). Fusion
                finishes use row/band rhythm like the procedural façade. Turn on selection above to paint one surface at
                a time with a single finish.
              </>
            )}
          </p>
          <p
            style={{
              margin: 0,
              marginTop: 6,
              padding: '0 2px',
              fontSize: 11,
              color: t.textMuted,
              lineHeight: 1.5,
            }}
          >
            Pick colours in the film strip below, then <strong style={{ color: t.text }}>Apply to all</strong> or use
            surface selection.
          </p>
        </>
      ) : (
        <p
          style={{
            margin: 0,
            padding: '0 2px',
            fontSize: 11,
            color: t.textMuted,
            lineHeight: 1.5,
          }}
        >
          After loading, use the colour library at the bottom to paint the facade.
        </p>
      )}
    </div>
  )
}
