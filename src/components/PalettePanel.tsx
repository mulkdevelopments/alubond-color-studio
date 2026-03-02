import { useMemo, useState } from 'react'
import type { Palette, AlubondColor } from '../types'
import type { Theme } from '../theme'
import { getThemeTokens } from '../theme'
import { libraryTabs, getColoursByStyle } from '../data/palettes'

interface PalettePanelProps {
  theme: Theme
  palettes: Palette[]
  selectedColor: AlubondColor | null
  onSelectColor: (color: AlubondColor | null) => void
  compareMode: 'single' | 'split'
  comparePaletteId: string | null
  onComparePaletteId: (id: string | null) => void
}

function isSameColor(a: AlubondColor | null, b: AlubondColor | null): boolean {
  if (!a || !b) return a === b
  return a.sku === b.sku
}

export function PalettePanel({
  theme,
  palettes: palettesList,
  selectedColor,
  onSelectColor,
  compareMode,
  comparePaletteId,
  onComparePaletteId,
}: PalettePanelProps) {
  const t = getThemeTokens(theme)
  const [activeTab, setActiveTab] = useState<typeof libraryTabs[number]['id']>('Modern')

  const coloursByStyle = useMemo(() => getColoursByStyle(palettesList), [palettesList])
  const colours = coloursByStyle[activeTab] ?? []

  const tabStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 500,
    background: 'transparent',
    border: 'none',
    borderBottom: `3px solid transparent`,
    color: t.textMuted,
    cursor: 'pointer',
  }
  const tabActiveStyle: React.CSSProperties = {
    ...tabStyle,
    color: t.text,
    borderBottomColor: t.primary,
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px 0', borderBottom: `1px solid ${t.border}` }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: t.text }}>
          Alubond facade library
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {libraryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? tabActiveStyle : tabStyle}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 10,
          }}
        >
          {colours.map((color) => {
            const selected = isSameColor(selectedColor, color)
            return (
              <button
                key={color.sku}
                type="button"
                onClick={() => onSelectColor(selected ? null : color)}
                style={{
                  padding: 0,
                  border: `2px solid ${selected ? t.selectedBorder : t.border}`,
                  borderRadius: 8,
                  background: t.cardBg,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    aspectRatio: '1',
                    background: color.hex,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)',
                  }}
                />
                <div style={{ padding: '4px 6px 6px', minHeight: 36 }}>
                  <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.2 }}>
                    {color.sku}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: t.text,
                      lineHeight: 1.2,
                      marginTop: 2,
                    }}
                    title={color.name}
                  >
                    {color.name.length > 12 ? color.name.slice(0, 11) + '…' : color.name}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {colours.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: t.textMuted, fontSize: 13 }}>
            No colours in this category.
          </div>
        )}
      </div>
      {compareMode === 'split' && (
        <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 12, color: t.textMuted, textTransform: 'uppercase' }}>
            Compare with palette
          </h3>
          <select
            value={comparePaletteId ?? ''}
            onChange={(e) => onComparePaletteId(e.target.value || null)}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: t.buttonBg,
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              color: t.text,
              fontSize: 13,
            }}
          >
            <option value="">— None —</option>
            {palettesList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.style})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
