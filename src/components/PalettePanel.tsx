import type { Palette } from '../types'

interface PalettePanelProps {
  palettes: Palette[]
  selectedPaletteId: string | null
  selectedRole: 'primary' | 'accent' | 'frame' | 'feature'
  onSelectPalette: (id: string | null) => void
  onSelectRole: (role: 'primary' | 'accent' | 'frame' | 'feature') => void
  compareMode: 'single' | 'split'
  comparePaletteId: string | null
  onComparePaletteId: (id: string | null) => void
}

const roles: Array<'primary' | 'accent' | 'frame' | 'feature'> = ['primary', 'accent', 'frame', 'feature']
const roleLabels: Record<string, string> = { primary: 'Primary', accent: 'Accent', frame: 'Frame', feature: 'Feature' }

export function PalettePanel({
  palettes,
  selectedPaletteId,
  selectedRole,
  onSelectPalette,
  onSelectRole,
  compareMode,
  comparePaletteId,
  onComparePaletteId,
}: PalettePanelProps) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 12, color: '#666', textTransform: 'uppercase' }}>
          Apply to selection
        </h3>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onSelectRole(r)}
              style={{
                ...btnStyle,
                background: selectedRole === r ? '#1a1a1a' : '#f5f5f5',
                color: selectedRole === r ? '#fff' : '#1a1a1a',
                borderColor: selectedRole === r ? '#1a1a1a' : '#e0e0e0',
              }}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPalette(selectedPaletteId === p.id ? null : p.id)}
              style={{
                ...cardStyle,
                borderColor: selectedPaletteId === p.id ? '#1a1a1a' : '#e0e0e0',
                background: selectedPaletteId === p.id ? '#f5f5f5' : '#ffffff',
              }}
            >
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {[p.primary, p.accent, p.frame, p.feature].map((c, i) => (
                  <div
                    key={c.sku}
                    title={c.name}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      background: c.hex,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.2)',
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{p.style}</div>
            </button>
          ))}
        </div>
      </section>
      {compareMode === 'split' && (
        <section>
          <h3 style={{ margin: '0 0 8px', fontSize: 12, color: '#666', textTransform: 'uppercase' }}>
            Compare with
          </h3>
          <select
            value={comparePaletteId ?? ''}
            onChange={(e) => onComparePaletteId(e.target.value || null)}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              color: '#1a1a1a',
              fontSize: 13,
            }}
          >
            <option value="">— None —</option>
            {palettes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.style})
              </option>
            ))}
          </select>
        </section>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 11,
  border: '1px solid #e0e0e0',
  borderRadius: 6,
  color: '#1a1a1a',
  cursor: 'pointer',
}

const cardStyle: React.CSSProperties = {
  padding: 12,
  background: '#ffffff',
  border: '2px solid #e0e0e0',
  borderRadius: 8,
  cursor: 'pointer',
  textAlign: 'left',
  color: '#1a1a1a',
}
