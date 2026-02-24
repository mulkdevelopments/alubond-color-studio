interface ToolbarProps {
  selectedCount: number
  compareMode: 'single' | 'split'
  onCompareModeChange: (mode: 'single' | 'split') => void
  onSnapshot: () => void
  onExportPdf: () => void
}

export function Toolbar({
  selectedCount,
  compareMode,
  onCompareModeChange,
  onSnapshot,
  onExportPdf,
}: ToolbarProps) {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 13, color: '#666' }}>
        {selectedCount} surface{selectedCount !== 1 ? 's' : ''} selected
      </span>
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

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  background: '#ffffff',
  border: '1px solid #1a1a1a',
  borderRadius: 6,
  color: '#1a1a1a',
  cursor: 'pointer',
}
