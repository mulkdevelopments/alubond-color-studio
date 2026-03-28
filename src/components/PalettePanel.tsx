import { useMemo, useState } from 'react'
import type { Palette, AlubondColor, PaletteStyle } from '../types'
import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'
import { libraryTabs, getColoursByStyle, getFinishLabel } from '../data/palettes'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'
import { FilmStripColorRail } from './FilmStripColorRail'
import { FusionAiPanel } from './FusionAiPanel'

interface PalettePanelProps {
  theme: Theme
  palettes: Palette[]
  selectedColors: AlubondColor[]
  onTogglePaletteColor: (color: AlubondColor) => void
  onClearSelectedColors: () => void
  compareMode: 'single' | 'split'
  comparePaletteId: string | null
  onComparePaletteId: (id: string | null) => void
  /** Controlled library tab (e.g. sync with top film strip) */
  libraryTab?: PaletteStyle
  onLibraryTabChange?: (id: PaletteStyle) => void
  /** Hide sidebar film rail when colours are shown in workspace bottom dock */
  hideFilmRail?: boolean
  /** Hide library category tabs (shown in workspace bottom dock instead) */
  hideLibraryTabs?: boolean
}

export function PalettePanel({
  theme,
  palettes: palettesList,
  selectedColors,
  onTogglePaletteColor,
  onClearSelectedColors,
  compareMode,
  comparePaletteId,
  onComparePaletteId,
  libraryTab: libraryTabProp,
  onLibraryTabChange,
  hideFilmRail = false,
  hideLibraryTabs = false,
}: PalettePanelProps) {
  const t = getThemeTokens(theme)
  const [internalTab, setInternalTab] = useState<PaletteStyle>('Modern')
  const activeTab = libraryTabProp ?? internalTab
  const setActiveTab = (id: PaletteStyle) => {
    onLibraryTabChange?.(id)
    if (libraryTabProp === undefined) setInternalTab(id)
  }
  const coloursByStyle = useMemo(() => getColoursByStyle(palettesList), [palettesList])
  const colours = coloursByStyle[activeTab] ?? []

  const renderSelectedPreview = () => {
    if (selectedColors.length === 0) return null
    return (
      <div
        style={{
          flexShrink: 0,
          padding: '10px 16px',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
          background:
            theme === 'dark' ? 'rgba(232,119,34,0.08)' : 'rgba(232,119,34,0.05)',
        }}
      >
        {selectedColors.map((c) => {
          return (
            <div
              key={c.sku}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                maxWidth: 200,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  flexShrink: 0,
                  overflow: 'hidden',
                  boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.12)`,
                  background: c.panelTexture
                    ? `url("${getPanelTextureUrl(c.panelTexture)}") center/cover`
                    : c.hex,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.name}
                </div>
                <div style={{ fontSize: 9, color: t.textMuted }}>
                  {c.sku} · {getFinishLabel(c)}
                </div>
              </div>
            </div>
          )
        })}
        <button
          type="button"
          onClick={onClearSelectedColors}
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
          Clear all
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {hideLibraryTabs && renderSelectedPreview()}

      {/* Header — fixed; scroll is below */}
      <div
        style={{
          flexShrink: 0,
          padding: hideLibraryTabs ? '14px 16px 12px' : '16px 16px 0',
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: hideLibraryTabs ? 0 : 14 }}>
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

        {!hideLibraryTabs && (
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
        )}
      </div>

      {!hideLibraryTabs && renderSelectedPreview()}

      {/* Fusion controls only — colour swatches live in bottom film strip */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
      {!hideLibraryTabs ? (
        <div
          style={{ display: activeTab === 'Fusion' ? 'block' : 'none' }}
          aria-hidden={activeTab !== 'Fusion'}
        >
          <FusionAiPanel
            theme={theme}
            selectedColors={selectedColors}
            onTogglePaletteColor={onTogglePaletteColor}
          />
        </div>
      ) : null}
      </div>

      {!hideFilmRail && (
        <FilmStripColorRail
          theme={theme}
          colours={colours}
          selectedColors={selectedColors}
          onTogglePaletteColor={onTogglePaletteColor}
        />
      )}

      {/* Compare */}
      {compareMode === 'split' && (
        <div style={{ flexShrink: 0, padding: 12, borderTop: `1px solid ${t.border}` }}>
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
