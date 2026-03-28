import { useEffect } from 'react'
import type { Theme } from '../theme'
import { getThemeTokens, brand, glassChrome } from '../theme'
import type { FacadeSettings, TypologyType } from './FacadeBuilding'
import type { AlubondColor } from '../types'
import type { PaletteLayout } from '../utils/panelMaterialBulkApply'
import { getPanelTextureUrl } from '../utils/panelTextureUrl'
import { getFusionTextureCycle } from '../utils/fusionPanelCycle'

/** Only these typologies are exposed in the UI. */
const VISIBLE_TYPOLOGIES: TypologyType[] = [
  'square',
  'triangleDown',
  'diagonal',
  'thickBottomLip',
  'doubleDepthBottom',
  'centerDepth4x',
]

function TypologyIcon({ type, active, color }: { type: TypologyType; active: boolean; color: string }) {
  const stroke = active ? color : 'currentColor'
  const size = 20
  const vb = 24
  const common = { width: size, height: size, viewBox: `0 0 ${vb} ${vb}`, fill: 'none' as const, stroke: stroke, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'square':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /></svg>
    case 'diagonal': {
      const wide = { width: 28, height: size, viewBox: '0 0 28 24' as const }
      return (
        <svg {...wide} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="22" height="16" rx="0.5" />
          <line x1="3" y1="4" x2="25" y2="20" />
        </svg>
      )
    }
    case 'diagonalTR':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
    case 'verticalLine':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="12" y1="4" x2="12" y2="20" /></svg>
    case 'horizontalLine':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
    case 'twoVertical':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="9.33" y1="4" x2="9.33" y2="20" /><line x1="14.67" y1="4" x2="14.67" y2="20" /></svg>
    case 'twoHorizontal':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="4" y1="9.33" x2="20" y2="9.33" /><line x1="4" y1="14.67" x2="20" y2="14.67" /></svg>
    case 'parallelogram':
      return (
        <svg {...common}>
          <path d="M6 6 L18 6 L20 18 L4 18 Z" stroke={stroke} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
          <line x1="18" y1="6" x2="20" y2="12" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          <line x1="6" y1="6" x2="4" y2="12" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          <line x1="4" y1="12" x2="20" y2="12" stroke={stroke} strokeWidth={1.5} strokeDasharray="2 1.5" strokeLinecap="round" />
          <line x1="20" y1="18" x2="20" y2="12" stroke={stroke} strokeWidth={1.5} strokeDasharray="2 1.5" strokeLinecap="round" />
          <line x1="4" y1="18" x2="4" y2="12" stroke={stroke} strokeWidth={1.5} strokeDasharray="2 1.5" strokeLinecap="round" />
        </svg>
      )
    case 'x':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
    case 'grid2x2':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="0.5" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
    case 'thickBottomLip':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="0.5" />
          <path
            fill={active ? color : 'currentColor'}
            stroke="none"
            d="M5 14h14v5H5z"
            opacity={active ? 1 : 0.85}
          />
        </svg>
      )
    case 'doubleDepthBottom':
      return (
        <svg {...common}>
          <path d="M6 5 L6 19 L20 19 L10 5 Z" />
        </svg>
      )
    case 'centerDepth4x':
      return (
        <svg {...common}>
          {/* Side view: flat back (left), depth peaks at mid-height (right) */}
          <path d="M5 6 L5 18 L18 12 Z" />
        </svg>
      )
    case 'triangleDown':
      return <svg {...common}><path d="M12 4l8 16H4L12 4z" /></svg>
    case 'triangleRight':
      return <svg {...common}><path d="M4 4h16l-8 16V4z" /></svg>
    case 'diamond':
      return <svg {...common}><path d="M12 4l8 8-8 8-8-8 8-8z" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
    case 'triangleLeft':
      return <svg {...common}><path d="M20 4H4l8 16V4z" /></svg>
    case 'grid3x3': {
      const pad = 3
      const cell = (vb - 2 * pad) / 3
      return (
        <svg {...common}>
          <rect x={pad} y={pad} width={vb - 2 * pad} height={vb - 2 * pad} rx="0.5" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const x = pad + c * cell
              const y = pad + r * cell
              const isFilled = r === 1 && c === 0
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x + 0.5}
                  y={y + 0.5}
                  width={cell - 1}
                  height={cell - 1}
                  fill={isFilled ? 'currentColor' : 'none'}
                  stroke={stroke}
                  strokeWidth={1.5}
                />
              )
            })
          )}
        </svg>
      )
    }
    default:
      return <svg {...common}><rect x="4" y="4" width="16" height="16" /></svg>
  }
}

