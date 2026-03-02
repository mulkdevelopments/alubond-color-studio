import { useState, useEffect } from 'react'
import type { Theme } from '../theme'
import { getThemeTokens } from '../theme'

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
          borderRadius: 8,
          border: 'none',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          fontSize: 20,
          cursor: 'pointer',
          zIndex: 1,
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
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: t.text }}>Compare renders</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 12px',
              fontSize: 14,
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
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                aspectRatio: '4/3',
                background: t.imgPlaceholder,
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              <img
                src={renderA.dataUrl}
                alt="Render A"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>{renderA.paletteName ?? 'Render'}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
              {new Date(renderA.createdAt).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                aspectRatio: '4/3',
                background: t.imgPlaceholder,
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              <img
                src={renderB.dataUrl}
                alt="Render B"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ fontSize: 12, color: t.textMuted }}>{renderB.paletteName ?? 'Render'}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
              {new Date(renderB.createdAt).toLocaleString()}
            </div>
          </div>
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
          fontSize: 13,
        }}
      >
        Generating 3D render…
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div
          style={{
            height: 14,
            width: '70%',
            borderRadius: 4,
            background: t.skeletonBar,
            animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 12,
            width: '50%',
            borderRadius: 4,
            background: t.skeletonBar,
            marginTop: 8,
            animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
            animationDelay: '0.15s',
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
    width: 32,
    height: 32,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: t.iconBtnBg,
    border: 'none',
    borderRadius: 6,
    color: t.iconBtnColor,
    cursor: 'pointer',
    fontSize: 14,
  }
  return (
    <aside
      style={{
        width: 360,
        minWidth: 300,
        height: '100vh',
        maxHeight: '100vh',
        background: t.sidebarBg,
        borderLeft: `1px solid ${t.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: t.text }}>Generated renders</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: t.textMuted }}>
          Capture the current view with your facade selection.
        </p>
      </header>
      <div style={{ padding: 16, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            gap: 12,
          }}
        >
          <span style={{ fontSize: 14, color: t.text }}>3D-Render</span>
          <button
            type="button"
            role="switch"
            aria-checked={aiEnabled}
            onClick={() => onAiEnabledChange(!aiEnabled)}
            style={{
              width: 44,
              height: 24,
              padding: 0,
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: aiEnabled ? t.primary : t.toggleOffBg,
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: aiEnabled ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
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
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 500,
            background: t.primary,
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Generating…' : 'Generate render'}
        </button>
        {renders.length >= MAX_COMPARE && (
          <button
            type="button"
            onClick={openCompare}
            disabled={!canCompare}
            style={{
              width: '100%',
              marginTop: 8,
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: 500,
              background: canCompare ? t.primary : t.buttonBg,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              color: canCompare ? '#fff' : t.textMuted,
              cursor: canCompare ? 'pointer' : 'not-allowed',
              opacity: canCompare ? 1 : 0.7,
            }}
          >
            Compare selected ({selectedIds.size}/{MAX_COMPARE})
          </button>
        )}
      </div>
      <style>{`
        @keyframes skeleton-shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
      <div
        style={{
          flex: '1 1 0',
          minHeight: 0,
          overflowY: 'scroll',
          overflowX: 'hidden',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {isGenerating && <RenderSkeleton theme={theme} />}
        {renders.length === 0 && !isGenerating && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: t.textMuted,
              fontSize: 13,
              textAlign: 'center',
              padding: 24,
            }}
          >
            No renders yet. Position the view and click “Generate render” to add one.
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
                border: `2px solid ${selected ? t.selectedBorder : t.border}`,
                cursor: 'pointer',
                outline: 'none',
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
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: t.primary,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
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
                    gap: 6,
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
                    ⛶
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownload(render)}
                    title="Download"
                    style={iconBtnStyle}
                  >
                    ⬇
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(render.id)}
                    title="Remove"
                    style={iconBtnStyle}
                  >
                    ✕
                  </button>
                </div>
              </div>
            <div style={{ padding: '10px 12px' }}>
              {render.paletteName && (
                <div style={{ fontSize: 12, color: t.textMuted }}>{render.paletteName}</div>
              )}
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
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
