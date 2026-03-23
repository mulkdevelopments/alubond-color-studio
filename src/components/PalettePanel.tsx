import { useMemo, useState } from 'react'
import type { Palette, AlubondColor, PaletteStyle } from '../types'
import type { Theme } from '../theme'
import { getThemeTokens, brand } from '../theme'
import { libraryTabs, getColoursByStyle, getFinishLabel } from '../data/palettes'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'
import { getFusionTextureCycle } from '../utils/fusionPanelCycle'
import { FilmStripColorRail } from './FilmStripColorRail'
import { FusionAiPanel } from './FusionAiPanel'

interface PalettePanelProps {
  theme: Theme
  palettes: Palette[]
  selectedColor: AlubondColor | null
  onSelectColor: (color: AlubondColor | null) => void
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
    if (!selectedColor) return null
    const selCycle = getFusionTextureCycle(selectedColor)
    const selMulti = !!(selCycle && selCycle.length >= 2)
    return (
      <div
        style={{
          flexShrink: 0,
          padding: '10px 16px',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background:
            theme === 'dark' || theme === 'workspace'
              ? 'rgba(232,119,34,0.08)'
              : 'rgba(232,119,34,0.04)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display:
              selMulti ||
              (selectedColor.finish === 'fusion' &&
                (selectedColor.hexSecondary != null || selectedColor.panelTextureSecondary != null))
                ? 'flex'
                : 'block',
            boxShadow:
              selectedColor.panelTexture || selectedColor.panelTextureSecondary || selMulti
                ? '0 3px 10px rgba(0,0,0,0.2)'
                : `inset 0 0 0 1px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)`,
            flexShrink: 0,
            overflow: 'hidden',
            background:
              selectedColor.panelTexture && !selectedColor.panelTextureSecondary && !selMulti
                ? `url("${getPanelTextureUrl(selectedColor.panelTexture)}") center/cover`
                : undefined,
          }}
        >
          {selMulti && selCycle ? (
            selCycle.map((ref, idx) => (
              <div
                key={`${ref.folder}-${ref.fileId}-${idx}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: `url("${getPanelTextureUrl(ref)}") center/cover`,
                }}
              />
            ))
          ) : selectedColor.finish === 'fusion' &&
            selectedColor.panelTexture &&
            selectedColor.panelTextureSecondary ? (
            <>
              <div
                style={{
                  flex: 1,
                  background: `url("${getPanelTextureUrl(selectedColor.panelTexture)}") center/cover`,
                }}
              />
              <div
                style={{
                  flex: 1,
                  background: `url("${getPanelTextureUrl(selectedColor.panelTextureSecondary)}") center/cover`,
                }}
              />
            </>
          ) : selectedColor.finish === 'fusion' &&
            selectedColor.panelTexture &&
            selectedColor.hexSecondary &&
            !selectedColor.panelTextureSecondary ? (
            <>
              <div
                style={{
                  flex: 1,
                  background: `url("${getPanelTextureUrl(selectedColor.panelTexture)}") center/cover`,
                }}
              />
              <div style={{ flex: 1, background: selectedColor.hexSecondary }} />
            </>
          ) : selectedColor.finish === 'fusion' && selectedColor.hexSecondary ? (
            <>
              <div style={{ flex: 1, background: selectedColor.hex }} />
              <div style={{ flex: 1, background: selectedColor.hexSecondary }} />
            </>
          ) : !selectedColor.panelTexture ? (
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
          <div style={{ fontSize: 10, color: t.textMuted }}>
            {selectedColor.sku} · {getFinishLabel(selectedColor)}
          </div>
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
      {activeTab === 'Fusion' && !hideLibraryTabs ? (
        <FusionAiPanel
          theme={theme}
          selectedColor={selectedColor}
          onSelectColor={onSelectColor}
          isSameColor={isSameColor}
        />
      ) : null}
      </div>

      {!hideFilmRail && (
        <FilmStripColorRail
          theme={theme}
          colours={colours}
          selectedColor={selectedColor}
          onSelectColor={onSelectColor}
          isSameColor={isSameColor}
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
