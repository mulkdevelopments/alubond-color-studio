import type { Theme } from '../theme'
import { getThemeTokens } from '../theme'

interface ToolbarProps {
  theme: Theme
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

export function Toolbar({
  theme,
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
}: ToolbarProps) {
  const t = getThemeTokens(theme)
  const btnStyle: React.CSSProperties = {
    padding: '6px 12px',
    fontSize: 12,
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
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${t.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <button
        type="button"
        onClick={() => onSelectionToolChange(!selectionToolEnabled)}
        style={selectionToolEnabled ? activeBtnStyle : btnStyle}
        title={selectionToolEnabled ? 'Selection tool on – click surfaces to paint' : 'Enable selection tool to paint surfaces'}
      >
        Selection tool
      </button>
      <span style={{ fontSize: 13, color: t.textMuted }}>
        {paintedCount} surface{paintedCount !== 1 ? 's' : ''} painted
      </span>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        style={{ ...btnStyle, opacity: canUndo ? 1 : 0.5, cursor: canUndo ? 'pointer' : 'not-allowed' }}
        title="Undo last paint"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        style={{ ...btnStyle, opacity: canRedo ? 1 : 0.5, cursor: canRedo ? 'pointer' : 'not-allowed' }}
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
      <button type="button" onClick={onSnapshot} style={btnStyle}>
        Snapshot
      </button>
      <button type="button" onClick={onExportPdf} style={btnStyle}>
        Export PDF
      </button>
    </div>
  )
}