interface FacadeControlsProps {
  theme: Theme
  settings: FacadeSettings
  onChange: (settings: FacadeSettings) => void
  selectedColors?: AlubondColor[]
  onClearAllPalettes?: () => void
  /** 'horizontal' = bar layout; 'vertical' = stacked in left panel */
  layout?: 'horizontal' | 'vertical'
}

const PALETTE_LAYOUTS: { value: PaletteLayout; label: string; title: string }[] = [
  { value: 'linear', label: 'Linear', title: 'One palette per panel in read order (left→right, top→bottom)' },
  { value: 'horizontal_bands', label: 'Row bands', title: 'Full horizontal row shares one palette; cycles down the façade' },
  { value: 'vertical_bands', label: 'Column bands', title: 'Full vertical column shares one palette; cycles across' },
  { value: 'checker', label: 'Checker', title: 'Diagonal checker: (row + column) mod palette count' },
]

export function FacadeControls({
  theme,
  settings,
  onChange,
  selectedColors = [],
  onClearAllPalettes,
  layout = 'horizontal',
}: FacadeControlsProps) {
  const t = getThemeTokens(theme)
  const isVertical = layout === 'vertical'
  const handleClearAllPalettes = onClearAllPalettes

  useEffect(() => {
    if (!VISIBLE_TYPOLOGIES.includes(settings.typology)) {
      onChange({ ...settings, typology: 'square' })
    }
    // Only when typology is invalid; spread needs current settings snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally not re-run on every settings field
  }, [settings.typology])

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: t.textMuted,
    marginBottom: 5,
  }

  const pillBtn = (isActive: boolean): React.CSSProperties => ({
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: isActive ? 600 : 500,
    background: isActive ? brand.orange : 'transparent',
    border: `1px solid ${isActive ? brand.orange : t.border}`,
    borderRadius: 20,
    color: isActive ? '#fff' : t.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  })

  const counterBtn: React.CSSProperties = {
    width: 26,
    height: 26,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: `1px solid ${t.border}`,
    background: 'transparent',
    color: t.text,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s ease',
  }

  const sectionBlock = (label: string, content: React.ReactNode) => (
    <div style={{ padding: isVertical ? '12px 14px' : '0 14px', borderBottom: isVertical ? `1px solid ${t.border}` : undefined }}>
      <span style={sectionLabelStyle}>{label}</span>
      <div style={{ marginTop: 6 }}>{content}</div>
    </div>
  )

  const divider = () => (
    isVertical ? null : <div style={{ width: 1, alignSelf: 'stretch', background: t.border, margin: '4px 0' }} />
  )

  const typologyBtn = (typ: TypologyType): React.CSSProperties => ({
    width: typ === 'diagonal' ? 44 : 32,
    height: 32,
    minWidth: typ === 'diagonal' ? 44 : 32,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: `1px solid ${settings.typology === typ ? brand.orange : t.border}`,
    background: settings.typology === typ ? brand.orange : 'transparent',
    color: settings.typology === typ ? '#fff' : t.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  })

  const content = (
    <>
      {sectionBlock('Style & Typology', (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {VISIBLE_TYPOLOGIES.map((typ) => (
            <button
              key={typ}
              type="button"
              title={
                typ === 'centerDepth4x'
                  ? 'Tapered panel — depth 4× at vertical center (edges nominal)'
                  : typ === 'doubleDepthBottom'
                    ? 'Tapered panel — bottom depth 4× the top'
                    : typ === 'thickBottomLip'
                      ? 'Horizontal cassette — thick bottom reveal'
                      : typ === 'square'
                        ? 'Square panel'
                        : typ === 'triangleDown'
                          ? 'Triangle'
                          : 'Diagonal split'
              }
              onClick={() => onChange({ ...settings, typology: typ })}
              style={typologyBtn(typ)}
            >
              <TypologyIcon type={typ} active={settings.typology === typ} color="#fff" />
            </button>
          ))}
        </div>
      ))}
      {divider()}
      {sectionBlock('Columns', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" onClick={() => onChange({ ...settings, columns: Math.max(2, settings.columns - 1) })} style={counterBtn}>−</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, minWidth: 22, textAlign: 'center' }}>{settings.columns}</span>
          <button type="button" onClick={() => onChange({ ...settings, columns: Math.min(16, settings.columns + 1) })} style={counterBtn}>+</button>
        </div>
      ))}
      {divider()}
      {sectionBlock('Rows', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button type="button" onClick={() => onChange({ ...settings, rows: Math.max(1, settings.rows - 1) })} style={counterBtn}>−</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text, minWidth: 22, textAlign: 'center' }}>{settings.rows}</span>
          <button type="button" onClick={() => onChange({ ...settings, rows: Math.min(12, settings.rows + 1) })} style={counterBtn}>+</button>
        </div>
      ))}
      {divider()}
      {sectionBlock('Palette layout', (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {PALETTE_LAYOUTS.map((pl) => (
            <button
              key={pl.value}
              type="button"
              title={pl.title}
              onClick={() => onChange({ ...settings, paletteLayout: pl.value })}
              style={pillBtn(settings.paletteLayout === pl.value)}
            >
              {pl.label}
            </button>
          ))}
        </div>
      ))}
      {divider()}
      {sectionBlock('Thickness', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="range"
            min={0}
            max={45}
            value={settings.tiltAngle}
            onChange={(e) => onChange({ ...settings, tiltAngle: Number(e.target.value) })}
            style={{ width: isVertical ? '100%' : 70, maxWidth: 200 }}
          />
          <span style={{ fontSize: 11, color: t.textMuted, minWidth: 36 }}>
            {((1 + (settings.tiltAngle / 45) * 2) * 100).toFixed(0)}%
          </span>
        </div>
      ))}
      {sectionBlock('Edge tapers', (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          title="Each slider boosts depth at that panel edge up to 4× the nominal depth toward the opposite side (same ratio as the tapered-bottom typology). Corners combine both axes."
        >
          {(
            [
              { key: 'leftEndThickness' as const, label: 'Left' },
              { key: 'rightEndThickness' as const, label: 'Right' },
              { key: 'bottomEndThickness' as const, label: 'Bottom' },
              { key: 'topEndThickness' as const, label: 'Top' },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: t.textMuted, width: 44, flexShrink: 0 }}>{label}</span>
              <input
                type="range"
                min={0}
                max={45}
                value={settings[key]}
                onChange={(e) => onChange({ ...settings, [key]: Number(e.target.value) })}
                style={{ flex: 1, minWidth: 0, maxWidth: 200 }}
              />
              <span style={{ fontSize: 11, color: t.textMuted, minWidth: 40, textAlign: 'right' }}>
                {(1 + (settings[key] / 45) * 3).toFixed(2)}×
              </span>
            </div>
          ))}
        </div>
      ))}
      {divider()}
      {sectionBlock('Surface', (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selectedColors.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                {selectedColors.slice(0, 8).map((c) => {
                  const cycle = getFusionTextureCycle(c)
                  const fusionStrip = cycle && cycle.length >= 2
                  return (
                    <div
                      key={c.sku}
                      title={`${c.sku} · ${c.name}`}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: '1px solid rgba(0,0,0,0.15)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        flexShrink: 0,
                        overflow: 'hidden',
                        display: fusionStrip ? 'flex' : 'block',
                      }}
                    >
                      {fusionStrip ? (
                        cycle!.map((ref, i) => (
                          <div
                            key={`${ref.folder}-${ref.fileId}-${i}`}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              background: `url("${getPanelTextureUrl(ref)}") center/cover`,
                            }}
                          />
                        ))
                      ) : c.panelTexture ? (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: `url("${getPanelTextureUrl(c.panelTexture)}") center/cover`,
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: c.hex }} />
                      )}
                    </div>
                  )
                })}
                {selectedColors.length > 8 ? (
                  <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 600 }}>+{selectedColors.length - 8}</span>
                ) : null}
              </div>
              <span style={{ fontSize: 10, color: t.textMuted, whiteSpace: 'nowrap' }}>
                {selectedColors.length} palette{selectedColors.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={() => handleClearAllPalettes?.()}
                style={{
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  background: t.buttonBg,
                  border: `1px solid ${t.buttonBorder}`,
                  borderRadius: 999,
                  color: t.text,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: `inset 0 1px 0 ${theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                Clear all palettes
              </button>
            </>
          ) : (
            <span style={{ fontSize: 10, color: t.textMuted }}>Select colour</span>
          )}
        </div>
      ))}
    </>
  )

  if (isVertical) {
    return (
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
        <div
          style={{
            padding: '12px 16px 12px',
            borderBottom: `1px solid ${glassChrome.borderSoft}`,
            marginBottom: 6,
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 14,
            background: glassChrome.surface,
            backdropFilter: glassChrome.blurMedium,
            WebkitBackdropFilter: glassChrome.blurMedium,
            border: `1px solid ${glassChrome.border}`,
            boxShadow: `${glassChrome.specularSoft}`,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' }}>
            Facade controls
          </h3>
          <p style={{ margin: '5px 0 0', fontSize: 11, color: t.textMuted, lineHeight: 1.45 }}>
            Style, proportion & palette layout
          </p>
        </div>
        {content}
      </div>
    )
  }

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: '10px 16px',
        background: t.sidebarBg,
        borderTop: `1px solid ${t.border}`,
      }}
    >
      {content}
    </div>
  )
}
