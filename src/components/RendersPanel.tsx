import { useState, useEffect } from 'react'
import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'

export interface GeneratedRender {
  id: string
  dataUrl: string
  createdAt: number
  paletteName?: string
}

interface RendersPanelProps {
  theme: Theme
  renders: GeneratedRender[]
  onGenerate: () => void
  onDelete: (id: string) => void
  onDownload: (render: GeneratedRender) => void
  isGenerating?: boolean
  aiEnabled: boolean
  onAiEnabledChange: (enabled: boolean) => void
}

function FullscreenImageDialog({
  theme,
  render,
  onClose,
}: {
  theme: Theme
  render: GeneratedRender
  onClose: () => void
}) {
  const t = getThemeTokens(theme)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image fullscreen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1001,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 10,
          border: `1px solid ${t.border}`,
          background: t.buttonBg,
          color: t.text,
          fontSize: 18,
          cursor: 'pointer',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
      <img
        src={render.dataUrl}
        alt="Generated render"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

function CompareDialog({
  theme,
  renderA,
  renderB,
  onClose,
}: {
  theme: Theme
  renderA: GeneratedRender
  renderB: GeneratedRender
  onClose: () => void
}) {
  const t = getThemeTokens(theme)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compare renders"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: t.sidebarBg,
          borderRadius: 16,
          border: `1px solid ${t.border}`,
          maxWidth: 900,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${t.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: t.text }}>Compare Renders</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              background: t.buttonBg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              color: t.text,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 24,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {[renderA, renderB].map((r, i) => (
            <div key={r.id} style={{ textAlign: 'center' }}>
              <div
                style={{
                  aspectRatio: '4/3',
                  background: t.imgPlaceholder,
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <img
                  src={r.dataUrl}
                  alt={`Render ${String.fromCharCode(65 + i)}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>{r.paletteName ?? 'Render'}</div>
              <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RenderSkeleton({ theme }: { theme: Theme }) {
  const t = getThemeTokens(theme)
  return (
    <div
      style={{
        background: t.cardBg,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          aspectRatio: '4/3',
          background: t.skeletonBg,
          animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: t.textMuted,
          fontSize: 12,
          gap: 8,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: `2px solid ${t.textMuted}`,
            borderTopColor: brand.orange,
            animation: 'spin 0.8s linear infinite',
          }}
        />
        Generating…
      </div>
      <style>{`
        @keyframes skeleton-shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ padding: '10px 12px' }}>
        <div
          style={{
            height: 12,
            width: '70%',
            borderRadius: 4,
            background: t.skeletonBar,
            animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}

const MAX_COMPARE = 2

export function RendersPanel({
  theme,
  renders,
  onGenerate,
  onDelete,
  onDownload,
  isGenerating = false,
  aiEnabled,
  onAiEnabledChange,
}: RendersPanelProps) {
  const t = getThemeTokens(theme)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [compareOpen, setCompareOpen] = useState(false)
  const [fullscreenRender, setFullscreenRender] = useState<GeneratedRender | null>(null)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_COMPARE) next.add(id)
      return next
    })
  }

  const selectedRenders = renders.filter((r) => selectedIds.has(r.id))
  const canCompare = selectedIds.size === MAX_COMPARE

  const openCompare = () => {
    if (selectedRenders.length === MAX_COMPARE) setCompareOpen(true)
  }

  const iconBtnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: t.iconBtnBg,
    border: 'none',
    borderRadius: 8,
    color: t.iconBtnColor,
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.15s ease',
  }

  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        background: t.sidebarBg,
        borderLeft: `1px solid ${t.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.text }}>Renders</h2>
        </div>
      </header>

      {/* Controls */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>AI Enhancement</span>
          <button
            type="button"
            role="switch"
            aria-checked={aiEnabled}
            onClick={() => onAiEnabledChange(!aiEnabled)}
            style={{
              width: 40,
              height: 22,
              padding: 0,
              borderRadius: 11,
              border: 'none',
              cursor: 'pointer',
              background: aiEnabled ? brand.orange : t.toggleOffBg,
              position: 'relative',
              transition: 'background 0.2s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: aiEnabled ? 20 : 2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            background: brand.orange,
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1,
            transition: 'all 0.15s ease',
            letterSpacing: '0.01em',
          }}
        >
          {isGenerating ? 'Generating…' : 'Generate Render'}
        </button>
        {renders.length >= MAX_COMPARE && (
          <button
            type="button"
            onClick={openCompare}
            disabled={!canCompare}
            style={{
              width: '100%',
              marginTop: 6,
              padding: '9px 16px',
              fontSize: 12,
              fontWeight: 500,
              background: canCompare ? t.primary : 'transparent',
              border: `1px solid ${canCompare ? t.primary : t.border}`,
              borderRadius: 10,
              color: canCompare ? '#fff' : t.textMuted,
              cursor: canCompare ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
            }}
          >
            Compare ({selectedIds.size}/{MAX_COMPARE})
          </button>
        )}
      </div>

      {/* Gallery */}
      <div
        style={{
          flex: '1 1 0',
          minHeight: 0,
          overflowY: 'scroll',
          overflowX: 'hidden',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {isGenerating && <RenderSkeleton theme={theme} />}
        {renders.length === 0 && !isGenerating && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: t.textMuted,
              fontSize: 12,
              textAlign: 'center',
              padding: 24,
              gap: 12,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            No renders yet. Click "Generate Render" to capture the current view.
          </div>
        )}
        {renders.map((render) => {
          const selected = selectedIds.has(render.id)
          return (
            <div
              key={render.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleSelect(render.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleSelect(render.id)
                }
              }}
              style={{
                background: t.cardBg,
                borderRadius: 12,
                overflow: 'hidden',
                border: `2px solid ${selected ? brand.orange : t.border}`,
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: selected ? `0 2px 12px rgba(232,119,34,0.15)` : 'none',
              }}
            >
              <div
                style={{
                  aspectRatio: '4/3',
                  background: t.imgPlaceholder,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: brand.orange,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      zIndex: 1,
                    }}
                  >
                    {[...selectedIds].indexOf(render.id) + 1}
                  </div>
                )}
                <img
                  src={render.dataUrl}
                  alt="Generated render"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: t.imgPlaceholder,
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setFullscreenRender(render)
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 4,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFullscreenRender(render)
                    }}
                    title="Fullscreen"
                    style={iconBtnStyle}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownload(render)}
                    title="Download"
                    style={iconBtnStyle}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(render.id)}
                    title="Remove"
                    style={iconBtnStyle}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div style={{ padding: '8px 12px' }}>
                {render.paletteName && (
                  <div style={{ fontSize: 11, color: t.text, fontWeight: 500 }}>{render.paletteName}</div>
                )}
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                  {new Date(render.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {compareOpen && selectedRenders.length === MAX_COMPARE && (
        <CompareDialog
          theme={theme}
          renderA={selectedRenders[0]}
          renderB={selectedRenders[1]}
          onClose={() => setCompareOpen(false)}
        />
      )}
      {fullscreenRender && (
        <FullscreenImageDialog
          theme={theme}
          render={fullscreenRender}
          onClose={() => setFullscreenRender(null)}
        />
      )}
    </aside>
  )
}
