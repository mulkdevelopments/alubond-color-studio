import { useMemo, useState, useCallback } from 'react'
import type { Palette, AlubondColor } from '../types'
import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'
import { libraryTabs, getColoursByStyle, getFinishLabel } from '../data/palettes'
import { generateFusionSuggestions, type FusionSuggestion } from '../services/fusionSuggestions'

/** Wood panel image path from panel id (e.g. AB-SS-001). */
function getWoodPanelImageUrl(woodPanelId: string | undefined): string {
  return woodPanelId ? `/Panels/wood/${woodPanelId}.png` : '/Panels/wood/AB-SS-007.png'
}
/** Patina (Platina) panel image path from panel id. */
function getPatinaPanelImageUrl(patinaPanelId: string | undefined): string {
  return patinaPanelId ? `/Panels/Platina/${patinaPanelId}.png` : '/Panels/Platina/AB-SS-001.png'
}

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
  const [fusionSuggestions, setFusionSuggestions] = useState<FusionSuggestion[]>([])
  const [fusionLoading, setFusionLoading] = useState(false)
  const [fusionError, setFusionError] = useState<string | null>(null)

  const coloursByStyle = useMemo(() => getColoursByStyle(palettesList), [palettesList])
  const colours = coloursByStyle[activeTab] ?? []

  const handleGenerateFusionSuggestions = useCallback(async () => {
    setFusionError(null)
    setFusionLoading(true)
    try {
      const list = await generateFusionSuggestions()
      setFusionSuggestions(list)
    } catch (e) {
      setFusionError(e instanceof Error ? e.message : 'Failed to generate suggestions')
      setFusionSuggestions([])
    } finally {
      setFusionLoading(false)
    }
  }, [])

  const suggestionToColor = useCallback((s: FusionSuggestion): AlubondColor => ({
    sku: `AI-${s.name.replace(/\s+/g, '-').slice(0, 20)}`,
    name: s.name,
    collection: 'Fusion',
    finish: 'fusion',
    fusionOf: ['metallic', 'anodise'],
    hex: s.hex,
    hexSecondary: s.hexSecondary,
    metalness: 0.9,
    roughness: 0.35,
    metalnessSecondary: 0.95,
    roughnessSecondary: 0.28,
  }), [])

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 16px 0',
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <circle cx="19" cy="13.5" r="2.5" />
            <circle cx="8" cy="13.5" r="2.5" />
            <circle cx="13.5" cy="20" r="2.5" />
            <path d="M12 2v4M4.93 10.93l2.83 2.83M19.07 10.93l-2.83 2.83" />
          </svg>
          <h3
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: t.text,
              letterSpacing: '0.01em',
            }}
          >
            Facade Library
          </h3>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {libraryTabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 12px',
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 500,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? brand.orange : 'transparent'}`,
                  color: isActive ? t.text : t.textMuted,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.01em',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Color Preview */}
      {selectedColor && (
        <div
          style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${t.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: theme === 'dark' ? 'rgba(232,119,34,0.06)' : 'rgba(232,119,34,0.04)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: selectedColor.finish === 'fusion' && selectedColor.hexSecondary ? 'flex' : 'block',
              boxShadow: selectedColor.finish === 'wood' || selectedColor.finish === 'patina'
                ? '0 3px 10px rgba(0,0,0,0.2)'
                : `inset 0 0 0 1px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)`,
              flexShrink: 0,
              overflow: 'hidden',
              background: selectedColor.finish === 'wood' ? `url(${getWoodPanelImageUrl(selectedColor.woodPanelId)}) center/cover` : selectedColor.finish === 'patina' ? `url(${getPatinaPanelImageUrl(selectedColor.patinaPanelId)}) center/cover` : undefined,
            }}
          >
            {selectedColor.finish === 'fusion' && selectedColor.hexSecondary ? (
              <>
                <div style={{ flex: 1, background: selectedColor.hex }} />
                <div style={{ flex: 1, background: selectedColor.hexSecondary }} />
              </>
            ) : selectedColor.finish !== 'wood' && selectedColor.finish !== 'patina' ? (
              <div style={{ width: '100%', height: '100%', background: selectedColor.hex }} />
            ) : null}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: t.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedColor.name}
            </div>
            <div style={{ fontSize: 10, color: t.textMuted }}>{selectedColor.sku} · {getFinishLabel(selectedColor)}</div>
          </div>
          <button
            type="button"
            onClick={() => onSelectColor(null)}
            style={{
              marginLeft: 'auto',
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 500,
              background: 'transparent',
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              color: t.textMuted,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* AI Fusion suggestions (only when Fusion tab active) */}
      {activeTab === 'Fusion' && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 600, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI suggestions
          </h4>
          <button
            type="button"
            onClick={handleGenerateFusionSuggestions}
            disabled={fusionLoading}
            style={{
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              background: fusionLoading ? t.border : brand.orange,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: fusionLoading ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {fusionLoading ? 'Generating…' : 'Generate fusion palettes'}
          </button>
          {fusionError && (
            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#f87171' }}>{fusionError}</p>
          )}
          {fusionSuggestions.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fusionSuggestions.map((s, i) => {
                const asColor = suggestionToColor(s)
                const selected = isSameColor(selectedColor, asColor)
                return (
                  <button
                    key={`${s.name}-${i}`}
                    type="button"
                    onClick={() => onSelectColor(selected ? null : asColor)}
                    style={{
                      padding: 10,
                      textAlign: 'left',
                      background: selected ? 'rgba(232,119,34,0.12)' : t.cardBg,
                      border: `1px solid ${selected ? brand.orange : t.border}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          display: 'flex',
                          overflow: 'hidden',
                          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)',
                        }}
                      >
                        <div style={{ flex: 1, background: s.hex }} />
                        <div style={{ flex: 1, background: s.hexSecondary }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{s.name}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 10, color: t.textMuted, lineHeight: 1.4 }}>
                      {s.whyGood}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
            gap: 8,
          }}
        >
          {colours.map((color) => {
            const selected = isSameColor(selectedColor, color)
            const isWood = color.finish === 'wood'
            const isPatina = color.finish === 'patina'
            const isPanelImage = isWood || isPatina
            return (
              <button
                key={color.sku}
                type="button"
                onClick={() => onSelectColor(selected ? null : color)}
                style={{
                  padding: isPanelImage ? 8 : 0,
                  border: `2px solid ${selected ? brand.orange : t.border}`,
                  borderRadius: isPanelImage ? 20 : 10,
                  background: t.cardBg,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  transform: selected ? 'scale(1.04)' : 'none',
                  boxShadow: selected ? `0 4px 12px rgba(232,119,34,0.2)` : 'none',
                  outline: 'none',
                }}
              >
                <div
                  style={{
                    aspectRatio: '1',
                    display: color.finish === 'fusion' && color.hexSecondary ? 'flex' : 'block',
                    boxShadow: isPanelImage ? '0 4px 12px rgba(0,0,0,0.18)' : 'inset 0 0 0 1px rgba(0,0,0,.12)',
                    borderRadius: isPanelImage ? 16 : 0,
                    overflow: 'hidden',
                    background: isWood ? `url(${getWoodPanelImageUrl(color.woodPanelId)}) center/cover` : isPatina ? `url(${getPatinaPanelImageUrl(color.patinaPanelId)}) center/cover` : undefined,
                    backgroundColor: isPanelImage ? undefined : undefined,
                  }}
                >
                  {color.finish === 'fusion' && color.hexSecondary ? (
                    <>
                      <div style={{ flex: 1, background: color.hex }} />
                      <div style={{ flex: 1, background: color.hexSecondary }} />
                    </>
                  ) : !isPanelImage ? (
                    <div style={{ width: '100%', height: '100%', background: color.hex }} />
                  ) : null}
                </div>
                <div style={{ padding: isPanelImage ? '6px 4px 4px' : '4px 5px 5px', minHeight: 32 }}>
                  <div style={{ fontSize: isPanelImage ? 10 : 9, fontWeight: 600, color: t.text, lineHeight: 1.2, letterSpacing: '0.02em' }}>
                    {color.sku}
                  </div>
                  <div
                    style={{
                      fontSize: isPanelImage ? 11 : 10,
                      fontWeight: 500,
                      color: t.text,
                      lineHeight: 1.2,
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={color.name}
                  >
                    {color.name}
                  </div>
                  {color.finish === 'fusion' && color.fusionOf?.length === 2 && (
                    <div style={{ fontSize: 8, color: t.textMuted, lineHeight: 1.2, marginTop: 2 }}>
                      {getFinishLabel(color)}
                    </div>
                  )}
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

      {/* Compare */}
      {compareMode === 'split' && (
        <div style={{ padding: 12, borderTop: `1px solid ${t.border}` }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 11, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
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
              borderRadius: 8,
              color: t.text,
              fontSize: 12,
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
