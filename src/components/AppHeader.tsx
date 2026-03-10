import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'

interface AppHeaderProps {
  theme: Theme
  onThemeToggle: () => void
  selectionToolEnabled: boolean
  onSelectionToolChange: (enabled: boolean) => void
  paintedCount: number
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  compareMode: 'single' | 'split'
  onCompareModeChange: (mode: 'single' | 'split') => void
  onSnapshot: () => void
  onExportPdf: () => void
  onBack?: () => void
}

export function AppHeader({
  theme,
  onThemeToggle,
  selectionToolEnabled,
  onSelectionToolChange,
  paintedCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  compareMode,
  onCompareModeChange,
  onSnapshot,
  onExportPdf,
  onBack,
}: AppHeaderProps) {
  const t = getThemeTokens(theme)

  const btnStyle: React.CSSProperties = {
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 500,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '0.01em',
  }

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: brand.orange,
    borderColor: brand.orange,
    color: '#fff',
  }

  const disabledBtnStyle: React.CSSProperties = {
    ...btnStyle,
    opacity: 0.35,
    cursor: 'not-allowed',
  }

  const iconBtnStyle: React.CSSProperties = {
    ...btnStyle,
    padding: '7px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }

  return (
    <header
      style={{
        flexShrink: 0,
        height: 52,
        minHeight: 52,
        padding: '0 16px',
        background: t.headerBg,
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      {/* Left: Logo & Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              ...btnStyle,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Back to home"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <img
          src="/alubond-logo.png"
          alt="Alubond"
          style={{ height: 30, objectFit: 'contain', opacity: 0.9 }}
        />
        <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.12)' }} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Studio
        </span>
      </div>

      {/* Center: Tools */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flex: 1,
          justifyContent: 'center',
          minWidth: 0,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => onSelectionToolChange(!selectionToolEnabled)}
          style={selectionToolEnabled ? activeBtnStyle : iconBtnStyle}
          title={selectionToolEnabled ? 'Selection tool on' : 'Enable selection tool'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          </svg>
          Select
        </button>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          style={canUndo ? iconBtnStyle : disabledBtnStyle}
          title="Undo"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          style={canRedo ? iconBtnStyle : disabledBtnStyle}
          title="Redo"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>

        <span
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.35)',
            padding: '0 6px',
            whiteSpace: 'nowrap',
          }}
        >
          {paintedCount} surface{paintedCount !== 1 ? 's' : ''}
        </span>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

        <button
          type="button"
          onClick={() => onCompareModeChange(compareMode === 'single' ? 'split' : 'single')}
          style={compareMode === 'split' ? activeBtnStyle : iconBtnStyle}
          title="Compare split view"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
          Compare
        </button>
        <button type="button" onClick={onSnapshot} style={iconBtnStyle} title="Download snapshot">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Snap
        </button>
        <button type="button" onClick={onExportPdf} style={iconBtnStyle} title="Export specification PDF">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          PDF
        </button>
      </div>

      {/* Right: Theme */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onThemeToggle}
          title={theme === 'light' ? 'Dark theme' : 'Light theme'}
          style={iconBtnStyle}
        >
          {theme === 'light' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
