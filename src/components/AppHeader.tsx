import type { Theme } from '../theme'
import { getThemeTokens } from '../theme'

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
}: AppHeaderProps) {
  const t = getThemeTokens(theme)

  const btnStyle: React.CSSProperties = {
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 500,
    background: t.buttonBg,
    border: `1px solid ${t.border}`,
    borderRadius: 6,
    color: t.text,
    cursor: 'pointer',
  }

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: t.primary,
    borderColor: t.primary,
    color: '#fff',
  }

  const disabledBtnStyle: React.CSSProperties = {
    ...btnStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  }

  return (
    <header
      style={{
        flexShrink: 0,
        height: 56,
        minHeight: 56,
        padding: '0 20px',
        background: t.sidebarBg,
        borderBottom: `1px solid ${t.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: t.text,
            letterSpacing: '-0.02em',
          }}
        >
          Alubond Color Studio
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          flex: 1,
          justifyContent: 'center',
          minWidth: 0,
        }}
      >
        <button
          type="button"
          onClick={() => onSelectionToolChange(!selectionToolEnabled)}
          style={selectionToolEnabled ? activeBtnStyle : btnStyle}
          title={selectionToolEnabled ? 'Selection tool on' : 'Enable selection tool'}
        >
          Selection tool
        </button>
        <span style={{ fontSize: 13, color: t.textMuted, whiteSpace: 'nowrap' }}>
          {paintedCount} surface{paintedCount !== 1 ? 's' : ''} painted
        </span>
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          style={canUndo ? btnStyle : disabledBtnStyle}
          title="Undo"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          style={canRedo ? btnStyle : disabledBtnStyle}
          title="Redo"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={() => onCompareModeChange(compareMode === 'single' ? 'split' : 'single')}
          style={btnStyle}
        >
          {compareMode === 'single' ? 'Compare (split)' : 'Single view'}
        </button>
        <button type="button" onClick={onSnapshot} style={btnStyle} title="Download snapshot">
          Snapshot
        </button>
        <button type="button" onClick={onExportPdf} style={btnStyle} title="Export specification PDF">
          Export PDF
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onThemeToggle}
          title={theme === 'light' ? 'Dark theme' : 'Light theme'}
          style={btnStyle}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  )
}
